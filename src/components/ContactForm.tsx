import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Linkedin, Github } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to a backend service
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. I'll get back to you soon.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contacts = [
    {
      icon: Mail,
      label: "Email",
      value: "thomasthethird3@gmail.com",
      href: "mailto:thomasthethird3@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "404-786-2193",
      href: "tel:404-786-2193",
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: "thomas-gates-iii",
      href: "https://linkedin.com/in/thomas-gates-iii",
    },
    {
      icon: Github,
      label: "GitHub",
      value: "View Projects",
      href: "#",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Send a Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-input border-border focus:border-accent"
            />
            <Input
              name="email"
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-input border-border focus:border-accent"
            />
            <Textarea
              name="message"
              placeholder="Your Message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              className="bg-input border-border focus:border-accent resize-none"
            />
            <Button
              type="submit"
              className="w-full glow-hover bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <h3 className="font-heading text-2xl mb-4">Get In Touch</h3>
          <p className="text-muted-foreground mb-6">
            I'm always interested in discussing new opportunities in cloud computing, 
            cybersecurity, and technical support roles. Let's connect!
          </p>
        </div>

        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <a
              key={index}
              href={contact.href}
              target={contact.href.startsWith('http') ? '_blank' : undefined}
              rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border hover:border-accent transition-all duration-300 glow-hover group"
            >
              <div className="p-2 rounded-full bg-space-dark border border-accent/20 group-hover:border-accent transition-colors duration-300 mr-4">
                <contact.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold">{contact.label}</p>
                <p className="text-muted-foreground text-sm">{contact.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactForm;