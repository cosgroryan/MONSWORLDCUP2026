export function calcPts(person, matches) {
  let pts = 0, w = 0, d = 0, gf = 0, ga = 0, gr = 0, gp = 0;
  const ts = (person.teams || []).filter(Boolean);
  matches.forEach((m) => {
    const ho = ts.includes(m.home);
    const ao = ts.includes(m.away);
    if (!ho && !ao) return;
    if (m.hg === null || m.ag === null) { gr++; return; }
    gp++;
    if (ho) { gf += m.hg; ga += m.ag; }
    if (ao) { gf += m.ag; ga += m.hg; }
    if (m.hg > m.ag) { if (ho) { pts += 3; w++; } }
    else if (m.ag > m.hg) { if (ao) { pts += 3; w++; } }
    else { if (ho) { pts += 1; d++; } if (ao) { pts += 1; d++; } }
  });
  return { pts, w, d, gf, ga, gd: gf - ga, gr, gp };
}

export function ranked(people, matches) {
  return people
    .map((p, i) => ({ ...p, idx: i, ...calcPts(p, matches) }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

export function groupGoals(matches) {
  const gf = {}, ga = {};
  matches.forEach((m) => {
    if (m.hg === null || m.ag === null) return;
    gf[m.home] = (gf[m.home] || 0) + m.hg;
    ga[m.home] = (ga[m.home] || 0) + m.ag;
    gf[m.away] = (gf[m.away] || 0) + m.ag;
    ga[m.away] = (ga[m.away] || 0) + m.hg;
  });
  return { gf, ga };
}

export function autoSpecials(matches) {
  const { gf, ga } = groupGoals(matches);
  let bestScored = null, bestConceded = null, maxGF = 0, maxGA = 0;
  Object.keys(gf).forEach((t) => {
    if ((gf[t] || 0) > maxGF) { maxGF = gf[t]; bestScored = t; }
    if ((ga[t] || 0) > maxGA) { maxGA = ga[t]; bestConceded = t; }
  });
  return { bestScored, bestConceded, maxGF, maxGA };
}

export function inits(name) {
  return (name || '?').trim().split(/[\s/]+/).map((w) => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}

export function sweeperFor(team, people) {
  if (!team) return null;
  return people.find((p) => (p.teams || []).includes(team)) || null;
}

export function buildBonusMap(specials, matches, people) {
  const bonusMap = {};
  const add = (team, label) => {
    const sw = sweeperFor(team, people);
    if (sw) {
      if (!bonusMap[sw.name]) bonusMap[sw.name] = [];
      if (!bonusMap[sw.name].includes(label)) bonusMap[sw.name].push(label);
    }
  };
  const auto = autoSpecials(matches);
  if (specials.champion) add(specials.champion, '🥇 $50 winner');
  if (specials.runnerup) add(specials.runnerup, '🥈 $10 runner-up');
  if (specials.darkhorse_team) add(specials.darkhorse_team, '🐏 $5 dark horse');
  if (specials.fastest_team) add(specials.fastest_team, '⚡ $5 fastest goal');
  const msTeam = specials.mostscored || auto.bestScored;
  const mcTeam = specials.mostconceded || auto.bestConceded;
  if (msTeam) add(msTeam, '🔥 $5 most scored');
  if (mcTeam) add(mcTeam, '🧱 $5 most conceded');
  return bonusMap;
}
