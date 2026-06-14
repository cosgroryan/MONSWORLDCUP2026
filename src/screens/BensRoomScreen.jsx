import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SCHEDULE, getFlag } from '../constants/data';
import { supabase } from '../lib/supabase';

// ── Constants ──────────────────────────────────────────────────────────────────

const MOODS = [
  { key: 'banger',     emoji: '🔥', label: 'Banger' },
  { key: 'classic',    emoji: '⭐', label: 'Classic' },
  { key: 'outrage',    emoji: '🤬', label: 'Outrage' },
  { key: 'heartbreak', emoji: '😭', label: 'Heartbreak' },
  { key: 'chaos',      emoji: '😂', label: 'Chaos' },
];

const MONTH_MAP = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };

function schedDateToISO(dateStr) {
  if (!dateStr) return null;
  const [, day, mon] = dateStr.split(' ');
  return `2026-${MONTH_MAP[mon]}-${String(day).padStart(2, '0')}`;
}

const SCHED_BY_KEY = {};
SCHEDULE.forEach(s => {
  SCHED_BY_KEY[`${s.home}|${s.away}`] = { ...s, iso: schedDateToISO(s.date) };
});

// Generate all 39 tournament days (Jun 11 – Jul 19 2026)
const TOURNAMENT_DAYS = [];
for (let d = new Date(Date.UTC(2026, 5, 11)); d <= new Date(Date.UTC(2026, 6, 19)); d.setUTCDate(d.getUTCDate() + 1)) {
  TOURNAMENT_DAYS.push(d.toISOString().slice(0, 10));
}

const TODAY = new Date().toISOString().slice(0, 10);
const DAY_NUM = Math.max(1, TOURNAMENT_DAYS.indexOf(TODAY) + 1);

function getPhase(iso) {
  if (iso <= '2026-07-02') return 'Group Stage';
  if (iso <= '2026-07-08') return 'Round of 32';
  if (iso <= '2026-07-13') return 'Round of 16';
  if (iso <= '2026-07-18') return 'Quarter-finals';
  if (iso <= '2026-07-22') return 'Semi-finals';
  if (iso <= '2026-07-25') return 'Third Place';
  return '🏆 The Final';
}

function formatDayLabel(iso) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  });
}

