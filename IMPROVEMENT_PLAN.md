# DOCX Generation Improvement Plan

## Current Issues

### 1. **Formatting Problems**
- Plain text paragraphs instead of proper table structures
- No borders or grid lines like the PDF
- Spacing and alignment don't match the original
- Missing underlines for fill-in fields
- No proper column alignment
- Checkboxes are just Unicode characters, not form fields

### 2. **Data Mapping Problems**
- Many extracted fields are not being mapped to the DOCX
- Regex patterns in `parseMappedData()` are too strict
- Missing calculations (e.g., BMI, Sum at Risk)
- No handling of "Own Business" occupation type
- Missing rider premium details
- No date formatting (01/01/2026 vs raw text)

---

## Proposed Solutions

### PART A: Improve Data Mapping

#### 1. **Enhanced Data Extraction**
Current `parseMappedData()` only looks for specific patterns. We need:

**Add these fields:**
```javascript
// From extracted_info.txt we have:
- Height: 1.70m, Weight: 65kg → Calculate BMI
- Death Benefit: 259,584 + Additional: 259,584 = Sum at Risk: 519,168
- Effective Date: 01/01/2026 (formatted)
- Age: 57 years
- Occupation: Salesman (Own Business)
- Address: Royal Road, Trou D'eau Douce
- ID: J181169011253G
- Father's death: age 52, cause: Alcoholic
- First payment: 2,000.00 on 23/12/2025
- Monthly premium breakdown with riders
```

**Improve regex patterns:**
```javascript
// More flexible patterns that handle variations:
- "Start Date: 01/01/2026" OR "Effective Date: 01 January 2026"
- "Proposal No: 93968" OR "Proposal No.: 93968"
- Handle "Own Business" occupation
- Extract height/weight and calculate BMI
```

#### 2. **Add Calculated Fields**
```javascript
function calculateBMI(height, weight) {
  // height in meters, weight in kg
  return (weight / (height * height)).toFixed(2);
}

function calculateSumAtRisk(deathBenefit, additionalDeath) {
  return deathBenefit + additionalDeath;
}
```

---

### PART B: Improve Formatting

#### 1. **Use Tables Instead of Plain Text**
The PDF uses tables with borders. We should use `docx` Table API:

**Example for Plan Details:**
```javascript
new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top: { style: BorderStyle.SINGLE, size: 1 },
    bottom: { style: BorderStyle.SINGLE, size: 1 },
    left: { style: BorderStyle.SINGLE, size: 1 },
    right: { style: BorderStyle.SINGLE, size: 1 },
  },
  rows: [
    new TableRow({
      children: [
        new TableCell({ 
          children: [new Paragraph("Start Date:")],
          width: { size: 15, type: WidthType.PERCENTAGE }
        }),
        new TableCell({ 
          children: [new Paragraph(data.startDate)],
          width: { size: 18, type: WidthType.PERCENTAGE }
        }),
        // ... more cells
      ]
    })
  ]
})
```

#### 2. **Add Proper Borders and Grid Lines**
```javascript
// All tables should have visible borders
borders: {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
}
```

#### 3. **Add Underlines for Fill-in Fields**
```javascript
// For empty fields that need to be filled
new TextRun({ 
  text: "................................",
  underline: { type: UnderlineType.DOTTED }
})
```

#### 4. **Proper Font Sizing and Styling**
```javascript
// Match PDF font sizes
new Paragraph({
  text: "NICL UNDERWRITING WORKSHEET",
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  style: {
    font: { size: 24, bold: true }  // 12pt = 24 half-points
  }
})
```

#### 5. **Checkbox Implementation**
```javascript
// Use proper checkbox symbols with borders
new TableCell({
  children: [
    new Paragraph({
      children: [
        new TextRun({ text: "☐ ", font: "Arial" }),  // Empty checkbox
        new TextRun({ text: "TPD" })
      ]
    })
  ],
  width: { size: 10, type: WidthType.PERCENTAGE }
})
```

