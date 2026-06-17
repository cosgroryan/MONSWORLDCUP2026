import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SCHEDULE } from '../constants/data';
import TeamBadge from '../components/TeamBadge';
import FlagImg from '../components/FlagImg';
import { fetchMatchDetail, fetchLiveMatches } from '../lib/footballApi';

const GROUPS = ['all', 'A','B','C','D','E','F','G','H','I','J','K','L'];

// Lookup: "Home|Away" → { date, nzst, sortKey }
const MONTH_NUM = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };

function parseDateKey(dateStr) {
  if (!dateStr) return 9999;
  const [, day, mon] = dateStr.split(' '); // "Fri 12 Jun" → ["Fri","12","Jun"]
  return (MONTH_NUM[mon] || 0) * 100 + parseInt(day, 10);
}

const SCHED_LOOKUP = {};
SCHEDULE.forEach(s => {
  SCHED_LOOKUP[`${s.home}|${s.away}`] = {
    date: s.date,
    nzst: s.nzst,
    sortKey: parseDateKey(s.date),
  };
});

// ── Match Detail Modal ────────────────────────────────────────────────────────
function MatchDetailModal({ match, people, schedInfo, onClose }) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState(null);
  const hasResult = match.hg !== null && match.ag !== null;
  const homeWin   = hasResult && match.hg > match.ag;
  const awayWin   = hasResult && match.ag > match.hg;
  const homeOwners = people.filter(p => (p.teams || []).includes(match.home));
  const awayOwners = people.filter(p => (p.teams || []).includes(match.away));

  useEffect(() => {
    fetchMatchDetail(match.home, match.away)
      .then(d => { setDetail(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, [match.home, match.away]);

  // Split goals by team
  const homeGoals = (detail?.goals || []).filter(g => {
    const t = normaliseTeam(g.team?.name || g.team?.shortName || '');
    return t === match.home || g.homeScore !== undefined && g.awayScore === undefined;
  });
  const awayGoals = (detail?.goals || []).filter(g => {
    const t = normaliseTeam(g.team?.name || g.team?.shortName || '');
    return t === match.away;
  });
  // Fallback: if team field absent, split by goal index vs running score
  const allGoals  = detail?.goals || [];
  const bookings  = detail?.bookings || [];

  // Lineup helpers — maps football-data.org specific positions to 4 generic groups
  const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];
  const POS_MAP = {
    'Goalkeeper': 'Goalkeeper',
    'Left Back': 'Defender', 'Right Back': 'Defender',
    'Centre Back': 'Defender', 'Left Centre Back': 'Defender', 'Right Centre Back': 'Defender',
    'Sweeper': 'Defender', 'Defender': 'Defender',
    'Left Midfield': 'Midfielder', 'Right Midfield': 'Midfielder',
    'Defensive Midfield': 'Midfielder', 'Central Midfield': 'Midfielder',
    'Attacking Midfield': 'Midfielder', 'Midfielder': 'Midfielder',
    'Left Wing': 'Attacker', 'Right Wing': 'Attacker',
    'Left Winger': 'Attacker', 'Right Winger': 'Attacker',
    'Centre Forward': 'Attacker', 'Second Striker': 'Attacker', 'Attacker': 'Attacker',
  };
  function groupByPosition(players) {
    const g = { Goalkeeper: [], Defender: [], Midfielder: [], Attacker: [], Other: [] };
    for (const p of (players || [])) {
      const bucket = POS_MAP[p.position] || 'Other';
      g[bucket].push(p);
    }
    return g;
  }
  const homeLineup = detail?.homeTeam?.lineup || [];
  const awayLineup = detail?.awayTeam?.lineup || [];

  return (
    <div className="mdm-overlay" onClick={onClose}>
      <div className="mdm-panel" onClick={e => e.stopPropagation()}>
        <button className="mdm-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className={`mbar gc-${match.group} mdm-bar`}>
          <span>Group {match.group}</span>
          {schedInfo && <span style={{ fontSize:10, fontWeight:600, opacity:.85 }}>{schedInfo.date} · {schedInfo.nzst} NZST</span>}
        </div>

        {/* Score row */}
        <div className="mdm-score-row">
          <div className="mdm-side">
            <FlagImg team={match.home} size={32} />
            <div className={`mdm-team-name${homeWin ? ' mdm-winner' : ''}`}>{match.home}</div>
            <div className="mdm-owners">
              {homeOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
            </div>
          </div>
          <div className="mdm-scorebox">
            {hasResult ? (
              <>
                <span className={homeWin ? 'mdm-score-hi' : 'mdm-score-lo'}>{match.hg}</span>
                <span className="mdm-score-dash">–</span>
                <span className={awayWin ? 'mdm-score-hi' : 'mdm-score-lo'}>{match.ag}</span>
              </>
            ) : (
              <span className="mdm-score-tbd">
                {schedInfo ? `${schedInfo.date} · ${schedInfo.nzst} NZST` : 'TBD'}
              </span>
            )}
          </div>
          <div className="mdm-side mdm-side-right">
            <FlagImg team={match.away} size={32} />
            <div className={`mdm-team-name${awayWin ? ' mdm-winner' : ''}`}>{match.away}</div>
            <div className="mdm-owners">
              {awayOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
            </div>
          </div>
        </div>

        {/* Loading / error */}
        {loading && <div className="mdm-status">Loading match details…</div>}
        {err     && <div className="mdm-status mdm-err">Could not load details</div>}

        {/* ── Completed: goals + bookings ── */}
        {!loading && !err && hasResult && detail && (
          <>
            {allGoals.length > 0 && (
              <div className="mdm-section">
                <div className="mdm-section-title">Goals</div>
                <div className="mdm-events-cols">
                  <div className="mdm-events-col">
                    {allGoals
                      .filter(g => normaliseTeam(g.team?.name) === match.home || (!g.team && homeGoals.includes(g)))
                      .map((g, i) => <GoalRow key={i} goal={g} side="home" />)}
                  </div>
                  <div className="mdm-col-divider" />
                  <div className="mdm-events-col mdm-events-col-right">
                    {allGoals
                      .filter(g => normaliseTeam(g.team?.name) === match.away)
                      .map((g, i) => <GoalRow key={i} goal={g} side="away" />)}
                  </div>
                </div>
              </div>
            )}

            {bookings.length > 0 && (
              <div className="mdm-section">
                <div className="mdm-section-title">Cards</div>
                <div className="mdm-events-cols">
                  <div className="mdm-events-col">
                    {bookings
                      .filter(b => normaliseTeam(b.team?.name) === match.home)
                      .map((b, i) => <BookingRow key={i} booking={b} side="home" />)}
                  </div>
                  <div className="mdm-col-divider" />
                  <div className="mdm-events-col mdm-events-col-right">
                    {bookings
                      .filter(b => normaliseTeam(b.team?.name) === match.away)
                      .map((b, i) => <BookingRow key={i} booking={b} side="away" />)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Upcoming: lineups ── */}
        {!loading && !err && !hasResult && detail && (homeLineup.length > 0 || awayLineup.length > 0) && (
          <div className="mdm-section">
            <div className="mdm-section-title">Line-ups</div>
            <div className="mdm-lineup-cols">
              <LineupCol
                players={homeLineup}
                formation={detail?.homeTeam?.formation}
                groupByPosition={groupByPosition}
                positionOrder={POSITION_ORDER}
                side="home"
              />
              <LineupCol
                players={awayLineup}
                formation={detail?.awayTeam?.formation}
                groupByPosition={groupByPosition}
                positionOrder={POSITION_ORDER}
                side="away"
              />
            </div>
          </div>
        )}

        {!loading && !err && !hasResult && detail && homeLineup.length === 0 && (
          <div className="mdm-status">Line-ups not yet announced</div>
        )}
      </div>
    </div>
  );
}

const TEAM_NAME_MAP_LOCAL = {
  'Turkey': 'Türkiye', 'Curacao': 'Curaçao', "Côte d'Ivoire": 'Ivory Coast',
  'Congo Dr': 'DR Congo', 'Democratic Republic of Congo': 'DR Congo',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina', 'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Czech Republic': 'Czechia', 'Cape Verde Islands': 'Cape Verde',
  'Korea Republic': 'South Korea', 'Republic of Korea': 'South Korea', 'USA': 'United States',
};
function normaliseTeam(name) { return TEAM_NAME_MAP_LOCAL[name] || name || ''; }

function GoalRow({ goal, side }) {
  const isOG  = goal.type === 'OWN_GOAL';
  const isPen = goal.type === 'PENALTY';
  return (
    <div className={`mdm-event-row${side === 'away' ? ' mdm-event-row-right' : ''}`}>
      <span className="mdm-event-min">{goal.minute}'</span>
      <span className="mdm-event-icon">⚽</span>
      <span className="mdm-event-name">
        {goal.scorer?.name || '—'}
        {isOG  && <span className="mdm-event-tag mdm-og">OG</span>}
        {isPen && <span className="mdm-event-tag mdm-pen">P</span>}
        {goal.assist?.name && <span className="mdm-assist"> ({goal.assist.name})</span>}
      </span>
    </div>
  );
}

function BookingRow({ booking, side }) {
  const isRed   = booking.card === 'RED_CARD';
  const isYR    = booking.card === 'YELLOW_RED_CARD';
  return (
    <div className={`mdm-event-row${side === 'away' ? ' mdm-event-row-right' : ''}`}>
      <span className="mdm-event-min">{booking.minute}'</span>
      <span className={`mdm-card-sq${isRed || isYR ? ' mdm-card-red' : ' mdm-card-yellow'}`} />
      <span className="mdm-event-name">{booking.player?.name || '—'}</span>
    </div>
  );
}

function LineupCol({ players, formation, groupByPosition, positionOrder, side }) {
  const groups = groupByPosition(players);
  const allBuckets = [...positionOrder, 'Other'];
  return (
    <div className={`mdm-lineup-col${side === 'away' ? ' mdm-lineup-col-right' : ''}`}>
      {formation && <div className="mdm-formation">{formation}</div>}
      {allBuckets.map(pos => groups[pos]?.length > 0 ? (
        <div key={pos} className="mdm-pos-group">
          <div className="mdm-pos-label">
            {pos === 'Goalkeeper' ? 'GKP' : pos === 'Other' ? '—' : pos.toUpperCase().slice(0, 3)}
          </div>
          {groups[pos].map((p, i) => (
            <div key={i} className={`mdm-player${side === 'away' ? ' mdm-player-right' : ''}`}>
              <span className="mdm-shirt">{p.shirtNumber}</span>
              <span className="mdm-player-name">{p.name}</span>
            </div>
          ))}
        </div>
      ) : null)}
    </div>
  );
}

// ── Live Box Score Card ───────────────────────────────────────────────────────
function LiveMatchCard({ live, people, onOpen, detail }) {
  const homeOwners = people.filter(p => (p.teams || []).includes(live.home));
  const awayOwners = people.filter(p => (p.teams || []).includes(live.away));

  const goals    = (detail?.goals        || []).slice().sort((a, b) => a.minute - b.minute);
  const bookings = (detail?.bookings     || []).slice().sort((a, b) => a.minute - b.minute);
  const subs     = (detail?.substitutions || []).slice().sort((a, b) => a.minute - b.minute);

  const homeGoals = goals.filter(g    => normaliseTeam(g.team?.name) === live.home);
  const awayGoals = goals.filter(g    => normaliseTeam(g.team?.name) === live.away);
  const homeCards = bookings.filter(b => normaliseTeam(b.team?.name) === live.home);
  const awayCards = bookings.filter(b => normaliseTeam(b.team?.name) === live.away);
  const homeSubs  = subs.filter(s     => normaliseTeam(s.team?.name) === live.home);
  const awaySubs  = subs.filter(s     => normaliseTeam(s.team?.name) === live.away);

  const hasEvents = goals.length > 0 || bookings.length > 0 || subs.length > 0;

  return (
    <div className="live-card" onClick={() => onOpen(live)}>
      <div className="live-card-header">
        <span className="live-badge"><span className="live-dot" />{live.status === 'PAUSED' ? 'HALF TIME' : 'LIVE'}</span>
        <span className="live-minute">{live.status === 'PAUSED' ? 'HT' : live.minute != null ? `${live.minute}'` : ''}</span>
      </div>

      <div className="live-card-body">
        <div className="live-team">
          <FlagImg team={live.home} size={28} />
          <span className="live-team-name">{live.home}</span>
          <div className="live-owners">
            {homeOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
          </div>
        </div>
        <div className="live-score">
          <span className="live-score-num">{live.hg ?? '—'}</span>
          <span className="live-score-dash">–</span>
          <span className="live-score-num">{live.ag ?? '—'}</span>
        </div>
        <div className="live-team live-team-right">
          <FlagImg team={live.away} size={28} />
          <span className="live-team-name">{live.away}</span>
          <div className="live-owners live-owners-right">
            {awayOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
          </div>
        </div>
      </div>

      {hasEvents && (
        <div className="live-events">
          {/* Home events — left */}
          <div className="live-events-col">
            {homeGoals.map((g, i) => (
              <div key={i} className="live-ev">
                <span className="live-ev-icon">⚽</span>
                <span className="live-ev-name">{g.scorer?.name}</span>
                <span className="live-ev-min">{g.minute}'</span>
                {g.type === 'OWN_GOAL'  && <span className="live-ev-tag live-og">OG</span>}
                {g.type === 'PENALTY'   && <span className="live-ev-tag live-pen">P</span>}
              </div>
            ))}
            {homeCards.map((b, i) => (
              <div key={i} className="live-ev">
                <span className={`live-csq${b.card === 'RED_CARD' || b.card === 'YELLOW_RED_CARD' ? ' red' : ''}`} />
                <span className="live-ev-name">{b.player?.name}</span>
                <span className="live-ev-min">{b.minute}'</span>
              </div>
            ))}
            {homeSubs.map((s, i) => (
              <div key={i} className="live-ev">
                <span className="live-ev-icon live-sub-icon">⇄</span>
                <span className="live-ev-name">{s.playerOut?.name} → {s.playerIn?.name}</span>
                <span className="live-ev-min">{s.minute}'</span>
              </div>
            ))}
          </div>

          {/* Away events — right */}
          <div className="live-events-col live-events-right">
            {awayGoals.map((g, i) => (
              <div key={i} className="live-ev live-ev-r">
                {g.type === 'PENALTY'   && <span className="live-ev-tag live-pen">P</span>}
                {g.type === 'OWN_GOAL'  && <span className="live-ev-tag live-og">OG</span>}
                <span className="live-ev-min">{g.minute}'</span>
                <span className="live-ev-name">{g.scorer?.name}</span>
                <span className="live-ev-icon">⚽</span>
              </div>
            ))}
            {awayCards.map((b, i) => (
              <div key={i} className="live-ev live-ev-r">
                <span className="live-ev-min">{b.minute}'</span>
                <span className="live-ev-name">{b.player?.name}</span>
                <span className={`live-csq${b.card === 'RED_CARD' || b.card === 'YELLOW_RED_CARD' ? ' red' : ''}`} />
              </div>
            ))}
            {awaySubs.map((s, i) => (
              <div key={i} className="live-ev live-ev-r">
                <span className="live-ev-min">{s.minute}'</span>
                <span className="live-ev-name">{s.playerOut?.name} → {s.playerIn?.name}</span>
                <span className="live-ev-icon live-sub-icon">⇄</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Match Card (clickable) ─────────────────────────────────────────────────────
function MatchCard({ match, people, schedInfo, onOpen }) {
  const homeOwners = people.filter(p => (p.teams || []).includes(match.home));
  const awayOwners = people.filter(p => (p.teams || []).includes(match.away));
  const hasResult = match.hg !== null && match.ag !== null;
  const homeWin = hasResult && match.hg > match.ag;
  const awayWin = hasResult && match.ag > match.hg;

  return (
    <div className="mcard mcard-clickable" onClick={() => onOpen(match)}>
      <div className={`mbar gc-${match.group}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Group {match.group}</span>
        {schedInfo && (
          <span style={{ fontWeight: 600, opacity: 0.85, fontSize: 10 }}>
            {schedInfo.date} · {schedInfo.nzst} NZST
          </span>
        )}
      </div>
      <div className="minner">
        <div>
          <div className={`mteam h${homeWin ? ' win' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FlagImg team={match.home} size={16} />{match.home}</div>
          <div className="mown h">
            {homeOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
          </div>
        </div>
        <div className="score-wrap">
          <div className="si" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
            {hasResult ? match.hg : '—'}
          </div>
          <span className="ssep">–</span>
          <div className="si" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
            {hasResult ? match.ag : '—'}
          </div>
        </div>
        <div>
          <div className={`mteam a${awayWin ? ' win' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>{match.away}<FlagImg team={match.away} size={16} /></div>
          <div className="mown a">
            {awayOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchesScreen() {
  const { people, matches, syncStatus, manualSync } = useApp();
  const [groupFilter, setGroupFilter] = useState('all');
  const [openMatch, setOpenMatch]     = useState(null);
  const [liveMatches, setLiveMatches]   = useState([]);
  const [liveDetails, setLiveDetails]   = useState({}); // "home|away" → match detail

  // Poll live matches every 60s; fetch detail for each live match
  useEffect(() => {
    let active = true;
    const poll = async () => {
      const data = await fetchLiveMatches();
      if (!active) return;
      setLiveMatches(data);
      if (data.length === 0) return;
      const updates = {};
      await Promise.all(data.map(async (m) => {
        try {
          const d = await fetchMatchDetail(m.home, m.away);
          if (d) updates[`${m.home}|${m.away}`] = d;
        } catch { /* ignore individual failures */ }
      }));
      if (active) setLiveDetails(prev => ({ ...prev, ...updates }));
    };
    poll();
    const id = setInterval(poll, 60_000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const liveKeys = useMemo(
    () => new Set(liveMatches.map(m => `${m.home}|${m.away}`)),
    [liveMatches]
  );

  const { completed, upcoming } = useMemo(() => {
    const base = groupFilter === 'all' ? matches : matches.filter(m => m.group === groupFilter);
    // Exclude any that are currently live (will show in live section)
    const filtered = base.filter(m => !liveKeys.has(`${m.home}|${m.away}`));
    const comp = filtered
      .filter(m => m.hg !== null && m.ag !== null)
      .sort((a, b) => {
        const aKey = SCHED_LOOKUP[`${a.home}|${a.away}`]?.sortKey ?? 9999;
        const bKey = SCHED_LOOKUP[`${b.home}|${b.away}`]?.sortKey ?? 9999;
        return bKey - aKey; // most recent first
      });
    const up = filtered
      .filter(m => m.hg === null || m.ag === null)
      .sort((a, b) => {
        const aKey = SCHED_LOOKUP[`${a.home}|${a.away}`]?.sortKey ?? 9999;
        const bKey = SCHED_LOOKUP[`${b.home}|${b.away}`]?.sortKey ?? 9999;
        return aKey - bKey; // soonest first
      });
    return { completed: comp, upcoming: up };
  }, [matches, groupFilter, liveKeys]);

  // A live card opens with a synthetic match object so the detail modal works
  const openLive = (live) => {
    const supaMatch = matches.find(m => m.home === live.home && m.away === live.away);
    setOpenMatch(supaMatch || { home: live.home, away: live.away, hg: live.hg, ag: live.ag, group: '?' });
  };

  return (
    <div className="page">
      {openMatch && (
        <MatchDetailModal
          match={openMatch}
          people={people}
          schedInfo={SCHED_LOOKUP[`${openMatch.home}|${openMatch.away}`]}
          onClose={() => setOpenMatch(null)}
        />
      )}

      <div className="filter-bar">
        {GROUPS.map(g => (
          <button key={g} className={`fbtn${groupFilter === g ? ' on' : ''}`} onClick={() => setGroupFilter(g)}>
            {g === 'all' ? 'All groups' : `Group ${g}`}
          </button>
        ))}
      </div>

      {/* ── Live now ── */}
      {liveMatches.length > 0 && (
        <div className="matches-section">
          <div className="matches-section-label matches-section-live">Live Now</div>
          {liveMatches.map(m => (
            <LiveMatchCard
              key={`${m.home}|${m.away}`}
              live={m}
              people={people}
              onOpen={openLive}
              detail={liveDetails[`${m.home}|${m.away}`]}
            />
          ))}
        </div>
      )}

      {/* ── Completed ── */}
      {completed.length > 0 && (
        <div className={`matches-section${liveMatches.length > 0 ? ' matches-section-gap' : ''}`}>
          {liveMatches.length > 0 && <div className="matches-section-label">Completed</div>}
          {completed.map(m => (
            <MatchCard key={m.id} match={m} people={people}
              schedInfo={SCHED_LOOKUP[`${m.home}|${m.away}`]} onOpen={setOpenMatch} />
          ))}
        </div>
      )}

      {/* ── Upcoming ── */}
      {upcoming.length > 0 && (
        <div className={`matches-section${(liveMatches.length > 0 || completed.length > 0) ? ' matches-section-gap' : ''}`}>
          {(liveMatches.length > 0 || completed.length > 0) && <div className="matches-section-label">Upcoming</div>}
          {upcoming.map(m => (
            <MatchCard key={m.id} match={m} people={people}
              schedInfo={SCHED_LOOKUP[`${m.home}|${m.away}`]} onOpen={setOpenMatch} />
          ))}
        </div>
      )}
    </div>
  );
}
