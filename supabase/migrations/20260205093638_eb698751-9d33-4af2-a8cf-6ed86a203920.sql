
-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true);

-- Allow public read access to screenshots
CREATE POLICY "Public can view screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots');

-- Allow anyone to upload screenshots (since receivers aren't authenticated)
CREATE POLICY "Anyone can upload screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'screenshots');

-- Create the valentine_pages table
CREATE TABLE public.valentine_pages (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL DEFAULT 'Will you be my Valentine?',
  begging_messages TEXT[] NOT NULL DEFAULT ARRAY['Please?', 'Pretty please?', 'I''ll be so sad...', 'You''re breaking my heart!', 'Don''t do this to me!'],
  final_message TEXT NOT NULL DEFAULT 'You just made me the happiest person ever! 💖',
  social_label TEXT DEFAULT 'Message me',
  social_link TEXT,
  theme TEXT NOT NULL DEFAULT 'romantic',
  sender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.valentine_pages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read pages (public links)
CREATE POLICY "Anyone can view valentine pages"
ON public.valentine_pages FOR SELECT
USING (true);

-- Allow anyone to create pages (no auth required for MVP)
CREATE POLICY "Anyone can create valentine pages"
ON public.valentine_pages FOR INSERT
WITH CHECK (true);

-- Create the yes_events table
CREATE TABLE public.yes_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL REFERENCES public.valentine_pages(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  screenshot_url TEXT,
  UNIQUE(page_id) -- Only one YES per page (first wins)
);

-- Enable RLS
ALTER TABLE public.yes_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read yes events
CREATE POLICY "Anyone can view yes events"
ON public.yes_events FOR SELECT
USING (true);

-- Allow anyone to create yes events (first one wins due to unique constraint)
CREATE POLICY "Anyone can create yes events"
ON public.yes_events FOR INSERT
WITH CHECK (true);
