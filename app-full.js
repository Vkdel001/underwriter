// API Base URL - works for both local and production
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin;

// Step 1: Extract from proposal
const uploadArea1 = document.getElementById('uploadArea1');
const proposalFile = document.getElementById('proposalFile');
const extractBtn = document.getElementById('extractBtn');
const loading1 = document.getElementById('loading1');
const result1 = document.getElementById('result1');
const extractedContent = document.getElementById('extractedContent');

// Step 2: Extract ECM
const uploadArea2 = document.getElementById('uploadArea2');
const ecmFile = document.getElementById('ecmFile');
const extractEcmBtn = document.getElementById('extractEcmBtn');
const loading2 = document.getElementById('loading2');
const result2 = document.getElementById('result2');
const ecmContent = document.getElementById('ecmContent');

// Step 3: Generate DOCX
const generateBtn = document.getElementById('generateBtn');
const loading3 = document.getElementById('loading3');
const result3 = document.getElementById('result3');
const summaryResult = document.getElementById('summaryResult');
const summaryContent = document.getElementById('summaryContent');

let selectedProposal = null;
let selectedEcm = null;
let extractedProposalData = null;
let extractedEcmData = null;
let mappedDataGlobal = null;
let underwriterSummaryGlobal = null;

// Step 1: Proposal upload
uploadArea1.addEventListener('click', () => proposalFile.click());
proposalFile.addEventListener('change', (e) => handleProposalFile(e.target.files[0]));

uploadArea1.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea1.style.borderColor = '#764ba2';
});

uploadArea1.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea1.style.borderColor = '#667eea';
    handleProposalFile(e.dataTransfer.files[0]);
});

function handleProposalFile(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
    }

    selectedProposal = file;
    uploadArea1.innerHTML = `
        <div class="upload-icon">✅</div>
        <h3>${file.name}</h3>
        <p>${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;
    extractBtn.disabled = false;
    result1.style.display = 'none';
}

// Step 2: ECM upload
uploadArea2.addEventListener('click', () => ecmFile.click());
ecmFile.addEventListener('change', (e) => handleEcmFile(e.target.files[0]));

uploadArea2.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea2.style.borderColor = '#764ba2';
});

uploadArea2.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea2.style.borderColor = '#667eea';
    handleEcmFile(e.dataTransfer.files[0]);
});

function handleEcmFile(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
    }

    selectedEcm = file;
    uploadArea2.innerHTML = `
        <div class="upload-icon">✅</div>
        <h3>${file.name}</h3>
        <p>${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;
    extractEcmBtn.disabled = false;
    result2.style.display = 'none';
}

