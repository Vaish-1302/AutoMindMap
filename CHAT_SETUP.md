# AutoMindMap Chat System Setup Guide

## 🚀 Quick Start

The chat system is now fully integrated into your AutoMindMap application! Here's how to get it running:

## 📋 Prerequisites

1. **MongoDB** - Already installed and running ✅
2. **Node.js** - Already installed ✅
3. **Dependencies** - Already installed ✅

## 🔧 Environment Setup

### Option 1: Use the Setup Script (Recommended)

Run the PowerShell setup script:

```powershell
.\setup-env.ps1
```

This will prompt you for:
- MongoDB URI (defaults to local MongoDB)
- Gemini API Key (required for AI features)
- JWT Secret (defaults to a secure key)
- Server Port (defaults to 5000)

### Option 2: Manual Setup

Create a `.env` file in the root directory with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/automindmap
DATABASE_NAME=automindmap

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and use it in your environment setup

## 🚀 Starting the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to `http://localhost:5000`

3. **Navigate to the Chats section** in the sidebar

## ✨ Features Available

- **Create new chats** with the AI assistant
- **Send messages** and receive AI responses
- **Attach files** (PDFs, images, documents)
- **Search chats** by title
- **Edit chat titles** inline
- **Archive and delete** conversations
- **Real-time messaging** interface

## 🧪 Testing the Chat System

1. **Create a new chat:**
   - Click the "Start New Chat" button
   - Give it a title
   - Type your first message

2. **Send a message:**
   - Type in the chat input
   - Press Enter or click Send
   - The AI will respond using the Gemini API

3. **Test file attachments:**
   - Click the paperclip icon
   - Select a file (PDF, image, etc.)
   - Send the message with attachment

## 🔍 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running: `Get-Service -Name MongoDB`
- Check if MongoDB is accessible on port 27017

### API Key Issues
- Verify your Gemini API key is correct
- Check if the API key has proper permissions

### Port Issues
- Ensure port 5000 is not in use by another application
- Check firewall settings

## 📁 File Structure

```
client/src/components/
├── ChatCard.tsx          # Individual chat display
├── ChatInput.tsx         # Message input with attachments
├── ChatInterface.tsx     # Main chat application
└── Message.tsx           # Individual message display

server/
├── models/Chat.ts        # Chat data model
├── mongoStorage.ts       # Chat storage operations
├── config.ts             # Environment configuration
└── newRoutes.ts          # Chat API endpoints
```

## 🎯 Next Steps

1. **Test the basic functionality** - Create a chat and send messages
2. **Test file attachments** - Try uploading different file types
3. **Customize the AI responses** - Modify the prompt in the chat logic
4. **Add more features** - Consider adding chat categories, user preferences, etc.

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the server console for backend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running and accessible

---

**Happy chatting! 🎉**
