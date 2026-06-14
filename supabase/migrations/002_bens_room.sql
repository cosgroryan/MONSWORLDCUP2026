-- Ben's match predictions
CREATE TABLE IF NOT EXISTS public.bens_predictions (
  match_id   text PRIMARY KEY,
  hg         integer,
  ag         integer,
  updated_at timestamptz DEFAULT now()
);

-- Ben's scrapbook entries
CREATE TABLE IF NOT EXISTS public.bens_notes (
  id         bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  mood       text,
  match_id   text REFERENCES public.matches(id) ON DELETE SET NULL,
  body       text NOT NULL
);

ALTER TABLE public.bens_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bens_notes       ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bens_predictions' AND policyname='public_all_bens_predictions') THEN
    CREATE POLICY "public_all_bens_predictions" ON public.bens_predictions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bens_notes' AND policyname='public_all_bens_notes') THEN
    CREATE POLICY "public_all_bens_notes" ON public.bens_notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='bens_predictions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bens_predictions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='bens_notes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bens_notes;
  END IF;
END $$;