// Extract information from proposal
extractBtn.addEventListener('click', async () => {
    if (!selectedProposal) return;

    const formData = new FormData();
    formData.append('pdf', selectedProposal);
    formData.append('prompt', `Extract ALL information from this NIC Life Insurance Proposal Form. This is a multi-page form with specific sections. Be EXTREMELY careful with table structures, checkboxes, and handwritten fields.

FORM STRUCTURE (6 pages):

**PAGE 1 - DETAILS OF LIFE PROPOSED:**
- Serial No/LID, Proposal Form number
- Sales Quote No, Effective Date
- Name (Title, Surname, Other Names, Maiden Name)
- Nationality, Gender

🔴 CRITICAL: MARITAL STATUS CHECKBOX READING 🔴

The Marital Status field has checkbox layout:
┌────────┬─────────┐
│ Single │ Married │
│  (L)   │   (R)   │
└────────┴─────────┘

READING INSTRUCTIONS:
- LEFT checkbox = Single
- RIGHT checkbox = Married

STEP-BY-STEP:
1. Look at the Marital Status row
2. Check if the LEFT checkbox has a checkmark → Marital Status = Single
3. Check if the RIGHT checkbox has a checkmark → Marital Status = Married

VERIFICATION: State which checkbox (LEFT/RIGHT) has the checkmark before reporting marital status.

EXAMPLES:
- Checkmark in LEFT box = Single
- Checkmark in RIGHT box = Married

Extract:
- Marital Status: Single/Married (based on checkbox position)

- Date of Birth, ID/Passport No
- Residential Address (Town/City, Country, Postal Code)
- Mailing Address
- Contact Details (Mobile, Email)
- Occupation, Company Name, Length of Service
- Height (in M and cms), Weight (in kgs) - HANDWRITTEN, look carefully

🔴 CRITICAL: SMOKING AND ALCOHOL CHECKBOX READING 🔴

⚠️⚠️⚠️ THESE ARE TWO COMPLETELY SEPARATE ROWS - NEVER MIX THEM! ⚠️⚠️⚠️

The form has TWO SEPARATE rows that are PHYSICALLY DIFFERENT:

ROW 1 - SMOKING (TOP ROW):
┌─────────┬─────┬────────────────┬─────┐
│ Smoking │ Yes │ [Frequency]    │ No  │
│         │(L)  │ (handwritten)  │(R)  │
└─────────┴─────┴────────────────┴─────┘

ROW 2 - ALCOHOL (BOTTOM ROW):
┌─────────┬─────┬────────────────┬─────┐
│ Alcohol │ Yes │ [Frequency]    │ No  │
│         │(L)  │ (handwritten)  │(R)  │
└─────────┴─────┴────────────────┴─────┘

🚨 ABSOLUTE RULES - VIOLATION WILL CAUSE ERRORS:

1. **ROW ISOLATION**: Each row is INDEPENDENT. Text in Smoking row belongs ONLY to Smoking. Text in Alcohol row belongs ONLY to Alcohol.

2. **COMMON ERROR TO AVOID**: 
   ❌ WRONG: "Smoking: No - OCCASIONALLY" (mixing checkbox from Smoking with text from Alcohol)
   ✅ CORRECT: "Smoking: No" AND separately "Alcohol: Yes - OCCASIONALLY"

3. **IF YOU SEE "OCCASIONALLY" TEXT**: 
   - First determine: Is this text in the SMOKING row or ALCOHOL row?
   - Look at which row label (Smoking/Alcohol) is closest to the text
   - ONLY report the text with the correct row

4. **PHYSICAL LOCATION MATTERS**:
   - Text written in the TOP row (near "Smoking" label) = Smoking frequency
   - Text written in the BOTTOM row (near "Alcohol" label) = Alcohol frequency

MANDATORY EXTRACTION PROCESS:

**STEP 1 - SMOKING ROW (TOP ROW) ONLY:**
1. Find the row with "Smoking" label on the far left
2. In THIS ROW ONLY, check LEFT checkbox (Yes) - checked or not?
3. In THIS ROW ONLY, check RIGHT checkbox (No) - checked or not?
4. In THIS ROW ONLY, read any handwritten text in the frequency field
5. STOP - Do not look at any other row yet

**STEP 2 - ALCOHOL ROW (BOTTOM ROW) ONLY:**
1. Find the row with "Alcohol" label on the far left
2. In THIS ROW ONLY, check LEFT checkbox (Yes) - checked or not?
3. In THIS ROW ONLY, check RIGHT checkbox (No) - checked or not?
4. In THIS ROW ONLY, read any handwritten text in the frequency field
5. STOP - Do not mix with Smoking row

**STEP 3 - VERIFICATION (MANDATORY):**
Before reporting, state:
- "SMOKING ROW: I see [LEFT/RIGHT] checkbox checked. Handwritten text in Smoking row: [text or NONE]"
- "ALCOHOL ROW: I see [LEFT/RIGHT] checkbox checked. Handwritten text in Alcohol row: [text or NONE]"

**STEP 4 - REPORT SEPARATELY:**
- **Smoking status:** [Yes/No based on Smoking row checkbox] [+ text from Smoking row ONLY if Yes]
- **Alcohol status:** [Yes/No based on Alcohol row checkbox] [+ text from Alcohol row ONLY if Yes]

REAL-WORLD EXAMPLES FROM ACTUAL FORMS:

Example 1:
- Smoking row: RIGHT checkbox (No) checked, no text → "Smoking: No"
- Alcohol row: LEFT checkbox (Yes) checked, text "OCCASIONALLY" → "Alcohol: Yes - OCCASIONALLY"

Example 2:
- Smoking row: LEFT checkbox (Yes) checked, text "I PIPE" → "Smoking: Yes - I PIPE"
- Alcohol row: RIGHT checkbox (No) checked, no text → "Alcohol: No"

Example 3:
- Smoking row: LEFT checkbox (Yes) checked, text "2 CIGARETTES DAILY" → "Smoking: Yes - 2 CIGARETTES DAILY"
- Alcohol row: LEFT checkbox (Yes) checked, text "SOCIALLY" → "Alcohol: Yes - SOCIALLY"

🚨 FINAL CHECK BEFORE SUBMITTING:
- Does my Smoking answer contain ONLY data from the Smoking row? YES/NO
- Does my Alcohol answer contain ONLY data from the Alcohol row? YES/NO
- Did I accidentally mix text from one row into the other? YES/NO (must be NO)

If you cannot clearly separate the rows, state: "Unable to clearly distinguish between Smoking and Alcohol rows - manual review required"

**PAGE 2 - CHOICE OF PLAN & FAMILY HISTORY:**

Section 3 - CHOICE OF PLAN:
- Basic Plan name
- Sum Assured (MUR)
- Term (years)
- Basic Premium (MUR)
- Rider Details with checkmarks:
  * Additional Death Cover
  * Accidental Death Benefits
  * Total and Permanent Disability
  * Additional Total and Permanent Disability
  * Family Income Benefit
  * Critical Illness Benefit
  * Other Benefit (Please specify)
- Policy Fee
- Total Premium
- Type of Fund, Escalation rate, Voluntary Contribution
- Frequency of premium payment (Monthly/Quarterly/Semi-Annually/Annually/Single)

Section 4 - GENERAL INFORMATION:

🔴 CRITICAL CHECKBOX READING - SAME AS PERSONAL HISTORY 🔴

The table header shows: "First Life" section with columns "Yes | or | No"

VISUAL LAYOUT (left to right):
┌─────────────────────────────────────┬─────┬────┬─────┬─────┬────┬─────┐
│ Question Text                        │ Yes │ or │ No  │ Yes │ or │ No  │
│                                      │(1st)│    │(1st)│(2nd)│    │(2nd)│
└─────────────────────────────────────┴─────┴────┴─────┴─────┴────┴─────┘

CHECKBOX READING RULES:
- FIRST column (immediately after question) = YES
- THIRD column (after "or" separator) = NO
- The word "or" is a SEPARATOR, not a checkbox

Extract Q1-Q5 with CORRECT Yes/No status:

Q1: "Do you have any life insurance policy with any company other than National Insurance Co. Ltd? If Yes, Please state sum assured and name of insurance companies."
   → Check FIRST column (Yes) vs THIRD column (No) for First Life
   → State which column has checkmark: [FIRST=YES / THIRD=NO]

Q2: "Has any Proposal for life or Disability cover on your life/lives ever been declined, deferred or accepted on special terms?"
   → Check FIRST column (Yes) vs THIRD column (No)
   → State which column has checkmark: [FIRST=YES / THIRD=NO]

Q3: "Have any of your natural parents, or brother(s)/sister(s), living/dead, suffered from heart disease, hypertension, raised cholesterol, diabetes, cancer, mental illness or any other hereditary disorders before age 60?"
   → Check FIRST column (Yes) vs THIRD column (No)
   → State which column has checkmark: [FIRST=YES / THIRD=NO]

Q4: "Do you take part in hazardous or extreme sports, such as scuba diving, kite surfing, horse riding, car/motorcycle rally competition, aviation and other related sports?"
   → Check FIRST column (Yes) vs THIRD column (No)
   → State which column has checkmark: [FIRST=YES / THIRD=NO]

Q5: "Have you travelled abroad in the last 3 years? If Yes, please state name of country and duration of stay."
   → Check FIRST column (Yes) vs THIRD column (No)
   → State which column has checkmark: [FIRST=YES / THIRD=NO]

For each question:
- Question number
- Answer: YES or NO (based on checkbox column position)
- If YES, extract the details provided

Section 5 - FAMILY HISTORY TABLE:
⚠️ CRITICAL - This table has SEPARATE columns:

For LIVING family members (columns 1-2):
- Present Age
- Present Condition

For DECEASED family members (columns 3-4):
- Age of Death
- Cause of Death

Extract for each row (Father, Mother, Brothers, Sisters):
- If "Age of Death" has value → person is DECEASED (use Age of Death & Cause)
- If "Present Age" has value → person is LIVING (use Present Age & Condition)
- NEVER mix living and deceased data for same person

Format as:
- Father: [Living/Deceased], [details]
- Mother: [Living/Deceased], [details]
- Brothers: [list each with status]
- Sisters: [list each with status or NIL]

**PAGE 3 - COMMUNICATION & DECLARATION:**

Section 11 - MODE OF CORRESPONDENCE:
- Preferred communication method (Email/SMS/Mobile/Residential/Post)

Section 11.2 - CONSENT FOR ELECTRONIC DELIVERY:
- Consent checkbox status

DECLARATION section with signature and date

First Life Assured details:
- Full Name
- Relationship to Policy Owner
- Signature, Date

**PAGE 4 - PAYER & BENEFICIARY:**

Section 7 - PAYER (if different from Life Proposed):
- Title, Surname, Other Names, Occupation, Address, City
- Contact Details, Relationship with Life Proposed

Section 8 - SALARY & PAYMENT DETAILS:

🔴 CRITICAL CHECKBOX READING FOR SALARY RANGE 🔴

The salary section has FOUR checkbox options in a row:
□ Below 10,000  |  □ 10,001-25,000  |  □ 25,001-30,000  |  □ Above 30,000

READING INSTRUCTIONS:
1. Look at each checkbox carefully from left to right
2. Identify which ONE has a checkmark (✓)
3. Report the EXACT text of the checked option
4. DO NOT default to "Below 10,000" - this is rarely checked in Mauritius

VERIFICATION STEP: Before reporting, state "I see a checkmark in the [position] box which says [exact text]"

Extract the following with CHECKED boxes:

- Salary Range of payer (MUR): 
  Options: □ Below 10,000  |  □ 10,001-25,000  |  □ 25,001-30,000  |  □ Above 30,000
  → Look at each box, identify which is CHECKED, report EXACT range text
  
- Source of Funds: 
  Options: □ Salary  |  □ Savings  |  □ Rent  |  □ Commission  |  □ Others
  → Report which box is CHECKED
  
- First payment method: 
  Options: □ Cash  |  □ Cheque  |  □ PoS  |  □ Standing Order
  → Report which box is CHECKED
  
- Premium Payment: 
  Options: □ Cash  |  □ Standing Order  |  □ Direct Debit  |  □ Check Off  |  □ Others
  → Report which box is CHECKED
  
- Bank Name of Payer: 
  Options: □ MCB  |  □ SBM  |  □ HSBC  |  □ MAURBANK  |  □ Others
  → Report which box is CHECKED
  
- Transaction Details/Reference (if provided)

Section 9 - BENEFICIARY(IES) DETAILS:
- Designated Beneficiaries table:
  * Surname
  * Other Name(s)
  * Contact Number
  * Relationship to Life Proposed
  * % Share
- Total should equal 100%

Section 10 - POLICY OWNER (if different from Life Proposed):
- Same as Insured checkbox or full details

**PAGE 5 - PERSONAL HISTORY (Health Questions):**

Section 6 - PERSONAL HISTORY:

🔴 CRITICAL CHECKBOX READING INSTRUCTIONS 🔴

The table header shows: "First Life" section with columns "Yes | or | No"

VISUAL LAYOUT (left to right):
┌─────────────────────────────────────┬─────┬────┬─────┬─────┬────┬─────┐
│ Question Text                        │ Yes │ or │ No  │ Yes │ or │ No  │
│                                      │(1st)│    │(1st)│(2nd)│    │(2nd)│
└─────────────────────────────────────┴─────┴────┴─────┴─────┴────┴─────┘

STEP-BY-STEP CHECKBOX READING PROCESS:
1. Locate the question row (Q1, Q2, etc.)
2. Look at the "First Life" section (first 3 columns after question text)
3. The FIRST checkbox column = YES
4. The THIRD checkbox column = NO (after the "or" separator)
5. Identify which column has the checkmark (✓)

EXAMPLE FROM IMAGE:
Q1: "Are you presently in good health?"
- Looking at First Life section: ✓ is in the FIRST column (leftmost checkbox)
- FIRST column = YES
- Therefore: Q1 = YES (customer IS in good health)

⚠️ CRITICAL RULE: 
- Checkmark in FIRST column (immediately after question) = YES
- Checkmark in THIRD column (after "or" separator) = NO
- The word "or" is a SEPARATOR, not a checkbox column

BEFORE YOU EXTRACT, VERIFY YOUR UNDERSTANDING:
For Q1 specifically, state: "I see the checkmark in the [FIRST/THIRD] column, which means [YES/NO]"

Now extract ALL health questions (Q1-Q24+):

Q1: "Are you presently in good health?" 
   → CRITICAL: Look at FIRST column (Yes) vs THIRD column (No) for First Life
   → State which column has the checkmark before answering

Q2: "Are you taking any medicine or drug or receiving any treatment?"
   → Check FIRST column (Yes) vs THIRD column (No)

Q3: "Have you at any time received any form of medical attention as an in-patient or out-patient or had any surgical operation or underwent blood investigation, ECG and other tests?"
   → Check FIRST column (Yes) vs THIRD column (No)

Q4: "Have you ever taken drugs other than for medical purposes or ever injected non-prescription drugs or been advised or ever undergone any treatment for alcohol abuse or disintoxication?"
   → Check FIRST column (Yes) vs THIRD column (No)

Q5: "Do you suffer from any disabling illness, physical defect, infirmity or congenital illness or from consequences of any illness or accident?"
   → Check FIRST column (Yes) vs THIRD column (No)

Q6: "Have you been tested for Covid-19? If yes, please provide the results."
   → Check FIRST column (Yes) vs THIRD column (No)

Q7: "Have you been in contact with people infected or diagnosed with Covid-19?"
   → Check FIRST column (Yes) vs THIRD column (No)

Q8-Q24: Specific medical conditions (respiratory, heart, circulatory, thyroid, liver, diabetes, blood disorders, kidney, bone/joint, eyes/ears, skin, female-specific, etc.)
   → For each, check FIRST column (Yes) vs THIRD column (No)

For each question, extract:
- Question number
- Answer: YES or NO (based on which column has checkmark)
- If YES to any question, extract details from diagnosis table below

Bottom table for diagnosis details (if any YES answers):
- Q. No.
- Date of Diagnosis
- Full Details (Nature of complaint & Treatment)

**PAGE 6 - DECLARATION & CHECKLIST:**

DECLARATION BY THE COMPANY INTERMEDIARY:
- Q1-Q5 with Yes/No checkboxes
- Date field (format: DD/MM/YYYY)

Insurance Salesperson details:
- First Name, Code, Reporting Branch
- % Commission Split
- Signature(s), Date

CHECKLIST FOR SENIOR SALES UNIT MANAGER:
- Items 1-5 with checkboxes
- Existing Policy Numbers table (if applicable)
- Name of Reporting Line, Date, Signature
- Name of Senior Sales Unit Manager, Date, Signature
- Name of Customer Service Representative, Date, Signature

---

EXTRACTION RULES:

1. **Handwritten Fields:** Look very carefully at handwritten numbers (height, weight, dates, amounts)
2. **Checkboxes:** Note which boxes are checked (✓) vs unchecked
3. **Tables:** Read row by row, column by column - don't mix columns
4. **Family History:** NEVER mix living and deceased columns
5. **Health Questions:** Extract all Yes/No answers accurately
6. **Dates:** Format as DD/MM/YYYY
7. **Currency:** Include "MUR" for monetary amounts
8. **Percentages:** For beneficiaries, ensure total = 100%

---

**QUOTATION PAGE (if present in the PDF):**

The PDF may also contain a quotation/illustration page titled "NIC PROSPERITY PLAN - QUOTATION" or similar.

If this page is found, extract from the **KEY BENEFITS (MUR)** section:
- **Death Benefit:** [MUR amount]
- **Additional Death Benefit:** [MUR amount]
- **Accidental Death Benefit:** [MUR amount]
- **Total & Permanent Disability (TPD):** [MUR amount]
- **Critical Illness Benefit:** [MUR amount]
- **Loyalty Bonus:** [MUR amount]
- **Free Funeral Benefit:** [MUR amount]

Also extract from **PREMIUM DETAILS (MUR)** section:
- Basic Premium
- Additional Death Benefit Premium
- Accidental Death Benefit Premium
- Total & Permanent Disability (TPD) Premium
- Critical Illness Benefit Premium
- Total Premium

⚠️ **CRITICAL CALCULATION:**
**New Policy Sum Assured = Death Benefit + Additional Death Benefit**

This is the amount to use for the "Sum At Risk" field in the underwriting worksheet.

**PRIORITY RULE:** If quotation page values differ from proposal form PAGE 2 values, **ALWAYS USE QUOTATION PAGE VALUES** as they are the final approved amounts.

---

Format output in clear sections matching the form structure.`);

    extractBtn.disabled = true;
    loading1.style.display = 'block';
    result1.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/extract`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            extractedProposalData = data.extractedInfo;
            extractedContent.textContent = extractedProposalData;
            result1.style.display = 'block';
            
            // Check if we can enable generate button
            checkGenerateButton();
        } else {
            throw new Error(data.error || 'Extraction failed');
        }
    } catch (error) {
        extractedContent.textContent = `Error: ${error.message}`;
        result1.style.display = 'block';
    } finally {
        loading1.style.display = 'none';
        extractBtn.disabled = false;
    }
});

// Extract ECM data
extractEcmBtn.addEventListener('click', async () => {
    if (!selectedEcm) return;

    const formData = new FormData();
    formData.append('pdf', selectedEcm);
    formData.append('prompt', `Extract all existing policy information from this ECM Portfolio Report. 
    
CRITICAL: For each policy, extract:
1. Policy Number
2. Life Assured Name
3. Plan Name
4. Policy Status (Active/Expired/Lapsed/Paid-up/CFI/NPW)
5. Sum Assured (MUR amount)
6. Start Date
7. End Date
8. Premium Amount
9. Payment Frequency

Then calculate:
- Total Sum Assured for ALL ACTIVE policies only (exclude Expired, Lapsed, Paid-up, CFI, NPW)
- List each active policy with its sum assured
- Provide the aggregate total

Format as a structured list.`);

    extractEcmBtn.disabled = true;
    loading2.style.display = 'block';
    result2.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/extract`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            extractedEcmData = data.extractedInfo;
            ecmContent.textContent = extractedEcmData;
            result2.style.display = 'block';
            
            // Check if we can enable generate button
            checkGenerateButton();
        } else {
            throw new Error(data.error || 'ECM extraction failed');
        }
    } catch (error) {
        ecmContent.textContent = `Error: ${error.message}`;
        result2.style.display = 'block';
    } finally {
        loading2.style.display = 'none';
        extractEcmBtn.disabled = false;
    }
});

