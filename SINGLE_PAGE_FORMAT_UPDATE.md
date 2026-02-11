# Single-Page Underwriting Worksheet Implementation

## Summary
Created a new DOCX generator that produces a **single-page** underwriting worksheet matching the new NICL format (LUW F002V2).

## Changes Made

### 1. New File Created
- **`pdf-extractor/generate-docx-single-page.js`**
  - Complete rewrite for single-page format
  - Compact spacing and layout
  - All sections fit on one page
  - Includes underwriting decision grid table
  - Signature and approval sections
  - Notes section with 4 categories at bottom
  - Footer shows "Page 1 of 1"

### 2. Updated File
- **`pdf-extractor/server.js`**
  - Changed import from `./generate-docx` to `./generate-docx-single-page`
  - Now uses the new single-page generator

## Key Features of New Format

### Layout Improvements
- **Reduced margins**: 0.4 inches (vs 0.5 inches)
- **Tighter spacing**: Reduced spacing between all sections
- **Smaller fonts**: Size 16 for most content (vs 18-20)
- **Single page**: Everything fits on one page

### Sections Included
1. **Title**: NICL UNDERWRITING WORKSHEET
2. **Plan Details**: Start date, proposal no, plan, term, sum at risk, gender, riders
3. **Personal Details**: Name, occupation, ANB, BMI, habits, family history, previous cover
4. **Facultative/Und Opinion**: Yes/No checkboxes
5. **Payment Details**: Premium, DLP, months paid
6. **AML/CFT & Compliance**: Listed status, CRA scores, PEP status
7. **Documents Required**: EDD, questionnaire, KYC checks
8. **Underwriting Decision Grid**: 
   - STD RATES, UPRATED, POSTPONED, DECLINED columns
   - Life Cover, Additional Death, TPD/WOP, Accidental Death, Family Inc Ben, ACB/CI rows
   - Checkboxes for 1st and 2nd life assured
9. **Signature Section**: Underwritten by, Approved by with dates
10. **Notes Table**: 4 categories (Non-Medical Std, Medical Std, Non-Medical SUS, Team Leader)
11. **Footer**: Document name, reference, version, release date, "Page 1 of 1"

## Old Files (Preserved)
- `generate-docx.js` - Original 2-page format
- `generate-docx-enhanced.js` - Enhanced 2-page format
- `generate-docx-new.js` - Attempted compact format (incomplete)
- `generate-docx-old-backup.js` - Backup of original

These files are kept for reference but are no longer used by the application.

## Testing
To test the new format:
1. Start the server: `node server.js`
2. Upload a PDF through the web interface
3. Click "Generate DOCX"
4. Verify the generated worksheet is single-page and matches the new format

## Next Steps
- Test with real data to ensure all fields populate correctly
- Verify checkbox rendering in different Word versions
- Adjust spacing if needed based on actual output
