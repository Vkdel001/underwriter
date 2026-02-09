/**
 * CRA (Credit Risk Assessment) Score Calculator
 * 
 * Calculates risk scores across 5 dimensions:
 * 1. Nature, Scale & Complexity (30% weight)
 * 2. Products & Services (10% weight)
 * 3. Types of Clients (35% weight)
 * 4. Geography (15% weight)
 * 5. Delivery Channel (10% weight)
 * 
 * Risk Levels: L1 (0.21-0.29), L2 (0.30-0.39), L3 (0.40-0.49), L4 (0.50-0.59), L5 (0.60+)
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractValue(text, ...regexPatterns) {
  for (const regex of regexPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function parseAmount(text) {
  if (!text) return 0;
  const cleaned = String(text).replace(/[,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

// ============================================================================
// TABLE 1: NATURE, SCALE & COMPLEXITY (7 factors, max 35, weight 30%)
// ============================================================================

function calculateTable1Score(data) {
  let score = 7; // Default minimum
  const factors = {};
  
  // Factor 1: Source of funds (1-5)
  const occupation = extractValue(data, /Occupation:\*\*\s*(.+?)(?:\n|$)/i);
  const salaryRange = extractValue(data, /Salary Range.*?:\*\*\s*(.+?)(?:\n|$)/i);
  
  // Check actual salary range from the form
  if (salaryRange.includes('25,001') || salaryRange.includes('25001') || 
      salaryRange.includes('30,000') || salaryRange.includes('30000') ||
      salaryRange.includes('Above 30,000') || salaryRange.includes('Above 30000')) {
    factors.sourceOfFunds = 1; // Salary with good range - Low risk
  } else if (occupation.toLowerCase().includes('business') || occupation.toLowerCase().includes('director')) {
    factors.sourceOfFunds = 3; // Business income - Medium risk
  } else {
    factors.sourceOfFunds = 1; // Salary - Low risk (default)
  }
  
  // Factor 2: Relationship with Payer (1-5)
  // If policy is for self, score 1 (low risk)
  factors.payerRelationship = 1; // Default: Self
  
  // Factor 3: Payment by Bank transfers/standing orders (1-5)
  const premium = parseAmount(extractValue(data, /Total Monthly Premium.*?MUR\s*([\d,.]+)/i));
  const paymentFreq = extractValue(data, /Frequency of Premium Payment:\*\*\s*(.+?)(?:\n|$)/i);
  
  if (paymentFreq.toLowerCase().includes('monthly')) {
    if (premium < 25000) factors.bankTransfer = 1;
    else if (premium <= 50000) factors.bankTransfer = 3;
    else factors.bankTransfer = 5;
  } else {
    // One-off
    if (premium < 100000) factors.bankTransfer = 1;
    else if (premium <= 500000) factors.bankTransfer = 3;
    else factors.bankTransfer = 5;
  }
  
  // Factor 4: Significant/unusual cash (1-5)
  const paymentMethod = extractValue(data, /First Payment Method:\*\*\s*(.+?)(?:\n|$)/i);
  if (paymentMethod.toLowerCase().includes('cash')) {
    if (premium < 50000) factors.cash = 1;
    else if (premium <= 250000) factors.cash = 3;
    else factors.cash = 5;
  } else {
    factors.cash = 1; // No cash - low risk
  }
  
  // Factor 5: International payments (1-5)
  if (paymentMethod.toLowerCase().includes('international') || 
      paymentMethod.toLowerCase().includes('foreign')) {
    factors.international = 3; // Medium risk by default
  } else {
    factors.international = 1; // Local - low risk
  }
  
  // Factor 6: Frequency of churning/early cancellation (1-5)
  factors.churning = 1; // Default: None or once in 5 years
  
  // Factor 7: Payment amount as % of declared income (1-5)
  factors.incomeRatio = 1; // Default: Within 15% (need income data for accurate calc)
  
  score = factors.sourceOfFunds + factors.payerRelationship + factors.bankTransfer + 
          factors.cash + factors.international + factors.churning + factors.incomeRatio;
  
  return { score, factors, max: 35 };
}

// ============================================================================
// TABLE 2: PRODUCTS & SERVICES (5 factors, max 25, weight 10%)
// ============================================================================

function calculateTable2Score(data) {
  let score = 1; // Default minimum
  const factors = {};
  
  const planName = extractValue(data, /Plan Proposed:\*\*\s*(.+?)(?:\n|$)/i, /Plan Name:\*\*\s*(.+?)(?:\n|$)/i);
  const planLower = planName.toLowerCase();
  
  // Factor 1: Life Insurance Product (1-5)
  if (planLower.includes('term') || planLower.includes('decreasing')) {
    factors.lifeProduct = 1; // Low risk
  } else if (planLower.includes('cash back') || planLower.includes('endowment') || planLower.includes('motor')) {
    factors.lifeProduct = 3; // Medium risk
  } else if (planLower.includes('maxi saver')) {
    factors.lifeProduct = 5; // High risk
  } else {
    factors.lifeProduct = 1; // Default low
  }
  
  // Factor 2: General Insurance Product (1-5)
  factors.generalProduct = 1; // Default: N/A or low risk
  
  // Factor 3: Pension Products (1-5)
  factors.pensionProduct = 1; // Default: N/A or low risk
  
  // Factor 4: Lending Products (1-5)
  factors.lendingProduct = 1; // Default: N/A or low risk
  
  // Factor 5: Group Schemes (1-5)
  factors.groupScheme = 1; // Default: N/A or low risk
  
  score = factors.lifeProduct + factors.generalProduct + factors.pensionProduct + 
          factors.lendingProduct + factors.groupScheme;
  
  return { score, factors, max: 25 };
}

// ============================================================================
// TABLE 3: TYPES OF CLIENTS (6 factors, max 30, weight 35%)
// ============================================================================

function calculateTable3Score(data, manualVerification = null) {
  let score = 6; // Default minimum
  const factors = {};
  
  // Factor 1: Type of Legal Structure (1-5)
  factors.legalStructure = 1; // Default: Individual - low risk
  
  // Factor 2: Type of Activity/Occupation (1-5)
  const occupation = extractValue(data, /Occupation:\*\*\s*(.+?)(?:\n|$)/i);
  const occLower = occupation.toLowerCase();
  
  if (occLower.includes('casino') || occLower.includes('jeweller') || 
      occLower.includes('accountant') || occLower.includes('lawyer')) {
    factors.occupation = 5; // High risk - cash intensive
  } else if (occLower.includes('medical') || occLower.includes('teacher') || 
             occLower.includes('contractor') || occLower.includes('hawker')) {
    factors.occupation = 3; // Medium risk
  } else {
    factors.occupation = 1; // Low risk - others
  }
  
  // Factor 3: Ultimate Beneficiary Owner (1-5)
  const beneficiary = extractValue(data, /Beneficiary:\*\*\s*(.+?)(?:\n|$)/i);
  const benLower = beneficiary.toLowerCase();
  
  if (benLower.includes('self') || benLower.includes('spouse') || 
      benLower.includes('child') || benLower.includes('mother') || 
      benLower.includes('father') || benLower.includes('sister') || 
      benLower.includes('brother')) {
    factors.beneficiary = 1; // Low risk - family
  } else {
    factors.beneficiary = 5; // High risk - other
  }
  
  // Factor 4: Profile of Client (1-5) - USE MANUAL VERIFICATION DATA
  if (manualVerification && manualVerification.pepStatus) {
    if (manualVerification.pepStatus === 'Yes') {
      factors.profile = 5; // High risk - PEP
    } else {
      factors.profile = 1; // Low risk - Not PEP
    }
  } else {
    factors.profile = 1; // Default: Others (not PEP) - low risk
  }
  
  // Factor 5: Client on Restriction List (1-5)
  factors.restrictionList = 1; // Default: None - low risk
  
  // Factor 6: Customer Claims Pattern (1-5) - USE MANUAL VERIFICATION DATA
  if (manualVerification && typeof manualVerification.claimsAmount === 'number') {
    const claimsAmount = manualVerification.claimsAmount;
    if (claimsAmount === 0) {
      factors.claimsPattern = 1; // No history - low risk
    } else if (claimsAmount <= 100000) {
      factors.claimsPattern = 3; // Some history - medium risk
    } else {
      factors.claimsPattern = 5; // Significant history - high risk
    }
  } else {
    factors.claimsPattern = 1; // Default: No history - low risk
  }
  
  score = factors.legalStructure + factors.occupation + factors.beneficiary + 
          factors.profile + factors.restrictionList + factors.claimsPattern;
  
  return { score, factors, max: 30 };
}

// ============================================================================
// TABLE 4: GEOGRAPHY (2 factors, max 10, weight 15%)
// ============================================================================

function calculateTable4Score(data) {
  let score = 2; // Default minimum
  const factors = {};
  
  const nationality = extractValue(data, /Nationality:\*\*\s*(.+?)(?:\n|$)/i);
  const residence = extractValue(data, /Residence:\*\*\s*(.+?)(?:\n|$)/i, /Address:\*\*\s*(.+?)(?:\n|$)/i);
  
  const natLower = nationality.toLowerCase();
  const resLower = residence.toLowerCase();
  
  // Factor 1: Nationality (1-5)
  if (natLower.includes('mauritius') || natLower.includes('mauritian')) {
    factors.nationality = 1; // Low risk - Mauritius (no manual review needed)
  } else {
    factors.nationality = 1; // Default low risk (would need country risk list for others)
  }
  
  // Factor 2: Place of Residence/Work/Business (1-5)
  if (resLower.includes('mauritius')) {
    factors.residence = 1; // Low risk - Mauritius (no manual review needed)
  } else {
    factors.residence = 1; // Default low risk
  }
  
  score = factors.nationality + factors.residence;
  
  return { score, factors, max: 10, isMauritian: natLower.includes('mauritius') || natLower.includes('mauritian') };
}

// ============================================================================
// TABLE 5: DELIVERY CHANNEL (3 factors, max 13, weight 10%)
// ============================================================================

function calculateTable5Score(data) {
  let score = 4; // Default
  const factors = {};
  
  // Factor 1: Identification of Client (1-5)
  const agentInfo = extractValue(data, /Agent.*?:\*\*\s*(.+?)(?:\n|$)/i, /Intermediary:\*\*\s*(.+?)(?:\n|$)/i);
  if (agentInfo && agentInfo.length > 0) {
    factors.identification = 1; // Agent signed - face to face - low risk
  } else {
    factors.identification = 5; // Non face-to-face - high risk
  }
  
  // Factor 2: Walk-in Clients (0-3)
  factors.walkIn = 0; // Default: N/A
  
  // Factor 3: Type of Intermediary (1-5)
  const intermediary = extractValue(data, /Agent.*?:\*\*\s*(.+?)(?:\n|$)/i, /Intermediary:\*\*\s*(.+?)(?:\n|$)/i);
  const intLower = intermediary.toLowerCase();
  
  if (intLower.includes('bank')) {
    factors.intermediary = 1; // Banks - low risk
  } else if (intLower.includes('licensed') || intLower.includes('broker') || intLower.includes('agent')) {
    factors.intermediary = 3; // Licensed salespersons/brokers - medium risk
  } else if (intermediary.length > 0) {
    factors.intermediary = 5; // Non-regulated - high risk
  } else {
    factors.intermediary = 3; // Default medium
  }
  
  score = factors.identification + factors.walkIn + factors.intermediary;
  
  return { score, factors, max: 13 };
}

// ============================================================================
// MAIN CRA CALCULATOR
// ============================================================================

function calculateCRAScore(mappedData, manualVerification = null) {
  try {
    // Calculate scores for each table
    const table1 = calculateTable1Score(mappedData);
    const table2 = calculateTable2Score(mappedData);
    const table3 = calculateTable3Score(mappedData, manualVerification);
    const table4 = calculateTable4Score(mappedData);
    const table5 = calculateTable5Score(mappedData);
    
    // Calculate total raw score
    const totalScore = table1.score + table2.score + table3.score + table4.score + table5.score;
    
    // Calculate weighted score
    const weightedScore = 
      (table1.score / table1.max) * 0.30 +
      (table2.score / table2.max) * 0.10 +
      (table3.score / table3.max) * 0.35 +
      (table4.score / table4.max) * 0.15 +
      (table5.score / table5.max) * 0.10;
    
    // Determine risk level
    const riskLevel = getRiskLevel(weightedScore);
    
    return {
      table1,
      table2,
      table3,
      table4,
      table5,
      totalScore,
      weightedScore: parseFloat(weightedScore.toFixed(2)),
      riskLevel,
      breakdown: {
        table1Contribution: parseFloat(((table1.score / table1.max) * 0.30).toFixed(2)),
        table2Contribution: parseFloat(((table2.score / table2.max) * 0.10).toFixed(2)),
        table3Contribution: parseFloat(((table3.score / table3.max) * 0.35).toFixed(2)),
        table4Contribution: parseFloat(((table4.score / table4.max) * 0.15).toFixed(2)),
        table5Contribution: parseFloat(((table5.score / table5.max) * 0.10).toFixed(2)),
      }
    };
  } catch (error) {
    console.error('Error calculating CRA score:', error);
    return {
      error: true,
      message: 'Unable to calculate CRA score',
      weightedScore: 0.21,
      riskLevel: 'L1'
    };
  }
}

// ============================================================================
// RISK LEVEL CLASSIFIER
// ============================================================================

function getRiskLevel(weightedScore) {
  if (weightedScore >= 0.60) return 'L5';
  if (weightedScore >= 0.50) return 'L4';
  if (weightedScore >= 0.40) return 'L3';
  if (weightedScore >= 0.30) return 'L2';
  return 'L1';
}

function getRiskLevelDescription(level) {
  const descriptions = {
    'L1': 'LOW RISK - Standard processing approved',
    'L2': 'LOW-MEDIUM RISK - Enhanced monitoring required',
    'L3': 'MEDIUM RISK - Additional due diligence required',
    'L4': 'MEDIUM-HIGH RISK - Senior approval required',
    'L5': 'HIGH RISK - HALT TRANSACTION & ESCALATE'
  };
  return descriptions[level] || 'Unknown risk level';
}

// ============================================================================
// SUMMARY FORMATTER
// ============================================================================

function formatCRASummary(craResult, manualVerification = null) {
  if (craResult.error) {
    return `
═══════════════════════════════════════════════════════════
CRA RISK ASSESSMENT - ERROR
═══════════════════════════════════════════════════════════
Unable to calculate CRA score. Manual assessment required.
═══════════════════════════════════════════════════════════
`;
  }
  
  const { table1, table2, table3, table4, table5, totalScore, weightedScore, riskLevel, breakdown } = craResult;
  
  // Check if Mauritian (no country risk review needed)
  const isMauritian = table4.isMauritian || false;
  
  // Build manual verification section if data provided
  let manualVerificationSection = '';
  if (manualVerification) {
    manualVerificationSection = `
MANUAL VERIFICATION PROVIDED:
• PEP Status: ${manualVerification.pepStatus}${manualVerification.pepComments ? ` (${manualVerification.pepComments})` : ''}
• Claims History: MUR ${manualVerification.claimsAmount.toLocaleString()}${manualVerification.claimsComments ? ` (${manualVerification.claimsComments})` : ' (No previous claims)'}
`;
  }
  
  // Build minimal manual verification list - ONLY items not yet provided
  const manualChecks = [];
  
  // Only add items that weren't provided in manual verification
  if (!manualVerification || !manualVerification.pepStatus) {
    manualChecks.push('• PEP Status: Verify if client is a Politically Exposed Person');
  }
  
  if (!manualVerification || typeof manualVerification.claimsAmount !== 'number') {
    manualChecks.push('• Claims History: Check iGAS system for previous claims');
  }
  
  // Only add country risk check if NOT Mauritian
  if (!isMauritian) {
    manualChecks.push('• Country Risk: Verify against centralized country risk list');
  }
  
  // Build manual checks section only if there are items
  let manualChecksSection = '';
  if (manualChecks.length > 0) {
    manualChecksSection = `
⚠️ MANUAL VERIFICATION REQUIRED:
${manualChecks.join('\n')}
`;
  } else {
    manualChecksSection = `
✅ ALL MANUAL VERIFICATIONS COMPLETED
No additional manual checks required.
`;
  }
  
  return `
═══════════════════════════════════════════════════════════
CRA RISK ASSESSMENT
═══════════════════════════════════════════════════════════

Overall CRA Score: ${weightedScore} (${riskLevel} - ${getRiskLevelDescription(riskLevel).split(' - ')[0]})

Dimension Breakdown:
• Nature, Scale & Complexity: ${table1.score}/${table1.max} (30% weight) → ${breakdown.table1Contribution}
• Products & Services: ${table2.score}/${table2.max} (10% weight) → ${breakdown.table2Contribution}
• Types of Clients: ${table3.score}/${table3.max} (35% weight) → ${breakdown.table3Contribution}
• Geography: ${table4.score}/${table4.max} (15% weight) → ${breakdown.table4Contribution}${isMauritian ? ' ✓ Mauritian (Low Risk - No country verification needed)' : ''}
• Delivery Channel: ${table5.score}/${table5.max} (10% weight) → ${breakdown.table5Contribution}

Total Raw Score: ${totalScore}/113

Risk Classification: ${riskLevel} - ${getRiskLevelDescription(riskLevel).split(' - ')[0]}
Recommendation: ${getRiskLevelDescription(riskLevel).split(' - ')[1]}
${manualVerificationSection}${manualChecksSection}
═══════════════════════════════════════════════════════════
`;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  calculateCRAScore,
  formatCRASummary,
  getRiskLevel,
  getRiskLevelDescription
};
