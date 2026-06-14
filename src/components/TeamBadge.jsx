import React from 'react';
import { cp } from '../constants/data';

export default function TeamBadge({ name, idx }) {
  const c = cp(idx);
  return (
    <span className="bge" style={{ background: c.bg, border: `1px solid ${c.bd}`, color: c.tx }}>
      {name}
    </span>
  );
}
