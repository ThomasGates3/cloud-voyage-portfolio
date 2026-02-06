import { Mail, Phone, Linkedin, Github } from "lucide-react";

const ContactForm = () => {

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
      href: "https://github.com/ThomasGates3",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="font-heading text-2xl mb-4">Get In Touch</h3>
          <p className="text-muted-foreground mb-6">
            I'm always interested in discussing new opportunities in cloud computing,
            cybersecurity, and technical support roles. Let's connect!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
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