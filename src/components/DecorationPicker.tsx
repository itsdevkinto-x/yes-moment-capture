import { motion } from "framer-motion";
import { decorations, DecorationType } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus } from "lucide-react";

interface DecorationPickerProps {
  selectedDecoration: DecorationType;
  onSelectDecoration: (type: DecorationType) => void;
  customImageUrl?: string;
  onCustomImageUrlChange?: (url: string) => void;
}

const DecorationPicker = ({
  selectedDecoration,
  onSelectDecoration,
  customImageUrl = "",
  onCustomImageUrlChange,
}: DecorationPickerProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        {decorations.map((decoration) => (
          <motion.button
            key={decoration.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectDecoration(decoration.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all bg-card",
              selectedDecoration === decoration.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="text-2xl mb-1">{decoration.emoji}</span>
            <span className="text-xs font-medium text-foreground">
              {decoration.name.split(" ")[0]}
            </span>
            {selectedDecoration === decoration.id && (
              <motion.div
                layoutId="decoration-check"
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
              >
                <span className="text-xs text-white">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {selectedDecoration === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <Label className="text-muted-foreground text-sm flex items-center gap-2">
            <ImagePlus className="w-4 h-4" />
            Custom Image URL
          </Label>
          <Input
            value={customImageUrl}
            onChange={(e) => onCustomImageUrlChange?.(e.target.value)}
            placeholder="https://example.com/your-image.png"
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground">
            Use a direct image URL (PNG, JPG, GIF). For best results, use a square image with transparent background.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default DecorationPicker;
