# Quick Start Guide - Insurance Underwriting Worksheet Generator

## 🚀 How to Run

```bash
cd pdf-extractor
npm start
```

Then open: **http://localhost:3000/index-full.html**

---

## 📋 New 3-Step Workflow

### Step 1: Upload Proposal Form
- Upload the scanned insurance proposal form (PDF)
- Click "Extract Information"
- Wait 10-30 seconds for AI extraction
- ✅ Review extracted data

### Step 2: Upload ECM Report
- Upload the ECM Portfolio Report (PDF)
- Click "Extract ECM Data"
- Wait 10-30 seconds for AI extraction
- ✅ Review existing policies and sum assured totals

### Step 3: Generate Worksheet
- Click "Generate DOCX Worksheet"
- System automatically:
  - Maps all proposal data
  - Adds ECM existing policies
  - Calculates totals
  - Validates business rules
  - Generates underwriter summary
- ✅ Review underwriter summary with warnings
- Click "Download DOCX" to get the filled worksheet

---

## ✅ What's Been Implemented

### ECM Integration
- ✅ Extracts all existing policies from ECM report
- ✅ Filters ACTIVE policies only (excludes Expired, Lapsed, etc.)
- ✅ Calculates total existing sum assured
- ✅ Validates against 11M MUR limit

### Business Rules
- ✅ Sum assured aggregation (existing + new)
- ✅ Non-medical grid validation (4M, 11M thresholds)
- ✅ Age validation (ANB ≤ 45)
- ✅ BMI assessment (≤ 33)
- ✅ Medical examination requirement determination

### Worksheet Generation
- ✅ Plan Details table with borders
- ✅ Personal Details 2-column table
- ✅ Existing policies section from ECM
- ✅ Calculated fields (BMI, Sum at Risk)
- ✅ Checkboxes for riders and habits
- ✅ Professional formatting

### Underwriter Summary
- ✅ Existing policies list with totals
- ✅ New application sum assured
- ✅ Total sum assured validation
- ✅ Rule violation warnings (⚠️)
- ✅ Final recommendation
- ✅ Missing documents checklist

---

## 🎯 Key Changes from Previous Version

### ❌ Removed
- Worksheet template upload (format is now hardcoded)
- Manual field mapping step

### ✅ Added
- ECM upload and extraction
- Automatic sum assured aggregation
- Business rule validation
- Enhanced underwriter summary with ECM data
- 3-step streamlined workflow

---

## 📊 Sample Output

### Underwriter Summary Example:
```
1. EXISTING POLICIES SUMMARY:
   - Policy 00520/000054: NIC A+ Education - MUR 280,000 (Active)
   - Policy 00520/001883: NIC A+ Education - MUR 300,000 (Active)
   TOTAL EXISTING SUM ASSURED: MUR 580,000

2. NEW APPLICATION:
   - New Sum Assured: MUR 519,168
   - TOTAL SUM ASSURED: MUR 1,099,168
   ✓ Within 11M limit

3. NON-MEDICAL GRID VALIDATION:
   - Total Sum: MUR 1,099,168 (≤ 4M)
   ✓ Proposal form only (if ANB ≤ 45)

4. AGE VALIDATION:
   - ANB: 57 years
   ⚠️ ANB > 45: Medical examination required

5. BMI ASSESSMENT:
   - BMI: 22.5
   ✓ Within acceptable range

6. FINAL RECOMMENDATION:
   - Medical examination required (Age > 45)
   - Standard rates likely if health checks clear
```

---

## 🧪 Testing

Use these sample files:
- **Proposal:** `scannedApplication.pdf`
- **ECM:** Any ECM report from your Documents folder

Expected results:
- Both extractions complete successfully
- Underwriter summary shows all validations
- DOCX downloads with complete data
- Warnings displayed for any rule violations

---

## 🔧 Troubleshooting

### "No proposal data provided"
- Make sure you completed Step 1 (Upload Proposal)
- Check that extraction was successful

### "No ECM data provided"
- Make sure you completed Step 2 (Upload ECM)
- Check that extraction was successful

### "Failed to generate DOCX"
- Check server console for errors
- Verify Gemini API key is set in .env file
- Check internet connection

### Server won't start
```bash
# Make sure you're in the right directory
cd pdf-extractor

# Install dependencies if needed
npm install

# Check .env file exists with API key
cat .env
```

---

## 📝 What's Still Pending

### Page 2 of Worksheet
- Computation of Ratings table
- Underwriting Decision grid
- Signature section

### Additional Sections
- Payment Details table
- Documents Required table
- Medical Examination section improvements

### Advanced Features
- Data preview/edit before generation
- Batch processing
- Export validation results
- Audit trail

---

## 💡 Tips

1. **Always upload both files** - The system needs both proposal and ECM data
2. **Wait for extraction** - AI processing takes 10-30 seconds per file
3. **Review the summary** - Check for warnings (⚠️) before finalizing
4. **Check the DOCX** - Open and verify all data is correct

---

**Status:** ✅ ECM Integration Complete & Working
**Version:** 2.0
**Date:** February 6, 2026
