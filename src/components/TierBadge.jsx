import React from 'react';

export default function TierBadge({ tier }) {
  const cls = tier === 1 ? 'tier-1' : tier === 2 ? 'tier-2' : 'tier-3';
  const label = tier === 1 ? '⭐ T1' : tier === 2 ? 'T2' : 'T3';
  return <span className={`tier-badge ${cls}`}>{label}</span>;
}
