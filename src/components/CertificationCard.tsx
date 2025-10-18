import React from 'react';
import { ExternalLink } from 'lucide-react';

interface CertificationCardProps {
  title: string;
  logo: string;
  verificationUrl: string;
}

const CertificationCard: React.FC<CertificationCardProps> = ({ title, logo, verificationUrl }) => {
  return (
    <a
      href={verificationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center justify-center p-6 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-card/80 hover:shadow-lg hover:shadow-accent/20 cursor-pointer"
    >
      {/* Logo Image */}
      <div className="flex items-center justify-center h-32 w-full mb-4">
        <img
          src={logo}
          alt={title}
          className="max-h-32 max-w-24 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Certification Title */}
      <h3 className="text-center text-sm md:text-base font-heading font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* External Link Icon */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ExternalLink className="w-4 h-4 text-accent" />
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.1)'
        }}
      />
    </a>
  );
};

export default CertificationCard;
