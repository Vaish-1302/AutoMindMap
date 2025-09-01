import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { User, Summary } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Play, 
  Pause, 
  Trash2, 
  ExternalLink,
  HelpCircle,
  Loader2
} from "lucide-react";

export default function Summary() {
  const params = useParams();
  const summaryId = params.id;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState("");

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

  const { data: summary, isLoading: summaryLoading } = useQuery<Summary>({
    queryKey: ["/api/summaries", summaryId],
    enabled: !!user && !!summaryId,
  });

  const explainTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/explain", { text });
      return response.json();
    },
    onSuccess: (data) => {
      setExplanation(data.explanation);
      setShowExplanation(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to generate explanation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSummaryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/summaries/${summaryId}`);
    },
    onSuccess: () => {
      toast({
        title: "Summary Deleted",
        description: "The summary has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      window.history.back();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete summary. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 10) {
      setSelectedText(text);
      if (!(user as User)?.isPremium && !window.confirm("This is a premium feature. Upgrade to get unlimited explanations. Continue with limited usage?")) {
        return;
      }
      explainTextMutation.mutate(text);
    }
  };

  const handleTTS = () => {
    if (!summary) return;
    
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(summary?.summary || "");
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => {
          setIsPlaying(false);
          toast({
            title: "TTS Error",
            description: "Failed to play text-to-speech. Please try again.",
            variant: "destructive",
          });
        };
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } else {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (summaryLoading) {
    return (
      <Layout>
        <div className="p-6">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!summary) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Summary Not Found</h1>
              <p className="text-muted-foreground">
                The summary you're looking for doesn't exist or you don't have permission to view it.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-summary-title">
            {summary.title}
          </h1>
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {summary.createdAt ? formatDate(summary.createdAt.toString()) : 'Unknown'}
            </span>
            {summary.videoDuration && (
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {summary.videoDuration}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(summary.videoUrl, '_blank')}
              className="text-muted-foreground hover:text-foreground p-0 h-auto"
              data-testid="button-open-video"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Original Video
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mb-6">
          <Button
            variant="outline"
            onClick={handleTTS}
            disabled={!summary.summary}
            data-testid="button-tts"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Listen
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => deleteSummaryMutation.mutate()}
            disabled={deleteSummaryMutation.isPending}
            className="text-destructive hover:text-destructive"
            data-testid="button-delete-summary"
          >
            {deleteSummaryMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete
          </Button>
        </div>

        {/* Summary Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              AI-Generated Summary
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                data-testid="button-help-explanation"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Select text to explain
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap select-text"
              onMouseUp={handleTextSelection}
              data-testid="text-summary-content"
            >
              {summary.summary}
            </div>
          </CardContent>
        </Card>

        {/* Explanation Modal */}
        <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
          <DialogContent className="sm:max-w-lg" data-testid="modal-explanation">
            <DialogHeader>
              <DialogTitle>Simplified Explanation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium text-foreground mb-1">Selected Text:</p>
                <p className="text-sm text-muted-foreground italic">"{selectedText}"</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Explanation:</p>
                <p className="text-sm text-foreground" data-testid="text-explanation">
                  {explanation}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading overlay for explanation */}
        {explainTextMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card>
              <CardContent className="p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-foreground">Generating explanation...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
