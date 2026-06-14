import { supabase } from './supabase';

// In dev: Vite proxies /football-api → api.football-data.org (injects API key server-side, no CORS)
// In prod: deploy behind a server/CDN that has the same /football-api proxy configured
const BASE_URL = '/football-api';
const COMPETITION_ID = 2000; // FIFA World Cup (WC)

const TEAM_NAME_MAP = {
  'Turkey': 'Türkiye',
  'Curacao': 'Curaçao',
  "Côte d'Ivoire": 'Ivory Coast',
  'Congo Dr': 'DR Congo',
  'Democratic Republic of Congo': 'DR Congo',
  'Congo, DR': 'DR Congo',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina',
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Czech Republic': 'Czechia',
  'Cape Verde Islands': 'Cape Verde',
  'Korea Republic': 'South Korea',
  'Republic of Korea': 'South Korea',
  'USA': 'United States',
};

function normalise(name) {
  return TEAM_NAME_MAP[name] || name;
}

export async function syncMatchScores() {
  const response = await fetch(`${BASE_URL}/competitions/${COMPETITION_ID}/matches?status=FINISHED`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`football-data.org ${response.status}: ${text}`);
  }

  const json = await response.json();
  const finished = (json.matches || []).filter(
    (m) => m.score?.fullTime?.home !== null && m.score?.fullTime?.away !== null
  );

  if (finished.length === 0) return { updated: 0, checked: 0 };

  const { data: ourMatches, error } = await supabase.from('matches').select('id, home, away, hg, ag');
  if (error) throw error;

  const updates = [];
  for (const apiM of finished) {
    const apiHome = normalise(apiM.homeTeam?.name || '');
    const apiAway = normalise(apiM.awayTeam?.name || '');
    const hg = apiM.score.fullTime.home;
    const ag = apiM.score.fullTime.away;
    const match = ourMatches.find((m) => m.home === apiHome && m.away === apiAway);
    if (match && (match.hg !== hg || match.ag !== ag)) {
      updates.push({ id: match.id, hg, ag });
    }
  }

  for (const u of updates) {
    await supabase.from('matches').update({ hg: u.hg, ag: u.ag }).eq('id', u.id);
  }

  return { updated: updates.length, checked: finished.length };
}
