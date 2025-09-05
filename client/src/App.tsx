import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Home from "@/pages/Home";
import Summary from "@/pages/Summary";
import Bookmarks from "@/pages/Bookmarks";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import Chats from "@/pages/Chats";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to home page if authenticated and on root path
  useEffect(() => {
    if (isAuthenticated && location === "/") {
      // Force a re-render of the Home component
      setLocation("/home");
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/">{() => <Landing />}</Route>
          <Route path="/login">{() => <Login />}</Route>
          <Route path="/signup">{() => <Signup />}</Route>
          <Route path="/forgot-password">{() => <ForgotPassword />}</Route>
          <Route path="/reset-password/:token">{() => <ResetPassword />}</Route>
        </>
      ) : (
        <>
          <Route path="/">{() => <Home />}</Route>
          <Route path="/home">{() => <Home />}</Route>
          <Route path="/summary/:id">{() => <Summary />}</Route>
          <Route path="/bookmarks">{() => <Bookmarks />}</Route>
          <Route path="/history">{() => <History />}</Route>
          <Route path="/chats">{() => <Chats />}</Route>
          <Route path="/profile">{() => <Profile />}</Route>
        </>
      )}
      {/* Only show NotFound for routes that don't match any defined routes */}
      {/* <Route path="*">{() => <NotFound />}</Route> */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
