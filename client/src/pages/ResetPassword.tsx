import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [match, params] = useRoute("/reset-password/:token");
  const token = params?.token || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
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

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // This would be replaced with an actual API call in a real implementation
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, password })
      // });
      // 
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to reset password');
      // }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast({
        title: "Error",
        description: message,
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

      {/* Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
          {error && !isSubmitted && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Reset Your Password</h2>
                <p className="text-muted-foreground mt-1">Enter your new password below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      minLength={6}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button"
                      className="absolute right-0 top-0 h-full" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Reset Complete</h2>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully reset.
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}