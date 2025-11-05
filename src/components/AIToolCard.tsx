import { motion } from "framer-motion";

interface AIToolCardProps {
  name: string;
  description: string;
  logoPath: string;
}

export function AIToolCard({ name, description, logoPath }: AIToolCardProps) {
  return (
    <motion.div
      className="h-full"
      whileHover={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="p-8 rounded-lg border border-accent/20 bg-card h-full flex flex-col items-center justify-center text-center transition-all duration-300"
        whileHover={{
          scale: 1.15,
          boxShadow: "0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)",
          borderColor: "rgba(0, 255, 255, 0.6)",
        }}
      >
        {/* Logo Container */}
        <div className="mb-4 h-20 w-20 flex items-center justify-center">
          <motion.img
            src={logoPath}
            alt={name}
            className="max-h-20 max-w-20 object-contain"
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Tool Name */}
        <h3 className="font-heading font-semibold text-lg mb-2 transition-colors group-hover:text-accent">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}
