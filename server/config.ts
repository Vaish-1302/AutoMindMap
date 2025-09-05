import dotenv from 'dotenv';

// Load environment variables from .env file if it exists
dotenv.config();

export const config = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/automindmap',
    dbName: process.env.DATABASE_NAME || 'automindmap',
  },
  
  // Gemini API Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  },
  
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  }
};

// Validate required configuration
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!config.mongodb.uri) {
    errors.push('MONGODB_URI is required');
  }
  
  if (!config.gemini.apiKey) {
    errors.push('GEMINI_API_KEY or GOOGLE_API_KEY is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return config;
};
