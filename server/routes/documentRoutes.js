import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import Document from '../models/Document.js';
import ChatSession from '../models/ChatSession.js';
import { analyzeDocument, chatWithDocument, matchResumeToJd, translateAndSummarize } from '../services/groqService.js';
import { extractTextFromPdf, extractTextFromDocx } from '../services/pdfService.js';

const router = express.Router();

// Ensure uploads folder exists (use OS temporary directory on serverless environments like Vercel)
const isServerless = !!process.env.VERCEL;
const uploadsDir = isServerless 
  ? path.join(os.tmpdir(), 'uploads') 
  : path.resolve('uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB file size limit
});

/**
 * @route   POST /api/documents/upload
 * @desc    Upload and analyze a document
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { category } = req.body; // optional category from frontend
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = path.extname(fileName).toLowerCase().replace('.', '');
    const mimeType = req.file.mimetype;

    console.log(`Processing file: ${fileName}, type: ${fileType}, mime: ${mimeType}`);

    // Read the file buffer for multimodal AI input
    const fileBuffer = fs.readFileSync(filePath);

    // Groq's llama-3.1-8b-instant is a text-only model.
    // We MUST extract text first before passing it to analyzeDocument.
    let finalExtractedText = '';
    if (fileType === 'pdf') {
      console.log('Attempting local digital pdf-parse extraction...');
      finalExtractedText = await extractTextFromPdf(filePath);
    } else if (fileType === 'docx') {
      console.log('Attempting mammoth docx extraction...');
      finalExtractedText = await extractTextFromDocx(filePath);
    } else {
      console.warn('File is not a PDF or DOCX, and text extraction without OCR is limited. Proceeding with filename as fallback.');
      finalExtractedText = `Filename: ${fileName}. Content: (Unable to extract image/binary text without OCR)`;
    }

    // Run deep analysis with Groq
    const result = await analyzeDocument(finalExtractedText, category);

    // Save metadata and analysis results to MongoDB
    const newDoc = new Document({
      fileName,
      fileType,
      category: result.detectedCategory || category || 'other',
      filePath: `/uploads/${req.file.filename}`, // Relative path for serving/reference
      extractedText: finalExtractedText || 'No text extracted',
      analysis: {
        summary: result.analysis?.summary || 'No summary generated',
        language: result.analysis?.language || 'English',
        
        strengths: result.analysis?.strengths || [],
        missingSkills: result.analysis?.missingSkills || [],
        atsScore: result.analysis?.atsScore || 0,
        
        amount: result.analysis?.amount || 0,
        currency: result.analysis?.currency || 'INR',
        date: result.analysis?.date || '',
        company: result.analysis?.company || '',
        gst: result.analysis?.gst || '',
        lineItems: result.analysis?.lineItems || [],
        
        findings: result.analysis?.findings || [],
        vitalSigns: result.analysis?.vitalSigns || {},
        recommendations: result.analysis?.recommendations || [],
        abnormalities: result.analysis?.abnormalities || [],

        abstract: result.analysis?.abstract || '',
        methodology: result.analysis?.methodology || '',
        keyFindings: result.analysis?.keyFindings || [],
        conclusions: result.analysis?.conclusions || ''
      },
      highlights: result.highlights || [],
      detectiveReport: {
        status: result.detectiveReport?.status || 'innocent',
        score: result.detectiveReport?.score || 0,
        findings: result.detectiveReport?.findings || []
      }
    });

    const savedDoc = await newDoc.save();

    // Create an empty chat session for memory
    const newChatSession = new ChatSession({
      documentId: savedDoc._id,
      messages: []
    });
    await newChatSession.save();

    res.status(200).json(savedDoc);
  } catch (error) {
    console.error('Error uploading/analyzing file:', error);
    res.status(500).json({ error: error.message || 'An error occurred during analysis' });
  }
});

/**
 * @route   GET /api/documents
 * @desc    Get all analyzed documents (Memory / History list)
 */
router.get('/', async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving documents' });
  }
});

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document analysis
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving document' });
  }
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document and its chat history
 */
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Try deleting local file
    try {
      const fileName = path.basename(doc.filePath);
      const actualPath = isServerless 
        ? path.join(os.tmpdir(), 'uploads', fileName)
        : path.resolve('uploads', fileName);

      if (fs.existsSync(actualPath)) {
        fs.unlinkSync(actualPath);
      }
    } catch (fileErr) {
      console.error('Error deleting file from disk:', fileErr);
    }

    await Document.findByIdAndDelete(req.params.id);
    await ChatSession.findOneAndDelete({ documentId: req.params.id });

    res.json({ message: 'Document and conversation logs deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting document' });
  }
});

/**
 * @route   GET /api/documents/:id/chat
 * @desc    Retrieve chat session logs (Memory)
 */
router.get('/:id/chat', async (req, res) => {
  try {
    let chat = await ChatSession.findOne({ documentId: req.params.id });
    if (!chat) {
      chat = new ChatSession({ documentId: req.params.id, messages: [] });
      await chat.save();
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching chat history' });
  }
});

/**
 * @route   POST /api/documents/:id/chat
 * @desc    Ask a question about the document (Chat with Document)
 */
router.post('/:id/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let chat = await ChatSession.findOne({ documentId: req.params.id });
    if (!chat) {
      chat = new ChatSession({ documentId: req.params.id, messages: [] });
    }

    // Call chat service with full document text + previous history + new question
    const answer = await chatWithDocument(doc.extractedText, chat.messages, question);

    // Save user message and AI model reply to chat session
    chat.messages.push({ role: 'user', content: question });
    chat.messages.push({ role: 'model', content: answer });
    await chat.save();

    res.json({ answer, chat });
  } catch (error) {
    console.error('Error chatting with PDF:', error);
    res.status(500).json({ error: error.message || 'An error occurred during chat' });
  }
});

/**
 * @route   POST /api/documents/:id/match-jd
 * @desc    Compare Resume Document against a pasted Job Description
 */
router.post('/:id/match-jd', async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.category !== 'resume') {
      return res.status(400).json({ error: 'Job description matching requires a Resume document' });
    }

    const matchResults = await matchResumeToJd(doc.extractedText, jobDescription);
    res.json(matchResults);
  } catch (error) {
    console.error('Error matching Resume with JD:', error);
    res.status(500).json({ error: error.message || 'An error occurred during matching' });
  }
});

/**
 * @route   POST /api/documents/:id/translate
 * @desc    Translate and summarize a document's findings into English/Telugu/Hindi
 */
router.post('/:id/translate', async (req, res) => {
  try {
    const { targetLanguage } = req.body;
    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Translate the original summary
    const sourceText = doc.analysis.summary || doc.extractedText.slice(0, 1500);
    const translationResult = await translateAndSummarize(sourceText, targetLanguage);
    
    res.json(translationResult);
  } catch (error) {
    console.error('Error translating document:', error);
    res.status(500).json({ error: error.message || 'An error occurred during translation' });
  }
});

export default router;
