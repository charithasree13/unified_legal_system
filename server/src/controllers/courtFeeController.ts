import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { 
  State, District, CourtType, CaseType, ReliefType, CourtFeeAct, 
  CourtFeeRule, CourtFeeSlab, CalculationHistory, LegalNotification, 
  RuleVersion, AuditLog 
} from '../models/Schemas';
import { evaluateCourtFee, CourtFeeCalculationInput } from '../engine/courtFeeEngine';

/**
 * Fetch Court Fee Metadata (States, Courts, Case Types, Reliefs, Acts)
 */
export const getMetadata = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [states, courtTypes, caseTypes, reliefTypes, acts, districts] = await Promise.all([
      State.find({ isActive: true }),
      CourtType.find({ isActive: true }),
      CaseType.find({ isActive: true }),
      ReliefType.find({ isActive: true }),
      CourtFeeAct.find({ isActive: true }),
      District.find({ isActive: true })
    ]);

    return res.status(200).json({
      success: true,
      states,
      districts,
      courtTypes,
      caseTypes,
      reliefTypes,
      acts
    });
  } catch (error) {
    console.error('Error fetching court fee metadata:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve metadata.' });
  }
};

/**
 * Fetch Districts for selected State
 */
export const getDistricts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { stateName } = req.query;
    const filter: any = { isActive: true };
    if (stateName) {
      filter.stateName = String(stateName);
    }
    const districts = await District.find(filter);
    return res.status(200).json({ success: true, districts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch districts.' });
  }
};

/**
 * Execute Database-Driven Court Fee Calculation with Input Validation
 */
export const calculateFee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      stateName,
      district,
      courtTypeName,
      caseTypeName,
      reliefTypeName,
      claimAmount = 0,
      marketValue = 0,
      agreementValue = 0,
      loanAmount = 0,
      compensationAmount = 0
    } = req.body;

    // 1. Strict Validation
    if (!stateName || !courtTypeName || !caseTypeName || !reliefTypeName) {
      return res.status(400).json({
        success: false,
        message: 'State, Court Type, Case Type, and Relief Type are required fields.'
      });
    }

    // Negative amount validation
    if (Number(claimAmount) < 0 || Number(marketValue) < 0 || Number(agreementValue) < 0 || Number(loanAmount) < 0 || Number(compensationAmount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valuation amounts cannot be negative values.'
      });
    }

    // Fetch active rules & slabs from DB
    const [rules, slabs] = await Promise.all([
      CourtFeeRule.find({ isActive: true }),
      CourtFeeSlab.find()
    ]);

    const input: CourtFeeCalculationInput = {
      stateName,
      district,
      courtTypeName,
      caseTypeName,
      reliefTypeName,
      claimAmount: Number(claimAmount) || 0,
      marketValue: Number(marketValue) || 0,
      agreementValue: Number(agreementValue) || 0,
      loanAmount: Number(loanAmount) || 0,
      compensationAmount: Number(compensationAmount) || 0
    };

    const result = evaluateCourtFee(input, rules, slabs);

    // Save calculation into history
    let historyRecord: any = null;
    if (req.user) {
      historyRecord = await CalculationHistory.create({
        userId: req.user.id || 'anonymous',
        userName: req.user.name || 'User',
        userRole: req.user.role || 'User',
        stateName,
        district: district || '',
        courtTypeName,
        caseTypeName,
        reliefTypeName,
        claimAmount: Number(claimAmount) || 0,
        marketValue: Number(marketValue) || 0,
        agreementValue: Number(agreementValue) || 0,
        loanAmount: Number(loanAmount) || 0,
        compensationAmount: Number(compensationAmount) || 0,
        suitValuation: result.suitValuation,
        calculatedFee: result.calculatedFee,
        appliedRuleId: result.appliedRuleId || '',
        legalProvision: result.legalProvision,
        breakdown: result.breakdown,
        warning: result.warning || ''
      });
    }

    return res.status(200).json({
      success: true,
      calculation: {
        ...result,
        historyId: historyRecord ? historyRecord._id : null
      }
    });
  } catch (error) {
    console.error('Error calculating court fee:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate court fee.' });
  }
};

