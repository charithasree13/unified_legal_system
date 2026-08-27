import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// 1. MOCK DATA BASE ENGINE (JSON fallback)
// -------------------------------------------------------------
const DATA_DIR = path.join(__dirname, '../../data');

class MockModel<T extends { _id?: string; createdAt?: string; updatedAt?: string }> {
  private filePath: string;

  constructor(private name: string) {
    if (!fs.existsSync(DATA_DIR)) {
      try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
    }
    this.filePath = path.join(DATA_DIR, `${name.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      try { fs.writeFileSync(this.filePath, JSON.stringify([], null, 2)); } catch {}
    }
  }

  private read(): T[] {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private write(data: T[]) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {}
  }

  async find(query: any = {}): Promise<T[]> {
    let items = this.read();
    if (!query || Object.keys(query).length === 0) return items;

    return items.filter((item: any) => {
      if (query.$or && Array.isArray(query.$or)) {
        const matchesOr = query.$or.some((subQuery: any) => {
          return Object.keys(subQuery).every((subKey) => {
            const val = subQuery[subKey];
            if (val === undefined) return true;
            return String(item[subKey] || '').toLowerCase() === String(val || '').toLowerCase();
          });
        });
        if (!matchesOr) return false;
      }

      for (const key in query) {
        if (key === '$or') continue;
        const val = query[key];
        if (val === undefined || val === null || val === '') continue;

        const itemVal = item[key];
        if (typeof val === 'object' && val !== null) {
          if (val.$regex) {
            const regex = new RegExp(val.$regex, val.$options || 'i');
            if (!regex.test(String(itemVal || ''))) return false;
          } else if (val.$in) {
            if (!Array.isArray(val.$in) || !val.$in.includes(itemVal)) return false;
          }
        } else {
          if (String(itemVal || '').toLowerCase() !== String(val || '').toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    });
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

  async findOneAndUpdate(query: any, update: any, options: any = {}): Promise<T | null> {
    const item = await this.findOne(query);
    if (!item || !item._id) return null;
    return this.findByIdAndUpdate(item._id, update, options);
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
  phone: { type: String, required: false },
  email: { type: String, required: false },
  password: { type: String, required: false },
  role: { type: String, enum: ['Admin', 'Advocate', 'Client', 'User'], default: 'Client' },
  googleSub: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['LOCAL', 'GOOGLE'], default: 'LOCAL' },
  emailVerified: { type: Boolean, default: false },
  enrollmentNumber: { type: String }, // Bar Council Enrollment Number (Advocates)
  enrollmentYear: { type: String }, // For admin advocates
  isVerified: { type: Boolean, default: false },
  hasCompletedProfile: { type: Boolean, default: false },
  profilePhoto: { type: String },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

const AdvocateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: false },
  email: { type: String, required: true },
  googleSub: { type: String, sparse: true },
  authProvider: { type: String, enum: ['LOCAL', 'GOOGLE'], default: 'LOCAL' },
  emailVerified: { type: Boolean, default: false },
  enrollmentNumber: { type: String, required: false },
  enrollmentDate: { type: String, required: false },
  specialization: { type: String, required: false },
  court: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },
  experience: { type: Number, default: 0 },
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
  plaintiffEmail: { type: String },
  defendantEmail: { type: String },
  hearingRemindersSent: [{
    hearingDate: { type: String, required: true },
    userEmail: { type: String, required: true },
    sentAt: { type: Date, default: Date.now }
  }],
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
// COURT FEE CALCULATION MODULE SCHEMAS
// -------------------------------------------------------------

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['State', 'Union Territory'], default: 'State' },
  defaultActName: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CourtTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  pecuniaryLimitMin: { type: Number, default: 0 },
  pecuniaryLimitMax: { type: Number }, // null means unlimited
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CaseTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  category: { type: String, enum: ['Civil', 'Criminal', 'Commercial', 'Special', 'Consumer', 'Tribunal'], default: 'Civil' },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ReliefTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  caseTypeName: { type: String, required: true },
  valuationBasis: { type: String, enum: ['ClaimAmount', 'MarketValue', 'AgreementValue', 'Fixed', 'LoanAmount', 'CompensationAmount'], default: 'ClaimAmount' },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const DistrictSchema = new mongoose.Schema({
  stateName: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ScheduleSchema = new mongoose.Schema({
  actName: { type: String, required: true },
  name: { type: String, required: true }, // e.g. Schedule I, Schedule II
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ArticleSchema = new mongoose.Schema({
  actName: { type: String, required: true },
  scheduleName: { type: String, required: true },
  articleNo: { type: String, required: true }, // e.g. Article 1
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CourtFeeActSchema = new mongoose.Schema({
  stateName: { type: String, required: true },
  actName: { type: String, required: true },
  shortTitle: { type: String },
  enactmentYear: { type: Number },
  effectiveDate: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const CourtFeeRuleSchema = new mongoose.Schema({
  stateName: { type: String, required: true },
  courtTypeName: { type: String, required: true },
  caseTypeName: { type: String, required: true },
  reliefTypeName: { type: String, required: true },
  
  // Legal Citation References
  actName: { type: String, required: true },
  section: { type: String, default: 'General' },
  schedule: { type: String, default: 'Schedule I' },
  article: { type: String, default: 'Article 1' },
  notificationNo: { type: String, default: '' },
  notificationDate: { type: String, default: '' },

  // Rule Formula Configuration
  feeType: { type: String, enum: ['Fixed', 'AdValorem', 'SlabBased', 'Percentage', 'MarketValue', 'Custom'], default: 'AdValorem' },
  fixedFee: { type: Number, default: 0 },
  ratePercentage: { type: Number, default: 0 },
  valuationMultiplier: { type: Number, default: 1.0 },
  minFee: { type: Number, default: 0 },
  maxFee: { type: Number }, // null means no cap
  roundingIncrement: { type: Number, default: 1 },

  effectiveDate: { type: String },
  expiryDate: { type: String },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  remarks: { type: String }
}, { timestamps: true });

const CourtFeeSlabSchema = new mongoose.Schema({
  ruleId: { type: String, required: true },
  minVal: { type: Number, required: true },
  maxVal: { type: Number }, // null means infinity
  ratePercentage: { type: Number, default: 0 },
  ratePerUnit: { type: Number, default: 0 },
  unitSize: { type: Number, default: 1000 },
  fixedAddition: { type: Number, default: 0 },
  cumulativeBaseFee: { type: Number, default: 0 },
  version: { type: Number, default: 1 }
}, { timestamps: true });

const LegalNotificationSchema = new mongoose.Schema({
  notificationNo: { type: String, required: true },
  stateName: { type: String, required: true },
  actName: { type: String, required: true },
  title: { type: String, required: true },
  issuedBy: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  summary: { type: String }
}, { timestamps: true });

const RuleVersionSchema = new mongoose.Schema({
  ruleId: { type: String, required: true },
  version: { type: Number, required: true },
  modifiedBy: { type: String, required: true },
  changeDescription: { type: String, required: true },
  previousConfig: { type: Object }
}, { timestamps: true });

const CalculationHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  stateName: { type: String, required: true },
  district: { type: String },
  courtTypeName: { type: String, required: true },
  caseTypeName: { type: String, required: true },
  reliefTypeName: { type: String, required: true },
  claimAmount: { type: Number, default: 0 },
  marketValue: { type: Number, default: 0 },
  agreementValue: { type: Number, default: 0 },
  loanAmount: { type: Number, default: 0 },
  compensationAmount: { type: Number, default: 0 },
  suitValuation: { type: Number, required: true },
  calculatedFee: { type: Number, required: true },
  appliedRuleId: { type: String },
  legalProvision: { type: String, required: true },
  breakdown: { type: [String], default: [] },
  warning: { type: String }
}, { timestamps: true });

const OTPVerificationSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  identifierType: { type: String, enum: ['email', 'mobile'], required: true },
  role: { type: String, enum: ['Admin', 'Advocate', 'Client', 'User'], default: 'Client' },
  hashedOTP: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  resendCount: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false }
}, { timestamps: true });

const LegalSectionMappingSchema = new mongoose.Schema({
  legacyAct: { type: String, required: true }, // e.g. IPC, CrPC, IEA
  legacySection: { type: String, required: true }, // e.g. Section 302
  legacyTitle: { type: String, required: true },
  newAct: { type: String, required: true }, // e.g. BNS, BNSS, BSA
  newSection: { type: String, required: true }, // e.g. Section 103(1)
  newTitle: { type: String, required: true },
  newSectionContent: { type: String }, // Statutory content / text of the new section
  keyChanges: { type: [String], default: [] }, // Key changes and legal implications
  mappingType: { 
    type: String, 
    enum: ['DIRECT_REPLACEMENT', 'MULTIPLE_REPLACEMENT', 'PARTIAL_REPLACEMENT', 'REORGANIZED', 'NO_DIRECT_EQUIVALENT'], 
    required: true 
  },
  mappingStatus: { 
    type: String, 
    enum: ['VERIFIED', 'NEEDS_REVIEW'], 
    default: 'VERIFIED' 
  },
  sourceReference: { type: String, required: true },
  factualNotes: { type: String },
  createdBy: { type: String, default: 'System Admin' }
}, { timestamps: true });

// -------------------------------------------------------------
// 3. UNIFIED DYNAMIC EXPORTS (Mongoose with automatic Mock fallback)
// -------------------------------------------------------------

function createDynamicModel(name: string, schema: mongoose.Schema) {
  const mongooseModel = mongoose.models[name] || mongoose.model(name, schema);
  const mockModel = new MockModel(name);

  return new Proxy({}, {
    get(_target, prop: string) {
      const isMongoConnected = mongoose.connection.readyState === 1 && process.env.USE_MOCK_DB !== 'true';
      const activeModel = isMongoConnected ? mongooseModel : mockModel;
      const targetVal = (activeModel as any)[prop];
      if (typeof targetVal === 'function') {
        return targetVal.bind(activeModel);
      }
      return targetVal;
    }
  });
}

export const User: any = createDynamicModel('User', UserSchema);
export const Advocate: any = createDynamicModel('Advocate', AdvocateSchema);
export const Judgement: any = createDynamicModel('Judgement', JudgementSchema);
export const Law: any = createDynamicModel('Law', LawSchema);
export const Message: any = createDynamicModel('Message', MessageSchema);
export const Project: any = createDynamicModel('Project', ProjectSchema);
export const Notification: any = createDynamicModel('Notification', NotificationSchema);
export const AuditLog: any = createDynamicModel('AuditLog', AuditLogSchema);

export const State: any = createDynamicModel('State', StateSchema);
export const District: any = createDynamicModel('District', DistrictSchema);
export const CourtType: any = createDynamicModel('CourtType', CourtTypeSchema);
export const CaseType: any = createDynamicModel('CaseType', CaseTypeSchema);
export const ReliefType: any = createDynamicModel('ReliefType', ReliefTypeSchema);
export const CourtFeeAct: any = createDynamicModel('CourtFeeAct', CourtFeeActSchema);
export const Schedule: any = createDynamicModel('Schedule', ScheduleSchema);
export const Article: any = createDynamicModel('Article', ArticleSchema);
export const CourtFeeRule: any = createDynamicModel('CourtFeeRule', CourtFeeRuleSchema);
export const CourtFeeSlab: any = createDynamicModel('CourtFeeSlab', CourtFeeSlabSchema);
export const LegalNotification: any = createDynamicModel('LegalNotification', LegalNotificationSchema);
export const RuleVersion: any = createDynamicModel('RuleVersion', RuleVersionSchema);
export const CalculationHistory: any = createDynamicModel('CalculationHistory', CalculationHistorySchema);
export const OTPVerification: any = createDynamicModel('OTPVerification', OTPVerificationSchema);
export const RefreshToken: any = createDynamicModel('RefreshToken', RefreshTokenSchema);
export const LegalSectionMapping: any = createDynamicModel('LegalSectionMapping', LegalSectionMappingSchema);
