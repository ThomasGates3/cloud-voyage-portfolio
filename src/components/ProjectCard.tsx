import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";

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
    <Card className="group glow-hover bg-card/50 backdrop-blur-sm border-border hover:border-accent transition-all duration-300">
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
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, index) => (
            <Badge key={index} variant="secondary" className="bg-space-dark text-accent border-accent/20">
              {tech}
            </Badge>
          ))}
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
  );
};

export default ProjectCard;