import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { User, SummaryWithBookmark } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { SummaryCard } from "@/components/SummaryCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Bookmark, Clock, Video, Plus, History } from "lucide-react";

export default function Home({ searchQuery = "" }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        // Use client-side navigation instead of direct window.location change
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: summaries, isLoading: summariesLoading } = useQuery<SummaryWithBookmark[]>({
    queryKey: ["/api/summaries"],
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalSummaries: number;
    bookmarkedCount: number;
    hoursSaved: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getUserDisplayName = () => {
    if (!user) return "User";
    return (user as User).firstName || (user as User).email?.split("@")[0] || "User";
  };

  // Filter summaries based on search query
  const filteredSummaries = summaries ? summaries.filter(summary => 
    summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.summary.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  // Get recent summaries (limited to 4) if no search query, otherwise show all filtered results
  const recentSummaries = searchQuery ? filteredSummaries : (filteredSummaries.slice(0, 4));

  return (
    <Layout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-welcome">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-muted-foreground">
            Transform your learning with AI-powered video summaries
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Summaries</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-summaries">
                      {stats?.totalSummaries || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Bookmark className="text-green-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bookmarked</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-bookmarked-count">
                      {stats?.bookmarkedCount || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="text-purple-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hours Saved</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground" data-testid="text-hours-saved">
                      {stats?.hoursSaved || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Summaries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Summaries</h2>
            <Button variant="link" asChild className="text-primary hover:text-primary/90 p-0 h-auto">
              <a href="/history" data-testid="link-view-all">View all</a>
            </Button>
          </div>
          
          {summariesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <div className="flex items-center space-x-4 mb-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentSummaries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentSummaries.map((summary) => (
                <SummaryCard key={summary.id} summary={summary} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No summaries yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by creating your first AI-powered video summary!
                </p>
                <Button data-testid="button-create-first-summary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Summary
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        

      </div>
    </Layout>
  );
}
