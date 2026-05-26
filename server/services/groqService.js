import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let groqInstance = null;

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing! Please generate a new API key at the Groq console and add it to your server/.env file (for local development) or Vercel Project Settings -> Environment Variables (for deployment).");
  }
  if (!groqInstance) {
    groqInstance = new Groq({ apiKey });
  }
  return groqInstance;
}

const MODEL = 'llama-3.1-8b-instant';

/**
 * Utility to pause execution for a given number of milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to extract JSON from markdown wrapped output or raw string
 */
function parseJsonOutput(responseText) {
  let cleanJsonStr = responseText.trim();
  if (cleanJsonStr.startsWith('```json')) {
    cleanJsonStr = cleanJsonStr.substring(7);
  } else if (cleanJsonStr.startsWith('```')) {
    cleanJsonStr = cleanJsonStr.substring(3);
  }
  if (cleanJsonStr.endsWith('```')) {
    cleanJsonStr = cleanJsonStr.substring(0, cleanJsonStr.length - 3);
  }
  cleanJsonStr = cleanJsonStr.trim();

  try {
    return JSON.parse(cleanJsonStr);
  } catch (e) {
    console.error('Failed to parse Groq JSON output. Raw text:', responseText);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        throw new Error('Could not parse document analysis JSON from model output.');
      }
    }
    throw e;
  }
}

/**
 * Safely reduces large text to fit within Groq's token limits using strict truncation.
 * @param {string} text - The raw document text
 * @param {number} maxChars - The maximum allowed characters (default 2500)
 * @returns {Promise<string>} - Reduced text
 */
async function reduceTextToTokenLimit(text, maxChars = 2500) {
  if (!text) return '';
  
  console.log("Original text length:", text.length);
  
  let trimmedText = text;
  if (text.length > maxChars) {
    trimmedText = text.substring(0, maxChars) + "\n... (Text truncated due to API limits)";
  }
  
  console.log("Trimmed text length:", trimmedText.length);
  return trimmedText;
}

/**
 * Analyzes an uploaded document text using Groq LLaMA 3.1 8b instant.
 * Automatically extracts category, yields structured outputs,
 * computes smart highlights, and runs the AI Document Detective audit.
 * 
 * @param {string} text - The extracted document text
 * @param {string} category - Expected category (can be empty, AI will detect)
 * @returns {Promise<Object>} - Consolidated analysis results
 */
