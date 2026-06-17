import { supabase } from './supabase';

// In dev: Vite proxies /football-api → api.football-data.org (injects API key server-side, no CORS)
// In prod: deploy behind a server/CDN that has the same /football-api proxy configured
const BASE_URL = '/football-api';
const COMPETITION_ID = 2000; // FIFA World Cup (WC)

// Module-level cache so repeated modal opens don't re-fetch all matches
let _matchIdMap = null;
let _matchIdMapTs = 0;

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

// Returns matches currently IN_PLAY or at PAUSED (halftime). Normalises team names.
export async function fetchLiveMatches() {
  try {
    const res = await fetch(`${BASE_URL}/competitions/${COMPETITION_ID}/matches?status=IN_PLAY%2CPAUSED`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.matches || []).map(m => ({
      apiId:    m.id,
      status:   m.status,
      minute:   m.minute ?? null,
      home:     normalise(m.homeTeam?.name || ''),
      away:     normalise(m.awayTeam?.name || ''),
      hg:       m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      ag:       m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
    }));
  } catch {
    return [];
  }
}

// Fetches goals, bookings, and lineups for a single match by home/away team name.
export async function fetchMatchDetail(homeTeam, awayTeam) {
  // Build or reuse the "team pair → API id" map (5-min TTL)
  const now = Date.now();
  if (!_matchIdMap || now - _matchIdMapTs > 5 * 60 * 1000) {
    const res = await fetch(`${BASE_URL}/competitions/${COMPETITION_ID}/matches`);
    if (!res.ok) throw new Error(`football-data.org ${res.status}`);
    const json = await res.json();
    _matchIdMap = {};
    for (const m of (json.matches || [])) {
      const h = normalise(m.homeTeam?.name || '');
      const a = normalise(m.awayTeam?.name || '');
      _matchIdMap[`${h}|${a}`] = m.id;
    }
    _matchIdMapTs = now;
  }

  const apiId = _matchIdMap[`${homeTeam}|${awayTeam}`];
  if (!apiId) return null;

  const res = await fetch(`${BASE_URL}/matches/${apiId}`);
  if (!res.ok) throw new Error(`football-data.org ${res.status}`);
  return await res.json();
}
