# Insurance Form Processing Workflow

This application extracts information from scanned insurance proposal forms and maps it to underwriting worksheets.

## Features

1. **Extract Information** - Upload scanned proposal forms (PDFs) and extract all data using AI vision
2. **Map to Worksheet** - Upload blank underwriting worksheet and automatically map extracted data to fields

## How to Use

### Option 1: Full Workflow Interface

1. Start the server:
```bash
npm start
```

2. Open `http://localhost:3000/index-full.html` in your browser

3. **Step 1: Extract Information**
   - Upload the scanned proposal form PDF
   - Click "Extract Information"
   - Review the extracted data

4. **Step 2: Fill Worksheet**
   - Upload the blank underwriting worksheet (PDF or image)
   - Click "Map Data to Worksheet"
   - Get a structured mapping of which fields to fill

### Option 2: Simple Extraction Only

1. Open `http://localhost:3000` for the simple interface
2. Upload any PDF and extract information

## What Gets Extracted

From the proposal form:
- Personal details (name, DOB, address, occupation)
- Policy details (type, term, sum assured)
- Premium information
- Beneficiary details
- Health information
- Payment details

## What Gets Mapped

To the underwriting worksheet:
- Plan details (proposal no, dates, term)
- Personal details (1st & 2nd life assured)
- BMI, smoking/alcohol habits
- Family history
- Previous cover information
- Underwriting requirements checkboxes
- Payment details

## Files

- `index.html` - Simple extraction interface
- `index-full.html` - Full workflow interface
- `server.js` - Backend API server
- `extracted_info.txt` - Sample extracted data
- `fill-worksheet.js` - Standalone worksheet filler script

## Tips

- For best results with scanned documents, ensure they are clear and readable
- The AI will indicate "NOT AVAILABLE" for fields that cannot be filled from the source data
- Review all mapped data before manually filling the actual worksheet
