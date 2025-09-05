import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { SummaryWithBookmark } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { SummaryCard } from "@/components/SummaryCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History } from "lucide-react";

export default function HistoryPage({ searchQuery = "" }) {
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
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: summaries, isLoading: summariesLoading } = useQuery<SummaryWithBookmark[]>({
    queryKey: ["/api/summaries"],
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

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-history-title">
            Summary History
          </h1>
          <p className="text-muted-foreground">
            All your AI-generated video summaries
          </p>
        </div>

        {/* History Grid */}
        {summariesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : summaries && summaries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {summaries
              .filter(summary => 
                summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                summary.summary.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((summary) => (
                <SummaryCard key={summary.id} summary={summary} showDeleteButton />
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No summaries yet</h3>
              <p className="text-muted-foreground">
                Create your first AI-powered video summary to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
