import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSummarySchema, insertBookmarkSchema } from "@shared/schema";
import { summarizeYouTubeVideo, explainText, extractVideoIdFromUrl } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Summary routes
  app.post('/api/summaries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { videoUrl } = req.body;

      if (!videoUrl) {
        return res.status(400).json({ message: "Video URL is required" });
      }

      const videoId = extractVideoIdFromUrl(videoUrl);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      // Generate summary using Gemini API
      const aiSummary = await summarizeYouTubeVideo(videoUrl);
      
      // Create summary in database
      const summaryData = {
        userId,
        title: `Video Summary - ${new Date().toLocaleDateString()}`,
        videoUrl,
        videoDuration: "Unknown", // We'll update this when we can extract video metadata
        summary: aiSummary,
      };

      const validatedData = insertSummarySchema.parse(summaryData);
      const newSummary = await storage.createSummary(validatedData);
      
      res.json(newSummary);
    } catch (error) {
      console.error("Error creating summary:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create summary" 
      });
    }
  });

  app.get('/api/summaries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const summaries = await storage.getUserSummaries(userId);
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      res.status(500).json({ message: "Failed to fetch summaries" });
    }
  });

  app.get('/api/summaries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const summary = await storage.getSummary(id);
      if (!summary || summary.userId !== userId) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  app.delete('/api/summaries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      await storage.deleteSummary(id, userId);
      res.json({ message: "Summary deleted successfully" });
    } catch (error) {
      console.error("Error deleting summary:", error);
      res.status(500).json({ message: "Failed to delete summary" });
    }
  });

  // Search route
  app.get('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchSummaries(userId, q);
      res.json(results);
    } catch (error) {
      console.error("Error searching summaries:", error);
      res.status(500).json({ message: "Failed to search summaries" });
    }
  });

  // Bookmark routes
  app.post('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { summaryId } = req.body;
      
      const bookmarkData = { userId, summaryId };
      const validatedData = insertBookmarkSchema.parse(bookmarkData);
      const bookmark = await storage.createBookmark(validatedData);
      
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  app.delete('/api/bookmarks/:summaryId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { summaryId } = req.params;
      
      await storage.deleteBookmark(userId, summaryId);
      res.json({ message: "Bookmark removed successfully" });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      res.status(500).json({ message: "Failed to remove bookmark" });
    }
  });

  app.get('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Stats route
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Explain text route
  app.post('/api/explain', isAuthenticated, async (req: any, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const explanation = await explainText(text);
      res.json({ explanation });
    } catch (error) {
      console.error("Error explaining text:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to explain text" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
