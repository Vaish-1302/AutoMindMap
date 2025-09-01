import { useState } from "react";
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
  Brain 
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewSummaryModal, setShowNewSummaryModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Brain className="text-sidebar-primary-foreground w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">AutoMindMap</span>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.count !== null && item.count !== undefined && (
                  <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>
      
      {/* User Section */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={(user as UserType)?.profileImageUrl} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="text-username">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.isPremium ? "Premium Plan" : "Free Plan"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-sidebar-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/api/logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-sidebar-border lg:bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Navbar */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden text-muted-foreground hover:text-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search summaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowNewSummaryModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-new-summary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Summary
              </Button>
              
              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={(user as UserType)?.profileImageUrl} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/api/logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Area */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      <NewSummaryModal 
        open={showNewSummaryModal} 
        onOpenChange={setShowNewSummaryModal}
      />
    </div>
  );
}
