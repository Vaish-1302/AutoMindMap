import mongoose from 'mongoose';
import { config } from './config.js';

const connectDatabase = async () => {
  try {
    const mongoUri = config.mongodb.uri;
    const dbName = config.mongodb.dbName;

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