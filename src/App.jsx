import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PrizesScreen from './screens/PrizesScreen';
import MatchesScreen from './screens/MatchesScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import SetupScreen from './screens/SetupScreen';

const TABS = [
  { id: 'lb', label: '🏆 Leaderboard', screen: LeaderboardScreen, noPage: true },
  { id: 'pr', label: '💰 Prizes',       screen: PrizesScreen },
  { id: 'mx', label: '⚽ Matches',      screen: MatchesScreen },
  { id: 'sc', label: '📅 Schedule',     screen: ScheduleScreen },
  { id: 'su', label: '👥 Setup',        screen: SetupScreen },
];

export default function App() {
  const [active, setActive] = useState('lb');
  const current = TABS.find(t => t.id === active);
  const Screen = current?.screen;

  return (
    <AppProvider>
      <div className="tab-wrap">
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab${active === t.id ? ' on' : ''}`} onClick={() => setActive(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {Screen && <Screen />}
    </AppProvider>
  );
}