---

## Implementation Strategy

### Phase 1: Fix Data Mapping (Priority: HIGH)
1. Update `parseMappedData()` function with flexible regex
2. Add calculated fields (BMI, Sum at Risk)
3. Add date formatting helper
4. Handle "Own Business" occupation
5. Extract rider details properly
6. Test with `extracted_info.txt`

### Phase 2: Improve Basic Structure (Priority: HIGH)
1. Convert Plan Details section to table
2. Convert Personal Details section to table
3. Add proper borders to all tables
4. Fix column widths to match PDF proportions

### Phase 3: Enhance Formatting (Priority: MEDIUM)
1. Add underlines for empty fields
2. Implement proper checkboxes
3. Match font sizes and styles
4. Add proper spacing between sections

### Phase 4: Page 2 Improvements (Priority: MEDIUM)
1. Create Computation of Ratings table
2. Create Underwriting Decision table with proper grid
3. Add signature lines with underscores
4. Format footer notes properly

---

## Specific Code Changes Needed

### File: `generate-docx.js`

**1. Import additional components:**
```javascript
const { 
  Document, Paragraph, Table, TableRow, TableCell, 
  WidthType, AlignmentType, BorderStyle, TextRun,
  UnderlineType, VerticalAlign, Shading
} = require('docx');
```

**2. Add helper functions:**
```javascript
function formatDate(dateStr) {
  // Convert "01 January 2026" to "01/01/2026"
}

function calculateBMI(heightM, weightKg) {
  return (weightKg / (heightM * heightM)).toFixed(2);
}

function extractRiderInfo(text) {
  // Extract TPD, ADB, ACD, CI premiums and check status
}
```

**3. Improve `parseMappedData()`:**
- Add more flexible regex patterns
- Extract height/weight and calculate BMI
- Calculate Sum at Risk from benefits
- Parse rider information
- Format dates properly
- Handle "Own Business" occupation

**4. Replace plain Paragraphs with Tables:**
- Plan Details → Table with 4 columns
- Personal Details → Table with 2 columns (1st/2nd Life)
- Underwriting Requirements → Table with checkboxes
- Payment Details → Table
- Documents Required → Table with 3 columns

---

## Testing Plan

1. **Test with current data:**
   - Run with `extracted_info.txt`
   - Verify all fields are populated
   - Check calculations (BMI, Sum at Risk)

2. **Visual comparison:**
   - Generate DOCX
   - Compare side-by-side with PDF
   - Check alignment, borders, spacing

3. **Edge cases:**
   - Missing fields
   - Different date formats
   - Various occupation types
   - Multiple riders

---

## Expected Outcome

After implementation:
- ✅ DOCX will closely match PDF layout
- ✅ All extracted data will be properly mapped
- ✅ Tables with proper borders and grid lines
- ✅ Checkboxes for all Yes/No fields
- ✅ Calculated fields (BMI, Sum at Risk)
- ✅ Proper formatting (fonts, spacing, alignment)
- ✅ Professional appearance suitable for underwriting use

---

## Next Steps

**Would you like me to:**
1. Start with Phase 1 (Data Mapping improvements)?
2. Start with Phase 2 (Table structure)?
3. Do both simultaneously?

Please confirm and I'll begin the implementation.


**Example: Plan Details Section**
```javascript
new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: TableBorders.SINGLE,
  rows: [
    new TableRow({
      children: [
        new TableCell({ 
          children: [new Paragraph("Start Date:")],
          width: { size: 15, type: WidthType.PERCENTAGE }
        }),
        new TableCell({ 
          children: [new Paragraph(data.startDate || "_____________")],
          width: { size: 18, type: WidthType.PERCENTAGE }
        }),
        new TableCell({ 
          children: [new Paragraph("Proposal No:")],
          width: { size: 15, type: WidthType.PERCENTAGE }
        }),
        new TableCell({ 
          children: [new Paragraph(data.proposalNo || "_____________")],
          width: { size: 18, type: WidthType.PERCENTAGE }
        }),
        // ... more cells
      ],
    }),
  ],
})
```

