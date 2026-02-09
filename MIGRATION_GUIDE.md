# 🚀 Valentine Creator — Migration Guide

Migrate this project from Lovable Cloud to your own self-hosted Supabase instance.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project — note your **Project URL** and **Anon Key** from Settings → API

---

## 2. Database Schema

Run these SQL statements in **SQL Editor** (supabase.com/dashboard → SQL Editor):

### Tables

```sql
-- Valentine pages table
CREATE TABLE public.valentine_pages (
  id TEXT NOT NULL PRIMARY KEY,
  question TEXT NOT NULL DEFAULT 'Will you be my Valentine?',
  begging_messages TEXT[] NOT NULL DEFAULT ARRAY[
    'Please?',
    'Pretty please?',
    'I''ll be so sad...',
    'You''re breaking my heart!',
    'Don''t do this to me!'
  ],
  final_message TEXT NOT NULL DEFAULT 'You just made me the happiest person ever! 💖',
  social_label TEXT DEFAULT 'Message me',
  social_link TEXT,
  sender_name TEXT,
  receiver_name TEXT,
  creator_email TEXT,
  theme TEXT NOT NULL DEFAULT 'romantic',
  decoration_type TEXT NOT NULL DEFAULT 'hearts',
  custom_decoration_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Yes events table
CREATE TABLE public.yes_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES public.valentine_pages(id),
  screenshot_url TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_id)
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE public.valentine_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yes_events ENABLE ROW LEVEL SECURITY;

-- Valentine pages: public read + insert
CREATE POLICY "Anyone can view valentine pages"
  ON public.valentine_pages FOR SELECT USING (true);

CREATE POLICY "Anyone can create valentine pages"
  ON public.valentine_pages FOR INSERT WITH CHECK (true);

-- Yes events: public read + insert
CREATE POLICY "Anyone can view yes events"
  ON public.yes_events FOR SELECT USING (true);

CREATE POLICY "Anyone can create yes events"
  ON public.yes_events FOR INSERT WITH CHECK (true);
```

---

## 3. Storage Bucket

```sql
-- Create public screenshots bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true);

-- Allow public read
CREATE POLICY "Public read screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'screenshots');

-- Allow public upload
CREATE POLICY "Public upload screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'screenshots');
```

---

## 4. Edge Function: `notify-yes`

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli)
2. Run `supabase functions new notify-yes`
3. Copy the contents of `supabase/functions/notify-yes/index.ts` into the generated file
4. Deploy: `supabase functions deploy notify-yes --no-verify-jwt`

---

## 5. Secrets / Environment Variables

### Edge Function Secrets

Set these via CLI or Dashboard (Settings → Edge Functions):

| Secret | Description |
|---|---|
| `SUPABASE_URL` | Auto-provided by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase |
| `N8N_WEBHOOK_URL` | Your n8n webhook URL for email notifications |

```bash
supabase secrets set N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/xxx"
```

### Frontend Environment Variables

Update your `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
```

---

## 6. Update Supabase Client

In `src/integrations/supabase/client.ts`, ensure it uses:

```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

---

## 7. n8n Webhook Setup (for email notifications)

The `notify-yes` edge function sends a POST to your n8n webhook with:

```json
{
  "to": "creator@email.com",
  "subject": "🎉 Name said YES to your Valentine! 💕",
  "html": "<html>...</html>"
}
```

### n8n Workflow

1. **Trigger**: Webhook node (POST)
2. **Action**: Gmail/SMTP node — map `to`, `subject`, `html` from webhook body

---

## 8. Deploy Frontend

```bash
npm install
npm run build
```

Host the `dist/` folder on any static host (Vercel, Netlify, Cloudflare Pages, etc.).

---

## 9. Checklist

- [ ] Supabase project created
- [ ] Tables created (`valentine_pages`, `yes_events`)
- [ ] RLS policies applied
- [ ] Storage bucket `screenshots` created with policies
- [ ] Edge function `notify-yes` deployed
- [ ] `N8N_WEBHOOK_URL` secret set
- [ ] `.env` updated with your Supabase credentials
- [ ] n8n workflow configured
- [ ] Frontend built and deployed

---

## Architecture Overview

```
User creates card → valentine_pages table
         ↓
Receiver clicks YES → yes_events table
         ↓
Screenshot captured → screenshots storage bucket
         ↓
notify-yes edge function → n8n webhook → Gmail email to creator
```

---

*Generated for the Valentine Creator project.*
