import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import ValentineCard from "@/components/ValentineCard";
import FloatingDecorations from "@/components/FloatingDecorations";
import { supabase } from "@/integrations/supabase/client";
import { getThemeById, DecorationType } from "@/lib/themes";

interface PageData {
  id: string;
  question: string;
  begging_messages: string[];
  final_message: string;
  social_label: string | null;
  social_link: string | null;
  sender_name: string | null;
  receiver_name: string | null;
  theme: string;
  decoration_type: string;
  custom_decoration_url: string | null;
}

interface YesEvent {
  clicked_at: string;
  screenshot_url: string | null;
}

const Valentine = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [yesEvent, setYesEvent] = useState<YesEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!pageId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch page data
        const { data: page, error: pageError } = await supabase
          .from("valentine_pages")
          .select("*")
          .eq("id", pageId)
          .maybeSingle();

        if (pageError || !page) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setPageData(page);

        // Check if already accepted
        const { data: existingYes } = await supabase
          .from("yes_events")
          .select("clicked_at, screenshot_url")
          .eq("page_id", pageId)
          .maybeSingle();

        if (existingYes) {
          setYesEvent(existingYes);
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId]);

  // Apply theme colors to page
  useEffect(() => {
    if (pageData) {
      const theme = getThemeById(pageData.theme);
      document.documentElement.style.setProperty("--background", theme.colors.background);
      document.documentElement.style.setProperty("--foreground", theme.colors.foreground);
    }
    return () => {
      // Reset to default on unmount
      document.documentElement.style.removeProperty("--background");
      document.documentElement.style.removeProperty("--foreground");
    };
  }, [pageData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading your surprise...</p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <FloatingDecorations decorationType="hearts" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Valentine Not Found
          </h1>
          <p className="text-muted-foreground">
            This love letter doesn't exist or has been removed 💔
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background overflow-hidden">
      <FloatingDecorations 
        decorationType={(pageData?.decoration_type || "hearts") as DecorationType}
        customImageUrl={pageData?.custom_decoration_url}
      />
      {pageData && (
        <ValentineCard
          pageId={pageData.id}
          question={pageData.question}
          beggingMessages={pageData.begging_messages}
          finalMessage={pageData.final_message}
          socialLabel={pageData.social_label}
          socialLink={pageData.social_link}
          senderName={pageData.sender_name}
          receiverName={pageData.receiver_name}
          alreadyAccepted={!!yesEvent}
          existingScreenshotUrl={yesEvent?.screenshot_url}
          theme={pageData.theme}
          decorationType={(pageData.decoration_type || "hearts") as DecorationType}
        />
      )}
    </div>
  );
};

export default Valentine;
