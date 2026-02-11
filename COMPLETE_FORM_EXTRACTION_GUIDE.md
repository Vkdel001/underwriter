# Complete NIC Life Insurance Proposal Form - Extraction Guide

## Form Structure (6 Pages)

### Page 1: Details of Life Proposed
**Key Fields:**
- Serial No/LID: 93212
- Effective Date: 01/12/2025
- Name: Mulloo Chitra Devi
- DOB: 05/12/1969
- Gender: Female, Marital Status: Married
- Nationality: Mauritian
- ID: G9115360
- Address: Petite Julie, Mauritius
- Occupation: Clerical Officer
- Company: Mauritius Commercial Bank, 15 years service
- **Height: 1M 55 cms** (handwritten)
- **Weight: 69 kgs** (handwritten)
- Smoking: No, Alcohol: No

### Page 2: Choice of Plan & Family History
**Plan Details:**
- Basic Plan: Prosperity Plan
- Sum Assured: 900,798 MUR
- Term: 20 years
- Basic Premium: 1,860.00 MUR
- Riders:
  * Additional Death Cover: ✓ (98.53 MUR)
  * Critical Illness Benefit: ✓ (85.72 MUR)
- Policy Fee: 25.00 MUR
- **Total Premium: 2,069.25 MUR**
- Frequency: Monthly

**General Information (Health Questions Q1-Q5):**
- All answered with checkmarks (need to extract Yes/No)

**Family History:**
- **Father:** Deceased, Age at Death: 57, Cause: Natural
- **Mother:** Deceased, Age at Death: 73, Cause: Old age
- **Brothers:** 3 living
  * Brother 1: Present Age: 117, Condition: Good
  * Brother 2: Present Age: 118, Condition: Good
  * Brother 3: Present Age: 118, Condition: Good
- **Sisters:** NIL

### Page 3: Communication & Declaration
**Communication:**
- Mode: By Post (checked)

**Declaration:**
- Consent for electronic delivery: ✓

**First Life Assured:**
- Full Name: Mulloo Chitra Devi
- Relationship: Self and Spouse
- Signature: CMulloo
- Date: 15/12/2025

### Page 4: Payer & Beneficiary
**Payer:**
- Self (CS) - Same as Insured

**Salary & Payment:**
- Salary Range: 25,001-30,000 MUR
- Source of Funds: Salary
- First Payment: Cash
- Premium Payment: Standing Order
- Bank: MCB

**Beneficiary:**
- Surname: Mulloo
- Other Name: Neeraj Kumar
- Contact: 57106173
- Relationship: Husband
- Share: 100%

**Policy Owner:**
- Same as Insured

### Page 5: Personal History (Health Questions)
**Section 6 - Detailed Health Questions:**

Extract all Q1-Q24+ with Yes/No status:
- Q1: Are you presently in good health? ✓ (Yes)
- Q2: Medication or treatment? ✓ (No)
- Q3: Medical attention past 5 years? ✓ (No)
- Q4: Alcohol/drugs advice? ✓ (No)
- Q5: Disability illness? ✓ (No)
- Q6: Covid-19 test? ✓ (No)
- Q7: Covid-19 contact? ✓ (No)
- Q8-Q24: Various medical conditions - all checked as No

**Diagnosis Table:**
- Empty (no medical conditions to report)

### Page 6: Declaration & Checklist
**Company Intermediary Declaration:**
- Q1-Q5: All answered Yes
- Date: 15/12/2025

**Insurance Salesperson:**
- First Name: Audhooa Ushtaa
- Code: 2707
- Branch: Flacq
- Commission: 100%
- Signature: U. Audhooa
- Date: 15/12/2025

**Checklist:**
- Items 1-5: All checked
- Existing Policies: None listed

**Signatures:**
- Reporting Line: Lowna Rowind, Date: 15/12/2025
- Senior Sales Unit Manager: Siva Rowind, Date: 15/12/2025
- Customer Service: Kemsha Suchado, Date: 15/12/2025

