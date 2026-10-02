import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Judgement, Law, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

// Setup file upload paths
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  },
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Helper for canonical key normalization
function generateJudgementCanonicalKey(court: string, caseNumber: string, neutralCitation: string, year: number | string): string {
  const normCourt = String(court || '').toLowerCase().trim().replace(/^the\s+/i, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normCaseNo = String(caseNumber || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normCit = String(neutralCitation || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normYr = String(year || '').trim();
  return `${normCourt}|${normCaseNo || 'nocaseno'}|${normCit || normYr}`;
}

function generateLawCanonicalKey(actName: string, actNumber: string, year: number | string, jurisdiction: string): string {
  const normName = String(actName || '').toLowerCase().trim().replace(/^the\s+/i, '').replace(/\s*\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normNo = String(actNumber || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const normYr = String(year || '').trim();
  const normJur = String(jurisdiction || 'central').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `${normName}|${normNo || 'nono'}|${normYr}|${normJur}`;
}

function isValidUrlString(urlStr?: string): boolean {
  if (!urlStr) return true; // Optional fields allow empty
  if (urlStr.startsWith('/uploads/')) return true;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// JUDGEMENTS HANDLERS
// -------------------------------------------------------------

export const getJudgements = async (req: Request, res: Response) => {
  try {
    const { search, court, state, judge, year, subject, page = '1', limit = '10', sort = 'newest' } = req.query;
    
    let allRecords = await Judgement.find({});

    // Filter by Search Query (Case name, party name, court, judge, citation, case no, act, section, topic, keyword)
    if (search) {
      const term = String(search).toLowerCase().trim();
      allRecords = allRecords.filter((doc: any) => {
        const titleMatch = doc.title?.toLowerCase().includes(term);
        const petMatch = doc.petitioner?.toLowerCase().includes(term);
        const respMatch = doc.respondent?.toLowerCase().includes(term);
        const courtMatch = doc.court?.toLowerCase().includes(term);
        const judgeMatch = doc.judge?.toLowerCase().includes(term) || doc.bench?.toLowerCase().includes(term);
        const caseNoMatch = doc.caseNumber?.toLowerCase().includes(term);
        const citMatch = doc.neutralCitation?.toLowerCase().includes(term) || doc.equivalentCitations?.some((c: string) => c.toLowerCase().includes(term));
        const subjMatch = doc.subject?.toLowerCase().includes(term);
        const actsMatch = doc.actsInvolved?.some((a: string) => a.toLowerCase().includes(term));
        const secMatch = doc.sectionsConsidered?.some((s: string) => s.toLowerCase().includes(term));
        const kwMatch = doc.keywords?.some((k: string) => k.toLowerCase().includes(term));
        const outcomeMatch = doc.caseOutcome?.toLowerCase().includes(term);
        const summaryMatch = doc.summary?.fullSummaryText?.toLowerCase().includes(term) || doc.summary?.keyPrinciple?.toLowerCase().includes(term);

        return titleMatch || petMatch || respMatch || courtMatch || judgeMatch || caseNoMatch || citMatch || subjMatch || actsMatch || secMatch || kwMatch || outcomeMatch || summaryMatch;
      });
    }

    // Filter by specific fields
    if (court) {
      const cStr = String(court).toLowerCase();
      allRecords = allRecords.filter((doc: any) => doc.court?.toLowerCase().includes(cStr));
    }
    if (state) {
      const sStr = String(state).toLowerCase();
      allRecords = allRecords.filter((doc: any) => doc.state?.toLowerCase().includes(sStr));
    }
    if (judge) {
      const jStr = String(judge).toLowerCase();
      allRecords = allRecords.filter((doc: any) => doc.judge?.toLowerCase().includes(jStr) || doc.bench?.toLowerCase().includes(jStr));
    }
    if (year) {
      const yNum = Number(year);
      if (!isNaN(yNum)) {
        allRecords = allRecords.filter((doc: any) => Number(doc.year) === yNum);
      }
    }
    if (subject) {
      const subjStr = String(subject).toLowerCase();
      allRecords = allRecords.filter((doc: any) => doc.subject?.toLowerCase() === subjStr || doc.subject?.toLowerCase().includes(subjStr));
    }

    // Sorting
    if (sort === 'newest') {
      allRecords.sort((a: any, b: any) => (b.year || 0) - (a.year || 0) || new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sort === 'oldest') {
      allRecords.sort((a: any, b: any) => (a.year || 0) - (b.year || 0) || new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sort === 'title') {
      allRecords.sort((a: any, b: any) => String(a.title || '').localeCompare(String(b.title || '')));
    }

    // Server-Side Pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const total = allRecords.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = allRecords.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      judgements: paginatedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Error retrieving judgements:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving judgements from legal database.' });
  }
};

export const getJudgementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Judgement.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Judgement record not found.' });
    }
    return res.status(200).json({ success: true, judgement: doc });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving judgement details.' });
  }
};

export const uploadJudgement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title, petitioner, respondent, court, state, judge, bench,
      caseNumber, appealNumber, neutralCitation, equivalentCitations,
      judgmentDate, year, judgmentType, subject, actsInvolved, sectionsConsidered,
      keywords, caseOutcome, sourceAuthority, sourceUrl, legalStatus,
      summaryBackground, summaryIssues, summaryRelevantLaw, summaryReasoning,
      summaryHolding, summaryKeyPrinciple, summaryOutcome
    } = req.body;

    const file = req.file;

    if (!title || !court || !judge || !year || !subject) {
      return res.status(400).json({ success: false, message: 'Title, Court, Judge/Bench, Year, and Area of Law are required fields.' });
    }

    const officialUrl = sourceUrl || (file ? `/uploads/${file.filename}` : '');
    if (!officialUrl) {
      return res.status(400).json({ success: false, message: 'Either an Official Source URL or a PDF document upload is required.' });
    }

    if (!isValidUrlString(officialUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid Official Source URL format. Must start with http:// or https://' });
    }

    // Generate canonical key and check duplicates
    const canonicalKey = generateJudgementCanonicalKey(court, caseNumber, neutralCitation, year);
    const existing = await Judgement.findOne({
      $or: [
        { canonicalKey },
        { title: title.trim(), court: court.trim() }
      ]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Duplicate Judgment Error: A judgment record for "${title}" under court "${court}" already exists in the Elite Legal Desk database.`
      });
    }

    const keywordArray = keywords 
      ? (typeof keywords === 'string' ? keywords.split(',').map((k: string) => k.trim()) : keywords) 
      : [];

    const actsArray = actsInvolved
      ? (typeof actsInvolved === 'string' ? actsInvolved.split(',').map((k: string) => k.trim()) : actsInvolved)
      : [];

    const sectionsArray = sectionsConsidered
      ? (typeof sectionsConsidered === 'string' ? sectionsConsidered.split(',').map((k: string) => k.trim()) : sectionsConsidered)
      : [];

    const eqCitationsArray = equivalentCitations
      ? (typeof equivalentCitations === 'string' ? equivalentCitations.split(',').map((k: string) => k.trim()) : equivalentCitations)
      : [];

    const summaryObj = {
      background: summaryBackground || '',
      issues: summaryIssues || '',
      relevantLaw: summaryRelevantLaw || '',
      courtReasoning: summaryReasoning || '',
      holding: summaryHolding || '',
      keyPrinciple: summaryKeyPrinciple || '',
      outcome: summaryOutcome || '',
      fullSummaryText: [summaryBackground, summaryIssues, summaryReasoning, summaryHolding, summaryKeyPrinciple].filter(Boolean).join(' ')
    };

    const newJudgement = await Judgement.create({
      title: title.trim(),
      petitioner: petitioner ? petitioner.trim() : undefined,
      respondent: respondent ? respondent.trim() : undefined,
      court: court.trim(),
      state: state ? state.trim() : undefined,
      judge: judge.trim(),
      bench: bench ? bench.trim() : judge.trim(),
      caseNumber: caseNumber ? caseNumber.trim() : undefined,
      appealNumber: appealNumber ? appealNumber.trim() : undefined,
      neutralCitation: neutralCitation ? neutralCitation.trim() : undefined,
      equivalentCitations: eqCitationsArray,
      judgmentDate: judgmentDate ? judgmentDate.trim() : `${year}-01-01`,
      year: Number(year),
      judgmentType: judgmentType || 'Civil Appeal',
      subject: subject.trim(),
      actsInvolved: actsArray,
      sectionsConsidered: sectionsArray,
      keywords: keywordArray,
      caseOutcome: caseOutcome || 'Decided',
      sourceAuthority: sourceAuthority || court.trim(),
      sourceUrl: officialUrl,
      legalStatus: legalStatus || 'Public Judicial Record',
      lastVerified: new Date().toISOString().split('T')[0],
      canonicalKey,
      pdfUrl: file ? `/uploads/${file.filename}` : officialUrl,
      fileName: file ? file.originalname : `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      uploadedBy: req.user?.name || 'Admin',
      summary: summaryObj
    });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'JUDGEMENT_UPLOADED',
      ip: req.ip || '127.0.0.1',
      details: `Catalogued Judgement: ${title} (${court})`
    });

    return res.status(201).json({
      success: true,
      message: 'Judgement record and Elite Legal Desk summary catalogued successfully.',
      judgement: newJudgement
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating judgement record.' });
  }
};

export const updateJudgement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Judgement.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Judgement record not found.' });
    }

    const {
      title, petitioner, respondent, court, state, judge, bench,
      caseNumber, appealNumber, neutralCitation, equivalentCitations,
      judgmentDate, year, judgmentType, subject, actsInvolved, sectionsConsidered,
      keywords, caseOutcome, sourceAuthority, sourceUrl, legalStatus,
      summaryBackground, summaryIssues, summaryRelevantLaw, summaryReasoning,
      summaryHolding, summaryKeyPrinciple, summaryOutcome
    } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (petitioner !== undefined) updateData.petitioner = petitioner.trim();
    if (respondent !== undefined) updateData.respondent = respondent.trim();
    if (court !== undefined) updateData.court = court.trim();
    if (state !== undefined) updateData.state = state.trim();
    if (judge !== undefined) updateData.judge = judge.trim();
    if (bench !== undefined) updateData.bench = bench.trim();
    if (caseNumber !== undefined) updateData.caseNumber = caseNumber.trim();
    if (appealNumber !== undefined) updateData.appealNumber = appealNumber.trim();
    if (neutralCitation !== undefined) updateData.neutralCitation = neutralCitation.trim();
    if (judgmentDate !== undefined) updateData.judgmentDate = judgmentDate.trim();
    if (year !== undefined) updateData.year = Number(year);
    if (judgmentType !== undefined) updateData.judgmentType = judgmentType;
    if (subject !== undefined) updateData.subject = subject.trim();
    if (caseOutcome !== undefined) updateData.caseOutcome = caseOutcome;
    if (sourceAuthority !== undefined) updateData.sourceAuthority = sourceAuthority;
    if (sourceUrl !== undefined) {
      if (!isValidUrlString(sourceUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid Source URL format.' });
      }
      updateData.sourceUrl = sourceUrl;
    }
    if (legalStatus !== undefined) updateData.legalStatus = legalStatus;

    if (keywords !== undefined) {
      updateData.keywords = typeof keywords === 'string' ? keywords.split(',').map((k: string) => k.trim()) : keywords;
    }
    if (actsInvolved !== undefined) {
      updateData.actsInvolved = typeof actsInvolved === 'string' ? actsInvolved.split(',').map((k: string) => k.trim()) : actsInvolved;
    }
    if (sectionsConsidered !== undefined) {
      updateData.sectionsConsidered = typeof sectionsConsidered === 'string' ? sectionsConsidered.split(',').map((k: string) => k.trim()) : sectionsConsidered;
    }
    if (equivalentCitations !== undefined) {
      updateData.equivalentCitations = typeof equivalentCitations === 'string' ? equivalentCitations.split(',').map((k: string) => k.trim()) : equivalentCitations;
    }

    if (req.file) {
      updateData.pdfUrl = `/uploads/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
    }

    if (summaryBackground || summaryIssues || summaryReasoning || summaryHolding || summaryKeyPrinciple) {
      updateData.summary = {
        background: summaryBackground || doc.summary?.background || '',
        issues: summaryIssues || doc.summary?.issues || '',
        relevantLaw: summaryRelevantLaw || doc.summary?.relevantLaw || '',
        courtReasoning: summaryReasoning || doc.summary?.courtReasoning || '',
        holding: summaryHolding || doc.summary?.holding || '',
        keyPrinciple: summaryKeyPrinciple || doc.summary?.keyPrinciple || '',
        outcome: summaryOutcome || doc.summary?.outcome || '',
        fullSummaryText: [summaryBackground, summaryIssues, summaryReasoning, summaryHolding, summaryKeyPrinciple].filter(Boolean).join(' ')
      };
    }

    updateData.lastVerified = new Date().toISOString().split('T')[0];

    const updatedJudgement = await Judgement.findByIdAndUpdate(id, updateData, { new: true });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'JUDGEMENT_UPDATED',
      ip: req.ip || '127.0.0.1',
      details: `Updated Judgement: ${doc.title}`
    });

    return res.status(200).json({
      success: true,
      message: 'Judgement details updated successfully.',
      judgement: updatedJudgement
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error updating judgement record.' });
  }
};

export const deleteJudgement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Judgement.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Judgement not found.' });
    }
    
    if (doc.pdfUrl && doc.pdfUrl.startsWith('/uploads/')) {
      const filename = path.basename(doc.pdfUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    await Judgement.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'JUDGEMENT_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Deleted Judgement: ${doc.title}`
    });

    return res.status(200).json({ success: true, message: 'Judgement removed from legal database successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error deleting judgement.' });
  }
};

