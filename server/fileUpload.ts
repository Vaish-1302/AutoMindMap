import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow specific file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Please upload PDF, text, Word documents, or images.'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Helper function to extract text from different file types
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      // For PDF files, we would need pdf-parse library
      // For now, return a placeholder
      return `[PDF Content: ${path.basename(filePath)} - Text extraction not yet implemented]`;
    } else if (mimeType.startsWith('text/')) {
      // For text files
      return fs.readFileSync(filePath, 'utf-8');
    } else if (mimeType.startsWith('image/')) {
      // For images, we would need OCR
      return `[Image: ${path.basename(filePath)} - OCR not yet implemented]`;
    } else {
      return `[File: ${path.basename(filePath)} - Content extraction not yet implemented]`;
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `[Error reading file: ${path.basename(filePath)}]`;
  }
}

// Helper function to clean up uploaded files
export function cleanupFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
}
