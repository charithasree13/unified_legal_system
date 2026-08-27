import mongoose from 'mongoose';

export const connectDB = async () => {
  const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';
  if (USE_MOCK_DB) {
    console.log('📦 Database Status: Running in Mock JSON Database Fallback mode.');
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('⚠️ MONGO_URI environment variable not set. Running in Mock JSON Database mode.');
    process.env.USE_MOCK_DB = 'true';
    return;
  }
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('⚡ Connected to MongoDB Database successfully.');
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️ Falling back to Mock JSON Database mode.');
    process.env.USE_MOCK_DB = 'true';
  }
};
