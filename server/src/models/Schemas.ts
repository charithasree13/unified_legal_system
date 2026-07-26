import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

// -------------------------------------------------------------
// 1. MOCK DATA BASE ENGINE (JSON fallback)
// -------------------------------------------------------------
const DATA_DIR = path.join(__dirname, '../../data');
if (USE_MOCK_DB && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class MockModel<T extends { _id?: string; createdAt?: string; updatedAt?: string }> {
  private filePath: string;

  constructor(private name: string) {
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private read(): T[] {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private write(data: T[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query: any = {}): Promise<T[]> {
    let items = this.read();
    for (const key in query) {
      if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
        const val = query[key];
        items = items.filter((item: any) => {
          const itemVal = item[key];
          // Handle Regex search
          if (typeof val === 'object' && val !== null) {
            if (val.$regex) {
              const regex = new RegExp(val.$regex, val.$options || 'i');
              return regex.test(String(itemVal || ''));
            }
            if (val.$in) {
              return Array.isArray(val.$in) && val.$in.includes(itemVal);
            }
            if (val.$or) {
              // Basic $or matching
              return val.$or.some((subQuery: any) => {
                for (const subKey in subQuery) {
                  const subVal = subQuery[subKey];
                  if (subVal.$regex) {
                    const regex = new RegExp(subVal.$regex, subVal.$options || 'i');
                    if (regex.test(String(item[subKey] || ''))) return true;
                  } else if (String(item[subKey]) === String(subVal)) {
                    return true;
                  }
                }
                return false;
              });
            }
          }
          // Default exact string match (case-insensitive for convenience)
          return String(itemVal).toLowerCase() === String(val).toLowerCase();
        });
      }
    }
    return items;
  }

  async findOne(query: any = {}): Promise<T | null> {
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id: string): Promise<T | null> {
    const items = this.read();
    return items.find((item: any) => item._id === id) || null;
  }

  async create(data: Partial<T>): Promise<T> {
    const items = this.read();
    const newItem = {
      ...data,
      _id: Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as T;
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id: string, update: any, options: any = {}): Promise<T | null> {
    const items = this.read();
    const index = items.findIndex((item: any) => item._id === id);
    if (index === -1) return null;
    
    // Support update operators if any ($push etc.)
    const currentItem = items[index] as any;
    let newFields = { ...update };
    
    if (update.$push) {
      for (const key in update.$push) {
        if (!Array.isArray(currentItem[key])) {
          currentItem[key] = [];
        }
        currentItem[key].push(update.$push[key]);
      }
      delete newFields.$push;
    }
    
    const updatedItem = {
      ...currentItem,
      ...newFields,
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedItem;
    this.write(items);
    return updatedItem;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const items = this.read();
    const index = items.findIndex((item: any) => item._id === id);
    if (index === -1) return null;
    const deleted = items[index];
    items.splice(index, 1);
    this.write(items);
    return deleted;
  }
}

// -------------------------------------------------------------
// 2. MONGOOSE SCHEMA DEFINITIONS
// -------------------------------------------------------------

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  enrollmentYear: { type: String }, // For admin advocates
  isVerified: { type: Boolean, default: false },
  profilePhoto: { type: String },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

const AdvocateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  enrollmentNumber: { type: String, required: true },
  enrollmentDate: { type: String, required: true },
  specialization: { type: String, required: true },
  court: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  experience: { type: Number, required: true },
  photo: { type: String },
  bio: { type: String },
  address: { type: String },
  availability: { type: String, default: 'Available' }, // Available, Busy, Away
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const JudgementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  court: { type: String, required: true },
  state: { type: String },
  judge: { type: String, required: true },
  year: { type: Number, required: true },
  subject: { type: String, required: true },
  keywords: { type: [String], default: [] },
  pdfUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedBy: { type: String, required: true }
}, { timestamps: true });

const LawSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // Act, Rule, Regulation, Constitution, Article
  description: { type: String },
  pdfUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedBy: { type: String, required: true }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  receiverId: { type: String }, // for 1-1 chat
  groupId: { type: String }, // for group chat
  encryptedContent: { type: String, required: true }, // AES encrypted
  iv: { type: String, required: true }, // Initialization vector
  isGroup: { type: Boolean, default: false },
  attachments: [{
    fileName: { type: String },
    fileUrl: { type: String },
    fileType: { type: String }
  }],
  readBy: { type: [String], default: [] }, // Array of userIds who read
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientName: { type: String },
  caseNo: { type: String },
  nextHearingDate: { type: String },
  plaintiffName: { type: String },
  defendantName: { type: String },
  clientPhone: { type: String },
  courtType: { type: String },
  courtCity: { type: String },
  caseType: { type: String, enum: ['Civil', 'Criminal'] },
  description: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Planning', 'In Progress', 'On Hold', 'Completed'], default: 'Planning' },
  deadline: { type: String },
  progress: { type: Number, default: 0 },
  teamMembers: { type: [String], default: [] }, // Array of user names/emails
  tasks: [{
    _id: { type: String, required: true },
    title: { type: String, required: true },
    assignedTo: { type: String },
    priority: { type: String },
    status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
    deadline: { type: String }
  }],
  comments: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  versions: [{
    version: { type: Number, required: true },
    title: { type: String },
    content: { type: String },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }],
  currentDocContent: { type: String, default: '' },
  activityTimeline: [{
    userName: { type: String },
    action: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // info, warning, success, alert
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  ip: { type: String },
  details: { type: String }
}, { timestamps: true });

// -------------------------------------------------------------
// 3. UNIFIED EXPORTS (Mongoose or Mock Database Fallback)
// -------------------------------------------------------------
export let User: any;
export let Advocate: any;
export let Judgement: any;
export let Law: any;
export let Message: any;
export let Project: any;
export let Notification: any;
export let AuditLog: any;

if (!USE_MOCK_DB) {
  User = mongoose.model('User', UserSchema);
  Advocate = mongoose.model('Advocate', AdvocateSchema);
  Judgement = mongoose.model('Judgement', JudgementSchema);
  Law = mongoose.model('Law', LawSchema);
  Message = mongoose.model('Message', MessageSchema);
  Project = mongoose.model('Project', ProjectSchema);
  Notification = mongoose.model('Notification', NotificationSchema);
  AuditLog = mongoose.model('AuditLog', AuditLogSchema);
} else {
  User = new MockModel('User');
  Advocate = new MockModel('Advocate');
  Judgement = new MockModel('Judgement');
  Law = new MockModel('Law');
  Message = new MockModel('Message');
  Project = new MockModel('Project');
  Notification = new MockModel('Notification');
  AuditLog = new MockModel('AuditLog');
}
