import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
// Pages
import Dashboard from "./pages/dashboard";
import LiveDetection from "./pages/live-detection";
import Upload from "./pages/upload";
import BirdInsights from "./pages/system-performance";
import Settings from "./pages/settings";
import NotFound from "@/pages/not-found";
import SystemPerformance from "@/pages/system-performance";
// Context
import { LanguageProvider } from "@/pages/LanguageContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/live" component={LiveDetection} />
      <Route path="/upload" component={Upload} />
      <Route path="/birdinsights" component={BirdInsights} />
      <Route path="/system-performance" component={SystemPerformance} />
      <Route path="/settings" component={Settings} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;