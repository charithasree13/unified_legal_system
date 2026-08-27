import mongoose from 'mongoose';

export const connectDB = async () => {
  const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';
  if (USE_MOCK_DB) {
    console.log('📦 Database Status: Running in Mock JSON Database Fallback mode.');
    return;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://pcharithasree13_db_user:Cherry1113@start-up-crm-lite.njma2fj.mongodb.net/unified-legal-system?retryWrites=true&w=majority';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('⚡ Connected to MongoDB Database successfully.');
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️ Falling back to Mock JSON Database mode.');
    process.env.USE_MOCK_DB = 'true';
  }
};