// -------------------------------------------------------------
// BARE ACTS / LAWS HANDLERS
// -------------------------------------------------------------

export const getLaws = async (req: Request, res: Response) => {
  try {
    const { search, category, jurisdiction, actStatus, year, page = '1', limit = '10', sort = 'newest' } = req.query;
    
    let allRecords = await Law.find({});

    // Filter by search term across titles, actName, actNumber, category, ministry, jurisdiction, chapters & sections
    if (search) {
      const term = String(search).toLowerCase().trim();
      allRecords = allRecords.filter((doc: any) => {
        const titleMatch = doc.title?.toLowerCase().includes(term) || doc.actName?.toLowerCase().includes(term);
        const shortTitleMatch = doc.shortTitle?.toLowerCase().includes(term);
        const actNoMatch = doc.actNumber?.toLowerCase().includes(term);
        const catMatch = doc.category?.toLowerCase().includes(term);
        const minMatch = doc.ministry?.toLowerCase().includes(term);
        const jurMatch = doc.jurisdiction?.toLowerCase().includes(term);
        const descMatch = doc.description?.toLowerCase().includes(term) || doc.longTitle?.toLowerCase().includes(term);
        
        const secMatch = doc.chapters?.some((chap: any) => 
          chap.title?.toLowerCase().includes(term) ||
          chap.sections?.some((sec: any) => 
            sec.sectionNumber?.toLowerCase().includes(term) ||
            sec.title?.toLowerCase().includes(term) ||
            sec.content?.toLowerCase().includes(term)
          )
        );

        return titleMatch || shortTitleMatch || actNoMatch || catMatch || minMatch || jurMatch || descMatch || secMatch;
      });
    }

    if (category) {
      const catStr = String(category).toLowerCase();
      allRecords = allRecords.filter((doc: any) => doc.category?.toLowerCase() === catStr || doc.category?.toLowerCase().includes(catStr));
    }
    if (jurisdiction) {
      const jurStr = String(jurisdiction).toLowerCase();
      allRecords = allRecords.filter((doc: any) => doc.jurisdiction?.toLowerCase().includes(jurStr));
    }
    if (actStatus) {
      allRecords = allRecords.filter((doc: any) => doc.actStatus === String(actStatus));
    }
    if (year) {
      const yNum = Number(year);
      if (!isNaN(yNum)) {
        allRecords = allRecords.filter((doc: any) => Number(doc.year) === yNum);
      }
    }

    // Sorting
    if (sort === 'newest') {
      allRecords.sort((a: any, b: any) => (b.year || 0) - (a.year || 0) || new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sort === 'oldest') {
      allRecords.sort((a: any, b: any) => (a.year || 0) - (b.year || 0) || new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sort === 'title') {
      allRecords.sort((a: any, b: any) => String(a.title || a.actName || '').localeCompare(String(b.title || b.actName || '')));
    }

    // Server-Side Pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const total = allRecords.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = allRecords.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      laws: paginatedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Error retrieving bare acts:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving Bare Acts library.' });
  }
};

export const getLawById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Law.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bare Act record not found.' });
    }
    return res.status(200).json({ success: true, law: doc });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving Bare Act details.' });
  }
};

