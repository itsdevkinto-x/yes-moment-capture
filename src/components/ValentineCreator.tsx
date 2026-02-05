 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Heart, Sparkles, Send, Plus, X, MessageCircle } from "lucide-react";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { supabase } from "@/integrations/supabase/client";
 import { nanoid } from "nanoid";
 import { useToast } from "@/hooks/use-toast";
 
 interface ValentineData {
   question: string;
   beggingMessages: string[];
   finalMessage: string;
   socialLabel: string;
   socialLink: string;
   senderName: string;
 }
 
 const ValentineCreator = () => {
   const { toast } = useToast();
   const [isCreating, setIsCreating] = useState(false);
   const [createdLink, setCreatedLink] = useState<string | null>(null);
   const [formData, setFormData] = useState<ValentineData>({
     question: "Will you be my Valentine?",
     beggingMessages: [
       "Please? 🥺",
       "Pretty please? 💕",
       "I'll be so sad...",
       "You're breaking my heart! 💔",
       "Don't do this to me!",
     ],
     finalMessage: "You just made me the happiest person ever! 💖",
     socialLabel: "Message me on Instagram",
     socialLink: "",
     senderName: "",
   });
 
   const addBeggingMessage = () => {
     setFormData((prev) => ({
       ...prev,
       beggingMessages: [...prev.beggingMessages, ""],
     }));
   };
 
   const removeBeggingMessage = (index: number) => {
     setFormData((prev) => ({
       ...prev,
       beggingMessages: prev.beggingMessages.filter((_, i) => i !== index),
     }));
   };
 
   const updateBeggingMessage = (index: number, value: string) => {
     setFormData((prev) => ({
       ...prev,
       beggingMessages: prev.beggingMessages.map((msg, i) =>
         i === index ? value : msg
       ),
     }));
   };
 
   const handleCreate = async () => {
     if (!formData.senderName.trim()) {
       toast({
         title: "Missing name",
         description: "Please enter your name so they know who it's from!",
         variant: "destructive",
       });
       return;
     }
 
     setIsCreating(true);
     const pageId = nanoid(10);
 
     try {
       const { error } = await supabase.from("valentine_pages").insert({
         id: pageId,
         question: formData.question,
         begging_messages: formData.beggingMessages.filter((m) => m.trim()),
         final_message: formData.finalMessage,
         social_label: formData.socialLabel || null,
         social_link: formData.socialLink || null,
         sender_name: formData.senderName,
       });
 
       if (error) throw error;
 
       const link = `${window.location.origin}/v/${pageId}`;
       setCreatedLink(link);
       toast({
         title: "Valentine created! 💕",
         description: "Share the link with your special someone!",
       });
     } catch (error) {
       console.error("Error creating valentine:", error);
       toast({
         title: "Oops!",
         description: "Something went wrong. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsCreating(false);
     }
   };
 
   const copyLink = () => {
     if (createdLink) {
       navigator.clipboard.writeText(createdLink);
       toast({
         title: "Copied! 📋",
         description: "Link copied to clipboard!",
       });
     }
   };
 
   if (createdLink) {
     return (
       <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="valentine-card max-w-lg mx-auto text-center"
       >
         <div className="animate-heart-beat inline-block text-6xl mb-6">💕</div>
         <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
           Your Valentine is Ready!
         </h2>
         <p className="text-muted-foreground mb-6">
           Share this magical link with your special someone
         </p>
         <div className="bg-secondary/50 rounded-xl p-4 mb-6 break-all">
           <code className="text-sm text-foreground">{createdLink}</code>
         </div>
         <div className="flex gap-4 justify-center flex-wrap">
           <Button onClick={copyLink} className="btn-romantic">
             <Sparkles className="w-5 h-5 mr-2" />
             Copy Link
           </Button>
           <Button
             variant="outline"
             onClick={() => {
               setCreatedLink(null);
               setFormData({
                 question: "Will you be my Valentine?",
                 beggingMessages: [
                   "Please? 🥺",
                   "Pretty please? 💕",
                   "I'll be so sad...",
                   "You're breaking my heart! 💔",
                   "Don't do this to me!",
                 ],
                 finalMessage: "You just made me the happiest person ever! 💖",
                 socialLabel: "Message me on Instagram",
                 socialLink: "",
                 senderName: "",
               });
             }}
             className="border-primary/30 hover:bg-secondary"
           >
             Create Another
           </Button>
         </div>
       </motion.div>
     );
   }
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="valentine-card max-w-2xl mx-auto"
     >
       <div className="text-center mb-8">
         <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-heart-beat" />
         <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
           Create Your Valentine
         </h2>
         <p className="text-muted-foreground">
           Make it special, make it unforgettable
         </p>
       </div>
 
       <div className="space-y-6">
         {/* Sender Name */}
         <div>
           <Label htmlFor="senderName" className="text-foreground font-medium">
             Your Name <span className="text-primary">*</span>
           </Label>
           <Input
             id="senderName"
             value={formData.senderName}
             onChange={(e) =>
               setFormData((prev) => ({ ...prev, senderName: e.target.value }))
             }
             placeholder="Enter your name"
             className="mt-2 bg-background border-border"
           />
         </div>
 
         {/* Question */}
         <div>
           <Label htmlFor="question" className="text-foreground font-medium">
             The Big Question 💕
           </Label>
           <Input
             id="question"
             value={formData.question}
             onChange={(e) =>
               setFormData((prev) => ({ ...prev, question: e.target.value }))
             }
             placeholder="Will you be my Valentine?"
             className="mt-2 bg-background border-border"
           />
         </div>
 
         {/* Begging Messages */}
         <div>
           <Label className="text-foreground font-medium">
             Begging Messages 🥺
             <span className="text-muted-foreground text-sm ml-2">
               (shown when they try to click No)
             </span>
           </Label>
           <div className="space-y-3 mt-2">
             {formData.beggingMessages.map((msg, index) => (
               <div key={index} className="flex gap-2">
                 <Input
                   value={msg}
                   onChange={(e) => updateBeggingMessage(index, e.target.value)}
                   placeholder={`Message ${index + 1}`}
                   className="bg-background border-border"
                 />
                 {formData.beggingMessages.length > 1 && (
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => removeBeggingMessage(index)}
                     className="text-muted-foreground hover:text-destructive"
                   >
                     <X className="w-4 h-4" />
                   </Button>
                 )}
               </div>
             ))}
             <Button
               variant="outline"
               size="sm"
               onClick={addBeggingMessage}
               className="border-dashed border-primary/40 text-primary hover:bg-secondary"
             >
               <Plus className="w-4 h-4 mr-2" />
               Add Message
             </Button>
           </div>
         </div>
 
         {/* Final Message */}
         <div>
           <Label htmlFor="finalMessage" className="text-foreground font-medium">
             Final Message 💖
             <span className="text-muted-foreground text-sm ml-2">
               (shown after they say YES!)
             </span>
           </Label>
           <Textarea
             id="finalMessage"
             value={formData.finalMessage}
             onChange={(e) =>
               setFormData((prev) => ({ ...prev, finalMessage: e.target.value }))
             }
             placeholder="You just made me the happiest person ever!"
             className="mt-2 bg-background border-border min-h-[100px]"
           />
         </div>
 
         {/* Social Link */}
         <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
           <div className="flex items-center gap-2 text-foreground font-medium">
             <MessageCircle className="w-5 h-5 text-primary" />
             Contact Info (Optional)
           </div>
           <div className="grid sm:grid-cols-2 gap-4">
             <div>
               <Label
                 htmlFor="socialLabel"
                 className="text-muted-foreground text-sm"
               >
                 Button Label
               </Label>
               <Input
                 id="socialLabel"
                 value={formData.socialLabel}
                 onChange={(e) =>
                   setFormData((prev) => ({
                     ...prev,
                     socialLabel: e.target.value,
                   }))
                 }
                 placeholder="Message me on Instagram"
                 className="mt-1 bg-background border-border"
               />
             </div>
             <div>
               <Label
                 htmlFor="socialLink"
                 className="text-muted-foreground text-sm"
               >
                 Link URL
               </Label>
               <Input
                 id="socialLink"
                 value={formData.socialLink}
                 onChange={(e) =>
                   setFormData((prev) => ({ ...prev, socialLink: e.target.value }))
                 }
                 placeholder="https://instagram.com/yourusername"
                 className="mt-1 bg-background border-border"
               />
             </div>
           </div>
         </div>
 
         {/* Submit */}
         <div className="text-center pt-4">
           <Button
             onClick={handleCreate}
             disabled={isCreating}
             className="btn-romantic text-xl px-10 py-6"
           >
             {isCreating ? (
               <>
                 <Heart className="w-6 h-6 mr-2 animate-heart-beat" />
                 Creating...
               </>
             ) : (
               <>
                 <Send className="w-6 h-6 mr-2" />
                 Create Valentine
               </>
             )}
           </Button>
         </div>
       </div>
     </motion.div>
   );
 };
 
 export default ValentineCreator;