import { useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const userCanceledRef = useRef(false);
  const [selectedText, setSelectedText] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [lengthMode, setLengthMode] = useState<"short" | "medium" | "long">("short");
  const audioLanguage = "en-US";

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
    mutationFn: async (payload: { text: string; mode: "short" | "medium" | "long" }) => {
      const response = await apiRequest("POST", "/api/explain", payload);
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
    if (text && text.length >= 5) {
      setSelectedText(text);
      // Determine default mode based on selection size
      const charCount = text.length;
      const lineCount = text.split(/\r?\n/).filter(Boolean).length;
      if (lineCount > 1 || charCount > 250) {
        setLengthMode("long");
      } else if (charCount <= 80) {
        setLengthMode("short");
      } else {
        setLengthMode("medium");
      }
      setShowExplanation(true);
      // Don't auto-call; user picks length first
    } else if (text && text.length > 0) {
      toast({
        title: "Select more text",
        description: "Please select at least 5 characters to explain.",
        variant: "destructive",
      });
    }
  };

  // Function to generate explanation for TTS
  const generateExplanation = async (text: string): Promise<string> => {
    try {
      // Request a detailed but easily understandable explanation that covers the entire content
      // and is timed to be between 1-2 minutes when spoken
      const response = await apiRequest("POST", "/api/explain", { 
        text, 
        mode: "comprehensive",
        style: "accessible", // Request accessible explanation that's easy to understand
        duration: "1-2min", // Target 1-2 minute audio duration
        coverage: "complete" // Ensure complete coverage of content
      });
      const data = await response.json();
      
      // Get the base explanation
      let explanation = data.explanation || "No explanation available.";
      
      // Add a brief introduction for the audio explanation
      const intro = "Here's a detailed explanation of this content. ";
      
      // Add a concise conclusion to the explanation
      const conclusion = " That covers the key points. Thanks for listening.";
      
      explanation = intro + explanation + conclusion;
      
      return explanation;
    } catch (error) {
      console.error("Error generating explanation:", error);
      return "Failed to generate explanation. Please try again.";
    }
  };

  const handleTTS = async () => {
    if (!summary) return;
    
    if ('speechSynthesis' in window) {
      // If currently speaking, toggle pause
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
        return;
      }

      // If paused, resume
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        return;
      }

      // Clear any queued/leftover utterances before starting fresh
      try { window.speechSynthesis.cancel(); } catch {}
      
      // Generate a detailed explanation instead of just reading the summary
      const textToSpeak = await generateExplanation(summary.summary);
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Set the language based on user selection
      utterance.lang = audioLanguage;
      
      // Find a voice that matches the selected language
      const availableVoices = window.speechSynthesis.getVoices();
      const preferred = availableVoices.find(v => (v.lang || "").toLowerCase().startsWith(audioLanguage.split('-')[0])) || availableVoices[0];
      if (preferred) utterance.voice = preferred;
      
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      userCanceledRef.current = false;
      utterance.onend = () => {
        setIsPlaying(false);
        userCanceledRef.current = false;
      };
      utterance.onpause = () => setIsPlaying(false);
      utterance.onresume = () => setIsPlaying(true);
      utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        setIsPlaying(false);
        const err = (e as any)?.error;
        // Suppress benign errors when paused/resumed/interrupted by user or system
        if (window.speechSynthesis.paused || err === "canceled" || err === "interrupted") {
          return;
        }
        toast({
          title: "TTS Error",
          description: "Failed to play text-to-speech. Please try again.",
          variant: "destructive",
        });
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleTTS}
              disabled={!summary.summary}
              data-testid="button-tts"
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Audio Explanation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Listen to Enhanced Audio Explanation
                </>
              )}
            </Button>
          </div>
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
              <p className="sr-only" id="explain-desc">Choose a length and generate a simpler explanation for the selected text.</p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium text-foreground mb-1">Selected Text:</p>
                <p className="text-sm text-muted-foreground italic">"{selectedText}"</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Length:</span>
                <Button variant={lengthMode === "short" ? "default" : "outline"} size="sm" onClick={() => setLengthMode("short")}>Short</Button>
                <Button variant={lengthMode === "medium" ? "default" : "outline"} size="sm" onClick={() => setLengthMode("medium")}>Medium</Button>
                <Button variant={lengthMode === "long" ? "default" : "outline"} size="sm" onClick={() => setLengthMode("long")}>Long</Button>
                <Button
                  className="ml-auto"
                  size="sm"
                  onClick={() => explainTextMutation.mutate({ text: selectedText, mode: lengthMode })}
                  disabled={explainTextMutation.isPending}
                >
                  {explainTextMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                </Button>
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