export const uploadLaw = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title, actName, shortTitle, actNumber, year, enactmentDate,
      commencementDate, ministry, jurisdiction, actStatus, longTitle,
      category, description, sourceAuthority, sourceUrl, chaptersJson
    } = req.body;

    const file = req.file;

    const mainTitle = (actName || title || '').trim();
    if (!mainTitle || !category || !year) {
      return res.status(400).json({ success: false, message: 'Act Name/Title, Category, and Year are required fields.' });
    }

    const officialUrl = sourceUrl || (file ? `/uploads/${file.filename}` : '');
    if (officialUrl && !isValidUrlString(officialUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid Official Source URL format. Must start with http:// or https://' });
    }

    // Canonical key duplicate check
    const canonicalKey = generateLawCanonicalKey(mainTitle, actNumber, year, jurisdiction);
    const existing = await Law.findOne({
      $or: [
        { canonicalKey },
        { title: mainTitle, year: Number(year) }
      ]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Duplicate Bare Act Error: An Act record titled "${mainTitle}" (${year}) already exists in the Elite Legal Desk library.`
      });
    }

    let parsedChapters = [];
    if (chaptersJson) {
      try {
        parsedChapters = typeof chaptersJson === 'string' ? JSON.parse(chaptersJson) : chaptersJson;
      } catch {}
    }

    const newLaw = await Law.create({
      title: mainTitle,
      actName: mainTitle,
      shortTitle: shortTitle ? shortTitle.trim() : undefined,
      actNumber: actNumber ? actNumber.trim() : undefined,
      year: Number(year),
      enactmentDate: enactmentDate ? enactmentDate.trim() : undefined,
      commencementDate: commencementDate ? commencementDate.trim() : undefined,
      ministry: ministry ? ministry.trim() : 'Ministry of Law and Justice',
      jurisdiction: jurisdiction ? jurisdiction.trim() : 'Central / All India',
      actStatus: actStatus || 'CURRENTLY_IN_FORCE',
      longTitle: longTitle ? longTitle.trim() : undefined,
      category: category.trim(),
      description: description ? description.trim() : '',
      sourceAuthority: sourceAuthority || 'India Code / Legislative Department',
      sourceUrl: officialUrl,
      lastVerified: new Date().toISOString().split('T')[0],
      canonicalKey,
      pdfUrl: file ? `/uploads/${file.filename}` : officialUrl,
      fileName: file ? file.originalname : `${mainTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`,
      uploadedBy: req.user?.name || 'Admin',
      chapters: parsedChapters
    });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'LAW_UPLOADED',
      ip: req.ip || '127.0.0.1',
      details: `Catalogued Bare Act: ${mainTitle} (${year})`
    });

    return res.status(201).json({
      success: true,
      message: 'Bare Act catalogued successfully in statutory library.',
      law: newLaw
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error creating Bare Act record.' });
  }
};

export const updateLaw = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Law.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bare Act record not found.' });
    }

    const {
      title, actName, shortTitle, actNumber, year, enactmentDate,
      commencementDate, ministry, jurisdiction, actStatus, longTitle,
      category, description, sourceAuthority, sourceUrl, chaptersJson
    } = req.body;

    const updateData: any = {};
    const mainTitle = (actName || title);
    if (mainTitle !== undefined) {
      updateData.title = mainTitle.trim();
      updateData.actName = mainTitle.trim();
    }
    if (shortTitle !== undefined) updateData.shortTitle = shortTitle.trim();
    if (actNumber !== undefined) updateData.actNumber = actNumber.trim();
    if (year !== undefined) updateData.year = Number(year);
    if (enactmentDate !== undefined) updateData.enactmentDate = enactmentDate.trim();
    if (commencementDate !== undefined) updateData.commencementDate = commencementDate.trim();
    if (ministry !== undefined) updateData.ministry = ministry.trim();
    if (jurisdiction !== undefined) updateData.jurisdiction = jurisdiction.trim();
    if (actStatus !== undefined) updateData.actStatus = actStatus;
    if (longTitle !== undefined) updateData.longTitle = longTitle.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (sourceAuthority !== undefined) updateData.sourceAuthority = sourceAuthority.trim();
    if (sourceUrl !== undefined) {
      if (sourceUrl && !isValidUrlString(sourceUrl)) {
        return res.status(400).json({ success: false, message: 'Invalid Source URL format.' });
      }
      updateData.sourceUrl = sourceUrl;
    }

    if (chaptersJson !== undefined) {
      try {
        updateData.chapters = typeof chaptersJson === 'string' ? JSON.parse(chaptersJson) : chaptersJson;
      } catch {}
    }

    if (req.file) {
      updateData.pdfUrl = `/uploads/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
    }

    updateData.lastVerified = new Date().toISOString().split('T')[0];

    const updatedLaw = await Law.findByIdAndUpdate(id, updateData, { new: true });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'LAW_UPDATED',
      ip: req.ip || '127.0.0.1',
      details: `Updated Bare Act: ${doc.title}`
    });

    return res.status(200).json({
      success: true,
      message: 'Bare Act record updated successfully.',
      law: updatedLaw
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error updating Bare Act record.' });
  }
};

export const deleteLaw = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Law.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Bare Act not found.' });
    }

    if (doc.pdfUrl && doc.pdfUrl.startsWith('/uploads/')) {
      const filename = path.basename(doc.pdfUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    await Law.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'LAW_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Deleted Bare Act: ${doc.title}`
    });

    return res.status(200).json({ success: true, message: 'Bare Act removed from legal library successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error deleting Bare Act.' });
  }
};
