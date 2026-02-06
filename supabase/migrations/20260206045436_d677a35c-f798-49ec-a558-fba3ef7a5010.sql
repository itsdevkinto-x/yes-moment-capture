-- Add creator_email column for notifications
ALTER TABLE public.valentine_pages 
ADD COLUMN IF NOT EXISTS creator_email text,
ADD COLUMN IF NOT EXISTS decoration_type text NOT NULL DEFAULT 'hearts',
ADD COLUMN IF NOT EXISTS custom_decoration_url text;