---

## Critical Extraction Points

### 1. Family History Table (Page 2)
**Table Structure:**
```
| Family   | Present | Present   | Age of | Cause of |
| Member   | Age     | Condition | Death  | Death    |
|----------|---------|-----------|--------|----------|
| Father   | —       | —         | 57     | Natural  |
| Mother   | —       | —         | 73     | Old age  |
| Brother1 | 117     | Good      | —      | —        |
| Brother2 | 118     | Good      | —      | —        |
| Brother3 | 118     | Good      | —      | —        |
| Sisters  | NIL     | —         | —      | —        |
```

**Extraction Rule:**
- If "Age of Death" has value → DECEASED (ignore Present columns)
- If "Present Age" has value → LIVING (ignore Death columns)
- Never mix columns

### 2. Physical Measurements (Page 1)
**Handwritten Fields:**
- Height: Look for "1 M 55" or "155 cms"
- Weight: Look for "69" in the weight field
- These are often faint or unclear - examine carefully

### 3. Health Questions (Page 5)
**Checkbox Pattern:**
- ✓ in "Yes" column = Yes
- ✓ in "No" column = No
- Extract all 24+ questions with their answers

### 4. Riders (Page 2)
**Checkbox + Premium:**
- Additional Death Cover: ✓ → Premium: 98.53
- Critical Illness: ✓ → Premium: 85.72
- Others: No checkmark → Not selected

### 5. Beneficiary (Page 4)
**Must Total 100%:**
- Mulloo Neeraj Kumar: 100%
- Verify percentages add up

---

## Common Extraction Errors & Fixes

### Error 1: Family History Confusion
**Wrong:**
```
Mother: Age 73, Present Condition: Good, Cause of Death: Old age
```

**Correct:**
```
Mother: Deceased, Age at Death: 73, Cause: Old age
```

**Fix:** Check which columns have data, don't mix living/deceased

### Error 2: Missing Weight
**Wrong:**
```
Height: 155 cms, Weight: (Blank)
```

**Correct:**
```
Height: 155 cms, Weight: 69 kgs
```

**Fix:** Look more carefully at handwritten numbers, trigger re-extraction

### Error 3: Health Questions Incomplete
**Wrong:**
```
Health Questions: Answered
```

**Correct:**
```
Q1: Are you in good health? Yes
Q2: Taking medication? No
Q3: Medical attention past 5 years? No
... (all 24+ questions)
```

**Fix:** Extract each question individually with Yes/No

### Error 4: Rider Premiums Missing
**Wrong:**
```
Riders: Additional Death, Critical Illness
```

**Correct:**
```
Riders:
- Additional Death Cover: 98.53 MUR
- Critical Illness: 85.72 MUR
Total Rider Premium: 184.25 MUR
```

**Fix:** Extract both checkbox status AND premium amounts

---

## Validation Checklist

After extraction, verify:

✅ **Personal Details:**
- [ ] Name extracted correctly
- [ ] DOB in DD/MM/YYYY format
- [ ] Height AND Weight both present
- [ ] Occupation and employer correct

✅ **Plan Details:**
- [ ] Plan name correct
- [ ] Sum Assured amount correct
- [ ] Term in years
- [ ] All rider premiums extracted
- [ ] Total premium matches sum

✅ **Family History:**
- [ ] Each family member has clear Living/Deceased status
- [ ] No mixing of living and deceased data
- [ ] Ages and conditions/causes correct

✅ **Health Questions:**
- [ ] All questions extracted (Q1-Q24+)
- [ ] Each has Yes or No answer
- [ ] Any "Yes" answers have details

✅ **Beneficiary:**
- [ ] All beneficiaries listed
- [ ] Percentages total 100%
- [ ] Relationships correct

✅ **Payment:**
- [ ] Salary range correct
- [ ] Payment method extracted
- [ ] Bank details if applicable

✅ **Dates:**
- [ ] All dates in DD/MM/YYYY format
- [ ] Effective date correct
- [ ] Signature dates correct

