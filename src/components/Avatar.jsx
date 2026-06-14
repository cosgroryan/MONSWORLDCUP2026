import React from 'react';
import { cp } from '../constants/data';
import { inits } from '../utils/scoring';

export default function Avatar({ name, idx, size = 32, fontSize = 11 }) {
  const c = cp(idx);
  return (
    <div className="av" style={{ width: size, height: size, background: c.av, fontSize, color: c.avt, flexShrink: 0 }}>
      {inits(name)}
    </div>
  );
}
