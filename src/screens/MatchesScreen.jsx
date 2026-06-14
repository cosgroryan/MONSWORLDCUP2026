import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GRP_ACCENT, GRP_TEXT } from '../constants/data';
import TeamBadge from '../components/TeamBadge';

const GROUPS = ['all', 'A','B','C','D','E','F','G','H','I','J','K','L'];

function MatchCard({ match, people, onScoreChange }) {
  const [hv, setHv] = useState(match.hg !== null ? String(match.hg) : '');
  const [av, setAv] = useState(match.ag !== null ? String(match.ag) : '');

  const homeOwners = people.filter(p => (p.teams || []).includes(match.home));
  const awayOwners = people.filter(p => (p.teams || []).includes(match.away));
  const hasResult = match.hg !== null && match.ag !== null;
  const homeWin = hasResult && match.hg > match.ag;
  const awayWin = hasResult && match.ag > match.hg;

  const commit = (newHv, newAv) => {
    const h = newHv === '' ? null : parseInt(newHv, 10);
    const a = newAv === '' ? null : parseInt(newAv, 10);
    if (newHv !== '' && isNaN(h)) return;
    if (newAv !== '' && isNaN(a)) return;
    onScoreChange(match.id, h, a);
  };

  // Keep inputs in sync when realtime pushes an update (but don't override while typing)
  const syncedHg = match.hg !== null ? String(match.hg) : '';
  const syncedAg = match.ag !== null ? String(match.ag) : '';
  if (hv !== syncedHg && hv === (match.hg !== null ? String(match.hg) : '')) setHv(syncedHg);
  if (av !== syncedAg && av === (match.ag !== null ? String(match.ag) : '')) setAv(syncedAg);

  return (
    <div className="mcard">
      <div className={`mbar gc-${match.group}`}>Group {match.group}</div>
      <div className="minner">
        <div>
          <div className={`mteam h${homeWin ? ' win' : ''}`}>{match.home}</div>
          <div className="mown h">
            {homeOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
          </div>
        </div>
        <div className="score-wrap">
          <input type="number" min="0" max="20" className="si"
            value={hv} onChange={e => setHv(e.target.value)} onBlur={() => commit(hv, av)} placeholder="—" />
          <span className="ssep">–</span>
          <input type="number" min="0" max="20" className="si"
            value={av} onChange={e => setAv(e.target.value)} onBlur={() => commit(hv, av)} placeholder="—" />
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
  const { people, matches, updateMatchScore, syncStatus, manualSync } = useApp();
  const [groupFilter, setGroupFilter] = useState('all');

  const filtered = groupFilter === 'all' ? matches : matches.filter(m => m.group === groupFilter);
  const byGroup = {};
  filtered.forEach(m => { if (!byGroup[m.group]) byGroup[m.group] = []; byGroup[m.group].push(m); });

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
      {Object.entries(byGroup).map(([g, ms]) =>
        ms.map(m => <MatchCard key={m.id} match={m} people={people} onScoreChange={updateMatchScore} />)
      )}
    </div>
  );
}
