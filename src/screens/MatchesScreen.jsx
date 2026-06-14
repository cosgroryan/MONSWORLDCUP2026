import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SCHEDULE } from '../constants/data';
import TeamBadge from '../components/TeamBadge';

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

function MatchCard({ match, people, schedInfo }) {
  const homeOwners = people.filter(p => (p.teams || []).includes(match.home));
  const awayOwners = people.filter(p => (p.teams || []).includes(match.away));
  const hasResult = match.hg !== null && match.ag !== null;
  const homeWin = hasResult && match.hg > match.ag;
  const awayWin = hasResult && match.ag > match.hg;

  return (
    <div className="mcard">
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
          <div className={`mteam h${homeWin ? ' win' : ''}`}>{match.home}</div>
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
          <div className={`mteam a${awayWin ? ' win' : ''}`}>{match.away}</div>
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

  const sorted = useMemo(() => {
    const base = groupFilter === 'all' ? matches : matches.filter(m => m.group === groupFilter);
    return [...base].sort((a, b) => {
      const aPlayed = a.hg !== null && a.ag !== null;
      const bPlayed = b.hg !== null && b.ag !== null;
      const aKey = SCHED_LOOKUP[`${a.home}|${a.away}`]?.sortKey ?? 9999;
      const bKey = SCHED_LOOKUP[`${b.home}|${b.away}`]?.sortKey ?? 9999;

      // Completed first, then upcoming
      if (aPlayed !== bPlayed) return aPlayed ? -1 : 1;
      // Within completed: most recent first (desc)
      if (aPlayed) return bKey - aKey;
      // Within upcoming: soonest first (asc)
      return aKey - bKey;
    });
  }, [matches, groupFilter]);

  return (
    <div className="page">
      <div className="filter-bar">
        {GROUPS.map(g => (
          <button key={g} className={`fbtn${groupFilter === g ? ' on' : ''}`} onClick={() => setGroupFilter(g)}>
            {g === 'all' ? 'All groups' : `Group ${g}`}
          </button>
        ))}
        <button className="sync-btn" onClick={manualSync} disabled={syncStatus.syncing} style={{ marginLeft: 'auto' }}>
          {syncStatus.syncing ? '⟳ Syncing…' : '⟳ Sync scores'}
        </button>
      </div>
      {sorted.map(m => (
        <MatchCard
          key={m.id}
          match={m}
          people={people}
          schedInfo={SCHED_LOOKUP[`${m.home}|${m.away}`]}
        />
      ))}
    </div>
  );
}
