import {
  users,
  summaries,
  bookmarks,
  type User,
  type UpsertUser,
  type Summary,
  type InsertSummary,
  type Bookmark,
  type InsertBookmark,
  type SummaryWithBookmark,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Summary operations
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummary(id: string): Promise<Summary | undefined>;
  getUserSummaries(userId: string): Promise<SummaryWithBookmark[]>;
  deleteSummary(id: string, userId: string): Promise<void>;
  searchSummaries(userId: string, query: string): Promise<SummaryWithBookmark[]>;
  
  // Bookmark operations
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: string, summaryId: string): Promise<void>;
  getUserBookmarks(userId: string): Promise<SummaryWithBookmark[]>;
  
  // Stats
  getUserStats(userId: string): Promise<{
    totalSummaries: number;
    bookmarkedCount: number;
    hoursSaved: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Summary operations
  async createSummary(summary: InsertSummary): Promise<Summary> {
    const [newSummary] = await db
      .insert(summaries)
      .values(summary)
      .returning();
    return newSummary;
  }

  async getSummary(id: string): Promise<Summary | undefined> {
    const [summary] = await db
      .select()
      .from(summaries)
      .where(eq(summaries.id, id));
    return summary;
  }

  async getUserSummaries(userId: string): Promise<SummaryWithBookmark[]> {
    const result = await db
      .select({
        id: summaries.id,
        userId: summaries.userId,
        title: summaries.title,
        videoUrl: summaries.videoUrl,
        videoDuration: summaries.videoDuration,
        summary: summaries.summary,
        createdAt: summaries.createdAt,
        updatedAt: summaries.updatedAt,
        isBookmarked: sql<boolean>`CASE WHEN ${bookmarks.id} IS NOT NULL THEN true ELSE false END`,
      })
      .from(summaries)
      .leftJoin(bookmarks, and(
        eq(bookmarks.summaryId, summaries.id),
        eq(bookmarks.userId, userId)
      ))
      .where(eq(summaries.userId, userId))
      .orderBy(desc(summaries.createdAt));
    
    return result;
  }

  async deleteSummary(id: string, userId: string): Promise<void> {
    await db
      .delete(summaries)
      .where(and(eq(summaries.id, id), eq(summaries.userId, userId)));
  }

  async searchSummaries(userId: string, query: string): Promise<SummaryWithBookmark[]> {
    const result = await db
      .select({
        id: summaries.id,
        userId: summaries.userId,
        title: summaries.title,
        videoUrl: summaries.videoUrl,
        videoDuration: summaries.videoDuration,
        summary: summaries.summary,
        createdAt: summaries.createdAt,
        updatedAt: summaries.updatedAt,
        isBookmarked: sql<boolean>`CASE WHEN ${bookmarks.id} IS NOT NULL THEN true ELSE false END`,
      })
      .from(summaries)
      .leftJoin(bookmarks, and(
        eq(bookmarks.summaryId, summaries.id),
        eq(bookmarks.userId, userId)
      ))
      .where(and(
        eq(summaries.userId, userId),
        or(
          ilike(summaries.title, `%${query}%`),
          ilike(summaries.summary, `%${query}%`)
        )
      ))
      .orderBy(desc(summaries.createdAt));
    
    return result;
  }

  // Bookmark operations
  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const [newBookmark] = await db
      .insert(bookmarks)
      .values(bookmark)
      .returning();
    return newBookmark;
  }

  async deleteBookmark(userId: string, summaryId: string): Promise<void> {
    await db
      .delete(bookmarks)
      .where(and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.summaryId, summaryId)
      ));
  }

  async getUserBookmarks(userId: string): Promise<SummaryWithBookmark[]> {
    const result = await db
      .select({
        id: summaries.id,
        userId: summaries.userId,
        title: summaries.title,
        videoUrl: summaries.videoUrl,
        videoDuration: summaries.videoDuration,
        summary: summaries.summary,
        createdAt: summaries.createdAt,
        updatedAt: summaries.updatedAt,
        isBookmarked: sql<boolean>`true`,
      })
      .from(summaries)
      .innerJoin(bookmarks, eq(bookmarks.summaryId, summaries.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
    
    return result;
  }

  // Stats
  async getUserStats(userId: string): Promise<{
    totalSummaries: number;
    bookmarkedCount: number;
    hoursSaved: number;
  }> {
    const [summaryStats] = await db
      .select({
        totalSummaries: sql<number>`count(${summaries.id})`,
      })
      .from(summaries)
      .where(eq(summaries.userId, userId));

    const [bookmarkStats] = await db
      .select({
        bookmarkedCount: sql<number>`count(${bookmarks.id})`,
      })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    // Calculate hours saved based on video durations (rough estimate)
    const hoursSaved = Math.round((summaryStats.totalSummaries * 0.5) * 10) / 10;

    return {
      totalSummaries: summaryStats.totalSummaries || 0,
      bookmarkedCount: bookmarkStats.bookmarkedCount || 0,
      hoursSaved,
    };
  }
}

export const storage = new DatabaseStorage();
