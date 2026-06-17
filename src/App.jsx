import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PrizesScreen from './screens/PrizesScreen';
import MatchesScreen from './screens/MatchesScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import SetupScreen from './screens/SetupScreen';
import BensRoomScreen from './screens/BensRoomScreen';
import KnockoutScreen from './screens/KnockoutScreen';

const TABS = [
  { id: 'lb', label: '🏆 Leaderboard', path: '/leaderboard', screen: LeaderboardScreen },
  { id: 'pr', label: '💰 Prizes',       path: '/prizes',      screen: PrizesScreen },
  { id: 'mx', label: '⚽ Matches',      path: '/matches',     screen: MatchesScreen },
  { id: 'sc', label: '📅 Schedule',     path: '/schedule',    screen: ScheduleScreen },
  { id: 'ko', label: '⚔️ Knockout',    path: '/knockout',    screen: KnockoutScreen, disabled: true },
  { id: 'su', label: '👥 Setup',        path: '/setup',       screen: SetupScreen },
  { id: 'br', label: "⛰️ Ben's Room",  path: '/bens_room',   screen: BensRoomScreen },
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
  return (
    <>
      <div className="tab-wrap">
        <div className="tabs">
          {TABS.map(t => (
            t.disabled
              ? <span key={t.id} className="tab tab-disabled">{t.label}</span>
              : <NavLink key={t.id} to={t.path} className={({ isActive }) => `tab${isActive ? ' on' : ''}`}>
                  {t.label}
                </NavLink>
          ))}
        </div>
      </div>
      <SyncBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/leaderboard" replace />} />
        {TABS.map(t => <Route key={t.id} path={t.path} element={<t.screen />} />)}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Inner />
      </AppProvider>
    </BrowserRouter>
  );
}
