import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Video, Bookmark, Search, Sparkles, Moon, Sun, BookOpen, Users, Code, Lightbulb, BarChart, Calendar, FileText, Briefcase, Zap, Star, Shield, Award, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define keyframe animations
const fadeInAnimation = {
  from: { opacity: 0, transform: 'translateY(20px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
};

const pulseAnimation = {
  '0%, 100%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
};

const slideInAnimation = {
  from: { opacity: 0, transform: 'translateX(-20px)' },
  to: { opacity: 1, transform: 'translateX(0)' },
};

const rotateAnimation = {
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
};

// Apply animations to elements
const animatedElement = (delay = 0) => ({
  opacity: 1, // Changed from 0 to 1 to ensure content is visible even if animation fails
  animation: `${fadeInAnimation} 0.6s ease-out ${delay}s forwards`,
});

const slideInElement = (delay = 0) => ({
  opacity: 1, // Changed from 0 to 1
  animation: `${slideInAnimation} 0.6s ease-out ${delay}s forwards`,
});

const pulseElement = {
  animation: `${pulseAnimation} 3s ease-in-out infinite`,
};

const rotateElement = {
  animation: `${rotateAnimation} 10s linear infinite`,
};

export default function Landing() {
  const [isLogin, setIsLogin] = useState<boolean | undefined>(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted transition-colors duration-300">
      {/* Header Navigation */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header Navigation */}
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
        
        {/* Login/Signup Modal removed - now using separate pages */}
      
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Hero Section */}
          
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 py-8">
            <div className="md:w-1/2 text-left mb-10 md:mb-0">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 mb-4">
                <Zap className="h-3.5 w-3.5 mr-1" />
                AI-Powered Learning Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">AutoMindMap</span>
              </h1>
              <p className="text-xl text-slate-700 dark:text-slate-300 mb-6 max-w-xl">
                Transform your learning experience with our AI-powered tools designed specifically for students.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  onClick={() => setIsLogin(true)}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25"
                >
                  Get Started
                </Button>
              </div>
              <div className="flex items-center mt-6 space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900"></div>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Join 10,000+ students</span>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 max-w-sm">
                  <div className="flex justify-center mb-4">
                    <div className="relative" style={rotateElement}>
                      <Brain className="h-20 w-20 text-indigo-600 dark:text-indigo-400" />
                      <div className="absolute -inset-1 bg-indigo-500/20 rounded-full blur-md -z-10"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-3/4 mx-auto bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-2 w-5/6 mx-auto bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <div className="h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded"></div>
                    <div className="h-8 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20" style={animatedElement(0.4)}>
          <h2 className="text-3xl font-bold text-center mb-12">Features Designed for Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BookOpen className="h-10 w-10 text-blue-500" />,
                title: "Effortless Navigation",
                description: "Intuitive interface that makes finding and organizing study materials simple and quick."
              },
              {
                icon: <Sparkles className="h-10 w-10 text-blue-500" />,
                title: "AI-powered Study Assistance",
                description: "Get intelligent suggestions and summaries to enhance your learning experience."
              },
              {
                icon: <Users className="h-10 w-10 text-blue-500" />,
                title: "Collaboration Tools",
                description: "Work together with classmates on projects and share resources seamlessly."
              },
              {
                icon: <Lightbulb className="h-10 w-10 text-blue-500" />,
                title: "Simple & Reliable Interface",
                description: "Clean design that helps you focus on what matters most - your education."
              }
            ].map((feature, index) => (
              <Card key={index} className="border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6 pb-6 px-6 flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div id="mission" className="py-16 bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-950/20 dark:to-green-950/20 rounded-3xl my-20" style={animatedElement(0.6)}>
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Why We Exist</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We believe every student should have effortless access to AI tools that enhance learning, creativity, and career growth.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center relative my-20" style={animatedElement(1.2)}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10 rounded-3xl transform -rotate-1 blur-xl opacity-70 animate-pulse"></div>
          <Card className="max-w-2xl mx-auto border-0 shadow-xl overflow-hidden bg-card/80 backdrop-blur-md relative z-10 hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <CardContent className="pt-10 pb-10 px-8">
              <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
                Ready to <span className="text-blue-500">revolutionize</span> your learning?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
                Join thousands of students who are already using AI to enhance 
                their educational experience and transform the way they learn.
              </p>
              <Link href="/signup">
                <Button 
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 h-auto text-lg font-medium rounded-xl"
                  data-testid="button-sign-in"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Get Started Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Target Audience Cards */}
        <div className="py-16 bg-gradient-to-r from-indigo-100/80 to-blue-100/80 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl my-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Who Benefits from AutoMindMap?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <BookOpen className="h-10 w-10 text-indigo-600" />,
                  title: "Students",
                  description: "Boost your learning efficiency with AI-powered study tools that help you understand complex topics faster."
                },
                {
                  icon: <Lightbulb className="h-10 w-10 text-indigo-600" />,
                  title: "Researchers",
                  description: "Organize research materials, generate insights, and connect ideas across different sources effortlessly."
                },
                {
                  icon: <Briefcase className="h-10 w-10 text-indigo-600" />,
                  title: "Professionals",
                  description: "Enhance productivity and creativity in your work with AI assistance for content creation and organization."
                }
              ].map((audience, index) => (
                <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-xl p-3 inline-flex mb-4 shadow-md">
                    {audience.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{audience.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{audience.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Use-Case Highlights */}
        <div className="py-16 my-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Powerful Use Cases</h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">Discover how AutoMindMap transforms your learning and productivity experience</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <FileText className="h-8 w-8 text-white" />,
                  title: "AI-powered Content Writing",
                  description: "Generate essays, summaries, and creative content with AI assistance."
                },
                {
                  icon: <BarChart className="h-8 w-8 text-white" />,
                  title: "Data Analysis for Assignments",
                  description: "Visualize data and extract insights for research projects and assignments."
                },
                {
                  icon: <Calendar className="h-8 w-8 text-white" />,
                  title: "Personal Productivity",
                  description: "Organize tasks, schedule study sessions, and track your progress."
                },
                {
                  icon: <Code className="h-8 w-8 text-white" />,
                  title: "Career Tools",
                  description: "Prepare for interviews, build portfolios, and enhance professional skills."
                }
              ].map((useCase, index) => (
                <div key={index} className="relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl transform transition-transform duration-500 group-hover:scale-105"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-500"></div>
                  <div className="relative p-6 h-full flex flex-col">
                    <div className="bg-white/20 rounded-full p-3 inline-flex mb-4 backdrop-blur-sm">
                      {useCase.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{useCase.title}</h3>
                    <p className="text-white/90">{useCase.description}</p>
                    <div className="mt-auto pt-4">
                      <Button variant="ghost" className="text-white hover:bg-white/20 p-0 h-auto flex items-center">
                        Learn more
                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                  <Brain className="text-white w-4 h-4" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">AutoMindMap</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Transform your learning experience with AI-powered tools designed specifically for students.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg> },
                  { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg> },
                  { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg> },
                  { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg> }
                ].map((social, index) => (
                  <Button key={index} variant="ghost" size="icon" className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {social.icon}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm">
                {["About Us", "Contact"].map((item, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                {["Privacy", "Terms"].map((item, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                {["Blog", "Support"].map((item, index) => (
                  <li key={index}>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} AutoMindMap. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {["Privacy", "Terms", "Contact", "Support"].map((item, index) => (
                <Button key={index} variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}