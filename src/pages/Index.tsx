import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Shield, Network, CheckCircle, Headphones, Users, Download, Award, Server, Database, Lock, Globe } from "lucide-react";
import Starfield from "@/components/Starfield";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import SkillIcon from "@/components/SkillIcon";
import ContactForm from "@/components/ContactForm";
import spaceHero from "@/assets/space-hero.jpg";
const Index = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
        }
      });
    }, observerOptions);
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const projects = [{
    title: "Multi-Tier AWS Architecture",
    description: "Scalable web application with auto-scaling, load balancing, and RDS database integration for high availability.",
    technologies: ["AWS EC2", "ALB", "RDS", "Auto Scaling", "CloudWatch"],
    githubUrl: "#",
    liveUrl: "#"
  }, {
    title: "Serverless Data Processing",
    description: "Event-driven architecture using Lambda functions for real-time data processing and analytics.",
    technologies: ["AWS Lambda", "API Gateway", "DynamoDB", "S3", "EventBridge"],
    githubUrl: "#",
    liveUrl: "#"
  }, {
    title: "Cloud Security & Compliance",
    description: "Implemented comprehensive security controls and compliance monitoring across AWS infrastructure.",
    technologies: ["AWS IAM", "CloudTrail", "Config", "GuardDuty", "Security Hub"],
    githubUrl: "#"
  }, {
    title: "Infrastructure as Code",
    description: "Automated cloud infrastructure deployment and management using modern DevOps practices.",
    technologies: ["AWS CloudFormation", "Terraform", "CI/CD", "CodePipeline"],
    githubUrl: "#"
  }];
  const skills = [{
    icon: Cloud,
    label: "Cloud Computing",
    description: "AWS Solutions Architecture"
  }, {
    icon: Shield,
    label: "Cybersecurity",
    description: "Security & Compliance"
  }, {
    icon: Network,
    label: "Networking",
    description: "Network Architecture"
  }, {
    icon: CheckCircle,
    label: "Auditing",
    description: "Compliance Monitoring"
  }, {
    icon: Headphones,
    label: "Technical Support",
    description: "Customer Success"
  }, {
    icon: Users,
    label: "Collaboration",
    description: "Team Leadership"
  }];
  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Starfield />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url(${spaceHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }} />
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="font-heading font-bold text-5xl md:text-7xl mb-6 bg-gradient-to-b from-foreground to-accent bg-clip-text text-transparent">
            Thomas Gates III
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AWS Cloud Professional specializing in secure, scalable infrastructure and cybersecurity solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="glow-hover bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => document.getElementById('projects')?.scrollIntoView({
            behavior: 'smooth'
          })}>
              View My Work
            </Button>
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground glow-hover" onClick={() => document.getElementById('contact')?.scrollIntoView({
            behavior: 'smooth'
          })}>
              Get In Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              AWS Cloud Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building secure, scalable, and innovative solutions in the cloud
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => <div key={index} className="animate-on-scroll">
                <ProjectCard {...project} />
              </div>)}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
                About Me
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                I'm a dedicated AWS cloud professional with a strong background in cybersecurity, 
                technical support, and systems architecture. My passion lies in building secure, 
                scalable cloud solutions that drive business success.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                With expertise in AWS services, compliance frameworks, and customer-focused support, 
                I bring both technical depth and business acumen to every project. I thrive in 
                collaborative environments where innovation meets reliability.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-space-dark text-accent border-accent/20">AWS Cloud Practitioner</Badge>
                <Badge variant="secondary" className="bg-space-dark text-accent border-accent/20">CISA</Badge>
                <Badge variant="secondary" className="bg-space-dark text-accent border-accent/20">Cloud Architecture</Badge>
              </div>
            </div>
            <div className="animate-on-scroll">
              <Card className="bg-card/50 backdrop-blur-sm border-border p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <Server className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">4+ Years</p>
                    <p className="text-sm text-muted-foreground">Cyber Security</p>
                  </div>
                  <div>
                    <Cloud className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">AWS</p>
                    <p className="text-sm text-muted-foreground">Cloud Practicioner</p>
                  </div>
                  <div>
                    <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">CISA</p>
                    <p className="text-sm text-muted-foreground">Certified</p>
                  </div>
                  <div>
                    <Award className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">Excellence</p>
                    <p className="text-sm text-muted-foreground">Driven</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              Skills & Expertise
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive technical skills spanning cloud computing, security, and customer success
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {skills.map((skill, index) => <div key={index} className="animate-on-scroll">
                <SkillIcon {...skill} />
              </div>)}
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-on-scroll">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              Resume
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Download my complete resume to learn more about my experience, 
              certifications, and technical achievements.
            </p>
            <Button size="lg" className="glow-hover bg-accent text-accent-foreground hover:bg-accent/90">
              <Download className="w-5 h-5 mr-2" />
              Download Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              Let's Connect
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to discuss cloud solutions, security implementations, or new opportunities? 
              I'd love to hear from you.
            </p>
          </div>
          <div className="animate-on-scroll">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border relative z-10">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>© 2025 Thomas Gates III – Built with AWS & Lovable</p>
        </div>
      </footer>
    </div>;
};
export default Index;