---

## Expected Extraction Output Format

```
=== NIC LIFE INSURANCE PROPOSAL FORM ===

SECTION 1: DETAILS OF LIFE PROPOSED
Serial No: 93212
Effective Date: 01/12/2025
Name: Mulloo Chitra Devi
DOB: 05/12/1969
Gender: Female
Marital Status: Married
Nationality: Mauritian
ID: G9115360
Address: Petite Julie, Mauritius
Occupation: Clerical Officer
Company: Mauritius Commercial Bank (15 years)
Height: 1M 55 cms (1.55m)
Weight: 69 kgs
BMI: 28.7 (calculated)
Smoking: No
Alcohol: No

SECTION 3: CHOICE OF PLAN
Basic Plan: Prosperity Plan
Sum Assured: 900,798 MUR
Term: 20 years
Basic Premium: 1,860.00 MUR

Riders:
- Additional Death Cover: ✓ Premium: 98.53 MUR
- Critical Illness Benefit: ✓ Premium: 85.72 MUR

Policy Fee: 25.00 MUR
Total Premium: 2,069.25 MUR
Frequency: Monthly

SECTION 4: GENERAL INFORMATION
Q1: [Answer]
Q2: [Answer]
Q3: [Answer]
Q4: [Answer]
Q5: [Answer]

SECTION 5: FAMILY HISTORY
Father: Deceased, Age at Death: 57, Cause: Natural
Mother: Deceased, Age at Death: 73, Cause: Old age
Brothers:
  1. Living, Present Age: 117, Condition: Good
  2. Living, Present Age: 118, Condition: Good
  3. Living, Present Age: 118, Condition: Good
Sisters: NIL

SECTION 6: PERSONAL HISTORY (Health Questions)
Q1: Are you presently in good health? Yes
Q2: Taking medication or treatment? No
Q3: Medical attention past 5 years? No
... (all questions)

SECTION 8: SALARY & PAYMENT
Salary Range: 25,001-30,000 MUR
Source of Funds: Salary
First Payment: Cash
Premium Payment: Standing Order
Bank: MCB

SECTION 9: BENEFICIARY DETAILS
1. Mulloo Neeraj Kumar
   Contact: 57106173
   Relationship: Husband
   Share: 100%

SECTION 10: POLICY OWNER
Same as Insured

SECTION 11: COMMUNICATION
Mode: By Post

DECLARATION
Date: 15/12/2025
Insurance Salesperson: Audhooa Ushtaa (Code: 2707)
Branch: Flacq
Commission: 100%

SIGNATURES
First Life Assured: CMulloo, Date: 15/12/2025
Reporting Line: Lowna Rowind, Date: 15/12/2025
Senior Sales Unit Manager: Siva Rowind, Date: 15/12/2025
Customer Service: Kemsha Suchado, Date: 15/12/2025
```

---

## Testing the Extraction

1. **Upload the 6-page proposal form**
2. **Check for these specific items:**
   - Weight: Should be 69 kgs (not blank)
   - Mother: Should be "Deceased, Age 73, Cause: Old age" (not mixed with "Good condition")
   - Brothers: Should be "Living, Ages 117/118/118, Condition: Good"
   - All health questions extracted
   - All rider premiums included
   - Total premium: 2,069.25 MUR

3. **Look for correction sections:**
   - "--- CORRECTED FAMILY HISTORY ---" if family data was mixed
   - "--- FOCUSED PHYSICAL MEASUREMENTS RE-EXTRACTION ---" if weight was missing

4. **Verify calculations:**
   - BMI = 69 / (1.55)² = 28.7
   - Total Premium = 1,860 + 98.53 + 85.72 + 25 = 2,069.25 ✓

---

**Status:** ✅ Comprehensive extraction prompt implemented
**Date:** February 6, 2026
**Form:** NIC Life Insurance Proposal Form (6 pages)
**Test Case:** Mulloo Chitra Devi application
