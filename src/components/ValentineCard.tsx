 import { useState, useEffect, useRef, useCallback } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Heart, Download, ExternalLink } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 import html2canvas from "html2canvas";
 import confetti from "canvas-confetti";
 
 interface ValentineCardProps {
   pageId: string;
   question: string;
   beggingMessages: string[];
   finalMessage: string;
   socialLabel: string | null;
   socialLink: string | null;
   senderName: string | null;
   alreadyAccepted?: boolean;
   existingScreenshotUrl?: string | null;
 }
 
 const ValentineCard = ({
   pageId,
   question,
   beggingMessages,
   finalMessage,
   socialLabel,
   socialLink,
   senderName,
   alreadyAccepted = false,
   existingScreenshotUrl = null,
 }: ValentineCardProps) => {
   const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
   const [noAttempts, setNoAttempts] = useState(0);
   const [yesClicked, setYesClicked] = useState(alreadyAccepted);
   const [isProcessing, setIsProcessing] = useState(false);
   const [screenshotUrl, setScreenshotUrl] = useState<string | null>(existingScreenshotUrl);
   const cardRef = useRef<HTMLDivElement>(null);
   const yesButtonRef = useRef<HTMLButtonElement>(null);
 
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
     const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
 
     const randomInRange = (min: number, max: number) =>
       Math.random() * (max - min) + min;
 
     const interval = setInterval(() => {
       const timeLeft = animationEnd - Date.now();
       if (timeLeft <= 0) {
         return clearInterval(interval);
       }
       const particleCount = 50 * (timeLeft / duration);
 
       // Hearts
       confetti({
         ...defaults,
         particleCount,
         origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
         colors: ["#ec4899", "#f472b6", "#f9a8d4", "#fce7f3"],
         shapes: ["circle"],
       });
       confetti({
         ...defaults,
         particleCount,
         origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
         colors: ["#ec4899", "#f472b6", "#f9a8d4", "#fce7f3"],
         shapes: ["circle"],
       });
     }, 250);
 
     // Big burst
     confetti({
       particleCount: 150,
       spread: 100,
       origin: { y: 0.6 },
       colors: ["#ec4899", "#f472b6", "#f9a8d4", "#fce7f3", "#fdf2f8"],
     });
   }, []);
 
   const captureScreenshot = useCallback(async (): Promise<string | null> => {
     if (!cardRef.current) return null;
 
     try {
       await new Promise((resolve) => setTimeout(resolve, 500));
 
       const canvas = await html2canvas(cardRef.current, {
         backgroundColor: null,
         scale: 2,
         useCORS: true,
       });
 
       return canvas.toDataURL("image/png");
     } catch (error) {
       console.error("Screenshot failed:", error);
       return null;
     }
   }, []);
 
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
 
   return (
     <div className="w-full max-w-lg mx-auto px-4">
       <motion.div
         ref={cardRef}
         className="valentine-card text-center relative overflow-visible"
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
               {/* Sender */}
               {senderName && (
                 <p className="text-muted-foreground text-sm">
                   From <span className="font-semibold text-foreground">{senderName}</span>
                 </p>
               )}
 
               {/* Animated Heart */}
               <motion.div
                 className="text-6xl"
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
               >
                 💕
               </motion.div>
 
               {/* Question */}
               <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
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
                     className="text-lg text-primary font-medium animate-wiggle"
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
                     ref={yesButtonRef}
                     onClick={handleYesClick}
                     disabled={isProcessing}
                     className="btn-romantic text-lg px-8 py-4 pulse-glow"
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
                     className="text-lg px-8 py-4 border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50"
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
               {/* Big Heart */}
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
                   className="text-4xl font-serif font-bold text-gradient"
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.2 }}
                 >
                   {senderName} 💕
                 </motion.h2>
               )}
 
               {/* Final message */}
               <motion.p
                 className="text-xl text-foreground font-medium"
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
                   className="inline-flex items-center gap-2 btn-romantic text-base"
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
                   className="border-primary/30 text-foreground hover:bg-secondary mt-4"
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