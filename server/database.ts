import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.DATABASE_NAME || 'automindmap';

    await mongoose.connect(mongoUri, {
      dbName: dbName,
    });

    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDatabase;