import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { mongoStorage } from "./mongoStorage";
import { chatStorage } from "./mongoStorage";
import { authenticateToken } from "./middleware/auth";
import authRoutes from "./auth";
import { summarizeYouTubeVideo, explainText, extractVideoIdFromUrl } from "./gemini";
import { getVideoDetails } from "./youtube";
import connectDatabase from "./database";
import { chatAI } from "./chatAI";

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to database
  await connectDatabase();
  const authMw: RequestHandler = authenticateToken as unknown as RequestHandler;
  
  // Auth routes (register, login, etc.)
  app.use('/api/auth', authRoutes);

  // Simple logout route for JWT/localStorage auth
  app.get('/api/logout', (_req, res) => {
    // JWT is stored client-side; server just responds OK so client can clear storage
    res.status(204).end();
  });

  // Auth routes
  app.get('/api/auth/user', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const user = await mongoStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/auth/user', authMw, async (req: any, res) => {
    try {
      console.log("PUT /api/auth/user - Request received:", req.body);
      console.log("Headers:", req.headers);
      
      const userId = (req.user._id as any).toString();
      console.log("User ID from token:", userId);
      
      const { firstName, lastName } = req.body;
      console.log(`Updating user ${userId} with firstName: ${firstName}, lastName: ${lastName}`);
      
      if (!firstName && !lastName) {
        console.log("Update rejected: No fields provided");
        return res.status(400).json({ message: "At least one field is required" });
      }
      
      // Get current user data
      console.log("Fetching current user data...");
      const currentUser = await mongoStorage.getUser(userId);
      if (!currentUser) {
        console.log(`User ${userId} not found`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Current user data:", currentUser);
      
      // Update user data
      const userData = {
        id: userId, // Include the user ID
        email: currentUser.email,
        firstName: firstName || currentUser.firstName,
        lastName: lastName || currentUser.lastName,
        profileImageUrl: currentUser.profileImageUrl
      };
      
      console.log("Updating with data:", userData);
      console.log("Calling mongoStorage.upsertUser...");
      const updatedUser = await mongoStorage.upsertUser(userData);
      console.log("User updated successfully:", updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Summary routes
  app.post('/api/summaries', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { videoUrl } = req.body;

      if (!videoUrl) {
        return res.status(400).json({ message: "Video URL is required" });
      }

      const videoId = extractVideoIdFromUrl(videoUrl);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      // Fetch video details to derive title/duration
      const videoDetails = await getVideoDetails(videoId);
      // Generate summary using Gemini API
      const aiSummary = await summarizeYouTubeVideo(videoUrl);
      
      // Create summary in database
      const summaryData = {
        userId,
        title: videoDetails.title || `Video Summary - ${new Date().toLocaleDateString()}`,
        videoUrl,
        videoDuration: videoDetails.duration || "Unknown",
        summary: aiSummary,
      };

      const newSummary = await mongoStorage.createSummary(summaryData);
      
      res.json(newSummary);
    } catch (error) {
      console.error("Error creating summary:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create summary" 
      });
    }
  });

  app.get('/api/summaries', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const summaries = await mongoStorage.getUserSummaries(userId);
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      res.status(500).json({ message: "Failed to fetch summaries" });
    }
  });

  app.get('/api/summaries/:id', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      
      const summary = await mongoStorage.getSummary(id);
      if (!summary || summary.userId.toString() !== userId) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  app.delete('/api/summaries/:id', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      
      await mongoStorage.deleteSummary(id, userId);
      res.json({ message: "Summary deleted successfully" });
    } catch (error) {
      console.error("Error deleting summary:", error);
      res.status(500).json({ message: "Failed to delete summary" });
    }
  });

  // Search route
  app.get('/api/search', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await mongoStorage.searchSummaries(userId, q);
      res.json(results);
    } catch (error) {
      console.error("Error searching summaries:", error);
      res.status(500).json({ message: "Failed to search summaries" });
    }
  });

  // Admin-style backfill: rename existing summaries based on video title
  // Note: This operates on the authenticated user's summaries only.
  app.post('/api/summaries/backfill-titles', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const summaries = await mongoStorage.getUserSummaries(userId);
      let updated = 0;

      for (const s of summaries) {
        try {
          const videoId = extractVideoIdFromUrl(s.videoUrl);
          if (!videoId) continue;
          const details = await getVideoDetails(videoId);
          const newTitle = details.title?.trim();
          const newDuration = details.duration || undefined;
          if (newTitle && newTitle !== s.title) {
            await mongoStorage.updateSummaryMeta(s.id, userId, { title: newTitle, videoDuration: newDuration });
            updated++;
          } else if (newDuration && newDuration !== s.videoDuration) {
            await mongoStorage.updateSummaryMeta(s.id, userId, { videoDuration: newDuration });
          }
        } catch (e) {
          // continue with others
        }
      }

      res.json({ updated });
    } catch (error) {
      console.error('Error backfilling titles:', error);
      res.status(500).json({ message: 'Failed to backfill titles' });
    }
  });

  // Bookmark routes
  app.post('/api/bookmarks', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { summaryId } = req.body;
      
      const bookmarkData = { userId, summaryId };
      const bookmark = await mongoStorage.createBookmark(bookmarkData);
      
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.delete('/api/bookmarks/:summaryId', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { summaryId } = req.params;
      
      await mongoStorage.deleteBookmark(userId, summaryId);
      res.json({ message: "Bookmark removed successfully" });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  app.get('/api/bookmarks', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const bookmarks = await mongoStorage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Stats route
  app.get('/api/stats', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const stats = await mongoStorage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Explain text route
  app.post('/api/explain', authMw, async (req: any, res) => {
    try {
      const { text, mode, style, duration, coverage } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      // Support both legacy modes and new comprehensive mode
      const allowedModes = new Set(["short", "medium", "long", "comprehensive"]);
      const allowedStyles = new Set(["standard", "teacher", "expert", "accessible"]);
      
      const validMode = allowedModes.has(mode) ? mode : undefined;
      const validStyle = allowedStyles.has(style) ? style : undefined;
      const options = { duration, coverage };
      
      const explanation = await explainText(text, validMode as any, validStyle as any, options);
      res.json({ explanation });
    } catch (error) {
      console.error("Error explaining text:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to explain text" 
      });
    }
  });

  // Chat routes
  app.post('/api/chats', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { title, firstMessage } = req.body;
      
      let chatTitle = title || "New Chat";
      
      // Generate smart title if first message is provided
      if (firstMessage && !title) {
        try {
          chatTitle = await chatAI.generateChatTitle(firstMessage);
        } catch (error) {
          console.error("Error generating chat title:", error);
          // Fallback to default title
        }
      }
      
      const chat = await chatStorage.createChat(userId, chatTitle);
      res.json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.get('/api/chats', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const chats = await chatStorage.getUserChats(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get('/api/chats/:id', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      
      const chat = await chatStorage.getChat(id, userId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      res.json(chat);
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.post('/api/chats/:id/messages', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      const { role, content, attachments } = req.body;
      
      if (!role || !content) {
        return res.status(400).json({ message: "Role and content are required" });
      }
      
      const message = { role, content, attachments };
      const updatedChat = await chatStorage.addMessage(id, userId, message);
      res.json(updatedChat);
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ message: "Failed to add message" });
    }
  });

  // Generate AI response with full context
  app.post('/api/chats/:id/generate-response', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      
      // Get the chat with full history
      const chat = await chatStorage.getChat(id, userId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      
      // Get the last user message
      const lastUserMessage = chat.messages
        .filter(msg => msg.role === 'user')
        .pop();
      
      if (!lastUserMessage) {
        return res.status(400).json({ message: "No user message found" });
      }
      
      // Generate AI response with full context
      const aiResponse = await chatAI.generateResponse({
        chatHistory: chat.messages,
        userMessage: lastUserMessage.content,
        attachments: lastUserMessage.attachments
      });
      
      // Add AI response to chat
      const aiMessage = {
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date()
      };
      
      const finalChat = await chatStorage.addMessage(id, userId, aiMessage);
      res.json(finalChat);
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  app.put('/api/chats/:id/title', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      const chat = await chatStorage.updateChatTitle(id, userId, title);
      res.json(chat);
    } catch (error) {
      console.error("Error updating chat title:", error);
      res.status(500).json({ message: "Failed to update chat title" });
    }
  });

  app.delete('/api/chats/:id', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      
      await chatStorage.deleteChat(id, userId);
      res.json({ message: "Chat deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.status(500).json({ message: "Failed to delete chat" });
    }
  });



  app.patch('/api/chats/:id/star', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      
      const chat = await chatStorage.starChat(id, userId);
      res.json(chat);
    } catch (error) {
      console.error("Error starring chat:", error);
      res.status(500).json({ message: "Failed to star chat" });
    }
  });

  app.patch('/api/chats/:id/unstar', authMw, async (req: any, res) => {
    try {
      const userId = (req.user._id as any).toString();
      const { id } = req.params;
      
      const chat = await chatStorage.unstarChat(id, userId);
      res.json(chat);
    } catch (error) {
      console.error("Error unstarring chat:", error);
      res.status(500).json({ message: "Failed to unstar chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}