/**
 * Fetch Calculation History for authenticated user
 */
export const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await CalculationHistory.find({ userId: req.user?.id });
    return res.status(200).json({
      success: true,
      history: history.reverse()
    });
  } catch (error) {
    console.error('Error fetching calculation history:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve calculation history.' });
  }
};

/**
 * Export Calculation Receipt to CSV/Excel Format
 */
export const getCalculationCsv = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await CalculationHistory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Calculation record not found.' });
    }

    const csvContent = [
      ['Field', 'Value'],
      ['Receipt Ref ID', item._id],
      ['State Jurisdiction', item.stateName],
      ['District', item.district || 'N/A'],
      ['Court Forum', item.courtTypeName],
      ['Proceeding Case Type', item.caseTypeName],
      ['Relief Requested', item.reliefTypeName],
      ['Suit Valuation (INR)', item.suitValuation],
      ['Statutory Legal Provision', item.legalProvision],
      ['Calculated Court Fee (INR)', item.calculatedFee],
      ['Assessment Date', new Date(item.createdAt).toISOString()],
      ['Breakdown Execution Steps', item.breakdown.join(' | ')]
    ].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="court_fee_assessment_${item._id}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate CSV export.' });
  }
};

/**
 * Generate Printable PDF / HTML Receipt Preview for Calculation
 */
export const getCalculationPdf = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await CalculationHistory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Calculation receipt record not found.' });
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Court Fee Statutory Assessment Receipt</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 30px; color: #1e293b; background: #ffffff; }
    .header { border-bottom: 2px solid #1e40af; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .title { font-size: 20px; font-weight: bold; color: #1e40af; text-transform: uppercase; }
    .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; }
    .label { color: #64748b; font-weight: bold; }
    .value { font-weight: 600; color: #0f172a; }
    .total-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; margin-top: 20px; }
    .total-amount { font-size: 24px; font-weight: bold; color: #1e40af; margin-top: 5px; }
    .breakdown-list { font-size: 11px; color: #334155; line-height: 1.6; }
    .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; pt: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">Official Court Fee Valuation Receipt</div>
      <div class="subtitle">Unified Legal Platform Statutory Registry Engine</div>
    </div>
    <div>
      <span class="badge">Ref #${item._id}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Litigation Parameters</div>
    <div class="grid">
      <div><span class="label">Jurisdiction State:</span> <span class="value">${item.stateName} ${item.district ? `(${item.district})` : ''}</span></div>
      <div><span class="label">Court Forum:</span> <span class="value">${item.courtTypeName}</span></div>
      <div><span class="label">Proceeding Type:</span> <span class="value">${item.caseTypeName}</span></div>
      <div><span class="label">Relief Requested:</span> <span class="value">${item.reliefTypeName}</span></div>
      <div><span class="label">Suit Valuation:</span> <span class="value">₹${Number(item.suitValuation).toLocaleString('en-IN')}</span></div>
      <div><span class="label">Assessment Date:</span> <span class="value">${new Date(item.createdAt).toLocaleDateString()}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Statutory Legal Provision</div>
    <p style="font-size: 12px; font-weight: bold; color: #0369a1;">📜 ${item.legalProvision}</p>
  </div>

  <div class="section">
    <div class="section-title">Step-by-Step Calculation Breakdown</div>
    <div class="breakdown-list">
      ${item.breakdown.map((b: string) => `<p>• ${b}</p>`).join('')}
    </div>
  </div>

  <div class="total-box">
    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Total Statutory Court Fee Payable</div>
    <div class="total-amount">₹${Number(item.calculatedFee).toLocaleString('en-IN')}</div>
  </div>

  <div class="footer">
    Calculated via Database-Driven Statutory Rule Engine • Sourced from applicable State Court Fees Act and Notifications.
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error generating calculation receipt:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate calculation receipt.' });
  }
};

/**
 * ADMIN: Get all Court Fee Rules and Slabs
 */
export const getAdminRules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [rules, slabs, notifications] = await Promise.all([
      CourtFeeRule.find(),
      CourtFeeSlab.find(),
      LegalNotification.find()
    ]);

    return res.status(200).json({
      success: true,
      rules,
      slabs,
      notifications
    });
  } catch (error) {
    console.error('Error fetching admin rules:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin rules.' });
  }
};

