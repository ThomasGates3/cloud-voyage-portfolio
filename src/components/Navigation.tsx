import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-heading font-bold text-xl">
            Thomas Gates III
          </div>
          
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('projects')}
              className="text-foreground hover:text-accent transition-colors duration-200"
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection('resume')}
              className="text-foreground hover:text-accent transition-colors duration-200"
            >
              Resume
            </button>
            <button
              onClick={() => scrollToSection('skills')}
              className="text-foreground hover:text-accent transition-colors duration-200"
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-foreground hover:text-accent transition-colors duration-200"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-foreground hover:text-accent transition-colors duration-200"
            >
              Contact
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => scrollToSection('contact')}
            className="glow-hover border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            Get In Touch
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;