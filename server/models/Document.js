import mongoose from 'mongoose';

const HighlightSchema = new mongoose.Schema({
  text: { type: String, required: true },

  type: {
    type: String,
    default: 'other'
  },

  explanation: {
    type: String,
    default: ''
  }
});

const DetectiveFindingSchema = new mongoose.Schema({
  indicator: { type: String, required: true },
  details: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
});

const DocumentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true }, // e.g. 'pdf', 'png', 'jpg', 'jpeg', 'docx'
  category: {
    type: String,
    default: 'other'
  },
  filePath: { type: String, required: true }, // Local path or relative path
  extractedText: { type: String, default: '' },

  // Custom analysis results depending on the document category
  analysis: {
    // General
    summary: { type: String, default: '' },
    language: { type: String, default: 'English' },

    // Resume specific
    strengths: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    atsScore: { type: Number, default: 0 },

    // Invoice specific
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    date: { type: String, default: '' },
    company: { type: String, default: '' },
    gst: { type: String, default: '' },
    lineItems: [{
      description: { type: String },
      amount: { type: Number }
    }],

    // Medical specific
    findings: { type: [String], default: [] },
    vitalSigns: { type: Map, of: String, default: {} },
    recommendations: { type: [String], default: [] },
    abnormalities: { type: [String], default: [] },

    // Research Paper specific
    abstract: { type: String, default: '' },
    methodology: { type: String, default: '' },
    keyFindings: { type: [String], default: [] },
    conclusions: { type: String, default: '' }
  },

  // Smart Highlights: key terms, dates, amounts, risks detected
  highlights: [HighlightSchema],

  // Document Detective Audit Results
  detectiveReport: {
    status: { type: String, enum: ['innocent', 'suspicious'], default: 'innocent' },
    score: { type: Number, default: 0 }, // 0 to 100 suspicion score
    findings: [DetectiveFindingSchema]
  },

  createdAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', DocumentSchema);
export default Document;
