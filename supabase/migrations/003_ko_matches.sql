-- Knockout stage matches
CREATE TABLE IF NOT EXISTS public.ko_matches (
  id          text PRIMARY KEY,
  round       text NOT NULL,
  home        text,           -- null if TBD
  away        text,           -- null if TBD
  hg          integer DEFAULT NULL,
  ag          integer DEFAULT NULL,
  venue       text NOT NULL DEFAULT '',
  date_label  text NOT NULL DEFAULT '',
  nzst        text NOT NULL DEFAULT '',
  match_order integer NOT NULL DEFAULT 0
);

-- Seed R32 fixtures (actual WC2026 draw) and placeholder slots for later rounds
INSERT INTO public.ko_matches (id, round, home, away, venue, date_label, nzst, match_order) VALUES
  -- Round of 32
  ('r32-1',  'r32', 'Argentina',     'Morocco',      'MetLife Stadium, NJ',          '1 Jul',  '07:00', 1),
  ('r32-2',  'r32', 'France',        'Colombia',     'Rose Bowl, LA',                '1 Jul',  '10:00', 2),
  ('r32-3',  'r32', 'Brazil',        'Croatia',      'Allegiant Stadium, LV',        '2 Jul',  '07:00', 3),
  ('r32-4',  'r32', 'Germany',       'Japan',        'AT&T Stadium, Dallas',         '2 Jul',  '10:00', 4),
  ('r32-5',  'r32', 'Spain',         'Australia',    'Hard Rock Stadium, Miami',     '3 Jul',  '07:00', 5),
  ('r32-6',  'r32', 'Portugal',      'Ecuador',      'SoFi Stadium, LA',             '3 Jul',  '10:00', 6),
  ('r32-7',  'r32', 'England',       'Sweden',       'Lumen Field, Seattle',         '4 Jul',  '07:00', 7),
  ('r32-8',  'r32', 'Netherlands',   'Mexico',       'BC Place, Vancouver',          '4 Jul',  '10:00', 8),
  ('r32-9',  'r32', 'Belgium',       'Uruguay',      'NRG Stadium, Houston',         '5 Jul',  '07:00', 9),
  ('r32-10', 'r32', 'United States', 'Norway',       'Gillette Stadium, Boston',     '5 Jul',  '10:00', 10),
  ('r32-11', 'r32', 'South Korea',   'Tunisia',      'Lincoln Financial, Philly',    '6 Jul',  '07:00', 11),
  ('r32-12', 'r32', 'Switzerland',   'Senegal',      'Arrowhead Stadium, KC',        '6 Jul',  '10:00', 12),
  ('r32-13', 'r32', 'Iran',          'Panama',       'Mercedes-Benz Stadium, ATL',   '7 Jul',  '07:00', 13),
  ('r32-14', 'r32', 'Canada',        'Ghana',        'BMO Field, Toronto',           '7 Jul',  '10:00', 14),
  ('r32-15', 'r32', 'Austria',       'Ivory Coast',  'Estadio Azteca, Mexico City',  '8 Jul',  '07:00', 15),
  ('r32-16', 'r32', 'New Zealand',   'Türkiye',      'Estadio BBVA, Monterrey',      '8 Jul',  '10:00', 16),
  -- Round of 16 (teams TBD until R32 finishes)
  ('r16-1',  'r16', NULL, NULL, 'MetLife Stadium, NJ',   '9 Jul',  '07:00', 1),
  ('r16-2',  'r16', NULL, NULL, 'TBD',                   '9 Jul',  '10:00', 2),
  ('r16-3',  'r16', NULL, NULL, 'TBD',                   '10 Jul', '07:00', 3),
  ('r16-4',  'r16', NULL, NULL, 'TBD',                   '10 Jul', '10:00', 4),
  ('r16-5',  'r16', NULL, NULL, 'TBD',                   '11 Jul', '07:00', 5),
  ('r16-6',  'r16', NULL, NULL, 'TBD',                   '11 Jul', '10:00', 6),
  ('r16-7',  'r16', NULL, NULL, 'TBD',                   '12 Jul', '07:00', 7),
  ('r16-8',  'r16', NULL, NULL, 'TBD',                   '12 Jul', '10:00', 8),
  -- Quarter Finals
  ('qf-1',   'qf',  NULL, NULL, 'TBD',                   '14 Jul', '07:00', 1),
  ('qf-2',   'qf',  NULL, NULL, 'TBD',                   '14 Jul', '10:00', 2),
  ('qf-3',   'qf',  NULL, NULL, 'TBD',                   '15 Jul', '07:00', 3),
  ('qf-4',   'qf',  NULL, NULL, 'TBD',                   '15 Jul', '10:00', 4),
  -- Semi Finals
  ('sf-1',   'sf',  NULL, NULL, 'MetLife Stadium, NJ',   '19 Jul', '07:00', 1),
  ('sf-2',   'sf',  NULL, NULL, 'SoFi Stadium, LA',      '20 Jul', '07:00', 2),
  -- Final
  ('final-1','final',NULL, NULL, 'MetLife Stadium, NJ',  '27 Jul', '07:00', 1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.ko_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ko_matches' AND policyname='public_all_ko_matches') THEN
    CREATE POLICY "public_all_ko_matches" ON public.ko_matches FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='ko_matches') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ko_matches;
  END IF;
END $$;
