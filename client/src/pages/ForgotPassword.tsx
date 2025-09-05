import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Animation for the brain icon
  const rotateAnimation = {
    animation: "spin 10s linear infinite",
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  };

  const rotateElement = {
    animation: "spin 20s linear infinite",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This would be replaced with an actual API call in a real implementation
      // await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted transition-colors duration-300 flex flex-col">
      {/* Header Navigation */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header */}
        <header className="py-4 px-6 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="relative" style={rotateElement}>
              <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-sm -z-10"></div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">AutoMindMap</span>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button
                variant="ghost"
                className="hidden md:inline-flex hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                className="hidden md:inline-flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </header>

      {/* Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Reset Your Password</h2>
                <p className="text-muted-foreground mt-1">Enter your email to receive a password reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm mt-4">
                  <p>
                    Remember your password?{" "}
                    <Link href="/login">
                      <Button variant="link" className="p-0 h-auto" type="button">
                        Sign in
                      </Button>
                    </Link>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive an email? Check your spam folder or{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsSubmitted(false)}>
                  try again
                </Button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}