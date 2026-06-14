export const TMS = [
  "Mexico","South Africa","South Korea","Czechia","Canada","Bosnia & Herzegovina",
  "Qatar","Switzerland","Brazil","Morocco","Haiti","Scotland","United States",
  "Paraguay","Australia","Türkiye","Germany","Curaçao","Ivory Coast","Ecuador",
  "Netherlands","Japan","Sweden","Tunisia","Belgium","Egypt","Iran","New Zealand",
  "Spain","Cape Verde","Saudi Arabia","Uruguay","France","Senegal","Iraq","Norway",
  "Argentina","Algeria","Austria","Jordan","Portugal","DR Congo","Uzbekistan",
  "Colombia","England","Croatia","Ghana","Panama",
];

export const GRP = {
  A: ["Mexico","South Africa","South Korea","Czechia"],
  B: ["Canada","Bosnia & Herzegovina","Qatar","Switzerland"],
  C: ["Brazil","Morocco","Haiti","Scotland"],
  D: ["United States","Paraguay","Australia","Türkiye"],
  E: ["Germany","Curaçao","Ivory Coast","Ecuador"],
  F: ["Netherlands","Japan","Sweden","Tunisia"],
  G: ["Belgium","Egypt","Iran","New Zealand"],
  H: ["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I: ["France","Senegal","Iraq","Norway"],
  J: ["Argentina","Algeria","Austria","Jordan"],
  K: ["Portugal","DR Congo","Uzbekistan","Colombia"],
  L: ["England","Croatia","Ghana","Panama"],
};

export const DEFAULTS = [
  { name: "Hamish I",    teams: ["Argentina","Austria","New Zealand"],         tier: 1 },
  { name: "Tamara",      teams: ["Morocco","Ecuador","DR Congo"],              tier: 1 },
  { name: "Grace",       teams: ["Portugal","Egypt","Tunisia"],                tier: 1 },
  { name: "Hamish A",    teams: ["Uruguay","South Korea","Panama"],            tier: 2 },
  { name: "Benn",        teams: ["Spain","Sweden","Jordan"],                   tier: 2 },
  { name: "Tessa",       teams: ["France","Canada","Iran"],                    tier: 2 },
  { name: "Jess",        teams: ["Japan","Senegal","South Africa"],            tier: 2 },
  { name: "Tom B",       teams: ["Belgium","Bosnia & Herzegovina","Curaçao"],  tier: 2 },
  { name: "Isla",        teams: ["Norway","Ivory Coast","Saudi Arabia"],       tier: 3 },
  { name: "Shane",       teams: ["Brazil","Mexico","Australia"],               tier: 3 },
  { name: "Josh",        teams: ["Colombia","Croatia","Uzbekistan"],           tier: 3 },
  { name: "Finn",        teams: ["Switzerland","Algeria","Qatar"],             tier: 3 },
  { name: "Ryan",        teams: ["United States","Ghana","Haiti"],             tier: 3 },
  { name: "Tom T",       teams: ["Germany","Scotland","Cape Verde"],           tier: 3 },
  { name: "Liv",         teams: ["Netherlands","Türkiye","Czechia"],           tier: 3 },
  { name: "Tess / Clare",teams: ["England","Paraguay","Iraq"],                 tier: 3 },
];

export const PAL = [
  { bg:"#FEF3C7", bd:"#F59E0B", tx:"#78350F", av:"#F59E0B", avt:"#fff" },
  { bg:"#D1FAE5", bd:"#10B981", tx:"#064E3B", av:"#10B981", avt:"#fff" },
  { bg:"#EDE9FE", bd:"#7C3AED", tx:"#4C1D95", av:"#7C3AED", avt:"#fff" },
  { bg:"#FFE4E6", bd:"#F43F5E", tx:"#881337", av:"#F43F5E", avt:"#fff" },
  { bg:"#DBEAFE", bd:"#3B82F6", tx:"#1E3A8A", av:"#3B82F6", avt:"#fff" },
  { bg:"#FEE2E2", bd:"#EF4444", tx:"#7F1D1D", av:"#EF4444", avt:"#fff" },
  { bg:"#FDF4FF", bd:"#C026D3", tx:"#701A75", av:"#C026D3", avt:"#fff" },
  { bg:"#FFF7ED", bd:"#F97316", tx:"#7C2D12", av:"#F97316", avt:"#fff" },
  { bg:"#F0FDF4", bd:"#16A34A", tx:"#14532D", av:"#16A34A", avt:"#fff" },
  { bg:"#E0F2FE", bd:"#0284C7", tx:"#0C4A6E", av:"#0284C7", avt:"#fff" },
  { bg:"#F5F3FF", bd:"#6D28D9", tx:"#2E1065", av:"#6D28D9", avt:"#fff" },
  { bg:"#ECFDF5", bd:"#059669", tx:"#064E3B", av:"#059669", avt:"#fff" },
  { bg:"#FEF9C3", bd:"#EAB308", tx:"#713F12", av:"#EAB308", avt:"#fff" },
  { bg:"#FCE7F3", bd:"#DB2777", tx:"#831843", av:"#DB2777", avt:"#fff" },
  { bg:"#F1F5F9", bd:"#475569", tx:"#1E293B", av:"#475569", avt:"#fff" },
  { bg:"#FFF1F2", bd:"#E11D48", tx:"#881337", av:"#E11D48", avt:"#fff" },
];

export const cp = (i) => PAL[i % 16];

export const GRP_ACCENT = {
  A:"#064E3B", B:"#1E3A5F", C:"#4C1D95", D:"#7C2D12",
  E:"#713F12", F:"#14532D", G:"#831843", H:"#064E3B",
  I:"#1E3A5F", J:"#4C1D95", K:"#7C2D12", L:"#713F12",
};

export const GRP_TEXT = {
  A:"#A7F3D0", B:"#BAE6FD", C:"#DDD6FE", D:"#FED7AA",
  E:"#FDE68A", F:"#BBF7D0", G:"#FBCFE8", H:"#A7F3D0",
  I:"#BAE6FD", J:"#DDD6FE", K:"#FED7AA", L:"#FDE68A",
};

export const TAGLINES = [
  "Built for winners. Worn by whoever drew Argentina.",
  "Merino soft. Rivalry hard.",
  "Technically everyone's a winner. Technically.",
  "No lambswool was harmed in the making of this sweepstake.",
  "From the mountains to the group stage.",
  "The only cup Mons makes that you can't wear.",
  "48 teams. 16 sweepers. 1 set of bragging rights.",
  "New Zealand's in it. That's already a win.",
  "Soft on the outside. Ruthless on the leaderboard.",
  "Official sweepstake of people who work here.",
  "$5 in. Glory out. Probably.",
  "May the best Tier 3 team lose gracefully.",
];

export const SCHEDULE = [
  { date:"Fri 12 Jun", grp:"A", home:"Mexico",          away:"South Africa",         nzst:"07:00", venue:"Mexico City" },
  { date:"Fri 12 Jun", grp:"A", home:"South Korea",      away:"Czechia",              nzst:"14:00", venue:"Guadalajara" },
  { date:"Sat 13 Jun", grp:"B", home:"Canada",           away:"Bosnia & Herzegovina", nzst:"07:00", venue:"Toronto" },
  { date:"Sat 13 Jun", grp:"D", home:"United States",    away:"Paraguay",             nzst:"13:00", venue:"Los Angeles" },
  { date:"Sun 14 Jun", grp:"B", home:"Qatar",            away:"Switzerland",          nzst:"07:00", venue:"San Francisco" },
  { date:"Sun 14 Jun", grp:"C", home:"Brazil",           away:"Morocco",              nzst:"10:00", venue:"New York/NJ" },
  { date:"Sun 14 Jun", grp:"C", home:"Haiti",            away:"Scotland",             nzst:"13:00", venue:"Boston" },
  { date:"Sun 14 Jun", grp:"D", home:"Australia",        away:"Türkiye",              nzst:"16:00", venue:"Vancouver" },
  { date:"Mon 15 Jun", grp:"E", home:"Germany",          away:"Curaçao",              nzst:"05:00", venue:"Houston" },
  { date:"Mon 15 Jun", grp:"F", home:"Netherlands",      away:"Japan",                nzst:"08:00", venue:"Dallas" },
  { date:"Mon 15 Jun", grp:"E", home:"Ivory Coast",      away:"Ecuador",              nzst:"11:00", venue:"Philadelphia" },
  { date:"Mon 15 Jun", grp:"F", home:"Sweden",           away:"Tunisia",              nzst:"14:00", venue:"Monterrey" },
  { date:"Tue 16 Jun", grp:"H", home:"Spain",            away:"Cape Verde",           nzst:"04:00", venue:"Atlanta" },
  { date:"Tue 16 Jun", grp:"G", home:"Belgium",          away:"Egypt",                nzst:"07:00", venue:"Vancouver" },
  { date:"Tue 16 Jun", grp:"H", home:"Saudi Arabia",     away:"Uruguay",              nzst:"10:00", venue:"Miami" },
  { date:"Tue 16 Jun", grp:"G", home:"Iran",             away:"New Zealand",          nzst:"13:00", venue:"Los Angeles" },
  { date:"Wed 17 Jun", grp:"I", home:"France",           away:"Senegal",              nzst:"07:00", venue:"New York/NJ" },
  { date:"Wed 17 Jun", grp:"I", home:"Iraq",             away:"Norway",               nzst:"10:00", venue:"Boston" },
  { date:"Wed 17 Jun", grp:"J", home:"Argentina",        away:"Algeria",              nzst:"13:00", venue:"Kansas City" },
  { date:"Wed 17 Jun", grp:"J", home:"Austria",          away:"Jordan",               nzst:"16:00", venue:"San Francisco" },
  { date:"Thu 18 Jun", grp:"K", home:"Portugal",         away:"DR Congo",             nzst:"05:00", venue:"Houston" },
  { date:"Thu 18 Jun", grp:"L", home:"England",          away:"Croatia",              nzst:"08:00", venue:"Dallas" },
  { date:"Thu 18 Jun", grp:"L", home:"Ghana",            away:"Panama",               nzst:"11:00", venue:"Toronto" },
  { date:"Thu 18 Jun", grp:"K", home:"Uzbekistan",       away:"Colombia",             nzst:"14:00", venue:"Mexico City" },
  { date:"Fri 19 Jun", grp:"A", home:"Czechia",          away:"South Africa",         nzst:"04:00", venue:"Atlanta" },
  { date:"Fri 19 Jun", grp:"B", home:"Switzerland",      away:"Bosnia & Herzegovina", nzst:"07:00", venue:"Los Angeles" },
  { date:"Fri 19 Jun", grp:"B", home:"Canada",           away:"Qatar",                nzst:"10:00", venue:"Vancouver" },
  { date:"Fri 19 Jun", grp:"A", home:"Mexico",           away:"South Korea",          nzst:"13:00", venue:"Guadalajara" },
  { date:"Sat 20 Jun", grp:"D", home:"United States",    away:"Australia",            nzst:"07:00", venue:"Seattle" },
  { date:"Sat 20 Jun", grp:"C", home:"Scotland",         away:"Morocco",              nzst:"10:00", venue:"Boston" },
  { date:"Sat 20 Jun", grp:"C", home:"Brazil",           away:"Haiti",                nzst:"12:30", venue:"Philadelphia" },
  { date:"Sat 20 Jun", grp:"D", home:"Türkiye",          away:"Paraguay",             nzst:"15:00", venue:"San Francisco" },
  { date:"Sun 21 Jun", grp:"F", home:"Netherlands",      away:"Sweden",               nzst:"05:00", venue:"Houston" },
  { date:"Sun 21 Jun", grp:"E", home:"Germany",          away:"Ivory Coast",          nzst:"08:00", venue:"Toronto" },
  { date:"Sun 21 Jun", grp:"E", home:"Ecuador",          away:"Curaçao",              nzst:"15:00", venue:"Kansas City" },
  { date:"Sun 21 Jun", grp:"F", home:"Tunisia",          away:"Japan",                nzst:"16:00", venue:"Monterrey" },
  { date:"Mon 22 Jun", grp:"H", home:"Spain",            away:"Saudi Arabia",         nzst:"04:00", venue:"Atlanta" },
  { date:"Mon 22 Jun", grp:"G", home:"Belgium",          away:"Iran",                 nzst:"07:00", venue:"Los Angeles" },
  { date:"Mon 22 Jun", grp:"H", home:"Uruguay",          away:"Cape Verde",           nzst:"10:00", venue:"Miami" },
  { date:"Mon 22 Jun", grp:"G", home:"New Zealand",      away:"Egypt",                nzst:"13:00", venue:"Vancouver" },
  { date:"Tue 23 Jun", grp:"J", home:"Argentina",        away:"Austria",              nzst:"05:00", venue:"Dallas" },
  { date:"Tue 23 Jun", grp:"I", home:"France",           away:"Iraq",                 nzst:"09:00", venue:"Philadelphia" },
  { date:"Tue 23 Jun", grp:"I", home:"Norway",           away:"Senegal",              nzst:"12:00", venue:"New York/NJ" },
  { date:"Tue 23 Jun", grp:"J", home:"Jordan",           away:"Algeria",              nzst:"15:00", venue:"San Francisco" },
  { date:"Wed 24 Jun", grp:"K", home:"Portugal",         away:"Uzbekistan",           nzst:"05:00", venue:"Houston" },
  { date:"Wed 24 Jun", grp:"L", home:"England",          away:"Ghana",                nzst:"08:00", venue:"Boston" },
  { date:"Wed 24 Jun", grp:"L", home:"Panama",           away:"Croatia",              nzst:"11:00", venue:"Toronto" },
  { date:"Wed 24 Jun", grp:"K", home:"Colombia",         away:"DR Congo",             nzst:"14:00", venue:"Guadalajara" },
  { date:"Thu 25 Jun", grp:"B", home:"Switzerland",      away:"Canada",               nzst:"07:00", venue:"Vancouver" },
  { date:"Thu 25 Jun", grp:"B", home:"Bosnia & Herzegovina", away:"Qatar",            nzst:"07:00", venue:"Seattle" },
  { date:"Thu 25 Jun", grp:"C", home:"Scotland",         away:"Brazil",               nzst:"10:00", venue:"Miami" },
  { date:"Thu 25 Jun", grp:"C", home:"Morocco",          away:"Haiti",                nzst:"10:00", venue:"Atlanta" },
  { date:"Thu 25 Jun", grp:"A", home:"Czechia",          away:"Mexico",               nzst:"13:00", venue:"Mexico City" },
  { date:"Thu 25 Jun", grp:"A", home:"South Africa",     away:"South Korea",          nzst:"13:00", venue:"Monterrey" },
  { date:"Fri 26 Jun", grp:"E", home:"Ecuador",          away:"Germany",              nzst:"08:00", venue:"New York/NJ" },
  { date:"Fri 26 Jun", grp:"E", home:"Curaçao",          away:"Ivory Coast",          nzst:"08:00", venue:"Philadelphia" },
  { date:"Fri 26 Jun", grp:"F", home:"Japan",            away:"Sweden",               nzst:"11:00", venue:"Dallas" },
  { date:"Fri 26 Jun", grp:"F", home:"Tunisia",          away:"Netherlands",          nzst:"11:00", venue:"Kansas City" },
  { date:"Fri 26 Jun", grp:"G", home:"Egypt",            away:"Iran",                 nzst:"15:00", venue:"Seattle" },
  { date:"Fri 26 Jun", grp:"G", home:"New Zealand",      away:"Belgium",              nzst:"15:00", venue:"Vancouver" },
  { date:"Fri 26 Jun", grp:"D", home:"Türkiye",          away:"United States",        nzst:"14:00", venue:"Los Angeles" },
  { date:"Fri 26 Jun", grp:"D", home:"Paraguay",         away:"Australia",            nzst:"14:00", venue:"San Francisco" },
  { date:"Sat 27 Jun", grp:"I", home:"Norway",           away:"France",               nzst:"07:00", venue:"Boston" },
  { date:"Sat 27 Jun", grp:"I", home:"Senegal",          away:"Iraq",                 nzst:"07:00", venue:"Toronto" },
  { date:"Sat 27 Jun", grp:"H", home:"Cape Verde",       away:"Saudi Arabia",         nzst:"12:00", venue:"Houston" },
  { date:"Sat 27 Jun", grp:"H", home:"Uruguay",          away:"Spain",                nzst:"12:00", venue:"Guadalajara" },
  { date:"Sun 28 Jun", grp:"L", home:"Panama",           away:"England",              nzst:"09:00", venue:"New York/NJ" },
  { date:"Sun 28 Jun", grp:"L", home:"Croatia",          away:"Ghana",                nzst:"09:00", venue:"Philadelphia" },
  { date:"Sun 28 Jun", grp:"K", home:"Colombia",         away:"Portugal",             nzst:"11:30", venue:"Miami" },
  { date:"Sun 28 Jun", grp:"K", home:"DR Congo",         away:"Uzbekistan",           nzst:"11:30", venue:"Atlanta" },
  { date:"Sun 28 Jun", grp:"J", home:"Algeria",          away:"Austria",              nzst:"14:00", venue:"Kansas City" },
  { date:"Sun 28 Jun", grp:"J", home:"Jordan",           away:"Argentina",            nzst:"14:00", venue:"Dallas" },
];

export const MATCH_PAIRS = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];

export function makeMatchId(g, a, b) {
  return `${g}${a}${b}`;
}

export function buildInitialMatches() {
  const matches = [];
  Object.entries(GRP).forEach(([g, ts]) => {
    MATCH_PAIRS.forEach(([a, b]) => {
      matches.push({
        id: makeMatchId(g, a, b),
        group: g,
        home: ts[a],
        away: ts[b],
        hg: null,
        ag: null,
      });
    });
  });
  return matches;
}
