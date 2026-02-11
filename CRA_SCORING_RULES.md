# CRA (Credit Risk Assessment) Scoring Rules

## Overview
This document defines the complete CRA scoring system for underwriting risk assessment. The system evaluates multiple risk factors across different categories to calculate a comprehensive risk score.

---

## Table 1: Nature, Scale & Complexity

**Score Range**: 7 (minimum) to 35 (maximum)  
**Default Starting Score**: 7

### Risk Factors

#### 1. Source of Funds (Payment of Premium)
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Salary |
| **Medium** | 3 | Other disclosed income (e.g., rental income, inheritance, sale of property) |
| **High** | 5 | Donations/Sponsorship/Undefined/Others |

---

#### 2. Relationship with Payer
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Self, Father, Mother, Spouse, Children, Employer |
| **Medium** | 3 | Brother, Sister, In-laws |
| **High** | 5 | Any Other |

---

#### 3. Payment by Bank Transfers/Standing Orders
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | < 100,000 (One-off) OR Up to 25,000 (monthly) |
| **Medium** | 3 | 100,000 and up to 500,000 (One-off) OR Above 25,000 and Up to 50,000 (monthly) |
| **High** | 5 | Above 500,000 (One-off) OR Above 50,000 (monthly) |

---

#### 4. Significant/Unusual Cash (MUR)
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | < 50,000 (One-off) OR Up to 10,000 (monthly) |
| **Medium** | 3 | 50,000 and up to 250,000 (One-off) OR Above 10,000 and up to 25,000 (monthly) |
| **High** | 5 | Above 250,000 (One-off) OR Above 25,000 (monthly) |

---

#### 5. International Payments To and From Countries
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Low Risk Countries (Centralised List) |
| **Medium** | 3 | Medium Risk Countries (Centralised List) |
| **High** | 5 | High Risk Countries (Centralised List) |

---

#### 6. Frequency of Churning / Early Cancellation
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | None or Once in 5 years |
| **Medium** | 3 | Twice in 5 years |
| **High** | 5 | More than 2 times in 5 years |

---

#### 7. Payment Amount on Aggregate Portfolio as a % of Declared Income
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Estimated at Within 15% of Income |
| **Medium** | 3 | Estimated between 15% to 50% of Declared Income |
| **High** | 5 | Estimated at over 50% of Declared Income |

---

### Table 1 Summary
- **Total Factors**: 7
- **Minimum Score**: 7 (all factors at score 1)
- **Maximum Score**: 35 (all factors at score 5)
- **Default Score**: 7

---

## Table 2: Types Products & Services

**Score Range**: 1 (minimum) to 25 (maximum)  
**Default Starting Score**: 7

### Risk Factors

#### 1. Life Insurance Product
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Level Term Assurance, Decreasing Term Assurance |
| **Medium** | 3 | Cash Back Plans, Endowment Plans, Motor Insurance |
| **High** | 5 | Maxi Saver |

---

#### 2. General Insurance Product
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Health Insurance Plans |
| **Medium** | 3 | Fire & Allied Perils |
| **High** | 5 | N/A |

---

#### 3. Pension Products
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Personal Pension Plans, Group Pension Scheme |
| **Medium** | 3 | Annuity Plan |
| **High** | 5 | N/A |

---

#### 4. Lending Products
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Policy Loan, Car Loan |
| **Medium** | 3 | Mortgage, Multi-Purpose Loan |
| **High** | 5 | N/A |

---

#### 5. Group Schemes
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Bancassurance, Employer Schemes |
| **Medium** | 3 | Credit Union Schemes |
| **High** | 5 | N/A |

---

### Table 2 Summary
- **Total Factors**: 5
- **Minimum Score**: 1 (lowest risk product)
- **Maximum Score**: 25 (all factors at score 5)
- **Default Score**: 7

---

## Table 3: Type of Clients

**Score Range**: 6 (minimum) to 30 (maximum)  
**Default Starting Score**: 6

### Risk Factors

#### 1. Type of Legal Structure
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Individual / Listed or Regulated Entity / Government-owned Entity / Gov. Administration |
| **Medium** | 3 | Sole Trader / Private Company / Partnership |
| **High** | 5 | Trusts / Foundations / Association / Others |

---

#### 2. Type of Activity / Occupation / Dealing
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Others |
| **Medium** | 3 | Medical Practitioners / Teachers / Hawkers / Contractors (Self Employed) |
| **High** | 5 | Casinos, Jewellers, Accountants and Lawyers and any cash intensive businesses |

---

#### 3. Ultimate Beneficiary Owner
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Self |
| **Medium** | 3 | Family (Mother, Father, Children, Spouse, Brother, Sister) |
| **High** | 5 | Other |

---

