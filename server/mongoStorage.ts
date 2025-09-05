import mongoose from 'mongoose';
import Chat, { IChat, IMessage } from './models/Chat';
import User from './models/User';
import { IUser } from './models/User';
import Summary, { ISummary } from './models/Summary';
import Bookmark, { IBookmark } from './models/Bookmark';

export interface IChatStorage {
  // Chat operations
  createChat(userId: string, title: string): Promise<IChat>;
  getChat(chatId: string, userId: string): Promise<IChat | null>;
  getUserChats(userId: string): Promise<IChat[]>;
  addMessage(chatId: string, userId: string, message: Omit<IMessage, 'timestamp'>): Promise<IChat>;
  updateChatTitle(chatId: string, userId: string, title: string): Promise<IChat>;
  deleteChat(chatId: string, userId: string): Promise<void>;
  starChat(chatId: string, userId: string): Promise<IChat>;
  unstarChat(chatId: string, userId: string): Promise<IChat>;
}

export class MongoChatStorage implements IChatStorage {
  async starChat(chatId: string, userId: string): Promise<IChat> {
    const chat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        userId: new mongoose.Types.ObjectId(userId)
      },
      {
        $set: { 
          isStarred: true,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    return chat;
  }

  async unstarChat(chatId: string, userId: string): Promise<IChat> {
    const chat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        userId: new mongoose.Types.ObjectId(userId)
      },
      {
        $set: { 
          isStarred: false,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    return chat;
  }
  async createChat(userId: string, title: string): Promise<IChat> {
    const chat = new Chat({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      messages: []
    });
    
    return await chat.save();
  }

  async getChat(chatId: string, userId: string): Promise<IChat | null> {
    return await Chat.findOne({
      _id: chatId,
      userId: new mongoose.Types.ObjectId(userId)
    });
  }

  async getUserChats(userId: string): Promise<IChat[]> {
    return await Chat.find({
      userId: new mongoose.Types.ObjectId(userId)
    })
    .sort({ updatedAt: -1 })
    .limit(50); // Limit to prevent overwhelming the UI
  }

  async addMessage(chatId: string, userId: string, message: Omit<IMessage, 'timestamp'>): Promise<IChat> {
    const chat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        userId: new mongoose.Types.ObjectId(userId)
      },
      {
        $push: {
          messages: {
            ...message,
            timestamp: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    return chat;
  }

  async updateChatTitle(chatId: string, userId: string, title: string): Promise<IChat> {
    const chat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        userId: new mongoose.Types.ObjectId(userId)
      },
      {
        $set: { 
          title,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    return chat;
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const result = await Chat.deleteOne({
      _id: chatId,
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      throw new Error('Chat not found or access denied');
    }
  }


}

export const chatStorage = new MongoChatStorage();

// Original mongoStorage for existing functionality
export class MongoStorage {
  private normalizeSummary(summary: ISummary) {
    const obj = summary.toObject({ getters: false, virtuals: false });
    const { _id, __v, ...rest } = obj as any;
    return { id: (_id as any).toString(), ...rest };
  }

  // User operations
  async getUser(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select('-password');
  }

  async upsertUser(userData: {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  }): Promise<IUser> {
    // If ID is provided, use it for lookup, otherwise use email
    const query = userData.id ? { _id: userData.id } : { email: userData.email };
    
    // Remove id from userData if it exists to avoid MongoDB errors
    const { id, ...updateData } = userData;
    
    return await User.findOneAndUpdate(
      query,
      updateData,
      { upsert: true, new: true, select: '-password' }
    );
  }

  // Summary operations
  async createSummary(summaryData: {
    userId: string;
    title: string;
    videoUrl: string;
    videoDuration?: string;
    summary: string;
  }): Promise<any> {
    const summary = new Summary({
      ...summaryData,
      userId: new mongoose.Types.ObjectId(summaryData.userId)
    });
    const saved = await summary.save();
    return this.normalizeSummary(saved);
  }

  async getUserSummaries(userId: string): Promise<Array<any>> {
    const summaries = await Summary.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    
    const bookmarks = await Bookmark.find({ userId: new mongoose.Types.ObjectId(userId) });
    const bookmarkedSummaryIds = bookmarks.map(b => b.summaryId.toString());

    return summaries.map(summary => ({
      ...this.normalizeSummary(summary),
      isBookmarked: bookmarkedSummaryIds.includes((summary._id as any).toString())
    }));
  }

  async getSummary(summaryId: string): Promise<any | null> {
    const summary = await Summary.findById(summaryId);
    return summary ? this.normalizeSummary(summary) : null;
  }

  async deleteSummary(summaryId: string, userId: string): Promise<void> {
    await Summary.deleteOne({ 
      _id: summaryId, 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    // Also delete associated bookmarks
    await Bookmark.deleteMany({ summaryId: summaryId });
  }

  async updateSummaryMeta(summaryId: string, userId: string, fields: { title?: string; videoDuration?: string }): Promise<void> {
    await Summary.updateOne(
      { _id: summaryId, userId: new mongoose.Types.ObjectId(userId) },
      { $set: { ...fields } }
    );
  }

  async searchSummaries(userId: string, query: string): Promise<ISummary[]> {
    return await Summary.find({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
  }

  // Bookmark operations
  async createBookmark(bookmarkData: {
    userId: string;
    summaryId: string;
  }): Promise<IBookmark> {
    const bookmark = new Bookmark({
      userId: new mongoose.Types.ObjectId(bookmarkData.userId),
      summaryId: new mongoose.Types.ObjectId(bookmarkData.summaryId)
    });
    return await bookmark.save();
  }

  async deleteBookmark(userId: string, summaryId: string): Promise<void> {
    await Bookmark.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      summaryId: new mongoose.Types.ObjectId(summaryId)
    });
  }

  async getUserBookmarks(userId: string): Promise<Array<any>> {
    const bookmarks = await Bookmark.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('summaryId')
      .sort({ createdAt: -1 });

    return bookmarks.map(bookmark => ({
      ...(bookmark.summaryId as any).toObject(),
      isBookmarked: true
    }));
  }

  // Stats operations
  async getUserStats(userId: string) {
    const totalSummaries = await Summary.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    const totalBookmarks = await Bookmark.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    
    const recentSummaries = await Summary.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(30);

    const dailyStats = recentSummaries.reduce((acc, summary) => {
      const date = summary.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Align response shape with client expectations
    // - bookmarkedCount: number of bookmarks
    // - hoursSaved: rough estimate at 0.5h per summary
    const hoursSaved = Math.round((totalSummaries * 0.5) * 10) / 10;

    return {
      totalSummaries,
      bookmarkedCount: totalBookmarks,
      hoursSaved,
      // Keep dailyActivity for potential future use
      dailyActivity: Object.entries(dailyStats).map(([date, count]) => ({
        date,
        summaries: count
      }))
    };
  }
}

export const mongoStorage = new MongoStorage();