/**
 * ADMIN: Create New Court Fee Rule with Slabs
 */
export const createAdminRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      stateName,
      courtTypeName,
      caseTypeName,
      reliefTypeName,
      actName,
      section,
      schedule,
      article,
      notificationNo,
      feeType,
      fixedFee,
      ratePercentage,
      valuationMultiplier,
      minFee,
      maxFee,
      roundingIncrement,
      effectiveDate,
      remarks,
      slabs = []
    } = req.body;

    if (!stateName || !actName || !caseTypeName || !reliefTypeName) {
      return res.status(400).json({ success: false, message: 'State, Act Name, Case Type, and Relief Type are required.' });
    }

    const newRule = await CourtFeeRule.create({
      stateName,
      courtTypeName: courtTypeName || 'District Court',
      caseTypeName,
      reliefTypeName,
      actName,
      section: section || 'General',
      schedule: schedule || 'Schedule I',
      article: article || 'Article 1',
      notificationNo: notificationNo || '',
      feeType: feeType || 'AdValorem',
      fixedFee: Number(fixedFee) || 0,
      ratePercentage: Number(ratePercentage) || 0,
      valuationMultiplier: Number(valuationMultiplier) || 1.0,
      minFee: Number(minFee) || 0,
      maxFee: maxFee ? Number(maxFee) : null,
      roundingIncrement: Number(roundingIncrement) || 1,
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      version: 1,
      isActive: true,
      remarks: remarks || ''
    });

    // Create Slabs if provided
    const createdSlabs = [];
    if (Array.isArray(slabs) && slabs.length > 0) {
      for (const s of slabs) {
        const slabRecord = await CourtFeeSlab.create({
          ruleId: newRule._id,
          minVal: Number(s.minVal) || 0,
          maxVal: s.maxVal !== null && s.maxVal !== undefined ? Number(s.maxVal) : null,
          ratePercentage: Number(s.ratePercentage) || 0,
          ratePerUnit: Number(s.ratePerUnit) || 0,
          unitSize: Number(s.unitSize) || 1000,
          fixedAddition: Number(s.fixedAddition) || 0,
          cumulativeBaseFee: Number(s.cumulativeBaseFee) || 0,
          version: 1
        });
        createdSlabs.push(slabRecord);
      }
    }

    await AuditLog.create({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Admin',
      role: req.user?.role || 'Admin',
      action: 'COURT_FEE_RULE_CREATED',
      ip: req.ip || '127.0.0.1',
      details: `Created Court Fee Rule for ${stateName} (${actName}, ${section})`
    });

    return res.status(201).json({
      success: true,
      rule: newRule,
      slabs: createdSlabs
    });
  } catch (error) {
    console.error('Error creating court fee rule:', error);
    return res.status(500).json({ success: false, message: 'Failed to create court fee rule.' });
  }
};

/**
 * ADMIN: Toggle Rule Active/Inactive Status
 */
export const toggleAdminRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rule = await CourtFeeRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found.' });

    const updated = await CourtFeeRule.findByIdAndUpdate(req.params.id, {
      isActive: !rule.isActive
    }, { new: true });

    await AuditLog.create({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Admin',
      role: req.user?.role || 'Admin',
      action: 'COURT_FEE_RULE_TOGGLED',
      ip: req.ip || '127.0.0.1',
      details: `Toggled Rule ID ${rule._id} status to ${updated.isActive ? 'Active' : 'Inactive'}`
    });

    return res.status(200).json({ success: true, rule: updated });
  } catch (error) {
    console.error('Error toggling rule status:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle rule status.' });
  }
};
