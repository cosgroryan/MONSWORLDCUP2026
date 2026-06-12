-- Mons Cup 2026 shared state: match scores, sweepers, prize specials

-- Match scores (72 group-stage fixtures; id matches app e.g. "A01")
CREATE TABLE IF NOT EXISTS public.match_scores (
  id TEXT PRIMARY KEY,
  hg INTEGER,
  ag INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sweepers / participants
CREATE TABLE IF NOT EXISTS public.people (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  teams JSONB NOT NULL DEFAULT '["", "", ""]'::jsonb,
  tier INTEGER NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prize specials (singleton row)
CREATE TABLE IF NOT EXISTS public.specials (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  champion TEXT NOT NULL DEFAULT '',
  runnerup TEXT NOT NULL DEFAULT '',
  darkhorse JSONB NOT NULL DEFAULT '{"team":"","round":""}'::jsonb,
  fastest JSONB NOT NULL DEFAULT '{"team":"","minute":""}'::jsonb,
  mostscored TEXT NOT NULL DEFAULT '',
  mostconceded TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.specials (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Row level security: public read/write for shared office pool
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "match_scores_select" ON public.match_scores FOR SELECT USING (true);
CREATE POLICY "match_scores_insert" ON public.match_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "match_scores_update" ON public.match_scores FOR UPDATE USING (true);

CREATE POLICY "people_select" ON public.people FOR SELECT USING (true);
CREATE POLICY "people_insert" ON public.people FOR INSERT WITH CHECK (true);
CREATE POLICY "people_update" ON public.people FOR UPDATE USING (true);
CREATE POLICY "people_delete" ON public.people FOR DELETE USING (true);

CREATE POLICY "specials_select" ON public.specials FOR SELECT USING (true);
CREATE POLICY "specials_insert" ON public.specials FOR INSERT WITH CHECK (true);
CREATE POLICY "specials_update" ON public.specials FOR UPDATE USING (true);

-- Realtime sync across browsers
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
ALTER PUBLICATION supabase_realtime ADD TABLE public.specials;
