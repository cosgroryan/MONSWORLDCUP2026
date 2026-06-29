// One-time script: fetch real WC2026 knockout fixtures from football-data.org
// and upsert teams + scores into the ko_matches Supabase table.
// Run with: node scripts/sync-ko-fixtures.mjs

const FOOTBALL_API_KEY = '9fbeb0d053204e81818f5a5b0ec095b0';
const SUPABASE_URL     = 'https://fsstmpqgnrbbvjqjkrbt.supabase.co';
const SUPABASE_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzc3RtcHFnbnJiYnZqcWprcmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMzA3NjUsImV4cCI6MjA5NjgwNjc2NX0.3yO4Uxx4V0pXNLvqVJpwX8ce2Fh4GRD2JWWxlR3G2S4';
const COMPETITION_ID   = 2000; // FIFA World Cup

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

// Map football-data.org stage names → our round keys
const STAGE_MAP = {
  'LAST_32':       'r32',
  'LAST_16':       'r16',
  'QUARTER_FINALS':'qf',
  'SEMI_FINALS':   'sf',
  'FINAL':         'final',
};

async function apiFetch(path) {
  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': FOOTBALL_API_KEY },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`football-data.org ${res.status}: ${txt}`);
  }
  return res.json();
}

async function supabaseQuery(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

async function main() {
  console.log('Fetching WC2026 matches from football-data.org...');
  const json = await apiFetch(`/competitions/${COMPETITION_ID}/matches`);
  const all = json.matches || [];

  // Only knockout stages
  const koMatches = all.filter(m => STAGE_MAP[m.stage]);
  console.log(`Found ${koMatches.length} knockout matches from API`);

  if (koMatches.length === 0) {
    console.log('No knockout matches found yet — group stage may still be running.');
    return;
  }

  // Load current ko_matches from Supabase
  const existing = await supabaseQuery('GET', '/ko_matches?select=*&order=match_order');
  console.log(`${existing.length} rows currently in ko_matches table`);

  // Group API matches by stage, sorted by utcDate
  const byRound = {};
  for (const m of koMatches) {
    const round = STAGE_MAP[m.stage];
    if (!byRound[round]) byRound[round] = [];
    byRound[round].push(m);
  }
  for (const r of Object.keys(byRound)) {
    byRound[r].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  }

  // Convert UTC ISO date string → { date_label: '1 Jul', nzst: '07:00' } in NZST (UTC+12)
function toNZST(utcDate) {
  if (!utcDate) return { date_label: 'TBD', nzst: 'TBD' };
  const d = new Date(new Date(utcDate).getTime() + 12 * 60 * 60 * 1000);
  const day   = d.getUTCDate();
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()];
  const hh    = String(d.getUTCHours()).padStart(2, '0');
  const mm    = String(d.getUTCMinutes()).padStart(2, '0');
  return { date_label: `${day} ${month}`, nzst: `${hh}:${mm}` };
}

  // Match API fixtures to our DB rows by round + order
  const updates = [];
  for (const [round, apiMs] of Object.entries(byRound)) {
    const dbRows = existing.filter(r => r.round === round);
    apiMs.forEach((apiM, i) => {
      const row = dbRows[i];
      if (!row) {
        console.warn(`  No DB row for ${round} match ${i + 1} — skipping`);
        return;
      }
      const home = apiM.homeTeam?.name ? normalise(apiM.homeTeam.name) : null;
      const away = apiM.awayTeam?.name ? normalise(apiM.awayTeam.name) : null;
      const hg   = apiM.score?.fullTime?.home ?? null;
      const ag   = apiM.score?.fullTime?.away ?? null;
      const { date_label, nzst } = toNZST(apiM.utcDate);

      const changed = row.home !== home || row.away !== away || row.hg !== hg || row.ag !== ag
                   || row.date_label !== date_label || row.nzst !== nzst;
      if (changed) {
        updates.push({ id: row.id, home, away, hg, ag, date_label, nzst });
        console.log(`  ${row.id}: ${home || 'TBD'} vs ${away || 'TBD'}  ${date_label} ${nzst} NZST  (${hg ?? '-'}-${ag ?? '-'})`);
      } else {
        console.log(`  ${row.id}: ${home || 'TBD'} vs ${away || 'TBD'} — no change`);
      }
    });
  }

  if (updates.length === 0) {
    console.log('\nAll rows already up to date.');
    return;
  }

  console.log(`\nApplying ${updates.length} updates...`);
  for (const u of updates) {
    await supabaseQuery('PATCH', `/ko_matches?id=eq.${u.id}`, {
      home:       u.home,
      away:       u.away,
      hg:         u.hg,
      ag:         u.ag,
      date_label: u.date_label,
      nzst:       u.nzst,
    });
    console.log(`  ✓ ${u.id}`);
  }

  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
