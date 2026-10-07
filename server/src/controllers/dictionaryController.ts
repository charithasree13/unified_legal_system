import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { DictionaryItem } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

let cachedStaticEntries: any[] | null = null;

function loadStaticDictionary(): any[] {
  if (cachedStaticEntries) {
    return cachedStaticEntries;
  }

  const possiblePaths = [
    path.join(__dirname, '../../../client/public/data/legal-dictionary.json'),
    path.join(process.cwd(), 'client/public/data/legal-dictionary.json'),
    path.join(__dirname, '../../data/legal-dictionary.json'),
    path.join(process.cwd(), 'public/data/legal-dictionary.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cachedStaticEntries = parsed;
          return parsed;
        }
      } catch (err) {
        console.error('Error loading static legal dictionary file:', p, err);
      }
    }
  }

  console.warn('⚠️ Static legal-dictionary.json file not found in known paths.');
  return [];
}

/**
 * GET /api/dictionary
 * Access-Control: ADMIN or ADVOCATE (Approved or Pending)
 */
export const getDictionaryEntries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Legal Dictionary is restricted exclusively to Administrators and Advocates.'
      });
    }

    // 1. Static dictionary entries
    const staticEntries = loadStaticDictionary();

    // 2. Persistent Admin-created entries from DB/Mock DB
    let dbEntries: any[] = [];
    try {
      dbEntries = await DictionaryItem.find({});
    } catch (err) {
      console.error('Error reading dictionary items from database:', err);
    }

    const formattedDbEntries = dbEntries.map((item: any) => ({
      id: item.id || item._id?.toString() || `dict_${Date.now()}_${Math.random()}`,
      term: item.term,
      definition: item.definition || item.meaning,
      category: item.category,
      additionalInformation: item.additionalInformation || '',
      examples: item.examples || [],
      notes: item.notes || [],
      relatedTerms: item.relatedTerms || [],
      createdBy: item.createdBy,
      createdAt: item.createdAt
    }));

    // Merge DB entries (at the top) with static entries
    const combinedEntries = [...formattedDbEntries, ...staticEntries];

    return res.status(200).json(combinedEntries);
  } catch (error: any) {
    console.error('Error in getDictionaryEntries controller:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve legal dictionary dataset.' });
  }
};

/**
 * POST /api/dictionary
 * Access-Control: ADMIN ONLY
 */
export const addDictionaryEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Administrators are authorized to add new legal terms.'
      });
    }

    const { term, word, definition, meaning, category, additionalInformation, examples, notes, relatedTerms } = req.body;

    const termVal = (term || word || '').trim();
    const definitionVal = (definition || meaning || '').trim();
    const categoryVal = (category || '').trim();

    // Validate required fields
    if (!termVal) {
      return res.status(400).json({ success: false, message: 'Word / Legal term is required.' });
    }
    if (!definitionVal) {
      return res.status(400).json({ success: false, message: 'Meaning / Definition is required.' });
    }
    if (!categoryVal) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    // Uniqueness Check: Term + Category (case-insensitive)
    const termLower = termVal.toLowerCase();
    const categoryLower = categoryVal.toLowerCase();

    // Check static entries
    const staticEntries = loadStaticDictionary();
    const staticDuplicate = staticEntries.some((e: any) =>
      (e.term || '').trim().toLowerCase() === termLower &&
      (e.category || '').trim().toLowerCase() === categoryLower
    );

    if (staticDuplicate) {
      return res.status(400).json({ success: false, message: 'This legal term already exists.' });
    }

    // Check persistent DB entries
    let dbEntries: any[] = [];
    try {
      dbEntries = await DictionaryItem.find({});
    } catch (err) {}

    const dbDuplicate = dbEntries.some((e: any) =>
      (e.term || '').trim().toLowerCase() === termLower &&
      (e.category || '').trim().toLowerCase() === categoryLower
    );

    if (dbDuplicate) {
      return res.status(400).json({ success: false, message: 'This legal term already exists.' });
    }

    const newId = `admin_dict_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newEntryPayload = {
      id: newId,
      term: termVal,
      definition: definitionVal,
      category: categoryVal,
      additionalInformation: additionalInformation ? String(additionalInformation).trim() : '',
      examples: Array.isArray(examples) ? examples : (typeof examples === 'string' ? examples.split('\n').map(s => s.trim()).filter(Boolean) : []),
      notes: Array.isArray(notes) ? notes : (typeof notes === 'string' ? notes.split('\n').map(s => s.trim()).filter(Boolean) : []),
      relatedTerms: Array.isArray(relatedTerms) ? relatedTerms : (typeof relatedTerms === 'string' ? relatedTerms.split(',').map(s => s.trim()).filter(Boolean) : []),
      createdBy: req.user.id || req.user.name || 'Admin',
      createdAt: new Date().toISOString()
    };

    await DictionaryItem.create(newEntryPayload);

    return res.status(201).json({
      success: true,
      message: 'Legal term added successfully.',
      entry: newEntryPayload
    });
  } catch (error: any) {
    console.error('Error in addDictionaryEntry controller:', error);
    return res.status(500).json({ success: false, message: 'Failed to save new legal dictionary term.' });
  }
};
