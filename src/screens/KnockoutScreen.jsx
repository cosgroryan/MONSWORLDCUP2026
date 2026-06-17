import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import FlagImg from '../components/FlagImg';
import { fetchMatchDetail } from '../lib/footballApi';

// ── Flip to true when publishing for real KO stage ─────────────────────────
const IS_LOCKED = false;
const SEEN_KEY  = 'ko_seen_v1';

const ROUND_LABELS = { r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter Finals', sf: 'Semi Finals', final: 'The Final' };
const ROUND_ICONS  = { r32: '⚔️', r16: '🔥', qf: '⚡', sf: '💥', final: '🏆' };

// ── Bracket layout constants ──────────────────────────────────────────────────
const SLOT_BASE = 48;   // px per R32 slot
const CARD_H    = 40;   // match card height
const COL_W     = 138;  // column width
const CONN_W    = 16;   // connector SVG width
const BRACKET_H = 16 * SLOT_BASE; // 768px

// ── Hardcoded test bracket — swap for API data later ─────────────────────────
const KO_MATCHES = [
  // Round of 32 — uses real sweepstake teams so owner chips appear
  { id:'r32-1',  round:'r32',   teamA:'Argentina',    teamB:'Morocco',      hg:2,    ag:1,    venue:'MetLife Stadium, NJ',          date:'1 Jul',  nzst:'07:00' },
  { id:'r32-2',  round:'r32',   teamA:'France',       teamB:'Colombia',     hg:1,    ag:0,    venue:'Rose Bowl, LA',                date:'1 Jul',  nzst:'10:00' },
  { id:'r32-3',  round:'r32',   teamA:'Brazil',       teamB:'Croatia',      hg:null, ag:null, venue:'Allegiant Stadium, LV',        date:'2 Jul',  nzst:'07:00' },
  { id:'r32-4',  round:'r32',   teamA:'Germany',      teamB:'Japan',        hg:null, ag:null, venue:'AT&T Stadium, Dallas',         date:'2 Jul',  nzst:'10:00' },
  { id:'r32-5',  round:'r32',   teamA:'Spain',        teamB:'Australia',    hg:null, ag:null, venue:'Hard Rock Stadium, Miami',     date:'3 Jul',  nzst:'07:00' },
  { id:'r32-6',  round:'r32',   teamA:'Portugal',     teamB:'Ecuador',      hg:null, ag:null, venue:'SoFi Stadium, LA',             date:'3 Jul',  nzst:'10:00' },
  { id:'r32-7',  round:'r32',   teamA:'England',      teamB:'Sweden',       hg:null, ag:null, venue:'Lumen Field, Seattle',         date:'4 Jul',  nzst:'07:00' },
  { id:'r32-8',  round:'r32',   teamA:'Netherlands',  teamB:'Mexico',       hg:null, ag:null, venue:'BC Place, Vancouver',          date:'4 Jul',  nzst:'10:00' },
  { id:'r32-9',  round:'r32',   teamA:'Belgium',      teamB:'Uruguay',      hg:null, ag:null, venue:'NRG Stadium, Houston',         date:'5 Jul',  nzst:'07:00' },
  { id:'r32-10', round:'r32',   teamA:'United States',teamB:'Norway',       hg:null, ag:null, venue:'Gillette Stadium, Boston',     date:'5 Jul',  nzst:'10:00' },
  { id:'r32-11', round:'r32',   teamA:'South Korea',  teamB:'Tunisia',      hg:null, ag:null, venue:'Lincoln Financial, Philly',    date:'6 Jul',  nzst:'07:00' },
  { id:'r32-12', round:'r32',   teamA:'Switzerland',  teamB:'Senegal',      hg:null, ag:null, venue:'Arrowhead Stadium, KC',        date:'6 Jul',  nzst:'10:00' },
  { id:'r32-13', round:'r32',   teamA:'Iran',         teamB:'Panama',       hg:null, ag:null, venue:'Mercedes-Benz Stadium, ATL',   date:'7 Jul',  nzst:'07:00' },
  { id:'r32-14', round:'r32',   teamA:'Canada',       teamB:'Ghana',        hg:null, ag:null, venue:'BMO Field, Toronto',           date:'7 Jul',  nzst:'10:00' },
  { id:'r32-15', round:'r32',   teamA:'Austria',      teamB:'Ivory Coast',  hg:null, ag:null, venue:'Estadio Azteca, Mexico City',  date:'8 Jul',  nzst:'07:00' },
  { id:'r32-16', round:'r32',   teamA:'New Zealand',  teamB:'Türkiye',      hg:null, ag:null, venue:'Estadio BBVA, Monterrey',      date:'8 Jul',  nzst:'10:00' },
  // Round of 16
  { id:'r16-1',  round:'r16',   teamA:'Argentina',    teamB:'France',       hg:null, ag:null, venue:'MetLife Stadium, NJ',          date:'9 Jul',  nzst:'07:00' },
  { id:'r16-2',  round:'r16',   teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'9 Jul',  nzst:'10:00' },
  { id:'r16-3',  round:'r16',   teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'10 Jul', nzst:'07:00' },
  { id:'r16-4',  round:'r16',   teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'10 Jul', nzst:'10:00' },
  { id:'r16-5',  round:'r16',   teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'11 Jul', nzst:'07:00' },
  { id:'r16-6',  round:'r16',   teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'11 Jul', nzst:'10:00' },
  { id:'r16-7',  round:'r16',   teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'12 Jul', nzst:'07:00' },
  { id:'r16-8',  round:'r16',   teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'12 Jul', nzst:'10:00' },
  // Quarter Finals
  { id:'qf-1',   round:'qf',    teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'14 Jul', nzst:'07:00' },
  { id:'qf-2',   round:'qf',    teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'14 Jul', nzst:'10:00' },
  { id:'qf-3',   round:'qf',    teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'15 Jul', nzst:'07:00' },
  { id:'qf-4',   round:'qf',    teamA:null, teamB:null, hg:null, ag:null, venue:'TBD', date:'15 Jul', nzst:'10:00' },
  // Semi Finals
  { id:'sf-1',   round:'sf',    teamA:null, teamB:null, hg:null, ag:null, venue:'MetLife Stadium, NJ', date:'19 Jul', nzst:'07:00' },
  { id:'sf-2',   round:'sf',    teamA:null, teamB:null, hg:null, ag:null, venue:'SoFi Stadium, LA',    date:'20 Jul', nzst:'07:00' },
  // Final
  { id:'final-1',round:'final', teamA:null, teamB:null, hg:null, ag:null, venue:'MetLife Stadium, NJ', date:'27 Jul', nzst:'07:00' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const ANIM_VARIANTS = ['lightning', 'hurricane', 'stomp', 'fissure'];

function pickTwoAnims() {
  const pool = [...ANIM_VARIANTS];
  const i = Math.floor(Math.random() * pool.length);
  const [first] = pool.splice(i, 1);
  return [first, pool[Math.floor(Math.random() * pool.length)]];
}

function getSeen() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; }
}
function markSeen(id) {
  const s = getSeen();
  if (!s.includes(id)) { s.push(id); localStorage.setItem(SEEN_KEY, JSON.stringify(s)); }
}

// ── Screen Crack SVG ──────────────────────────────────────────────────────────
function ScreenCrack() {
  const lines = ['M50 82 L14 12','M50 82 L1 48','M50 82 L26 3','M50 82 L78 8','M50 82 L98 40','M50 82 L70 1','M50 82 L8 38','M50 82 L94 26','M50 82 L42 0','M50 82 L62 0'];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position:'fixed', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:1010, opacity:0, animation:'ko-crack-fade 1.6s ease 0.05s forwards' }}>
      {lines.map((d, i) => (
        <path key={i} d={d} pathLength="1"
          stroke={i % 3 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)'}
          strokeWidth={i % 3 === 0 ? 0.65 : 0.32} fill="none"
          style={{ strokeDasharray:1, strokeDashoffset:1, animation:`ko-crack-draw 0.22s ease ${i * 0.028}s forwards` }} />
      ))}
    </svg>
  );
}