function predResult(pred, match) {
  if (!pred || pred.hg == null || pred.ag == null) return null;
  if (match.hg == null || match.ag == null) return null;
  if (pred.hg === match.hg && pred.ag === match.ag) return 'exact';
  const pr = pred.hg > pred.ag ? 'h' : pred.hg < pred.ag ? 'a' : 'd';
  const mr = match.hg > match.ag ? 'h' : match.hg < match.ag ? 'a' : 'd';
  return pr === mr ? 'correct' : 'wrong';
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function fetchNews() {
  const res = await fetch('/api/news');
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('RSS parse failed');
  return [...doc.querySelectorAll('item')].slice(0, 10).map(item => ({
    title: item.querySelector('title')?.textContent?.replace(/\s*-\s*[^-]+$/, '') || '',
    link: item.querySelector('guid')?.textContent || item.querySelector('link')?.textContent || '#',
    source: item.querySelector('source')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent || '',
  }));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MatchPrediction({ match, pred, onSave, benTeams }) {
  const hasResult = match.hg != null && match.ag != null;
  const result = predResult(pred, match);
  const [hv, setHv] = useState(pred?.hg != null ? String(pred.hg) : '');
  const [av, setAv] = useState(pred?.ag != null ? String(pred.ag) : '');

  useEffect(() => {
    if (pred) {
      setHv(pred.hg != null ? String(pred.hg) : '');
      setAv(pred.ag != null ? String(pred.ag) : '');
    }
  }, [pred?.hg, pred?.ag]);

  const commit = () => {
    const h = hv === '' ? null : parseInt(hv, 10);
    const a = av === '' ? null : parseInt(av, 10);
    if (hv !== '' && isNaN(h)) return;
    if (av !== '' && isNaN(a)) return;
    onSave(match.id, h, a);
  };

  const schedInfo = SCHED_BY_KEY[`${match.home}|${match.away}`];

  return (
    <div className={`pred-card${hasResult ? ' played' : ''}`}>
      <div className="pred-teams">
        <span className={`pred-team${benTeams.includes(match.home) ? ' ben' : ''}`}>{getFlag(match.home)} {match.home}</span>
        <div className="pred-centre">
          {hasResult
            ? <span className="pred-actual">{match.hg}–{match.ag}</span>
            : <span className="pred-vs">{schedInfo?.nzst ? `${schedInfo.nzst} NZST` : 'vs'}</span>
          }
        </div>
        <span className={`pred-team right${benTeams.includes(match.away) ? ' ben' : ''}`}>{getFlag(match.away)} {match.away}</span>
      </div>
      <div className="pred-row">
        <span className="pred-label">Your call</span>
        <div className="pred-inputs">
          <input className="pred-input" type="number" min="0" max="20"
            value={hv} onChange={e => setHv(e.target.value)} onBlur={commit}
            placeholder="?" disabled={hasResult} />
          <span className="pred-sep">–</span>
          <input className="pred-input" type="number" min="0" max="20"
            value={av} onChange={e => setAv(e.target.value)} onBlur={commit}
            placeholder="?" disabled={hasResult} />
        </div>
        {result === 'exact'   && <span className="pred-result exact">✅ Exact!</span>}
        {result === 'correct' && <span className="pred-result correct">🟡 Right result</span>}
        {result === 'wrong'   && <span className="pred-result wrong">❌ Wrong</span>}
        {!hasResult && pred?.hg == null && (
          <span className="pred-hint">Enter before kickoff</span>
        )}
      </div>
    </div>
  );
}

function CalendarTab({ matchesByDate, predictions, expandedDays, onToggleDay, onSave, benTeams }) {
  return (
    <div className="br-calendar">
      {TOURNAMENT_DAYS.map(iso => {
        const dayMatches = matchesByDate[iso] || [];
        const isToday = iso === TODAY;
        const isPast  = iso < TODAY;
        const isOpen  = expandedDays.has(iso);
        const played  = dayMatches.filter(m => m.hg != null && m.ag != null).length;
        const goals   = dayMatches.reduce((s, m) => m.hg != null ? s + m.hg + m.ag : s, 0);

        return (
          <div key={iso} className={`day-card${isToday ? ' today' : isPast ? ' past' : ' future'}`}>
            <button className="day-header" onClick={() => onToggleDay(iso)}>
              <div className="day-header-left">
                {isToday && <span className="day-badge">TODAY</span>}
                <span className="day-label">{formatDayLabel(iso)}</span>
                <span className="day-phase">{getPhase(iso)}</span>
              </div>
              <div className="day-header-right">
                <span className="day-summary">
                  {dayMatches.length === 0 ? 'No scheduled matches'
                    : isPast || isToday ? `${played}/${dayMatches.length} played${goals > 0 ? ` · ⚽ ${goals}` : ''}`
                    : `${dayMatches.length} match${dayMatches.length !== 1 ? 'es' : ''}`}
                </span>
                <span className="day-chevron">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="day-matches">
                {dayMatches.length === 0
                  ? <div className="day-empty">Knockout fixtures TBC once groups are settled</div>
                  : dayMatches.map(m => (
                      <MatchPrediction key={m.id} match={m} pred={predictions[m.id]}
                        onSave={onSave} benTeams={benTeams} />
                    ))
                }
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScrapbookTab({ notes, matches, noteForm, setNoteForm, onSave, onDelete, saving }) {
  const playedMatches = matches.filter(m => m.hg != null && m.ag != null);

  return (
    <div className="br-scrapbook">
      <div className="note-form">
        <div className="note-form-head">New entry</div>
        <div className="mood-row">
          {MOODS.map(m => (
            <button key={m.key}
              className={`mood-btn${noteForm.mood === m.key ? ' on' : ''}`}
              onClick={() => setNoteForm(f => ({ ...f, mood: f.mood === m.key ? '' : m.key }))}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
        <select className="note-match-sel" value={noteForm.matchId}
          onChange={e => setNoteForm(f => ({ ...f, matchId: e.target.value }))}>
          <option value="">— Attach to a match (optional) —</option>
          {playedMatches.map(m => (
            <option key={m.id} value={m.id}>{m.home} {m.hg}–{m.ag} {m.away}</option>
          ))}
        </select>
        <textarea className="note-body" rows={4}
          placeholder="What happened? Scenes? Don't hold back…"
          value={noteForm.body}
          onChange={e => setNoteForm(f => ({ ...f, body: e.target.value }))} />
        <button className="note-save-btn" onClick={onSave}
          disabled={!noteForm.body.trim() || saving}>
          {saving ? 'Saving…' : '📓 Add to scrapbook'}
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="note-empty">Nothing in the scrapbook yet. Write something — the tournament's already started.</div>
      ) : notes.map(n => {
        const mood  = MOODS.find(m => m.key === n.mood);
        const match = n.match_id ? matches.find(m => m.id === n.match_id) : null;
        return (
          <div key={n.id} className="note-card">
            <div className="note-card-head">
              {mood  && <span className="note-mood">{mood.emoji} {mood.label}</span>}
              {match && <span className="note-match">{match.home} {match.hg}–{match.ag} {match.away}</span>}
              <span className="note-date">
                {new Date(n.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
              </span>
              <button className="note-del" onClick={() => onDelete(n.id)}>×</button>
            </div>
            <div className="note-body-text">{n.body}</div>
          </div>
        );
      })}
    </div>
  );
}

function NewsSidebar() {
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchNews()
      .then(items => { setNews(items); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <aside className="br-sidebar">
      <div className="br-sidebar-head">📰 World Cup News</div>
      {loading && <div className="br-news-state">Loading…</div>}
      {error   && <div className="br-news-state">Couldn't load news — check proxy in dev</div>}
      {news.map((item, i) => (
        <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="br-news-item">
          <div className="br-news-title">{item.title}</div>
          <div className="br-news-meta">
            {item.source && <span>{item.source}</span>}
            {item.pubDate && <span>{timeAgo(item.pubDate)}</span>}
          </div>
        </a>
      ))}
    </aside>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function BensRoomScreen() {
  const { people, matches } = useApp();
  const [tab, setTab]               = useState('calendar');
  const [predictions, setPredictions] = useState({});
  const [notes, setNotes]           = useState([]);
  const [noteForm, setNoteForm]     = useState({ mood: '', matchId: '', body: '' });
  const [noteSaving, setNoteSaving] = useState(false);
  const [expandedDays, setExpandedDays] = useState(() => new Set([TODAY]));

  const ben = useMemo(() => people.find(p => p.name?.toLowerCase().includes('ben')), [people]);
  const benTeams = ben?.teams || [];

  // Load predictions
  useEffect(() => {
    supabase.from('bens_predictions').select('*').then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach(p => { map[p.match_id] = p; });
      setPredictions(map);
    });
  }, []);

  // Load notes
  useEffect(() => {
    supabase.from('bens_notes').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setNotes(data);
    });
  }, []);

  // Build date → matches map
  const matchesByDate = useMemo(() => {
    const map = {};
    matches.forEach(m => {
      const si = SCHED_BY_KEY[`${m.home}|${m.away}`];
      if (!si?.iso) return;
      if (!map[si.iso]) map[si.iso] = [];
      map[si.iso].push(m);
    });
    return map;
  }, [matches]);

  // Header stats
  const stats = useMemo(() => {
    const totalGoals = matches.reduce((s, m) => m.hg != null ? s + m.hg + m.ag : s, 0);
    let withResult = 0, correct = 0, exact = 0;
    Object.entries(predictions).forEach(([id, pred]) => {
      if (pred.hg == null || pred.ag == null) return;
      const match = matches.find(m => m.id === id);
      if (!match || match.hg == null) return;
      withResult++;
      const r = predResult(pred, match);
      if (r === 'correct' || r === 'exact') correct++;
      if (r === 'exact') exact++;
    });
    return { totalGoals, withResult, correct, exact };
  }, [predictions, matches]);

  const savePrediction = useCallback(async (matchId, hg, ag) => {
    setPredictions(prev => ({ ...prev, [matchId]: { match_id: matchId, hg, ag } }));
    await supabase.from('bens_predictions').upsert({ match_id: matchId, hg, ag, updated_at: new Date().toISOString() });
  }, []);

  const saveNote = useCallback(async () => {
    if (!noteForm.body.trim()) return;
    setNoteSaving(true);
    const { data } = await supabase.from('bens_notes').insert({
      mood: noteForm.mood || null,
      match_id: noteForm.matchId || null,
      body: noteForm.body.trim(),
    }).select().single();
    if (data) setNotes(prev => [data, ...prev]);
    setNoteForm({ mood: '', matchId: '', body: '' });
    setNoteSaving(false);
  }, [noteForm]);

  const deleteNote = useCallback(async (id) => {
    await supabase.from('bens_notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleDay = useCallback((iso) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(iso) ? next.delete(iso) : next.add(iso);
      return next;
    });
  }, []);

  return (
    <div className="br-wrap">
      <div className="br-main">

        {/* Header */}
        <div className="br-header">
          <div className="br-header-inner">
            <img src="/ben.png" alt="Ben" className="br-avatar" />
            <div>
              <div className="br-title">Ben's Room</div>
              <div className="br-subtitle">World Cup 2026 · Personal HQ</div>
              <div className="br-stats-row">
                <span className="br-stat">Day {DAY_NUM} of 39</span>
                <span className="br-stat">⚽ {stats.totalGoals} goals</span>
                {stats.withResult > 0 && (
                  <span className="br-stat">🎯 {stats.correct}/{stats.withResult} correct</span>
                )}
                {stats.exact > 0 && (
                  <span className="br-stat">✅ {stats.exact} exact</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="br-subtabs">
          <button className={`br-subtab${tab === 'calendar' ? ' on' : ''}`} onClick={() => setTab('calendar')}>
            📅 Calendar & Predictions
          </button>
          <button className={`br-subtab${tab === 'scrapbook' ? ' on' : ''}`} onClick={() => setTab('scrapbook')}>
            📓 Scrapbook
          </button>
        </div>

        {tab === 'calendar' ? (
          <CalendarTab
            matchesByDate={matchesByDate}
            predictions={predictions}
            expandedDays={expandedDays}
            onToggleDay={toggleDay}
            onSave={savePrediction}
            benTeams={benTeams}
          />
        ) : (
          <ScrapbookTab
            notes={notes}
            matches={matches}
            noteForm={noteForm}
            setNoteForm={setNoteForm}
            onSave={saveNote}
            onDelete={deleteNote}
            saving={noteSaving}
          />
        )}
      </div>

      <NewsSidebar />
    </div>
  );
}
