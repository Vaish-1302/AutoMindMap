import User, { IUser } from './models/User';
import Summary, { ISummary } from './models/Summary';
import Bookmark, { IBookmark } from './models/Bookmark';
import mongoose from 'mongoose';

export class MongoStorage {
  // User operations
  async getUser(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select('-password');
  }

  async upsertUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  }): Promise<IUser> {
    return await User.findOneAndUpdate(
      { email: userData.email },
      userData,
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
  }): Promise<ISummary> {
    const summary = new Summary({
      ...summaryData,
      userId: new mongoose.Types.ObjectId(summaryData.userId)
    });
    return await summary.save();
  }

  async getUserSummaries(userId: string): Promise<Array<any>> {
    const summaries = await Summary.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    
    const bookmarks = await Bookmark.find({ userId: new mongoose.Types.ObjectId(userId) });
    const bookmarkedSummaryIds = bookmarks.map(b => b.summaryId.toString());

    return summaries.map(summary => ({
      ...summary.toObject(),
      isBookmarked: bookmarkedSummaryIds.includes((summary._id as any).toString())
    }));
  }

  async getSummary(summaryId: string): Promise<ISummary | null> {
    return await Summary.findById(summaryId);
  }

  async deleteSummary(summaryId: string, userId: string): Promise<void> {
    await Summary.deleteOne({ 
      _id: summaryId, 
      userId: new mongoose.Types.ObjectId(userId) 
    });
    // Also delete associated bookmarks
    await Bookmark.deleteMany({ summaryId: summaryId });
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

    return {
      totalSummaries,
      totalBookmarks,
      dailyActivity: Object.entries(dailyStats).map(([date, count]) => ({
        date,
        summaries: count
      }))
    };
  }
}

export const mongoStorage = new MongoStorage();