// ── Bracket SVG Connector ─────────────────────────────────────────────────────
function RoundConnector({ fromRoundIdx, toMatchCount }) {
  const slotH = SLOT_BASE * Math.pow(2, fromRoundIdx);
  const paths = [];
  for (let j = 0; j < toMatchCount; j++) {
    const y1 = (2 * j + 0.5) * slotH;
    const y2 = (2 * j + 1.5) * slotH;
    const yM = (2 * j + 1)   * slotH;
    const xM = CONN_W / 2;
    paths.push(`M0,${y1}L${xM},${y1}L${xM},${yM}L${CONN_W},${yM}`);
    paths.push(`M0,${y2}L${xM},${y2}L${xM},${yM}L${CONN_W},${yM}`);
  }
  return (
    <svg width={CONN_W} height={BRACKET_H} style={{ flexShrink:0, display:'block' }}>
      {paths.map((d, i) => <path key={i} d={d} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />)}
    </svg>
  );
}

// ── Compact Bracket Card ──────────────────────────────────────────────────────
function BracketCard({ match, onOpen }) {
  const hasResult = match.hg !== null && match.ag !== null;
  const hasTeams  = match.teamA && match.teamB;
  const aWin = hasResult && match.hg > match.ag;
  const bWin = hasResult && match.ag > match.hg;

  const TeamRow = ({ team, score, win, lose }) => (
    <div className={`bc-team${win ? ' bc-win' : lose ? ' bc-lose' : !team ? ' bc-tbd' : ''}`}>
      {team ? (
        <>
          <FlagImg team={team} size={11} style={{ flexShrink:0 }} />
          <span className="bc-name">{team}</span>
          {hasResult && <span className="bc-score">{score}</span>}
        </>
      ) : (
        <span className="bc-placeholder">TBD</span>
      )}
    </div>
  );

  return (
    <div className={`bc-card${hasTeams ? ' bc-live' : ''}${hasResult ? ' bc-done' : ''}`}
      onClick={hasTeams ? () => onOpen(match) : undefined}>
      <TeamRow team={match.teamA} score={match.hg} win={aWin} lose={bWin} />
      <div className="bc-div" />
      <TeamRow team={match.teamB} score={match.ag} win={bWin} lose={aWin} />
      {hasTeams && !hasResult && <div className="bc-tap-glow" />}
    </div>
  );
}

