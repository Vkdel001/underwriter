# CRA Implementation - Files Impacted

## Summary
For CRA score generation in summary only (not in worksheet).

---

## 📁 Files to Create (1 file)

### 1. `pdf-extractor/calculate-cra-score.js` ⭐ NEW
**Purpose**: Core CRA calculation engine

**Size**: ~500-600 lines

**Key Functions**:
- `calculateTable1Score(data)` - Nature, Scale & Complexity (7 factors)
- `calculateTable2Score(data)` - Products & Services (5 factors)
- `calculateTable3Score(data)` - Types of Clients (6 factors)
- `calculateTable4Score(data)` - Geography (2 factors)
- `calculateTable5Score(data)` - Delivery Channel (3 factors)
- `calculateCRAScore(mappedData)` - Main calculator
- `getRiskLevel(weightedScore)` - L1-L5 classifier
- `formatCRASummary(craResult)` - Format for display

---

## 📝 Files to Modify (1 file)

### 2. `pdf-extractor/server.js` ⭐ MODIFY
**Purpose**: Integrate CRA calculation into the processing flow

**Changes Required**:

#### Line ~8: Add Import
```javascript
const { calculateCRAScore, formatCRASummary } = require('./calculate-cra-score');
```

#### Line ~224: Calculate CRA Score (after mapping)
```javascript
// After: const mappedData = mappingResult.response.text();

// Calculate CRA Score
console.log('Calculating CRA score...');
const craScore = calculateCRAScore(mappedData);
const craSummary = formatCRASummary(craScore);
console.log('CRA Score:', craScore.weightedScore, 'Risk Level:', craScore.riskLevel);
```

#### Line ~225: Include CRA in AI Prompt
```javascript
const summaryPrompt = `Based on the following data, create an UNDERWRITER SUMMARY with BUSINESS RULE VALIDATION.

PROPOSAL DATA:
${mappedData}

ECM VALIDATION DATA:
${ecmData}

CRA RISK ASSESSMENT:
${craSummary}

UNDERWRITER SUMMARY REQUIREMENTS:
...
`;
```

#### Line ~272: Return CRA in Response (optional - for future UI display)
```javascript
res.json({
  success: true,
  mappedData: mappedData,
  underwriterSummary: underwriterSummary,
  craScore: craScore  // Add this for future use
});
```

**Estimated Changes**: ~15-20 lines added

---

## 🚫 Files NOT Modified (for now)

These files will NOT be changed in the initial implementation:

- ❌ `pdf-extractor/generate-docx-single-page.js` - No worksheet changes
- ❌ `pdf-extractor/generate-docx.js` - No worksheet changes
- ❌ `pdf-extractor/app-full.js` - No UI changes (summary only)
- ❌ `pdf-extractor/index.html` - No UI changes
- ❌ `pdf-extractor/app.js` - No UI changes

---

## 📊 Data Flow

```
┌─────────────────┐
│  PDF Upload     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Text    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Map to Fields   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Calculate CRA   │ ◄── NEW: calculate-cra-score.js
│ Score           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Format CRA      │
│ Summary         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate AI     │ ◄── MODIFIED: server.js (include CRA in prompt)
│ Summary         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display to User │
└─────────────────┘
```

---

## 🎯 Implementation Checklist

### Phase 1: Create CRA Calculator
- [ ] Create `calculate-cra-score.js`
- [ ] Implement Table 1 calculator (Nature, Scale & Complexity)
- [ ] Implement Table 2 calculator (Products & Services)
- [ ] Implement Table 3 calculator (Types of Clients)
- [ ] Implement Table 4 calculator (Geography)
- [ ] Implement Table 5 calculator (Delivery Channel)
- [ ] Implement weighted score calculation
- [ ] Implement risk level classification (L1-L5)
- [ ] Implement summary formatter
- [ ] Add data mapping logic (from extracted fields)
- [ ] Add manual verification flags

### Phase 2: Integrate into Server
- [ ] Import CRA calculator in `server.js`
- [ ] Call CRA calculator after data mapping
- [ ] Format CRA summary
- [ ] Include CRA in AI prompt
- [ ] (Optional) Return CRA in API response

### Phase 3: Test
- [ ] Test with low-risk scenario (L1)
- [ ] Test with medium-risk scenario (L3)
- [ ] Test with high-risk scenario (L5)
- [ ] Verify CRA appears in underwriter summary
- [ ] Verify calculations are correct
- [ ] Test with missing data fields

---

## 📋 Summary

**Total Files Impacted**: 2
- **1 New File**: `calculate-cra-score.js` (~500-600 lines)
- **1 Modified File**: `server.js` (~15-20 lines added)

**No Changes To**:
- Worksheet generation files
- UI files (HTML/JS)
- Other server files

**Result**: CRA score will appear in the AI-generated underwriter summary automatically.

---

## ⏱️ Estimated Effort

- Create CRA calculator: 2-3 hours
- Integrate into server: 30 minutes
- Testing: 1-2 hours
- **Total**: 4-5 hours

---

*Ready to proceed with implementation?*
