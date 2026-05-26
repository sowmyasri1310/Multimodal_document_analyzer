import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text from a PDF file
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsedData = await pdfParse(dataBuffer);
    return parsedData.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Return empty string, let multimodal OCR handle it if needed
    return '';
  }
}

/**
 * Extracts raw text from a DOCX file
 * @param {string} filePath - Absolute path to the DOCX file
 * @returns {Promise<string>} - Extracted text
 */
export async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return '';
  }
}
