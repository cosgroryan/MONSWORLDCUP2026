import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { cp, TMS } from '../constants/data';
import Avatar from '../components/Avatar';

function PersonCard({ person, idx, onSave, onRemove }) {
  const c = cp(idx);
  const [name, setName] = useState(person.name || '');
  const [teams, setTeams] = useState([
    (person.teams || [])[0] || '',
    (person.teams || [])[1] || '',
    (person.teams || [])[2] || '',
  ]);
  const [tier, setTier] = useState(person.tier || 3);
  const [dirty, setDirty] = useState(false);

  const setTeamAt = (i, val) => {
    const next = [...teams]; next[i] = val; setTeams(next); setDirty(true);
  };

  return (
    <div className="pcard" style={{ borderColor: c.bd }}>
      <div className="pcard-top">
        <Avatar name={name || person.name} idx={idx} size={30} fontSize={10} />
        <input
          className="ni" placeholder="Name" value={name}
          onChange={e => { setName(e.target.value); setDirty(true); }}
        />
        <div className="tier-row">
          {[1, 2, 3].map(t => (
            <button
              key={t}
              className={`tier-btn${tier === t ? ' on' : ''}`}
              style={tier === t ? { background: c.av, borderColor: c.av } : {}}
              onClick={() => { setTier(t); setDirty(true); }}
            >
              T{t}
            </button>
          ))}
        </div>
        <button className="rm-btn" onClick={() => {
          if (window.confirm(`Remove ${person.name || 'this sweeper'}?`)) onRemove(person.id);
        }}>✕</button>
      </div>
      {[0, 1, 2].map(i => (
        <div key={i}>
          <div className="slbl">Team {i + 1}</div>
          <select className="tsel" value={teams[i]} onChange={e => setTeamAt(i, e.target.value)}>
            <option value="">— pick a team —</option>
            {TMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      ))}
      {dirty && (
        <button
          style={{ marginTop: 10, width: '100%', padding: '8px', border: 'none', borderRadius: 8, background: c.av, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          onClick={() => { onSave({ ...person, name, teams, tier }); setDirty(false); }}
        >
          Save changes
        </button>
      )}
    </div>
  );
}

export default function SetupScreen() {
  const { people, savePerson, removePerson } = useApp();

  return (
    <div className="page">
      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
        Each sweeper drew 3 teams across the tier system. <strong>Win = 3 pts</strong>, <strong>Draw = 1 pt</strong> per team.
        Enter results in Matches — leaderboard updates instantly. No refunds.
      </p>
      <div className="setup-grid">
        {people.map((p, i) => (
          <PersonCard key={p.id || i} person={p} idx={i} onSave={savePerson} onRemove={removePerson} />
        ))}
        {people.length < 20 && (
          <button className="add-card" onClick={() => savePerson({ name: '', teams: ['', '', ''], tier: 3 })}>
            ＋ Add sweeper
          </button>
        )}
      </div>
    </div>
  );
}
