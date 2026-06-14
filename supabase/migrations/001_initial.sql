-- People (sweepers)
CREATE TABLE IF NOT EXISTS public.people (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  teams text[] NOT NULL DEFAULT '{}',
  tier integer NOT NULL DEFAULT 3,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Matches (all 72 group stage matches + any extras)
CREATE TABLE IF NOT EXISTS public.matches (
  id text PRIMARY KEY,
  "group" text NOT NULL,
  home text NOT NULL,
  away text NOT NULL,
  hg integer DEFAULT NULL,
  ag integer DEFAULT NULL
);

-- Specials (single-row config)
CREATE TABLE IF NOT EXISTS public.specials (
  id integer PRIMARY KEY DEFAULT 1,
  champion text DEFAULT '',
  runnerup text DEFAULT '',
  darkhorse_team text DEFAULT '',
  darkhorse_round text DEFAULT '',
  fastest_team text DEFAULT '',
  fastest_minute text DEFAULT '',
  mostscored text DEFAULT '',
  mostconceded text DEFAULT ''
);

-- Seed the specials row so it always exists
INSERT INTO public.specials (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specials ENABLE ROW LEVEL SECURITY;

-- Allow full public read/write (private sweepstake, no auth needed)
CREATE POLICY "public_all_people"   ON public.people   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_matches"  ON public.matches  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_specials" ON public.specials FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime (safe: skips if already a member)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'people'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'specials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.specials;
  END IF;
END $$;
