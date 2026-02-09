const { Document, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, TextRun, PageBreak, VerticalAlign, UnderlineType } = require('docx');

// Helper Functions
function extractValue(text, ...regexPatterns) {
  for (const regex of regexPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function calculateBMI(heightM, weightKg) {
  if (!heightM || !weightKg) return '';
  const bmi = weightKg / (heightM * heightM);
  return bmi.toFixed(1);
}

function calculateSumAtRisk(deathBenefit, additionalDeath) {
  const death = parseFloat(String(deathBenefit).replace(/,/g, '')) || 0;
  const additional = parseFloat(String(additionalDeath).replace(/,/g, '')) || 0;
  return (death + additional).toLocaleString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // Try to parse various date formats
  const patterns = [
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      if (pattern.source.includes('January')) {
        // Month name format
        const months = {
          'january': '01', 'february': '02', 'march': '03', 'april': '04',
          'may': '05', 'june': '06', 'july': '07', 'august': '08',
          'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };
        const day = match[1].padStart(2, '0');
        const month = months[match[2].toLowerCase()];
        const year = match[3];
        return `${day}/${month}/${year}`;
      } else {
        // Already in DD/MM/YYYY format
        return dateStr;
      }
    }
  }
  return dateStr;
}

// Parse Underwriter Summary into sections
function parseUnderwriterSummary(summaryText) {
  if (!summaryText) {
    return {
      familyHistory: '',
      bmiAlert: '',
      documentVerification: '',
      finalDecision: ''
    };
  }

  // Extract sections from the summary
  const familyHistoryMatch = summaryText.match(/(?:FAMILY HISTORY|Family History)[:\s]+(.*?)(?=\n\n|BMI|DOCUMENT|$)/is);
  const bmiAlertMatch = summaryText.match(/(⚠️.*?BMI.*?33.*?)(?=\n\n|DOCUMENT|$)/is);
  const docVerificationMatch = summaryText.match(/(?:DOCUMENT VERIFICATION|Document Verification)[:\s]+(.*?)(?=\n\n|FINAL|$)/is);
  const finalDecisionMatch = summaryText.match(/(?:FINAL DECISION|Final Decision)[:\s]+(.*?)$/is);

  return {
    familyHistory: familyHistoryMatch ? familyHistoryMatch[1].trim() : '',
    bmiAlert: bmiAlertMatch ? bmiAlertMatch[1].trim() : '',
    documentVerification: docVerificationMatch ? docVerificationMatch[1].trim() : '',
    finalDecision: finalDecisionMatch ? finalDecisionMatch[1].trim() : ''
  };
}

function parseExtractedInfo(extractedText) {
  // Parse the original extracted_info.txt for additional data
  const height = extractValue(extractedText, /Height\s*(\d+\.?\d*)\s*M/i, /Height.*?(\d+)\s*M\s*(\d+)\s*Cms/i);
  const weight = extractValue(extractedText, /Weight\s*(\d+)\s*Kgs/i);
  
  return {
    name: extractValue(extractedText, /Name:\*\*\s*(.+)/, /Applicant.*?:\s*Mr\.\s*(.+)/),
    dob: extractValue(extractedText, /Date of Birth:\*\*\s*(.+)/, /DOB:\s*(.+)/),
    anb: extractValue(extractedText, /Age.*?:\s*(\d+)\s*years/, /ANB:\s*(\d+)/),
    height: height,
    weight: weight,
    bmi: height && weight ? calculateBMI(parseFloat(height), parseFloat(weight)) : '',
    occupation: extractValue(extractedText, /Occupation:\*\*\s*(.+?)(?:,|\.)/, /Occupation:\s*(.+)/),
    proposalNo: extractValue(extractedText, /Proposal No\.?:\*\*\s*(.+)/, /Proposal\s*No\.?\s*(\d+)/),
    startDate: extractValue(extractedText, /Effective Date:\*\*\s*(.+)/, /Start Date:\s*(.+)/),
    planProposed: extractValue(extractedText, /Plan Name:\*\*\s*(.+)/, /Plan Proposed:\s*(.+)/),
    term: extractValue(extractedText, /Term of Policy:\*\*\s*(\d+)\s*years/, /Term:\s*(\d+)/),
    deathBenefit: extractValue(extractedText, /Death Benefit:\*\*\s*([\d,]+)/, /Death Benefit.*?([\d,]+)/),
    additionalDeath: extractValue(extractedText, /Additional Death Benefit:\*\*\s*([\d,]+)/, /Additional Death.*?([\d,]+)/),
    tpdPremium: extractValue(extractedText, /TPD.*?Rider:\s*MUR\s*([\d,.]+)/, /TPD.*?([\d,.]+)/),
    acdPremium: extractValue(extractedText, /Additional Death Benefit.*?Rider:\s*MUR\s*([\d,.]+)/, /Additional Death.*?([\d,.]+)/),
    ciPremium: extractValue(extractedText, /Critical Illness.*?Rider:\s*MUR\s*([\d,.]+)/, /Critical Illness.*?([\d,.]+)/),
    adbPremium: extractValue(extractedText, /Accidental Death Benefit:\*\*\s*([\d,.]+)/, /Accidental Death.*?([\d,.]+)/),
    totalPremium: extractValue(extractedText, /Total Monthly Premium:\*\*\s*MUR\s*([\d,.]+)/, /Total Monthly Premium.*?([\d,.]+)/),
    firstPaymentDate: extractValue(extractedText, /First Payment:\*\*\s*MUR.*?on\s*(.+?)\./, /First Payment.*?on\s*(.+)/),
    smoking: extractValue(extractedText, /Lifestyle:\*\*\s*Non-smoker/, /Non-smoker/) ? 'No' : 'Yes',
    alcohol: extractValue(extractedText, /non-drinker/, /Non-drinker/) ? 'No' : 'Yes',
    familyHistory: extractValue(extractedText, /Family History:\*\*\s*(.+?)(?=\*\*|$)/s, /Family History:\s*(.+)/),
  };
}

function generateUnderwritingWorksheet(mappedData, underwriterSummary = '') {
  // Parse both mapped data and extract additional info
  const mappedParsed = parseMappedData(mappedData);
  const extractedParsed = parseExtractedInfo(mappedData);
  
  // Parse underwriter summary sections
  const summaryData = parseUnderwriterSummary(underwriterSummary);
  
  // Merge data with preference to mapped data, fallback to extracted
  const data = {
    startDate: formatDate(mappedParsed.startDate || extractedParsed.startDate),
    proposalNo: mappedParsed.proposalNo || extractedParsed.proposalNo,
    planProposed: mappedParsed.planProposed || extractedParsed.planProposed,
    term: mappedParsed.term || extractedParsed.term,
    sumAtRisk: mappedParsed.sumAtRisk || calculateSumAtRisk(extractedParsed.deathBenefit, extractedParsed.additionalDeath),
    gender: mappedParsed.gender || 'M',
    riders: {
      TPD: mappedParsed.riders.TPD || (extractedParsed.tpdPremium && parseFloat(extractedParsed.tpdPremium) > 0),
      ADB: mappedParsed.riders.ADB || (extractedParsed.adbPremium && parseFloat(extractedParsed.adbPremium) > 0),
      ACD: mappedParsed.riders.ACD || (extractedParsed.acdPremium && parseFloat(extractedParsed.acdPremium) > 0),
      FIB: mappedParsed.riders.FIB,
      ACB: mappedParsed.riders.ACB,
      CI: mappedParsed.riders.CI || (extractedParsed.ciPremium && parseFloat(extractedParsed.ciPremium) > 0),
    },
    name: (mappedParsed.name || extractedParsed.name).toUpperCase(),
    occupation: mappedParsed.occupation || extractedParsed.occupation,
    anb: mappedParsed.anb || extractedParsed.anb,
    bmi: mappedParsed.bmi || extractedParsed.bmi,
    smoking: mappedParsed.smoking || extractedParsed.smoking,
    alcohol: mappedParsed.alcohol || extractedParsed.alcohol,
    familyHistory: summaryData.familyHistory || mappedParsed.familyHistory || extractedParsed.familyHistory,
    totalSumAtRisk: mappedParsed.totalSumAtRisk || calculateSumAtRisk(extractedParsed.deathBenefit, extractedParsed.additionalDeath),
    totalMonthlyPremium: mappedParsed.totalMonthlyPremium || extractedParsed.totalPremium,
    dlp: mappedParsed.dlp || formatDate(extractedParsed.firstPaymentDate),
    monthsPaid: mappedParsed.monthsPaid || '1',
    listedAML: mappedParsed.listedAML || 'No',
    listedPEP: mappedParsed.listedPEP || 'No',
    referredCompliance: mappedParsed.referredCompliance || 'No',
    documents: mappedParsed.documents,
    remarks: mappedParsed.remarks || extractedParsed.familyHistory,
    // Add underwriter summary data
    bmiAlert: summaryData.bmiAlert,
    additionalRemarks: summaryData.documentVerification,
    exclusionRemarks: summaryData.finalDecision,
  };
  
  console.log('Merged data:', JSON.stringify(data, null, 2));
  
  const doc = new Document({
    sections: [
      // PAGE 1
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            text: "NICL UNDERWRITING WORKSHEET",
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            style: "heading1",
          }),
          
          // PLAN DETAILS Section Header
          new Paragraph({
            text: "PLAN DETAILS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            style: "heading2",
          }),
          
          // Plan Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              // Row 1
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "Start Date:", style: "small" })],
                    width: { size: 12, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: data.startDate || "___________", style: "small" })],
                    width: { size: 13, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Proposal No:", style: "small" })],
                    width: { size: 12, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: data.proposalNo || "___________", style: "small" })],
                    width: { size: 13, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Plan Proposed:", style: "small" })],
                    width: { size: 15, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: data.planProposed || "___________", style: "small" })],
                    width: { size: 20, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Term:", style: "small" })],
                    width: { size: 8, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: (data.term || "___") + " yrs", style: "small" })],
                    width: { size: 7, type: WidthType.PERCENTAGE }
                  }),
                ],
              }),
              // Row 2
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "Sum At Risk: MUR", style: "small" })],
                    width: { size: 18, type: WidthType.PERCENTAGE },
                    columnSpan: 2
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: data.sumAtRisk || "___________", style: "small" })],
                    width: { size: 15, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Gender: M/F", style: "small" })],
                    width: { size: 12, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: data.gender || "M", style: "small" })],
                    width: { size: 8, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ 
                      children: [
                        new TextRun({ text: "Riders: " }),
                        new TextRun({ text: data.riders.TPD ? "☑" : "☐" }),
                        new TextRun({ text: " TPD  " }),
                        new TextRun({ text: data.riders.ADB ? "☑" : "☐" }),
                        new TextRun({ text: " ADB  " }),
                        new TextRun({ text: data.riders.ACD ? "☑" : "☐" }),
                        new TextRun({ text: " ACD  " }),
                        new TextRun({ text: data.riders.FIB ? "☑" : "☐" }),
                        new TextRun({ text: " FIB  " }),
                        new TextRun({ text: data.riders.ACB ? "☑" : "☐" }),
                        new TextRun({ text: " ACB  " }),
                        new TextRun({ text: data.riders.CI ? "☑" : "☐" }),
                        new TextRun({ text: " CI" }),
                      ]
                    })],
                    width: { size: 47, type: WidthType.PERCENTAGE },
                    columnSpan: 3
                  }),
                ],
              }),
            ],
          }),
          
          new Paragraph({ text: "", spacing: { after: 200 } }),
          
          // PERSONAL DETAILS Header
          new Paragraph({
            text: "PERSONAL DETAILS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
            style: "heading2",
          }),
          
          // Personal Details Table (2 columns)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "1st Life Assured", alignment: AlignmentType.CENTER, style: "heading3" })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "2nd Life Assured", alignment: AlignmentType.CENTER, style: "heading3" })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                ],
              }),
              // Name Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Name: ${data.name || "___________________________"}`)] }),
                  new TableCell({ children: [new Paragraph("Name: ___________________________")] }),
                ],
              }),
              // Occupation Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Occupation: ${data.occupation || "___________________________"}`)] }),
                  new TableCell({ children: [new Paragraph("Occupation: ___________________________")] }),
                ],
              }),
              // ANB & BMI Row with BMI Alert
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [
                      new Paragraph(`ANB: ${data.anb || "___"}    BMI: ${data.bmi || "___"}`),
                      ...(data.bmiAlert ? [new Paragraph({ 
                        text: data.bmiAlert, 
                        style: "alert"
                      })] : [])
                    ] 
                  }),
                  new TableCell({ children: [new Paragraph("ANB: ___    BMI: ___")] }),
                ],
              }),
              // Habits Row
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({
                      children: [
                        new TextRun({ text: "Habits: Smoking: " }),
                        new TextRun({ text: data.smoking === 'No' ? "☑" : "☐" }),
                        new TextRun({ text: "No " }),
                        new TextRun({ text: data.smoking === 'Yes' ? "☑" : "☐" }),
                        new TextRun({ text: "Yes    Alcohol: " }),
                        new TextRun({ text: data.alcohol === 'No' ? "☑" : "☐" }),
                        new TextRun({ text: "No " }),
                        new TextRun({ text: data.alcohol === 'Yes' ? "☑" : "☐" }),
                        new TextRun({ text: "Yes" }),
                      ]
                    })] 
                  }),
                  new TableCell({ 
                    children: [new Paragraph({
                      children: [
                        new TextRun({ text: "Smoking: ☐No ☐Yes    Alcohol: ☐No ☐Yes" }),
                      ]
                    })] 
                  }),
                ],
              }),
              // Family History Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Family History: ${data.familyHistory || "___________________________"}`)] }),
                  new TableCell({ children: [new Paragraph("Family History: ___________________________")] }),
                ],
              }),
              // Previous Cover Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Previous Cover: ☐OR  ☐UPR/Exclu  ☐Post/Declined")] }),
                  new TableCell({ children: [new Paragraph("Previous Cover: ☐OR  ☐UPR/Exclu  ☐Post/Declined")] }),
                ],
              }),
              // Previous Decision Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Previous decision: ___________________________")] }),
                  new TableCell({ children: [new Paragraph("Previous decision: ___________________________")] }),
                ],
              }),
              // Total Sum at Risk Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Total Sum at Risk: MUR ${data.totalSumAtRisk || "___________"}`)] }),
                  new TableCell({ children: [new Paragraph("Total Sum at Risk: MUR ___________")] }),
                ],
              }),
            ],
          }),
          
          // Facultative/Und Opinion
          new Paragraph({ 
            text: "Facultative/Und Opinion    ☐Yes    ☐No", 
            spacing: { before: 100, after: 200 } 
          }),
          
          // UNDERWRITING REQUIREMENTS
          new Paragraph({
            text: "UNDERWRITING REQUIREMENTS:",
            spacing: { after: 100 },
            style: "heading3",
          }),
          new Paragraph({ text: "☐MER  ☐RBS  ☐RBSC  ☐GGT  ☐HbA1c    ☐MER  ☐RBS  ☐RBSC  ☐GGT  ☐HbA1c", spacing: { after: 50 } }),
          new Paragraph({ text: "☐Lipids  ☐FBS  ☐LFT  ☐R ECG  ☐R ECG    ☐Lipids  ☐FBS  ☐LFT  ☐R ECG", spacing: { after: 50 } }),
          new Paragraph({ text: "☐Cardiologist Evaluation inclu ECHO  ☐Stress ECG    ☐Cardiologist Evaluation inclu ECHO  ☐Stress ECG", spacing: { after: 50 } }),
          new Paragraph({ text: "☐Others (specify)_______________________    ☐Others (specify)_______________________", spacing: { after: 50 } }),
          new Paragraph({ text: "Questionnaire(s):_______________________    Questionnaire(s):_______________________", spacing: { after: 200 } }),
          
          // Payment details
          new Paragraph({
            text: "Payment details",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            style: "heading3",
          }),
          new Paragraph({ text: `Total Monthly Premium (Including new): MUR ${data.totalMonthlyPremium || '............................'}     DLP: ${data.dlp || '......................'}     No. Of Months Paid: ${data.monthsPaid || '..........'}`, spacing: { after: 200 } }),
          
          // AML/CFT & Compliance
          new Paragraph({ text: `Listed on AML/CFT platform: 1st Life Assured: ${data.listedAML}     2nd Life Assured: Yes/No     Beneficiary: Yes/No`, spacing: { after: 50 } }),
          new Paragraph({ text: `CRA Weighted Score: ..........  CRA Risk Score: ......     CRA Risk Score: ......  Referred to Compliance: ${data.referredCompliance}`, spacing: { after: 50 } }),
          new Paragraph({ text: `Listed as PEP: Owner Yes/No     1st Life Assured ${data.listedPEP}     2nd Life Assured: Yes/No     Beneficiary Yes/No`, spacing: { after: 200 } }),
          
          // Documents Required
          new Paragraph({
            text: "Documents Required                    KYC Check for Self Employed / Owner is Company (Tick where applicable)",
            spacing: { after: 100 },
            style: "heading3",
          }),
          new Paragraph({ text: `EDD Form                ☐         Trade license                    ${data.documents.tradeLicense ? '☑' : '☐'}         Memorandum of Association      ☐`, spacing: { after: 50 } }),
          new Paragraph({ text: `Financial Questionnaire ☐         BRN                              ${data.documents.brn ? '☑' : '☐'}         Board of Resolution            ☐`, spacing: { after: 50 } }),
          new Paragraph({ text: `Others ................. ☐         Cert of Incorporation            ☐         Last Audited Accounts          ☐`, spacing: { after: 200 } }),
          
          // Medical Examination
          new Paragraph({
            text: "MEDICAL EXAMINATION & LAB REPORT(S)",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            style: "heading3",
          }),
          new Paragraph({ text: `                    1st Life Assured                                                    2nd Life Assured`, spacing: { after: 50 } }),
          new Paragraph({ text: `Examiner Ref: ................................................ Date: ...../...../...........     Examiner Ref: ................................................ Date: ...../...../...........`, spacing: { after: 50 } }),
          new Paragraph({ text: `Lab Report: ................................................ Date: ...../...../...........     Lab Report: ................................................ Date: ...../...../...........`, spacing: { after: 50 } }),
          new Paragraph({ text: `Remarks: ${data.remarks || '...............................................................................................................................................................................................'}`, spacing: { after: 50 } }),
          new Paragraph({ text: `...............................................................................................................................................................................................`, spacing: { after: 50 } }),
          new Paragraph({ text: `...............................................................................................................................................................................................`, spacing: { after: 100 } }),
          
          new Paragraph({ text: `Document Name: Underwriting Worksheet                                                                                                                    Page 1 of 2`, spacing: { after: 50 } }),
          new Paragraph({ text: `Ref. & Version: LUW F002V2                                                                                                                    Released on: 28.10.2020` }),
        ],
      },
      // PAGE 2
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          new Paragraph({
            text: "NICL UNDERWRITING WORKSHEET",
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 400 },
            style: "heading1",
          }),
          
          new Paragraph({
            text: "MEDICAL ATTENDANT REPORT/QUESTIONNAIRE/ ECG INTERPRETATION:",
            spacing: { after: 100 },
            style: "heading3",
          }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 200 } }),
          
          // Additional Remarks - Document Verification Checklist
          new Paragraph({ 
            text: "Additional Remarks:", 
            spacing: { after: 100 },
            style: "heading3",
          }),
          new Paragraph({ 
            text: data.additionalRemarks || "...............................................................................................................................................................................................", 
            spacing: { after: 50 } 
          }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 200 } }),
          
          new Paragraph({
            text: "COMPUTATION OF RATINGS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            style: "heading2",
          }),
          
          // Computation Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "1st Life Assured", alignment: AlignmentType.CENTER })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "2nd Life Assured", alignment: AlignmentType.CENTER })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Impairments: ...............................................................")] }),
                  new TableCell({ children: [new Paragraph("Impairments: ...............................................................")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [
                      new Paragraph("DETAILS                                    EM %"),
                      new Paragraph("............................................................ ............................."),
                      new Paragraph("............................................................ ............................."),
                      new Paragraph("............................................................ ............................."),
                    ] 
                  }),
                  new TableCell({ 
                    children: [
                      new Paragraph("DETAILS                                    EM %"),
                      new Paragraph("............................................................ ............................."),
                      new Paragraph("............................................................ ............................."),
                      new Paragraph("............................................................ ............................."),
                    ] 
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Riders: ...............................................................")] }),
                  new TableCell({ children: [new Paragraph("Riders: ...............................................................")] }),
                ],
              }),
            ],
          }),
          
          new Paragraph({ text: "", spacing: { after: 200 } }),
          
          // UNDERWRITING DECISION
          new Paragraph({
            text: "UNDERWRITING DECISION",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            style: "heading2",
          }),
          
          // Decision Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")], width: { size: 20, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ text: "STD RATES", alignment: AlignmentType.CENTER })], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph({ text: "UPRATED", alignment: AlignmentType.CENTER })], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph({ text: "POSTPONED", alignment: AlignmentType.CENTER })], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph({ text: "DECLINED", alignment: AlignmentType.CENTER })], columnSpan: 2 }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph({ text: "1st Life", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "2nd Life", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "1st Life", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "2nd Life", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "1st Life", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "2nd Life", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "1st Life", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: "2nd Life", alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Life Cover")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Additional Death")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("TPD / WOP")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Accidental Death")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Family Inc Ben")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("ACB/ CI")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                  new TableCell({ children: [new Paragraph("☐")] }),
                ],
              }),
            ],
          }),
          
          new Paragraph({ text: "", spacing: { after: 100 } }),
          
          // Exclusion/Remarks - Final Decision Summary
          new Paragraph({ 
            text: "Exclusion/ Remarks:", 
            spacing: { after: 100 },
            style: "heading3",
          }),
          new Paragraph({ 
            text: data.exclusionRemarks || "...............................................................................................................................................................................................", 
            spacing: { after: 50 } 
          }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 200 } }),
          
          // Signatures
          new Paragraph({ text: "Underwritten by: ............................................................... Signature: ............................................................... Date: ...............................", spacing: { after: 100 } }),
          new Paragraph({ text: "Approved by: ............................................................... Signature: ............................................................... Date: ...............................", spacing: { after: 200 } }),
          
          // Footer Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Non-Medical (Std)", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Medical (Std)", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Non-Medical (SUB Cases)", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Team Leader", style: "small" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Up to MUR 5M- Underwriter", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Up to MUR 5M- Underwriter", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Upto +150%EM – Approved by TL", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "All Postponed/ Declined cases", style: "small" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Up to MUR 8M- S Underwriter", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Up to MUR 8M- S Underwriter", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Upto +250%EM – Approved by TL/SM", style: "small" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Approve cases of Underwriter & S Underwriter", style: "small" })] }),
                ],
              }),
            ],
          }),
          
          new Paragraph({ text: "", spacing: { after: 100 } }),
          new Paragraph({ text: "Document Name: Underwriting Worksheet                                                                                                                    Page 2 of 2" }),
          new Paragraph({ text: "Ref. & Version: LUW F002V2                                                                                                                    Released on: 28.10.2020" }),
        ],
      },
    ],
  });
  
  return doc;
}

