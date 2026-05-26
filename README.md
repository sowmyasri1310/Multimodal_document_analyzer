# AuraDoc AI — Multimodal Document Analyzer 🚀

AuraDoc AI is a premium, state-of-the-art Multimodal Document Analyzer web application. It leverages Google's Gemini Multimodal AI Engine to perform visual layout parsing, high-accuracy OCR, intelligent categorization, and specialized diagnostic analysis on document uploads.

The system is styled with a highly polished dark glassmorphic user interface, offering real-time speech interaction, risk assessments, and multi-format document exporting.

---

## 🌟 Key Features

1. **Intelligent Auto-Categorization & OCR**: 
   * Instantly uploads documents (PDF, PNG, JPG, JPEG).
   * Automatically detects the document category and runs tailored processing.
   * Performs advanced visual OCR to extract high-accuracy text, including regional scripts like Hindi and Telugu.

2. **Specialized Intelligence Dashboards**:
   * **Resume ATS Analyzer**: Computes a detailed ATS score (0-100), extracts strengths, missing tools/skills, and keyword density.
   * **Invoice Analyzer**: Extracts transaction currency, date, vendor, tax identifiers (GSTIN), and line items, executing strict mathematical audits.
   * **Medical Report Analyzer**: Simplifies medical jargon, records vitals, and flags critical abnormal values in highlighting panels.
   * **Research Paper Analyzer**: Extracts abstract, methodologies, formulas, and conclusions in tidy tabs.

3. **Memory-Guided AI Chat & Voice Assistant**:
   * Talk to your document with full conversational history memory.
   * Features **browser-native Speech-to-Text** (mic voice dictation) and **Text-to-Speech** (reads replies aloud).

4. **AI Document Detective**:
   * Forensic diagnostic audit tool that scans document fields for mathematical discrepancies, date mismatches, and template anomalies.

5. **Smart Highlighting Board**:
   * Spotlights and catalogs critical clauses, payment deadlines, health risks, and amounts in color-coded cards.

6. **Interactive Resume-JD Matcher**:
   * Paste any target Job Description alongside a resume to compute a matching percentage, missing keywords, and structural enhancement recommendations.

7. **Regional Language Translator**:
   * Instant multi-way translations and executive summaries into correct Devanagari (Hindi) and Telugu scripts.

8. **Multi-Format Export Hub**:
   * Export reports as formatted **Markdown**, Microsoft Word **DOCX**, or print cleanly to **PDF** using custom print-media CSS layouts.

---

## 🛠️ Technology Stack

* **Frontend**: ReactJS, Vite, Vanilla CSS (Charcoal Glassmorphism Theme)
* **Backend**: Node.js, Express.js, Mongoose, Multer, PDF-Parse
* **AI Engine**: `@google/generative-ai` (Gemini 2.5 Flash / Gemini Flash Latest with automatic 404/429 model fallback routing)
* **Database**: MongoDB Atlas

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed.

### 2. Configuration Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/doc-analyzer
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Server Startup
```bash
cd server
npm install
npm run dev
```

### 4. Client Startup
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` to explore the workspace!

---

## 📄 License
This project is licensed under the MIT License.
