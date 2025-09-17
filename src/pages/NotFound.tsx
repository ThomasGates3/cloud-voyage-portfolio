import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Starfield from "@/components/Starfield";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <Starfield />
      <div className="text-center relative z-10 max-w-2xl mx-auto px-6">
        <h1 className="mb-6 text-8xl font-heading font-bold text-accent">404</h1>
        <h2 className="mb-4 text-3xl font-heading font-semibold">Lost in Space</h2>
        <p className="mb-8 text-xl text-muted-foreground">
          This page seems to have drifted into the cosmic void. Let's navigate you back home.
        </p>
        <Button 
          asChild
          className="glow-hover bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