function parseMappedData(mappedText) {
  const data = {
    startDate: extractValue(mappedText, /Start Date:\*\*\s*(.+)/),
    proposalNo: extractValue(mappedText, /Proposal No\.:\*\*\s*(.+)/),
    planProposed: extractValue(mappedText, /Plan Proposed:\*\*\s*(.+)/),
    term: extractValue(mappedText, /Term:\*\*\s*(.+)/),
    sumAtRisk: extractValue(mappedText, /Sum At Risk.*?MUR:\*\*\s*(.+)/),
    gender: extractValue(mappedText, /Gender.*?:\*\*\s*([MF])/),
    riders: {
      TPD: mappedText.includes('TPD:** X') || mappedText.includes('TPD:** ☑'),
      ADB: mappedText.includes('ADB:** X') || mappedText.includes('ADB:** ☑'),
      ACD: mappedText.includes('ACD:** X') || mappedText.includes('ACD:** ☑'),
      FIB: mappedText.includes('FIB:** X') || mappedText.includes('FIB:** ☑'),
      ACB: mappedText.includes('ACB:** X') || mappedText.includes('ACB:** ☑'),
      CI: mappedText.includes('CI:** X') || mappedText.includes('CI:** ☑'),
    },
    name: extractValue(mappedText, /Name:\*\*\s*(.+)/),
    occupation: extractValue(mappedText, /Occupation:\*\*\s*(.+)/),
    anb: extractValue(mappedText, /ANB:\*\*\s*(\d+)/),
    bmi: extractValue(mappedText, /BMI:\*\*\s*([\d.]+)/),
    smoking: mappedText.includes('Smoking: No') ? 'No' : 'Yes',
    alcohol: mappedText.includes('Alcohol: No') ? 'No' : 'Yes',
    familyHistory: extractValue(mappedText, /Family History:\*\*\s*(.+?)(?=\n|$)/),
    totalSumAtRisk: extractValue(mappedText, /Total Sum at Risk.*?MUR\s*([\d,]+)/),
    totalMonthlyPremium: extractValue(mappedText, /Total Monthly Premium.*?MUR\s*([\d,.]+)/),
    dlp: extractValue(mappedText, /DLP:\*\*\s*(.+)/),
    monthsPaid: extractValue(mappedText, /No\. Of Months Paid:\*\*\s*(\d+)/),
    listedAML: extractValue(mappedText, /Listed on AML.*?:\s*(Yes|No)/),
    listedPEP: extractValue(mappedText, /Listed as PEP.*?:\s*(Yes|No)/),
    referredCompliance: extractValue(mappedText, /Referred to Compliance.*?:\s*(Yes|No)/),
    documents: {
      tradeLicense: mappedText.includes('Trade license:** X') || mappedText.includes('Trade license:** ☑'),
      brn: mappedText.includes('BRN:** X') || mappedText.includes('BRN:** ☑'),
    },
    remarks: extractValue(mappedText, /Additional Remarks:\*\*\s*(.+?)(?=\n\n|$)/s),
  };
  
  return data;
}

module.exports = { generateUnderwritingWorksheet };
