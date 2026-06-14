import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PrizesScreen from './screens/PrizesScreen';
import MatchesScreen from './screens/MatchesScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import SetupScreen from './screens/SetupScreen';

const TABS = [
  { id: 'lb', label: '🏆 Leaderboard', screen: LeaderboardScreen },
  { id: 'pr', label: '💰 Prizes',       screen: PrizesScreen },
  { id: 'mx', label: '⚽ Matches',      screen: MatchesScreen },
  { id: 'sc', label: '📅 Schedule',     screen: ScheduleScreen },
  { id: 'su', label: '👥 Setup',        screen: SetupScreen },
];

function SyncBanner() {
  const { syncStatus } = useApp();
  const { syncing, newScores, error } = syncStatus;

  if (!syncing && newScores === null && !error) return null;

  let bg, msg;
  if (syncing) {
    bg = '#1E3A5F';
    msg = '⟳ Checking for new scores…';
  } else if (error) {
    bg = '#7F1D1D';
    msg = `⚠ Score sync failed: ${error}`;
  } else if (newScores > 0) {
    bg = '#064E3B';
    msg = `✓ ${newScores} new result${newScores !== 1 ? 's' : ''} synced`;
  } else {
    bg = '#374151';
    msg = '✓ Scores up to date';
  }

  return (
    <div style={{
      background: bg, color: '#fff', fontSize: 12, fontWeight: 600,
      padding: '6px 20px', textAlign: 'center', letterSpacing: 0.3,
      transition: 'background 0.3s',
    }}>
      {msg}
    </div>
  );
}

function Inner() {
  const [active, setActive] = useState('lb');
  const current = TABS.find(t => t.id === active);
  const Screen = current?.screen;

  return (
    <>
      <div className="tab-wrap">
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab${active === t.id ? ' on' : ''}`} onClick={() => setActive(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <SyncBanner />
      {Screen && <Screen />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}