export async function analyzeDocument(text, category = '') {
  try {
    const groq = getGroq();

    // Safely reduce text if it exceeds token limits
    const safeText = await reduceTextToTokenLimit(text);

    const systemPrompt = `
    Analyze this document text.
    If the requested category is empty, detect the category from: ['resume', 'invoice', 'medical', 'paper', 'contract', 'other'].
    
    Current Requested Category: "${category}"

    You must output a strictly valid JSON object. Do not include any markdown formatting (like \`\`\`json) in the response text itself, just the raw JSON. The JSON structure MUST follow this schema:

    {
      "detectedCategory": "resume | invoice | medical | paper | contract | other",
      "analysis": {
        "summary": "A rich 3-4 sentence overall summary of the document, translating key concepts to clear terms.",
        "language": "Primary language of the document (e.g. English, Hindi, Telugu)",
        
        // Populate if category is 'resume'
        "strengths": ["list of candidate strengths"],
        "missingSkills": ["list of skills/technologies that are missing or would improve the resume"],
        "atsScore": 85, // Integer 0 to 100 representing resume strength based on formatting, contact info, standard sections, keyword density
        
        // Populate if category is 'invoice'
        "amount": 2500.00, // Number representing total amount
        "currency": "INR", // 3-letter currency code
        "date": "YYYY-MM-DD",
        "company": "Vendor / Issuer Company Name",
        "gst": "GSTIN number or Tax Identification Number if present",
        "lineItems": [
          { "description": "Item description", "amount": 100.00 }
        ],

        // Populate if category is 'medical'
        "findings": ["key medical findings"],
        "vitalSigns": { "Blood Pressure": "120/80", "Pulse": "72 bpm" }, // Key value pairs of vital signs
        "recommendations": ["Doctor recommendations, tests, or lifestyle instructions"],
        "abnormalities": ["List any abnormal readings, critical levels, or health flags"],

        // Populate if category is 'paper'
        "abstract": "Summary of the abstract",
        "methodology": "Key methodology / formulas / experimental setup",
        "keyFindings": ["List of core contributions or findings"],
        "conclusions": "Conclusions and future works"
      },
      
      // Smart Highlights: Identify key clauses, deadlines, financial amounts, or risks
      "highlights": [
        {
          "text": "Exact text snippet from the document to highlight",
          "type": "clause | deadline | risk | amount | other", // CRITICAL: You MUST use one of these EXACT strings. Do NOT use any other words like 'strength' or 'goal'.
          "explanation": "Brief explanation of why this is important or what it represents"
        }
      ],

      // AI Document Detective: Audit the document for fraud, suspicious edits, math mismatches, or metadata anomalies
      "detectiveReport": {
        "status": "innocent | suspicious", // Mark 'suspicious' if math fails, dates conflict, typical invoice templates look forged, or anomalies present
        "score": 15, // Integer 0 to 100 representing suspicion level (0 = safe, 100 = highly fraudulent)
        "findings": [
          {
            "indicator": "Short name of the check (e.g., Arithmetic Mismatch, Date Inconsistency, Template Anomaly)",
            "details": "Clear description of the suspicion or check performed",
            "severity": "low | medium | high"
          }
        ]
      }
    }

    Be extremely thorough. Ensure that the 'detectiveReport' does standard arithmetic checks on invoice line items (verify if sum of items matches the total amount) and flags any discrepancies.
    For Highlights, extract at least 3-6 critical snippets (like payment due dates, pricing terms, critical clauses, or health risk markers).
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: safeText || '(No text provided)' }
      ],
      model: MODEL,
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '';
    return parseJsonOutput(responseText);
  } catch (error) {
    console.error('Error in analyzeDocument service:', error);
    throw error;
  }
}

/**
 * Handle document chat (Memory context Q&A)
 * @param {string} docText - Full text of the document
 * @param {Array} history - Array of previous messages: [{ role: 'user'|'model', content: string }]
 * @param {string} question - The current question
 * @returns {Promise<string>} - AI answer
 */
export async function chatWithDocument(docText, history, question) {
  try {
    const groq = getGroq();
    
    // Safely reduce text if it exceeds token limits
    const safeDocText = await reduceTextToTokenLimit(docText);

    const messages = [
      {
        role: 'system',
        content: `You are an AI Document Assistant. You are answering user questions based strictly on the uploaded document. Here is the full document text for reference:\n\n--- DOCUMENT START ---\n${safeDocText}\n--- DOCUMENT END ---\n\nKeep answers accurate, referencing terms directly. If the answer cannot be found in the document, mention that clearly but try your best to assist.`
      }
    ];

    for (const msg of history) {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      });
    }

    messages.push({ role: 'user', content: question });

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: MODEL
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error in chatWithDocument service:', error);
    throw error;
  }
}

/**
 * Match a resume against a job description
 * @param {string} resumeText - Full text of the resume
 * @param {string} jobDescription - Full text of the target Job Description
 * @returns {Promise<Object>} - Match metrics
 */
export async function matchResumeToJd(resumeText, jobDescription) {
  try {
    const groq = getGroq();
    
    // Safely reduce text if it exceeds token limits
    const safeResumeText = await reduceTextToTokenLimit(resumeText);
    const safeJdText = await reduceTextToTokenLimit(jobDescription);
    
    const prompt = `
    Compare the following resume and job description. Provide a comprehensive match analysis in strict JSON format. 
    Do not wrap the JSON in markdown blocks (e.g. \`\`\`json). Just return raw JSON.
    
    JSON Schema:
    {
      "matchPercentage": 75, // Integer 0 to 100 representing compatibility
      "matchingSkills": ["Skill A", "Skill B"], // List of skills in the resume that match the JD
      "missingSkills": ["Skill X", "Skill Y"], // List of skills required by JD but missing in the resume
      "strengths": ["Point A", "Point B"], // Candidacy strengths matching the role
      "suggestions": ["Recommendation 1", "Recommendation 2"] // Specific advice to improve the resume for this position
    }

    --- JOB DESCRIPTION ---
    ${safeJdText}

    --- RESUME ---
    ${safeResumeText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '';
    return parseJsonOutput(responseText);
  } catch (error) {
    console.error('Error in matchResumeToJd service:', error);
    throw error;
  }
}

/**
 * Translate and summarize a document text in Hindi, Telugu, or English
 * @param {string} text - Text to translate / summarize
 * @param {string} targetLanguage - 'English' | 'Hindi' | 'Telugu'
 * @returns {Promise<Object>} - { translatedText, summary }
 */
export async function translateAndSummarize(text, targetLanguage) {
  try {
    const groq = getGroq();
    
    // Safely reduce text if it exceeds token limits
    const safeText = await reduceTextToTokenLimit(text);
    
    const prompt = `
    You are an expert translator and summarizer. Given the text below, perform two tasks:
    1. Translate the entire text or summary context into: "${targetLanguage}" (Write using correct scripts, e.g. Devanagari for Hindi, Telugu script for Telugu).
    2. Write a concise 3-sentence summary of the text in "${targetLanguage}".
    
    Return a strictly valid JSON object:
    {
      "translatedText": "Full text translated into target language",
      "summary": "Summary written in target language"
    }

    Do not wrap with markdown code blocks. Just return the JSON object.

    --- TEXT ---
    ${safeText}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '';
    return parseJsonOutput(responseText);
  } catch (error) {
    console.error('Error in translateAndSummarize service:', error);
    throw error;
  }
}
