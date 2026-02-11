# CSV Export Feature - Visual Guide

## What Changed in the UI

### Before:
```
┌─────────────────────────────────────────────────────┐
│ Step 1: Upload Proposal Form                        │
│ [Upload Area]                                        │
│ [Extract Information Button]                        │
│                                                      │
│ ✅ Proposal Extracted                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Name: John Doe                                  │ │
│ │ Age: 35                                         │ │
│ │ Plan: Prosperity Plan                           │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────────────────────┐
│ Step 1: Upload Proposal Form                        │
│ [Upload Area]                                        │
│ [Extract Information Button]                        │
│                                                      │
│ ✅ Proposal Extracted        [📥 Download CSV] ← NEW│
│ ┌─────────────────────────────────────────────────┐ │
│ │ Name: John Doe                                  │ │
│ │ Age: 35                                         │ │
│ │ Plan: Prosperity Plan                           │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Button States

### State 1: Initially Disabled (Gray)
```
┌──────────────────────┐
│ 📥 Download CSV      │  ← Gray, cannot click
└──────────────────────┘
```
**When:** Before extraction completes  
**Color:** Gray (#cccccc)  
**Cursor:** Not-allowed

---

### State 2: Enabled (Green)
```
┌──────────────────────┐
│ 📥 Download CSV      │  ← Green, clickable
└──────────────────────┘
```
**When:** After extraction completes  
**Color:** Green (#4CAF50)  
**Cursor:** Pointer

---

### State 3: Hover (Darker Green)
```
┌──────────────────────┐
│ 📥 Download CSV  ↑   │  ← Darker green, slightly raised
└──────────────────────┘
```
**When:** Mouse hovering over enabled button  
**Color:** Darker Green (#45a049)  
**Effect:** Moves up 1px

---

## CSV File Output

### Example CSV Content:
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
Total Monthly Premium (MUR),"2,069.25"
```

---

## How It Looks in Excel

### Excel View:
```
┌─────────────────────────────┬──────────────────────────┐
│ A: Field                    │ B: Value                 │
├─────────────────────────────┼──────────────────────────┤
│ Serial No/LID               │ 93212                    │
│ Effective Date              │ 01/12/2025               │
│ Full Name                   │ Mulloo Chitra Devi       │
│ Date of Birth               │ 05/12/1969               │
│ Age Next Birthday           │ 57                       │
│ Gender                      │ Female                   │
│ Marital Status              │ Married                  │
│ Nationality                 │ Mauritian                │
│ ID Number                   │ G9115360                 │
│ Residential Address         │ Petite Julie, Mauritius  │
│ Occupation                  │ Clerical Officer         │
│ Employer                    │ Mauritius Commercial Bank│
│ Years in Service            │ 15                       │
│ Height (cm)                 │ 155                      │
│ Weight (kg)                 │ 69                       │
│ BMI                         │ 28.7                     │
│ Smoking Status              │ No                       │
│ Alcohol Consumption         │ No                       │
│ Plan Name                   │ Prosperity Plan          │
│ Sum Assured (MUR)           │ 900,798                  │
│ Term (years)                │ 20                       │
│ Basic Premium (MUR)         │ 1,860.00                 │
│ Total Monthly Premium (MUR) │ 2,069.25                 │
└─────────────────────────────┴──────────────────────────┘
```

**Features:**
- ✅ Two clean columns
- ✅ Commas in numbers preserved
- ✅ No broken cells
- ✅ Easy to read and sort
- ✅ Can add notes in column C

---

## User Workflow

### Step-by-Step:

**1. Upload Proposal**
```
[📄 Upload Area]
   ↓ (drag & drop or click)
[✅ File Selected]
```

**2. Extract Data**
```
[Extract Information] ← Click
   ↓ (wait 10-30 seconds)
[✅ Proposal Extracted]
```

**3. Download CSV**
```
[📥 Download CSV] ← Click (now enabled)
   ↓ (instant)
[💾 File Downloaded]
```

**4. Open in Excel**
```
[proposal_Name_Date.csv] ← Double-click
   ↓
[Excel opens with data in columns]
```

---

## Filename Examples

### With Name Extracted:
```
proposal_Mulloo_Chitra_Devi_2026-02-11.csv
proposal_John_Doe_2026-02-11.csv
proposal_Jane_Smith_2026-02-11.csv
```