#### 2. **Add Proper Borders and Lines**
- Use `BorderStyle` for table borders
- Add horizontal lines between sections using tables with bottom borders
- Match the visual structure of the original PDF

#### 3. **Implement Checkbox Fields**
Use proper checkbox representation:
```javascript
new Paragraph({
  children: [
    new TextRun({ text: "☐ ", font: "Arial" }), // Unchecked
    new TextRun({ text: "TPD  " }),
    new TextRun({ text: "☑ ", font: "Arial" }), // Checked
    new TextRun({ text: "ADB" }),
  ],
})
```

#### 4. **Add Underlines for Fill-in Fields**
```javascript
new TextRun({ 
  text: data.name || "___________________________",
  underline: data.name ? {} : { type: UnderlineType.SINGLE }
})
```

#### 5. **Font Styling**
- Use consistent font (Arial or Times New Roman)
- Bold section headers
- Smaller font for body text (10pt)
- Larger font for title (14pt bold)

#### 6. **Two-Column Layout for Personal Details**
Create a table with 2 columns for "1st Life Assured" and "2nd Life Assured":
```javascript
new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({ 
          children: [new Paragraph({ text: "1st Life Assured", bold: true })],
          width: { size: 50, type: WidthType.PERCENTAGE }
        }),
        new TableCell({ 
          children: [new Paragraph({ text: "2nd Life Assured", bold: true })],
          width: { size: 50, type: WidthType.PERCENTAGE }
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({ 
          children: [new Paragraph(`Name: ${data.name || "_______________"}`)],
        }),
        new TableCell({ 
          children: [new Paragraph("Name: _______________")],
        }),
      ],
    }),
    // ... more rows
  ],
})
```

---

## Implementation Steps

### **Step 1: Enhance Data Extraction (Priority: HIGH)**

1. **Update `parseMappedData()` function**
   - Add multiple regex patterns per field
   - Add fallback to original extracted text
   - Add calculated fields (BMI, Sum at Risk)
   - Add logging for debugging

2. **Create `parseExtractedInfo()` function**
   - Parse the original extracted_info.txt
   - Extract all available fields
   - Return structured data object

3. **Merge data sources**
   - Combine mapped data and extracted data
   - Prefer mapped data, fallback to extracted data
   - Validate and log missing fields

### **Step 2: Improve Document Structure (Priority: HIGH)**

1. **Replace paragraph-based layout with tables**
   - Plan Details section → Table
   - Personal Details section → 2-column table
   - Underwriting Requirements → Table with checkboxes
   - Payment Details → Table
   - Documents Required → 2-column table

2. **Add proper borders and styling**
   - Section separators (horizontal lines)
   - Table borders matching PDF
   - Font sizes and styles

3. **Implement proper checkboxes**
   - Use checkbox symbols with proper fonts
   - Mark checked boxes based on data

### **Step 3: Add Missing Sections (Priority: MEDIUM)**

1. **Page 1 improvements**
   - Add proper "Facultative/Und Opinion" checkboxes
   - Improve Underwriting Requirements layout
   - Add proper AML/CFT section with Yes/No options
   - Improve Documents Required section layout

2. **Page 2 improvements**
   - Add proper Computation of Ratings table
   - Add Underwriting Decision table with all checkboxes
   - Add signature lines with proper spacing
   - Add footer notes table

### **Step 4: Testing and Refinement (Priority: MEDIUM)**

1. **Test with sample data**
   - Use extracted_info.txt as input
   - Generate DOCX and compare with PDF
   - Identify formatting differences

2. **Iterate on formatting**
   - Adjust table widths
   - Fine-tune spacing
   - Match fonts and sizes

3. **Add error handling**
   - Handle missing data gracefully
   - Log warnings for missing fields
   - Provide default values

