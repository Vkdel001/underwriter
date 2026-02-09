require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const { Packer } = require('docx');
const { generateUnderwritingWorksheet } = require('./generate-docx-single-page');
const { calculateCRAScore, formatCRASummary } = require('./calculate-cra-score');

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

    // Use Gemini Vision to analyze the PDF directly (works with scanned documents)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1, // Lower temperature for more accurate extraction
        topP: 0.8,
        topK: 40,
      }
    });
    
    // Convert PDF to base64 for Gemini
    const pdfPart = fileToGenerativePart(req.file.path, 'application/pdf');
    
    const result = await model.generateContent([userPrompt, pdfPart]);
    const response = result.response;
    let extractedInfo = response.text();

    // Validate and fix family history data inconsistencies
    if (extractedInfo.toLowerCase().includes('family') || extractedInfo.toLowerCase().includes('mother') || extractedInfo.toLowerCase().includes('father')) {
      console.log('🔍 Validating family history data for inconsistencies...');
      
      // Check for contradictory data (deceased + good condition)
      const hasContradiction = (
        (extractedInfo.match(/deceased|death|died/i) && extractedInfo.match(/present condition.*good/i)) ||
        (extractedInfo.match(/cause of death/i) && extractedInfo.match(/present age.*\d+/i) && extractedInfo.match(/present condition/i))
      );
      
      if (hasContradiction) {
        console.log('⚠️ Detected contradictory family history data, doing focused re-extraction...');
        
        const familyPrompt = `Look at the FAMILY HISTORY table in this document VERY CAREFULLY.

This table has SEPARATE columns:
- "Present Age" and "Present Condition" = for LIVING family members
- "Age of Death" and "Cause of Death" = for DECEASED family members

For each family member (Father, Mother, Brothers, Sisters):
1. Check if "Age of Death" column has a value → person is DECEASED
2. Check if "Present Age" column has a value → person is LIVING
3. DO NOT mix data from living and deceased columns

Extract family history in this format:
- Father: [Living/Deceased], [if living: Present Age X, Condition Y] [if deceased: Age at Death X, Cause Y]
- Mother: [Living/Deceased], [if living: Present Age X, Condition Y] [if deceased: Age at Death X, Cause Y]
- Brothers: [for each brother, same format]
- Sisters: [for each sister, same format]

Be precise. Never say someone is both living and deceased.`;

        const familyResult = await model.generateContent([familyPrompt, pdfPart]);
        const familyData = familyResult.response.text();
        
        extractedInfo += '\n\n--- CORRECTED FAMILY HISTORY ---\n' + familyData;
        console.log('✓ Family history validation completed');
      }
    }

    // Check if height/weight are missing and do a focused re-extraction
    if (extractedInfo.toLowerCase().includes('blank') || 
        extractedInfo.toLowerCase().includes('weight:') && !extractedInfo.match(/weight:\s*\d+/i)) {
      
      console.log('⚠️ Detected missing physical measurements, doing focused re-extraction...');
      
      const focusedPrompt = `Look at this document very carefully. Focus ONLY on the physical measurements section.

Find and extract:
1. Height (in cms or meters) - look for handwritten numbers in the Height field
2. Weight (in kgs) - look for handwritten numbers in the Weight field

These are often handwritten. Look at ALL numbers in the physical measurements area, even if they're faint or unclear. 
If you see ANY number written in these fields, extract it. Don't say "blank" unless the field is truly empty.

Report ONLY: Height: [value] cms, Weight: [value] kgs`;

      const focusedResult = await model.generateContent([focusedPrompt, pdfPart]);
      const focusedData = focusedResult.response.text();
      
      // Append the focused extraction
      extractedInfo += '\n\n--- FOCUSED PHYSICAL MEASUREMENTS RE-EXTRACTION ---\n' + focusedData;
      console.log('✓ Focused re-extraction completed');
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      filename: req.file.originalname,
      extractedInfo: extractedInfo,
      pageCount: 'Vision-based extraction'
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

// Generate DOCX endpoint - now combines proposal + ECM data + manual verification
app.post('/generate-docx', async (req, res) => {
  try {
    const { proposalData, ecmData, manualVerification } = req.body;
    
    if (!proposalData) {
      return res.status(400).json({ error: 'No proposal data provided' });
    }

    if (!ecmData) {
      return res.status(400).json({ error: 'No ECM data provided' });
    }

    if (!manualVerification) {
      return res.status(400).json({ error: 'No manual verification data provided' });
    }

    console.log('=== Generate DOCX Request ===');
    console.log('Proposal data length:', proposalData.length);
    console.log('ECM data length:', ecmData.length);
    console.log('Manual Verification:', manualVerification);

    // Use Gemini to map the data to worksheet format
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const mappingPrompt = `You are mapping insurance data to an underwriting worksheet. 

PROPOSAL DATA:
${proposalData}

ECM PORTFOLIO DATA (Existing Policies):
${ecmData}

MANUAL VERIFICATION DATA (User-Provided):
- PEP Status: ${manualVerification.pepStatus}
- PEP Comments: ${manualVerification.pepComments || 'None'}
- Claims History Amount: MUR ${manualVerification.claimsAmount}
- Claims Comments: ${manualVerification.claimsComments || 'None'}

Map this data to the underwriting worksheet fields. Extract and structure:

1. PLAN DETAILS:
   - Start Date (from Effective Date)
   - Proposal No
   - Plan Proposed (plan name)
   - Term (years)
   - Sum At Risk (Death Benefit + Additional Death)
   - Gender (M/F)
   - Riders: TPD, ADB, ACD, FIB, ACB, CI (check which are active based on premiums)

2. PERSONAL DETAILS (1st Life Assured):
   - Name
   - Occupation
   - ANB (Age Next Birthday)
   - BMI (calculate from height/weight if available)
   - Smoking (Yes/No)
   - Alcohol (Yes/No)
   - Family History
   - Previous Cover
   - Previous Decision
   - Total Sum at Risk (from ECM: sum of all ACTIVE policies)

3. EXISTING POLICIES (from ECM):
   - List all active policies with policy numbers and sum assured
   - Calculate total existing sum assured
   - Note any with medical impairments

4. PAYMENT DETAILS:
   - Total Monthly Premium
   - DLP (Date of Last Payment / First Payment Date)
   - No. Of Months Paid

5. COMPLIANCE:
   - Listed as PEP (Yes/No) - USE MANUAL VERIFICATION DATA: ${manualVerification.pepStatus}
   - Listed on AML/CFT (Yes/No)

6. MANUAL VERIFICATION (User-Provided):
   - PEP Status: ${manualVerification.pepStatus}
   - PEP Comments: ${manualVerification.pepComments || 'N/A'}
   - Claims History: MUR ${manualVerification.claimsAmount}
   - Claims Comments: ${manualVerification.claimsComments || 'No previous claims'}

Format as structured field mappings.`;

    const mappingResult = await model.generateContent(mappingPrompt);
    const mappedData = mappingResult.response.text();

    // Calculate CRA Score with manual verification data
    console.log('Calculating CRA score with manual verification...');
    const craScore = calculateCRAScore(mappedData, manualVerification);
    const craSummary = formatCRASummary(craScore, manualVerification);
    console.log('CRA Score:', craScore.weightedScore, 'Risk Level:', craScore.riskLevel);

    // Generate Underwriter Summary with ECM validation and CRA
    const summaryPrompt = `Based on the following data, create an UNDERWRITER SUMMARY with BUSINESS RULE VALIDATION.

PROPOSAL DATA:
${proposalData}

ECM DATA (Existing Policies):
${ecmData}

CRA RISK ASSESSMENT:
${craSummary}

🔴 CRITICAL SUMMARY GENERATION RULES 🔴

1. The CRA section above is COMPLETE and FINAL - it already includes:
   - All risk assessments
   - All manual verification requirements
   - Geography risk evaluation (with Mauritian exemption)
   - Source of funds assessment

2. DO NOT REPEAT any items from "MANUAL VERIFICATION REQUIRED" section of CRA
   - DO NOT mention "Country Risk" again (already assessed in CRA)
   - DO NOT mention "Source of Funds" again (already assessed in CRA)
   - DO NOT mention "PEP Status" again (already in CRA manual checks)
   - DO NOT mention "Claims History" again (already in CRA manual checks)

3. HEALTH DECLARATION LOGIC:
   - Q1 "Are you presently in good health?" with answer YES = Customer IS healthy
   - Q1 with answer YES + all other questions NO = PERFECT health, no issues
   - Q1 with answer NO = Customer is NOT healthy, flag for review
   - DO NOT flag inconsistency if Q1=YES and all others=NO (this is normal for healthy person)

4. FOCUS YOUR SUMMARY ON:
   - Existing policies validation
   - Non-medical grid compliance
   - Age and BMI checks
   - Health declaration (only if there are actual health issues)
   - Missing documents
   - Final recommendation

UNDERWRITER SUMMARY REQUIREMENTS:

1. **EXISTING POLICIES SUMMARY:**
   - List all ACTIVE policies from ECM with sum assured
   - Calculate TOTAL EXISTING SUM ASSURED (Active policies only)
   - Exclude: Expired, Lapsed, Paid-up, CFI, NPW status policies

2. **NEW APPLICATION:**
   - New Sum Assured requested
   - TOTAL SUM ASSURED = Existing + New
   - ⚠️ VALIDATION: Check if total exceeds 11,000,000 MUR

3. **NON-MEDICAL GRID VALIDATION:**
   - If Total Sum ≤ 4,000,000 MUR: Proposal form only (if ANB ≤ 45)
   - If Total Sum > 4,000,000 and ≤ 11,000,000 MUR: Medical examination required
   - If Total Sum > 11,000,000 MUR: ⚠️ EXCEEDS LIMIT - Special approval needed

4. **AGE VALIDATION:**
   - ANB (Age Next Birthday): [extract from data]
   - ⚠️ If ANB > 45: Medical examination required

5. **BMI ASSESSMENT:**
   - BMI: [calculate or extract]
   - ⚠️ If BMI > 33: Flag for review

6. **HEALTH DECLARATION:**
   - ONLY mention if there are actual health issues (Q1=NO or any other Q=YES with details)
   - If Q1=YES and all others=NO: State "Health declaration: All clear, no medical issues reported"
   - DO NOT flag as inconsistency or violation if customer is healthy

7. **FAMILY HISTORY:**
   - Summarize family health history if mentioned

8. **FINAL RECOMMENDATION:**
   - Standard rates / Medical required / Special approval
   - List any missing documents
   - Risk flags (only NEW flags not already in CRA)

Format clearly with warnings (⚠️) for rule violations.`;

    const summaryResult = await model.generateContent(summaryPrompt);
    const underwriterSummary = summaryResult.response.text();

    res.json({
      success: true,
      mappedData: mappedData,
      underwriterSummary: underwriterSummary
    });

  } catch (error) {
    console.error('Error generating worksheet data:', error);
    res.status(500).json({ error: 'Failed to generate worksheet data', details: error.message });
  }
});

// Download DOCX endpoint
app.post('/download-docx', async (req, res) => {
  try {
    const { mappedData, underwriterSummary } = req.body;
    
    if (!mappedData) {
      return res.status(400).json({ error: 'No mapped data provided' });
    }

    // Generate the DOCX document
    const doc = generateUnderwritingWorksheet(mappedData, underwriterSummary || '');
    
    // Convert to buffer
    const buffer = await Packer.toBuffer(doc);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=underwriting_worksheet.docx');
    
    res.send(buffer);

  } catch (error) {
    console.error('Error generating DOCX:', error);
    res.status(500).json({ error: 'Failed to generate DOCX', details: error.message });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Endpoints: /extract, /generate-docx, /download-docx');
  console.log('Using Gemini Vision API - supports scanned documents!');
  console.log('\nWorkflow: Upload Proposal → Upload ECM → Generate DOCX');
});
