import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ProductUpload from "@/pages/product-upload";
import ProductListing from "@/pages/product-listing";
import VideoViewer from "@/pages/video-viewer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProductUpload} />
      <Route path="/listings" component={ProductListing} />
      <Route path="/video/:id" component={VideoViewer} />
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