#### 4. Profile of Client
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Others |
| **Medium** | 3 | Revoked Attachment or Restraining Orders, Client on Disclosure Orders |
| **High** | 5 | PEP |

---

#### 5. Client on Restriction List
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | None |
| **Medium** | 3 | None |
| **High** | 5 | Clients on Attachment or Restraining Orders or International Blacklist* (*Halt & Block) |

---

#### 6. Customer Claims Pattern
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | No history of high value claims (C/R < 100%) |
| **Medium** | 3 | History of high value claims (C/R between 200-550%), early claims (1-3 Years for Life, <1-3 Mths for GI) |
| **High** | 5 | History of high value claims (C/R > 550%), early claims (<1-Year for Life, <1-Mth for GI) or frequent churning |

---

### Table 3 Summary
- **Total Factors**: 6
- **Minimum Score**: 6 (all factors at score 1)
- **Maximum Score**: 30 (all factors at score 5)
- **Default Score**: 6

**Note**: C/R = Claims Ratio

---

## Table 4: Geography

**Score Range**: 2 (minimum) to 10 (maximum)  
**Default Starting Score**: 2

### Risk Factors

#### 1. Nationality of Policyholder, Payer or Beneficiary
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Low Risk Countries (Centralised List) & Mauritius |
| **Medium** | 3 | Medium Risk Countries (Centralised List) |
| **High** | 5 | High Risk Countries (Centralised List) |

---

#### 2. Place of Residence / Work / Business Dealing of Policyholder, Payer or Beneficiary
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Low Risk Countries (Centralised List) & Mauritius |
| **Medium** | 3 | Medium Risk Countries (Centralised List) |
| **High** | 5 | High Risk Countries (Centralised List) |

---

### Table 4 Summary
- **Total Factors**: 2
- **Minimum Score**: 2 (all factors at score 1)
- **Maximum Score**: 10 (all factors at score 5)
- **Default Score**: 2

**Note**: This table evaluates geographic risk based on centralized country risk lists. Mauritius is considered low risk by default.

---

## Table 5: Delivery Channel

**Score Range**: 2 (minimum) to 13 (maximum)  
**Default Starting Score**: 4

### Risk Factors

#### 1. Identification of Client
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Face to Face |
| **Medium** | 3 | (Not specified) |
| **High** | 5 | Non face to face (Email, Phone, Text, Virtual) |

---

#### 2. Walk-in Clients (New)
**Score Range**: 0-3

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 0 | N/A |
| **Medium** | 3 | Yes |
| **High** | - | N/A |

---

#### 3. Type of Intermediary
**Score Range**: 1-5

| Risk Level | Score | Criteria |
|------------|-------|----------|
| **Low** | 1 | Banks |
| **Medium** | 3 | Licensed Insurance Salespersons, Licensed Brokers / Direct Tenders |
| **High** | 5 | Non-regulated Business Introducers / Others |

---

### Table 5 Summary
- **Total Factors**: 3
- **Minimum Score**: 2 (lowest risk delivery channel)
- **Maximum Score**: 13 (all factors at highest risk)
- **Default Score**: 4

**Note**: This table evaluates risk based on how the client is acquired and serviced. Face-to-face identification and bank channels are considered lowest risk.

---

## Final CRA Score Calculation

### Weighted Scoring Matrix

Each of the 5 dimensions is assigned a weight based on its importance to overall risk assessment:

| CRA Dimension | Min Score | Max Score | Weight | Notes |
|---------------|-----------|-----------|--------|-------|
| **Nature, Scale & Complexity** | 7 | 35 | **30%** | Highest weight - payment patterns and transaction complexity |
| **Products & Services** | 1 | 25 | **10%** | Type of insurance/financial products |
| **Types of Clients** | 6 | 30 | **35%** | Highest weight - client profile and behavior |
| **Geography** | 2 | 10 | **15%** | Country risk assessment |
| **Channel** | 2 | 13 | **10%** | Delivery and intermediary risk |
| **TOTAL** | **18** | **113** | **100%** | Sum of all dimensions |

---

### Calculation Formula

```
CRA Weighted Score = 
  (Table 1 Score / 35) × 0.30 +
  (Table 2 Score / 25) × 0.10 +
  (Table 3 Score / 30) × 0.35 +
  (Table 4 Score / 10) × 0.15 +
  (Table 5 Score / 13) × 0.10
```

**Example Calculation** (using default/minimum scores):
```
Actual CRA Score = 26 (sum of actual scores from all tables)

CRA Weighted Score = 
  (7/35) × 0.30 = 0.06 +
  (7/25) × 0.10 = 0.03 +
  (6/30) × 0.35 = 0.07 +
  (2/10) × 0.15 = 0.03 +
  (4/13) × 0.10 = 0.03
  = 0.22
```

---

### Risk Categories

Based on the final CRA Weighted Score, clients are classified into risk levels:

