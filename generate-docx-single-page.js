const { Document, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, TextRun, convertInchesToTwip, ShadingType } = require('docx');

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
  const patterns = [
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      if (pattern.source.includes('January')) {
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
        return dateStr;
      }
    }
  }
  return dateStr;
}

function parseExtractedInfo(extractedText) {
  const height = extractValue(extractedText, /Height\s*(\d+\.?\d*)\s*M/i);
  const weight = extractValue(extractedText, /Weight\s*(\d+)\s*Kgs/i);
  
  return {
    name: extractValue(extractedText, /Name:\*\*\s*(.+?)(?:\n|\*)/, /Applicant.*?:\s*(.+?)(?:\n|$)/),
    anb: extractValue(extractedText, /Age.*?:\s*(\d+)\s*years/, /ANB:\s*(\d+)/),
    height: height,
    weight: weight,
    bmi: height && weight ? calculateBMI(parseFloat(height), parseFloat(weight)) : '',
    occupation: extractValue(extractedText, /Occupation:\*\*\s*(.+?)(?:,|\n)/, /Occupation:\s*(.+?)(?:,|\n)/),
    proposalNo: extractValue(extractedText, /Proposal No\.?:\*\*\s*(.+?)(?:\n|$)/, /Proposal\s*No\.?\s*(\d+)/),
    startDate: extractValue(extractedText, /Effective Date:\*\*\s*(.+?)(?:\n|$)/, /Start Date:\s*(.+?)(?:\n|$)/),
    planProposed: extractValue(extractedText, /Plan Name:\*\*\s*(.+?)(?:\n|$)/, /Plan Proposed:\s*(.+?)(?:\n|$)/),
    term: extractValue(extractedText, /Term of Policy:\*\*\s*(\d+)\s*years/, /Term:\s*(\d+)/),
    deathBenefit: extractValue(extractedText, /Death Benefit:\*\*\s*([\d,]+)/, /Death Benefit.*?([\d,]+)/),
    additionalDeath: extractValue(extractedText, /Additional Death Benefit:\*\*\s*([\d,]+)/, /Additional Death.*?([\d,]+)/),
    tpdPremium: extractValue(extractedText, /TPD.*?Rider:\s*MUR\s*([\d,.]+)/, /TPD.*?([\d,.]+)/),
    acdPremium: extractValue(extractedText, /Additional Death Benefit.*?Rider:\s*MUR\s*([\d,.]+)/),
    ciPremium: extractValue(extractedText, /Critical Illness.*?Rider:\s*MUR\s*([\d,.]+)/),
    adbPremium: extractValue(extractedText, /Accidental Death Benefit:\*\*\s*([\d,.]+)/),
    totalPremium: extractValue(extractedText, /Total Monthly Premium:\*\*\s*MUR\s*([\d,.]+)/),
    firstPaymentDate: extractValue(extractedText, /First Payment:\*\*\s*MUR.*?on\s*(.+?)(?:\.|$)/),
    smoking: extractValue(extractedText, /Non-smoker/) ? 'No' : 'Yes',
    alcohol: extractValue(extractedText, /non-drinker/) ? 'No' : 'Yes',
    familyHistory: extractValue(extractedText, /Family History:\*\*\s*(.+?)(?=\*\*|$)/s),
  };
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
    smoking: mappedText.match(/Smoking\s*(?:status)?.*?:\*?\*?\s*No/i) ? 'No' : 'Yes',
    alcohol: mappedText.match(/Alcohol\s*(?:status)?.*?:\*?\*?\s*No/i) ? 'No' : 'Yes',
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

// Create compact cell helper
function createCell(text, options = {}) {
  return new TableCell({
    children: [new Paragraph({
      text: text,
      spacing: { before: 20, after: 20 },
    })],
    margins: {
      top: convertInchesToTwip(0.02),
      bottom: convertInchesToTwip(0.02),
      left: convertInchesToTwip(0.05),
      right: convertInchesToTwip(0.05),
    },
    ...options
  });
}

function generateUnderwritingWorksheet(mappedData) {
  const mappedParsed = parseMappedData(mappedData);
  const extractedParsed = parseExtractedInfo(mappedData);
  
  const data = {
    startDate: formatDate(mappedParsed.startDate || extractedParsed.startDate),
    proposalNo: mappedParsed.proposalNo || extractedParsed.proposalNo,
    planProposed: mappedParsed.planProposed || extractedParsed.planProposed,
    term: mappedParsed.term || extractedParsed.term,
    sumAtRisk: mappedParsed.totalSumAtRisk || mappedParsed.sumAtRisk || calculateSumAtRisk(extractedParsed.deathBenefit, extractedParsed.additionalDeath),
    gender: mappedParsed.gender || 'M',
    riders: {
      TPD: mappedParsed.riders?.TPD || (extractedParsed.tpdPremium && parseFloat(extractedParsed.tpdPremium) > 0),
      ADB: mappedParsed.riders?.ADB || (extractedParsed.adbPremium && parseFloat(extractedParsed.adbPremium) > 0),
      ACD: mappedParsed.riders?.ACD || (extractedParsed.acdPremium && parseFloat(extractedParsed.acdPremium) > 0),
      FIB: mappedParsed.riders?.FIB || false,
      ACB: mappedParsed.riders?.ACB || false,
      CI: mappedParsed.riders?.CI || (extractedParsed.ciPremium && parseFloat(extractedParsed.ciPremium) > 0),
    },
    name: (mappedParsed.name || extractedParsed.name || '').toUpperCase(),
    occupation: mappedParsed.occupation || extractedParsed.occupation,
    anb: mappedParsed.anb || extractedParsed.anb,
    bmi: mappedParsed.bmi || extractedParsed.bmi,
    smoking: mappedParsed.smoking || extractedParsed.smoking,
    alcohol: mappedParsed.alcohol || extractedParsed.alcohol,
    familyHistory: mappedParsed.familyHistory || extractedParsed.familyHistory,
    totalSumAtRisk: mappedParsed.totalSumAtRisk || calculateSumAtRisk(extractedParsed.deathBenefit, extractedParsed.additionalDeath),
    totalMonthlyPremium: mappedParsed.totalMonthlyPremium || extractedParsed.totalPremium,
    dlp: mappedParsed.dlp || formatDate(extractedParsed.firstPaymentDate),
    monthsPaid: mappedParsed.monthsPaid || '1',
    listedAML: mappedParsed.listedAML || 'No',
    listedPEP: mappedParsed.listedPEP || 'No',
    referredCompliance: mappedParsed.referredCompliance || 'No',
    documents: {
      tradeLicense: mappedParsed.documents?.tradeLicense || extractedParsed.occupation?.toLowerCase().includes('business'),
      brn: mappedParsed.documents?.brn || extractedParsed.occupation?.toLowerCase().includes('business'),
    },
    remarks: mappedParsed.remarks || extractedParsed.familyHistory,
  };
  
  console.log('Merged data:', JSON.stringify(data, null, 2));
  
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  };
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.4),
            right: convertInchesToTwip(0.4),
            bottom: convertInchesToTwip(0.4),
            left: convertInchesToTwip(0.4),
          },
        },
      },
      children: [
        // Title
        new Paragraph({
          text: "NICL UNDERWRITING WORKSHEET",
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          style: "Heading1",
        }),
        
        // PLAN DETAILS Header
        new Paragraph({
          text: "PLAN DETAILS",
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          style: "Heading2",
        }),
        
        // Plan Details Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              height: { value: convertInchesToTwip(0.2), rule: "atLeast" },
              children: [
                createCell("Start Date:", { width: { size: 10, type: WidthType.PERCENTAGE } }),
                createCell(data.startDate || ".....................", { width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell("Proposal No:", { width: { size: 12, type: WidthType.PERCENTAGE } }),
                createCell(data.proposalNo || ".....................", { width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell("Plan Proposed:", { width: { size: 13, type: WidthType.PERCENTAGE } }),
                createCell(data.planProposed || ".....................", { width: { size: 20, type: WidthType.PERCENTAGE } }),
                createCell("Term:", { width: { size: 7, type: WidthType.PERCENTAGE } }),
                createCell((data.term || "...") + " yrs", { width: { size: 8, type: WidthType.PERCENTAGE } }),
              ],
            }),
            new TableRow({
              height: { value: convertInchesToTwip(0.2), rule: "atLeast" },
              children: [
                createCell("Sum At Risk: MUR", { width: { size: 18, type: WidthType.PERCENTAGE }, columnSpan: 2 }),
                createCell(data.sumAtRisk || ".....................", { width: { size: 15, type: WidthType.PERCENTAGE } }),
                createCell("Gender: M/F", { width: { size: 12, type: WidthType.PERCENTAGE } }),
                createCell(data.gender || "M", { width: { size: 8, type: WidthType.PERCENTAGE } }),
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: "Riders: ", size: 16 }),
                      new TextRun({ text: data.riders.TPD ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: " TPD ", size: 16 }),
                      new TextRun({ text: data.riders.ADB ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: " ADB ", size: 16 }),
                      new TextRun({ text: data.riders.ACD ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: " ACD ", size: 16 }),
                      new TextRun({ text: data.riders.FIB ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: " FIB ", size: 16 }),
                      new TextRun({ text: data.riders.ACB ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: " ACB ", size: 16 }),
                      new TextRun({ text: data.riders.CI ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: " CI", size: 16 }),
                    ],
                    spacing: { before: 20, after: 20 }
                  })],
                  width: { size: 43, type: WidthType.PERCENTAGE },
                  columnSpan: 3,
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
              ],
            }),
          ],
        }),
        
        new Paragraph({ text: "", spacing: { after: 60 } }),
        
        // PERSONAL DETAILS Header
        new Paragraph({
          text: "PERSONAL DETAILS",
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          style: "Heading2",
        }),
        
        // Personal Details Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              children: [
                createCell("1st Life Assured", { width: { size: 50, type: WidthType.PERCENTAGE } }),
                createCell("2nd Life Assured", { width: { size: 50, type: WidthType.PERCENTAGE } }),
              ],
            }),
            new TableRow({
              children: [
                createCell(`Name: ${data.name || ".........................................."}`),
                createCell("Name: .........................................."),
              ],
            }),
            new TableRow({
              children: [
                createCell(`Occupation: ${data.occupation || ".........................................."}`),
                createCell("Occupation: .........................................."),
              ],
            }),
            new TableRow({
              children: [
                createCell(`ANB: ${data.anb || "..."}    BMI: ${data.bmi || "..."}`),
                createCell("ANB: ...    BMI: ..."),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [
                      new TextRun({ text: "Habits: Smoking: ", size: 16 }),
                      new TextRun({ text: data.smoking === 'No' ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: "No ", size: 16 }),
                      new TextRun({ text: data.smoking === 'Yes' ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: "Yes  Alcohol: ", size: 16 }),
                      new TextRun({ text: data.alcohol === 'No' ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: "No ", size: 16 }),
                      new TextRun({ text: data.alcohol === 'Yes' ? "☑" : "☐", size: 16 }),
                      new TextRun({ text: "Yes", size: 16 }),
                    ],
                    spacing: { before: 20, after: 20 }
                  })],
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
                createCell("Smoking: ☐No ☐Yes  Alcohol: ☐No ☐Yes"),
              ],
            }),
            new TableRow({
              children: [
                createCell(`Family History: ${data.familyHistory || ".........................................."}`),
                createCell("Family History: .........................................."),
              ],
            }),
            new TableRow({
              children: [
                createCell("Previous Cover: ☐OR  ☐UPRATED  ☐Post/Declined"),
                createCell("Previous Cover: ☐OR  ☐UPR/Exclu  ☐Post/Declined"),
              ],
            }),
            new TableRow({
              children: [
                createCell("Previous decision: .........................................."),
                createCell("Previous decision: .........................................."),
              ],
            }),
            new TableRow({
              children: [
                createCell(`Total Sum at Risk: MUR ${data.totalSumAtRisk || ".........................................."}`),
                createCell("Total Sum at Risk: MUR .........................................."),
              ],
            }),
          ],
        }),
        
        new Paragraph({ 
          text: "Facultative/Und Opinion    ☐Yes    ☐No", 
          spacing: { before: 60, after: 60 } 
        }),
        
        // Payment details
        new Paragraph({
          text: "Payment details",
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          style: "Heading3",
        }),
        
        // Payment Details Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              children: [
                createCell(`Total Monthly Premium (Including new): MUR ${data.totalMonthlyPremium || '......................'}`, { width: { size: 50, type: WidthType.PERCENTAGE } }),
                createCell(`DLP: ${data.dlp || '..................'}`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell(`No. Of Months Paid: ${data.monthsPaid || '........'}`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
              ],
            }),
            new TableRow({
              children: [
                createCell(`Listed on AML/CFT platform: 1st Life Assured: Yes/No`, { width: { size: 33, type: WidthType.PERCENTAGE } }),
                createCell(`2nd Life Assured: Yes/No`, { width: { size: 33, type: WidthType.PERCENTAGE } }),
                createCell(`Beneficiary: Yes/No`, { width: { size: 34, type: WidthType.PERCENTAGE } }),
              ],
            }),
            new TableRow({
              children: [
                createCell(`CRA Weighted Score: ........`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell(`CRA Risk Score: ....`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell(`CRA Risk Score: ....`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell(`Referred to Compliance: Yes/No`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
              ],
            }),
            new TableRow({
              children: [
                createCell(`Listed as PEP: Owner Yes/No`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell(`1st Life Assured Yes/No`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell(`2nd Life Assured: Yes/No`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
                createCell(`Beneficiary Yes/No`, { width: { size: 25, type: WidthType.PERCENTAGE } }),
              ],
            }),
          ],
        }),
        
        new Paragraph({ text: "", spacing: { after: 60 } }),
        
        // Documents Required
        new Paragraph({
          text: "Documents Required                    KYC Check for Self Employed / Owner is Company (Tick where applicable)",
          spacing: { after: 40 },
        }),
        new Paragraph({ 
          text: `EDD Form                ☐         Trade license                    ${data.documents.tradeLicense ? '☑' : '☐'}         Memorandum of Association      ☐`, 
          spacing: { after: 30 } 
        }),
        new Paragraph({ 
          text: `Financial Questionnaire ☐         BRN                              ${data.documents.brn ? '☑' : '☐'}         Board of Resolution            ☐`, 
          spacing: { after: 30 } 
        }),
        new Paragraph({ 
          text: `Others ................. ☐         Cert of Incorporation            ☐         Last Audited Accounts          ☐`, 
          spacing: { after: 60 } 
        }),
        
        // UNDERWRITING DECISION Header with dark background
        new Paragraph({
          text: "UNDERWRITING DECISION",
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          shading: {
            type: ShadingType.SOLID,
            color: "808080",
          },
        }),
        
        // Underwriting Decision Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            // Header Row
            new TableRow({
              children: [
                createCell("", { width: { size: 12, type: WidthType.PERCENTAGE } }),
                new TableCell({
                  children: [new Paragraph({ text: "STD RATES", alignment: AlignmentType.CENTER })],
                  columnSpan: 2,
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "UPRATED", alignment: AlignmentType.CENTER })],
                  columnSpan: 2,
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "POSTPONED", alignment: AlignmentType.CENTER })],
                  columnSpan: 2,
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ text: "DECLINED", alignment: AlignmentType.CENTER })],
                  columnSpan: 2,
                  width: { size: 22, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
              ],
            }),
            // Sub-header Row
            new TableRow({
              children: [
                createCell("", { width: { size: 12, type: WidthType.PERCENTAGE } }),
                createCell("1st Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
                createCell("2nd Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
                createCell("1st Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
                createCell("2nd Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
                createCell("1st Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
                createCell("2nd Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
                createCell("1st Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
                createCell("2nd Life", { width: { size: 11, type: WidthType.PERCENTAGE } }),
              ],
            }),
            // Life Cover Row
            new TableRow({
              children: [
                createCell("Life Cover"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
              ],
            }),
            // Additional Death Row
            new TableRow({
              children: [
                createCell("Additional Death"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
              ],
            }),
            // TPD/WOP Row
            new TableRow({
              children: [
                createCell("TPD/WOP"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
              ],
            }),
            // Accidental Death Row
            new TableRow({
              children: [
                createCell("Accidental Death"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
              ],
            }),
            // Family Inc Ben Row
            new TableRow({
              children: [
                createCell("Family Inc Ben"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
              ],
            }),
            // ACB/CI Row
            new TableRow({
              children: [
                createCell("ACB/CI"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
                createCell("☐"), createCell("☐"),
              ],
            }),
          ],
        }),
        
        new Paragraph({ text: "", spacing: { after: 60 } }),
        
        // Signature Section
        new Paragraph({ 
          text: `Underwritten by: ................................................ Signature: ................................................ Date: ................................`, 
          spacing: { after: 40 } 
        }),
        new Paragraph({ 
          text: `Approved by: ................................................ Signature: ................................................ Date: ................................`, 
          spacing: { after: 60 } 
        }),
        
        // Notes Section Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ text: "Non-Medical (Std)", spacing: { before: 20, after: 10 } }),
                    new Paragraph({ text: "Up to MUR 5M: Underwriter", spacing: { before: 0, after: 10 } }),
                    new Paragraph({ text: "Up to MUR 8M: S Underwriter", spacing: { before: 0, after: 20 } }),
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: "Medical (Std)", spacing: { before: 20, after: 10 } }),
                    new Paragraph({ text: "Up to MUR 5M: Underwriter", spacing: { before: 0, after: 10 } }),
                    new Paragraph({ text: "Up to MUR 8M: S Underwriter", spacing: { before: 0, after: 20 } }),
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: "Non-Medical (SUS Cases)", spacing: { before: 20, after: 10 } }),
                    new Paragraph({ text: "Upto +150%EM = Approved by TL", spacing: { before: 0, after: 10 } }),
                    new Paragraph({ text: "Upto +250%EM = Approved by HoU & TL/SM", spacing: { before: 0, after: 20 } }),
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: "Team Leader", spacing: { before: 20, after: 10 } }),
                    new Paragraph({ text: "All Postponed/ Declined cases", spacing: { before: 0, after: 10 } }),
                    new Paragraph({ text: "Approval of cases of EM > 150% & < S Underwriter", spacing: { before: 0, after: 20 } }),
                  ],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                  margins: {
                    top: convertInchesToTwip(0.02),
                    bottom: convertInchesToTwip(0.02),
                    left: convertInchesToTwip(0.05),
                    right: convertInchesToTwip(0.05),
                  },
                }),
              ],
            }),
          ],
        }),
        
        new Paragraph({ text: "", spacing: { after: 40 } }),
        
        // Footer
        new Paragraph({ 
          text: `Document Name: Underwriting Worksheet                                                                                                                    Page 1 of 1`, 
          spacing: { after: 20 } 
        }),
        new Paragraph({ 
          text: `Ref. & Version: LUW F002V2                                                                                                                    Released on: 28.10.2020` 
        }),
      ],
    }],
  });
  
  return doc;
}

module.exports = { generateUnderwritingWorksheet };