// ── Full Bracket View ─────────────────────────────────────────────────────────
const ROUNDS_META = [
  { key:'r32',   label:'R32',   roundIdx:0 },
  { key:'r16',   label:'R16',   roundIdx:1 },
  { key:'qf',    label:'QF',    roundIdx:2 },
  { key:'sf',    label:'SF',    roundIdx:3 },
  { key:'final', label:'Final', roundIdx:4 },
];

function BracketView({ onOpen }) {
  return (
    <div className="bracket-outer">
      {/* Round header row */}
      <div className="bracket-header-row">
        {ROUNDS_META.map(({ key, label }, ri) => (
          <React.Fragment key={key}>
            <div className="bracket-col-head" style={{ width:COL_W }}>{label}</div>
            {ri < ROUNDS_META.length - 1 && <div style={{ width:CONN_W }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Columns + connectors */}
      <div className="bracket-body">
        {ROUNDS_META.map(({ key, roundIdx }, ri) => {
          const matches = KO_MATCHES.filter(m => m.round === key);
          const slotH   = SLOT_BASE * Math.pow(2, roundIdx);
          return (
            <React.Fragment key={key}>
              <div style={{ position:'relative', width:COL_W, height:BRACKET_H, flexShrink:0 }}>
                {matches.map((m, i) => {
                  const top = i * slotH + (slotH - CARD_H) / 2;
                  return (
                    <div key={m.id} style={{ position:'absolute', top, left:0, right:0, height:CARD_H }}>
                      <BracketCard match={m} onOpen={onOpen} />
                    </div>
                  );
                })}
              </div>
              {ri < ROUNDS_META.length - 1 && (
                <RoundConnector fromRoundIdx={roundIdx} toMatchCount={matches.length / 2} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Match Reveal Modal ────────────────────────────────────────────────────────
function MatchRevealModal({ match, people, onClose, onSkip, queueLabel }) {
  // onSkip = provided when auto-cycling through results; null for manual opens
  const hasResult = match.hg !== null && match.ag !== null;
  const aWin = hasResult && match.hg > match.ag;
  const bWin = hasResult && match.ag > match.hg;

  const [phase, setPhase]   = useState(0);
  const [shake, setShake]   = useState(false);
  const [cracks, setCracks] = useState([]);
  const [anims]             = useState(pickTwoAnims);
  const [detail, setDetail] = useState(null);
  const timers = useRef([]);

  useEffect(() => {
    if (!hasResult || !match.teamA || !match.teamB) return;
    fetchMatchDetail(match.teamA, match.teamB)
      .then(d => { if (d) setDetail(d); })
      .catch(() => {});
  }, [match.teamA, match.teamB, hasResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const triggerCrack = () => {
    const key = Date.now() + Math.random();
    setCracks(cs => [...cs, key]);
    setTimeout(() => setCracks(cs => cs.filter(k => k !== key)), 2200);
  };

  useEffect(() => {
    const DUR = { lightning: 950, hurricane: 900, stomp: 1100, fissure: 880 };
    const aDur = DUR[anims[0]] || 900;
    const bDur = DUR[anims[1]] || 900;

    const t1 = 250;               // team A enters
    const t2 = t1 + aDur + 300;   // team B enters after A finishes + 300ms gap
    const t3 = t2 + bDur + 200;   // score/info rises after B finishes
    const t4 = t3 + 1000;         // loser fades

    later(() => setPhase(1), t1);
    later(() => setPhase(2), t2);
    later(() => setPhase(3), t3);
    later(() => setPhase(4), t4);

    // Hurricane — crash shake at ~62% of 0.9s = 558ms into the animation
    if (anims[0] === 'hurricane') {
      later(() => setShake(true),  t1 + 558);
      later(() => setShake(false), t1 + 558 + 450);
    }
    if (anims[1] === 'hurricane') {
      later(() => setShake(true),  t2 + 558);
      later(() => setShake(false), t2 + 558 + 450);
    }

    // Stomp — shake on final stomp at ~91% of 1.1s = 1001ms into animation
    if (anims[0] === 'stomp') {
      later(() => setShake(true),  t1 + 1001);
      later(() => setShake(false), t1 + 1001 + 450);
    }
    if (anims[1] === 'stomp') {
      later(() => setShake(true),  t2 + 1001);
      later(() => setShake(false), t2 + 1001 + 450);
    }

    // Fissure — crack + shake on impact at ~48% of 0.88s = 422ms into animation
    if (anims[0] === 'fissure') {
      later(() => { setShake(true); triggerCrack(); }, t1 + 422);
      later(() => setShake(false), t1 + 422 + 450);
    }
    if (anims[1] === 'fissure') {
      later(() => { setShake(true); triggerCrack(); }, t2 + 422);
      later(() => setShake(false), t2 + 422 + 450);
    }

    return () => timers.current.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ownersOf = t => t ? people.filter(p => (p.teams || []).includes(t)) : [];
  const handleBgClick = () => onSkip ? onSkip() : onClose();

  // ── Event data from API detail ───────────────────────────────────────────
  const hId     = detail?.homeTeam?.id;
  const awId    = detail?.awayTeam?.id;
  const allGoals = (detail?.goals    || []).filter(g => g.minute !== null).sort((a, b) => a.minute - b.minute);
  const allBooks = (detail?.bookings || []).filter(b => b.minute !== null).sort((a, b) => a.minute - b.minute);
  const hGoals  = allGoals.filter(g => g.team?.id === hId);
  const awGoals = allGoals.filter(g => g.team?.id === awId);
  const hBooks  = allBooks.filter(b => b.team?.id === hId);
  const awBooks = allBooks.filter(b => b.team?.id === awId);
  const hasEvents = allGoals.length > 0 || allBooks.length > 0;

  const lastName = name => name ? name.trim().split(' ').pop() : '';

  return (
    <>
      {cracks.map(k => <ScreenCrack key={k} />)}

      <div className="ko-modal-overlay" style={{ animation:'ko-blackout .22s ease both' }} onClick={handleBgClick}>

        <button className="ko-modal-close" onClick={e => { e.stopPropagation(); onClose(); }}>✕</button>
        <div className="ko-modal-round-badge">
          {queueLabel || `${ROUND_ICONS[match.round]} ${ROUND_LABELS[match.round]}`}
        </div>

        {/* ── Arena wrap: teams shake inside; VS is anchored to its center ── */}
        <div className="ko-arena-wrap" onClick={e => e.stopPropagation()}>
          <div className={`ko-shake-wrap${shake ? ' ko-shaking' : ''}`}>
            <div className="ko-arena">

              {phase >= 1 && (
                <div className={`ko-team-panel ko-team-a ko-anim-${anims[0]}${phase >= 4 && bWin ? ' ko-team-loser' : ''}${phase >= 4 && aWin ? ' ko-team-victor' : ''}`}>
                  {anims[0] === 'hurricane' && <div className="ko-wind-ring" />}
                  {anims[0] === 'lightning' && <div className="ko-lightning-bg" />}
                  <div className="ko-face-row ko-face-a">
                    <div className="ko-modal-team-name">{match.teamA ? match.teamA.toUpperCase() : 'TBD'}</div>
                    <div className="ko-flag-giant"><FlagImg team={match.teamA} size={72} /></div>
                  </div>
                  <div className="ko-modal-owners ko-owners-a">
                    {ownersOf(match.teamA).map(p => <span key={p.id} className="ko-owner-chip">{p.name}</span>)}
                  </div>
                </div>
              )}

              {/* empty div keeps the 80px center column; VS rendered below via anchor */}
              <div />

              {phase >= 2 && (
                <div className={`ko-team-panel ko-team-b ko-anim-${anims[1]}${phase >= 4 && aWin ? ' ko-team-loser' : ''}${phase >= 4 && bWin ? ' ko-team-victor' : ''}`}>
                  {anims[1] === 'hurricane' && <div className="ko-wind-ring" />}
                  {anims[1] === 'lightning' && <div className="ko-lightning-bg" />}
                  <div className="ko-face-row ko-face-b">
                    <div className="ko-flag-giant"><FlagImg team={match.teamB} size={72} /></div>
                    <div className="ko-modal-team-name">{match.teamB ? match.teamB.toUpperCase() : 'TBD'}</div>
                  </div>
                  <div className="ko-modal-owners ko-owners-b">
                    {ownersOf(match.teamB).map(p => <span key={p.id} className="ko-owner-chip">{p.name}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* VS: absolutely centered in arena-wrap — never shakes */}
          <div className="ko-vs-center-anchor">
            <div className={`ko-vs-block${phase >= 2 ? ' ko-vs-active' : ''}`}>
              <div className="ko-vs-inner">VS</div>
            </div>
          </div>
        </div>

        {/* ── Result: score + events — outside shake-wrap, always screen-centred ── */}
        {hasResult && phase >= 3 && (
          <div className="ko-match-info" onClick={e => e.stopPropagation()}>
            <div className="ko-score-display">
              <span className={aWin ? 'ko-score-hi' : 'ko-score-lo'}>{match.hg}</span>
              <span className="ko-score-dash">–</span>
              <span className={bWin ? 'ko-score-hi' : 'ko-score-lo'}>{match.ag}</span>
            </div>

            {hasEvents && (
              <div className="ko-events-cols">
                <div className="ko-events-home">
                  {hGoals.map((g, i) => (
                    <div key={i} className="ko-ev">
                      ⚽ {lastName(g.scorer?.name)}{g.type === 'OWN' ? ' (og)' : ''} {g.minute}'
                    </div>
                  ))}
                  {hBooks.map((b, i) => (
                    <div key={i} className="ko-ev">
                      <span className={b.card === 'RED' ? 'ko-red-card' : 'ko-yellow-card'}>■</span> {lastName(b.player?.name)} {b.minute}'
                    </div>
                  ))}
                </div>
                <div className="ko-events-away">
                  {awGoals.map((g, i) => (
                    <div key={i} className="ko-ev">
                      ⚽ {lastName(g.scorer?.name)}{g.type === 'OWN' ? ' (og)' : ''} {g.minute}'
                    </div>
                  ))}
                  {awBooks.map((b, i) => (
                    <div key={i} className="ko-ev">
                      <span className={b.card === 'RED' ? 'ko-red-card' : 'ko-yellow-card'}>■</span> {lastName(b.player?.name)} {b.minute}'
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="ko-match-meta">{match.venue} · {match.date}</div>
            {!onSkip && <button className="ko-close-btn" onClick={onClose}>Close</button>}
          </div>
        )}

        {/* ── Upcoming ── */}
        {!hasResult && phase >= 3 && (
          <div className="ko-match-info" onClick={e => e.stopPropagation()}>
            <div className="ko-upcoming-label">UPCOMING</div>
            <div className="ko-upcoming-time">{match.date} · {match.nzst} NZST</div>
            <div className="ko-match-meta">{match.venue}</div>
            <button className="ko-close-btn" onClick={onClose}>Close</button>
          </div>
        )}

        {onSkip && (
          <button className="ko-skip-btn" onClick={e => { e.stopPropagation(); onSkip(); }}>
            Skip →
          </button>
        )}
      </div>
    </>
  );
}

const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'];

// ── List-view match card (larger, with owner chips) ───────────────────────────
function KOMatchCard({ match, people, onOpen }) {
  const hasResult = match.hg !== null && match.ag !== null;
  const hasTeams  = match.teamA && match.teamB;
  const aWin = hasResult && match.hg > match.ag;
  const bWin = hasResult && match.ag > match.hg;
  const ownersOf = t => t ? people.filter(p => (p.teams || []).includes(t)) : [];

  return (
    <div
      className={`ko-card${!hasTeams ? ' ko-card-tbd' : ''}${hasTeams ? ' ko-card-clickable' : ''}`}
      onClick={hasTeams ? () => onOpen(match) : undefined}
    >
      <div className={`ko-card-side ko-card-left${aWin ? ' ko-card-win' : ''}`}>
        {match.teamA ? (
          <><FlagImg team={match.teamA} size={22} /><span className="ko-card-name">{match.teamA}</span></>
        ) : <span className="ko-card-tbd-text">TBD</span>}
        {ownersOf(match.teamA).map(p => <span key={p.id} className="ko-card-owner">{p.name}</span>)}
      </div>
      <div className="ko-card-centre">
        {hasResult
          ? <div className="ko-card-score">
              <span className={aWin ? 'w' : ''}>{match.hg}</span>
              <span className="ko-card-dash">–</span>
              <span className={bWin ? 'w' : ''}>{match.ag}</span>
            </div>
          : <div className="ko-card-vs-pill">VS</div>}
        <div className="ko-card-date">{match.date}</div>
        {hasTeams && <div className="ko-card-tap-hint">TAP ⚡</div>}
      </div>
      <div className={`ko-card-side ko-card-right${bWin ? ' ko-card-win' : ''}`}>
        {match.teamB ? (
          <><span className="ko-card-name">{match.teamB}</span><FlagImg team={match.teamB} size={22} /></>
        ) : <span className="ko-card-tbd-text">TBD</span>}
        {ownersOf(match.teamB).map(p => <span key={p.id} className="ko-card-owner">{p.name}</span>)}
      </div>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function KnockoutScreen() {
  const { people } = useApp();
  const [view, setView]             = useState('list'); // 'list' | 'bracket'
  const [activeRound, setActiveRound] = useState('r32');

  // Auto-reveal queue: completed matches the user hasn't seen yet
  const [queue] = useState(() => {
    const seen = getSeen();
    return KO_MATCHES.filter(m => m.hg !== null && m.ag !== null && !seen.includes(m.id));
  });
  const [queueIdx, setQueueIdx]       = useState(0);
  const [autoVisible, setAutoVisible] = useState(false);

  // Manual click on a card
  const [manualMatch, setManualMatch] = useState(null);

  // Kick off auto-reveal on mount if queue is non-empty
  useEffect(() => {
    if (queue.length > 0) setAutoVisible(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentAuto = autoVisible ? queue[queueIdx] : null;

  const handleSkip = useCallback(() => {
    if (currentAuto) markSeen(currentAuto.id);
    const next = queueIdx + 1;
    if (next < queue.length) {
      setAutoVisible(false);
      setTimeout(() => { setQueueIdx(next); setAutoVisible(true); }, 180);
    } else {
      setAutoVisible(false);
    }
  }, [currentAuto, queueIdx, queue.length]);

  const handleAutoClose = useCallback(() => {
    queue.slice(queueIdx).forEach(m => markSeen(m.id));
    setAutoVisible(false);
  }, [queue, queueIdx]);

  const handleCardClick = (match) => setManualMatch(match);
  const handleManualClose = () => setManualMatch(null);

  if (IS_LOCKED) {
    return (
      <div className="ko-locked">
        <div className="ko-locked-icon">⚔️</div>
        <div className="ko-locked-title">Knockout Rounds</div>
        <div className="ko-locked-sub">Bracket unlocks when the group stage ends</div>
        <div className="ko-locked-date">Begins 1 July 2026</div>
      </div>
    );
  }

  return (
    <div className="ko-page">

      {/* ── Top bar: round tabs (list) + view toggle ── */}
      <div className="ko-topbar">
        {view === 'list' && (
          <div className="ko-round-tabs">
            {ROUND_ORDER.map(r => (
              <button key={r} className={`ko-round-tab${activeRound === r ? ' on' : ''}`} onClick={() => setActiveRound(r)}>
                <span className="ko-round-icon">{ROUND_ICONS[r]}</span>
                <span className="ko-round-label">{ROUND_LABELS[r]}</span>
              </button>
            ))}
          </div>
        )}
        {view === 'bracket' && <div className="ko-topbar-spacer" />}
        <div className="ko-view-pill">
          <button className={`ko-pill-opt${view === 'list' ? ' on' : ''}`} onClick={() => setView('list')}>≡ List</button>
          <button className={`ko-pill-opt${view === 'bracket' ? ' on' : ''}`} onClick={() => setView('bracket')}>⎇ Bracket</button>
        </div>
      </div>

      {/* ── Content ── */}
      {view === 'list' ? (
        <div className="ko-match-list">
          {KO_MATCHES.filter(m => m.round === activeRound).map(m => (
            <KOMatchCard key={m.id} match={m} people={people} onOpen={handleCardClick} />
          ))}
        </div>
      ) : (
        <BracketView onOpen={handleCardClick} />
      )}

      {/* Auto-reveal: cycling through unseen completed results */}
      {currentAuto && autoVisible && (
        <MatchRevealModal
          key={`auto-${currentAuto.id}`}
          match={currentAuto}
          people={people}
          onClose={handleAutoClose}
          onSkip={handleSkip}
          queueLabel={queue.length > 1
            ? `🏁 Result ${queueIdx + 1} of ${queue.length}`
            : '🏁 Result'}
        />
      )}

      {/* Manual: user clicked a bracket card */}
      {manualMatch && !currentAuto && (
        <MatchRevealModal
          key={`manual-${manualMatch.id}`}
          match={manualMatch}
          people={people}
          onClose={handleManualClose}
        />
      )}
    </div>
  );
}
