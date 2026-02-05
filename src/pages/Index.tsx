import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import ValentineCreator from "@/components/ValentineCreator";
import FloatingHearts from "@/components/FloatingHearts";

const Index = () => {
  return (
    <div className="min-h-screen py-12 px-4 bg-background overflow-hidden relative">
      <FloatingHearts />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-secondary/50 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4" />
          Valentine's Day 2026
          <Sparkles className="w-4 h-4" />
        </motion.div>
        
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-foreground mb-4">
          Ask Your{" "}
          <span className="text-gradient">Valentine</span>
          <motion.span
            className="inline-block ml-2"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            💕
          </motion.span>
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Create a playful, unforgettable way to pop the big question
        </p>
      </motion.div>

      {/* Creator Form */}
      <ValentineCreator />
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 text-muted-foreground text-sm"
      >
        <Heart className="w-4 h-4 inline-block mr-1" />
        Made with love for Valentine's Day
      </motion.div>
    </div>
  );
};

export default Index;
