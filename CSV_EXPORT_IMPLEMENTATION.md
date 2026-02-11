# CSV Export Implementation - Proposal Extracted Data

## Overview
Add CSV export functionality for the "Proposal Extracted" text box to allow users to download extracted data in a structured, spreadsheet-friendly format.

---

## Feature Scope

### Phase 1: Proposal Extracted CSV Export (THIS DOCUMENT)
- Add download button next to "Proposal Extracted" heading
- Parse AI-extracted text into structured field-value pairs
- Generate CSV with two columns: Field, Value
- Trigger browser download with appropriate filename

### Future Phases (Not in this implementation):
- Phase 2: ECM Data CSV Export
- Phase 3: Decision Summary CSV Export
- Phase 4: JSON export option

---

## User Interface Changes

### Current UI:
```
┌─────────────────────────────────────────────────────┐
│ Step 1: Upload Proposal Form                        │
│ [Upload Area]                                        │
│ [Extract Information Button]                        │
│                                                      │
│ Proposal Extracted:                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Name: John Doe                                  │ │
│ │ Age: 35                                         │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### New UI:
```
┌─────────────────────────────────────────────────────┐
│ Step 1: Upload Proposal Form                        │
│ [Upload Area]                                        │
│ [Extract Information Button]                        │
│                                                      │
│ Proposal Extracted:              [📥 Download CSV]  │ ← NEW BUTTON
│ ┌─────────────────────────────────────────────────┐ │
│ │ Name: John Doe                                  │ │
│ │ Age: 35                                         │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Button Specifications:
- **Position**: Top-right of "Proposal Extracted" section, aligned with heading
- **Style**: Small button with download icon (📥) + "CSV" text
- **State**: Disabled until extraction completes, enabled after data is available
- **Color**: Accent color matching existing UI theme

---

## CSV Format Specification

### Structure: Two-Column Format
```csv
Field,Value
```

### Example Output:
```csv
Field,Value
Serial No/LID,93212
Effective Date,01/12/2025
Full Name,Mulloo Chitra Devi
Date of Birth,05/12/1969
Age Next Birthday,57
Gender,Female
Marital Status,Married
Nationality,Mauritian
ID Number,G9115360
Residential Address,"Petite Julie, Mauritius"
Occupation,Clerical Officer
Employer,Mauritius Commercial Bank
Years in Service,15
Height (cm),155
Weight (kg),69
BMI,28.7
Smoking Status,No
Alcohol Consumption,No
Plan Name,Prosperity Plan
Sum Assured (MUR),"900,798"
Term (years),20
Basic Premium (MUR),"1,860.00"
Additional Death Cover Premium (MUR),98.53
Critical Illness Premium (MUR),85.72
Policy Fee (MUR),25.00
Total Monthly Premium (MUR),"2,069.25"
Payment Frequency,Monthly
First Payment Method,Cash
Standing Order Bank,MCB
Beneficiary Name,Mulloo Neeraj Kumar
Beneficiary Relationship,Husband
Beneficiary Contact,57106173
Beneficiary Share,100%
Father Status,Deceased
Father Age at Death,57
Father Cause of Death,Natural
Mother Status,Deceased
Mother Age at Death,73
Mother Cause of Death,Old age
Number of Brothers,3
Brother 1 Age,117
Brother 1 Condition,Good
Health Question 1,Yes
Health Question 2,No
Health Question 3,No
Insurance Salesperson,Audhooa Ushtaa
Salesperson Code,2707
Branch,Flacq
```

### CSV Rules:
1. **Header Row**: Always include "Field,Value" as first row
2. **Quoting**: Values containing commas must be quoted (e.g., "1,860.00")
3. **Multi-line Values**: Addresses with line breaks should be quoted and use \n
4. **Empty Values**: If field exists but value is missing, leave value column empty
5. **Encoding**: UTF-8 to support special characters
6. **Line Endings**: CRLF (\r\n) for Windows compatibility

---

## Data Extraction Strategy