// Check if generate button should be enabled
function checkGenerateButton() {
    if (extractedProposalData && extractedEcmData) {
        generateBtn.disabled = false;
    }
}

// Generate DOCX worksheet
generateBtn.addEventListener('click', async () => {
    if (!extractedProposalData || !extractedEcmData) return;

    // Capture manual verification inputs
    const pepStatus = document.querySelector('input[name="pepStatus"]:checked').value;
    const pepComments = document.getElementById('pepComments').value.trim();
    const claimsAmount = parseFloat(document.getElementById('claimsAmount').value) || 0;
    const claimsComments = document.getElementById('claimsComments').value.trim();

    // Validate claims amount
    if (claimsAmount < 0) {
        alert('Claims amount cannot be negative');
        return;
    }

    generateBtn.disabled = true;
    loading3.style.display = 'block';
    result3.style.display = 'none';
    summaryResult.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/generate-docx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                proposalData: extractedProposalData,
                ecmData: extractedEcmData,
                manualVerification: {
                    pepStatus,
                    pepComments,
                    claimsAmount,
                    claimsComments
                }
            })
        });

        const data = await response.json();

        if (data.success) {
            // Store for download
            mappedDataGlobal = data.mappedData;
            underwriterSummaryGlobal = data.underwriterSummary;
            
            // Show results
            result3.style.display = 'block';
            
            // Display underwriter summary
            if (data.underwriterSummary) {
                summaryContent.textContent = data.underwriterSummary;
                summaryResult.style.display = 'block';
            }
        } else {
            throw new Error(data.error || 'Generation failed');
        }
    } catch (error) {
        console.error('Generation error:', error);
        alert('Error generating worksheet: ' + error.message);
    } finally {
        loading3.style.display = 'none';
        generateBtn.disabled = false;
    }
});

// Download DOCX
document.getElementById('downloadDocxBtn').addEventListener('click', async () => {
    if (!mappedDataGlobal) return;

    try {
        const response = await fetch(`${API_BASE_URL}/download-docx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                mappedData: mappedDataGlobal,
                underwriterSummary: underwriterSummaryGlobal || ''
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'underwriting_worksheet.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Failed to download DOCX');
        }
    } catch (error) {
        console.error('Error downloading DOCX:', error);
        alert('Error downloading DOCX: ' + error.message);
    }
});
