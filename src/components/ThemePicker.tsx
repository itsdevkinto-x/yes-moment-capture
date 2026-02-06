import { motion } from "framer-motion";
import { themes, ThemeConfig } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ThemePickerProps {
  selectedTheme: string;
  onSelectTheme: (themeId: string) => void;
}

const ThemePicker = ({ selectedTheme, onSelectTheme }: ThemePickerProps) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      {themes.map((theme) => (
        <motion.button
          key={theme.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectTheme(theme.id)}
          className={cn(
            "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
            selectedTheme === theme.id
              ? "border-primary ring-2 ring-primary/30"
              : "border-border hover:border-primary/50"
          )}
          style={{
            background: theme.gradient,
          }}
        >
          <span className="text-2xl mb-1">{theme.emoji}</span>
          <span className="text-xs font-medium text-white drop-shadow-md">
            {theme.name.split(" ")[0]}
          </span>
          {selectedTheme === theme.id && (
            <motion.div
              layoutId="theme-check"
              className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white">✓</span>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default ThemePicker;
