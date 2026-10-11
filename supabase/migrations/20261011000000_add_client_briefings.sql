-- ==============================================================================
-- Migration: Add Client Briefings Table for Interactive Roadmap / Web Form
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.client_briefings (
  id TEXT PRIMARY KEY DEFAULT 'qls_main_briefing',
  client_name TEXT,
  percent_validated INTEGER DEFAULT 0,
  total_checked INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  feedbacks JSONB DEFAULT '{}'::jsonb,
  app_data JSONB NOT NULL,
  last_updated_by TEXT DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant permissions for Data API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.client_briefings TO anon, authenticated, service_role;

-- Row Level Security
ALTER TABLE public.client_briefings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon and auth full access to client_briefings" ON public.client_briefings;
CREATE POLICY "Allow anon and auth full access to client_briefings" ON public.client_briefings
  FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- Enable Realtime for client_briefings
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_briefings;