| Risk Level | Score Range | Action Required |
|------------|-------------|-----------------|
| **L1 (Low Risk)** | 0.21 - 0.29 | Standard processing |
| **L2 (Low-Medium Risk)** | 0.30 - 0.39 | Enhanced monitoring |
| **L3 (Medium Risk)** | 0.40 - 0.49 | Additional due diligence |
| **L4 (Medium-High Risk)** | 0.50 - 0.59 | Senior approval required |
| **L5 (High Risk)** | 0.60 and above | **Halt Transaction & Escalate** |

---

### Key Insights

1. **Highest Impact Factors**:
   - Types of Clients (35% weight) - Most important
   - Nature, Scale & Complexity (30% weight) - Second most important
   
2. **Moderate Impact Factors**:
   - Geography (15% weight)
   
3. **Lower Impact Factors**:
   - Products & Services (10% weight)
   - Channel (10% weight)

4. **Critical Thresholds**:
   - Score ≥ 0.60 triggers immediate halt and escalation
   - Score ≥ 0.50 requires senior management approval
   - Score < 0.30 allows standard processing

---

## Implementation Notes

### Data Requirements
From the extracted PDF data, we will need:
- Premium payment amount and frequency
- Source of funds information
- Payer relationship
- Payment method details
- Cash transaction amounts
- International payment indicators
- Policy history (churning/cancellation)
- Declared income
- [Additional fields from remaining tables...]

### Calculation Logic
The CRA score calculator will:
1. Extract relevant data from the parsed PDF
2. Apply scoring rules from each table
3. Sum up scores across all tables
4. Determine final risk category
5. Include score breakdown in the underwriting summary

---

*Document Status: In Progress - Awaiting Tables 2-5*


---

## Implementation Approach

### Phase 1: Data Extraction Enhancement
We need to extract additional fields from the PDF to support CRA scoring:

**From Proposal Form:**
- Source of funds
- Relationship with payer
- Payment method and amounts
- Cash transaction details
- International payment indicators
- Occupation/business type
- Legal structure
- Ultimate beneficiary owner
- PEP status
- Claims history
- Nationality and residence
- Intermediary type
- Identification method (face-to-face vs remote)

### Phase 2: CRA Calculator Module
Create a new module `calculate-cra-score.js` with:

1. **Individual Table Calculators**:
   - `calculateTable1Score(data)` - Nature, Scale & Complexity
   - `calculateTable2Score(data)` - Products & Services
   - `calculateTable3Score(data)` - Types of Clients
   - `calculateTable4Score(data)` - Geography
   - `calculateTable5Score(data)` - Delivery Channel

2. **Weighted Score Calculator**:
   - `calculateWeightedCRAScore(tableScores)` - Apply weights and calculate final score

3. **Risk Level Classifier**:
   - `getRiskLevel(weightedScore)` - Return L1, L2, L3, L4, or L5

4. **Score Breakdown Generator**:
   - `generateCRABreakdown(data)` - Return detailed breakdown for summary

### Phase 3: Integration
1. Call CRA calculator after PDF extraction
2. Include CRA score and breakdown in underwriting summary
3. Display in worksheet:
   - CRA Weighted Score field
   - CRA Risk Score field (L1-L5)
   - Optional: Breakdown by dimension

### Phase 4: Summary Enhancement
Add to underwriting summary:
```
CRA RISK ASSESSMENT:
- Overall CRA Score: 0.22 (L1 - Low Risk)
- Nature, Scale & Complexity: 7/35 (Weight: 30%, Contribution: 0.06)
- Products & Services: 7/25 (Weight: 10%, Contribution: 0.03)
- Types of Clients: 6/30 (Weight: 35%, Contribution: 0.07)
- Geography: 2/10 (Weight: 15%, Contribution: 0.03)
- Channel: 4/13 (Weight: 10%, Contribution: 0.03)

RECOMMENDATION: Standard processing approved
```

---

## Data Mapping Requirements

### Fields Currently Available
- Name, Age, Occupation
- Premium amount
- Plan type
- Sum at risk
- BMI, smoking, alcohol

### Fields Needed (to be extracted)
- Source of funds
- Payer relationship
- Payment frequency
- Cash vs bank transfer
- International payments
- Legal structure
- Beneficiary details
- PEP indicators
- Claims history
- Nationality/residence
- Intermediary information
- Identification method

---

## Next Steps

1. **Review and Approve**: Review this complete documentation
2. **Data Extraction**: Enhance PDF extraction to capture CRA-related fields
3. **Build Calculator**: Implement the CRA scoring module
4. **Test**: Test with sample data
5. **Integrate**: Add to worksheet generation
6. **Validate**: Ensure calculations match expected results

---

*Document Status: Complete - Ready for Implementation Approval*