### Challenge:
The "Proposal Extracted" text is AI-generated and may have inconsistent formatting:
- Bullet points (•, -, *)
- Bold markers (**text**)
- Section headers (### SECTION)
- Nested structures (family history, health questions)
- Tables (sometimes)

### Parsing Approach:

#### Step 1: Clean the Text
```javascript
function cleanExtractedText(text) {
  // Remove markdown formatting
  text = text.replace(/\*\*/g, '');  // Remove bold markers
  text = text.replace(/^#+\s/gm, ''); // Remove headers
  text = text.replace(/^[•\-\*]\s/gm, ''); // Remove bullets
  return text;
}
```

#### Step 2: Extract Field-Value Pairs
```javascript
function extractFieldValuePairs(text) {
  const pairs = [];
  const lines = text.split('\n');
  
  for (let line of lines) {
    // Pattern 1: "Field: Value"
    const match1 = line.match(/^([^:]+):\s*(.+)$/);
    if (match1) {
      pairs.push({ field: match1[1].trim(), value: match1[2].trim() });
      continue;
    }
    
    // Pattern 2: "Field - Value"
    const match2 = line.match(/^([^-]+)\s*-\s*(.+)$/);
    if (match2) {
      pairs.push({ field: match2[1].trim(), value: match2[2].trim() });
      continue;
    }
    
    // Pattern 3: "Field = Value"
    const match3 = line.match(/^([^=]+)\s*=\s*(.+)$/);
    if (match3) {
      pairs.push({ field: match3[1].trim(), value: match3[2].trim() });
      continue;
    }
  }
  
  return pairs;
}
```

#### Step 3: Handle Special Structures

**Family History:**
```javascript
function parseFamilyHistory(text) {
  // Extract family member data
  // Return as separate rows:
  // "Father Status", "Deceased"
  // "Father Age at Death", "57"
  // "Father Cause of Death", "Natural"
}
```

**Health Questions:**
```javascript
function parseHealthQuestions(text) {
  // Extract Q1-Q24 with Yes/No answers
  // Return as separate rows:
  // "Health Question 1", "Yes"
  // "Health Question 2", "No"
}
```

**Riders:**
```javascript
function parseRiders(text) {
  // Extract rider premiums
  // Return as separate rows:
  // "TPD Premium (MUR)", "96.31"
  // "ADB Premium (MUR)", "0.00"
}
```

#### Step 4: Generate CSV
```javascript
function generateCSV(pairs) {
  let csv = 'Field,Value\n';
  
  for (let pair of pairs) {
    const field = escapeCSV(pair.field);
    const value = escapeCSV(pair.value);
    csv += `${field},${value}\n`;
  }
  
  return csv;
}

function escapeCSV(value) {
  // If value contains comma, quote, or newline, wrap in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape existing quotes by doubling them
    value = value.replace(/"/g, '""');
    return `"${value}"`;
  }
  return value;
}
```

---

## File Naming Convention

### Format:
```
proposal_[NAME]_[DATE].csv
```

### Examples:
```
proposal_Mulloo_Chitra_Devi_2026-02-11.csv
proposal_John_Doe_2026-02-11.csv
proposal_extracted_2026-02-11_143052.csv  (if name not available)
```

### Naming Logic:
1. Extract name from proposal data (first occurrence of "Name:" field)
2. Replace spaces with underscores
3. Remove special characters (keep only letters, numbers, underscores)
4. Add current date in ISO format (YYYY-MM-DD)
5. If name not found, use "extracted" + timestamp

---

## Implementation Files

### Files to Modify:

#### 1. `pdf-extractor/index-full.html`
**Changes:**
- Add CSV download button in Step 1 section
- Position button next to "Proposal Extracted:" heading
- Initially disabled, enabled after extraction

**Location:** Around line 80-100 (Step 1 section)

```html
<div class="section-header">
  <h3>Proposal Extracted:</h3>
  <button id="downloadProposalCsvBtn" class="csv-btn" disabled>
    📥 Download CSV
  </button>
</div>
```

**CSS to Add:**
```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.csv-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.csv-btn:hover:not(:disabled) {
  background: #45a049;
}

.csv-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
```

---

#### 2. `pdf-extractor/app-full.js`
**Changes:**
- Add CSV parsing functions
- Add CSV download handler
- Enable/disable button based on data availability

**New Functions to Add:**

```javascript
// ============================================
// CSV EXPORT FUNCTIONS
// ============================================

/**
 * Clean AI-generated text by removing markdown formatting
 */
function cleanExtractedText(text) {
  if (!text) return '';
  
  // Remove markdown bold
  text = text.replace(/\*\*/g, '');
  
  // Remove markdown headers
  text = text.replace(/^#+\s/gm, '');
  
  // Remove bullet points
  text = text.replace(/^[•\-\*]\s/gm, '');
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ');
  
  return text.trim();
}

/**
 * Extract field-value pairs from text
 */
function extractFieldValuePairs(text) {
  const pairs = [];
  const lines = text.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Skip section headers (all caps or starts with ===)
    if (line === line.toUpperCase() || line.startsWith('===')) {
      continue;
    }
    
    // Pattern: "Field: Value"
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (colonMatch) {
      const field = colonMatch[1].trim();
      const value = colonMatch[2].trim();
      if (field && value) {
        pairs.push({ field, value });
      }
      continue;
    }
    
    // Pattern: "Field - Value"
    const dashMatch = line.match(/^([^-]+)\s*-\s*(.+)$/);
    if (dashMatch) {
      const field = dashMatch[1].trim();
      const value = dashMatch[2].trim();
      if (field && value) {
        pairs.push({ field, value });
      }
    }
  }
  
  return pairs;
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value) {
  if (!value) return '';
  
  value = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Escape existing quotes by doubling them
    value = value.replace(/"/g, '""');
    return `"${value}"`;
  }
  
  return value;
}

/**
 * Generate CSV content from field-value pairs
 */
function generateCSV(pairs) {
  let csv = 'Field,Value\n';
  
  for (let pair of pairs) {
    const field = escapeCSVValue(pair.field);
    const value = escapeCSVValue(pair.value);
    csv += `${field},${value}\n`;
  }
  
  return csv;
}

/**
 * Extract name from proposal data for filename
 */
function extractNameForFilename(text) {
  // Look for "Name:" or "Full Name:" field
  const nameMatch = text.match(/(?:Full\s+)?Name:\s*([^\n]+)/i);
  if (nameMatch) {
    let name = nameMatch[1].trim();
    // Remove title (Mr., Mrs., Ms., Dr., etc.)
    name = name.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Miss)\s+/i, '');
    // Replace spaces with underscores
    name = name.replace(/\s+/g, '_');
    // Remove special characters
    name = name.replace(/[^a-zA-Z0-9_]/g, '');
    return name;
  }
  return null;
}

/**
 * Generate filename for CSV download
 */
function generateCSVFilename(proposalText) {
  const name = extractNameForFilename(proposalText);
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (name) {
    return `proposal_${name}_${date}.csv`;
  } else {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('-').slice(0, 3).join('');
    return `proposal_extracted_${date}_${timestamp}.csv`;
  }
}

/**
 * Trigger CSV download in browser
 */
function downloadCSV(csvContent, filename) {
  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main function to export proposal data as CSV
 */
function exportProposalToCSV() {
  if (!extractedProposalData) {
    alert('No proposal data available to export');
    return;
  }
  
  try {
    // Clean the text
    const cleanedText = cleanExtractedText(extractedProposalData);
    
    // Extract field-value pairs
    const pairs = extractFieldValuePairs(cleanedText);
    
    if (pairs.length === 0) {
      alert('No data could be extracted. The format may not be supported.');
      return;
    }
    
    // Generate CSV
    const csvContent = generateCSV(pairs);
    
    // Generate filename
    const filename = generateCSVFilename(extractedProposalData);
    
    // Download
    downloadCSV(csvContent, filename);
    
    console.log(`✓ CSV exported: ${filename} (${pairs.length} fields)`);
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export CSV. Please try again.');
  }
}
```

**Event Listener to Add:**
```javascript
// CSV Download Button Handler
document.getElementById('downloadProposalCsvBtn').addEventListener('click', exportProposalToCSV);
```

**Enable Button After Extraction:**
```javascript
// In the extractProposal() function, after successful extraction:
document.getElementById('downloadProposalCsvBtn').disabled = false;
```

---

## Testing Plan

### Test Cases:

#### 1. Basic Extraction
**Input:** Standard proposal with all fields
**Expected:** CSV with all fields extracted, proper formatting

#### 2. Special Characters
**Input:** Name with apostrophe (O'Brien), address with comma
**Expected:** Values properly quoted in CSV

#### 3. Missing Fields
**Input:** Proposal with some fields blank
**Expected:** CSV includes field with empty value

#### 4. Multi-line Address
**Input:** Address spanning multiple lines
**Expected:** Address quoted and preserved in single cell

#### 5. Large Numbers
**Input:** Sum assured: 1,000,000
**Expected:** Value quoted: "1,000,000"

#### 6. Filename Generation
**Input:** Name: "Mulloo Chitra Devi"
**Expected:** Filename: `proposal_Mulloo_Chitra_Devi_2026-02-11.csv`

#### 7. No Name Available
**Input:** Proposal without name field
**Expected:** Filename: `proposal_extracted_2026-02-11_143052.csv`

#### 8. Button States
**Test:** Button disabled before extraction, enabled after
**Expected:** Button behavior matches data availability

---

## Edge Cases to Handle

### 1. Empty Extraction
**Scenario:** AI returns empty or minimal text
**Handling:** Show alert "No data available to export"

### 2. Malformed Data
**Scenario:** Text doesn't match expected patterns
**Handling:** Extract what's possible, log warning

### 3. Very Long Values
**Scenario:** Health history with 500+ characters
**Handling:** Include in CSV (Excel can handle it)

### 4. Duplicate Field Names
**Scenario:** "Premium" appears multiple times
**Handling:** Keep all occurrences (user can clean up in Excel)

### 5. Special Characters in Filename
**Scenario:** Name contains / or \ characters
**Handling:** Strip invalid filename characters

### 6. Browser Compatibility
**Scenario:** Different browsers handle downloads differently
**Handling:** Use standard Blob API (works in all modern browsers)

---

## User Documentation

### How to Use:

1. **Upload Proposal Form** and click "Extract Information"
2. Wait for extraction to complete
3. Review extracted data in text box
4. Click **"📥 Download CSV"** button
5. CSV file downloads automatically
6. Open in Excel/Google Sheets to review

### CSV File Usage:

**In Excel:**
- Double-click CSV file to open
- Data appears in two columns: Field and Value
- Use filters to find specific fields
- Sort alphabetically by field name
- Add notes in additional columns

**In Google Sheets:**
- File → Import → Upload CSV
- Data appears in structured format
- Share with team members
- Use for data validation

---

## Success Criteria

✅ **Functional Requirements:**
- [ ] CSV download button appears in UI
- [ ] Button is disabled until data is available
- [ ] Clicking button downloads CSV file
- [ ] CSV has proper two-column structure
- [ ] All extracted fields are included
- [ ] Special characters are properly escaped
- [ ] Filename includes name and date

✅ **Quality Requirements:**
- [ ] CSV opens correctly in Excel
- [ ] CSV opens correctly in Google Sheets
- [ ] No data loss during export
- [ ] Commas in values don't break columns
- [ ] Multi-line values stay in single cell

✅ **User Experience:**
- [ ] Button is clearly visible
- [ ] Download happens immediately
- [ ] No page refresh or navigation
- [ ] Works on Windows, Mac, Linux
- [ ] Works in Chrome, Firefox, Safari, Edge

---

## Future Enhancements (Not in this phase)

1. **Column Selection:** Let users choose which fields to include
2. **Format Options:** Choose between 2-column or 3-column (with categories)
3. **Excel Export:** Generate .xlsx with formatting
4. **Batch Export:** Export multiple proposals at once
5. **Template Mapping:** Map to custom CSV templates
6. **Data Validation:** Highlight missing or invalid fields in CSV

---

## Rollback Plan

If issues arise after deployment:

1. **Quick Fix:** Disable the CSV button (set `display: none`)
2. **Revert:** Remove button from HTML, remove functions from JS
3. **No Data Impact:** Feature is read-only, doesn't affect existing functionality

---

## Approval Checklist

Before implementation, please confirm:

- [ ] CSV format (2-column: Field, Value) is acceptable
- [ ] Button placement (top-right of text box) is acceptable
- [ ] Filename format (proposal_Name_Date.csv) is acceptable
- [ ] UTF-8 encoding with BOM for Excel compatibility is acceptable
- [ ] Approach to handle special characters is acceptable
- [ ] No backend changes needed (all client-side) is acceptable

---

**Document Status:** Ready for Review  
**Created:** February 11, 2026  
**Phase:** 1 - Proposal Extracted CSV Export  
**Estimated Implementation Time:** 2-3 hours

---

## Next Steps

1. **Review this document** and provide feedback
2. **Approve implementation** or request changes
3. **Implement changes** in code (with your approval)
4. **Test thoroughly** with sample data
5. **Deploy** and monitor for issues
6. **Document** for end users

