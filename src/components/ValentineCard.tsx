import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import { ThemeConfig, getThemeById, getDecorationById, DecorationType } from "@/lib/themes";

interface ValentineCardProps {
  pageId: string;
  question: string;
  beggingMessages: string[];
  finalMessage: string;
  socialLabel: string | null;
  socialLink: string | null;
  senderName: string | null;
  receiverName: string | null;
  alreadyAccepted?: boolean;
  existingScreenshotUrl?: string | null;
  theme?: string;
  decorationType?: DecorationType;
}

const ValentineCard = ({
  pageId,
  question,
  beggingMessages,
  finalMessage,
  socialLabel,
  socialLink,
  senderName,
  receiverName,
  alreadyAccepted = false,
  existingScreenshotUrl = null,
  theme = "romantic",
  decorationType = "hearts",
}: ValentineCardProps) => {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);
  const [yesClicked, setYesClicked] = useState(alreadyAccepted);
  const [isProcessing, setIsProcessing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(existingScreenshotUrl);
  const cardRef = useRef<HTMLDivElement>(null);

  const themeConfig = getThemeById(theme);
  const decoration = getDecorationById(decorationType);
  const mainEmoji = decoration.symbols[0] || "💕";

  const currentBeggingMessage =
    noAttempts > 0
      ? beggingMessages[Math.min(noAttempts - 1, beggingMessages.length - 1)]
      : null;

  const yesButtonSize = Math.min(1 + noAttempts * 0.15, 2.5);

  const dodgeNo = useCallback(() => {
    const maxX = 150;
    const maxY = 100;
    const newX = (Math.random() - 0.5) * maxX * 2;
    const newY = (Math.random() - 0.5) * maxY * 2;
    setNoPosition({ x: newX, y: newY });
    setNoAttempts((prev) => prev + 1);
  }, []);

  const triggerConfetti = useCallback(() => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const colors = [
      `hsl(${themeConfig.colors.primary})`,
      `hsl(${themeConfig.colors.secondary})`,
      `hsl(${themeConfig.colors.accent})`,
    ];

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors,
        shapes: ["circle"],
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      });
      confetti({
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors,
        shapes: ["circle"],
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      });
    }, 250);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
  }, [themeConfig]);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;

    try {
      // Wait for animations to settle
      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: `hsl(${themeConfig.colors.background})`,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc, element) => {
          // Ensure styles are properly applied in the clone
          element.style.transform = "none";
          element.style.opacity = "1";
        },
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Screenshot failed:", error);
      return null;
    }
  }, [themeConfig]);

  const uploadScreenshot = useCallback(
    async (base64Image: string): Promise<string | null> => {
      try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });

        const fileName = `${pageId}-${Date.now()}.png`;
        const { data, error } = await supabase.storage
          .from("screenshots")
          .upload(fileName, blob, {
            contentType: "image/png",
          });

        if (error) {
          console.error("Upload error:", error);
          return null;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("screenshots").getPublicUrl(data.path);

        return publicUrl;
      } catch (error) {
        console.error("Upload failed:", error);
        return null;
      }
    },
    [pageId]
  );

  const notifyCreator = useCallback(
    async (uploadedUrl: string | null) => {
      try {
        const { error } = await supabase.functions.invoke("notify-yes", {
          body: { pageId, screenshotUrl: uploadedUrl, receiverName },
        });
        if (error) {
          console.error("Notification error:", error);
        }
      } catch (error) {
        console.error("Failed to notify creator:", error);
      }
    },
    [pageId, receiverName]
  );

  const handleYesClick = useCallback(async () => {
    if (yesClicked || isProcessing) return;

    setIsProcessing(true);
    setYesClicked(true);
    triggerConfetti();

    try {
      // Wait for render, then screenshot
      const base64Image = await captureScreenshot();
      let uploadedUrl: string | null = null;

      if (base64Image) {
        uploadedUrl = await uploadScreenshot(base64Image);
        setScreenshotUrl(uploadedUrl);
      }

      // Record the YES event
      const { error } = await supabase.from("yes_events").insert({
        page_id: pageId,
        screenshot_url: uploadedUrl,
      });

      if (error && !error.message.includes("duplicate")) {
        console.error("Error recording yes:", error);
      }

      // Send notification to creator
      await notifyCreator(uploadedUrl);
    } catch (error) {
      console.error("Error processing yes:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    yesClicked,
    isProcessing,
    triggerConfetti,
    captureScreenshot,
    uploadScreenshot,
    pageId,
    notifyCreator,
  ]);

  const downloadScreenshot = useCallback(async () => {
    if (screenshotUrl) {
      const link = document.createElement("a");
      link.href = screenshotUrl;
      link.download = `valentine-${pageId}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const base64Image = await captureScreenshot();
      if (base64Image) {
        const link = document.createElement("a");
        link.href = base64Image;
        link.download = `valentine-${pageId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }, [screenshotUrl, pageId, captureScreenshot]);

  // Theme-specific styles
  const cardStyle = {
    background: themeConfig.gradient,
    "--theme-primary": themeConfig.colors.primary,
    "--theme-foreground": themeConfig.colors.foreground,
  } as React.CSSProperties;

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div
        ref={cardRef}
        className="rounded-2xl p-8 relative overflow-visible text-center"
        style={cardStyle}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <AnimatePresence mode="wait">
          {!yesClicked ? (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              {/* Sender & Receiver */}
              {(senderName || receiverName) && (
                <p className="text-white/80 text-sm">
                  {senderName && <>From <span className="font-semibold text-white">{senderName}</span></>}
                  {senderName && receiverName && " · "}
                  {receiverName && <>To <span className="font-semibold text-white">{receiverName}</span></>}
                </p>
              )}

              {/* Animated Emoji */}
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {mainEmoji}
              </motion.div>

              {/* Question */}
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white drop-shadow-lg">
                {question}
              </h1>

              {/* Begging message */}
              <AnimatePresence mode="wait">
                {currentBeggingMessage && (
                  <motion.p
                    key={noAttempts}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-lg text-white font-medium animate-wiggle"
                  >
                    {currentBeggingMessage}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex justify-center items-center gap-6 pt-4 relative min-h-[80px]">
                {/* YES Button */}
                <motion.div
                  animate={{ scale: yesButtonSize }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    onClick={handleYesClick}
                    disabled={isProcessing}
                    className="text-lg px-8 py-4 bg-white text-pink-600 hover:bg-white/90 shadow-xl pulse-glow"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Yes!
                  </Button>
                </motion.div>

                {/* NO Button */}
                <motion.div
                  animate={{ x: noPosition.x, y: noPosition.y }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Button
                    onMouseEnter={dodgeNo}
                    onTouchStart={dodgeNo}
                    variant="outline"
                    className="text-lg px-8 py-4 bg-white/20 border-white/40 text-white hover:bg-white/30"
                  >
                    No
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="space-y-6"
            >
              {/* Big Emoji */}
              <motion.div
                className="text-7xl"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                💖
              </motion.div>

              {/* Sender name */}
              {senderName && (
                <motion.h2
                  className="text-4xl font-serif font-bold text-white drop-shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {senderName} {mainEmoji}
                </motion.h2>
              )}

              {/* Final message */}
              <motion.p
                className="text-xl text-white font-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {finalMessage}
              </motion.p>

              {/* Social link */}
              {socialLink && socialLabel && (
                <motion.a
                  href={socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="inline-flex items-center gap-2 bg-white text-pink-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  {socialLabel} 💌
                </motion.a>
              )}

              {/* Download button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={downloadScreenshot}
                  variant="outline"
                  className="bg-white/20 border-white/40 text-white hover:bg-white/30 mt-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save this moment 💾
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ValentineCard;
