import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { autoSpecials, sweeperFor } from '../utils/scoring';
import { TMS, cp } from '../constants/data';
import Avatar from '../components/Avatar';

const DARK_HORSE_ROUNDS = ['Group stage','Round of 32','Round of 16','Quarters','Semis','Final','Winner'];

function PrizeWinner({ team, extra, people }) {
  if (!team) return <div className="prize-winner"><div className="prize-winner-tbd">TBD</div></div>;
  const sw = sweeperFor(team, people);
  const idx = sw ? people.indexOf(sw) : -1;
  return (
    <div className="prize-winner">
      <div className="prize-winner-name">
        {sw ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Avatar name={sw.name} idx={idx} size={20} fontSize={8} />
            {sw.name}
          </span>
        ) : 'No owner'}
      </div>
      <div className="prize-winner-team">{team}{extra ? ` · ${extra}` : ''}</div>
    </div>
  );
}

export default function PrizesScreen() {
  const { people, matches, specials, updateSpecials } = useApp();
  const auto = useMemo(() => autoSpecials(matches), [matches]);
  const sp = specials;
  const pot = people.length * 5;

  const tier3teams = useMemo(() =>
    [...new Set(people.filter(p => p.tier === 3).flatMap(p => p.teams || []).filter(Boolean))],
    [people]
  );

  const [fastMin, setFastMin] = useState(sp.fastest_minute || '');
  const save = (key, val) => updateSpecials({ [key]: val });
  const msTeam = sp.mostscored || auto.bestScored;
  const mcTeam = sp.mostconceded || auto.bestConceded;

  return (
    <div className="page">
      {/* Entry + pot */}
      <div className="prize-entry">
        <div className="prize-entry-icon">🎟️</div>
        <div className="prize-entry-text">
          <div className="prize-entry-main">$5 entry · 3 teams · no takesies backsies</div>
          <div className="prize-entry-sub">One top-tier seed, one middle seed, one lower seed — fate decides the rest.<br />Pay up before the first whistle or forfeit your right to complain.</div>
        </div>
        <div className="prize-pot">
          <div className="prize-pot-val">${pot}</div>
          <div className="prize-pot-lbl">Total pot</div>
        </div>
      </div>

      <div className="two-col">
        <div className="prize-panel">
          <div className="prize-header">
            <div className="prize-header-icon">🏆</div>
            <div>
              <div className="prize-header-title">Main prizes</div>
              <div className="prize-header-sub">For when your team actually does something</div>
            </div>
          </div>
          <div className="prize-rows">
            <div className="prize-row">
              <div className="prize-amount win">$50</div><div className="prize-icon">🥇</div>
              <div className="prize-desc"><div className="prize-title">World Cup winner</div><div className="prize-sub">Your team lifts the trophy.</div></div>
              <PrizeWinner team={sp.champion} people={people} />
            </div>
            <div className="prize-row">
              <div className="prize-amount second">$10</div><div className="prize-icon">🥈</div>
              <div className="prize-desc"><div className="prize-title">Runner-up</div><div className="prize-sub">So close. A cruel, merino-soft consolation.</div></div>
              <PrizeWinner team={sp.runnerup} people={people} />
            </div>
          </div>
        </div>

        <div className="prize-panel">
          <div className="prize-header">
            <div className="prize-header-icon">🎯</div>
            <div>
              <div className="prize-header-title">Money back specials</div>
              <div className="prize-header-sub">$5 refund each — your entry back for a job well done</div>
            </div>
          </div>
          <div className="prize-rows">
            <div className="prize-row">
              <div className="prize-amount back">$5</div><div className="prize-icon">🐏</div>
              <div className="prize-desc"><div className="prize-title">Dark horse run</div><div className="prize-sub">Your Tier 3 team advances furthest.</div></div>
              <PrizeWinner team={sp.darkhorse_team} extra={sp.darkhorse_round} people={people} />
            </div>
            <div className="prize-row">
              <div className="prize-amount back">$5</div><div className="prize-icon">⚡</div>
              <div className="prize-desc"><div className="prize-title">Fastest goal</div><div className="prize-sub">Earliest-minute goal across all 104 matches.</div></div>
              <PrizeWinner team={sp.fastest_team} extra={sp.fastest_minute ? `${sp.fastest_minute}'` : ''} people={people} />
            </div>
            <div className="prize-row">
              <div className="prize-amount back">$5</div><div className="prize-icon">🔥</div>
              <div className="prize-desc"><div className="prize-title">Most goals scored (group)</div><div className="prize-sub">The free-scoring group stage team.</div></div>
              <PrizeWinner team={msTeam} extra={auto.maxGF ? `${auto.maxGF} goals` : ''} people={people} />
            </div>
            <div className="prize-row">
              <div className="prize-amount back">$5</div><div className="prize-icon">🧱</div>
              <div className="prize-desc"><div className="prize-title">Most goals conceded (group)</div><div className="prize-sub">A sieve at the back.</div></div>
              <PrizeWinner team={mcTeam} extra={auto.maxGA ? `${auto.maxGA} conceded` : ''} people={people} />
            </div>
          </div>
        </div>
      </div>

      {/* Specials management */}
      <div className="sec-head" style={{ marginTop: 8 }}>Update special winners</div>
      <div className="specials-grid">

        <div className="special-card" style={{ '--accent': '#D97706' }}>
          <div className="special-card-icon">🥇</div>
          <div className="special-card-title">Tournament Winner</div>
          <div className="special-card-sub">Set when the final is played.</div>
          <div className="special-input-row">
            <select className="special-select" value={sp.champion} onChange={e => save('champion', e.target.value)}>
              <option value="">— pick team —</option>
              {TMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="special-card" style={{ '--accent': '#6B7280' }}>
          <div className="special-card-icon">🥈</div>
          <div className="special-card-title">Runner-up</div>
          <div className="special-card-sub">Finalist who lost.</div>
          <div className="special-input-row">
            <select className="special-select" value={sp.runnerup} onChange={e => save('runnerup', e.target.value)}>
              <option value="">— pick team —</option>
              {TMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="special-card" style={{ '--accent': '#7C3AED' }}>
          <div className="special-card-icon">🐏</div>
          <div className="special-card-title">Dark Horse Run</div>
          <div className="special-card-sub">Tier 3 team that went furthest. Enter round reached.</div>
          <div className="special-input-row">
            <select className="special-select" value={sp.darkhorse_team} onChange={e => save('darkhorse_team', e.target.value)}>
              <option value="">— Tier 3 team —</option>
              {tier3teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="special-select" style={{ maxWidth: 110 }} value={sp.darkhorse_round} onChange={e => save('darkhorse_round', e.target.value)}>
              <option value="">Round</option>
              {DARK_HORSE_ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="special-card" style={{ '--accent': '#F59E0B' }}>
          <div className="special-card-icon">⚡</div>
          <div className="special-card-title">Fastest Goal</div>
          <div className="special-card-sub">Team that scored it + minute (e.g. "2'")</div>
          <div className="special-input-row">
            <select className="special-select" value={sp.fastest_team} onChange={e => save('fastest_team', e.target.value)}>
              <option value="">— team —</option>
              {TMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              className="special-input" placeholder="min" style={{ maxWidth: 56 }}
              value={fastMin} onChange={e => setFastMin(e.target.value)}
              onBlur={() => save('fastest_minute', fastMin)}
            />
          </div>
        </div>

        <div className="special-card" style={{ '--accent': '#10B981' }}>
          <div className="special-card-icon">🔥</div>
          <div className="special-card-title">Most Goals Scored (Group)</div>
          <div className="special-card-sub">Calculated automatically from entered scores, or override below.</div>
          <div className="auto-hint">
            {auto.bestScored ? `Auto: ${auto.bestScored} (${auto.maxGF} goals)` : 'Will auto-calculate as scores are entered.'}
          </div>
          <div className="special-input-row">
            <select className="special-select" value={sp.mostscored} onChange={e => save('mostscored', e.target.value)}>
              <option value="">— override team —</option>
              {TMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="special-card" style={{ '--accent': '#EF4444' }}>
          <div className="special-card-icon">🧱</div>
          <div className="special-card-title">Most Goals Conceded (Group)</div>
          <div className="special-card-sub">Calculated automatically from entered scores, or override below.</div>
          <div className="auto-hint">
            {auto.bestConceded ? `Auto: ${auto.bestConceded} (${auto.maxGA} conceded)` : 'Will auto-calculate as scores are entered.'}
          </div>
          <div className="special-input-row">
            <select className="special-select" value={sp.mostconceded} onChange={e => save('mostconceded', e.target.value)}>
              <option value="">— override team —</option>
              {TMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
