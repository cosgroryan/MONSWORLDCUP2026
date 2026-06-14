import React from 'react';
import { getFlag } from '../constants/data';

function toTwemojiPath(emoji) {
  return [...emoji]
    .map(c => c.codePointAt(0).toString(16))
    .filter(cp => cp !== 'fe0f') // strip variation selector
    .join('-');
}

export default function FlagImg({ team, size = 16, style }) {
  const emoji = getFlag(team);
  if (!emoji) return null;
  const path = toTwemojiPath(emoji);
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${path}.svg`}
      alt={emoji}
      width={size}
      height={size}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    />
  );
}
