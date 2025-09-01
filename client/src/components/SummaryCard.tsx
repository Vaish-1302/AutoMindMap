import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Play, 
  Pause, 
  Trash2,
  ExternalLink 
} from "lucide-react";
import type { SummaryWithBookmark } from "@shared/schema";

interface SummaryCardProps {
  summary: SummaryWithBookmark;
  showDeleteButton?: boolean;
}

export function SummaryCard({ summary, showDeleteButton = false }: SummaryCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (summary.isBookmarked) {
        await apiRequest("DELETE", `/api/bookmarks/${summary.id}`);
      } else {
        await apiRequest("POST", "/api/bookmarks", { summaryId: summary.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: summary.isBookmarked ? "Bookmark Removed" : "Bookmark Added",
        description: summary.isBookmarked 
          ? "Summary removed from bookmarks" 
          : "Summary added to bookmarks",
      });
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
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSummaryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/summaries/${summary.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Summary Deleted",
        description: "The summary has been deleted successfully.",
      });
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

  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(summary.summary);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-summary-${summary.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2" data-testid="text-summary-title">
              {summary.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground space-x-4">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {summary.createdAt ? formatDate(summary.createdAt.toString()) : 'Unknown'}
              </span>
              {summary.videoDuration && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {summary.videoDuration}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBookmarkMutation.mutate()}
              disabled={toggleBookmarkMutation.isPending}
              className={summary.isBookmarked ? "text-secondary hover:text-secondary/80" : "text-muted-foreground hover:text-secondary"}
              data-testid="button-bookmark"
            >
              {summary.isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTTS}
              className="text-muted-foreground hover:text-primary"
              data-testid="button-tts"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            {showDeleteButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSummaryMutation.mutate()}
                disabled={deleteSummaryMutation.isPending}
                className="text-muted-foreground hover:text-destructive"
                data-testid="button-delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid="text-summary-preview">
          {summary.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <Link href={`/summary/${summary.id}`}>
            <Button variant="link" className="text-primary hover:text-primary/90 p-0 h-auto font-medium" data-testid="link-read-summary">
              Read Summary →
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">YouTube</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(summary.videoUrl, '_blank')}
              className="text-muted-foreground hover:text-foreground p-1 h-auto"
              data-testid="button-open-video"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
