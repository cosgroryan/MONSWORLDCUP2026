import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SCHEDULE, GRP_ACCENT, GRP_TEXT } from '../constants/data';
import TeamBadge from '../components/TeamBadge';

const GROUPS = ['all','A','B','C','D','E','F','G','H','I','J','K','L'];

const KNOCKOUT_DATES = [
  { label: 'Round of 32',        val: '28 Jun – 3 Jul' },
  { label: 'Round of 16',        val: '4 – 7 Jul' },
  { label: 'Quarterfinals',      val: '9 – 11 Jul' },
  { label: 'Semifinals',         val: '14 – 15 Jul' },
  { label: 'Bronze medal match', val: 'Sat 18 Jul' },
  { label: '🏆 Final',           val: 'Sun 19 Jul · New York/NJ', final: true },
];

export default function ScheduleScreen() {
  const { people } = useApp();
  const [grpFilter, setGrpFilter] = useState('all');

  const byDate = useMemo(() => {
    const filtered = grpFilter === 'all' ? SCHEDULE : SCHEDULE.filter(m => m.grp === grpFilter);
    const map = {};
    filtered.forEach(m => { if (!map[m.date]) map[m.date] = []; map[m.date].push(m); });
    return map;
  }, [grpFilter]);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Group Stage Fixtures</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            All times in <strong>NZST</strong> (NZ Standard Time, GMT+12) · 72 group stage matches
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {GROUPS.map(g => (
            <button key={g} className={`fbtn${grpFilter === g ? ' on' : ''}`} onClick={() => setGrpFilter(g)}>
              {g === 'all' ? 'All' : `Grp ${g}`}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(byDate).map(([date, ms]) => (
        <div key={date} className="sc-date-block">
          <div className="sc-date-label">{date}</div>
          {ms.map((m, i) => {
            const accent = GRP_ACCENT[m.grp] || '#064E3B';
            const gtxt = GRP_TEXT[m.grp] || '#A7F3D0';
            const homeOwners = people.filter(p => (p.teams || []).includes(m.home));
            const awayOwners = people.filter(p => (p.teams || []).includes(m.away));
            return (
              <div key={i} className="sc-card">
                <div className="sc-accent" style={{ background: accent }} />
                <div className="sc-time">
                  <div className="sc-time-val">{m.nzst}</div>
                  <div className="sc-time-lbl">NZST</div>
                  <div className="sc-grp-tag" style={{ background: accent, color: gtxt }}>Grp {m.grp}</div>
                </div>
                <div className="sc-home">
                  <div className="sc-team">{m.home}</div>
                  <div className="sc-owners h">
                    {homeOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
                  </div>
                </div>
                <div className="sc-vs">vs</div>
                <div className="sc-away">
                  <div className="sc-team">{m.away}</div>
                  <div className="sc-owners a">
                    {awayOwners.map(o => <TeamBadge key={o.id} name={o.name} idx={people.indexOf(o)} />)}
                  </div>
                </div>
                <div className="sc-venue">📍 {m.venue}</div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="sec-head" style={{ marginTop: 24 }}>Knockout stage dates</div>
      <div className="ko-grid">
        {KNOCKOUT_DATES.map((k, i) => (
          <div key={i} className={`ko-cell${k.final ? ' final' : ''}`}>
            <div className={`ko-label${k.final ? ' final-lbl' : ''}`}>{k.label}</div>
            <div className={`ko-val${k.final ? ' final-val' : ''}`}>{k.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
