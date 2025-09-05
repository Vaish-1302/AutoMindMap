# AutoMindMap

## Overview

AutoMindMap is a full-stack web application designed to transform learning through AI-powered YouTube video summaries. The application allows users to input YouTube video links and receive detailed, comprehensive summaries generated using Google's Gemini AI. Built with modern web technologies, it features user authentication, real-time data storage, and advanced AI integration to help students save time and retain more knowledge from educational video content.

The platform provides additional features like text explanation for complex concepts, bookmarking capabilities, and text-to-speech functionality to enhance the learning experience. Users can manage their summaries, search through their content, and access detailed analytics about their learning progress.

## Features

- **AI-Powered Video Summaries**: Generate comprehensive summaries of YouTube videos
- **Text Explanation**: Get explanations for complex concepts
- **Chat System**: Interact with AI assistant through a chat interface
- **User Authentication**: Secure login and registration system
- **Bookmarking**: Save and organize important summaries
- **History Tracking**: View your learning progress over time
- **Profile Management**: Customize your user profile
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Radix UI components
- TanStack Query for state management
- React Hook Form with Zod validation

### Backend
- Node.js with Express
- TypeScript
- RESTful API architecture
- JWT Authentication
- MongoDB for chat storage
- PostgreSQL with Drizzle ORM

### AI Integration
- Google Gemini API for content generation

## Prerequisites

1. Node.js (v16 or higher)
2. MongoDB (for chat functionality)
3. PostgreSQL database (or Neon Database account)
4. Google Gemini API key

## Setup and Installation

### Option 1: Using the Setup Script (Windows)

1. Clone the repository
2. Run the PowerShell setup script:

```powershell
.\setup-env.ps1
```

This will prompt you for:
- MongoDB URI (defaults to local MongoDB)
- Gemini API Key (required for AI features)
- JWT Secret (defaults to a secure key)
- Server Port (defaults to 5000)

### Option 2: Manual Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/automindmap
YOUTUBE_API_KEY=your_youtube_api_key_here

# Authentication Configuration
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Application Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL=your_postgresql_connection_string_here
DATABASE_NAME=automindmap
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the development server at http://localhost:5000

### Production Build

```bash
npm run build
npm start
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and use it in your environment setup

## Project Structure

```
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   └── src/              # React source code
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utility functions
│       └── pages/        # Page components
├── server/               # Backend Express application
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   └── routes/           # API routes
└── shared/               # Shared code between client and server
    └── schema.ts         # Database schema definitions
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check if MongoDB is accessible on port 27017

### API Key Issues
- Verify that your Gemini API key is valid and has not expired
- Check that the API key is correctly set in your .env file

### Database Connection Issues
- Ensure your PostgreSQL database is running and accessible
- Verify that the DATABASE_URL in your .env file is correct

## License

MIT