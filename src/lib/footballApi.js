import { supabase } from './supabase';

// Dev: Vite proxies /football-api → api.football-data.org (key injected server-side)
// Prod: /api/football → Vercel serverless function → api.football-data.org (key stays server-side)
const BASE_URL = import.meta.env.DEV ? '/football-api' : '/api/football';
const COMPETITION_ID = 2000; // FIFA World Cup (WC)

function apiFetch(path) {
  return fetch(`${BASE_URL}${path}`);
}

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
  const response = await apiFetch(`/competitions/${COMPETITION_ID}/matches?status=FINISHED`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`football-data.org ${response.status}: ${text}`);
  }

  const json = await response.json();
  const finished = (json.matches || []).filter(
    (m) => m.score?.fullTime?.home !== null && m.score?.fullTime?.away !== null
  );

  if (finished.length === 0) return { updated: 0, checked: 0 };

  const [
    { data: ourMatches,   error: mErr },
    { data: ourKOMatches, error: kErr },
  ] = await Promise.all([
    supabase.from('matches').select('id, home, away, hg, ag'),
    supabase.from('ko_matches').select('id, home, away, hg, ag').not('home', 'is', null),
  ]);
  if (mErr) throw mErr;
  if (kErr) throw kErr;

  const updates   = [];
  const koUpdates = [];

  for (const apiM of finished) {
    const apiHome = normalise(apiM.homeTeam?.name || '');
    const apiAway = normalise(apiM.awayTeam?.name || '');
    const hg = apiM.score.fullTime.home;
    const ag = apiM.score.fullTime.away;

    const m = (ourMatches || []).find((r) => r.home === apiHome && r.away === apiAway);
    if (m && (m.hg !== hg || m.ag !== ag)) updates.push({ id: m.id, hg, ag });

    const k = (ourKOMatches || []).find((r) => r.home === apiHome && r.away === apiAway);
    if (k && (k.hg !== hg || k.ag !== ag)) koUpdates.push({ id: k.id, hg, ag });
  }

  await Promise.all([
    ...updates.map(u => supabase.from('matches').update({ hg: u.hg, ag: u.ag }).eq('id', u.id)),
    ...koUpdates.map(u => supabase.from('ko_matches').update({ hg: u.hg, ag: u.ag }).eq('id', u.id)),
  ]);

  return { updated: updates.length + koUpdates.length, checked: finished.length };
}

// Returns matches currently IN_PLAY or at PAUSED (halftime). Normalises team names.
export async function fetchLiveMatches() {
  try {
    const res = await apiFetch(`/competitions/${COMPETITION_ID}/matches?status=IN_PLAY%2CPAUSED`);
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
    const res = await apiFetch(`/competitions/${COMPETITION_ID}/matches`);
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

  const res = await apiFetch(`/matches/${apiId}`);
  if (!res.ok) throw new Error(`football-data.org ${res.status}`);
  return await res.json();
}