### Without Name (Fallback):
```
proposal_extracted_2026-02-11_143052.csv
proposal_extracted_2026-02-11_150234.csv
```

**Format:** `proposal_[NAME]_[YYYY-MM-DD].csv`

---

## Special Character Handling

### Example 1: Commas in Values
**Input:** `Sum Assured: 1,000,000`  
**CSV Output:** `Sum Assured,"1,000,000"`  
**Excel Display:** `1,000,000` (in single cell)

### Example 2: Quotes in Values
**Input:** `Name: O'Brien "The Great"`  
**CSV Output:** `Name,"O'Brien ""The Great"""`  
**Excel Display:** `O'Brien "The Great"` (in single cell)

### Example 3: Multi-line Address
**Input:**
```
Address: 123 Main Street
         Apartment 4B
         New York
```
**CSV Output:** `Address,"123 Main Street\nApartment 4B\nNew York"`  
**Excel Display:** Multi-line text in single cell

---

## Error Handling

### Scenario 1: No Data Available
```
User clicks CSV button before extraction
   ↓
[⚠️ Alert: "No proposal data available to export"]
```

### Scenario 2: Parsing Failed
```
AI returns unstructured text
   ↓
[⚠️ Alert: "No data could be extracted. Format may not be supported."]
```

### Scenario 3: Download Failed
```
Browser blocks download
   ↓
[⚠️ Alert: "Failed to export CSV. Please try again."]
   ↓
[Console log with error details]
```

---

## Browser Download Behavior

### Chrome/Edge:
```
[CSV file appears in download bar at bottom]
[Click to open or show in folder]
```

### Firefox:
```
[Dialog: "Open with" or "Save File"]
[User chooses action]
```

### Safari:
```
[File downloads to Downloads folder]
[Notification appears]
```

---

## Comparison: Text vs CSV

### Text Box View (Current):
```
Name: John Doe
Age: 35
Plan: Prosperity Plan
Sum Assured: 1,000,000
Premium: 2,500
...
```
**Pros:** Quick to read  
**Cons:** Hard to analyze, can't sort/filter

### CSV View (New):
```
┌──────────────┬───────────────┐
│ Field        │ Value         │
├──────────────┼───────────────┤
│ Name         │ John Doe      │
│ Age          │ 35            │
│ Plan         │ Prosperity... │
│ Sum Assured  │ 1,000,000     │
│ Premium      │ 2,500         │
└──────────────┴───────────────┘
```
**Pros:** Structured, sortable, filterable, shareable  
**Cons:** Requires Excel/Sheets to view

---

## Use Cases

### Use Case 1: Data Verification
```
1. Download CSV
2. Open in Excel
3. Sort by field name
4. Check for missing values
5. Verify accuracy
```

### Use Case 2: Comparison
```
1. Download CSV for Proposal A
2. Download CSV for Proposal B
3. Open both in Excel
4. Compare side-by-side
5. Identify differences
```

### Use Case 3: Reporting
```
1. Download CSV
2. Import into reporting system
3. Generate analytics
4. Share with team
```

### Use Case 4: Corrections
```
1. Download CSV
2. Add notes in column C
3. Highlight errors in red
4. Share with data entry team
5. Re-upload corrected data
```

---

## Tips for Users

### Tip 1: Always Review in Excel
After download, open in Excel to verify data quality before using.

### Tip 2: Add Notes Column
In Excel, add a column C for notes/corrections.

### Tip 3: Use Filters
Apply Excel filters to quickly find specific fields.

### Tip 4: Save Original
Keep the original CSV file before making changes.

### Tip 5: Compare Versions
Use Excel's compare feature to check multiple proposals.

---

## Keyboard Shortcuts

### Windows:
- **Ctrl + Click** on button: Download and open immediately
- **Shift + Click** on button: Download to specific location

### Mac:
- **Cmd + Click** on button: Download and open immediately
- **Option + Click** on button: Download to specific location

---

## Mobile Support

**Note:** CSV export works on mobile browsers, but Excel/Sheets apps are recommended for viewing.

### iOS:
```
[Download CSV]
   ↓
[Open in Files app]
   ↓
[Share to Excel/Sheets app]
```

### Android:
```
[Download CSV]
   ↓
[Open in Downloads]
   ↓
[Open with Excel/Sheets app]
```

---

**Visual Guide Version:** 1.0  
**Date:** February 11, 2026  
**Feature:** CSV Export for Proposal Extracted Data

