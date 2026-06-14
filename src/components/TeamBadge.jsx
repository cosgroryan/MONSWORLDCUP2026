import React from 'react';
import { cp, getFlag } from '../constants/data';

export default function TeamBadge({ name, idx }) {
  const c = cp(idx);
  const flag = getFlag(name);
  return (
    <span className="bge" style={{ background: c.bg, border: `1px solid ${c.bd}`, color: c.tx }}>
      {flag && <span style={{ marginRight: 3 }}>{flag}</span>}{name}
    </span>
  );
}
