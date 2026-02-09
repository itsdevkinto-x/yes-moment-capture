import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  pageId: string;
  screenshotUrl?: string | null;
  receiverName?: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageId, screenshotUrl, receiverName }: NotifyRequest = await req.json();

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: "Missing pageId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    if (!page.creator_email) {
      console.log("No creator email configured, skipping notification");
      return new Response(
        JSON.stringify({ success: true, message: "No email configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL is not configured");
      return new Response(
        JSON.stringify({ error: "Webhook URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const timestamp = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const displayName = receiverName || page.receiver_name || "They";
    const screenshotSection = screenshotUrl
      ? `<p style="margin: 20px 0;"><a href="${screenshotUrl}" style="background: #ec4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">📸 View Screenshot</a></p>`
      : "";

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fdf2f8; padding: 40px 20px; margin: 0;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(236, 72, 153, 0.15);">
          <div style="text-align: center;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img
              src="https://media.tenor.com/mRYP23WO1DYAAAAm/ok.webp"
              width="150"
              height="150"
              alt="Celebration!"
              style="display: block; margin: 0 auto;"
            />
          </div>
            <h1 style="color: #db2777; font-size: 28px; margin: 0 0 10px;">${displayName} SAID YES!</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 30px;">${timestamp}</p>
            <div style="background: linear-gradient(135deg, #fce7f3, #fbcfe8); padding: 24px; border-radius: 12px; margin: 20px 0;">
              <p style="color: #831843; font-size: 18px; margin: 0; font-weight: 500;">Your Valentine card worked! 💕</p>
              <p style="color: #9d174d; font-size: 14px; margin: 10px 0 0;">${displayName} clicked "Yes" on your Valentine</p>
            </div>
            ${screenshotSection}
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">Made with 💖 using Valentine Creator</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to n8n webhook
    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: page.creator_email,
        subject: `🎉 ${displayName} said YES to your Valentine! 💕`,
        html: htmlBody,
      }),
    });

    const webhookData = await webhookResponse.text();
    console.log("n8n webhook response:", webhookResponse.status, webhookData);

    if (!webhookResponse.ok) {
      throw new Error(`n8n webhook failed [${webhookResponse.status}]: ${webhookData}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
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
