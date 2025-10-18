import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SkillDetailProps {
  skillName: string;
  tools: string[];
  isVisible: boolean;
}

const SkillDetail: React.FC<SkillDetailProps> = ({ skillName, tools, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className={`absolute bottom-full left-0 right-0 mb-4 p-4 rounded-lg bg-card border border-accent/30 z-20 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
    }`}
    style={{
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)'
    }}>
      {/* Pointer triangle */}
      <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-accent/30" />

      <h4 className="text-xs font-heading font-semibold text-accent mb-2 uppercase tracking-wider">
        {skillName} Tools & Frameworks
      </h4>

      <div className="flex flex-wrap gap-2">
        {tools.map((tool, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 transition-colors text-xs py-1"
          >
            {tool}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SkillDetail;
