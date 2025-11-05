import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Shield, Network, Headphones, Users, Download, Zap } from "lucide-react";
import Starfield from "@/components/Starfield";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import ContactForm from "@/components/ContactForm";
import PokemonHPBar from "@/components/PokemonHPBar";
import CertificationCard from "@/components/CertificationCard";
import CursorGlow from "@/components/CursorGlow";
import { AIToolCard } from "@/components/AIToolCard";
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
    title: "IAM Policy Generator - AI-Powered AWS Policy Creation",
    description: "Serverless application that leverages Claude 3.5 Haiku to automatically generate least-privilege AWS IAM policies from plain English descriptions. Features real-time policy generation with AWS Lambda backend, responsive React frontend with Tailwind CSS, and seamless API Gateway integration for instant policy suggestions.",
    technologies: ["ReactJS", "Tailwind CSS", "Claude", "Generative AI", "AWS Lambda", "AWS S3", "AWS IAM", "API Gateway"],
    githubUrl: "https://github.com/ThomasGates3/ai-powered-iam",
    liveUrl: "http://iam-policy-gen-website-049475639513-prod.s3-website-us-east-1.amazonaws.com/"
  }, {
    title: "Bullcycle Binoculars - Crypto Price Tracker with AI News Analysis",
    description: "Real-time cryptocurrency price tracker with AI-powered news sentiment analysis. Displays live market data for BTC, ETH, SOL, HYPE. Serverless Lambda microservice enriches 10 crypto news articles with Claude 3 Haiku sentiment analysis (Bullish 🐂, Bearish 🐻, Neutral ⚪). Features 15-minute DynamoDB caching and interactive sentiment filtering. Production-grade infrastructure using Terraform.",
    technologies: ["HTML", "CSS", "JavaScript", "AWS S3", "AWS Lambda", "AWS API Gateway", "AWS DynamoDB", "AWS Bedrock", "AWS Terraform", "Node.js", "TypeScript"],
    githubUrl: "https://github.com/ThomasGates3/Bullcycle-Binoculars",
    liveUrl: "http://bullcycle-binoculars-049475639513.s3-website-us-east-1.amazonaws.com/"
  }, {
    title: "Natural Remedies - AI-Powered Wellness Discovery",
    description: "Intelligent platform for discovering and evaluating natural health remedies. Features AI-powered symptom-based recommendations, structured remedy information with preparation guides and safety precautions, side-by-side comparisons, search history tracking, and favorites system. Built with React 19, TypeScript, and Tailwind CSS with Cloud Run deployment on Google Cloud.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Google Cloud Run", "Google Cloud Storage", "Gemini API", "Docker"],
    githubUrl: "https://github.com/ThomasGates3/natural-remedies-ai/actions/workflows/deploy.yml",
    liveUrl: "https://natural-remedies-ai-frontend-dev-807828955289.storage.googleapis.com/index.html"
  }, {
    title: "Sam's Suit Shop - Highly Available Containerized Application",
    description: "Production-grade e-commerce platform with containerized microservices architecture, load balancing, and high availability across multiple availability zones.",
    technologies: ["Docker", "AWS ECS", "AWS CloudFront", "Load Balancer", "PostgreSQL", "AWS VPC", "CI/CD"],
    githubUrl: "https://github.com/ThomasGates3/Sams-Suit-Shop"
  }, {
    title: "SpeakEasy TTS - AI Text to Speech Application",
    description: "Intelligent text-to-speech system leveraging generative AI and neural networks to produce natural, human-like audio output with multi-language support.",
    technologies: ["Python", "TensorFlow", "AWS Polly", "FastAPI", "React", "WebRTC", "Machine Learning", "CloudFront"],
    githubUrl: "https://github.com/ThomasGates3/SpeakEasy-TTS"
  }, {
    title: "Cloud & AI Voyage Portfolio",
    description: "Modern, space-themed portfolio website showcasing AWS cloud and generative AI expertise, projects, and skills with interactive animations and responsive design. Implemented a fully automated CI/CD pipeline using GitHub Actions that deploys to AWS S3 and invalidates CloudFront cache with every push to main branch.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Vite", "AWS S3", "CloudFront", "Terraform", "GitHub Actions", "CI/CD"],
    githubUrl: "https://github.com/ThomasGates3/cloud-voyage-portfolio",
    liveUrl: "https://d1txardbv3hmir.cloudfront.net/"
  }];
  const certifications = [
    {
      title: "AWS Cloud Practitioner",
      logo: "/aws-certified-cloud-practitioner.png",
      verificationUrl: "https://www.credly.com/badges/50ae5103-1fef-46ae-8b88-955b8bda1d8f/linked_in_profile"
    },
    {
      title: "Certified Information Systems Auditor (CISA)",
      logo: "/cisa-text-logo -nobg.png",
      verificationUrl: "https://www.isaca.org/credentialing/cisa"
    },
    {
      title: "Oracle Cloud Infrastructure Associate",
      logo: "/OCI25FNDCFAV1.png",
      verificationUrl: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=06B0C2173A4AC507C3BC2AACA4C52D1BDC25ABA21CED322D059FF3E95B5AE0A1"
    }
  ];

  const skillTools = {
    "Generative AI": ["Google AI Studio", "Claude Code", "Stitch", "Gemini", "AWS Bedrock"],
    "Cybersecurity": ["Nessus", "Splunk", "AWS Security Hub", "AWS GuardDuty", "AWS Config"],
    "Cloud Concepts": ["Compute", "Storage", "Networking", "Security"],
    "Front End Development": ["HTML", "CSS", "React", "TypeScript", "Tailwind CSS"],
    "Customer Service": ["Empathetic", "Solution-Oriented", "De-escalation", "ARM Statements"],
    "Collaboration": ["Cross-Functional Collaboration", "Mentorship", "Leading by Example"]
  };

  const skills = [{
    icon: Zap,
    label: "Generative AI",
    skillName: "Generative AI",
    description: "AI/ML & LLM Integration",
    proficiency: 93,
    maxProficiency: 100,
    grade: "A",
    masteredLabel: "PROFICIENT"
  }, {
    icon: Cloud,
    label: "Cloud Concepts",
    skillName: "Cloud Concepts",
    description: "AWS Solutions Architecture",
    proficiency: 87,
    maxProficiency: 100,
    grade: "A-",
    masteredLabel: "PROFICIENT"
  }, {
    icon: Shield,
    label: "Cybersecurity",
    skillName: "Cybersecurity",
    description: "Security & Compliance",
    proficiency: 82,
    maxProficiency: 100,
    grade: "B+",
    masteredLabel: "PROFICIENT"
  }, {
    icon: Network,
    label: "Front End Development",
    skillName: "Front End Development",
    description: "React & Modern UI",
    proficiency: 90,
    maxProficiency: 100,
    grade: "A-",
    masteredLabel: "PROFICIENT"
  }, {
    icon: Headphones,
    label: "Customer Service",
    skillName: "Customer Service",
    description: "Client Success & Support",
    proficiency: 98,
    maxProficiency: 100,
    grade: "A+",
    masteredLabel: "EXCELLENT"
  }, {
    icon: Users,
    label: "Collaboration",
    skillName: "Collaboration",
    description: "Team Leadership",
    proficiency: 88,
    maxProficiency: 100,
    grade: "B",
    masteredLabel: "TEAM PLAYER"
  }];

  const experience = [
    {
      role: "Cybersecurity Auditor",
      company: "Universal Technical Services",
      period: "Jan 2021 – Present",
      duration: "4+ years",
      description: "Designed and reviewed secure cloud infrastructure across AWS environments. Implemented 50+ security controls reducing critical vulnerabilities by 30%. Developed Python and Bash automation scripts for security policy enforcement.",
      highlights: [
        "Designed and reviewed secure cloud infrastructure across AWS environments, ensuring compliance with NIST, FISMA, FedRAMP, and security best practices",
        "Implemented 50+ security controls and hardening initiatives reducing critical vulnerabilities by 30% and improving cloud security posture",
        "Developed Python and Bash automation scripts to enforce security policies, streamline deployments, and reduce configuration errors by 22%",
        "Conducted comprehensive security audits and vulnerability assessments across cloud platforms"
      ]
    },
    {
      role: "Technical Support Specialist",
      company: "Spectrum",
      period: "March 2023 – May 2024",
      duration: "~1.5 years",
      description: "Managed cloud infrastructure monitoring and security incident response for 40+ systems, reducing incidents by 35%. Performed network and endpoint hardening across cloud infrastructure.",
      highlights: [
        "Managed cloud infrastructure monitoring and security incident response for 40+ systems, reducing incidents by 35% through hardening controls",
        "Performed network and endpoint hardening across cloud infrastructure, implementing security protocols that mitigated unauthorized access",
        "Conducted vulnerability assessments and security scanning to identify cloud infrastructure risks",
        "Supported business continuity through infrastructure monitoring and security controls, maintaining 99.2% uptime"
      ]
    },
    {
      role: "B.S. Computer Science",
      company: "East Carolina University",
      period: "2016 – 2020",
      duration: "4 years",
      description: "Strong foundation in computer science fundamentals, networking, and security principles.",
      highlights: [
        "Computer Science degree with focus on systems and security"
      ]
    }
  ];
  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CursorGlow />
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
            AWS Cloud & AI Engineer specializing in intelligent infrastructure, secure systems, and generative AI solutions
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
              Cloud & AI Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building secure, scalable, and intelligent solutions powered by cloud infrastructure and generative AI
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => <div key={index} className="animate-on-scroll">
                <ProjectCard {...project} />
              </div>)}
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section id="resume" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
                Download Resume
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Access my complete resume to learn more about my professional experience,
                certifications, technical achievements, and qualifications.
              </p>
              <Button
                size="lg"
                className="glow-hover bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => window.open('/resume.pdf', '_blank')}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Resume
              </Button>
            </div>

            <div className="animate-on-scroll">
              <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8">
                Experience Timeline
              </h2>
              <div className="space-y-6">
                {experience.map((job, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-accent pb-6">
                    <div className="absolute w-3 h-3 bg-accent rounded-full -left-[7px] top-1 mt-1" />
                    <div>
                      <h3 className="font-heading font-semibold text-lg">{job.role}</h3>
                      <p className="text-sm text-accent font-medium">{job.company}</p>
                      <p className="text-xs text-muted-foreground mb-2">{job.period}</p>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              Certifications & Credentials
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Industry-recognized certifications validating my expertise in cloud, security, and systems architecture
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <div key={index} className="animate-on-scroll">
                <CertificationCard
                  title={cert.title}
                  logo={cert.logo}
                  verificationUrl={cert.verificationUrl}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              Skills & Expertise
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive technical proficiency spanning cloud computing, security, AI/ML, and more
            </p>
          </div>
          <div className="space-y-8">
            {skills.map((skill, index) => (
              <div key={index} className="animate-on-scroll">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      {skill.icon && <skill.icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg">{skill.label}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </div>
                  </div>
                  <PokemonHPBar
                    proficiency={skill.proficiency}
                    maxProficiency={skill.maxProficiency}
                    label=""
                    grade={skill.grade}
                    skillName={skill.skillName}
                    tools={skillTools[skill.skillName as keyof typeof skillTools]}
                    masteredLabel={skill.masteredLabel}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="py-20 px-6 relative z-10 bg-gradient-to-b from-background to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">
              AI Tools & Frameworks
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leveraging cutting-edge generative AI platforms and tools to build intelligent solutions
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            {[
              { name: "Google AI Studio", description: "Gemini API integration for AI-powered features", logo: "/logos/googleaistudio.svg" },
              { name: "Claude Code", description: "AI-assisted development and code generation", logo: "/logos/claude.svg" },
              { name: "OpenRouter", description: "Unified API for integrating multiple LLMs into applications", logo: "/logos/openrouter.svg" },
              { name: "Gemini", description: "Advanced language model for recommendations and analysis", logo: "/logos/gemini.svg" },
              { name: "AWS Bedrock", description: "Managed generative AI service on AWS", logo: "/logos/bedrock.svg" }
            ].map((tool, index) => (
              <div key={index} className="animate-on-scroll">
                <AIToolCard
                  name={tool.name}
                  description={tool.description}
                  logoPath={tool.logo}
                />
              </div>
            ))}
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
                I'm a dedicated AWS Cloud & AI Engineer with a strong background in cybersecurity,
                technical support, and intelligent systems architecture. My passion lies in building
                secure, scalable cloud solutions enhanced with generative AI to drive business success.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                With expertise in AWS services, generative AI integration, compliance frameworks, and
                customer-focused support, I bring both technical depth and strategic thinking to every
                project. I thrive in collaborative environments where innovation meets reliability,
                leveraging AI tools to accelerate development and solve complex problems.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-space-dark text-accent border-accent/20">AWS Cloud Practitioner</Badge>
                <Badge variant="secondary" className="bg-space-dark text-accent border-accent/20">CISA</Badge>
                <Badge variant="secondary" className="bg-space-dark text-accent border-accent/20">Cloud Architecture</Badge>
              </div>
            </div>
            <div className="animate-on-scroll flex justify-center">
              <div className="relative">
                <img
                  src="/self-portrait.png"
                  alt="Thomas Gates III"
                  className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-lg border-2 border-accent/30 shadow-lg shadow-accent/20 transition-transform duration-300 hover:scale-105"
                  style={{ objectPosition: 'center top' }}
                />
                {/* Decorative glow effect */}
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            </div>
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
          <p>© 2025 Thomas Gates III</p>
        </div>
      </footer>
    </div>;
};
export default Index;