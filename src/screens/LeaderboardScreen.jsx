import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ranked, buildBonusMap } from '../utils/scoring';
import { cp, TAGLINES } from '../constants/data';
import Avatar from '../components/Avatar';
import TeamBadge from '../components/TeamBadge';
import TierBadge from '../components/TierBadge';

const MEDALS = ['🥇', '🥈', '🥉'];
const tagline = TAGLINES[Math.floor(Date.now() / 86400000) % TAGLINES.length];

function Hero({ people, matches }) {
  const played = matches.filter((m) => m.hg !== null && m.ag !== null).length;
  const pot = people.length * 5;
  const r = useMemo(() => ranked(people, matches), [people, matches]);
  const leader = r[0];

  return (
    <>
      <div className="hero">
        <div className="hero-wool" />
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-top-row">
            <div>
              <div className="hero-logo-lockup">
                <div className="hero-logo-icon">⛰️</div>
                <div>
                  <div className="hero-mons">Mons Royale</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <div className="hero-cup">The Mons Cup</div>
                    <div className="hero-year">'26</div>
                  </div>
                </div>
              </div>
              <div className="hero-tagline">"{tagline}"</div>
            </div>
            <div className="hero-badge">
              <div className="hero-badge-label">Tournament</div>
              <div className="hero-badge-val">FIFA World Cup 2026</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 3 }}>48 teams · 104 matches</div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hstat"><div className="hstat-val">{people.length}</div><div className="hstat-lbl">Sweepers</div></div>
            <div className="hstat"><div className="hstat-val">{played}</div><div className="hstat-lbl">Played</div></div>
            <div className="hstat"><div className="hstat-val">{104 - played}</div><div className="hstat-lbl">To go</div></div>
            <div className="hstat"><div className="hstat-val">${pot}</div><div className="hstat-lbl">Prize pot</div></div>
          </div>
          {leader && leader.pts > 0 && (
            <div className="hero-leader">
              <div className="leader-av" style={{ background: cp(leader.idx).av, color: cp(leader.idx).avt }}>
                {leader.name.trim().split(/[\s/]+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?'}
              </div>
              <div>
                <div className="leader-label">Out front (for now)</div>
                <div className="leader-name">{leader.name}</div>
                <div className="leader-pts">{leader.pts} pts · GD {leader.gd > 0 ? '+' : ''}{leader.gd}</div>
              </div>
              <div className="leader-teams">
                {(leader.teams || []).filter(Boolean).map(t => <TeamBadge key={t} name={t} idx={leader.idx} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.round(played / 104 * 100)}%` }} />
      </div>
    </>
  );
}

export default function LeaderboardScreen() {
  const { people, matches, specials, loading } = useApp();
  const r = useMemo(() => ranked(people, matches), [people, matches]);
  const bonusMap = useMemo(() => buildBonusMap(specials, matches, people), [specials, matches, people]);

  if (loading) return <div className="loading">Loading…</div>;

  const podiumOrder = [r[1], r[0], r[2]];
  const podiumCls = ['p2', 'p1', 'p3'];
  const podiumRanks = [1, 0, 2];

  return (
    <>
      <Hero people={people} matches={matches} />
      <div className="page">
        {r.length === 0 ? (
          <div className="empty">
            <div className="ico">⛰️</div>
            <p>Waiting for kick-off.<br /><em style={{ fontSize: 12 }}>The merino is warm. The anticipation, warmer.</em></p>
          </div>
        ) : (
          <>
            <div className="podium">
              {podiumOrder.map((p, ci) => {
                if (!p) return <div key={ci} />;
                const c = cp(p.idx);
                const bonuses = bonusMap[p.name] || [];
                return (
                  <div key={ci} className={podiumCls[ci]}>
                    <div className="podium-card">
                      <div className="podium-medal">{MEDALS[podiumRanks[ci]]}</div>
                      <div className="podium-av" style={{ background: c.av, color: c.avt, borderColor: c.bd }}>
                        {p.name.trim().split(/[\s/]+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="podium-name">{p.name || '—'}</div>
                      <div className="podium-pts">{p.pts}</div>
                      <div className="podium-meta">GD {p.gd > 0 ? '+' : ''}{p.gd} · {p.w}W {p.d}D</div>
                      <div className="podium-teams">
                        {(p.teams || []).filter(Boolean).map(t => <TeamBadge key={t} name={t} idx={p.idx} />)}
                      </div>
                      {bonuses.length > 0 && (
                        <div className="bonus-row" style={{ justifyContent: 'center', marginTop: 6 }}>
                          {bonuses.map(b => <span key={b} className="chip">{b}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sec-head">Full standings</div>
            <div className="lb-card">
              <div className="lb-head">
                <div />
                <div>Sweeper</div>
                <div style={{ textAlign: 'center' }}>Pts</div>
                <div style={{ textAlign: 'center' }}>W</div>
                <div style={{ textAlign: 'center' }}>D</div>
                <div style={{ textAlign: 'center' }}>GD</div>
              </div>
              {r.map((p, i) => {
                const c = cp(p.idx);
                const gdColor = p.gd > 0 ? '#15803D' : p.gd < 0 ? '#DC2626' : 'var(--text3)';
                const bonuses = bonusMap[p.name] || [];
                return (
                  <div key={p.id || i} className={`lb-row${i === 0 ? ' lead' : ''}`}>
                    <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 15 }}>
                      {i < 3 ? MEDALS[i] : <span style={{ fontSize: 12, color: 'var(--text3)' }}>{i + 1}</span>}
                    </div>
                    <div className="prow">
                      <Avatar name={p.name} idx={p.idx} size={32} fontSize={11} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <span className="pname">{p.name || '—'}</span>
                          <TierBadge tier={p.tier} />
                        </div>
                        <div className="pteams">
                          {(p.teams || []).filter(Boolean).map(t => <TeamBadge key={t} name={t} idx={p.idx} />)}
                        </div>
                        {bonuses.length > 0 && (
                          <div className="bonus-row">
                            {bonuses.map(b => <span key={b} className="chip" style={{ fontSize: 9 }}>{b}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="lb-pts" style={{ color: c.av }}>{p.pts}</div>
                    <div className="lb-num">{p.w}</div>
                    <div className="lb-num">{p.d}</div>
                    <div className="lb-gd" style={{ color: gdColor }}>{p.gd > 0 ? '+' : ''}{p.gd}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
