import React from 'react';
import { cp } from '../constants/data';
import FlagImg from './FlagImg';

export default function TeamBadge({ name, idx }) {
  const c = cp(idx);
  return (
    <span className="bge" style={{ background: c.bg, border: `1px solid ${c.bd}`, color: c.tx, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <FlagImg team={name} size={13} />
      {name}
    </span>
  );
}
