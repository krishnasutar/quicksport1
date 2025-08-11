import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VenueDetails from "@/pages/venue-details";
import Booking from "@/pages/booking";
import UserDashboard from "@/pages/user-dashboard";
import CRMLogin from "@/pages/crm-login";
import CRMDashboard from "@/pages/crm-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/venue/:id" component={VenueDetails} />
      <Route path="/booking/:courtId" component={Booking} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/crm" component={CRMLogin} />
      <Route path="/crm/dashboard" component={CRMDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
