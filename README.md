# PDF Information Extractor

Extract information from PDF files using Google Gemini AI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

4. Start the server:
```bash
npm start
```

5. Open browser to `http://localhost:3000`

## Usage

1. Upload a PDF file (drag & drop or click)
2. Optionally customize the extraction prompt
3. Click "Extract Information"
4. View the AI-extracted information

## Features

- Drag & drop PDF upload
- Custom extraction prompts
- Gemini AI-powered extraction
- Clean, modern UI
- File size validation (10MB max)
