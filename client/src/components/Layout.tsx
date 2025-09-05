import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NewSummaryModal } from "./NewSummaryModal";
import { 
  Home, 
  Bookmark, 
  History, 
  Search, 
  Plus, 
  Menu, 
  Settings, 
  User, 
  LogOut, 
  Brain,
  MessageSquare,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewSummaryModal, setShowNewSummaryModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  
  // Pass search query to children components
  const childrenWithProps = React.Children.map(children, child => {
    // Check if the child is a valid React element
    if (React.isValidElement(child)) {
      // Clone the child with the searchQuery prop
      // Use type assertion to avoid TypeScript error
      return React.cloneElement(child, { searchQuery } as any);
    }
    return child;
  });

  const { data: stats } = useQuery<{
    totalSummaries: number;
    bookmarkedCount: number;
    hoursSaved: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  const navigationItems = [
    { href: "/", icon: Home, label: "Home", count: null },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks", count: stats?.bookmarkedCount },
    { href: "/history", icon: History, label: "History", count: stats?.totalSummaries },
    { href: "/chats", icon: MessageSquare, label: "Chats", count: null },
  ];

  const getUserInitials = (user: UserType | null) => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";
  };

  const getUserDisplayName = (user: UserType | null) => {
    if (!user) return "User";
    return user.firstName || user.email?.split("@")[0] || "User";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 px-4 border-b border-sidebar-border/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md">
            <Brain className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">AutoMindMap</span>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-8 space-y-2.5">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-accent/80 text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:translate-x-1"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-primary")} />
                {item.label}
                {item.count !== null && item.count !== undefined && (
                  <span className="ml-auto bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-semibold">
                    {item.count}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>
      
      {/* User Section */}
      <div className="px-4 py-5 mt-auto border-t border-sidebar-border/30">
        <div className="flex items-center p-3 space-x-3 bg-sidebar-accent/30 rounded-xl">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={(user as UserType)?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-secondary/80 text-white font-medium">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-username">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {(user as UserType)?.email || ""}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild className="py-2">
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2 text-primary" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
                className="py-2"
              >
                <LogOut className="w-4 h-4 mr-2 text-destructive" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:border-r lg:border-sidebar-border/30 lg:bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-72">
        {/* Navbar */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border/40 px-4 lg:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden text-muted-foreground hover:text-foreground rounded-lg">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search summaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 h-10 rounded-xl border-muted/50 focus:border-primary/50 bg-background/50"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowNewSummaryModal(true)}
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 rounded-xl px-5 py-2 h-10 shadow-md transition-all duration-200 hover:shadow-lg"
                data-testid="button-new-summary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Summary
              </Button>
              
              
              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 rounded-full hover:bg-background/80">
                    <Avatar className="w-9 h-9 border-2 border-primary/20">
                      <AvatarImage src={(user as UserType)?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/80 to-secondary/80 text-white font-medium">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <DropdownMenuItem asChild className="py-2 rounded-lg">
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-2 text-primary" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className="py-2 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-destructive" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Area */}
        <main className="flex-1 overflow-y-auto bg-background px-4 lg:px-8 py-6">
          {childrenWithProps}
        </main>
      </div>

      <NewSummaryModal 
        open={showNewSummaryModal} 
        onOpenChange={setShowNewSummaryModal}
      />
    </div>
  );
}
