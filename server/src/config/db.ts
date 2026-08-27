import mongoose from 'mongoose';

export const connectDB = async () => {
  const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';
  if (USE_MOCK_DB) {
    console.log('📦 Database Status: Running in Mock JSON Database Fallback mode.');
    return;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/unified-legal-system';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('⚡ Connected to MongoDB Database successfully.');
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️ Falling back to Mock JSON Database mode.');
    process.env.USE_MOCK_DB = 'true';
  }
};
