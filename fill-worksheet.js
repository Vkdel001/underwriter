require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fillWorksheet(extractedInfo, worksheetTemplate) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an insurance underwriting assistant. I have extracted information from a life insurance application and need to fill out an underwriting worksheet with additional business rules.

EXTRACTED INFORMATION:
${extractedInfo}

UNDERWRITING WORKSHEET FIELDS TO FILL:
Based on the NICL Underwriting Worksheet format, please extract and structure the following information:

**PLAN DETAILS:**
- Start Date
- Proposal No
- Plan Proposed
- Term (years)
- Sum At Risk (MUR)
- Gender (M/F)
- Riders (TPD, ADB, ACD, FIB, ACB, CI)

**PERSONAL DETAILS - 1st Life Assured:**
- Name
- Occupation
- ANB (Age Next Birthday)
- BMI
- Habits: Smoking (No/Yes), Alcohol (No/Yes)
- Family History
- Previous Cover (OR / UPR/Exclu / Post/Declined)
- Previous decision
- Total Sum at Risk (MUR)
- Facultative/Und Opinion (Yes/No)

**UNDERWRITING REQUIREMENTS:**
Which of these are needed: ANB, RBS, GGT, HbA1c, MER, RBS, RBSC, GST, HbA1c, Lipids, FBS, LFT, R ECG, Cardiologist Evaluation inclu ECHO, Stress ECG

**PAYMENT DETAILS:**
- Total Monthly Premium (including new) (MUR)
- DLP
- No. Of Months Paid

**COMPLIANCE:**
- Listed on AML/CFT platform: 1st Life Assured (Yes/No)
- 2nd Life Assured (Yes/No)
- Beneficiary (Yes/No)
- CRA Weighted Score
- CRA Risk Score
- Referred to Compliance (Yes/No)
- Listed as PEP: Owner (Yes/No), 1st Life Assured (Yes/No), 2nd Life Assured (Yes/No), Beneficiary (Yes/No)

**DOCUMENTS REQUIRED:**
- EDD Form
- Financial Questionnaire
- Others
- Trade license
- BRN
- Cert of Incorporation
- Memorandum of Association
- Board of Resolution
- Last Audited Accounts

---

**CRITICAL BUSINESS RULES TO APPLY:**

1. **FAMILY HISTORY ANALYSIS:**
   Based on the extracted family health information, provide a 1-2 line summary with a decision recommendation regarding family history risk. Consider conditions like diabetes, heart disease, cancer, hypertension, etc. in immediate family members.

2. **BMI ALERT:**
   If BMI is greater than 33, display: "⚠️ BMI ALERT: BMI IS [value] - EXCEEDS THRESHOLD OF 33"
   Display this in CAPS and make it prominent.

3. **UNDERWRITER DECISION CHECKLIST:**
   Create a comprehensive checklist with status for each item:
   
   a) **ID/Passport Copy:**
      - Is it attached? (Yes/No/Not Mentioned)
      - Is it certified? (Yes/No/Not Mentioned)
   
   b) **Utility Bill:**
      - Is it attached? (Yes/No/Not Mentioned)
      - Is it less than 3 months old? (Yes/No/Not Mentioned/Cannot Determine)
   
   c) **CDD Form:**
      - Is it filled? (Yes/No/Not Mentioned)
      - Is it attached? (Yes/No/Not Mentioned)
   
   d) **Tax Residency Form:**
      - Is it filled? (Yes/No/Not Mentioned)
      - Is it attached? (Yes/No/Not Mentioned)
   
   e) **Health Checks:**
      - Are all required health checks completed? (Yes/No/Partial/Not Mentioned)
      - Any concerns identified? (List them or "None")

   **FINAL UNDERWRITER DECISION SUMMARY:**
   Based on the above checklist, provide:
   - Overall Status: READY FOR APPROVAL / PENDING DOCUMENTS / REQUIRES REVIEW
   - Missing Items: (List all missing or incomplete items)
   - Risk Flags: (List any concerns: BMI, family history, health issues, missing documents)
   - Recommendation: (Brief recommendation for underwriter)

---

Please provide the filled information in a clear, structured JSON format with all available fields populated from the extracted information. Include the three new sections (Family History Analysis, BMI Alert if applicable, and Underwriter Decision Checklist) as separate top-level fields in the JSON.

If a field cannot be determined from the extracted information, mark it as "N/A" or "Not Mentioned".`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error filling worksheet:', error);
    throw error;
  }
}

// Test with the extracted info
const extractedInfo = fs.readFileSync('../extracted_info.txt', 'utf8');
fillWorksheet(extractedInfo).then(result => {
  console.log('FILLED WORKSHEET DATA WITH BUSINESS RULES:');
  console.log('='.repeat(80));
  console.log(result);
  console.log('='.repeat(80));
  
  // Save to file
  fs.writeFileSync('filled_worksheet.txt', result);
  console.log('\nSaved to filled_worksheet.txt');
}).catch(error => {
  console.error('Error:', error.message);
});
