import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Video, Bookmark, Search, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4">
              <Brain className="text-primary-foreground w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              AutoMindMap
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your learning with AI-powered YouTube video summaries. 
            Save time, retain more knowledge, and study smarter.
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                AI Video Summaries
              </h3>
              <p className="text-muted-foreground">
                Paste any YouTube video link and get detailed, AI-generated summaries 
                in seconds using advanced language models.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Bookmark className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Smart Organization
              </h3>
              <p className="text-muted-foreground">
                Bookmark important summaries, browse your history, and organize 
                your learning materials with powerful search capabilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Enhanced Learning
              </h3>
              <p className="text-muted-foreground">
                Get simplified explanations for complex topics, listen to summaries 
                with text-to-speech, and access premium study tools.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to revolutionize your learning?
              </h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of students who are already using AI to enhance 
                their educational experience.
              </p>
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-sign-in"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
