import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
}

const ProjectCard = ({ title, description, technologies, githubUrl, liveUrl, image }: ProjectCardProps) => {
  return (
    <div className="relative group rounded-lg">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
        className="rounded-lg"
      />
      <Card className="group relative bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-300">
      {image && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tech Stack Display */}
        <div className="mb-6">
          <p className="text-xs uppercase font-heading font-semibold text-muted-foreground mb-3 tracking-wider">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, index) => {
              // Color coding based on tech category
              let badgeClass = "bg-space-dark text-accent border-accent/20";

              // Cloud/Infrastructure - Cyan
              if (['AWS', 'AWS ECS', 'AWS CloudFront', 'AWS VPC', 'AWS Polly', 'AWS CloudFormation', 'AWS IAM', 'CloudTrail', 'Config', 'GuardDuty', 'Security Hub', 'CloudWatch'].includes(tech)) {
                badgeClass = "bg-blue-950/50 text-blue-200 border-blue-400/30 hover:bg-blue-900/50";
              }
              // Containers - Orange
              else if (['Docker', 'Kubernetes'].includes(tech)) {
                badgeClass = "bg-orange-950/50 text-orange-200 border-orange-400/30 hover:bg-orange-900/50";
              }
              // Databases - Purple
              else if (['PostgreSQL', 'MongoDB', 'DynamoDB'].includes(tech)) {
                badgeClass = "bg-purple-950/50 text-purple-200 border-purple-400/30 hover:bg-purple-900/50";
              }
              // Languages - Green
              else if (['Python', 'JavaScript', 'TypeScript', 'Ruby', 'Bash'].includes(tech)) {
                badgeClass = "bg-green-950/50 text-green-200 border-green-400/30 hover:bg-green-900/50";
              }
              // ML/AI - Pink
              else if (['TensorFlow', 'Machine Learning', 'Generative AI'].includes(tech)) {
                badgeClass = "bg-pink-950/50 text-pink-200 border-pink-400/30 hover:bg-pink-900/50";
              }
              // Tools/Services - Slate
              else if (['CI/CD', 'GitHub Actions', 'FastAPI', 'React', 'WebRTC', 'NIST Framework'].includes(tech)) {
                badgeClass = "bg-slate-950/50 text-slate-200 border-slate-400/30 hover:bg-slate-900/50";
              }

              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`${badgeClass} transition-all duration-200 hover:scale-105 hover:shadow-md text-xs py-1.5 px-2.5`}
                >
                  {tech}
                </Badge>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          {githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground"
              asChild
            >
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Code
              </a>
            </Button>
          )}
          {liveUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground"
              asChild
            >
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default ProjectCard;