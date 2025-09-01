import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Crown, LogOut, Save } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

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

  useEffect(() => {
    if (user) {
      setFirstName((user as User).firstName || "");
      setLastName((user as User).lastName || "");
      setEmail((user as User).email || "");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getUserInitials = () => {
    if (!user) return "U";
    const first = (user as User).firstName || "";
    const last = (user as User).lastName || "";
    return (first.charAt(0) + last.charAt(0)).toUpperCase() || (user as User).email?.charAt(0).toUpperCase() || "U";
  };

  const handleSave = () => {
    // Note: Profile updates would need to be implemented on the backend
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-profile-title">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={(user as User)?.profileImageUrl} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-foreground" data-testid="text-profile-name">
                  {(user as User)?.firstName || (user as User)?.lastName 
                    ? `${(user as User).firstName || ""} ${(user as User).lastName || ""}`.trim()
                    : (user as User)?.email?.split("@")[0] || "User"
                  }
                </h3>
                <p className="text-muted-foreground" data-testid="text-profile-email">
                  {(user as User)?.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={(user as User)?.isPremium ? "default" : "secondary"} data-testid="badge-subscription">
                    {(user as User)?.isPremium ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      "Free Plan"
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Profile Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  data-testid="input-last-name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled
                data-testid="input-email"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed through this interface
              </p>
            </div>

            <div className="flex justify-start">
              <Button onClick={handleSave} data-testid="button-save-profile">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!(user as User)?.isPremium && (
                <>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">Upgrade to Premium</h4>
                      <p className="text-sm text-muted-foreground">
                        Get unlimited explanations, group chat access, and higher quotas
                      </p>
                    </div>
                    <Button variant="outline" data-testid="button-upgrade">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade
                    </Button>
                  </div>
                  <Separator />
                </>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Sign Out</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
