# CRA Score Calculator - Implementation Plan

## Overview
Implement CRA (Credit Risk Assessment) scoring to be included in the underwriter summary only (not in the worksheet for now).

---

## Files to be Created

### 1. `pdf-extractor/calculate-cra-score.js` (NEW FILE)
**Purpose**: Core CRA calculation logic

**Functions to implement**:
```javascript
// Table calculators
function calculateTable1Score(data) { /* Nature, Scale & Complexity */ }
function calculateTable2Score(data) { /* Products & Services */ }
function calculateTable3Score(data) { /* Types of Clients */ }
function calculateTable4Score(data) { /* Geography */ }
function calculateTable5Score(data) { /* Delivery Channel */ }

// Main calculator
function calculateCRAScore(extractedData) {
  // Returns: { 
  //   table1: 7, table2: 7, table3: 6, table4: 2, table5: 4,
  //   totalScore: 26,
  //   weightedScore: 0.22,
  //   riskLevel: 'L1',
  //   breakdown: {...}
  // }
}

// Risk level classifier
function getRiskLevel(weightedScore) {
  // Returns: 'L1', 'L2', 'L3', 'L4', or 'L5'
}

// Summary formatter
function formatCRASummary(craResult) {
  // Returns formatted text for inclusion in underwriter summary
}

module.exports = { calculateCRAScore, formatCRASummary };
```

---

## Files to be Modified

### 2. `pdf-extractor/server.js` (MODIFY)
**Changes needed**:

#### Import the CRA calculator
```javascript
const { calculateCRAScore, formatCRASummary } = require('./calculate-cra-score');
```

#### Add CRA calculation after mapping (around line 224)
```javascript
// After: const mappedData = mappingResult.response.text();

// Calculate CRA Score
const craScore = calculateCRAScore(mappedData);
const craSummary = formatCRASummary(craScore);
```

#### Include CRA in summary prompt (around line 225)
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

#### Return CRA data in response (around line 272)
```javascript
res.json({
  success: true,
  mappedData: mappedData,
  underwriterSummary: underwriterSummary,
  craScore: craScore  // Add this
});
```

---

### 3. `pdf-extractor/app-full.js` (MODIFY - Optional for now)
**Changes needed** (if we want to display CRA in UI):

#### Store CRA data globally (around line 29)
```javascript
let craScoreGlobal = null;
```

#### Save CRA data from response (around line 379)
```javascript
craScoreGlobal = data.craScore;
```

#### Display CRA score in UI (optional - can add later)
```javascript
// Add a new section to show CRA score visually
if (data.craScore) {
    // Display risk level badge (L1, L2, L3, L4, L5)
    // Show weighted score
}
```

---

## Implementation Steps

### Step 1: Create CRA Calculator Module
1. Create `pdf-extractor/calculate-cra-score.js`
2. Implement all 5 table calculators
3. Implement weighted score calculation
4. Implement risk level classification
5. Implement summary formatter
6. Add comprehensive comments

### Step 2: Modify Server
1. Import CRA calculator in `server.js`
2. Call CRA calculator after data mapping
3. Include CRA summary in AI prompt
4. Return CRA data in API response

### Step 3: Test
1. Test with sample data
2. Verify calculations match expected results
3. Check that CRA summary appears in underwriter summary
4. Validate risk level classifications

### Step 4: Optional UI Enhancement (Future)
1. Display CRA score badge in UI
2. Show breakdown by dimension
3. Add visual risk indicator

---

## Data Availability Analysis

### ✅ Available from PDF Extraction:
- Name, Age, Occupation
- Premium amount
- Plan type
- Sum at risk
- BMI, smoking, alcohol
- Gender, Term
- **Payment frequency** - From "Frequency of Premium Payment" in summary
- **Payment method** - From "First Payment Method" in summary
- **Beneficiary details** - Already in summary
- **Nationality/residence** - Available in summary
- **Intermediary information** - Available in summary

### 🔄 Can Be Inferred:
- **Source of funds** - Default to "Salary" (low risk) unless occupation suggests otherwise
- **Payer relationship** - If policy is for self (ID matches), score as "Self" (low risk)
- **International payments** - Check from "First Payment Method" field
- **Legal structure** - If individual, treat as low risk
- **Identification method** - If agent has signed, treat as face-to-face (low risk)

### ⚠️ Requires Manual Verification:
- **PEP indicators** - Default to "No" but flag for user to recheck
- **Claims history** - Ask user to check in iGAS system

### Data Mapping Strategy:

| CRA Field | Source | Logic |
|-----------|--------|-------|
| Source of funds | Occupation | If "Business Owner/Director" → Medium risk, else "Salary" → Low risk |
| Payer relationship | Policy holder ID | If self → "Self" (Low), else → "Other" (High) |
| Payment frequency | "Frequency of Premium Payment" | Monthly/Annual from summary |
| Payment method | "First Payment Method" | Bank transfer/Cash/Cheque |
| International payments | "First Payment Method" | Check for international indicators |
| Legal structure | Applicant type | Individual → Low risk |
| Beneficiary | "Beneficiary" field | Already extracted |
| PEP status | Default | "No" + flag for manual check |
| Claims history | Manual | Flag for iGAS check |
| Nationality | Summary | Already extracted |
| Intermediary | "Agent/Broker" field | Already extracted |
| Identification | Agent signature | If signed → Face-to-face (Low risk) |

---

## CRA Summary Format

The CRA summary will be added to the underwriter summary as:

```
═══════════════════════════════════════════════════════════
CRA RISK ASSESSMENT
═══════════════════════════════════════════════════════════

Overall CRA Score: 0.22 (L1 - LOW RISK)

Dimension Breakdown:
• Nature, Scale & Complexity: 7/35 (30% weight) → 0.06
• Products & Services: 7/25 (10% weight) → 0.03
• Types of Clients: 6/30 (35% weight) → 0.07
• Geography: 2/10 (15% weight) → 0.03
• Delivery Channel: 4/13 (10% weight) → 0.03

Risk Classification: L1 - LOW RISK
Recommendation: Standard processing approved

Note: Some CRA factors were estimated based on available data.
Manual review recommended for complete assessment.

═══════════════════════════════════════════════════════════
```

---

## Testing Scenarios

### Test Case 1: Minimum Risk (L1)
- All factors at lowest risk
- Expected: Score ~0.21-0.25, Level L1

### Test Case 2: Medium Risk (L3)
- Mix of medium risk factors
- Expected: Score ~0.40-0.45, Level L3

### Test Case 3: High Risk (L5)
- Multiple high-risk factors
- Expected: Score ≥0.60, Level L5, Halt & Escalate

---

## Timeline Estimate

- **Step 1** (CRA Calculator): 2-3 hours
- **Step 2** (Server Integration): 1 hour
- **Step 3** (Testing): 1-2 hours
- **Total**: 4-6 hours of development

---

## Approval Checklist

Before implementation, please confirm:
- [ ] Approach is acceptable
- [ ] CRA summary format is appropriate
- [ ] Default values strategy for missing data is acceptable
- [ ] No need for UI display initially (summary only)
- [ ] Ready to proceed with code changes

---

*Status: Awaiting Approval to Proceed*
