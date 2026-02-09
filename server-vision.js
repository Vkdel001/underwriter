require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to convert file to base64
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType
    },
  };
}

// PDF extraction endpoint using vision
app.post('/extract', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Get extraction prompt from request or use default
    const userPrompt = req.body.prompt || 'Extract and summarize all key information from this document including names, dates, addresses, policy numbers, and any other relevant details. Present the information in a clear, structured format.';

    // Use Gemini Pro Vision to analyze the PDF directly
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Convert PDF to base64 for Gemini
    const pdfPart = fileToGenerativePart(req.file.path, 'application/pdf');
    
    const result = await model.generateContent([userPrompt, pdfPart]);
    const response = result.response;
    const extractedInfo = response.text();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      filename: req.file.originalname,
      extractedInfo: extractedInfo,
      pageCount: 'N/A (Vision-based extraction)'
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to process PDF', 
      details: error.message 
    });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Using Gemini Vision API for scanned document support');
});
