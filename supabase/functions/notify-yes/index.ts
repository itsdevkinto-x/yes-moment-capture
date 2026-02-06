import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  pageId: string;
  screenshotUrl?: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageId, screenshotUrl }: NotifyRequest = await req.json();

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: "Missing pageId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get page details including creator email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: page, error: pageError } = await supabase
      .from("valentine_pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (pageError || !page) {
      console.error("Page not found:", pageError);
      return new Response(
        JSON.stringify({ error: "Page not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no email, just return success without sending
    if (!page.creator_email) {
      console.log("No creator email configured, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No email configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const screenshotSection = screenshotUrl
      ? `<p style="margin: 20px 0;"><a href="${screenshotUrl}" style="background: #ec4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">📸 View Screenshot</a></p>`
      : "";

    const emailResponse = await resend.emails.send({
      from: "Valentine Notifications <onboarding@resend.dev>",
      to: [page.creator_email],
      subject: "🎉 They said YES to your Valentine! 💕",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fdf2f8; padding: 40px 20px; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(236, 72, 153, 0.15);">
            <div style="text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">🎉💖🎉</div>
              <h1 style="color: #db2777; font-size: 28px; margin: 0 0 10px;">THEY SAID YES!</h1>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 30px;">
                ${timestamp}
              </p>
              
              <div style="background: linear-gradient(135deg, #fce7f3, #fbcfe8); padding: 24px; border-radius: 12px; margin: 20px 0;">
                <p style="color: #831843; font-size: 18px; margin: 0; font-weight: 500;">
                  Your Valentine card worked! 💕
                </p>
                <p style="color: #9d174d; font-size: 14px; margin: 10px 0 0;">
                  Someone special clicked "Yes" on your Valentine
                </p>
              </div>
              
              ${screenshotSection}
              
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                Made with 💖 using Valentine Creator
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-yes function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