---

## Specific Field Mappings Needed

### **From extracted_info.txt → Worksheet**

| Extracted Field | Worksheet Field | Calculation/Transform |
|----------------|-----------------|----------------------|
| Effective Date: 01 January 2026 | Start Date | Direct mapping |
| Proposal No.: 93968 | Proposal No. | Direct mapping |
| Plan Name: Prosperity Plan | Plan Proposed | Direct mapping |
| Term of Policy: 20 years | Term | Extract number only |
| Death Benefit: 259,584 + Additional: 259,584 | Sum At Risk | Calculate: 259,584 + 259,584 = 519,168 |
| (Inferred from name: Mr.) | Gender | M |
| TPD Rider: MUR 96.31 | Riders: TPD | Check if > 0 |
| Additional Death Benefit: MUR 350.70 | Riders: ACD | Check if > 0 |
| Accidental Death Benefit: 0.00 | Riders: ADB | Check if > 0 |
| Critical Illness: MUR 175.70 | Riders: CI | Check if > 0 |
| Name: Mr. Deepnarain Juguessar | Name | Direct mapping |
| Occupation: Salesman | Occupation | Direct mapping |
| Age: 57 years | ANB | Extract number |
| Height: 1M 70Cms, Weight: 65 Kgs | BMI | Calculate: 65 / (1.7)² = 22.5 |
| Lifestyle: Non-smoker | Smoking | Map to "No" |
| Lifestyle: non-drinker | Alcohol | Map to "No" |
| Family History: Father deceased at 52... | Family History | Direct mapping |
| Total Monthly Premium: MUR 1,999.71 | Total Monthly Premium | Direct mapping |
| First Payment: 23 December 2025 | DLP | Use this date |
| First Payment: MUR 2,000.00 | No. Of Months Paid | 1 |
| CDD: not a PEP | Listed as PEP | No |
| CDD: No political affiliations | Listed on AML/CFT | No |
| Occupation: Own Business | Trade license, BRN | Check these boxes |

---

## Code Structure Recommendation

```
generate-docx.js
├── generateUnderwritingWorksheet(mappedData, extractedInfo)
│   ├── data = mergeAndParseData(mappedData, extractedInfo)
│   ├── validateData(data)
│   └── createDocument(data)
│       ├── createPage1(data)
│       │   ├── createPlanDetailsTable(data)
│       │   ├── createPersonalDetailsTable(data)
│       │   ├── createUnderwritingReqTable(data)
│       │   ├── createPaymentDetailsTable(data)
│       │   ├── createComplianceSection(data)
│       │   ├── createDocumentsTable(data)
│       │   └── createMedicalExamSection(data)
│       └── createPage2(data)
│           ├── createMedicalReportSection()
│           ├── createComputationTable(data)
│           ├── createUnderwritingDecisionTable()
│           └── createSignatureSection()
│
├── mergeAndParseData(mappedData, extractedInfo)
│   ├── parseMappedData(mappedData)
│   ├── parseExtractedInfo(extractedInfo)
│   ├── calculateFields(data)
│   └── mergeData(mapped, extracted)
│
├── Helper Functions
│   ├── extractValue(text, regex, fallbackRegex)
│   ├── calculateBMI(height, weight)
│   ├── calculateSumAtRisk(death, additional)
│   ├── formatDate(dateString)
│   ├── parseYesNo(text)
│   └── validateData(data)
│
└── Table Creation Functions
    ├── createTableCell(text, options)
    ├── createCheckbox(isChecked, label)
    ├── createUnderlineField(value, width)
    └── createSectionHeader(text)
```

---

## Next Steps

1. **Review this plan** - Confirm approach is correct
2. **Implement Step 1** - Enhanced data extraction
3. **Implement Step 2** - Table-based formatting
4. **Test and iterate** - Compare output with PDF
5. **Refine** - Adjust spacing, fonts, borders

Would you like me to proceed with implementing these improvements?
