const { Document, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, TextRun, PageBreak } = require('docx');

function generateUnderwritingWorksheet(mappedData) {
  // Parse the mapped data to extract values
  const data = parseMappedData(mappedData);
  
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
            spacing: { after: 200 },
          }),
          
          // PLAN DETAILS Header
          new Paragraph({
            text: "PLAN DETAILS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          
          // Plan Details Row 1
          new Paragraph({
            children: [
              new TextRun({ text: `Start Date: ${data.startDate || '....................................'}  ` }),
              new TextRun({ text: `Proposal No: ${data.proposalNo || '....................................'}  ` }),
              new TextRun({ text: `Plan Proposed: ${data.planProposed || '....................................'}  ` }),
              new TextRun({ text: `Term: ${data.term || '.......'}yrs` }),
            ],
            spacing: { after: 100 },
          }),
          
          // Plan Details Row 2
          new Paragraph({
            children: [
              new TextRun({ text: `Sum At Risk: MUR ${data.sumAtRisk || '............................'}  ` }),
              new TextRun({ text: `Gender: M/F ${data.gender || '...'}  ` }),
              new TextRun({ text: `Riders: TPD ${data.riders.TPD ? '☑' : '☐'} ADB ${data.riders.ADB ? '☑' : '☐'} ACD ${data.riders.ACD ? '☑' : '☐'} FIB ${data.riders.FIB ? '☑' : '☐'} ACB ${data.riders.ACB ? '☑' : '☐'} CI ${data.riders.CI ? '☑' : '☐'}` }),
            ],
            spacing: { after: 200 },
          }),
          
          // PERSONAL DETAILS Header
          new Paragraph({
            text: "PERSONAL DETAILS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          
          // Personal Details Table Headers
          new Paragraph({
            children: [
              new TextRun({ text: "                    1st Life Assured                                                    2nd Life Assured" }),
            ],
            spacing: { after: 100 },
          }),
          
          new Paragraph({ text: `Name:           ${data.name || '...............................................................'}                    ...............................................................`, spacing: { after: 50 } }),
          new Paragraph({ text: `Occupation:     ${data.occupation || '...............................................................'}                    ...............................................................`, spacing: { after: 50 } }),
          new Paragraph({ text: `ANB:            ${data.anb || '...........................'}  BMI: ${data.bmi || '...........................'}     ANB: ...........................  BMI: ...........................`, spacing: { after: 50 } }),
          new Paragraph({ text: `Habits:         Smoking: ${data.smoking === 'No' ? '☑' : '☐'}No ${data.smoking === 'Yes' ? '☑' : '☐'}Yes  Alcohol: ${data.alcohol === 'No' ? '☑' : '☐'}No ${data.alcohol === 'Yes' ? '☑' : '☐'}Yes     Smoking: ☐No ☐Yes  Alcohol: ☐No ☐Yes`, spacing: { after: 50 } }),
          new Paragraph({ text: `Family History: ${data.familyHistory || '...............................................................'}`, spacing: { after: 50 } }),
          new Paragraph({ text: `Previous Cover:     ☐ OR        ☐ UPR/Exclu        ☐ Post/Declined     ☐ OR        ☐ UPR/Exclu        ☐ Post/Declined`, spacing: { after: 50 } }),
          new Paragraph({ text: `Previous decision:  ...............................................................     ...............................................................`, spacing: { after: 50 } }),
          new Paragraph({ text: `Total Sum at Risk:  MUR: ${data.totalSumAtRisk || '...............................................................'}     MUR: ...............................................................`, spacing: { after: 50 } }),
          new Paragraph({ text: `Facultative/Und Opinion     ☐Yes        ☐No`, spacing: { after: 200 } }),
          
          // UNDERWRITING REQUIREMENTS
          new Paragraph({
            text: "UNDERWRITING REQUIREMENTS:",
            spacing: { after: 100 },
          }),
          new Paragraph({ text: `☐MER    ☐RBS    ☐RBSC    ☐GGT    ☐HbA1c    ☐MER    ☐RBS    ☐RBSC    ☐GGT    ☐HbA1c`, spacing: { after: 50 } }),
          new Paragraph({ text: `☐Lipids    ☐FBS    ☐LFT    ☐R ECG    ☐R ECG    ☐Lipids    ☐FBS    ☐LFT    ☐R ECG`, spacing: { after: 50 } }),
          new Paragraph({ text: `☐Cardiologist Evaluation inclu ECHO    ☐Stress ECG    ☐Cardiologist Evaluation inclu ECHO    ☐Stress ECG`, spacing: { after: 50 } }),
          new Paragraph({ text: `☐Others (specify)...............................................................    ☐Others (specify)...............................................................`, spacing: { after: 50 } }),
          new Paragraph({ text: `Questionnaire(s):...............................................................    Questionnaire(s):...............................................................`, spacing: { after: 200 } }),
          
          // Payment details
          new Paragraph({
            text: "Payment details",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: `Total Monthly Premium (Including new): MUR ${data.totalMonthlyPremium || '............................'}     DLP: ${data.dlp || '......................'}     No. Of Months Paid: ${data.monthsPaid || '..........'}`, spacing: { after: 200 } }),
          
          // AML/CFT & Compliance
          new Paragraph({ text: `Listed on AML/CFT platform: 1st Life Assured: Yes/No     2nd Life Assured: Yes/No     Beneficiary: Yes/No`, spacing: { after: 50 } }),
          new Paragraph({ text: `CRA Weighted Score: ..........  CRA Risk Score: ......     CRA Risk Score: ......  Referred to Compliance: Yes/No`, spacing: { after: 50 } }),
          new Paragraph({ text: `Listed as PEP: Owner Yes/No     1st Life Assured Yes/No     2nd Life Assured: Yes/No     Beneficiary Yes/No`, spacing: { after: 200 } }),
          
          // Documents Required
          new Paragraph({
            text: "Documents Required                    KYC Check for Self Employed / Owner is Company (Tick where applicable)",
            spacing: { after: 100 },
          }),
          new Paragraph({ text: `EDD Form                ☐         Trade license                    ${data.documents.tradeLicense ? '☑' : '☐'}         Memorandum of Association      ☐`, spacing: { after: 50 } }),
          new Paragraph({ text: `Financial Questionnaire ☐         BRN                              ${data.documents.brn ? '☑' : '☐'}         Board of Resolution            ☐`, spacing: { after: 50 } }),
          new Paragraph({ text: `Others ................. ☐         Cert of Incorporation            ☐         Last Audited Accounts          ☐`, spacing: { after: 200 } }),
          
          // Medical Examination
          new Paragraph({
            text: "MEDICAL EXAMINATION & LAB REPORT(S)",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: `                    1st Life Assured                                                    2nd Life Assured`, spacing: { after: 50 } }),
          new Paragraph({ text: `Examiner Ref: ................................................ Date: ...../...../...........     Examiner Ref: ................................................ Date: ...../...../...........`, spacing: { after: 50 } }),
          new Paragraph({ text: `Lab Report: ................................................ Date: ...../...../...........     Lab Report: ................................................ Date: ...../...../...........`, spacing: { after: 50 } }),
          new Paragraph({ text: `Remarks: ${data.remarks || '...............................................................................................................................................................................................'}`, spacing: { after: 50 } }),
          new Paragraph({ text: `...............................................................................................................................................................................................`, spacing: { after: 50 } }),
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
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "MEDICAL ATTENDANT REPORT/QUESTIONNAIRE/ ECG INTERPRETATION:",
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 200 } }),
          new Paragraph({ text: "Additional Remarks: ...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 200 } }),
          new Paragraph({
            text: "COMPUTATION OF RATINGS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "                    1st Life Assured                                                    2nd Life Assured", spacing: { after: 50 } }),
          new Paragraph({ text: "Impairments: ...............................................................     Impairments: ...............................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "                    DETAILS                                    EM %                    DETAILS                                    EM %", spacing: { after: 50 } }),
          new Paragraph({ text: "............................................................ .............................     ............................................................ .............................", spacing: { after: 50 } }),
          new Paragraph({ text: "............................................................ .............................     ............................................................ .............................", spacing: { after: 50 } }),
          new Paragraph({ text: "............................................................ .............................     ............................................................ .............................", spacing: { after: 50 } }),
          new Paragraph({ text: "............................................................ .............................     ............................................................ .............................", spacing: { after: 50 } }),
          new Paragraph({ text: "Riders: ...............................................................                    Riders: ...............................................................", spacing: { after: 200 } }),
          new Paragraph({
            text: "UNDERWRITING DECISION",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({ text: "                    STD RATES                    UPRATED                    POSTPONED                    DECLINED", spacing: { after: 50 } }),
          new Paragraph({ text: "                    1st Life    2nd Life    1st Life    2nd Life    1st Life    2nd Life    1st Life    2nd Life", spacing: { after: 50 } }),
          new Paragraph({ text: "Life Cover          ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........", spacing: { after: 50 } }),
          new Paragraph({ text: "Additional Death    ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........", spacing: { after: 50 } }),
          new Paragraph({ text: "TPD / WOP           ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........", spacing: { after: 50 } }),
          new Paragraph({ text: "Accidental Death    ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........", spacing: { after: 50 } }),
          new Paragraph({ text: "Family Inc Ben      ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........", spacing: { after: 50 } }),
          new Paragraph({ text: "ACB/ CI             ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........  ☐ ......... ☐ .........", spacing: { after: 100 } }),
          new Paragraph({ text: "Exclusion/ Remarks: ...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 50 } }),
          new Paragraph({ text: "...............................................................................................................................................................................................", spacing: { after: 200 } }),
          new Paragraph({ text: "Underwritten by: ............................................................... Signature: ............................................................... Date: ...............................", spacing: { after: 100 } }),
          new Paragraph({ text: "Approved by: ............................................................... Signature: ............................................................... Date: ...............................", spacing: { after: 200 } }),
          new Paragraph({ text: "Non-Medical (Std)                    Medical (Std)                    Non-Medical (SUB Cases)                    Team Leader", spacing: { after: 50 } }),
          new Paragraph({ text: "Up to MUR 5M- Underwriter           Up to MUR 5M- Underwriter        Upto +150%EM – Approved by TL              All Postponed/ Declined cases", spacing: { after: 50 } }),
          new Paragraph({ text: "Up to MUR 8M- S Underwriter         Up to MUR 8M- S Underwriter      Upto +250%EM – Approved by TL/SM           Approve cases of Underwriter & S Underwriter", spacing: { after: 200 } }),
          new Paragraph({ text: "Document Name: Underwriting Worksheet                                                                                                                    Page 2 of 2" }),
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

function extractValue(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

module.exports = { generateUnderwritingWorksheet };
