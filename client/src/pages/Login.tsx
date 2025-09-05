import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Brain } from "lucide-react";

// Define animation
const rotateAnimation = {
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
};

// Apply animation to element
const rotateElement = {
  animation: `${rotateAnimation} 10s linear infinite`,
};

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // In the handleSubmit function, modify the navigation logic
      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast({
          title: "Login successful!",
          description: "Welcome to AutoMindMap",
        });
        // Use window.location instead of navigate to force a full page reload
        window.location.href = "/home";
        // OR use history.replaceState to avoid the 404
        // history.replaceState(null, "", "/home");
        // navigate("/home");
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
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

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password">
                  <Button variant="link" className="p-0 h-auto text-xs" type="button">
                    Forgot password?
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
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

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Sign In"}
            </Button>

            <div className="text-center text-sm mt-4">
              <p>
                Don't have an account?{" "}
                <Link href="/signup">
                  <Button variant="link" className="p-0 h-auto" type="button">
                    Sign up
                  </Button>
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}