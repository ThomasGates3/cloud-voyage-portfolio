import { LucideIcon } from "lucide-react";

interface SkillIconProps {
  icon: LucideIcon;
  label: string;
  description?: string;
}

const SkillIcon = ({ icon: Icon, label, description }: SkillIconProps) => {
  return (
    <div className="group flex flex-col items-center p-6 rounded-lg bg-card/30 backdrop-blur-sm border border-border hover:border-accent transition-all duration-300 glow-hover">
      <div className="p-4 rounded-full bg-space-dark border border-accent/20 group-hover:border-accent transition-colors duration-300 mb-4">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <h3 className="font-heading font-semibold text-lg mb-2 text-center">{label}</h3>
      {description && (
        <p className="text-muted-foreground text-sm text-center">{description}</p>
      )}
    </div>
  );
};

export default SkillIcon;