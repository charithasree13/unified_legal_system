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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Judgements Handler
export const uploadJudgement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, court, state, judge, year, subject, keywords } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'PDF document file is required.' });
    }

    if (!title || !court || !judge || !year || !subject) {
      return res.status(400).json({ success: false, message: 'Missing document metadata fields.' });
    }

    const keywordArray = keywords 
      ? (typeof keywords === 'string' ? keywords.split(',').map((k: string) => k.trim()) : keywords) 
      : [];

    const newJudgement = await Judgement.create({
      title,
      court,
      state,
      judge,
      year: Number(year),
      subject,
      keywords: keywordArray,
      pdfUrl: `/uploads/${file.filename}`,
      fileName: file.originalname,
      uploadedBy: req.user?.name || 'Admin'
    });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'JUDGEMENT_UPLOADED',
      ip: req.ip || '127.0.0.1',
      details: `Uploaded Judgement: ${title} (${file.originalname})`
    });

    return res.status(201).json({
      success: true,
      message: 'Judgement PDF uploaded and catalogued successfully.',
      judgement: newJudgement
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error uploading judgement.' });
  }
};

export const getJudgements = async (req: Request, res: Response) => {
  try {
    const { search, court, state, judge, year, subject } = req.query;
    let query: any = {};

    if (search) {
      const regex = { $regex: String(search), $options: 'i' };
      query.$or = [
        { title: regex },
        { subject: regex },
        { judge: regex }
      ];
    }

    if (court) query.court = String(court);
    if (state) query.state = String(state);
    if (judge) query.judge = String(judge);
    if (year) query.year = Number(year);
    if (subject) query.subject = String(subject);

    const list = await Judgement.find(query);
    return res.status(200).json({ success: true, judgements: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving judgements.' });
  }
};

// Laws / Acts Handler
export const uploadLaw = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'PDF document file is required.' });
    }

    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and Category are required fields.' });
    }

    const newLaw = await Law.create({
      title,
      category, // Act, Rule, Regulation, etc.
      description: description || '',
      pdfUrl: `/uploads/${file.filename}`,
      fileName: file.originalname,
      uploadedBy: req.user?.name || 'Admin'
    });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'LAW_UPLOADED',
      ip: req.ip || '127.0.0.1',
      details: `Uploaded Law/Act: ${title} (${file.originalname})`
    });

    return res.status(201).json({
      success: true,
      message: 'Law/Act PDF document uploaded and categorized successfully.',
      law: newLaw
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error uploading law.' });
  }
};

export const getLaws = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    let query: any = {};

    if (search) {
      query.title = { $regex: String(search), $options: 'i' };
    }
    if (category) {
      query.category = String(category);
    }

    const list = await Law.find(query);
    return res.status(200).json({ success: true, laws: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving laws database.' });
  }
};

export const deleteJudgement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Judgement.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Judgement not found.' });
    }
    
    // Try deleting physical file
    if (doc.pdfUrl) {
      const filename = path.basename(doc.pdfUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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

    return res.status(200).json({ success: true, message: 'Judgement deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error deleting judgement.' });
  }
};

export const deleteLaw = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Law.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Act/Law not found.' });
    }

    // Try deleting physical file
    if (doc.pdfUrl) {
      const filename = path.basename(doc.pdfUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Law.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'LAW_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Deleted Act/Law: ${doc.title}`
    });

    return res.status(200).json({ success: true, message: 'Act/Law deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error deleting act/law.' });
  }
};

export const updateLaw = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, description } = req.body;

    const doc = await Law.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Act/Law profile not found.' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      updateData.pdfUrl = `/uploads/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
    }

    const updatedLaw = await Law.findByIdAndUpdate(id, updateData, { new: true });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'LAW_UPDATED',
      ip: req.ip || '127.0.0.1',
      details: `Updated Act/Law: ${doc.title}`
    });

    return res.status(200).json({
      success: true,
      message: 'Act/Law updated successfully.',
      law: updatedLaw
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error updating act/law.' });
  }
};
