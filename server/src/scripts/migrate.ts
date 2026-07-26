import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Force USE_MOCK_DB to false to load Mongoose models
process.env.USE_MOCK_DB = 'false';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import {
  User,
  Advocate,
  Judgement,
  Law,
  Message,
  Project,
  Notification,
  AuditLog
} from '../models/Schemas';

const DATA_DIR = path.join(__dirname, '../../data');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unified-legal-system';

// Map to store old random string IDs to new MongoDB ObjectIds
const idMap = new Map<string, mongoose.Types.ObjectId>();

const getOrCreateObjectId = (oldId: string | undefined): mongoose.Types.ObjectId => {
  if (!oldId) return new mongoose.Types.ObjectId();
  
  // If it's already a valid ObjectId hex string, reuse it
  if (mongoose.Types.ObjectId.isValid(oldId)) {
    return new mongoose.Types.ObjectId(oldId);
  }
  
  if (!idMap.has(oldId)) {
    idMap.set(oldId, new mongoose.Types.ObjectId());
  }
  return idMap.get(oldId)!;
};

const readJsonFile = <T>(filename: string): T[] => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filename}, skipping.`);
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content) as T[];
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error);
    return [];
  }
};

const migrate = async () => {
  console.log('🚀 Starting MongoDB Data Migration...');
  console.log(`Connecting to database: ${MONGO_URI}`);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('⚡ Connected to MongoDB successfully.');
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB. Is the database running?', error.message);
    process.exit(1);
  }

  // --- 1. Migrate Users ---
  console.log('\n👥 Migrating Users...');
  const rawUsers = readJsonFile<any>('users.json');
  for (const raw of rawUsers) {
    const newId = getOrCreateObjectId(raw._id);
    const existing = await User.findOne({ email: raw.email });
    if (existing) {
      console.log(`- User with email ${raw.email} already exists in DB. Mapping old ID ${raw._id} to existing DB ID ${existing._id}.`);
      idMap.set(raw._id, existing._id);
      continue;
    }

    const userData = {
      ...raw,
      _id: newId
    };
    await User.create(userData);
    console.log(`- Migrated User: ${raw.name} (${raw.email})`);
  }

  // --- 2. Migrate Advocates ---
  console.log('\n⚖️ Migrating Advocates...');
  const rawAdvocates = readJsonFile<any>('advocates.json');
  for (const raw of rawAdvocates) {
    const newId = getOrCreateObjectId(raw._id);
    const existing = await Advocate.findOne({ email: raw.email });
    if (existing) {
      console.log(`- Advocate with email ${raw.email} already exists in DB.`);
      idMap.set(raw._id, existing._id);
      continue;
    }

    const advocateData = {
      ...raw,
      _id: newId
    };
    await Advocate.create(advocateData);
    console.log(`- Migrated Advocate: ${raw.name}`);
  }

  // --- 3. Migrate Judgements ---
  console.log('\n📄 Migrating Judgements...');
  const rawJudgements = readJsonFile<any>('judgements.json');
  for (const raw of rawJudgements) {
    const newId = getOrCreateObjectId(raw._id);
    const existing = await Judgement.findOne({ title: raw.title, court: raw.court });
    if (existing) {
      console.log(`- Judgement "${raw.title}" already exists in DB.`);
      idMap.set(raw._id, existing._id);
      continue;
    }

    const judgementData = {
      ...raw,
      _id: newId
    };
    await Judgement.create(judgementData);
    console.log(`- Migrated Judgement: ${raw.title}`);
  }

  // --- 4. Migrate Laws ---
  console.log('\n📖 Migrating Laws...');
  const rawLaws = readJsonFile<any>('laws.json');
  for (const raw of rawLaws) {
    const newId = getOrCreateObjectId(raw._id);
    const existing = await Law.findOne({ title: raw.title });
    if (existing) {
      console.log(`- Law "${raw.title}" already exists in DB.`);
      idMap.set(raw._id, existing._id);
      continue;
    }

    const lawData = {
      ...raw,
      _id: newId
    };
    await Law.create(lawData);
    console.log(`- Migrated Law: ${raw.title}`);
  }

  // --- 5. Migrate Messages ---
  console.log('\n💬 Migrating Messages...');
  const rawMessages = readJsonFile<any>('messages.json');
  for (const raw of rawMessages) {
    const newId = getOrCreateObjectId(raw._id);
    const messageData = {
      ...raw,
      _id: newId,
      senderId: getOrCreateObjectId(raw.senderId).toString(),
      receiverId: raw.receiverId ? getOrCreateObjectId(raw.receiverId).toString() : undefined
    };
    await Message.create(messageData);
  }
  console.log(`- Migrated ${rawMessages.length} Messages.`);

  // --- 6. Migrate Projects ---
  console.log('\n📂 Migrating Projects...');
  const rawProjects = readJsonFile<any>('projects.json');
  for (const raw of rawProjects) {
    const newId = getOrCreateObjectId(raw._id);
    
    // Map comments userId if present
    const comments = (raw.comments || []).map((c: any) => ({
      ...c,
      userId: getOrCreateObjectId(c.userId).toString()
    }));

    // Map tasks assignedTo if it refers to an old ID
    const tasks = (raw.tasks || []).map((t: any) => {
      let assignedTo = t.assignedTo;
      if (assignedTo && idMap.has(assignedTo)) {
        assignedTo = getOrCreateObjectId(assignedTo).toString();
      }
      return {
        ...t,
        _id: t._id ? getOrCreateObjectId(t._id).toString() : new mongoose.Types.ObjectId().toString(),
        assignedTo
      };
    });

    const projectData = {
      ...raw,
      _id: newId,
      comments,
      tasks
    };
    await Project.create(projectData);
    console.log(`- Migrated Project: ${raw.name}`);
  }

  // --- 7. Migrate Notifications ---
  console.log('\n🔔 Migrating Notifications...');
  const rawNotifications = readJsonFile<any>('notifications.json');
  for (const raw of rawNotifications) {
    const newId = getOrCreateObjectId(raw._id);
    const notificationData = {
      ...raw,
      _id: newId,
      userId: getOrCreateObjectId(raw.userId).toString()
    };
    await Notification.create(notificationData);
  }
  console.log(`- Migrated ${rawNotifications.length} Notifications.`);

  // --- 8. Migrate Audit Logs ---
  console.log('\n📋 Migrating Audit Logs...');
  const rawAuditLogs = readJsonFile<any>('auditlogs.json');
  for (const raw of rawAuditLogs) {
    const newId = getOrCreateObjectId(raw._id);
    const auditLogData = {
      ...raw,
      _id: newId,
      userId: getOrCreateObjectId(raw.userId).toString()
    };
    await AuditLog.create(auditLogData);
  }
  console.log(`- Migrated ${rawAuditLogs.length} Audit Logs.`);

  console.log('\n✅ Database migration completed successfully!');
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB.');
};

migrate().catch((err) => {
  console.error('❌ Unhandled error during migration:', err);
  process.exit(1);
});
