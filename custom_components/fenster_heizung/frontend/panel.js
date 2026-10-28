/* Strom & Wärme – Dashboard-Panel 2.0 (ohne externe Abhängigkeiten) */
const ICONS = {
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17.5 18z"/>',
  partly: '<circle cx="8.5" cy="8.5" r="3"/><path d="M8.5 2.5V4M2.5 8.5H4M4.3 4.3l1 1M12.7 4.3l-1 1"/><path d="M9 20a4 4 0 0 1-.4-8 5 5 0 0 1 9.6 1.5A3.4 3.4 0 0 1 17.5 20z"/>',
  rain: '<path d="M7 15a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 6.5 4.3 4.3 0 0 1 17.5 15z"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>',
  snow: '<path d="M7 15a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 6.5 4.3 4.3 0 0 1 17.5 15z"/><path d="M8 18.5h.01M12 19.5h.01M16 18.5h.01M10 21.5h.01M14 21.5h.01"/>',
  fog: '<path d="M7 13a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 4.5 4.3 4.3 0 0 1 17.5 13z"/><path d="M4 16.5h16M6 20h12"/>',
  bolt: '<path d="M7 14a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 5.5 4.3 4.3 0 0 1 17.5 14z"/><path d="M12.5 11l-2.5 4h3l-2 4"/>',
  windy: '<path d="M3 9h10a2.5 2.5 0 1 0-2.5-2.5M3 14h14a2.5 2.5 0 1 1-2.5 2.5M3 19h6"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2.2-.5-1.2.3-2.3 1.6-2.3H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8 15l3-4 3 2 5-7"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.9.7 3.2 2.4 3.5 5.2"/>',
  alert: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v5M12 17.6v.4"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  window: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M4 12h16"/>',
  windowOpen: '<rect x="3" y="3" width="9" height="18" rx="2"/><path d="M14 5l7 2v10l-7 2z"/><path d="M3 12h9"/>',
  radiator: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7.5 9.5v5M12 9.5v5M16.5 9.5v5M6 18v2M18 18v2"/>',
  flame: '<path d="M12 2.5c1.1 3 5.2 5.4 5.2 10.2A5.2 5.2 0 0 1 12 18a5.2 5.2 0 0 1-5.2-5.3c0-2.2 1.2-3.6 2.4-4.8.2 1.8 1 2.8 2 3.2C11.6 8.6 10.8 5.4 12 2.5z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  today: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4"/><circle cx="12" cy="15.5" r="1.6" fill="currentColor"/>',
  month: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
  year: '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4M8 14h8M8 17.5h8"/>',
  total: '<path d="M7.5 9C4 9 4 15 7.5 15c4 0 5-6 9-6 3.5 0 3.5 6 0 6-4 0-5-6-9-6z"/>',
  thermo: '<path d="M10 14.5V5.5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  plan: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 9h16M8 2.5v3M16 2.5v3"/><circle cx="12" cy="14.6" r="3"/><path d="M12 13.2v1.5l1 .6"/>',
  sofa: '<path d="M5 11V8.5A3 3 0 0 1 8 5.5h8a3 3 0 0 1 3 3V11"/><rect x="3" y="11" width="18" height="6" rx="2.5"/><path d="M6 17v2M18 17v2"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  dining: '<circle cx="12" cy="6.5" r="2.6"/><path d="M4 11h16M7 11v9M17 11v9"/>',
  pot: '<path d="M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM3 10h18M9 4.5c0 1.2 1 1.2 1 2.5M14 4.5c0 1.2 1 1.2 1 2.5"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5"/><circle cx="7" cy="11" r="1.8"/>',
  baby: '<circle cx="12" cy="13.5" r="6.5"/><circle cx="6.3" cy="6.8" r="2.3"/><circle cx="17.7" cy="6.8" r="2.3"/><path d="M9.8 12.5h.01M14.2 12.5h.01M10.4 16c1 .8 2.2.8 3.2 0"/>',
  desk: '<rect x="3" y="5" width="18" height="11" rx="2"/><path d="M8 20h8M12 16v4"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13"/>',
  drop: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/>',
  laundry: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13.5" r="4.5"/><path d="M8 6.5h.01M11 6.5h.01"/>',
  door: '<rect x="6" y="3" width="12" height="18" rx="1.8"/><circle cx="15" cy="12" r=".9" fill="currentColor"/>',
  stairs: '<path d="M3 20h18M3 20v-5h5v-5h5V5h8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  tree: '<circle cx="12" cy="9" r="6"/><path d="M12 15v6M8.5 21h7"/>',
  car: '<path d="M4 17v-5l2-5h12l2 5v5zM4 17v2M20 17v2M4 12h16"/><circle cx="8" cy="15" r=".9" fill="currentColor"/><circle cx="16" cy="15" r=".9" fill="currentColor"/>',
  tools: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13.5h18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  heart: '<path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  tablet: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M11 18.5h2"/>',
  suitcase: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18M12 13v2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19zM14.5 6.5l3 3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  flask: '<path d="M9 3h6M10 3v6.5L4.6 18.4A2 2 0 0 0 6.3 21.5h11.4a2 2 0 0 0 1.7-3.1L14 9.5V3M7.5 15h9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 6.2A9.7 9.7 0 0112 6c6.4 0 10 6 10 6a17 17 0 01-3.2 3.9M6.6 7.6C3.9 9.3 2 12 2 12s3.6 6 10 6c1.5 0 2.9-.3 4.1-.8M9.9 9.9a3 3 0 004.2 4.2"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
  boiler: '<rect x="6" y="3.5" width="12" height="17" rx="4.5"/><path d="M9 10.5c1.2-1.4 2.4 1.4 3.6 0s2.4 1.4 3.6 0M9 14.5c1.2-1.4 2.4 1.4 3.6 0s2.4 1.4 3.6 0M12 3.5V2M12 20.5V22"/>',
  puzzle: '<path d="M10 4a2 2 0 1 1 4 0v1.5h4V10h-1.5a2 2 0 1 0 0 4H18v4.5h-4.5V17a2 2 0 1 0-4 0v1.5H5V14h1.5a2 2 0 1 0 0-4H5V5.5h5z"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M8.7 12l2.3 2.3 4.3-4.6"/>',
  blinds: '<rect x="4" y="3.5" width="16" height="4" rx="1"/><path d="M5.5 7.5v10M18.5 7.5v10M5.5 11h13M5.5 14.5h13M5.5 18h13"/>',
  fan: '<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2C12 6 10 3.5 7.5 4.5 5.5 5.5 7 9 10.2 10.5M13.8 12c4.2 0 6.7-2 5.7-4.5-1-2-4.5-.5-6 2.7M12 13.8c0 4.2 2 6.7 4.5 5.7 2-1 .5-4.5-2.7-6M10.2 12C6 12 3.5 14 4.5 16.5c1 2 4.5.5 6-2.7"/>',
  heatpump: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5v7M8.5 12h7"/>',
  energy: '<circle cx="12" cy="12" r="9"/><path d="M13 6l-4 6.5h3.5L11 18l4.5-7H12z"/>',
  grip: '<g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></g>',
};

/* Raumsymbole: Linie plus sanfte Füllung */
const _F = (d) => `<path d="${d}" fill="currentColor" fill-opacity=".2" stroke="none"/>`;
const _S = (d) => `<path d="${d}"/>`;
const _C = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" fill-opacity=".2"/>`;
const _P = (d) => _F(d) + _S(d);
Object.assign(ICONS, {
  nfc: _S("M6 8a8 8 0 0 1 0 8M10 6a11 11 0 0 1 0 12M14 4a14 14 0 0 1 0 16") + _C(18, 12, 3),
  sofa: _F("M3 13.5A2.5 2.5 0 0 1 5.5 11h13a2.5 2.5 0 0 1 2.5 2.5V17H3z") + _S("M5 11V8.5A3 3 0 0 1 8 5.5h8a3 3 0 0 1 3 3V11M3 13.5A2.5 2.5 0 0 1 5.5 11h13a2.5 2.5 0 0 1 2.5 2.5V17H3zM6 17v2M18 17v2"),
  tv: _P("M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z") + _S("M8 21h8M12 17v4"),
  dining: _P("M8 8h8l1.5 3h-11z") + _S("M12 3v5M3.5 15h17M6 15v5.5M18 15v5.5"),
  pot: _P("M5 10h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z") + _S("M3 10h18M9 4.5c0 1.2 1 1.2 1 2.5M14 4.5c0 1.2 1 1.2 1 2.5"),
  bed: _F("M3 14h18v5H3z") + _S("M3 19V6M3 14h18v5M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5") + _C(7, 11, 1.8),
  baby: _C(12, 13.5, 6.5) + '<circle cx="12" cy="13.5" r="6.5"/><circle cx="6.3" cy="6.8" r="2.3"/><circle cx="17.7" cy="6.8" r="2.3"/><path d="M9.8 12.5h.01M14.2 12.5h.01M10.4 16c1 .8 2.2.8 3.2 0"/>',
  desk: _P("M8 4h8v6H8z") + _S("M12 10v2M4 14h16M6 14v6M18 14v6"),
  book: _P("M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5z") + _S("M12 6.5C14 5 17 4.5 20 5v13c-3-.5-6 0-8 1.5V6.5"),
  drop: _P("M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"),
  laundry: _P("M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5z") + _C(12, 13.5, 4.5) + '<circle cx="12" cy="13.5" r="4.5"/><path d="M8 6.5h.01M11 6.5h.01"/>',
  door: _P("M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16H6z") + '<circle cx="15" cy="12.5" r=".9" fill="currentColor"/>' + _S("M3 21h18"),
  stairs: _P("M3 20v-5h5v-5h5V5h8v15z"),
  sun: _C(12, 12, 4) + '<circle cx="12" cy="12" r="4"/>' + _S("M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"),
  tree: _C(12, 9, 6) + '<circle cx="12" cy="9" r="6"/>' + _S("M12 15v6M8.5 21h7"),
  car: _P("M4 17v-5l2-5h12l2 5v5z") + _S("M4 17v2M20 17v2M4 12h16") + '<circle cx="8" cy="15" r=".9" fill="currentColor"/><circle cx="16" cy="15" r=".9" fill="currentColor"/>',
  tools: _P("M3 8h18v12H3z") + _S("M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13.5h18"),
  bath: _P("M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z") + _S("M6 12V6.5A2.5 2.5 0 0 1 8.5 4C10 4 11 5 11 6.5M6 19l-1 2M18 19l1 2"),
  shower: _P("M5 11a7 7 0 0 1 14 0z") + _S("M12 4V3M8 14v2M12 14v3M16 14v2M10 19.5v1.5M14 19.5v1.5"),
  toilet: _F("M5 12h14a7 7 0 0 1-7 7 7 7 0 0 1-7-7z") + _S("M8 12V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v7M5 12h14a7 7 0 0 1-7 7 7 7 0 0 1-7-7zM10 19v2M14 19v2"),
  wardrobe: _P("M4.5 3h15a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z") + _S("M12 3v18M9.5 12h.01M14.5 12h.01M7 21v1M17 21v1"),
  hanger: _F("M12 10.5L3.5 17a1.4 1.4 0 0 0 .9 2.5h15.2a1.4 1.4 0 0 0 .9-2.5z") + _S("M12 6.5a2 2 0 1 1 2 2c-1 .5-2 1-2 2L3.5 17a1.4 1.4 0 0 0 .9 2.5h15.2a1.4 1.4 0 0 0 .9-2.5L12 10.5"),
  plant: _P("M7 15h10l-1.2 5.2a1 1 0 0 1-1 .8H9.2a1 1 0 0 1-1-.8z") + _S("M12 15V9M12 11c0-3 2-5 5-5 0 3-2 5-5 5M12 13c0-2.5-1.8-4-4.5-4 0 2.5 1.8 4 4.5 4"),
  lamp: _P("M8 4h8l3 9H5z") + _S("M12 13v6M8 21h8"),
  fireplace: _F("M7 20v-6a5 5 0 0 1 10 0v6z") + _S("M3 4h18v16H3zM7 20v-6a5 5 0 0 1 10 0v6M12 19c-1.8 0-3-1.2-3-2.8 0-1.4 1.2-2.4 1.6-3.7.8.7 1.1 1.4 1.1 2 .6-.4.9-1 .9-1.8 1.4.8 2.4 2.2 2.4 3.5 0 1.6-1.2 2.8-3 2.8z"),
  gamepad: _P("M7 8h10a4 4 0 0 1 4 4v1.5a3 3 0 0 1-5.2 2L14.5 14h-5l-1.3 1.5A3 3 0 0 1 3 13.5V12a4 4 0 0 1 4-4z") + _S("M8 10.5v3M6.5 12h3M16 11h.01M18 13h.01"),
  music: _C(6, 18, 3) + _C(17, 16, 3) + _S("M9 18V6l11-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"),
  dumbbell: _F("M5 6.5h3v11H5zM16 6.5h3v11h-3z") + _S("M5 6.5h3v11H5zM16 6.5h3v11h-3zM3 9v6M21 9v6M8 12h8"),
  bike: _C(6, 16, 3.5) + _C(18, 16, 3.5) + '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/>' + _S("M6 16l4-8h4l4 8M10 8H8M14 8l-3 8H6"),
  fridge: _P("M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z") + _S("M5 10h14M8.5 6v1.5M8.5 13v3"),
  wine: _P("M8 3h8l-.5 6a3.5 3.5 0 0 1-7 0z") + _S("M12 12.5V20M8.5 20h7"),
  paw: _C(6.5, 10.5, 1.7) + _C(10, 6.5, 1.7) + _C(14, 6.5, 1.7) + _C(17.5, 10.5, 1.7) + '<circle cx="6.5" cy="10.5" r="1.7"/><circle cx="10" cy="6.5" r="1.7"/><circle cx="14" cy="6.5" r="1.7"/><circle cx="17.5" cy="10.5" r="1.7"/>' + _P("M12 12c-3 0-5 3-5 5.2 0 1.8 1.5 2.3 3 2 .7-.2 1.3-.4 2-.4s1.3.2 2 .4c1.5.3 3-.2 3-2 0-2.2-2-5.2-5-5.2z"),
  blocks: _P("M4 13h7v7H4zM13 13h7v7h-7zM8.5 5h7v7h-7z"),
  roof: _F("M5 11v9h14v-9L12 5z") + _S("M2.5 12.5L12 4l9.5 8.5M5 11v9h14v-9M10 20v-5h4v5"),
  crate: _P("M4 5h16v14H4z") + _S("M4 10h16M10 13.5h4"),
  wave: _S("M3 9c2 0 2-1.5 4.5-1.5S10 9 12 9s2-1.5 4.5-1.5S19 9 21 9M3 14c2 0 2-1.5 4.5-1.5S10 14 12 14s2-1.5 4.5-1.5S19 14 21 14M3 19c2 0 2-1.5 4.5-1.5S10 19 12 19s2-1.5 4.5-1.5S19 19 21 19"),
  balcony: _F("M3 11h18v9H3z") + _S("M3 11h18M5 11v9M9 11v9M12 11v9M15 11v9M19 11v9M3 20h18M7 7V4h10v3"),
  radiator: _P("M3 6h18v12H3z") + _S("M7.5 9.5v5M12 9.5v5M16.5 9.5v5M6 18v2M18 18v2"),
  window: _P("M4 3h16v18H4z") + _S("M12 3v18M4 12h16"),
  suitcase: _P("M3 8h18v12H3z") + _S("M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18M12 13v2"),
});
const ic = (n, s = 22) =>
  `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.door}</svg>`;

const ICON_GROUPS = [
  ["Wohnen", [["sofa", "Wohnzimmer"], ["tv", "Medien"], ["dining", "Esszimmer"], ["fireplace", "Kamin"], ["lamp", "Lampe"], ["plant", "Pflanzen"], ["gamepad", "Spielen"], ["music", "Musik"], ["book", "Bibliothek"]]],
  ["Küche & Haushalt", [["pot", "Küche"], ["fridge", "Vorrat"], ["wine", "Weinkeller"], ["laundry", "Waschküche"], ["crate", "Keller"]]],
  ["Schlafen & Bad", [["bed", "Schlafzimmer"], ["baby", "Kinderzimmer"], ["blocks", "Spielzimmer"], ["wardrobe", "Schrank"], ["hanger", "Ankleidezimmer"], ["suitcase", "Gästezimmer"], ["bath", "Badewanne"], ["shower", "Dusche"], ["toilet", "WC"], ["drop", "Bad"]]],
  ["Arbeit & Hobby", [["desk", "Büro"], ["tools", "Werkstatt"], ["dumbbell", "Fitness"], ["bike", "Fahrrad"], ["paw", "Haustier"], ["radiator", "Heizungsraum"]]],
  ["Haus & Außen", [["door", "Flur"], ["stairs", "Treppe"], ["roof", "Dachboden"], ["balcony", "Balkon"], ["window", "Fenster"], ["sun", "Wintergarten"], ["tree", "Terrasse"], ["car", "Garage"], ["wave", "Pool"]]],
];
const ROOM_ICONS = ICON_GROUPS.flatMap((g) => g[1]);

/* Farbige Raumsymbole (Flachgrafiken, 48er Raster) */
const _r = (x, y, w, h, rx, f, o = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"${o}/>`;
const _c = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
const _e = (x, y, rx, ry, f) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"/>`;
const _p = (d, f, o = "") => `<path d="${d}" fill="${f}"${o}/>`;
const _l = (d, s, w = 3) => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const COLOR_ICONS = {
  sofa: _r(4, 20, 7, 17, 3.5, "#92400e") + _r(37, 20, 7, 17, 3.5, "#92400e") + _r(8, 13, 32, 17, 6, "#b45309") + _r(9, 25, 30, 11, 4, "#d97706") + _r(23.4, 25, 1.2, 11, 0, "#b45309") + _r(11, 37, 3, 5, 1, "#4b2e1a") + _r(34, 37, 3, 5, 1, "#4b2e1a"),
  tv: _r(5, 8, 38, 26, 3, "#1f2937") + _r(7.5, 10.5, 33, 21, 1.5, "#38bdf8") + _p("M7.5 24 L18 14 L28 24 L33 19 L40.5 26 V31.5 H7.5z", "#0ea5e9") + _p("M7.5 10.5 H24 L12 31.5 H7.5z", "#fff", ' fill-opacity=".18"') + _c(32, 17, 3, "#fde047") + _p("M20 34 H28 L30 38 H18z", "#6b7280") + _r(13, 38, 22, 3, 1.5, "#4b5563"),
  dining: _l("M24 5 V13", "#6b7280", 2) + _p("M15 22 Q24 6 33 22z", "#f59e0b") + _p("M20 15 Q24 9 28 15z", "#fde68a") + _c(24, 22, 2.4, "#fef08a") + _r(5, 29, 38, 4, 2, "#b7793f") + _r(9, 33, 3.5, 10, 1, "#8a5a2b") + _r(35.5, 33, 3.5, 10, 1, "#8a5a2b") + _e(15, 28.5, 4.5, 1.3, "#fff") + _e(33, 28.5, 4.5, 1.3, "#fff") + _c(24, 27, 2.6, "#ef4444") + _p("M24 24.5 q2 -2 3 -1", "#16a34a"),
  fireplace: _r(5, 8, 38, 5, 1.5, "#7c4a2d") + _r(7, 13, 34, 30, 1.5, "#b45a3c") + _p("M13 43 V28 a11 11 0 0 1 22 0 V43z", "#1f1410") + _r(15, 38, 18, 4, 2, "#7c4a2d") + _p("M24 38 C16 38 15 31 19.5 26 C20 29 22 29.5 22.5 28 C21.5 24 23 21 25 18 C26 22 28 22 30 26 C33 30 32 38 24 38z", "#f97316") + _p("M24 38 C19.5 38 19.5 33.5 22 31 C22.5 33 24 33 24.5 31.5 C27 33 28.5 38 24 38z", "#fde047") + _l("M9 18 H39 M9 24 H13 M9 30 H13 M35 24 H39 M35 30 H39 M9 36 H13 M35 36 H39", "#8f3f27", 1.2),
  lamp: _p("M14 9 H34 L40 27 H8z", "#fbbf24") + _p("M14 9 H24 L22 27 H8z", "#fde68a") + _r(22.5, 27, 3, 12, 0, "#6b7280") + _e(24, 41, 10, 3, "#4b5563") + _r(18, 38, 12, 3, 1.5, "#6b7280"),
  plant: _p("M24 29 C24 19 18 12 9 12 C9 21 14 28 24 29z", "#22c55e") + _p("M24 29 C24 17 30 8 40 8 C40 20 34 28 24 29z", "#16a34a") + _p("M24 29 C20.5 20 21.5 12 24 5 C27.5 12 27.5 20 24 29z", "#4ade80") + _r(12, 28, 24, 5, 2.5, "#ea580c") + _p("M14 33 H34 L31 44 H17z", "#c2410c") + _p("M14 33 H20 L19 44 H17z", "#fff", ' fill-opacity=".15"'),
  gamepad: _p("M12 15 H36 A9 9 0 0 1 45 24 V28 A6 6 0 0 1 34.5 32 L32 29 H16 L13.5 32 A6 6 0 0 1 3 28 V24 A9 9 0 0 1 12 15z", "#6366f1") + _p("M12 15 H36 A9 9 0 0 1 45 24 H3 A9 9 0 0 1 12 15z", "#fff", ' fill-opacity=".14"') + _r(10, 21, 10, 3.5, 1.5, "#e5e7eb") + _r(13.2, 17.8, 3.6, 10, 1.5, "#e5e7eb") + _c(33, 21, 2.3, "#facc15") + _c(38, 25, 2.3, "#ef4444") + _c(33, 29, 2.3, "#22c55e") + _c(28, 25, 2.3, "#38bdf8"),
  music: _p("M17 10 L39 5 V13 L17 18z", "#a855f7") + _r(15.5, 10, 3.5, 25, 1, "#7c3aed") + _r(35.5, 5, 3.5, 25, 1, "#7c3aed") + _e(12.5, 35, 6.5, 5, "#7c3aed") + _e(32.5, 30, 6.5, 5, "#7c3aed") + _e(10.8, 33.8, 2.2, 1.2, "#c4b5fd") + _e(30.8, 28.8, 2.2, 1.2, "#c4b5fd"),
  book: _p("M3 11 V38 C10 35.5 17 36 24 41 C31 36 38 35.5 45 38 V11 C38 9 31 9 24 13 C17 9 10 9 3 11z", "#1d4ed8") + _p("M24 15 C18 10.5 11 10.5 6 12.5 V34.5 C11.5 32.5 18 33 24 37.5z", "#fff7e0") + _p("M24 15 C30 10.5 37 10.5 42 12.5 V34.5 C36.5 32.5 30 33 24 37.5z", "#fffbeb") + _l("M10 17 C13 16 16 16.3 20 18 M10 22 C13 21 16 21.3 20 23 M28 18 C32 16.3 35 16 38 17 M28 23 C32 21.3 35 21 38 22", "#cbd5e1", 1.4) + _p("M33 12 L37 12.5 V22 L35 20 L33 22z", "#ef4444"),
  pot: _l("M12 14 C10 11 14 9 12 6 M20 14 C18 11 22 9 20 6 M28 14 C26 11 30 9 28 6", "#cbd5e1", 2) + _r(2, 26, 7, 3.5, 1.7, "#4b5563") + _r(39, 26, 7, 3.5, 1.7, "#4b5563") + _p("M7 22 H41 V35 a7 7 0 0 1 -7 7 H14 a7 7 0 0 1 -7 -7z", "#9ca3af") + _p("M7 22 H16 V42 H14 a7 7 0 0 1 -7 -7z", "#fff", ' fill-opacity=".22"') + _r(5, 19, 38, 4.5, 2.2, "#d1d5db") + _c(24, 17, 3, "#4b5563"),
  fridge: _r(11, 4, 26, 39, 4, "#e5e7eb") + _r(31, 4, 6, 39, 3, "#cbd5e1") + _r(11, 17, 26, 2, 0, "#9ca3af") + _r(15, 9, 2.4, 5, 1.2, "#6b7280") + _r(15, 22, 2.4, 10, 1.2, "#6b7280") + _r(14, 43, 4, 2, 1, "#6b7280") + _r(30, 43, 4, 2, 1, "#6b7280") + _c(26, 8, 1.4, "#38bdf8"),
  wine: _p("M14 5 H34 L33 19 a9 9 0 0 1 -18 0z", "#f3f4f6") + _p("M15.2 13 H32.8 L32.4 19 a8.4 8.4 0 0 1 -16.8 0z", "#be123c") + _p("M17 15 q1 6 4 8", "#fff") + _r(22.5, 28, 3, 11, 0, "#e5e7eb") + _e(24, 41, 9, 2.8, "#e5e7eb") + _l("M17 15 q1 6 4 8", "#fda4af", 1.5),
  laundry: _r(7, 4, 34, 39, 5, "#f3f4f6") + _r(7, 4, 34, 9, 4, "#e5e7eb") + _c(14, 8.5, 2, "#38bdf8") + _c(20, 8.5, 2, "#f87171") + _r(29, 7, 8, 3, 1.5, "#9ca3af") + _c(24, 28, 12, "#9ca3af") + _c(24, 28, 9.5, "#3b82f6") + _p("M14.5 28 a9.5 9.5 0 0 0 19 0 q-4.7 -3.5 -9.5 0 q-4.7 3.5 -9.5 0z", "#93c5fd") + _p("M17 22 a9 9 0 0 1 8 -3", "#fff", ' fill-opacity=".0"') + _l("M18 23 a8 8 0 0 1 6 -3", "#fff", 2),
  crate: _r(5, 12, 38, 29, 2, "#c58a45") + _r(5, 12, 38, 7, 1, "#d9a05b") + _r(5, 22, 38, 7, 1, "#d9a05b") + _r(5, 32, 38, 9, 1, "#d9a05b") + _r(5, 12, 5, 29, 1, "#8a5a2b") + _r(38, 12, 5, 29, 1, "#8a5a2b") + _l("M10 19 L38 22 M10 29 L38 32", "#a06a30", 0) + _r(18, 24.5, 12, 4, 1, "#fde68a") + _c(7.5, 16, 1, "#4b2e1a") + _c(40.5, 16, 1, "#4b2e1a") + _c(7.5, 37, 1, "#4b2e1a") + _c(40.5, 37, 1, "#4b2e1a"),
  bed: _r(4, 12, 5, 30, 2, "#8a5a2b") + _r(4, 31, 40, 8, 2, "#a8703a") + _r(9, 24, 35, 9, 3, "#f3f4f6") + _p("M20 24 H41 a3 3 0 0 1 3 3 V33 H20z", "#3b82f6") + _p("M20 24 H41 a3 3 0 0 1 3 3 H20z", "#fff", ' fill-opacity=".2"') + _r(10.5, 19, 11, 7, 3.5, "#fff") + _r(10.5, 23, 11, 3, 1.5, "#e5e7eb") + _r(5, 39, 4, 4, 1, "#6b4423") + _r(39, 39, 4, 4, 1, "#6b4423"),
  baby: _c(11, 13, 6.5, "#c98a4b") + _c(37, 13, 6.5, "#c98a4b") + _c(11, 13, 3.4, "#f0c28d") + _c(37, 13, 3.4, "#f0c28d") + _c(24, 26, 16, "#c98a4b") + _e(24, 32, 8, 6, "#f5d3a8") + _c(18, 23, 2.2, "#3b2a1a") + _c(30, 23, 2.2, "#3b2a1a") + _c(18.7, 22.3, .7, "#fff") + _c(30.7, 22.3, .7, "#fff") + _e(24, 29.5, 3, 2.1, "#3b2a1a") + _l("M24 31.5 V33.5 M20.5 34 q3.5 3 7 0", "#3b2a1a", 1.4) + _p("M18 40 L24 43 L30 40 L24 38z", "#ef4444"),
  blocks: _r(4, 26, 18, 18, 2.5, "#ef4444") + _r(26, 26, 18, 18, 2.5, "#3b82f6") + _r(15, 7, 18, 18, 2.5, "#facc15") + _c(13, 35, 5, "#fff") + _p("M35 31 L41 41 H29z", "#fff") + _r(20, 12, 8, 8, 1, "#fff") + _p("M4 26 H22 L22 29 H4z", "#fff", ' fill-opacity=".2"') + _p("M26 26 H44 V29 H26z", "#fff", ' fill-opacity=".2"') + _p("M15 7 H33 V10 H15z", "#fff", ' fill-opacity=".3"'),
  wardrobe: _r(5, 3, 38, 4, 1.5, "#8a5a2b") + _r(7, 7, 34, 35, 1.5, "#a8703a") + _r(9, 9, 14.5, 31, 1, "#c58a45") + _r(24.5, 9, 14.5, 31, 1, "#c58a45") + _r(12, 12, 8.5, 25, 1, "#d9a05b") + _r(27.5, 12, 8.5, 25, 1, "#d9a05b") + _c(21, 25, 1.5, "#fde68a") + _c(27, 25, 1.5, "#fde68a") + _r(9, 42, 4, 3, 1, "#6b4423") + _r(35, 42, 4, 3, 1, "#6b4423"),
  hanger: _l("M24 17 C24 14 28 14 28 10.5 A4 4 0 1 0 20 10.5", "#9ca3af", 2.6) + _p("M24 16 L4.5 31 A2.8 2.8 0 0 0 6.3 36 H41.7 A2.8 2.8 0 0 0 43.5 31z", "#d6a56a") + _p("M24 16 L4.5 31 A2.8 2.8 0 0 0 6.3 36 H14 L24 16z", "#fff", ' fill-opacity=".15"') + _r(6, 34.5, 36, 3.5, 1.7, "#a8703a"),
  suitcase: _l("M17 14 V10 a2 2 0 0 1 2 -2 H29 a2 2 0 0 1 2 2 V14", "#6b4423", 3) + _r(5, 14, 38, 27, 5, "#a8703a") + _r(5, 14, 38, 10, 5, "#c58a45") + _r(13, 14, 4, 27, 0, "#7c4a2d") + _r(31, 14, 4, 27, 0, "#7c4a2d") + _r(21, 22, 6, 5, 1.2, "#fde68a") + _r(9, 41, 5, 3, 1.5, "#4b2e1a") + _r(34, 41, 5, 3, 1.5, "#4b2e1a"),
  bath: _l("M9 22 V12 a5 5 0 0 1 10 0", "#9ca3af", 3) + _c(33, 14, 3.4, "#bae6fd") + _c(39, 9, 2.4, "#bae6fd") + _c(28, 9, 1.8, "#bae6fd") + _r(3, 21, 42, 5, 2.5, "#fff") + _p("M5 26 H43 V29 a11 11 0 0 1 -11 11 H16 A11 11 0 0 1 5 29z", "#f3f4f6") + _p("M5 26 H43 V28 H5z", "#7dd3fc") + _p("M24 40 H32 a11 11 0 0 0 11 -11 V28 H24z", "#cbd5e1", ' fill-opacity=".7"') + _r(10, 40, 4, 4, 1.5, "#9ca3af") + _r(34, 40, 4, 4, 1.5, "#9ca3af"),
  shower: _r(23, 3, 3.4, 8, 1.5, "#6b7280") + _p("M7 24 a17 15 0 0 1 34 0z", "#9ca3af") + _p("M7 24 a17 15 0 0 1 12 -14.3 A22 18 0 0 0 14 24z", "#fff", ' fill-opacity=".25"') + _r(5, 24, 38, 3, 1.5, "#6b7280") + _p("M12 31 q1.6 3 0 5 q-1.6 -2 0 -5z M20 33 q1.6 3.5 0 6 q-1.6 -2.5 0 -6z M28 31 q1.6 3 0 5 q-1.6 -2 0 -5z M36 33 q1.6 3.5 0 6 q-1.6 -2.5 0 -6z M16 40 q1.4 2.5 0 4 q-1.4 -1.5 0 -4z M24 41 q1.4 2.5 0 4 q-1.4 -1.5 0 -4z M32 40 q1.4 2.5 0 4 q-1.4 -1.5 0 -4z", "#38bdf8"),
  toilet: _r(13, 4, 22, 13, 3.5, "#f3f4f6") + _c(24, 8.5, 2, "#9ca3af") + _e(24, 21, 17, 3.5, "#e5e7eb") + _p("M8 21 H40 C40 31 33 36 24 36 S8 31 8 21z", "#f9fafb") + _e(24, 21, 14, 2.4, "#cbd5e1") + _p("M24 36 C33 36 40 31 40 21 H34 C34 27 30 31 24 33z", "#e5e7eb") + _p("M16 36 H32 V43 a2 2 0 0 1 -2 2 H18 a2 2 0 0 1 -2 -2z", "#e5e7eb"),
  drop: _p("M24 4 C32 14 38 21 38 29 a14 14 0 0 1 -28 0 C10 21 16 14 24 4z", "#38bdf8") + _p("M24 4 C16 14 10 21 10 29 a14 14 0 0 0 9 13 C13 37 14 22 24 4z", "#0ea5e9") + _e(17, 31, 3, 5.5, "#fff").replace('/>', ' fill-opacity=".5" transform="rotate(20 17 31)"/>'),
  desk: _r(12, 5, 24, 16, 2, "#1f2937") + _r(14, 7, 20, 12, 1, "#60a5fa") + _p("M14 15 L21 10 L27 15 L30 12 L34 16 V19 H14z", "#2563eb") + _r(22, 21, 4, 4, 0, "#6b7280") + _r(4, 26, 40, 4.5, 2, "#b7793f") + _r(16, 24, 16, 2, 1, "#e5e7eb") + _r(7, 30.5, 3.5, 13, 1, "#8a5a2b") + _r(37.5, 30.5, 3.5, 13, 1, "#8a5a2b") + _r(25, 30.5, 11, 9, 1.5, "#a8703a") + _r(29, 34, 3, 1.6, .8, "#fde68a") + _r(10, 21.5, 4.5, 4.5, 1, "#f9fafb") + _l("M14.5 22.6 q2.5 0.8 0 2.8", "#f9fafb", 1),
  tools: _l("M16 18 V13 a2.5 2.5 0 0 1 2.5 -2.5 H29.5 A2.5 2.5 0 0 1 32 13 V18", "#4b5563", 3) + _r(4, 18, 40, 24, 3.5, "#dc2626") + _r(4, 18, 40, 9, 3.5, "#ef4444") + _r(4, 26, 40, 2, 0, "#991b1b") + _r(20, 24, 8, 7, 1.5, "#fde68a") + _r(20, 24, 8, 2, 1, "#fff", ' fill-opacity=".4"') + _r(6, 31, 36, 1.5, 0, "#991b1b", ' fill-opacity=".0"'),
  dumbbell: _r(13, 21, 22, 6, 3, "#9ca3af") + _r(5, 13, 7, 22, 3, "#374151") + _r(36, 13, 7, 22, 3, "#374151") + _r(10, 16, 5, 16, 2, "#4b5563") + _r(33, 16, 5, 16, 2, "#4b5563") + _r(2, 18, 4, 12, 2, "#ef4444") + _r(42, 18, 4, 12, 2, "#ef4444") + _r(15, 21, 18, 2, 1, "#fff", ' fill-opacity=".35"'),
  bike: _c(11, 32, 8.5, "none").replace('fill="none"', 'fill="#e5e7eb" fill-opacity=".25" stroke="#374151" stroke-width="3"') + _c(37, 32, 8.5, "none").replace('fill="none"', 'fill="#e5e7eb" fill-opacity=".25" stroke="#374151" stroke-width="3"') + _l("M11 32 L19 16 L31 16 L37 32 M19 16 L25 32 H11 M25 32 L31 16", "#ef4444", 3) + _r(14.5, 11.5, 9, 3.4, 1.7, "#1f2937") + _l("M31 16 L29 9 H35", "#374151", 3) + _c(11, 32, 2, "#9ca3af") + _c(37, 32, 2, "#9ca3af") + _c(25, 32, 2.4, "#374151"),
  paw: _e(9.5, 21, 4.2, 5.4, "#c2763a").replace('/>', ' transform="rotate(-25 9.5 21)"/>') + _e(18, 11.5, 4.4, 5.8, "#c2763a").replace('/>', ' transform="rotate(-8 18 11.5)"/>') + _e(30, 11.5, 4.4, 5.8, "#c2763a").replace('/>', ' transform="rotate(8 30 11.5)"/>') + _e(38.5, 21, 4.2, 5.4, "#c2763a").replace('/>', ' transform="rotate(25 38.5 21)"/>') + _p("M24 22 C16 22 10 30 10 36 C10 41 15 42 19 40.5 C22 39.5 26 39.5 29 40.5 C33 42 38 41 38 36 C38 30 32 22 24 22z", "#8a4b1f") + _p("M24 22 C16 22 10 30 10 36 C10 38 11 39.5 13 40.2 C11 33 16 25 24 22z", "#fff", ' fill-opacity=".15"'),
  radiator: _r(8, 8, 32, 5, 2.5, "#e5e7eb") + _r(6, 13, 36, 24, 3, "#f3f4f6") + [11, 17.5, 24, 30.5].map((x) => _r(x, 16, 5, 18, 2.5, "#d1d5db")).join("") + [11, 17.5, 24, 30.5].map((x) => _r(x + 3.6, 16, 1.4, 18, .7, "#fff")).join("") + _r(10, 37, 3.4, 6, 1, "#9ca3af") + _r(34.6, 37, 3.4, 6, 1, "#9ca3af") + _r(38, 4, 5, 6, 1.2, "#6b7280") + _c(40.5, 5, 3, "#ef4444"),
  door: _r(11, 4, 26, 38, 2, "#8a5a2b") + _r(13, 6, 22, 36, 1, "#b7793f") + _r(16, 9, 16, 13, 1.5, "#a06a30") + _r(16, 25, 16, 14, 1.5, "#a06a30") + _r(16.8, 9.8, 14.4, 11.4, 1, "#c58a45") + _r(16.8, 25.8, 14.4, 12.4, 1, "#c58a45") + _c(32, 25, 2, "#fde68a") + _r(8, 42, 32, 3, 1.5, "#9ca3af"),
  stairs: _p("M4 44 V36 H15 V28 H26 V20 H44 V44z", "#a8703a") + _r(4, 33, 11, 3.4, 1.2, "#e0b073") + _r(15, 25, 11, 3.4, 1.2, "#e0b073") + _r(26, 17, 18, 3.4, 1.2, "#e0b073") + _r(4, 40, 40, 1.2, 0, "#8a5a2b") + _l("M6 20 L44 6", "#6b7280", 2.4) + _r(7, 16, 2, 14, 1, "#6b7280") + _r(17, 12, 2, 12, 1, "#6b7280") + _r(27, 8, 2, 12, 1, "#6b7280"),
  roof: _r(33, 6, 6, 14, 1, "#7c4a2d") + _r(9, 22, 30, 21, 1.5, "#fef3c7") + _p("M3 25 L24 6 L45 25z", "#dc2626") + _p("M3 25 L24 6 L24 25z", "#fff", ' fill-opacity=".18"') + _r(20, 14, 8, 8, 1, "#bae6fd") + _l("M24 14 V22 M20 18 H28", "#fff", 1.4) + _r(19, 30, 10, 13, 1.5, "#8a5a2b") + _c(26.5, 37, 1, "#fde68a") + _r(11, 28, 6, 6, 1, "#bae6fd") + _r(31, 28, 6, 6, 1, "#bae6fd"),
  balcony: _c(37, 10, 5, "#fbbf24") + _c(37, 10, 7.5, "none").replace('fill="none"', 'fill="#fbbf24" fill-opacity=".25"') + _r(27, 18, 17, 5.5, 1.5, "#c2763a") + _c(31, 15.5, 3, "#f43f5e") + _c(37, 14.5, 3, "#fb7185") + _c(42, 15.8, 2.6, "#f43f5e") + _r(3, 24, 42, 3.4, 1.7, "#4b5563") + [6, 12.5, 19, 25.5, 32, 38.5].map((x) => _r(x, 27, 2.6, 13, 1, "#6b7280")).join("") + _r(2, 40, 44, 4, 1.5, "#9ca3af"),
  window: _r(6, 4, 36, 38, 2.5, "#f3f4f6") + [[9, 7], [25, 7], [9, 24], [25, 24]].map(([x, y]) => _r(x, y, 14, 15.5, 1.5, "#7dd3fc") + _p(`M${x} ${y} H${x + 8} L${x} ${y + 9}z`, "#fff", ' fill-opacity=".45"')).join("") + _r(4, 42, 40, 3.4, 1.5, "#d1d5db") + _r(21.5, 4, 5, 38, 0, "#e5e7eb"),
  sun: _l("M24 4 V9 M24 39 V44 M4 24 H9 M39 24 H44 M9.9 9.9 L13.4 13.4 M34.6 34.6 L38.1 38.1 M9.9 38.1 L13.4 34.6 M34.6 13.4 L38.1 9.9", "#f59e0b", 3.4) + _c(24, 24, 11.5, "#fbbf24") + _c(24, 24, 8, "#fde047") + _e(20.5, 20.5, 3.4, 2.2, "#fff").replace('/>', ' fill-opacity=".6" transform="rotate(-40 20.5 20.5)"/>'),
  tree: _e(24, 43, 15, 2.5, "#86efac").replace('/>', ' fill-opacity=".5"/>') + _r(21.5, 26, 5, 17, 1.5, "#8a5a2b") + _c(14.5, 23, 8.5, "#16a34a") + _c(33.5, 23, 8.5, "#16a34a") + _c(24, 15, 12, "#22c55e") + _c(20, 11, 5, "#4ade80").replace('/>', ' fill-opacity=".7"/>') + _c(29, 21, 1.6, "#ef4444") + _c(18, 20, 1.6, "#ef4444") + _c(25, 14, 1.6, "#ef4444"),
  car: _p("M4 31 L7.5 21 a5 5 0 0 1 4.6 -3.4 H35.9 a5 5 0 0 1 4.6 3.4 L44 31 V37 a2.5 2.5 0 0 1 -2.5 2.5 H6.5 A2.5 2.5 0 0 1 4 37z", "#3b82f6") + _p("M11 21 H22 V28 H8.5z", "#bfdbfe") + _p("M25 21 H35 L39.5 28 H25z", "#bfdbfe") + _p("M4 31 H44 V35 H4z", "#fff", ' fill-opacity=".15"') + _r(6, 29, 5, 3, 1.5, "#fde047") + _r(37, 29, 5, 3, 1.5, "#ef4444") + _c(13, 38, 5.5, "#1f2937") + _c(35, 38, 5.5, "#1f2937") + _c(13, 38, 2.2, "#9ca3af") + _c(35, 38, 2.2, "#9ca3af"),
  wave: _r(4, 8, 40, 32, 7, "#bae6fd") + _p("M4 20 C9 16 13 16 18 20 S27 24 32 20 S41 16 44 18 V33 a7 7 0 0 1 -7 7 H11 a7 7 0 0 1 -7 -7z", "#38bdf8") + _p("M4 28 C9 24 13 24 18 28 S27 32 32 28 S41 24 44 26 V33 a7 7 0 0 1 -7 7 H11 a7 7 0 0 1 -7 -7z", "#0ea5e9") + _l("M12 11 C12 6 17 6 17 11 M30 11 C30 6 35 6 35 11", "#9ca3af", 2.4).replace("M12 11 C12 6 17 6 17 11 M30 11 C30 6 35 6 35 11", "M9 8 V4 H13 M35 8 V4 H39"),
};
const ico = (k, s) => (COLOR_ICONS[k] ? ic2(k, s) : ic(k, s));
const rcStyle = (c) => `background:color-mix(in srgb,${c} 22%,var(--card));box-shadow:inset 0 0 0 2px color-mix(in srgb,${c} 70%,transparent)`;
const ic2 = (k, s = 36) => `<svg class="ic2" viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true">${COLOR_ICONS[k] || ""}</svg>`;
const ICON_COL = {
  sofa: ["#f59e0b", "#fcd34d"], tv: ["#60a5fa", "#a78bfa"], dining: ["#fb923c", "#fde047"], fireplace: ["#ef4444", "#fb923c"], lamp: ["#fbbf24", "#fde68a"], plant: ["#22c55e", "#a3e635"],
  gamepad: ["#a78bfa", "#f472b6"], music: ["#f472b6", "#c084fc"], book: ["#38bdf8", "#60a5fa"],
  pot: ["#f97316", "#fbbf24"], fridge: ["#38bdf8", "#7dd3fc"], wine: ["#e11d48", "#fb7185"], laundry: ["#2dd4bf", "#38bdf8"], crate: ["#d97706", "#fbbf24"],
  bed: ["#a78bfa", "#f472b6"], baby: ["#f59e0b", "#fb923c"], blocks: ["#f472b6", "#60a5fa"], wardrobe: ["#d97706", "#f59e0b"], hanger: ["#2dd4bf", "#a78bfa"], suitcase: ["#fb923c", "#f59e0b"],
  bath: ["#38bdf8", "#2dd4bf"], shower: ["#38bdf8", "#a78bfa"], toilet: ["#2dd4bf", "#60a5fa"], drop: ["#38bdf8", "#2dd4bf"],
  desk: ["#60a5fa", "#2dd4bf"], tools: ["#f59e0b", "#ef4444"], dumbbell: ["#ef4444", "#fb923c"], bike: ["#22c55e", "#2dd4bf"], paw: ["#fb923c", "#f472b6"], radiator: ["#ef4444", "#f59e0b"],
  door: ["#fb923c", "#fbbf24"], stairs: ["#94a3b8", "#60a5fa"], roof: ["#ef4444", "#fb923c"], balcony: ["#22c55e", "#2dd4bf"], window: ["#38bdf8", "#bae6fd"], sun: ["#f59e0b", "#fde047"],
  tree: ["#22c55e", "#a3e635"], car: ["#60a5fa", "#38bdf8"], wave: ["#38bdf8", "#2dd4bf"] };
const COLORS = ["#2dd4bf", "#f59e0b", "#a78bfa", "#f472b6", "#60a5fa", "#a3e635"];
const DEF_ACC = "#2dd4bf";
const ACCENTS = ["#2dd4bf", "#38bdf8", "#60a5fa", "#a78bfa", "#f472b6", "#fb7185", "#f59e0b", "#a3e635"];
const ROOM_COLORS = ["#2dd4bf", "#f59e0b", "#a78bfa", "#f472b6", "#60a5fa", "#a3e635", "#ef4444", "#fb923c", "#22c55e", "#38bdf8", "#c084fc", "#94a3b8"];
const HEX = /^#[0-9a-f]{6}$/i;
const onColor = (hex) => { const n = parseInt(hex.slice(1), 16), l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; return l > 0.6 ? "#06201e" : "#ffffff"; };
const WX = { sunny: ["sun", "Sonnig"], "clear-night": ["moon", "Klare Nacht"], partlycloudy: ["partly", "Leicht bewölkt"], cloudy: ["cloud", "Bewölkt"], rainy: ["rain", "Regen"], pouring: ["rain", "Starkregen"], snowy: ["snow", "Schnee"], "snowy-rainy": ["snow", "Schneeregen"], fog: ["fog", "Nebel"], hail: ["snow", "Hagel"], lightning: ["bolt", "Gewitter"], "lightning-rainy": ["bolt", "Gewitter mit Regen"], windy: ["windy", "Windig"], "windy-variant": ["windy", "Windig"], exceptional: ["info", "Ausnahmewetter"] };
const HERO_MODES = [["standard", "Standard"], ["time", "Tageszeit"], ["season", "Jahreszeit"], ["weather", "Wetter"]];
const HERO_SLOTS = { time: [["night", "Nacht"], ["sunrise", "Sonnenaufgang"], ["day", "Tag"], ["sunset", "Sonnenuntergang"]], season: [["spring", "Frühling"], ["summer", "Sommer"], ["autumn", "Herbst"], ["winter", "Winter"]], weather: [["sunny", "Sonnig"], ["clear-night", "Klare Nacht"], ["partlycloudy", "Teils bewölkt"], ["cloudy", "Bewölkt"], ["rainy", "Regen"], ["pouring", "Starkregen"], ["snowy", "Schnee"], ["fog", "Nebel"], ["lightning", "Gewitter"]] };
const MODE = {
  regelung_aktiv: { t: "Regelung aktiv", c: "green" },
  heizung_pausiert: { t: "Heizung pausiert", c: "amber" },
  nur_fenstermeldung: { t: "Heizung aus · nur Fenstermeldung", c: "slate" },
  regelung_aus: { t: "Regelung deaktiviert", c: "gray" },
};
const LOGO_URL = "/fenster_heizung_static/logo.png", PRODUCT = "Strom & Wärme";
const FUELS = {
  erdgas: { short: "Gas", label: "m³ Gas", noun: "Gasersparnis" },
  heizoel: { short: "Heizöl", label: "l Heizöl", noun: "Heizölersparnis" },
  fluessiggas: { short: "Flüssiggas", label: "l Flüssiggas", noun: "Flüssiggasersparnis" },
  pellets: { short: "Pellets", label: "kg Pellets", noun: "Pelletersparnis" },
  strom: { short: "Strom", label: "kWh Strom", noun: "Stromersparnis" },
};
const MIXED = { short: "Heizenergie", label: "kWh Heizenergie", unit: "kWh", noun: "Ersparnis" };
const unitOf = (f) => (f.unit || f.label.split(" ")[0]);
const GROUP_ICONS = ["layers", "home", "bed", "sofa", "desk"];
const BLOCKS = { hero: "Kopfkarte", presence: "Anwesenheit", tiles: "Kennzahlen", chart: "Diagramm", pv: "PV-Heizer", rooms: "Räume" };
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const wwTm = (s) => { const [h, m] = String(s || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const wwFmt = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const wwCol = (t) => (t == null ? "#64748b" : t < 30 ? "#3b82f6" : t < 40 ? "#38bdf8" : t < 48 ? "#2dd4bf" : t < 55 ? "#fbbf24" : t < 60 ? "#fb923c" : "#ef4444");
const WW_DEF = { size: 300, target: 55, day: null, boost: false, circ5: false, away: false,
  ent: { top: "", mid: "", bot: "", src: "", rod: "", pump: "", ret: "", trig: "" },
  heat: { low: 42, wd: [{ from: "05:00", to: "07:30", temp: 55 }, { from: "16:30", to: "21:30", temp: 55 }], we: [{ from: "07:00", to: "10:00", temp: 55 }, { from: "17:00", to: "21:30", temp: 55 }] },
  circ: { mode: "plan", ret_max: 45, run: 3, on: 3, every: 30, wd: [{ from: "05:30", to: "08:00" }, { from: "17:00", to: "21:30" }], we: [{ from: "07:00", to: "10:30" }, { from: "17:00", to: "21:30" }] },
  leg: { on: true, day: 5, time: "03:00", temp: 60, hold: 20, last: null },
  pv: { on: true, min: 1800, max: 62, watt: 2000 } };
const MODS = [{ id: "fh", n: 1, name: "Fenster & Heizung", short: "Fenster & Heizung", icon: "windowOpen", tag: "Smarte Fenster- und Heizungssteuerung" }, { id: "ww", n: 2, name: "Warmwasser & Zirkulation", short: "Warmwasser", icon: "boiler", tag: "Speicher, Zirkulation und Legionellenschutz" }, { id: "en", n: 3, name: "Energie-Übersicht", short: "Energie", icon: "energy", tag: "Heizung, Strom und PV im Überblick" }, { id: "gs", n: 4, name: "Gerätestrom", short: "Gerätestrom", icon: "laundry", tag: "Woher der Strom kommt und was er kostet" }, { id: "lu", n: 5, name: "Lüftung & Raumluft", short: "Lüftung", icon: "fan", tag: "KWL, CO₂ und Feuchte", beta: true }, { id: "rb", n: 6, name: "Rollläden & Beschattung", short: "Rollläden", icon: "blinds", tag: "Sonnenstand, Hitzeschutz und Heizbedarf", beta: true }, { id: "wp", n: 7, name: "Wärmepumpe", short: "Wärmepumpe", icon: "heatpump", tag: "Laufzeit, Takten und Abtauen", beta: true }, { id: "ev", n: 8, name: "Elektroauto & Wallbox", short: "E-Auto", icon: "car", tag: "Ladestand, Ladekabel, Wallbox und Kilometerstand", beta: true }, { id: "wx", n: 9, name: "Wetter & Warnungen", short: "Wetter", icon: "alert", tag: "Unwetter-, Sturm- und Frostwarnungen mit Aktionen", beta: true }, { id: "ga", n: 10, name: "Garten & Bewässerung", short: "Garten", icon: "plant", tag: "Regenprognose, Zisterne und Bewässerung bei PV-Überschuss", beta: true }, { id: "sf", n: 11, name: "Rauch- & Sicherheitsmelder", short: "Sicherheit", icon: "shield", tag: "Melder, Batteriestände und Alarme im Überblick", beta: true }, { id: "pl", n: 12, name: "Pool & Sauna", short: "Pool & Sauna", icon: "wave", tag: "Pumpe und Heizung nach PV-Überschuss und Strompreis", beta: true }, { id: "bt", n: 13, name: "Batteriespeicher-Planung", short: "Batterie", icon: "energy", tag: "Modi, Zeitplan und Ladestand-Grenzen", beta: true }, { id: "dt", n: 14, name: "Dynamischer Stromtarif", short: "Stromtarif", icon: "chart", tag: "Börsenpreis pro Stunde und günstigste Zeiten", beta: true }, { id: "wa", n: 15, name: "Wartung & Erinnerungen", short: "Wartung", icon: "tools", tag: "Schornsteinfeger, Filter, Termine und Betriebsstunden", beta: true }, { id: "sp", n: 16, name: "Solar-Prognose", short: "Prognose", icon: "sun", tag: "Ertrag heute und morgen, Prognose gegen tatsächlich", beta: true }];
const PK_HINT = { pv: /solar|pv|photovolt|erzeug|wechselrichter|inverter/i, grid: /netz|grid|einspeis|bezug|zähler|meter/i, bchg: /lad|charge|zufuhr|input/i, bdis: /entlad|discharge|abgabe|output/i, house: /haus|house|verbrauch|load|consum/i, bat: /batter|speicher|akku/i, pve: /solar|pv|ertrag|yield|produc|erzeug/i, pv2: /balkon|plug|mikro|solar|pv|erzeug/i, pve2: /balkon|plug|mikro|ertrag|yield|produc|solar|pv/i, imp: /bezug|import|from.?grid|consum|netz/i, exp: /einspeis|export|feed|to.?grid/i,
  top: /oben|top|warmwasser|speicher|boiler/i, mid: /mitte|mid|warmwasser|speicher|boiler/i, bot: /unten|bot|warmwasser|speicher|boiler/i, ret: /rücklauf|ruecklauf|return|zirkul/i, pump: /zirkul|pumpe|pump/i, src: /heiz|kessel|wärmepumpe|puffer|ventil/i, rod: /heizstab|stab|rod|boiler/i, trig: /taster|bewegung|button|trigger|motion/i, outdoor: /außen|aussen|outdoor|outside/i, hum: /feucht|humid/i, heater: /heiz|elektro|heater/i };
/* Schrittweite der Achse: 1, 2, 5 × 10^n, höchstens 5 Linien (auch bei sehr großen Werten) */
const enStep = (mx) => { const raw = Math.max(mx, 1) / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const WW_ON = ["on", "heat", "heating", "performance", "eco", "electric", "gas", "heat_pump", "high_demand"];
const EN_UNIT_E = { Wh: 0.001, kWh: 1, MWh: 1000 }, EN_UNIT_P = { W: 1, kW: 1000, MW: 1e6 };
const EN_DEF = { on: true, range: "day", sign: "", bsign: "charge", bmode: "one", pvn: "", pv2n: "", ent: { pv: "", grid: "", house: "", bat: "", bchg: "", bdis: "", pve: "", pv2: "", pve2: "", imp: "", exp: "" } };
/* Einstellungen je Modul: neue Module tragen sich hier ein und erscheinen automatisch auf der Einstellungsseite */
/* Reifegrad der Module: dev = Beispielseite, vorab = Vorabversion (echte Daten, noch nicht endgültig), beta = zum Testen */
const MOD_HOME = { id: "st", n: 0, name: "Start", short: "Start", icon: "home", tag: "Der Überblick über dein Zuhause", start: true };
const HZ_NAMES = { zuhause: "Zuhause", wetter: "Wetter", personen: "Personen", hinweise: "Hinweise", alarm: "Alarm", energie: "Energie", muell: "Müllabfuhr" };
const HZ_WIDE = ["zuhause", "energie"];
const HZ_BUBS = ["wetter", "personen", "alarm", "solar", "batterie", "auto", "fenster", "muell", "warmwasser", "preis", "hinweise"];
const HZ_BUB_DEF = ["wetter", "personen", "alarm", "solar", "batterie", "auto", "fenster", "muell"];
const HZ_BUB_N = { wetter: ["Wetter", "Außentemperatur und Wetterlage", "cloud"], personen: ["Personen zu Hause", "Anzahl der Personen daheim", "users"], alarm: ["Alarm", "Zustand der Alarmanlage", "shield"], solar: ["Solar jetzt", "Leistung der PV-Anlage", "sun"], batterie: ["Batterie", "Ladestand des Speichers", "bolt"], auto: ["E-Auto", "Ladestand und ob es lädt", "car"], fenster: ["Offene Fenster", "Anzahl offener Fenster", "windowOpen"], muell: ["Nächste Müllabfuhr", "nur wenn Modul 17 an ist", "trash"], warmwasser: ["Warmwasser", "Temperatur im Speicher", "drop"], preis: ["Strompreis", "Preis aus Modul 3", "chart"], hinweise: ["Hinweise", "Anzahl der Hinweise", "info"] };
const MOD_MU = { id: "mu", n: 17, name: "Müllabfuhr", short: "Müllabfuhr", icon: "trash", tag: "Abholtermine, Tonnen-Ampel und Erinnerung", lab: true };
const MOD_LI = { id: "li", n: 18, name: "Licht & Lampen", short: "Licht", icon: "lamp", tag: "Lampen schalten, dimmen und Szenen", lab: true };
const MU_NAMES = { tonnen: "Tonnen", next: "Nächste Abholungen", cal: "Kalender", rem: "Erinnerung am Vorabend", hint: "Hinweise", cost: "Kosten" };
const MU_WIDE = ["tonnen", "cost"];
const DAYS_SHORT_MU = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MOD_ST = { sf: "vorab", sp: "vorab", ev: "beta", wx: "beta", dt: "beta" };
const modSt = (m) => (!m ? "" : m.beta ? MOD_ST[m.id] || "dev" : m.n >= 1 && m.n <= 4 ? "stabil" : "");
const STG = { dev: { t: "In Entwicklung", h: "In Entwicklung", c: "dvl" }, beta: { t: "Beta", h: "Beta-Version", c: "beta" }, vorab: { t: "Vorabversion", h: "Vorabversion", c: "vab" }, stabil: { t: "Stabil", h: "Stabil", c: "stb" } };
const MOD_SET = { sp: { act: "spxopen", txt: "Prognose-Quelle und Ertragssensor für den Vergleich" }, wa: { act: "mdbeta", txt: "Wartungstermine, Filter und Betriebsstunden (in Entwicklung)" }, bt: { act: "mdbeta", txt: "Modi, Zeitplan und Ladestand-Grenzen (in Entwicklung)" }, dt: { act: "mdbeta", txt: "Börsenpreis, günstigste Fenster und Preisverlauf (in Entwicklung)" }, sf: { act: "sfxopen", txt: "Melderarten, Alarm-Aktionen, Batterie, Prüf-Erinnerung und Meldungen" }, pl: { act: "mdbeta", txt: "Pumpe und Heizung nach Überschuss und Preis (in Entwicklung)" }, wx: { act: "wxsopen", txt: "Grenzwerte, Vorwarnung, Aktionen, Fenster-Erinnerung und Meldungen" }, ga: { act: "mdbeta", txt: "Regenprognose, Zisterne und Bewässerung (in Entwicklung)" }, ev: { act: "mdevset", txt: "Fahrzeug- und Wallbox-Sensoren (in Entwicklung)" }, gs: { act: "mdgs", txt: "Geräte, Batteriekosten, Prognose und Meldungen" }, lu: { act: "mdbeta", txt: "Raumluft-Übersicht, KWL und CO₂ (in Entwicklung)" }, rb: { act: "mdbeta", txt: "Sonnenstand, Hitzeschutz und Heizbedarf (in Entwicklung)" }, wp: { act: "mdbeta", txt: "Laufzeit, Takten und Abtauen (in Entwicklung)" }, fh: { act: "fhset", txt: "Sommermodus, Wetter-Absenkung, PV-Überschuss und Preise" }, ww: { act: "mdsetup", txt: "Speicher, Wärmeerzeuger, Zirkulation, Legionellenschutz" }, en: { act: "mdensetup", txt: "Solaranlagen, Netz, Batterie, Hausverbrauch" } };
/* Elektroauto: Marken (nur als Beschriftung), Karosserieformen und Farben der Zeichnung */
const EV_BRANDS = ["Mercedes-Benz", "Audi", "VW", "BYD", "BMW", "Andere"];
const EV_BODIES = { limousine: "Limousine", suv: "SUV", kombi: "Kombi", kompakt: "Kompakt" };
const EV_COLORS = { blue: ["Blau", "#4f86e8", "#2f5fc4", "#152f6b", "#0a1740"], red: ["Rot", "#ef5a5a", "#c62828", "#6e1212", "#3b0a0a"], white: ["Weiß", "#ffffff", "#e5e8ee", "#aab2bf", "#6b7280"], black: ["Schwarz", "#4b5563", "#1f2937", "#0b0f14", "#000000"], silver: ["Silber", "#e5e7eb", "#b6bcc7", "#7b8494", "#4b5563"], green: ["Grün", "#4fae7a", "#2a7d52", "#12402a", "#0a2619"] };
const EV_SHAPES = {
  limousine: { tl: [296, 178], rear: 284, front: 692, wh: [372, 600], port: [308, 181], ly: 174, body: "M290 232 C286 226 284 214 284 200 C284 184 290 172 306 166 L338 158 C362 153 388 140 414 127 C432 118 452 115 474 115 L506 115 C536 115 562 134 592 156 L642 165 C668 169 688 178 692 194 C694 206 693 222 688 232 Z", glass: "M346 156 C366 152 390 140 414 128 C432 120 452 119 474 119 L506 119 C530 119 552 134 578 156 Z", gt: 119, gb: 156, gx: [350, 578], pil: 470, seams: [372, 470, 566], handles: [[434, 170], [528, 172]], mir: [586, 152] },
  suv: { tl: [286, 168], rear: 284, front: 692, wh: [372, 600], port: [308, 181], ly: 172, body: "M290 232 C286 226 284 214 284 196 C284 176 288 150 300 138 C306 130 318 124 334 121 L352 118 C360 108 372 102 392 101 L542 101 C560 101 574 118 594 144 L646 156 C672 161 690 172 692 190 C694 206 693 222 688 232 Z", glass: "M338 144 L352 122 C358 110 370 105 392 105 L542 105 C558 106 570 122 588 144 Z", gt: 105, gb: 144, gx: [340, 588], pil: 470, seams: [372, 470, 570], handles: [[434, 160], [530, 162]], mir: [590, 140] },
  kombi: { tl: [288, 176], rear: 284, front: 692, wh: [372, 600], port: [308, 181], ly: 174, body: "M290 232 C286 226 284 214 284 198 C284 180 290 166 304 160 L330 154 C340 138 356 124 386 119 L544 117 C564 118 578 134 596 154 L644 162 C668 167 688 176 692 192 C694 206 693 222 688 232 Z", glass: "M336 154 C346 138 360 125 388 122 L544 121 C560 122 574 136 590 154 Z", gt: 121, gb: 154, gx: [340, 590], pil: 472, seams: [384, 472, 568], handles: [[432, 168], [530, 170]], mir: [588, 150] },
  kompakt: { tl: [324, 176], rear: 314, front: 660, wh: [386, 584], port: [336, 181], ly: 174, body: "M320 232 C316 226 314 214 314 198 C314 180 320 164 336 158 L356 150 C364 132 380 118 406 114 L522 114 C546 114 564 130 580 148 L622 158 C646 164 660 176 660 192 C662 206 661 222 656 232 Z", glass: "M350 150 C358 134 374 121 406 118 L522 118 C540 119 554 132 570 148 Z", gt: 118, gb: 148, gx: [352, 570], pil: 464, seams: [394, 464, 548], handles: [[424, 163], [506, 165]], mir: [566, 144] } };
const MOD_SOON = [];
const TEMPLATE = [
  { days: [0, 1, 2, 3, 4], time: "05:30", temp: 21 }, { days: [0, 1, 2, 3, 4], time: "08:00", temp: 18 },
  { days: [0, 1, 2, 3, 4], time: "16:00", temp: 21 }, { days: [0, 1, 2, 3, 4], time: "22:00", temp: 17 },
  { days: [5, 6], time: "07:30", temp: 21 }, { days: [5, 6], time: "23:00", temp: 17 },
];
const roomIcon = (n) => {
  n = n.toLowerCase();
  const R = [[/ankleid/, "hanger"], [/kinder/, "baby"], [/spiel/, "blocks"], [/schlaf/, "bed"], [/gast/, "suitcase"], [/wohn|stube|living/, "sofa"], [/ess/, "dining"], [/kamin/, "fireplace"],
    [/k[üu]e?che|kitchen/, "pot"], [/vorrat|speise/, "fridge"], [/wein/, "wine"], [/wasch|hauswirt|hwr/, "laundry"], [/keller/, "crate"], [/b[üu]e?ro|arbeit|office/, "desk"],
    [/werk|hobby/, "tools"], [/fitness|sport/, "dumbbell"], [/dusche/, "shower"], [/wc|toilette|g[äa]ste-?wc/, "toilet"], [/wanne|bad/, "bath"], [/flur|diele|eingang/, "door"],
    [/trepp/, "stairs"], [/dach|speicher/, "roof"], [/balkon/, "balcony"], [/winter/, "sun"], [/terrass|garten/, "tree"], [/garage/, "car"], [/pool|schwimm|sauna/, "wave"],
    [/heiz|technik/, "radiator"], [/musik/, "music"], [/tv|medien|kino/, "tv"]];
  for (const [re, k] of R) if (re.test(n)) return k;
  return "door";
};
/* Raumluft: Taupunkt (Magnus), Wandfeuchte, Lüftungsdauer */
const esat = (t) => 6.112 * Math.exp((17.62 * t) / (243.12 + t));
const dewPt = (t, rh) => { const g = Math.log(Math.max(rh, 1) / 100) + (17.62 * t) / (243.12 + t); return (243.12 * g) / (17.62 - g); };
const absH = (t, rh) => (216.7 * ((rh / 100) * esat(t))) / (273.15 + t);
const ventMin = (to) => (to == null ? 10 : to < 5 ? 5 : to < 10 ? 8 : to < 15 ? 12 : to < 20 ? 20 : 30);
const MOLD = [["gering", "green"], ["erhöht", "amber"], ["hoch", "red"]];
function airCalc(t, rh, to, rhOut) {
  const td = dewPt(t, rh), ts = to == null ? t - 4 : to + 0.7 * (t - to);
  const rs = Math.min(100, (rh * esat(t)) / esat(ts)), lvl = rs >= 80 ? 2 : rs >= 70 ? 1 : 0;
  const dry = to == null ? true : rhOut != null ? absH(to, rhOut) < absH(t, rh) - 0.5 : to < t;
  return { td, ts, rs, lvl, dry };
}
const cdown = (since, need) => { const el = Math.max(0, (Date.now() - since) / 1000), tot = need * 60, left = Math.max(0, tot - el); return { left, pct: Math.min(100, (el / tot) * 100), txt: left > 0 ? `noch ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")} Min.` : "genug gelüftet, Fenster schließen" }; };
const vnum = (a) => String(a || "0").split(".").map((x) => parseInt(x, 10) || 0);
const vgt = (a, b) => { const x = vnum(a), y = vnum(b); for (let i = 0; i < 4; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
/* Elektroheizer mit PV-Überschuss */
const HTR = { pv: ["Heizt mit PV-Überschuss", "green"], wartet: ["Wartet auf Überschuss", "amber"], warm: ["Raum warm genug", "slate"], fenster: ["Fenster offen", "amber"], zeit: ["Außerhalb des Zeitfensters", "gray"], aus: ["Heizer pausiert", "gray"], soc: ["Batterie lädt zuerst", "amber"] };
const WZ_STEPS = ["Willkommen", "Räume", "Fenstermeldung", "Heizung & Energie", "Luftfeuchte", "PV & Elektroheizer", "Meldungen", "Zusammenfassung"];
const DG_ROLES = { window: "Fenstersensor", thermo: "Thermostat", hum: "Luftfeuchte", heater: "Elektroheizer", power: "Heizer-Leistung", pv: "PV-Einspeisung", soc: "Batterie", price: "Strompreis", feed: "Einspeisevergütung", outdoor: "Außentemperatur", heating: "Heizungs-Status" };
const num2 = (v) => (Number(v) || 0).toLocaleString("de-DE", { maximumFractionDigits: 1 });
const PVDEF = { sensor: "", sign: "export", reserve: 200, delay: 3, minrun: 10, soc_sensor: "", soc_min: 80, price: 32, feed: 8, price_mode: "fix", price_sensor: "", feed_mode: "fix", feed_sensor: "" };
const stepsOf = (h) => (Array.isArray(h.stufen) && h.stufen.length ? h.stufen : [Number(h.watt) || 0]).map(Number).filter((x) => x > 0).sort((a, b) => a - b);
const parseSteps = (t) => String(t || "").split(/[;,\s]+/).map((x) => parseInt(x, 10)).filter((x) => x > 0 && x <= 10000).sort((a, b) => a - b);
const wfmt = (w) => (w >= 1000 ? `${(w / 1000).toLocaleString("de-DE", { maximumFractionDigits: 2 })} kW` : `${Math.round(w).toLocaleString("de-DE")} W`);
const hmin = (m) => { m = Math.round(m); return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")} h` : `${m} Min.`; };
const num = (v, d = 0) => (Number(v) || 0).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---- Heizplan-Rechnung (gleiche Logik wie im Backend) ---- */
const toMin = (t) => { const [h, m] = String(t || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const fmtT = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const STOPS = [[14, [59, 130, 246]], [17, [56, 189, 248]], [19, [253, 224, 71]], [21, [245, 158, 11]], [24, [239, 68, 68]]];
const heat = (t) => {
  t = Math.min(Math.max(Number(t) || 14, 14), 24);
  let i = 0; while (i < STOPS.length - 2 && t > STOPS[i + 1][0]) i++;
  const [a, ca] = STOPS[i], [b, cb] = STOPS[i + 1], k = (t - a) / (b - a);
  return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(",")})`;
};
const points = (entries) => (entries || []).flatMap((e) => (e.days || []).map((d) => ({ w: d * 1440 + toMin(e.time), t: Number(e.temp) }))).sort((a, b) => a.w - b.w);
const at = (pts, w) => { if (!pts.length) return null; let c = pts[pts.length - 1]; for (const p of pts) { if (p.w <= w) c = p; else break; } return c.t; };
const nextPt = (pts, w) => (pts.length ? pts.find((p) => p.w > w) || { ...pts[0], w: pts[0].w + 10080 } : null);
const segs = (pts, d) => {
  const lo = d * 1440, cuts = pts.filter((p) => p.w >= lo && p.w < lo + 1440), out = [];
  let start = 0, t = at(pts, lo);
  for (const c of cuts) { const m = c.w - lo; if (m > start) out.push({ s: start, e: m, t }); start = m; t = c.t; }
  out.push({ s: start, e: 1440, t });
  return out;
};
const nowMin = () => { const n = new Date(); return ((n.getDay() + 6) % 7) * 1440 + n.getHours() * 60 + n.getMinutes(); };
const bar = (pts, d, now) => `<div class="tlw"><div class="tl">${segs(pts, d).map((s) =>
  `<i style="width:${(s.e - s.s) / 14.4}%;background:${heat(s.t)}" title="${fmtT(s.s)}–${fmtT(s.e % 1440 || 1440)} · ${num(s.t, 1)} °C"></i>`).join("")}</div>${now != null ? `<b style="left:${(now % 1440) / 14.4}%"></b>` : ""}</div>
  <div class="tla"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>`;

const HA_PAGE = "/config/integrations/integration/fenster_heizung";
const num0 = (v) => String(v).replace(".", ",");
const barRow = (pts, d, now) => `<div class="tlw"><div class="tl">${segs(pts, d).map((s) =>
  `<i style="width:${(s.e - s.s) / 14.4}%;background:${heat(s.t)}" title="${fmtT(s.s)}–${fmtT(s.e % 1440 || 1440)} · ${num(s.t, 1)} °C"></i>`).join("")}</div>${now != null ? `<b style="left:${(now % 1440) / 14.4}%"></b>` : ""}</div>`;

const CSS = `
.room.hph,.crow.hph{background-size:cover;background-position:center}
.room.hph{background-image:linear-gradient(180deg,color-mix(in srgb,var(--card) 50%,transparent) 0,color-mix(in srgb,var(--card) 84%,transparent) 34%,color-mix(in srgb,var(--card) 95%,transparent) 100%),var(--ph)}
.crow.hph{background-image:linear-gradient(90deg,color-mix(in srgb,var(--card) 97%,transparent) 0,color-mix(in srgb,var(--card) 84%,transparent) 50%,color-mix(in srgb,var(--card) 58%,transparent) 100%),var(--ph)}
.room.hph .rn b{text-shadow:0 1px 8px color-mix(in srgb,var(--card) 80%,transparent)}
.wx{position:relative;display:flex;align-items:center;gap:12px;margin-top:12px;max-width:calc(100% - 140px);background:rgba(255,255,255,.12);backdrop-filter:blur(4px);border-radius:16px;padding:9px 16px 9px 10px;width:fit-content}
.wx .wxi{width:44px;height:44px;border-radius:13px;background:rgba(255,255,255,.16);display:grid;place-items:center;flex:none}
.wx .wxt{font-size:1.5rem;font-weight:700;line-height:1.05;letter-spacing:-.3px;white-space:nowrap}.wx .wxt small{font-size:.85rem;font-weight:500;opacity:.8;margin-left:2px}
.wx .wxc{font-size:.8rem;opacity:.92;margin-top:2px}.wx .wxd{font-size:.72rem;opacity:.72;margin-top:1px}
.swatches{display:flex;flex-wrap:wrap;gap:9px;margin:6px 0 12px;align-items:center}
.sw2{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;position:relative;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
.sw2.sel{border-color:var(--primary-text-color)}.sw2.sel::after{content:"";position:absolute;inset:9px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px rgba(0,0,0,.35)}
.sw2.auto{background:conic-gradient(#2dd4bf,#f59e0b,#a78bfa,#f472b6,#60a5fa,#2dd4bf)}
.cpick{display:inline-flex;align-items:center;gap:7px;font-size:.78rem;color:var(--mut)}
.cpick input{width:34px;height:34px;border:0;border-radius:50%;padding:0;background:none;cursor:pointer}
.phbox{display:flex;gap:12px;align-items:center;margin:6px 0 12px}
.phbox .pth{width:112px;height:63px;border-radius:12px;background:var(--primary-background-color) center/cover;border:1px solid var(--line);display:grid;place-items:center;color:var(--mut);flex:none}
.phbox .pbs{display:flex;flex-direction:column;gap:2px;align-items:flex-start}
.pkbtn{width:100%;display:flex;align-items:center;gap:10px;justify-content:space-between;text-align:left;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:9px 12px;font:inherit;margin:4px 0 10px;cursor:pointer;min-height:46px}
.pkbtn.set{border-color:var(--primary-color)}.pkt{display:flex;flex-direction:column;min-width:0}.pkt b{font-weight:600;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pkt small,.pkrow small{display:block;color:var(--secondary-text-color);font-size:.74rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pkbox{border:1px solid var(--line);border-radius:12px;margin:-4px 0 10px;padding:8px;background:var(--card-background-color,var(--primary-background-color))}
.pksearch{width:100%;box-sizing:border-box;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:9px;padding:9px;font:inherit;font-size:.9rem;margin-bottom:6px}
.pklist{max-height:260px;overflow:auto;display:flex;flex-direction:column;gap:2px}
.pkrow{display:flex;justify-content:space-between;align-items:center;gap:10px;text-align:left;background:none;border:0;color:var(--primary-text-color);font:inherit;padding:8px;border-radius:8px;cursor:pointer;min-height:44px}.pkrow[hidden]{display:none}.pkrow:hover,.pkrow.cur{background:color-mix(in srgb,var(--primary-color) 14%,transparent)}
.pkrow>span:first-child{min-width:0}.pkv{flex:none;font-size:.8rem;color:var(--secondary-text-color);text-align:right}.pkv i{display:block;font-style:normal;font-size:.68rem;color:var(--primary-color);font-weight:600}
.pkclr{color:var(--secondary-text-color)}.pkno{padding:12px;text-align:center;color:var(--secondary-text-color);font-size:.85rem}
.lsel{width:100%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:9px;font:inherit;font-size:.9rem;margin:4px 0 10px}
.ltog{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:6px 0 10px;font-size:.92rem}
.lsec{font-size:.78rem;color:var(--mut);margin:12px 0 0;display:flex;gap:6px;align-items:center;font-weight:600}
@media(max-width:520px){.wx{max-width:100%}}

:host{display:block;min-height:100%;background:var(--primary-background-color,#0f1419);color:var(--primary-text-color,#e6edf3);
  font-family:var(--paper-font-body1_-_font-family,Roboto,"Segoe UI",system-ui,sans-serif);
  --card:var(--card-background-color,#1a2129);--mut:var(--secondary-text-color,#9aa7b4);--line:var(--divider-color,#2a3440);
  --green:#34d399;--amber:#f59e0b;--slate:#7dd3fc;--gray:#94a3b8;--teal:#2dd4bf;--on-acc:#042f2e}
*{box-sizing:border-box}
button{font:inherit;color:inherit}
.bar{display:flex;align-items:center;gap:10px;padding:10px 14px;position:sticky;top:0;z-index:5;
  background:var(--app-header-background-color,var(--card));color:var(--app-header-text-color,var(--primary-text-color));border-bottom:1px solid var(--line)}
.bar .ib0{background:none;border:0;padding:6px;border-radius:50%;cursor:pointer;display:grid;place-items:center}
.brand{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
.logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;color:#fff;flex:none;
  background:linear-gradient(135deg,#14b8a6,#0e6a82);box-shadow:0 4px 12px rgba(20,184,166,.35)}
.blogo{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:none;background:#000;box-shadow:0 3px 12px rgba(0,0,0,.4),0 0 0 2px rgba(255,255,255,.14)}.bar:not(.nar) .blogo{width:52px;height:52px}.brand .pn{display:block;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:var(--teal,#2dd4bf);line-height:1.1;margin-bottom:2px}.brand b .mn{font-style:normal}.brand>div{min-width:0}.brand b{display:block;font-size:1.12rem;font-weight:700;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand div span em{font-style:normal}.brand .ver:not(:first-child)::before{content:" · "}
.brand div span{display:block;font-size:.72rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar:not(.nar){position:static;background:none;border:0;max-width:1180px;margin:0 auto;padding:18px 14px 0;gap:14px}
.bar:not(.nar) .logo{width:46px;height:46px;border-radius:14px}
.bar:not(.nar) .brand{gap:14px}
.bar:not(.nar) .brand b{font-size:1.3rem}
.bar:not(.nar) .brand div span{font-size:.82rem;margin-top:2px}
.pillbtn{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:7px 12px;font-size:.82rem;font-weight:600;cursor:pointer}
.pillbtn.pri{background:var(--teal);border-color:var(--teal);color:var(--on-acc)}
.wrap{max-width:1180px;margin:0 auto;padding:16px 14px calc(28px + env(safe-area-inset-bottom,0px));display:grid;gap:14px}
.banner{display:flex;gap:10px;align-items:flex-start;border:1px dashed var(--teal);border-radius:14px;padding:11px 13px;font-size:.84rem;color:var(--mut);background:color-mix(in srgb,var(--teal) 8%,transparent)}
.banner .ic{color:var(--teal);flex:none;margin-top:1px}
.blk.editing{outline:2px dashed var(--line);outline-offset:4px;border-radius:20px;position:relative}
.etag{display:flex;align-items:center;gap:8px;font-size:.78rem;font-weight:600;color:var(--mut);margin:0 0 8px 2px}
.grip{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--card);border:1px solid var(--line);color:var(--primary-text-color);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;flex:none}
.ghost{position:fixed!important;margin:0!important;outline:0!important;z-index:40;pointer-events:none;opacity:.97;box-shadow:0 20px 44px rgba(0,0,0,.5);border-radius:20px;background:var(--primary-background-color)}
.dragging{opacity:.28}
.drop-before{box-shadow:0 -5px 0 0 var(--teal);border-radius:4px}.drop-after{box-shadow:0 5px 0 0 var(--teal);border-radius:4px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px}
.card h2{font-size:.95rem;margin:0 0 12px;font-weight:600;display:flex;align-items:center;gap:8px}
.card h2 .ic{color:var(--teal)}
.hero{position:relative;overflow:hidden;border:0;color:#ecfeff;padding:20px 18px;min-height:168px;
  background:radial-gradient(120% 140% at 85% 0%,color-mix(in srgb,var(--teal) 82%,#000) 0%,transparent 55%),linear-gradient(135deg,color-mix(in srgb,var(--teal) 34%,#0b2c43) 0%,color-mix(in srgb,var(--teal) 10%,#0b2c43) 60%,#0b2c43 100%)}
.hero.hs{background:#0b2c43}.hero .hbg{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block}.hero .hbg.hph{background-size:cover;background-position:center}
.hero.hs::after{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(90deg,rgba(3,12,22,.55) 0%,rgba(3,12,22,.18) 62%,transparent 100%),linear-gradient(0deg,rgba(3,12,22,.35),transparent 45%);pointer-events:none}
.hero.hs>.lbl,.hero.hs>.big,.hero.hs>.sub,.hero.hs>.wx,.hero.hs>.chips{position:relative;z-index:1}.hero.hs>.art,.hero.hs>.hlogo{z-index:1}.hero.hs .big,.hero.hs .lbl,.hero.hs .sub{text-shadow:0 1px 10px rgba(0,0,0,.45)}
.hsl{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 8px;margin:0 -2px;scroll-snap-type:x proximity}.hsc{flex:none;width:132px;scroll-snap-align:start}.hsc b{display:block;font-size:.8rem;margin:5px 0 0}
.hth{position:relative;height:72px;border-radius:12px;overflow:hidden;border:2px solid transparent}.hsc.on .hth{border-color:var(--teal)}.hth .hbg{position:absolute;inset:0}.hth em{position:absolute;left:6px;top:6px;font-style:normal;font-size:.66rem;font-weight:700;background:var(--teal);color:var(--on-acc,#042f2e);border-radius:999px;padding:1px 7px}
.hac{display:flex;align-items:center;justify-content:space-between}.hac .lnk{font-size:.74rem;padding:2px 0}
.hero .art{position:absolute;right:10px;top:14px;height:104px;width:auto;max-width:44%;opacity:.95}
.hero .hlogo{position:absolute;right:14px;bottom:14px;width:48px;height:48px;border-radius:50%;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.16);background:#000}
.hero .lbl{max-width:calc(100% - 150px);font-size:.82rem;opacity:.85;display:flex;gap:6px;align-items:center}
.hero .big{font-size:2.7rem;font-weight:700;line-height:1.05;margin:6px 0 2px;letter-spacing:-.5px}
.hero .big small{font-size:1.2rem;font-weight:500;opacity:.85;margin-left:4px}
.hero .sub{font-size:.8rem;opacity:.75;max-width:55%}
.chips{position:relative;display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.chip{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.14);backdrop-filter:blur(4px);border-radius:999px;padding:6px 11px;font-size:.8rem;font-weight:500}
.tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px;position:relative;overflow:hidden}
.tile .t{display:flex;align-items:center;gap:6px;color:var(--mut);font-size:.78rem}
.tile .v{font-size:1.45rem;font-weight:700;margin-top:6px}
.tile .v small{font-size:.8rem;font-weight:500;color:var(--mut);margin-left:3px}
.tile .g{font-size:.78rem;color:var(--mut);margin-top:2px;display:flex;gap:5px;align-items:center}
.tile .g .ic{color:var(--amber)}
.tile::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--a,var(--teal))}
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px;font-size:.78rem;color:var(--mut)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.rooms{display:grid;grid-template-columns:1fr;gap:14px}
.room{display:grid;gap:12px;position:relative}
.rh{display:flex;align-items:center;gap:12px}
.rico{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#fff;flex:none;border:0;position:relative}
button.rico{cursor:pointer;outline:2px dashed rgba(255,255,255,.55);outline-offset:2px}
button.rico::after{content:"";position:absolute;right:-5px;bottom:-5px;width:18px;height:18px;border-radius:50%;background:var(--card);border:1px solid var(--line)}
.rico .pen{position:absolute;right:-4px;bottom:-4px;width:16px;height:16px;color:var(--primary-text-color);z-index:1;display:grid;place-items:center}
.rn{flex:1;min-width:0}
.rn b{font-size:1.05rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:.76rem;font-weight:600;margin-top:3px;color:var(--c)}
.pill::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 25%,transparent)}
.green{--c:var(--green)}.amber{--c:var(--amber)}.slate{--c:var(--slate)}.gray{--c:var(--gray)}
.sw{width:46px;height:26px;border-radius:999px;background:var(--line);position:relative;border:0;cursor:pointer;flex:none;transition:.2s}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:.2s}
.sw.on{background:var(--teal)}.sw.on::after{left:23px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.box{border-radius:14px;padding:11px 12px;background:color-mix(in srgb,var(--c,var(--gray)) 12%,transparent);border:1px solid color-mix(in srgb,var(--c,var(--gray)) 30%,transparent);min-width:0}
.box .t{display:flex;align-items:center;gap:7px;font-size:.78rem;color:var(--mut)}
.box .t .ic{color:var(--c,var(--mut))}
.box .v{font-weight:700;font-size:1rem;margin-top:5px}
.box .s{font-size:.75rem;color:var(--mut);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.plan{border-top:1px solid var(--line);padding-top:12px;display:grid;gap:8px}
.ph{display:flex;align-items:center;gap:8px}
.pt{display:flex;gap:7px;align-items:center;font-weight:600;font-size:.9rem;flex:1}
.pt .ic{color:var(--teal)}
.ph .pill{margin:0}
.ibtn{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:transparent;cursor:pointer;color:var(--primary-text-color);flex:none}
.pnow{font-size:.82rem;color:var(--mut)}.pnow b{color:var(--primary-text-color)}
.tlw{position:relative}
.tl{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--line)}
.tl i{display:block;height:100%}
.tlw b{position:absolute;top:-4px;bottom:-4px;width:3px;margin-left:-1.5px;border-radius:2px;background:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.4)}
.tla{display:flex;justify-content:space-between;font-size:.68rem;color:var(--mut);margin-top:3px;padding:0 1px}
.off .tl,.off .pnow{opacity:.45}
.plnk{display:flex;flex-wrap:wrap;gap:2px 22px}
.lnk{background:none;border:0;color:var(--teal);font-weight:600;font-size:.86rem;cursor:pointer;padding:6px 2px;display:inline-flex;gap:6px;align-items:center;text-align:left}
.foot{display:flex;align-items:center;gap:12px;border-top:1px solid var(--line);padding-top:12px}
.foot .a{flex:1;min-width:0}
.foot .a b{font-size:1.1rem}
.foot .a span{display:block;font-size:.76rem;color:var(--mut);margin-top:2px}
.note{text-align:center;color:var(--mut);font-size:.76rem;padding:2px 10px}
.empty{text-align:center;color:var(--mut);padding:40px 10px}
/* Dialoge */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:20}
.sheet{position:fixed;z-index:21;left:0;right:0;bottom:0;max-height:90vh;overflow:auto;background:var(--card);border-radius:22px 22px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);box-shadow:0 -10px 40px rgba(0,0,0,.45)}
.sh{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.sh>div{flex:1}.sh b{font-size:1.15rem;display:block}.sh span{font-size:.82rem;color:var(--mut)}
.row{display:flex;align-items:center;justify-content:space-between;padding:6px 0 12px;font-weight:600}
.dchips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}
.dc{border:1px solid var(--line);background:transparent;border-radius:999px;min-width:38px;padding:6px 8px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--mut)}
.dc.sel{background:var(--teal);border-color:var(--teal);color:#042f2e}
.dchips.sm .dc{min-width:34px;padding:5px 6px;font-size:.74rem}
.mut{color:var(--mut)}.sm{font-size:.76rem;margin:4px 0 12px}
.seg{display:flex;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:12px}.seg button{flex:1;background:transparent;border:0;padding:9px 6px;font-weight:600;font-size:.84rem;cursor:pointer;color:var(--mut)}.seg button.sel{background:var(--teal);color:#042f2e}
.quick{display:flex;flex-wrap:wrap;gap:4px 16px;margin:0 0 2px}.quick .lnk{font-size:.78rem;padding:2px 0}
.sp{border:1px solid var(--line);border-radius:14px;padding:11px;margin-bottom:10px;background:color-mix(in srgb,var(--primary-background-color) 55%,transparent)}
.sp1{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.sp input[type=time]{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:1.05rem;font-weight:700;width:112px}
.step{display:flex;align-items:center;gap:8px;flex:1;justify-content:center}
.step button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:transparent;cursor:pointer;display:grid;place-items:center}
.step b{min-width:72px;text-align:center;font-size:1.05rem}
.btns{display:flex;justify-content:space-between;gap:10px;margin:2px 0 12px}
.foot2{display:flex;gap:10px}
.btn2{flex:1;border-radius:14px;border:1px solid var(--line);background:transparent;padding:12px;font-weight:700;cursor:pointer}
.btn2.pri{background:var(--teal);border-color:var(--teal);color:#042f2e}
.igrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:8px;margin:6px 0 10px}
.igt{font-size:.7rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--mut);margin:12px 0 0}
.igrid button{aspect-ratio:1;border:1px solid var(--line);background:color-mix(in srgb,var(--primary-text-color) 7%,transparent);border-radius:14px;display:grid;place-items:center;cursor:pointer;padding:0;transition:transform .12s,background .12s}
.igrid button:hover{background:color-mix(in srgb,var(--primary-text-color) 13%,transparent);transform:translateY(-1px)}
.ic2{display:block}
.igrid button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 20%,transparent);box-shadow:0 0 0 1.5px var(--teal) inset}
.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;background:#111827;color:#fff;border:1px solid #334155;padding:10px 16px;border-radius:999px;font-size:.86rem;box-shadow:0 8px 24px rgba(0,0,0,.4)}
.pres h2{margin-bottom:12px}
.seg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.seg3 button{display:grid;justify-items:center;gap:5px;padding:11px 4px;border-radius:14px;border:1px solid var(--line);background:transparent;font-weight:600;font-size:.8rem;color:var(--mut);cursor:pointer}
.seg3 button[disabled]{cursor:default;opacity:.7}
.seg3 button.sel{background:color-mix(in srgb,var(--teal) 16%,transparent);border-color:var(--teal);color:var(--primary-text-color)}
.seg3 button.sel .ic{color:var(--teal)}
.pstat{font-size:.88rem;color:var(--mut);margin-bottom:10px}.pstat b{color:var(--primary-text-color)}
.pers{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.per{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:.8rem}
.per i{width:9px;height:9px;border-radius:50%;background:var(--gray)}.per.home i{background:var(--green)}
.pnote{display:flex;gap:8px;align-items:center;font-size:.8rem;color:var(--amber);background:color-mix(in srgb,var(--amber) 12%,transparent);border-radius:10px;padding:7px 10px}
.sheet input[type=date]{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit;font-size:.95rem}
.vrow{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:10px 0}
.vrow>span{font-size:.92rem}
.pl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.why{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line);background:transparent;border-radius:999px;padding:2px 9px;font-size:.72rem;color:var(--mut);cursor:pointer;margin-top:3px}
.why-l{display:grid;gap:11px;margin:6px 0 14px}
.wl{display:flex;gap:10px;align-items:flex-start;font-size:.92rem}.wl i{flex:none;width:10px;height:10px;border-radius:50%;margin-top:6px}
.wl.ok i{background:var(--green)}.wl.warn i{background:var(--amber)}.wl.info i{background:var(--gray)}
.vbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 0 10px}
.myb{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;color:var(--mut);border-radius:999px;padding:7px 12px;font-size:.82rem;font-weight:600;cursor:pointer}
.myb.on{border-color:var(--teal);color:var(--teal);background:color-mix(in srgb,var(--teal) 10%,transparent)}
.air{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 0}
@media(max-width:420px){.air{gap:5px}.air .ac{padding:7px 7px!important}.air .ac .t{font-size:.66rem;gap:3px}.air .ac .v{font-size:.92rem}.air .ac .s{font-size:.66rem}}
.air .ac{background:color-mix(in srgb,var(--c) 9%,transparent);border:1px solid color-mix(in srgb,var(--c) 28%,transparent);border-radius:12px;padding:8px 10px;min-width:0}
.air .ac .t{font-size:.7rem;color:var(--mut);display:flex;gap:5px;align-items:center;overflow-wrap:anywhere}
.air .ac .v{font-weight:700;font-size:1.02rem;margin-top:2px;overflow-wrap:anywhere}
.air .ac .s{font-size:.7rem;color:var(--mut);line-height:1.25;overflow-wrap:anywhere}
.air .gauge{height:5px;border-radius:3px;background:color-mix(in srgb,var(--mut) 25%,transparent);margin-top:6px;position:relative;overflow:hidden}
.air .gauge i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--c)}
.red{--c:#f87171}
.airmsg{display:flex;gap:8px;align-items:flex-start;font-size:.8rem;border-radius:10px;padding:8px 10px;margin-top:8px;color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}
.airmsg>div{flex:1;min-width:0;color:var(--primary-text-color)}.airmsg>div b{color:var(--c)}
.airmsg .ic{flex:none;margin-top:1px}
.airmsg .pr{height:5px;border-radius:3px;background:color-mix(in srgb,var(--c) 22%,transparent);margin-top:6px;overflow:hidden}.airmsg .pr i{display:block;height:100%;background:var(--c);transition:width 1s linear}
.airmsg.done{--c:var(--green)}
.achip{display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:600;color:var(--c);background:color-mix(in srgb,var(--c) 13%,transparent);border-radius:999px;padding:2px 8px;margin-top:4px;white-space:nowrap}
.crow .rn{display:flex;flex-direction:column;align-items:flex-start}
.upd{display:flex;align-items:center;gap:12px;border:1px solid color-mix(in srgb,var(--teal) 55%,transparent);background:color-mix(in srgb,var(--teal) 11%,transparent);border-radius:16px;padding:11px 12px 11px 14px;margin:0 0 12px}
.upd>.ic{color:var(--teal);flex:none}.upd>div{flex:1;min-width:0}.upd b{display:block;font-size:.92rem}.upd span{font-size:.78rem;color:var(--mut)}
.upd .lnk{white-space:nowrap}
.news{margin:6px 0 4px;padding:0;list-style:none;display:grid;gap:8px}
.news li{display:flex;gap:10px;align-items:flex-start;font-size:.9rem}.news li .ic{color:var(--teal);flex:none;margin-top:2px}
.myrow{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:.92rem}
.myrow>span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.myrow.off>span{opacity:.45}
.myrow .ibtn{width:34px;height:34px}
.gbox{border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:8px 0;font-size:.84rem;background:color-mix(in srgb,var(--teal) 6%,transparent)}
.gbox b{display:block;margin-bottom:3px}
.gst{display:flex;gap:8px;align-items:center;font-size:.82rem;margin:2px 0 8px;color:var(--mut)}.gst.on{color:var(--amber)}
.gbtns{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.gbtns .btn2{flex:1;min-width:150px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px}
.chip.sum{background:rgba(251,191,36,.28)}
@media(max-width:520px){.upd{flex-wrap:wrap}}
.pnote.wxa{margin-top:8px;color:var(--teal);background:color-mix(in srgb,var(--teal) 11%,transparent)}.pnote.wxa.fr{color:var(--slate);background:color-mix(in srgb,var(--slate) 12%,transparent)}
.learn{border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:0 0 12px;background:color-mix(in srgb,var(--teal) 6%,transparent)}
.learn .lt{display:flex;gap:7px;align-items:center;font-weight:700;font-size:.9rem}.learn .lt em{font-style:normal;font-weight:500;font-size:.74rem;color:var(--mut);margin-left:auto}
.learn .lbig{margin:8px 0 10px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}.learn .lbig b{font-size:1.7rem;letter-spacing:-.3px}.learn .lbig span{font-size:.8rem;color:var(--mut)}
.lrow{display:grid;grid-template-columns:104px 1fr 78px 30px;gap:8px;align-items:center;font-size:.78rem;margin:5px 0}.lrow span{color:var(--mut)}.lrow b{text-align:right;font-size:.78rem}.lrow small{color:var(--mut);text-align:right}
.lbar{height:8px;border-radius:4px;background:color-mix(in srgb,var(--mut) 22%,transparent);overflow:hidden}.lbar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--slate),var(--amber))}
.lhint{display:flex;gap:7px;align-items:flex-start;font-size:.78rem;color:var(--mut);margin-top:9px}.lhint .ic{flex:none;margin-top:1px}
.htr{margin-top:10px;border:1px solid color-mix(in srgb,var(--c) 32%,transparent);background:color-mix(in srgb,var(--c) 8%,transparent);border-radius:14px;padding:10px 12px}
.htrh{display:flex;align-items:center;gap:10px}.htri{width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--c) 22%,transparent);color:var(--c);display:grid;place-items:center;flex:none}
.htrt{flex:1;min-width:0}.htrt b{display:block;font-size:.92rem}.htrt span{font-size:.78rem;color:var(--c);font-weight:600}
.htrm{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:.74rem;color:var(--mut);margin-top:8px}
.pvb .pvh{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.pvb .pt{display:flex;gap:8px;align-items:center;font-weight:700}.pvb .pt .ic{color:#fbbf24}
.pvbig{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 10px;margin:4px 0 8px}.pvbig b{font-size:2.1rem;letter-spacing:-.4px;color:#fbbf24}.pvbig span{font-size:.8rem;color:var(--mut)}
.pvbar{display:flex;gap:2px;height:14px;border-radius:7px;background:color-mix(in srgb,var(--mut) 22%,transparent);overflow:hidden}.pvbar i{display:block;height:100%}
.pvlg{display:flex;justify-content:space-between;font-size:.74rem;color:var(--mut);margin:5px 0 8px}
.pvrows{border-top:1px solid var(--line)}.pvr{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.86rem}.pvr>i{width:10px;height:10px;border-radius:3px;flex:none}.pvr b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pvr em{font-style:normal;font-weight:700;min-width:58px;text-align:right}.pvr .pill{font-size:.72rem}
.pvt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.pvt div{background:var(--primary-background-color);border:1px solid var(--line);border-radius:12px;padding:8px 10px}.pvt b{display:block;font-size:1.05rem}.pvt span{font-size:.7rem;color:var(--mut)}
.hrds{display:flex;gap:6px;margin:0 0 12px}.hrd{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;background:transparent;border:1px solid var(--line);border-radius:12px;padding:7px 2px 6px;cursor:pointer;color:var(--mut);font:inherit}
.hrd.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent);color:var(--primary-text-color)}.hrd span{font-size:.72rem;font-weight:600}.hrd em{font-style:normal;font-size:.7rem}
.hrd i{display:flex;align-items:flex-end;width:16px;height:34px}.hrd i b{display:block;width:100%;border-radius:3px;background:var(--teal)}
.hrt{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}.hrt>div{border:1px solid var(--line);border-left:3px solid var(--a);border-radius:12px;padding:8px 10px;background:var(--primary-background-color)}
.hrt span{display:flex;gap:5px;align-items:center;font-size:.7rem;color:var(--mut)}.hrt b{display:block;font-size:1.25rem;margin-top:2px}.hrt small{font-size:.7rem;font-weight:500;color:var(--mut)}
.hlg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.74rem;color:var(--mut);margin:4px 0 6px}.hlg i,.hxr i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px}
.hcw{width:100%}.hchart{width:100%;height:auto;display:block;touch-action:pan-y}
.hxr{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:.78rem;min-height:20px;margin-top:4px;color:var(--mut)}.hxr b{color:var(--primary-text-color)}
.hre{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:.86rem}.hre em{font-style:normal;color:var(--mut);min-width:42px}.hre>i{width:9px;height:9px;border-radius:50%;flex:none}.hre b{display:block}.hre span{font-size:.76rem;color:var(--mut)}
.hac-w{display:flex;gap:6px;align-items:flex-end;margin:4px 0 8px}.hac{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}.hac em{font-style:normal;font-size:.7rem;color:var(--mut)}.hac span{font-size:.72rem;color:var(--mut);font-weight:600}
.hab{display:flex;flex-direction:column-reverse;justify-content:flex-start;width:100%;max-width:38px;height:110px;border-radius:6px;overflow:hidden;background:color-mix(in srgb,var(--mut) 12%,transparent)}.hab b{display:block;width:100%}
@media(max-width:520px){.hrt{grid-template-columns:1fr 1fr}.pvt{grid-template-columns:1fr 1fr 1fr}.pvt b{font-size:.92rem}.hrds{gap:3px}}
.stp{display:flex;gap:6px;margin-top:9px}.stp span{flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 2px;border-radius:10px;border:1px solid var(--line);font-size:.72rem;color:var(--mut)}.stp span b{font-size:.68rem}.stp span small{font-size:.66rem;opacity:.75}
.stp span.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 20%,transparent);color:var(--primary-text-color);font-weight:700}
.htrn{display:flex;gap:6px;align-items:center;font-size:.74rem;margin-top:8px;color:var(--c)}.htrn.mut{color:var(--mut)}
.stpv{display:flex;gap:6px;margin:2px 0 8px}.stpv span{display:flex;gap:6px;align-items:center;font-size:.78rem;padding:4px 10px;border-radius:99px;border:1px solid var(--line)}.stpv b{color:var(--teal)}
.stsc{margin-top:10px}.stbar{position:relative;height:10px;border-radius:6px;background:color-mix(in srgb,var(--mut) 22%,transparent);margin-bottom:22px}
.stbar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:#fbbf24}
.stbar u{position:absolute;top:-3px;width:2px;height:16px;background:var(--mut);text-decoration:none;transform:translateX(-1px)}.stbar u.ok{background:var(--primary-text-color)}
.stbar u b{position:absolute;top:17px;left:50%;transform:translateX(-50%);font-size:.66rem;color:var(--mut);font-weight:600}.stbar u.ok b{color:var(--primary-text-color)}
.stlb{display:flex;justify-content:space-between;font-size:.72rem;color:var(--mut)}
@media(max-width:520px){.brand .mn{display:none}.pillbtn .bl{display:none}.pillbtn{padding:8px}.brand .tag{display:none}.brand b{font-size:.94rem}.brand{gap:8px}.hero .hlogo{width:42px;height:42px;right:12px;bottom:12px}.hero .chips{padding-right:50px}.brand .ver::before{content:""!important}.brand .logo{width:34px;height:34px}}
/* Modul 1: neues Aussehen (Raumkarten, Kopf, Anwesenheit, Kennzahlen) */
.hero{border-radius:22px;padding:22px 22px 18px}.chip{background:rgba(3,12,22,.34);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);font-weight:600}
.seg3{gap:0;border:1px solid var(--line);border-radius:14px;overflow:hidden}.seg3 button{display:flex;flex-direction:row;justify-content:center;align-items:center;gap:8px;border:0;border-radius:0;padding:12px 6px}.seg3 button+button{border-left:1px solid var(--line)}
.tile{border-radius:18px;padding:14px 16px}.tile::before{left:auto;top:14px;right:14px;bottom:auto;width:8px;height:8px;border-radius:50%}.tile .v{font-size:1.7rem;letter-spacing:-.02em;margin-top:8px}
.rooms{align-items:stretch}
.room{display:flex;flex-direction:column;gap:14px;padding:16px;overflow:hidden;border-radius:20px}
.room::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--st,var(--line))}
.room[data-m=green]{--st:var(--green)}.room[data-m=amber]{--st:var(--amber)}.room[data-m=slate]{--st:var(--slate)}.room[data-m=gray]{--st:var(--gray)}
.rh{align-items:flex-start}.rico{width:48px;height:48px;border-radius:15px}
.rn b{font-size:1.12rem;font-weight:700;letter-spacing:-.01em;line-height:1.25}
.pl{gap:3px 12px;margin-top:3px}.pill{margin:0}
.why{border:0;background:none;padding:0;margin:0;font-size:.76rem;text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--mut) 45%,transparent);text-underline-offset:3px}
.two{gap:0;border:1px solid var(--line);border-radius:16px;overflow:hidden}.two .box{border:0;border-radius:0;background:none;padding:12px 14px}
.two .box:nth-child(2){order:-1;border-right:1px solid var(--line)}.two .box .v{font-size:1.08rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.box .v{font-size:1.4rem;font-weight:700;letter-spacing:-.02em;margin-top:4px}.box.amber .v{color:var(--amber)}.box.green .t .ic{color:var(--green)}
.room .plan{border-top:0;padding-top:0}.room .foot{margin-top:auto}

/* Modul 3: neues Aussehen */
.enh{position:relative;border-radius:22px;padding:22px 22px 18px;background:radial-gradient(120% 140% at 100% 0%,#14b8a6 0%,transparent 55%),linear-gradient(135deg,#064e3b,#0f766e 60%,#155e75)}
.enring{position:absolute;right:26px;top:50%;transform:translateY(-50%);width:132px;height:132px}
.enring svg{width:100%;height:100%}.enring .rb{fill:none;stroke:rgba(255,255,255,.16);stroke-width:10}.enring .rf{fill:none;stroke:#fff;stroke-width:10;stroke-linecap:round}
.enring .rv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}.enring .rv b{font-size:1.9rem;line-height:1;letter-spacing:-.02em}.enring .rv small{font-size:.9rem;font-weight:600;margin-left:1px}.enring .rv span{font-size:.72rem;opacity:.8;margin-top:3px}
@media(max-width:560px){.enring{top:20px;right:18px;transform:none;width:88px;height:88px}.enring .rv b{font-size:1.2rem}.enring .rv span{display:none}}
.enseg{max-width:none;width:100%}
.tiles .tile{position:relative;padding:14px 14px 16px;border-radius:18px;overflow:hidden}
.tiles .tile::before{display:none}
.tile .t{gap:8px;font-weight:600}.tile .ti{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;color:var(--a);background:color-mix(in srgb,var(--a) 16%,transparent)}
.tile .v{font-size:1.7rem;margin-top:10px}.tile .g{font-size:.74rem}
.tile .tbar{height:4px;border-radius:4px;background:color-mix(in srgb,var(--a) 16%,transparent);margin-top:11px;overflow:hidden}.tile .tbar i{display:block;height:100%;background:var(--a);border-radius:4px}
.enc{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.enco{display:flex;flex-direction:column;gap:14px;min-width:0}
@media(max-width:860px){.enc{display:flex;flex-direction:column;align-items:stretch}.enco{display:contents}}
.enc .card{border-radius:20px;padding:18px}.enc .card h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 14px}
.enc .card h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.enflow{width:100%;max-width:460px;display:block;margin:0 auto}
.enrows>div{padding:10px 0}
.enrows .sum{margin-top:2px}
.enrows .sum:last-child,.enrows>div:last-child.sum{padding:12px 14px;border:0;border-radius:12px;background:color-mix(in srgb,var(--teal,#2dd4bf) 12%,transparent)}
.pvbar.endist{height:14px;border-radius:8px;margin-bottom:8px}

/* Modul 4: neues Aussehen */
.gshero{position:relative;border-radius:22px;padding:22px 22px 20px;background:radial-gradient(120% 150% at 100% 0%,#fcd34d 0%,transparent 55%),linear-gradient(135deg,#d97706,#f59e0b 60%,#b45309)}
.gsbig{font-size:3rem;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin:6px 0 4px}
.gsring{position:absolute;right:24px;top:50%;transform:translateY(-50%);width:116px;height:116px}
.gsring svg{width:100%;height:100%}.gsring .rb{fill:none;stroke:rgba(27,21,0,.16);stroke-width:10}.gsring .rf{fill:none;stroke:#1b1500;stroke-width:10;stroke-linecap:round}
.gsring .rv{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#1b1500}.gsring .rv b{font-size:1.6rem;line-height:1}.gsring .rv small{font-size:.8rem;margin-left:1px}.gsring .rv span{font-size:.68rem;font-weight:600;margin-top:3px;opacity:.8}
@media(max-width:560px){.gsring{top:18px;right:16px;transform:none;width:78px;height:78px}.gsring .rv b{font-size:1.1rem}.gsring .rv span{display:none}.gsbig{font-size:2.4rem}}
.gstiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}@media(max-width:720px){.gstiles{grid-template-columns:1fr 1fr}}
.gstile{border:1px solid var(--line);border-left:1px solid var(--line);border-radius:18px;padding:14px;position:relative;overflow:hidden}
.gstile::after{content:"";position:absolute;left:14px;right:14px;bottom:0;height:3px;border-radius:3px 3px 0 0;background:var(--c)}
.gst{display:flex;align-items:center;gap:8px;font-weight:600;font-size:.82rem;color:var(--mut)}
.gsi{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;color:var(--c,var(--amber));background:color-mix(in srgb,var(--c,var(--amber)) 16%,transparent)}
.gsi.big{width:40px;height:40px;border-radius:13px;--c:var(--amber)}
.gstile .gsv{font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin:8px 0 2px}
.gsdev{border-radius:20px;padding:16px;gap:14px}
.gsh{gap:12px}.gsh b{flex:1;font-size:1.1rem}
.gsst{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 12px;font-size:.8rem;font-weight:700;border:1px solid var(--line);color:var(--mut)}
.gsst.on{color:var(--green);border-color:color-mix(in srgb,var(--green) 45%,transparent);background:color-mix(in srgb,var(--green) 12%,transparent)}
.gsst.on::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--green)}
.gsbar{display:flex;height:14px;border-radius:8px;overflow:hidden;gap:2px}.gsbar i{display:block;height:100%}
.gsdev .gsleg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0}
.gsdev .gsleg span{display:grid;grid-template-columns:auto 1fr;column-gap:6px;align-items:center;font-size:.76rem;color:var(--mut)}
.gsdev .gsleg span i{width:8px;height:8px;border-radius:50%}.gsdev .gsleg em{font-style:normal}
.gsdev .gsleg b{grid-column:1/3;font-size:1rem;color:var(--primary-text-color);margin-top:2px}
.gsrows{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.gsrow{display:flex;flex-direction:column;gap:2px;padding:10px 12px;font-size:.78rem}.gsrow+.gsrow{border-left:1px solid var(--line)}
.gsrow b{font-size:.92rem}.gsrow em{font-style:normal;color:var(--green);font-size:.76rem;min-height:1em}
.gsadv{border-radius:14px;padding:10px 14px}
.gsc{border-radius:20px;padding:18px}.gsc h2{display:flex;align-items:center;gap:10px;margin:0 0 12px}
.gsc h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--amber) 16%,transparent);color:var(--amber)}
.gsch{padding:7px 16px}
.gstiles .gstile{border-left:1px solid var(--line)!important}.gshero{padding:18px 22px 16px}.gsc svg{max-height:280px}
@media(max-width:720px){.gstiles{grid-template-columns:1fr 1fr!important}.gstile .gsv{font-size:1.3rem}.gstile .mut.sm{font-size:.72rem}}

/* Modul 2: neues Aussehen */
.wwh{position:relative;border-radius:22px;padding:22px 22px 18px;background:radial-gradient(110% 150% at 100% 0%,#22d3ee 0%,transparent 52%),linear-gradient(135deg,#0c4a6e,#075985 55%,#0e7490);overflow:hidden}
.wwh .big{font-size:4rem;letter-spacing:-.03em;line-height:1.05}
.wwh .wwtk{transform:scale(1.12);transform-origin:right center;margin-right:8px}
.wwh .chip{background:rgba(3,12,22,.34);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);font-weight:600}
.wwacts{gap:10px;margin-top:14px}
.wwacts .wwa{border-radius:16px;padding:12px 14px;background:rgba(3,12,22,.3);border:1px solid rgba(255,255,255,.16);justify-content:center}
.wwacts .wwa .ic{opacity:.9}
.wwc,.enc .card{border-radius:20px;padding:18px}
.wwc h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 14px}
.wwc h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.wwc .wwlegend,.wwc .wwleg{gap:8px}
.wwseg{border-radius:14px}
.wwrs{margin-top:8px}
.dgs{border-radius:14px}
@media(max-width:560px){.wwh .big{font-size:3rem}.wwh .wwtk{transform:none}.wwacts{grid-template-columns:1fr}}

/* Modul 8: neues Aussehen */
.wbtabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;width:100%!important;max-width:100%;box-sizing:border-box;gap:4px;border-radius:16px;padding:4px;margin:0 0 14px}
.wbtabs button{justify-content:center;border-radius:12px;padding:10px 8px;white-space:nowrap}
@media(max-width:560px){.wbtabs{grid-template-columns:auto auto auto auto!important;justify-content:space-between}.wbtabs button{flex-direction:column;gap:3px;font-size:.62rem;letter-spacing:-.01em;padding:8px 1px;min-width:0}.evtop{grid-template-columns:minmax(0,1fr)}}
.evtop>*,.mcols>*{min-width:0}
.wbbar{gap:8px;margin:0 0 14px}.wbchip{background:var(--card);padding:6px 14px;font-weight:650}
.evtop{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;align-items:stretch;margin:0 0 14px}
@media(max-width:860px){.evtop{grid-template-columns:1fr}}
.evtop .lugrid{grid-template-columns:1fr 1fr;grid-auto-rows:1fr}
.evcard{border-radius:22px;padding:18px;gap:12px;background:radial-gradient(110% 120% at 0% 0%,color-mix(in srgb,var(--c8,#64748b) 18%,transparent),transparent 60%),var(--card)}
.evcard.chg{--c8:#2dd4bf;border-color:color-mix(in srgb,#2dd4bf 40%,var(--line))}.evcard.plg{--c8:#f59e0b}
.evhead b{font-size:1.3rem;letter-spacing:-.01em;gap:10px}
.evhead b>svg{box-sizing:content-box;padding:8px;width:20px;height:20px;border-radius:12px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.evcard svg.evs,.evcard>svg{border-radius:16px}
.luroom{border-radius:18px;padding:14px;gap:4px;align-content:space-between}
.luroom .lv{font-size:1.65rem;letter-spacing:-.02em}
.luroom .lt{display:flex;align-items:center;gap:8px;font-weight:600}
.luroom .ti{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;color:var(--teal,#2dd4bf);background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent)}
.mcols{column-count:2;column-gap:14px}
.mcols>.card{break-inside:avoid;margin:0 0 14px!important}
@media(max-width:860px){.mcols{column-count:1}}
.ocard{border-radius:20px;padding:18px}.ocard h2{gap:10px;margin:0 0 14px}
.ocard h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.mcols .lugrid{grid-template-columns:1fr 1fr}
.mcols .luroom{padding:12px}.mcols .luroom .lv{font-size:1.4rem}

/* Einstellungen: neue Gliederung */
.sxw{max-width:860px}
.sxsum{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:6px 0 4px}
.sxsum>div{border:1px solid var(--line);border-radius:16px;padding:12px 14px;background:var(--card);display:flex;flex-direction:column;gap:2px}
.sxsum b{font-size:1.4rem;font-weight:800;letter-spacing:-.02em}.sxsum span{font-size:.74rem;color:var(--mut)}
.sxh2{display:flex;align-items:center;gap:10px;margin:24px 4px 10px}
.sxh2 b{font-size:1.05rem}.sxh2 small{color:var(--mut);font-size:.8rem;margin-left:2px}
.sxhi{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;color:var(--teal);background:color-mix(in srgb,var(--teal) 15%,transparent)}
.sxl{border-radius:20px;overflow:hidden}
.sxi{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:13px;color:var(--teal);background:color-mix(in srgb,var(--teal) 14%,transparent)}
.sxgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sxoff{display:flex;align-items:center;gap:10px;border:1px dashed var(--line);border-radius:16px;background:transparent;color:inherit;font:inherit;text-align:left;padding:10px 12px;cursor:pointer}
.sxoff:hover{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 6%,transparent)}
.sxoff .sxi{width:34px;height:34px;border-radius:11px;color:var(--mut);background:color-mix(in srgb,var(--mut) 12%,transparent)}
.sxoff .sxt b{font-size:.88rem}.sxoff.soon{opacity:.5;cursor:default}
.sxoff .sxc{font-size:.68rem}
@media(max-width:620px){.sxsum{grid-template-columns:repeat(4,1fr);gap:6px}.sxsum>div{padding:9px 10px;border-radius:14px}.sxsum b{font-size:1.05rem}.sxsum span{font-size:.64rem}.sxh2{flex-wrap:wrap;row-gap:0}.sxh2 small{flex-basis:100%;margin:-2px 0 0 40px}.sxoff{padding:8px 10px;gap:8px}.sxoff .sxi{display:none}.sxoff .sxt b{font-size:.8rem}.sxoff .sxc{display:none}.sxoff .sxt small{font-size:.68rem}}

/* Modul 11: Sicherheit */
.sfh{position:relative;border-radius:22px;padding:22px 22px 18px;overflow:hidden;background:radial-gradient(110% 150% at 100% 0%,#34d399 0%,transparent 52%),linear-gradient(135deg,#064e3b,#0f766e 60%,#155e75)}
.sfh.warn{background:radial-gradient(110% 150% at 100% 0%,#fbbf24 0%,transparent 52%),linear-gradient(135deg,#78350f,#b45309 60%,#92400e)}
.sfh.alarm{background:radial-gradient(110% 150% at 100% 0%,#f87171 0%,transparent 52%),linear-gradient(135deg,#7f1d1d,#b91c1c 60%,#991b1b);animation:sfp 1.6s ease-in-out infinite}
@keyframes sfp{50%{box-shadow:0 0 0 6px rgba(239,68,68,.25)}}
@media(prefers-reduced-motion:reduce){.sfh.alarm{animation:none}}
.sfh .big{font-size:2rem;letter-spacing:-.02em;line-height:1.15;margin:6px 0 4px;max-width:calc(100% - 100px)}
.sfh .sub{max-width:calc(100% - 100px)}
.sfi{position:absolute;right:24px;top:22px;width:84px;height:84px;border-radius:26px;display:grid;place-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);color:#fff}
@media(max-width:560px){.sfh .big{font-size:1.5rem;max-width:calc(100% - 70px)}.sfh .sub{max-width:calc(100% - 70px)}.sfi{width:58px;height:58px;border-radius:18px;right:16px}.sfi svg{width:34px;height:34px}}
.sfc{border-radius:20px;padding:18px}.sfc h2{display:flex;align-items:center;gap:10px;font-size:1rem;margin:0 0 14px}.sfc h2 small{margin-left:auto;font-weight:600}
.sfc h2>svg:first-child{box-sizing:content-box;padding:7px;width:18px;height:18px;border-radius:10px;background:color-mix(in srgb,var(--teal,#2dd4bf) 15%,transparent);color:var(--teal,#2dd4bf)}
.sfg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr));gap:10px}.sfd{min-width:0}.sfc .wxlog>div{grid-template-columns:104px 1fr}
.sfd{border:1px solid var(--line);border-radius:16px;padding:12px 14px;display:grid;gap:10px;background:var(--card);position:relative;overflow:hidden}
.sfd::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:#34d399}.sfd.alarm::before{background:#ef4444}.sfd.off::before{background:#64748b}
.sfd.alarm{border-color:#ef444488;background:color-mix(in srgb,#ef4444 9%,var(--card))}
.sfdh{display:flex;align-items:center;gap:10px}.sfdt{flex:1;min-width:0;display:flex;flex-direction:column}.sfdt b{font-size:.95rem;line-height:1.25}.sfdt small{color:var(--mut);font-size:.76rem}
.sfdi{display:grid;place-items:center;flex:none;width:38px;height:38px;border-radius:12px;color:#34d399;background:color-mix(in srgb,#34d399 14%,transparent)}.sfd.alarm .sfdi{color:#ef4444;background:color-mix(in srgb,#ef4444 16%,transparent)}.sfd.off .sfdi{color:var(--mut);background:color-mix(in srgb,var(--mut) 14%,transparent)}
.sfs{flex:none;font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:999px;border:1px solid color-mix(in srgb,#34d399 45%,transparent);color:#34d399}.sfs.alarm{background:#ef4444;border-color:#ef4444;color:#fff}.sfs.off{border-color:var(--line);color:var(--mut)}
.sfb{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:.78rem;color:var(--mut)}.sfb span{display:inline-flex;align-items:center;gap:5px}.sfbar{flex:1 1 70px;min-width:60px;height:6px;border-radius:6px;background:color-mix(in srgb,var(--mut) 20%,transparent);overflow:hidden}.sfbar i{display:block;height:100%;border-radius:6px}
.sfsince{color:#ef4444;font-weight:600}
/* Store */
.pillbtn.sto{position:relative;padding:8px}.sdot{position:absolute;top:-5px;right:-5px;min-width:19px;height:19px;border-radius:10px;background:#f59e0b;color:#1a1200;font-size:.7rem;font-weight:700;line-height:19px;font-style:normal;text-align:center;padding:0 5px}
.mtab.sto{background:linear-gradient(120deg,#0f766e,#1e3a8a);border-color:transparent;color:#fff}.mtab.sto small{color:rgba(255,255,255,.75)}.mtab.sto .sdot{top:-6px;right:-4px}
.labp{display:inline-flex;align-items:center;gap:4px;font-style:normal;font-size:.68rem;font-weight:700;letter-spacing:.02em;padding:2px 8px 2px 6px;border-radius:999px;background:color-mix(in srgb,#8b5cf6 20%,transparent);color:#a78bfa;border:1px solid color-mix(in srgb,#8b5cf6 45%,transparent);white-space:nowrap;vertical-align:middle}
.labp.tr{position:absolute;top:10px;right:12px}
.card.labc{position:relative;border:1.5px dashed color-mix(in srgb,#8b5cf6 60%,transparent);background:linear-gradient(180deg,color-mix(in srgb,#8b5cf6 7%,var(--card-background-color,#1c1c1c)),var(--card-background-color,#1c1c1c) 60%)}
.card.labc h2{padding-right:70px}.labfoot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}.labfoot .lnk{margin-left:auto}
.lugrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.luroom{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color,#fff) 6%,transparent);font-size:.8rem}.luroom .lv{font-size:1.15rem;font-weight:700;color:var(--primary-text-color)}
.luroom.green{box-shadow:inset 3px 0 #22c55e}.luroom.amber{box-shadow:inset 3px 0 #f59e0b}.luroom.red{box-shadow:inset 3px 0 #ef4444}
.vrow.labf{border-left:3px solid #8b5cf6;padding-left:10px;background:color-mix(in srgb,#8b5cf6 7%,transparent);border-radius:0 10px 10px 0}
.pillbtn.lab{color:#a78bfa}.ldot{background:#8b5cf6!important;color:#fff!important}
.mtab.labt{background:linear-gradient(120deg,#6d28d9,#a21caf);border-color:transparent;color:#fff}.mtab.labt small{color:rgba(255,255,255,.75)}.mtab.labt .sdot{top:-6px;right:-4px}
.labban{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:14px;border:1.5px dashed color-mix(in srgb,#8b5cf6 55%,transparent);background:color-mix(in srgb,#8b5cf6 8%,transparent);margin-bottom:12px;font-size:.85rem;color:var(--mut)}.labban b{display:block;color:var(--primary-text-color);margin-bottom:2px}.labban>svg{flex:none;color:#a78bfa}
.labk{position:relative;display:flex;flex-direction:column;gap:6px;border-radius:16px;border:1px solid var(--line);background:var(--card-background-color,#1c1c1c);padding:12px}.labk.on{border-color:#8b5cf6;box-shadow:0 0 0 1px #8b5cf6 inset}.labk.soon{opacity:.75}
.labkt{display:flex;justify-content:space-between;align-items:center}.labkt .ico{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#6d28d9,#a21caf);color:#fff}
.labkb{all:unset;cursor:pointer;display:flex;flex-direction:column;gap:6px;font-size:.82rem;color:var(--mut)}.labkb b{font-size:.98rem;color:var(--primary-text-color)}.labkb:focus-visible{outline:2px solid #8b5cf6;outline-offset:4px;border-radius:8px}
.labtg{display:flex;flex-wrap:wrap;gap:6px}.labtg em{font-style:normal;font-size:.68rem;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-text-color,#fff) 10%,transparent)}
.risk{font-style:normal;font-size:.68rem;font-weight:600;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--primary-text-color,#fff) 10%,transparent);color:var(--mut)}.risk.g{background:color-mix(in srgb,#f59e0b 22%,transparent);color:#fbbf24}.stowarn.dng{border-color:#ef4444;background:color-mix(in srgb,#ef4444 12%,transparent)}.risk.s{background:color-mix(in srgb,#22c55e 18%,transparent);color:#4ade80}
.stoi.labi{background:linear-gradient(135deg,#6d28d9,#a21caf)}
.stow{display:flex;flex-direction:column;gap:12px;max-width:1100px}
.stosr{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:0 14px;color:var(--mut)}.stoq{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--primary-text-color);font:inherit;padding:13px 0}.stosr:focus-within{border-color:var(--teal)}
.stoch{display:flex;gap:8px;flex-wrap:wrap}.stoch button{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:999px;padding:8px 14px;font:inherit;font-size:.88rem;cursor:pointer}.stoch button.on{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#042);font-weight:700}
.stofe{display:flex;gap:20px;align-items:center;width:100%;text-align:left;border:0;border-radius:22px;padding:24px;background:linear-gradient(120deg,#0f766e,#1e3a8a);color:#fff;cursor:pointer;font:inherit}.stobig{flex:none;width:88px;height:88px;border-radius:22px;background:rgba(255,255,255,.18);display:grid;place-items:center}
.stofx{display:flex;flex-direction:column;gap:6px;align-items:flex-start}.stofx em{font-style:normal;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;opacity:.8}.stofx b{font-size:1.4rem}.stofx>span{opacity:.92;max-width:520px}.stobt{font-style:normal;background:#fff;color:#000;font-weight:700;border-radius:999px;padding:8px 18px;margin-top:4px}
.stoh{display:flex;justify-content:space-between;align-items:baseline;margin:10px 2px 0;font-size:1.05rem}.stoh small{color:var(--mut);font-weight:400;font-size:.82rem}
.stog{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:12px}
.stoc{display:flex;flex-direction:column;gap:10px;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;color:inherit;font:inherit;cursor:pointer;min-width:0}.stoc:hover{border-color:var(--teal)}
.stot{display:flex;gap:12px;align-items:center}.stoi{flex:none;width:52px;height:52px;border-radius:14px;display:grid;place-items:center;color:#fff}.stoi.big{width:78px;height:78px;border-radius:20px}.ston{display:flex;flex-direction:column;min-width:0}.ston b{font-size:1rem}.ston small{color:var(--mut);font-size:.8rem}
.stod{color:var(--mut);font-size:.88rem;flex:1;display:block}.stof{display:flex;justify-content:space-between;align-items:center;gap:8px}.stof em{font-style:normal;font-weight:700;font-size:.86rem;border:1px solid var(--line);border-radius:999px;padding:7px 14px}.stof em.pri{background:var(--teal);border-color:var(--teal);color:var(--on-acc,#042)}
.stos{font-size:.82rem;font-weight:600}.stos.ok{color:#4ade80}.stos.wn{color:#fbbf24}.stos.bad{color:#f87171}
.stosh{max-height:90vh}.stohd{display:flex;gap:16px;align-items:center;margin-bottom:10px}.stohd>div{flex:1;min-width:0}.stohd b{font-size:1.3rem;display:block}.stohd small{color:var(--mut)}.stoact{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}.stoact .btn2{text-decoration:none;display:inline-flex;flex:none;width:auto;padding:10px 22px}
.stofa{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:14px;margin:10px 0 14px;text-align:center}.stofa div{padding:10px 6px;border-right:1px solid var(--line);min-width:0}.stofa div:last-child{border:0}.stofa b{font-size:.88rem}.stofa small{display:block;color:var(--mut);font-size:.7rem}
.stoul{margin:4px 0 12px;padding-left:18px;color:var(--mut)}.stost{display:flex;gap:10px;margin:8px 0;color:var(--mut);font-size:.9rem}.stost b{flex:none;width:22px;height:22px;border-radius:50%;background:var(--teal);color:var(--on-acc,#042);display:grid;place-items:center;font-size:.75rem}
.stowarn{display:flex;gap:10px;background:color-mix(in srgb,#f59e0b 14%,var(--card));border:1px solid color-mix(in srgb,#f59e0b 50%,var(--line));border-radius:12px;padding:10px 12px;color:#fbbf24;font-size:.86rem;margin-top:10px}
@media(max-width:600px){.stofe{flex-direction:column;align-items:flex-start;padding:18px}.stobig{width:64px;height:64px}.stohd .stoi.big{width:60px;height:60px}}
.hsn{margin-top:8px}.hsn summary{display:flex;align-items:center;gap:8px}.hsd{width:10px;height:10px;border-radius:50%;flex:none}.stoq2 li{margin-bottom:4px}.stoq2 b,.hsn li b{color:var(--primary-text-color)}
.vab{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#0ea5e9 18%,transparent);color:#0ea5e9;border:1px solid color-mix(in srgb,#0ea5e9 50%,transparent);margin-right:8px;white-space:nowrap}
.mtab .vab{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}.mbadge.vab,.sxc.vab{color:#0ea5e9;border-color:color-mix(in srgb,#0ea5e9 50%,transparent)}
.vabox{display:flex;gap:12px;align-items:flex-start;border:1px solid color-mix(in srgb,#0ea5e9 55%,transparent);background:color-mix(in srgb,#0ea5e9 9%,transparent);border-radius:14px;padding:12px 14px;margin-bottom:12px;font-size:.84rem;line-height:1.45}
.vabox>svg{flex:none;color:#0ea5e9;margin-top:1px}.vabox b{display:block;color:var(--primary-text-color);margin-bottom:3px;font-size:.92rem}.vabox a{color:#0ea5e9}
.dvl{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--secondary-text-color) 16%,transparent);color:var(--secondary-text-color);border:1px solid color-mix(in srgb,var(--secondary-text-color) 45%,transparent);margin-right:8px;white-space:nowrap}
.mtab .dvl{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}.betabox.dvbox{border-color:color-mix(in srgb,var(--secondary-text-color) 50%,transparent);background:color-mix(in srgb,var(--secondary-text-color) 9%,transparent)}.dvbox>svg{color:var(--secondary-text-color)}.dvbox a{color:var(--primary-text-color)}
.stb{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#22c55e 16%,transparent);color:#22c55e;border:1px solid color-mix(in srgb,#22c55e 50%,transparent);margin-right:8px;white-space:nowrap}
.mtab .stb{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}
@media(max-width:719px){.mtab .stb,.mtab .vab,.mtab .beta,.mtab .dvl{display:none}}
@media(min-width:720px){.tiles{grid-template-columns:repeat(4,1fr)}.rooms{grid-template-columns:repeat(2,1fr)}.hero .big{font-size:3.3rem}
  .hero .art{top:50%;transform:translateY(-50%);height:88%;max-height:190px;max-width:34%;right:84px}.hero .hlogo{width:60px;height:60px;right:20px;bottom:18px}.hero .chips{padding-right:0}.hero .lbl{max-width:none}
  .sheet{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);width:min(580px,92vw);border-radius:22px;max-height:86vh}}
@media(min-width:1080px){.rooms{grid-template-columns:repeat(3,1fr)}}

.grp{display:grid;gap:10px;min-width:0;max-width:100%}.grp>*{min-width:0}
.grp+.grp{margin-top:22px}
.gh{display:flex;align-items:center;gap:12px;padding:2px 2px}
.gico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;color:#fff;background:linear-gradient(135deg,#14b8a6,#0e6a82)}
.gn{flex:1;min-width:0}.gn b{display:block;font-size:1.05rem;line-height:1.2}
.gn span{display:block;font-size:.76rem;color:var(--mut)}
.gtog,.gedit,.gmv{border:1px solid var(--line);background:transparent;border-radius:10px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer;color:var(--primary-text-color);flex:none}
.gtog{transition:transform .2s}.grp.col .gtog{transform:rotate(-90deg)}
.gmv.up .ic{transform:rotate(180deg)}.gmv[disabled]{opacity:.35;cursor:default}
.gmini{display:flex;flex-wrap:wrap;gap:8px}
.gm{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 12px;font-size:.84rem}
.gm i{width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 25%,transparent)}
.gm small{color:var(--mut)}
.gadd{border:1.5px dashed var(--line);background:transparent;border-radius:16px;padding:14px;color:var(--teal);font-weight:600;cursor:pointer;display:flex;gap:8px;align-items:center;justify-content:center;margin-top:10px;width:100%}
.gsw{display:flex;align-items:center;gap:8px;flex:none;font-size:.72rem;color:var(--mut)}
.gsw span{display:none}
@media(min-width:720px){.gsw span{display:inline}}
.gname{width:100%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:12px;padding:11px 12px;font:inherit;font-size:1rem;margin:4px 0 12px}
.gicons{display:flex;gap:8px;margin:4px 0 12px}
.gicons button{width:46px;height:46px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);display:grid;place-items:center;cursor:pointer}
.gicons button.sel{background:var(--teal);border-color:var(--teal);color:#042f2e}
.btn2.del{flex:0 0 auto;color:#f87171;border-color:color-mix(in srgb,#f87171 40%,var(--line))}
.sheet.wide{padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))}
@media(min-width:720px){.sheet.wide{width:min(780px,94vw)}}
.rdays{display:flex;gap:2px;overflow-x:auto;margin:0 -6px 8px;padding:2px 6px 6px;scrollbar-width:none}
.rdays::-webkit-scrollbar{display:none}
.rd{flex:none;width:44px;border:0;background:transparent;border-radius:14px;padding:4px 0 2px;cursor:pointer;color:var(--mut);display:grid;justify-items:center;gap:3px}
.rd small{font-size:.72rem;font-weight:600}
.rd b{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;font-size:.95rem;color:var(--primary-text-color);font-weight:600}
.rd.sel b{background:var(--teal);color:#042f2e}
.rd.today small::after{content:"•";margin-left:2px;color:var(--teal)}
.rtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:2px 0 10px}
.rtiles .tile{padding:10px 12px 10px 14px;border-radius:14px}
.rtiles .tile .v{font-size:1.2rem;margin-top:4px}
.rtiles .tile .g{font-size:.72rem}
.rleg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.76rem;color:var(--mut);margin:4px 0 6px}
.rleg span{display:inline-flex;align-items:center;gap:6px}
.rleg i{display:inline-block;width:16px;height:0;border-top:2.5px solid var(--c)}
.rleg i.d{border-top-style:dashed;border-top-width:2px}
.rleg i.b{height:10px;width:14px;border:0;border-radius:3px;background:color-mix(in srgb,var(--c) 28%,transparent)}
.rleg i.o{width:10px;height:10px;border:2.2px solid var(--c);border-radius:50%;background:var(--card)}
.rwrap{position:relative;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.wwempty{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;margin:0 0 10px;border:1px dashed var(--line);border-radius:14px;background:color-mix(in srgb,var(--amber) 8%,transparent)}.wwempty>svg{flex:none;color:var(--amber)}.wwempty>div{flex:1 1 200px;min-width:0}.wwempty b{display:block;font-size:14px}.wwempty span{display:block;font-size:12.5px;color:var(--secondary-text-color);margin-top:2px;line-height:1.4}.wwempty.big{flex-direction:column;text-align:center;padding:26px 16px;gap:10px}.wwempty.big>div{flex:none}.wwdim{opacity:.45;filter:saturate(.5)}.wwa{flex-wrap:wrap}.wwa small{flex-basis:100%;font-size:10.5px;opacity:.75;font-weight:500}.rchart,.wwc2{display:block;width:100%;height:auto;cursor:crosshair}
.rtip{position:absolute;top:6px;transform:translateX(-50%);background:var(--primary-background-color);border:1px solid var(--line);border-radius:12px;padding:8px 12px;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;min-width:128px;font-size:.76rem;color:var(--mut)}
.rtip b{display:block;font-size:1.25rem;color:var(--primary-text-color);margin:1px 0 3px}
.rtip .st{display:flex;align-items:center;gap:6px;color:var(--primary-text-color);font-size:.78rem;font-weight:600}
.rtip .st i{width:8px;height:8px;border-radius:50%;background:var(--c)}
.rtip .wo{margin-top:3px;color:#60a5fa;font-weight:600}
.rbar{display:flex;height:10px;border-radius:6px;overflow:hidden;background:var(--line);margin:6px 0 2px}
.rbar i{display:block;height:100%}
.rev{display:grid;gap:0;margin:6px 0 4px}
.rev>div{display:grid;grid-template-columns:48px 14px 1fr;gap:8px;align-items:start;padding:7px 0;border-top:1px solid var(--line);font-size:.86rem}
.rev>div:first-child{border-top:0}
.rev time{color:var(--mut);font-variant-numeric:tabular-nums}
.rev i{width:10px;height:10px;border-radius:50%;background:var(--c);margin-top:5px}
.rev small{display:block;color:var(--mut);font-size:.74rem;margin-top:1px}
.rnav{display:flex;justify-content:space-between;margin-top:6px}
.rmsg{padding:34px 8px;text-align:center;color:var(--mut);font-size:.9rem;border:1px dashed var(--line);border-radius:14px;margin:6px 0 8px}

.vseg{display:inline-flex;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.vseg button{display:inline-flex;align-items:center;gap:6px;background:transparent;border:0;padding:8px 13px;font-weight:600;font-size:.82rem;cursor:pointer;color:var(--mut)}
.vseg button.sel{background:var(--teal);color:#042f2e}
.rooms.list{display:grid;grid-template-columns:1fr;gap:8px}
.chead{display:none}
.crow{display:grid;grid-template-columns:36px minmax(0,1fr) auto;grid-template-areas:"i n s" "w w w" "a a a";gap:10px 12px;align-items:center;padding:12px 14px;border-radius:16px}
.crow .rico{width:40px;height:40px;border-radius:12px;grid-area:i}
.crow .rn{grid-area:n;min-width:0}.crow>.sw{grid-area:s}
.crow .rn b{font-size:1rem}
.crow .cells{grid-area:w;display:grid;grid-template-columns:1fr 1fr;gap:10px 14px}
.crow .cell{min-width:0;font-size:.8rem;color:var(--mut);line-height:1.25}
.crow .cell b{display:block;font-size:.95rem;color:var(--primary-text-color);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.crow .cell.win b{color:var(--green)}.crow .cell.win.amber b{color:var(--amber)}
.crow .cell .ic{vertical-align:-3px;margin-right:4px}
.crow .cell .tlw{margin:6px 0 1px}.crow .cell .tl{height:8px;border-radius:4px}.crow .cell .tlw b{top:-3px;bottom:-3px;width:2px;margin-left:-1px;font-size:0;overflow:visible}
.crow .acts{grid-area:a;display:flex;gap:6px;justify-content:flex-end;border-top:1px solid var(--line);padding-top:10px}
.crow .acts .ibtn{width:32px;height:32px;border-radius:9px}
.crow .grip{display:none}
.crow .pill{margin-top:1px}
.crow.ed{grid-template-columns:28px 36px minmax(0,1fr) auto;grid-template-areas:"g i n s" "w w w w" "a a a a"}
.crow.ed .grip{display:grid;grid-area:g}
@media(min-width:720px){
 .chead{display:grid;grid-template-columns:36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px;gap:14px;padding:0 16px;font-size:.72rem;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:var(--mut);margin-bottom:6px}
 .chead.ed{grid-template-columns:28px 36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px}
 .crow,.crow.ed{grid-template-columns:36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px;grid-template-areas:none;gap:14px;padding:10px 16px}
 .crow.ed{grid-template-columns:28px 36px minmax(0,1.5fr) minmax(0,1.1fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) 108px 52px}
 .crow .rico,.crow .rn,.crow>.sw,.crow .acts,.crow.ed .grip{grid-area:auto}
 .crow .cells{display:contents}
 .crow .acts{border:0;padding:0}
 .crow>.sw{justify-self:end}
}
.week{display:grid;gap:5px;margin:2px 0 6px}
.wd{display:grid;grid-template-columns:30px 1fr 56px;gap:10px;align-items:center;border:1px solid transparent;background:transparent;border-radius:10px;padding:5px 6px;cursor:pointer;color:var(--primary-text-color);text-align:left;font:inherit}
.wd>span{font-size:.8rem;font-weight:700;color:var(--mut)}
.wd.today>span{color:var(--teal)}
.wd.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 9%,transparent)}
.wd em{font-style:normal;font-size:.72rem;color:var(--mut);text-align:right;white-space:nowrap}
.wd .tl{height:16px;border-radius:8px}
.wax{display:grid;grid-template-columns:30px 1fr 56px;gap:10px;padding:0 6px;font-size:.68rem;color:var(--mut)}
.wax div{display:flex;justify-content:space-between}
.sp.dim{opacity:.45}

.ibtn.gear{width:32px;height:32px;border-radius:10px}
.osecs{display:grid;gap:8px;margin:2px 0 8px}
.osec{border:1px solid var(--line);border-radius:14px;overflow:hidden}
.osec.open{border-color:color-mix(in srgb,var(--teal) 40%,var(--line))}
.oh{display:grid;grid-template-columns:34px 1fr 20px;gap:12px;align-items:center;width:100%;padding:11px 12px;background:transparent;border:0;color:var(--primary-text-color);cursor:pointer;text-align:left;font:inherit}
.oh b{display:block;font-size:.95rem}.oh span:not(.oi){display:block;font-size:.76rem;color:var(--mut);margin-top:1px}
.oi{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}
.oh>.ic:last-child{transition:transform .2s;color:var(--mut)}.osec.open .oh>.ic:last-child{transform:rotate(180deg)}
.ob{display:grid;gap:2px;padding:2px 12px 12px;border-top:1px solid var(--line)}
.of{display:grid;gap:6px;padding:10px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.of:last-child{border-bottom:0}
.ol b{display:block;font-size:.88rem;font-weight:600}.ol span{display:block;font-size:.74rem;color:var(--mut);margin-top:1px}
.oc{min-width:0}
@media(min-width:720px){.of{grid-template-columns:minmax(0,1fr) minmax(220px,300px);align-items:center;gap:16px}}
.onum{display:flex;align-items:center;gap:8px}.onum i{font-style:normal;font-size:.8rem;color:var(--mut);white-space:nowrap}
.onum input,.otxt,.osel,.oadd{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:9px 10px;font:inherit;font-size:.95rem;min-width:0}
.onum input{width:110px}.onum input[type=time]{width:150px}.otxt,.osel{width:100%}
.oclr{width:26px;height:26px;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--mut);display:grid;place-items:center;cursor:pointer}
.oseg{margin:0}.oseg button{padding:9px 8px}
.ochips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.och{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:5px 6px 5px 11px;font-size:.82rem;background:color-mix(in srgb,var(--teal) 10%,transparent);word-break:break-all}
.och button{width:20px;height:20px;border-radius:50%;border:0;background:color-mix(in srgb,var(--primary-text-color) 12%,transparent);color:inherit;display:grid;place-items:center;cursor:pointer;padding:0;flex:none}
.oadd{border-style:dashed;color:var(--teal);font-weight:600;padding:6px 10px;border-radius:999px;font-size:.82rem}
.olinks{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;margin:4px 0 6px}.lnk.dng{color:#f87171}
.btn2[disabled]{opacity:.6;cursor:default}
button.achip{border:0;cursor:pointer;font-family:inherit}.achip.red{--c:#f87171}
.vc{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:0 0 10px}.vc.warn{border-color:color-mix(in srgb,#fbbf24 50%,var(--line))}.vc.bad{border-color:color-mix(in srgb,#f87171 55%,var(--line))}
.vh{display:grid;grid-template-columns:12px 1fr auto;gap:10px;align-items:center;margin-bottom:6px}.vh b{display:block;overflow-wrap:anywhere}.vh span{font-size:.76rem;color:var(--mut)}.vh em{font-style:normal;font-size:.76rem;color:var(--mut)}
.vb{display:flex;align-items:center;gap:10px;padding:5px 0;border-top:1px solid color-mix(in srgb,var(--line) 45%,transparent);font-size:.84rem;flex-wrap:wrap}.vl{color:var(--mut);min-width:98px;font-size:.78rem}.vb b{font-weight:600}.vbad{color:#f87171}
.batbar{flex:1;min-width:70px;max-width:180px;height:8px;border-radius:4px;background:color-mix(in srgb,var(--mut) 25%,transparent);overflow:hidden}.batbar i{display:block;height:100%;background:#22c55e;border-radius:4px}.batbar.warn i{background:#fbbf24}.batbar.bad i{background:#f87171}
.vm{display:grid;grid-template-columns:18px 1fr;gap:8px;margin-top:8px;padding:9px 10px;border-radius:10px;font-size:.84rem}.vm b{display:block}.vm span{font-size:.78rem;color:var(--mut)}.vm.warn{background:color-mix(in srgb,#fbbf24 12%,transparent)}.vm.warn .ic{color:#fbbf24}.vm.bad{background:color-mix(in srgb,#f87171 12%,transparent)}.vm.bad .ic{color:#f87171}
.dg .seg button{font-size:.78rem;padding:9px 3px;white-space:nowrap}@media(max-width:380px){.dg .seg button{font-size:.68rem;padding:9px 0}}
.vsrc{font-size:.72rem;color:var(--mut);overflow-wrap:anywhere}.vbs{padding-top:0;border-top:0;margin-top:-2px}.vch{margin-left:auto;font-size:.78rem;padding:2px 4px}.vbe{padding:4px 0 6px}.vinv{display:flex;gap:8px;align-items:center;font-size:.8rem;color:var(--mut);margin:0 0 6px}.vwarn{color:#fbbf24}
.dgs{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:4px 0 12px}.dgs b{display:block}.dgs span{font-size:.78rem;color:var(--mut)}.dgs .btn2{flex:none;padding:8px 12px;font-size:.82rem}
.dgs.ok{border-color:color-mix(in srgb,#22c55e 45%,var(--line));background:color-mix(in srgb,#22c55e 8%,transparent)}.dgs.ok .ic{color:#22c55e}.dgs.warn{border-color:color-mix(in srgb,#fbbf24 50%,var(--line));background:color-mix(in srgb,#fbbf24 8%,transparent)}.dgs.warn .ic{color:#fbbf24}.dgs.bad{border-color:color-mix(in srgb,#f87171 50%,var(--line));background:color-mix(in srgb,#f87171 8%,transparent)}.dgs.bad .ic{color:#f87171}
.dgd{width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block;flex:none}.dgd.warn{background:#fbbf24}.dgd.bad{background:#f87171}
.dgb{margin-top:2px}.dgr{border:1px solid var(--line);border-radius:14px;padding:4px 12px 6px;margin:0 0 10px}.dgh{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}.dgh span{margin-left:auto;font-size:.76rem;color:var(--mut)}
.dgl,.dgt,.dgg{display:grid;grid-template-columns:12px 1fr auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 45%,transparent)}.dgl:last-child{border-bottom:0}
.dgl b,.dgt b,.dgg b{display:block;font-size:.88rem;overflow-wrap:anywhere}.dgl span,.dgt span,.dgg span{display:block;font-size:.74rem;color:var(--mut);overflow-wrap:anywhere}.dgl em,.dgg em{font-style:normal;font-size:.76rem;color:var(--mut);text-align:right;max-width:46%}.dgl.warn em{color:#fbbf24}.dgl.bad em{color:#f87171}
.dgv{text-align:right}.dgv b{white-space:nowrap}.dgf{display:flex;gap:8px;margin:2px 0 8px;flex-wrap:wrap}.chipb{display:inline-flex;gap:6px;align-items:center;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);border-radius:999px;padding:6px 12px;font:inherit;font-size:.8rem;font-weight:600;cursor:pointer}.chipb.sel{background:color-mix(in srgb,var(--teal) 18%,transparent);border-color:var(--teal)}
.dgg.error em{color:#f87171}.dgg.warning em{color:#fbbf24}.dgempty{display:grid;justify-items:center;text-align:center;gap:6px;padding:26px 10px;color:var(--mut)}.dgempty .ic{color:#22c55e}.dgempty b{color:var(--primary-text-color)}.dgempty span{font-size:.82rem;max-width:340px}
.wzp{display:flex;gap:4px;margin:2px 0 14px}.wzp i{flex:1;height:5px;border-radius:3px;background:var(--line);cursor:pointer}.wzp i.on{background:var(--teal)}
.wzt{margin:0 0 6px;font-size:1.15rem}.wzhero{width:64px;height:64px;border-radius:20px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 18%,transparent);color:var(--teal);margin:6px 0 12px}.wzhero.ok{background:color-mix(in srgb,#22c55e 20%,transparent);color:#22c55e}
.wzb{min-height:260px;padding-bottom:10px}.wzf{position:sticky;bottom:0;padding-top:10px;background:var(--card)}.wzskip{display:block;margin:8px auto 0}
.wzc{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:4px 6px 4px 10px;font-size:.8rem}.wzc.ok{padding:4px 10px;color:var(--teal);border-color:color-mix(in srgb,var(--teal) 50%,var(--line))}.wzc button{border:0;background:transparent;color:var(--mut);cursor:pointer;padding:2px;display:grid}
.wzch,.wzex{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px}.wzex{margin:0 0 6px}
.wzs{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:8px 0}.wzs b{display:block}.wzs span{font-size:.78rem;color:var(--mut)}.wzs .btn2{flex:none;padding:8px 14px}
.wzr{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:8px 0}.wzr.inc{border-style:dashed}.wzrh{display:flex;gap:8px;align-items:center;margin-bottom:6px}
.wzsum{display:grid;gap:8px}.wzsum>div{display:grid;grid-template-columns:30px 1fr;column-gap:10px;border:1px solid var(--line);border-radius:14px;padding:10px 12px}.wzsum em{grid-row:span 2;color:var(--teal);display:grid;place-items:center}.wzsum span{font-size:.8rem;color:var(--mut);overflow-wrap:anywhere}
.wzres{display:grid;grid-template-columns:20px 1fr;gap:2px 8px;padding:8px 0;border-bottom:1px solid var(--line)}.wzres.ok .ic{color:#22c55e}.wzres.bad .ic{color:#f87171}.wzres span{grid-column:2;font-size:.8rem;color:var(--mut)}

/* Module */
.sxw{max-width:760px;margin:0 auto;width:100%}.sxh{font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:18px 4px 8px}
.omap{position:relative;height:300px;overflow:hidden;border-radius:14px;border:1px solid var(--line);background:#e8e4da;touch-action:none;cursor:grab;user-select:none}.omap.sm{height:240px;cursor:default}.omap:active{cursor:grabbing}.omap.sm:active{cursor:default}
.otile{position:absolute;width:256px;height:256px;max-width:none;pointer-events:none}.ozone{position:absolute;left:50%;top:50%;border-radius:50%;border:2px solid #0d9488;background:rgba(45,212,191,.22);transform:translate(-50%,-50%);pointer-events:none}
.opin{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-34px 0 0 -17px;color:#0d9488;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));pointer-events:none}.opin svg{width:34px;height:34px;fill:#14b8a6;stroke:#fff;stroke-width:1.4}
.odot{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);pointer-events:none}
.oatt{position:absolute;right:6px;bottom:4px;font-size:.62rem;background:rgba(255,255,255,.78);color:#333;padding:1px 6px;border-radius:6px}.ozb{position:absolute;left:10px;top:10px;display:flex;flex-direction:column;gap:6px}.ozb button{width:34px;height:34px;border-radius:9px;border:1px solid rgba(0,0,0,.2);background:#fff;color:#222;font-size:1.2rem;cursor:pointer}
.ocard{padding:14px 16px}.ocard h2{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:1.02rem}.oper{display:flex;align-items:center;gap:12px;padding:12px 0}.oper+.oper{border-top:1px solid var(--line)}.oav{flex:none;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:1.05rem}
.opi{flex:1;min-width:0}.opi b{display:block}.opi small{display:block;color:var(--mut);margin-top:2px}.ost{font-size:.74rem;font-weight:700;padding:3px 10px;border-radius:99px;border:1px solid var(--line);white-space:nowrap}.ost.home{color:#22c55e;border-color:#22c55e}.ost.away{color:var(--mut)}.ost.off{color:#f59e0b;border-color:#f59e0b}
.ocp{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;padding:2px 8px;border-radius:99px;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);font-weight:700}.otr{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;margin:6px 0}.otr .opi small{font-size:.76rem}
.osel{width:100%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit;margin:4px 0}.ohint{margin-top:10px;border:1px solid var(--line);border-radius:12px;padding:2px 14px}.ohint summary{cursor:pointer;padding:10px 0;font-weight:700}.ohint ol{margin:0 0 12px;padding-left:20px;color:var(--mut);font-size:.86rem;line-height:1.5}.ohint li{margin:6px 0}.ohint b{color:var(--primary-text-color)}
.orng{width:100%;accent-color:var(--teal);margin:6px 0}.ocoord{display:flex;gap:14px;flex-wrap:wrap;color:var(--mut);font-size:.84rem;margin-top:8px}.ocoord b{color:var(--primary-text-color)}
.rfv{border:1px solid var(--line);border-radius:14px;padding:12px;margin:10px 0}.sxl{padding:4px 0}.sxrow{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;color:inherit;text-align:left;padding:12px 14px;cursor:pointer;font:inherit}
.sxrow+.sxrow{border-top:1px solid var(--line)}.sxrow:hover{background:color-mix(in srgb,var(--teal) 6%,transparent)}.sxrow.soon{opacity:.55;cursor:default}.sxrow.soon:hover{background:none}
.sxi{flex:none;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal)}
.sxt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.sxt b{font-size:.95rem;font-weight:650}.sxt b i{font-style:normal;font-weight:500;color:var(--mut);font-size:.8rem;margin-right:4px}.sxt small{color:var(--mut);font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sxc{flex:none;font-style:normal;font-size:.72rem;font-weight:650;padding:3px 9px;border-radius:999px;border:1px solid var(--line);color:var(--mut)}.sxc.ok{color:var(--teal);border-color:color-mix(in srgb,var(--teal) 40%,transparent)}.sxc.off{opacity:.7}
.sxrow .sxg{flex:none;transform:rotate(-90deg);color:var(--mut);display:grid}.fhs{border:1px solid var(--line);border-radius:16px;margin:0 0 10px;overflow:hidden}.fhs.open{border-color:color-mix(in srgb,var(--teal) 40%,var(--line))}.fhs.open .sxg{transform:rotate(0)}.fhb{padding:2px 14px 14px;border-top:1px solid var(--line)}.fhb>.mut:first-child{margin-top:10px}
@media(max-width:520px){.sxt small{white-space:normal}}
.beta{line-height:1.35;font-style:normal;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,#f59e0b 20%,transparent);color:#f59e0b;border:1px solid color-mix(in srgb,#f59e0b 50%,transparent);margin-right:8px;white-space:nowrap}
.mtab .beta{margin:0 0 0 2px;padding:1px 6px;font-size:.6rem}.mbadge.beta,.sxc.beta{color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 50%,transparent)}
.betabox{display:flex;gap:12px;align-items:flex-start;border:1px solid color-mix(in srgb,#f59e0b 55%,transparent);background:color-mix(in srgb,#f59e0b 10%,transparent);border-radius:16px;padding:14px 16px;font-size:.84rem;color:var(--mut)}
.betabox>svg{flex:none;color:#f59e0b;margin-top:1px}.betabox b{display:block;color:var(--primary-text-color);margin-bottom:3px;font-size:.92rem}.betabox a{color:#f59e0b}
.gshero{background:linear-gradient(135deg,#e9a413,#f59e0b 60%,#d97706);color:#1b1500}.gshero .mut{color:inherit}.gsbig{font-size:2.6rem;font-weight:800;line-height:1.1;margin:4px 0}
.gstiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.gstile{border-left:4px solid var(--c)}.gsv{font-size:1.5rem;font-weight:750;margin:2px 0}
.gsgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}.gsdev{display:grid;gap:10px}.gsh{display:flex;justify-content:space-between;align-items:center}.gsh b{font-size:1.05rem}
.gsst{font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:999px;border:1px solid var(--line);color:var(--mut)}.gsst.on{color:#34d399;border-color:color-mix(in srgb,#34d399 50%,transparent)}
.gsbar{display:flex;height:12px;border-radius:99px;overflow:hidden;background:var(--line)}.gsbar i{display:block;height:100%}
.gsleg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.78rem;color:var(--mut)}.gsleg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
.gsrow{display:grid;gap:1px;font-size:.82rem}.gsrow b{font-weight:600}.gsadv{display:flex;align-items:center;gap:8px;font-size:.84rem;font-weight:650;padding:8px 12px;border-radius:12px;background:color-mix(in srgb,var(--c,#64748b) 14%,transparent)}
.gsadv.green{--c:#34d399;color:#34d399}.gsadv.amber{--c:#f59e0b;color:#f59e0b}.gsadv.slate{--c:#94a3b8;color:var(--mut)}
.gsdc{display:grid;gap:8px;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:8px}.gsdh{display:flex;gap:8px;align-items:center}.gsdh .otxt{flex:1}
.gsnums{display:flex;gap:12px;flex-wrap:wrap}.gsnums label{display:grid;gap:4px;font-size:.76rem;color:var(--mut)}.gsnums .onum{display:inline-flex;align-items:center;gap:6px}.gsnums input{width:80px}.onum u,.gsnums u{text-decoration:none;color:var(--mut)}
.wbtabs{display:flex;gap:6px;margin:0 0 12px;border:1px solid var(--line);border-radius:999px;padding:4px;width:max-content;max-width:100%}.wbtabs button{display:flex;align-items:center;gap:7px;border:0;background:transparent;color:var(--mut);border-radius:999px;padding:8px 16px;font:inherit;font-weight:600;font-size:.88rem;cursor:pointer}.wbtabs button.sel{background:var(--teal);color:var(--on-acc)}
.wbsh{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 14px}.wbnav{display:flex;align-items:center;gap:8px}.wbnav button{border:1px solid var(--line);background:transparent;color:var(--primary-text-color);border-radius:10px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer}.wbnav b{min-width:120px;text-align:center}.card.wsec{padding:0;margin-bottom:10px}.wsec>button{display:flex;align-items:center;gap:12px;width:100%;background:transparent;border:0;color:inherit;font:inherit;text-align:left;padding:14px 16px;cursor:pointer;border-radius:inherit}.wsec>button>svg{flex:none;color:var(--teal)}.wsec .wst{flex:1;min-width:0}.wsec .wst b{display:block;font-size:1rem}.wsec .wst span{display:block;color:var(--mut);font-size:.84rem;margin-top:2px}.wsec .wch{flex:none;transition:transform .2s;color:var(--mut);display:grid}.wsec.open .wch{transform:rotate(180deg)}.wsec .wbody{padding:4px 16px 16px;border-top:1px solid var(--line)}.wbbar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.wbchip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:.84rem;font-weight:600}.wbchip i{width:8px;height:8px;border-radius:50%;background:#64748b}.wbchip.ok i{background:#2dd4bf}.wbchip.warn i{background:#f59e0b}.wbchip.bad i{background:#f87171}.wbchip.ok{border-color:#2dd4bf66}.wbchip.warn{border-color:#f59e0b66}.wbchip.bad{border-color:#f8717166}.wbchip svg{color:var(--mut)}.wdot{font-style:normal;display:inline-grid;place-items:center;width:18px;height:18px;margin-left:8px;border-radius:50%;background:#f59e0b;color:#1a1204;font-size:.72rem;font-weight:800;vertical-align:1px}.wck{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.wck:first-of-type{border-top:0}.wcki{flex:none;display:grid}.wckt{flex:1;min-width:0}.wckt b{display:block;font-size:.92rem}.wckt small{display:block}.wsall{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px;margin:0 0 10px}.wsall .lnk{margin-left:12px}.rfa{margin:0 0 10px}.rfc{padding:10px 0;border-top:1px solid var(--line)}.rfc:first-of-type{border-top:0}.rfn{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px}.rfn small{flex-basis:100%}
.wxfc{display:grid;grid-template-columns:repeat(auto-fit,minmax(54px,1fr));gap:6px;margin-top:8px}.wxfc>div{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px;border-radius:12px;border:1px solid var(--line);background:rgba(127,127,127,.06)}.wxfc>div.bad{border-color:var(--warning-color,#f59e0b);background:rgba(245,158,11,.14)}.wxfc b{font-size:.95rem}.wxfc small{font-size:.7rem}
.wxhero{padding:18px 18px 12px;border-color:color-mix(in srgb,var(--green) 40%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--green) 9%,var(--card)),var(--card) 70%)}.wxhero.soon{border-color:color-mix(in srgb,var(--slate) 45%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--slate) 10%,var(--card)),var(--card) 70%)}.wxhero.hot{border-color:color-mix(in srgb,var(--amber) 55%,var(--line));background:linear-gradient(180deg,color-mix(in srgb,var(--amber) 13%,var(--card)),var(--card) 70%)}
.wxhead{display:flex;gap:14px;align-items:center}.wxhead b{display:block;font-size:1.6rem;font-weight:800;line-height:1.15;letter-spacing:-.01em}.wxhead small{display:block;margin-top:3px;font-size:.92rem;color:var(--mut)}
.wxdot{flex:none;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--green) 22%,transparent);color:var(--green)}.wxhero.soon .wxdot{background:color-mix(in srgb,var(--slate) 22%,transparent);color:var(--slate)}.wxhero.hot .wxdot{background:color-mix(in srgb,var(--amber) 24%,transparent);color:var(--amber)}
.wxnow{display:flex;flex-wrap:wrap;gap:6px 18px;margin:14px 0 4px;font-size:.9rem}.wxnow span{display:inline-flex;align-items:center;gap:6px;color:var(--primary-text-color);font-variant-numeric:tabular-nums}.wxnow .ic{color:var(--mut)}
.wxc{margin-top:8px}.wxc svg{display:block;width:100%;height:auto;overflow:visible}.wxbad{fill:var(--amber);opacity:.15}.wxar{fill:var(--teal);opacity:.12}.wxln{fill:none;stroke:var(--teal);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}.wxd{fill:var(--teal)}.wxdb{fill:var(--amber)}.wxlim{stroke:var(--amber);stroke-width:1.4;stroke-dasharray:5 4}.wxlt{fill:var(--amber);font-size:11px;font-weight:600}
.wxh{display:grid;padding:0 1.33%;margin-top:4px}.wxh svg,.wxnow svg,.wxnote svg{width:18px;height:18px;flex:none}.wxh>div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 0;border-radius:10px;font-variant-numeric:tabular-nums}.wxh>div.bad{background:rgba(245,158,11,.13)}.wxh small{font-size:.7rem;color:var(--mut)}.wxh b{font-size:.82rem;font-weight:600}.wxh .ic{color:var(--mut)}
.wxcols{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));align-items:start}
.wxl{display:grid;gap:0}.wxr{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-top:1px solid var(--line)}.wxr:first-child{border-top:0}.wxr.off{opacity:.55}
.wxi{flex:none;width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(127,127,127,.12);color:var(--mut)}.wxr.hot .wxi{background:color-mix(in srgb,var(--amber) 22%,transparent);color:var(--amber)}.wxr.soon .wxi{background:color-mix(in srgb,var(--slate) 22%,transparent);color:var(--slate)}
.wxm{flex:1;min-width:0}.wxt{display:flex;justify-content:space-between;gap:10px;align-items:baseline}.wxt b{font-size:.98rem;font-weight:700}.wxt em{font-style:normal;font-size:.82rem;color:var(--mut);white-space:nowrap}.wxr.hot .wxt em{color:var(--amber);font-weight:700}.wxr.soon .wxt em{color:var(--slate);font-weight:700}.wxm small{display:block;margin-top:4px;font-size:.8rem;color:var(--mut)}
.wxg{position:relative;height:7px;border-radius:99px;background:rgba(127,127,127,.18);margin-top:8px}.wxg i{position:absolute;inset:0 auto 0 0;border-radius:99px;background:var(--teal)}.wxr.hot .wxg i{background:var(--amber)}.wxr.soon .wxg i{background:var(--slate)}.wxg u{position:absolute;top:-4px;bottom:-4px;width:2px;margin-left:-1px;background:var(--primary-text-color);opacity:.7;border-radius:2px}
.wxp{display:flex;gap:4px;margin-top:8px}.wxp i{flex:1;height:7px;border-radius:99px;background:rgba(127,127,127,.18)}.wxp i.on{background:var(--amber)}.wxp i.on.l3,.wxp i.on.l4{background:#ef4444}
.wxnote{display:flex;gap:8px;align-items:center;margin-top:10px;font-size:.82rem;color:var(--mut)}
.wxlog{display:grid;gap:0;position:relative}.wxlog>div{display:grid;grid-template-columns:78px 1fr;gap:12px;padding:8px 0;font-size:.9rem;position:relative}.wxlog time{color:var(--mut);font-variant-numeric:tabular-nums;font-size:.82rem;padding-top:1px}.wxlog span{position:relative;padding-left:18px}.wxlog span::before{content:"";position:absolute;left:0;top:.45em;width:8px;height:8px;border-radius:50%;background:var(--teal)}.wxlog>div:not(:last-child) span::after{content:"";position:absolute;left:3.5px;top:1.4em;bottom:-1.1em;width:1px;background:var(--line)}
.tbvar{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 10px}.tbvar button{display:grid;gap:5px;text-align:left;padding:10px;border-radius:14px;border:1px solid var(--line);background:transparent;color:var(--mut);font:inherit;cursor:pointer;align-content:start}.tbvar button b{color:var(--primary-text-color);font-size:.88rem}.tbvar button small{font-size:.74rem;line-height:1.35}.tbvar button.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 12%,transparent)}@media(max-width:560px){.tbvar{grid-template-columns:1fr}}
.wbsc{overflow-x:auto}.wbsc svg{min-width:520px}.wbst{margin:12px 0 4px}.wbst b{font-size:1.05rem}
.wbses{display:grid;gap:8px}.wbse{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.wbse:first-child{border-top:0}.wbse>div{display:grid;gap:2px}.wbsb{height:8px;border-radius:99px;background:#f59e0b;overflow:hidden;display:block!important}.wbsb i{display:block;height:100%;background:#2dd4bf}.wbsv{text-align:right}
@media(max-width:560px){.wbse{grid-template-columns:1fr 1fr}.wbsb{grid-column:1/-1;order:3}}
.gsch{border:1px solid var(--line);background:transparent;color:var(--mut);border-radius:999px;padding:6px 14px;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}.gsch.sel{background:var(--teal);border-color:var(--teal);color:var(--on-acc)}
.gschips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}.gsq{margin:8px 0}
.evsw{width:30px;height:30px;border-radius:50%;border:2px solid var(--line);background:linear-gradient(135deg,var(--c2),var(--c));cursor:pointer;padding:0}.evsw.sel{border-color:var(--teal);box-shadow:0 0 0 2px var(--teal)}
.evcard{display:grid;gap:8px}.evhead{display:flex;justify-content:space-between;align-items:center}.evhead b{display:flex;align-items:center;gap:8px}
.evsvg{width:100%;max-height:300px}.evcable{opacity:0;transition:opacity .5s ease}.evcable.on{opacity:1}
.evflow{animation:evflow 1s linear infinite}.evpulse{animation:evpulse 1.4s ease-in-out infinite}@keyframes evpulse{50%{opacity:.45}}@keyframes evflow{to{stroke-dashoffset:-36}}
@media(prefers-reduced-motion:reduce){.evflow,.evpulse{animation:none}.evcable{transition:none}}
.lugrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.luroom{display:grid;gap:3px;border:1px solid var(--line);border-radius:14px;padding:12px 14px;font-size:.8rem}.luroom b{font-size:.92rem}.luroom .lv{font-size:1.5rem;font-weight:750}
.luroom .lv.green{color:#34d399}.luroom .lv.amber{color:#f59e0b}.luroom .lv.red{color:#f87171}.luroom.off{opacity:.55}
.lusoon{display:flex;align-items:center;gap:14px;opacity:.65;border-style:dashed}.lusoon>svg{flex:none;color:var(--mut)}.lusoon div{flex:1;display:grid;gap:2px}.lusoon .beta{margin:0}
.mbar{display:flex;gap:8px;overflow-x:auto;max-width:1180px;margin:0 auto;padding:12px 14px 0;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scroll-snap-type:x proximity;scroll-padding:0 14px;touch-action:pan-x pan-y}
.mbar::-webkit-scrollbar{display:none}
.mtab{scroll-snap-align:start;position:relative;flex:none;display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:var(--card);border-radius:16px;padding:8px 14px 8px 11px;cursor:pointer;text-align:left;color:var(--mut)}
.mtab span{display:block;line-height:1.15}.mtab small{display:block;font-size:.68rem;opacity:.85}.mtab b{display:block;font-size:.9rem;color:var(--primary-text-color);white-space:nowrap}
.mtab.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 13%,var(--card));color:var(--teal)}
.mtab.add{border-style:dashed;background:transparent}
.mdot{position:absolute;top:7px;right:8px;width:9px;height:9px;border-radius:50%;background:var(--amber);box-shadow:0 0 0 2px var(--card)}
.logo.ww{background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 4px 12px rgba(56,189,248,.35)}
.mrow{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:14px;padding:11px 12px;margin:8px 0}
.mrow .mi{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);flex:none}
.mrow .mt{flex:1;min-width:0}.mrow .mt b{display:block;font-size:.92rem}.mrow .mt span{display:block;font-size:.76rem;color:var(--mut);margin-top:1px;word-break:break-all}
.mact{display:flex;align-items:center;gap:10px;flex:none}.mact .btn2{flex:none;padding:7px 12px;font-size:.8rem}
.mbadge{font-size:.72rem;font-weight:700;border:1px solid var(--line);border-radius:999px;padding:4px 10px;color:var(--mut);white-space:nowrap}
.mrow:has(.soon){opacity:.72}
.murl{display:flex;gap:8px;margin:6px 0}.murl .otxt{flex:1}.murl .btn2{flex:none;padding:0 16px}
.minfo{border:1px solid var(--line);border-radius:14px;padding:10px 14px;font-size:.84rem;margin:6px 0 10px;background:color-mix(in srgb,var(--teal) 6%,transparent)}.minfo ul{margin:6px 0 0;padding-left:18px;display:grid;gap:4px}
code{font-family:ui-monospace,monospace;font-size:.78rem}
.wwh{background:linear-gradient(135deg,#0c4a6e,#075985 55%,#0e7490);display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center}
.wwh .wwl1 .lbl{max-width:none}.wwh .wwl1 .sub{max-width:none}
.wwh .wwtk{grid-column:2;grid-row:1}.wwtank{width:min(230px,50vw);height:auto;display:block}
.wwh .chips,.wwh .wwacts{grid-column:1/-1}
.wwh .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;padding-right:0}
.chip.st.ok{background:rgba(52,211,153,.3)}.chip.st.warn{background:rgba(251,146,60,.34)}
.wwacts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.wwa{display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;border-radius:14px;padding:10px 8px;font-size:.82rem;font-weight:600;cursor:pointer;text-align:center;line-height:1.15}
.wwa.on{background:#fff;color:#075985;border-color:#fff}.wwa[disabled]{opacity:.45;cursor:default}
.wwchart{width:100%;height:auto;display:block;color:var(--primary-text-color)}
.wwseg{margin-bottom:10px}
.wwbar{position:relative;height:30px;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:color-mix(in srgb,var(--line) 55%,transparent)}
.wwbar.heat{background:color-mix(in srgb,var(--low) 34%,var(--card))}
.wwbar .seg1{position:absolute;top:0;bottom:0;display:grid;place-items:center}.wwbar .seg1.circ{background:var(--teal)}.wwbar .seg1 em{font-style:normal;font-size:.72rem;font-weight:700;color:#06202b}
.wwbar u{position:absolute;top:0;bottom:0;width:2px;background:var(--primary-text-color);text-decoration:none;opacity:.9}
.wwax{display:flex;justify-content:space-between;font-size:.68rem;color:var(--mut);margin:3px 1px 8px}
.wwrs{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin-bottom:6px}.wwr{border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-size:.8rem}
.wwnote{display:flex;gap:8px;align-items:flex-start;font-size:.8rem;color:var(--mut);margin-top:6px}.wwnote .ic{flex:none;margin-top:1px}
.wwhint{display:flex;gap:8px;align-items:flex-start;font-size:.8rem;color:var(--mut);margin:0 0 10px}.wwhint .ic{flex:none;margin-top:1px}
.wwst{margin-left:auto;font-size:.75rem;font-weight:600;color:var(--mut);border:1px solid var(--line);border-radius:999px;padding:3px 10px}.wwst.on{color:var(--teal);border-color:var(--teal)}
.wwg2{display:grid;gap:14px}
@media(min-width:900px){.wwg2{grid-template-columns:1fr 1fr;align-items:start}}
.wsr{display:flex;align-items:center;gap:8px;margin:8px 0;flex-wrap:wrap}.wsr input{background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit;width:112px}.wsr .onum input{width:70px}
.wwe .t1{font-size:1.1rem;font-weight:700;color:var(--primary-text-color);margin:10px 0 6px}
.wwl{list-style:none;padding:0;margin:0 auto;display:inline-grid;gap:8px;text-align:left}.wwl li{display:flex;gap:8px;align-items:center}
.enh{background:linear-gradient(135deg,#064e3b,#0f766e 55%,#155e75)}
.enflow{width:100%;height:auto;display:block;max-width:460px;margin:0 auto}
.fl{fill:none;stroke-linecap:round;opacity:.16}.fl.on{opacity:1;stroke-dasharray:7 9;animation:flowdash 1.1s linear infinite}
@keyframes flowdash{to{stroke-dashoffset:-16}}
@media(prefers-reduced-motion:reduce){.fl.on{animation:none;stroke-dasharray:none}}
.fll{font-size:11px;font-weight:700;text-anchor:middle;paint-order:stroke;stroke:var(--card);stroke-width:3px}
.fln{font-size:12px;font-weight:700;text-anchor:middle;fill:var(--primary-text-color)}.fls{font-size:11.5px;text-anchor:middle;fill:var(--mut)}
.enseg{max-width:420px}
.endist{height:16px;margin:2px 0 10px}
.endr{display:grid;grid-template-columns:12px 1fr auto auto auto;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent);font-size:.86rem}.endr:last-of-type{border-bottom:0}
.endr span:not(.endot){color:var(--mut);text-align:right;min-width:52px}.endot{width:12px;height:12px;border-radius:4px}
.enrows>div{display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent);font-size:.88rem}.enrows>div:last-child{border-bottom:0}
.enrows span{color:var(--mut)}.enrows em{font-style:normal;font-size:.76rem}.enrows b{white-space:nowrap}.enrows .sum{font-weight:700}.enrows .sum span{color:var(--primary-text-color)}
.enrows .pos{color:#34d399}.enrows .neg{color:#f87171}
.bin{display:inline-block;position:relative;width:26px;height:30px;border-radius:4px 4px 8px 8px;flex:none;margin-top:5px}.bin:before{content:"";position:absolute;left:-2px;right:-2px;top:-5px;height:6px;border-radius:3px;background:inherit;filter:brightness(1.18)}.bin.sm{width:16px;height:18px;margin-top:4px;border-radius:2px 2px 5px 5px}.bin.sm:before{top:-3px;height:4px;left:-1px;right:-1px}
.mulead{margin:0 0 12px}.mulead b{display:block;font-size:1.05rem}.mulead span{color:var(--mut);font-size:.88rem}.mulead:not(.ok) b{color:var(--amber)}
.mugrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:10px}
.mubin{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(127,127,127,.07);color:var(--primary-text-color);font:inherit;text-align:center}
button.mubin{cursor:pointer}button.mubin:hover{border-color:color-mix(in srgb,var(--teal) 60%,var(--line))}button.mubin:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.mubin b{font-size:.92rem}.mubin small{font-size:.8rem;font-weight:700;color:var(--mut)}
.mubin.out,.mubin.today{border-color:color-mix(in srgb,var(--amber) 70%,var(--line));background:color-mix(in srgb,var(--amber) 12%,transparent)}.mubin.out small,.mubin.today small{color:var(--amber)}
.mubin.ok small,.mubin.done small{color:var(--green)}.mubin.none{opacity:.5}.mubin.soon small{color:var(--teal)}
.mucal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}.mucal em{font-style:normal;font-size:.72rem;color:var(--mut);padding:2px 0}
.mucd{font-style:normal;display:flex;flex-direction:column;align-items:center;gap:2px;padding:5px 0 4px;min-height:42px;border-radius:9px;background:rgba(127,127,127,.07);font-size:.82rem}.mucd.e{background:none}.mucd.today{outline:1.5px solid var(--teal)}
.mucd span{display:flex;gap:3px;min-height:7px}.mucd u{width:7px;height:7px;border-radius:50%;display:block}
.mublks{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));align-items:start}.mub.wide{grid-column:1/-1}
.mub.editing{padding:8px 10px 10px;margin:4px}.mub .etag{margin:0 0 8px 2px}.mub.hid>:not(.etag){opacity:.4;filter:grayscale(.6);pointer-events:none}.mub.hid{outline-style:dotted}
.eyeb{margin-left:auto;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:transparent;color:var(--primary-text-color);border-radius:999px;padding:5px 12px 5px 10px;font:inherit;font-size:.78rem;font-weight:600;cursor:pointer}.eyeb:hover{border-color:var(--teal)}.mub.hid .eyeb{color:var(--mut)}
.mublks .dragging{opacity:.35}
.labsec{display:flex;align-items:center;gap:8px;margin:4px 2px 8px;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#e07aa6}
.labtease{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:14px 0;padding:12px 14px;border-radius:16px;border:1px dashed color-mix(in srgb,#e07aa6 55%,transparent);background:color-mix(in srgb,#e07aa6 6%,transparent);color:#e07aa6}
.labtease>div{flex:1;min-width:200px;color:var(--primary-text-color)}.labtease b{display:block}.labtease span{display:block;font-size:.84rem;color:var(--mut)}
.risk.vab{color:#e07aa6;border-color:color-mix(in srgb,#e07aa6 55%,transparent);background:color-mix(in srgb,#e07aa6 10%,transparent)}
.lixgrid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));align-items:start;margin-top:14px}
.tgxrow{display:flex;align-items:center;gap:6px;padding-right:12px}.tgxrow+.tgxrow{border-top:1px solid var(--line)}.tgxrow .sxrow{flex:1;min-width:0}.tgxl{border:1px solid var(--line);border-radius:14px;margin:8px 0;overflow:hidden}
.tgxscan{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;border:1px dashed color-mix(in srgb,var(--teal) 60%,transparent);border-radius:14px;padding:16px;margin:8px 0;background:color-mix(in srgb,var(--teal) 7%,transparent)}.tgxscan.found{border-style:solid}
.tgxpulse{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;color:var(--teal);background:color-mix(in srgb,var(--teal) 18%,transparent);animation:tgxp 1.6s ease-in-out infinite}@keyframes tgxp{50%{box-shadow:0 0 0 12px color-mix(in srgb,var(--teal) 0%,transparent);transform:scale(1.06)}}@media(prefers-reduced-motion:reduce){.tgxpulse{animation:none}}
.tgxlog{display:flex;flex-direction:column;font-size:.8rem}.tgxlog>div{display:flex;flex-wrap:wrap;gap:2px 10px;padding:6px 0;border-top:1px solid var(--line)}
.lixroom.on{border-color:color-mix(in srgb,#fbbf24 55%,transparent);background:color-mix(in srgb,#fbbf24 7%,var(--card))}
.lixhd{display:flex;align-items:center;gap:10px}.lixico{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);color:var(--mut);flex:none}
.lixroom.on .lixico{background:color-mix(in srgb,#fbbf24 22%,transparent);color:#fbbf24}
.lixt{flex:1;min-width:0}.lixt b{display:block}.lixt small{display:block;color:var(--mut);font-size:.78rem}
.lixrng{display:flex;align-items:center;gap:10px;margin:12px 0 4px;color:var(--mut)}.lixrng input{flex:1;min-width:0;accent-color:#fbbf24;height:28px}.lixrng b{min-width:44px;text-align:right;color:var(--primary-text-color);font-size:.85rem}
.lixl{display:grid;gap:2px;margin-top:8px}.lixlamp{display:flex;align-items:center;gap:8px;padding:4px 0}.lixlamp.un{opacity:.5}
.lixnm{flex:1;min-width:0;display:flex;align-items:center;gap:10px;text-align:left;background:none;border:0;color:var(--primary-text-color);font:inherit;padding:8px 2px;cursor:pointer;min-height:40px}.lixnm svg{flex:none;color:var(--mut)}.lixlamp.on .lixnm svg{color:#fbbf24}.lixnm small{display:block;color:var(--mut);font-size:.74rem}
.lixscn .lixun{border-style:dashed;color:var(--mut)}.lixscn .lixun small{display:none}.lixtiles{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.lixhint{margin-top:12px;align-items:center}.lixhint .lnk{margin-left:auto;flex:none}
.lixsw{display:flex;flex-wrap:wrap;gap:12px;margin:8px 0}.lixc{width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0}.lixc.on{border-color:#fff;box-shadow:0 0 0 2px var(--teal,#2dd4bf)}

.hzbubs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 0;-webkit-overflow-scrolling:touch}.hzbubs::-webkit-scrollbar{display:none}
.hzb{flex:none;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);color:var(--primary-text-color);border-radius:999px;padding:5px 14px 5px 5px;font:inherit;cursor:pointer;text-align:left}
.hzb:hover{border-color:color-mix(in srgb,var(--teal) 60%,var(--line))}.hzb:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.hzb i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal);flex:none}
.hzb b{display:block;font-size:.88rem;line-height:1.15;white-space:nowrap}.hzb small{display:block;font-size:.68rem;color:var(--mut);white-space:nowrap}
.hzb.ok i{background:color-mix(in srgb,var(--green) 18%,transparent);color:var(--green)}
.hzb.wa{border-color:color-mix(in srgb,var(--amber) 60%,transparent);background:color-mix(in srgb,var(--amber) 9%,var(--card))}.hzb.wa i{background:color-mix(in srgb,var(--amber) 20%,transparent);color:var(--amber)}
.hzb.bad{border-color:#f87171;background:color-mix(in srgb,#f87171 12%,var(--card))}.hzb.bad i{background:color-mix(in srgb,#f87171 22%,transparent);color:#f87171}
.hzbe{border:2px dashed var(--line);border-radius:20px;padding:8px 10px 10px}
.hzhead{font-size:1.4rem;font-weight:700;color:var(--amber);line-height:1.2}.hzhead.ok{color:var(--green)}.hzhead.bad{color:#f87171}
.hzsub{color:var(--mut);font-size:.92rem;margin:2px 0 14px}
.hzgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:12px}
.hzt{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(127,127,127,.07);color:var(--primary-text-color);font:inherit;text-align:center;cursor:pointer}
.hzt:hover{border-color:color-mix(in srgb,var(--teal) 60%,var(--line))}.hzt:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.hzt .hti{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}
.hzt b{font-size:.95rem}.hzt small{font-size:.8rem;font-weight:700;color:var(--green)}
.hzt.wa{border-color:color-mix(in srgb,var(--amber) 70%,var(--line));background:color-mix(in srgb,var(--amber) 11%,transparent)}.hzt.wa small{color:var(--amber)}.hzt.wa .hti{background:color-mix(in srgb,var(--amber) 20%,transparent);color:var(--amber)}
.hzt.mut small{color:var(--mut)}.hzt.sel{border-color:var(--teal)}.hzt.sel small{color:var(--teal)}
.hzl{display:flex;flex-direction:column}
.hzr{display:flex;align-items:center;gap:14px;padding:10px 0;border:0;border-top:1px solid var(--line);background:none;color:var(--primary-text-color);font:inherit;text-align:left;width:100%}.hzl>.hzr:first-child{border-top:0;padding-top:2px}
button.hzr{cursor:pointer}
.hzr .hzri{width:44px;height:44px;border-radius:14px;background:rgba(127,127,127,.12);display:grid;place-items:center;flex:none;color:var(--mut)}.hzr.wa .hri{background:color-mix(in srgb,var(--amber) 16%,transparent);color:var(--amber)}.hzr.bad .hri{background:color-mix(in srgb,#f87171 18%,transparent);color:#f87171}
.hzr .hzrx{flex:1;min-width:0}.hzr .hzrx b{display:block;font-size:.98rem}.hzr .hzrx small{display:block;color:var(--mut);font-size:.84rem}
.hzr .hzrr{font-size:.85rem;color:var(--mut);text-align:right;flex:none}.hzr .hzrr.wa{color:var(--amber);font-weight:700}.hzr .hzrr.ok{color:var(--green);font-weight:700}.hzr .hzrr.bad{color:#f87171;font-weight:700}
.hzav{width:44px;height:44px;border-radius:50%;background:var(--c,#14b8a6) center/cover;display:grid;place-items:center;font-weight:700;color:#fff;position:relative;flex:none}
.hzav u{position:absolute;right:-1px;bottom:-1px;width:13px;height:13px;border-radius:50%;border:2px solid var(--card);background:#6b7280}.hzav.home u{background:var(--green)}
.hzrt{margin-left:auto;font-size:.78rem;font-weight:500;color:var(--mut);max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hzwx{display:flex;align-items:center;gap:14px}.hzwi{color:var(--amber);flex:none}.hzbig{font-size:2.2rem;font-weight:700;line-height:1}.hzbig small{font-size:1rem;color:var(--mut);font-weight:500}
.hzfc{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.hzfc div{background:rgba(127,127,127,.1);border-radius:12px;padding:8px 4px;text-align:center;color:var(--mut);display:flex;flex-direction:column;align-items:center;gap:2px}.hzfc b{color:var(--primary-text-color);font-size:1rem}.hzfc small{font-size:.74rem}
.hzgo{cursor:pointer}.hzflash{animation:hzf 1.2s}@keyframes hzf{0%,100%{box-shadow:none}30%{box-shadow:0 0 0 3px var(--teal)}}
.hzo{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:14px;margin-bottom:7px;background:rgba(127,127,127,.05)}.hzo.on{border-color:color-mix(in srgb,var(--teal) 45%,var(--line))}
.hzck{width:24px;height:24px;border-radius:8px;border:2px solid var(--line);background:transparent;display:grid;place-items:center;cursor:pointer;color:var(--on-acc);padding:0;flex:none}.hzck.on{background:var(--teal);border-color:var(--teal)}
.hzoi{width:34px;height:34px;border-radius:10px;background:color-mix(in srgb,var(--teal) 14%,transparent);color:var(--teal);display:grid;place-items:center;flex:none}
.hzot{flex:1;min-width:0}.hzot b{display:block;font-size:.92rem}.hzot small{display:block;font-size:.76rem;color:var(--mut)}
.hzo .ibtn.dn svg{transform:rotate(180deg)}.gschs{display:inline-flex;gap:6px;flex-wrap:wrap}
@media(max-width:520px){.hzgrid{grid-template-columns:repeat(2,1fr)}.hzrt{max-width:42%}}
/* Tablet-Modus */
.tmw{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;background:var(--primary-background-color,#0f1419);color:var(--primary-text-color,#e6edf3)}
.tmh{display:flex;align-items:center;gap:16px;padding:calc(12px + env(safe-area-inset-top,0px)) 20px 6px}
.tmh .blogo{width:48px;height:48px;flex:none}
.tmht{flex:1;min-width:0}.tmht b{display:block;font-size:1.3rem;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tmht span{display:block;font-size:.85rem;color:var(--mut)}
.tmclk{text-align:right;line-height:1}.tmclk span{display:block;font-size:2.6rem;font-weight:300;letter-spacing:-1px}.tmclk small{display:block;font-size:.85rem;color:var(--mut);margin-top:3px}
.tmgear{width:50px;height:50px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--mut);display:grid;place-items:center;cursor:pointer;flex:none}
.tmbody{flex:1;min-height:0;overflow:auto;padding:10px 20px 16px;display:grid;gap:14px;align-content:start;-webkit-overflow-scrolling:touch}
.tmbody .hzbubs{flex-wrap:wrap;overflow:visible;padding:0}
.tmgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.tmgrid .hzt{align-items:flex-start;text-align:left;min-height:150px;padding:18px;border-radius:24px;gap:8px;background:var(--card)}
.tmgrid .hzt .hti{width:54px;height:54px;border-radius:16px}.tmgrid .hzt b{font-size:1.15rem}.tmgrid .hzt small{font-size:1.05rem;margin-top:auto}
.tmhints{display:grid;gap:10px}
.tmhint{display:flex;align-items:center;gap:14px;border:1px solid var(--line);background:var(--card);border-radius:18px;padding:12px 16px}
.tmhint.wa{border-color:color-mix(in srgb,var(--amber) 60%,transparent)}.tmhint.bad{border-color:#f87171}
.tmhi{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:rgba(127,127,127,.12);flex:none}.tmhint.wa .tmhi{color:var(--amber)}.tmhint.bad .tmhi{color:#f87171}
.tmhint b{display:block;font-weight:600}.tmhint small{display:block;color:var(--mut)}
.tmrooms{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.tmroom{border:1px solid var(--line);background:var(--card);border-radius:24px;padding:18px;display:flex;flex-direction:column;gap:6px}
.tmroom.wa{border-color:var(--amber);background:color-mix(in srgb,var(--amber) 10%,var(--card))}
.tmrt{display:flex;align-items:center;gap:12px}.tmrt b{font-size:1.15rem}
.tmrt .hti{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;background:color-mix(in srgb,var(--teal) 16%,transparent);color:var(--teal)}
.tmroom.wa .hti{background:color-mix(in srgb,var(--amber) 20%,transparent);color:var(--amber)}
.tmrs{color:var(--mut);font-size:.9rem}.tmroom.wa .tmrs{color:var(--amber)}
.tmpm{display:flex;align-items:center;gap:12px;margin-top:10px}
.tmb2{width:64px;height:64px;border-radius:50%;border:1px solid var(--line);background:rgba(127,127,127,.12);color:inherit;display:grid;place-items:center;cursor:pointer;flex:none}
.tmb2:disabled{opacity:.35}.tmb2:active:not(:disabled){background:color-mix(in srgb,var(--teal) 25%,transparent)}
.tmv{flex:1;text-align:center;font-size:2.3rem;font-weight:700}.tmv small{font-size:1rem;color:var(--mut);font-weight:500}
.tmdock{display:flex;gap:10px;padding:10px 16px calc(14px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card)}
.tmdk{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:84px;border-radius:20px;border:1px solid var(--line);background:rgba(127,127,127,.07);color:var(--mut);font:inherit;font-size:.8rem;position:relative;cursor:pointer}
.tmdk span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 4px}
.tmdk.sel{border-color:var(--teal);background:color-mix(in srgb,var(--teal) 13%,transparent);color:var(--teal)}
.tmdot{position:absolute;top:9px;right:14px;width:10px;height:10px;border-radius:50%;background:var(--amber)}
.tmmore{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.tmmore .tmdk{height:92px}
.tmrest{position:fixed;inset:0;z-index:30;background:#000;color:#d7dde4;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px}
.tmrc{font-size:min(26vw,11rem);font-weight:200;letter-spacing:-.04em;line-height:1}.tmrd{font-size:1.6rem;color:#8a929b}
.tmrf{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 40px;margin-top:34px;color:#6f7780;font-size:1.15rem}.tmrf div{display:flex;align-items:center;gap:10px}
.tmrw{position:absolute;bottom:26px;color:#4d545b;font-size:.95rem}
.tmpad{max-width:420px}
.tmdots{display:flex;justify-content:center;gap:14px;margin:14px 0 6px}.tmdots i{width:16px;height:16px;border-radius:50%;border:2px solid var(--mut)}.tmdots i.f{background:var(--teal);border-color:var(--teal)}
.tmerr{min-height:1.4em;text-align:center;color:#f87171;font-size:.88rem;margin-bottom:8px}
.tmkeys{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;justify-items:center}
.tmkeys button{width:72px;height:72px;border-radius:50%;border:1px solid var(--line);background:rgba(127,127,127,.12);color:inherit;font:inherit;font-size:1.6rem;cursor:pointer}.tmkeys button.z{border:0;background:none;color:var(--mut);font-size:.95rem}
.tmbn{display:flex;align-items:center;gap:14px;flex-wrap:wrap;border:1px solid color-mix(in srgb,var(--teal) 50%,transparent);background:color-mix(in srgb,var(--teal) 9%,var(--card));border-radius:18px;padding:14px 16px}
.tmbt{flex:1;min-width:200px}.tmbt b{display:block}.tmbt span{color:var(--mut);font-size:.88rem}
.tmurl{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;padding:6px 6px 6px 12px;overflow:hidden}.tmurl code{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem;color:var(--teal)}
@media(max-width:520px){.tmclk span{font-size:1.8rem}.tmclk small{display:none}.tmmore{grid-template-columns:repeat(2,1fr)}}


/* Sponsor-Bereich (3.0.2.13) */
.spnb{--spr:#e07aa6}.pillbtn.spnb,.btn2.spnb{color:var(--spr);border-color:color-mix(in srgb,var(--spr) 55%,transparent);background:color-mix(in srgb,var(--spr) 12%,transparent);font-weight:700}
.spnb svg{fill:currentColor}.pillbtn.spnb.pri,.btn2.spnb.pri{background:var(--spr);border-color:var(--spr);color:#2a0f1b}.pillbtn.spnb.on{background:color-mix(in srgb,var(--spr) 16%,transparent)}
.spnc{display:flex;align-items:center;gap:14px;flex-wrap:wrap;border:1px solid color-mix(in srgb,#e07aa6 35%,var(--line));background:color-mix(in srgb,#e07aa6 6%,var(--card,#1c1c1c));border-radius:20px;padding:14px 16px;margin:0 0 12px}
.spnbig{width:46px;height:46px;border-radius:14px;background:color-mix(in srgb,#e07aa6 16%,transparent);display:grid;place-items:center;flex:none;color:#e07aa6}.spnbig svg{fill:currentColor}
.spnt{flex:1;min-width:200px}.spnt b{display:block}.spnt span{display:block;font-size:.86rem;color:var(--mut)}.spnc a{text-decoration:none}
.spnthx{display:flex;gap:10px;align-items:center;border:1px solid color-mix(in srgb,#e07aa6 45%,transparent);background:color-mix(in srgb,#e07aa6 10%,transparent);border-radius:12px;padding:10px 12px;font-size:.9rem;font-weight:600}.spnthx svg{fill:#e07aa6;stroke:#e07aa6;flex:none}
.spnl{display:block;margin-top:3px;font-size:.76rem;color:var(--mut)}.spnl svg{fill:#e07aa6;stroke:#e07aa6;vertical-align:-2px}.spnl a{color:#e07aa6}
.spnperks{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.spnperks>div{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:10px 12px}
.spnperks svg{color:#e07aa6;flex:none}.spnperks span{font-size:.8rem;color:var(--mut)}.spnperks b{display:block;font-size:.9rem;color:var(--primary-text-color,#e8eaed)}
.spnta{width:100%;margin:0;font:12.5px ui-monospace,Menlo,monospace;resize:vertical;word-break:break-all}
.spnkeybox{border:1px solid var(--line);background:#222;border-radius:12px;padding:12px;font:12.5px/1.45 ui-monospace,Menlo,monospace;word-break:break-all;color:var(--mut);user-select:all}
.spnsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 6px}.spnsum>div{border:1px solid var(--line);background:#222;border-radius:14px;padding:10px 12px}.spnsum small{display:block;color:var(--mut);font-size:.72rem}.spnsum b{font-size:1.4rem}.spnsum b.wa{color:#f59e0b}
.spnrow{display:grid;grid-template-columns:40px 1fr auto auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}
.spna{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:700;background:#e07aa6;color:#2a0f1b}.spna.off{background:#444;color:#ccc}
.spnn b{display:block}.spnn small{display:block;color:var(--mut);font-size:.78rem}
.spns{font-style:normal;font-size:.7rem;font-weight:700;padding:3px 9px;border-radius:99px;border:1px solid;white-space:nowrap}
.spns.g{color:#34d399;border-color:color-mix(in srgb,#34d399 50%,transparent)}.spns.a{color:#f59e0b;border-color:color-mix(in srgb,#f59e0b 50%,transparent)}.spns.r{color:#f87171;border-color:color-mix(in srgb,#f87171 50%,transparent)}.spns.x{color:var(--mut);border-color:var(--line)}
.spnmini{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:transparent;color:inherit;border-radius:99px;padding:5px 10px;font-size:.76rem;font-weight:600;cursor:pointer}
.spnck{display:flex;gap:8px;align-items:center;font-size:.88rem;cursor:pointer}
@media(max-width:520px){.spnrow{grid-template-columns:40px 1fr auto}.spnrow .spns{grid-column:2}.spnrow .spnmini{grid-column:2}.spnrow .spnmore{grid-column:3;grid-row:1}.spnperks{grid-template-columns:1fr}}
:host(.spg-meer) .bar{background:linear-gradient(110deg,rgba(14,116,144,.38),rgba(30,58,138,.18) 60%,transparent);border-radius:20px;padding-bottom:12px}
:host(.spg-abend) .bar{background:linear-gradient(110deg,rgba(217,119,6,.34),rgba(190,24,93,.2) 60%,transparent);border-radius:20px;padding-bottom:12px}
.tmrc.ck-duenn{font-weight:100}.tmrc.ck-kraeftig{font-weight:800;color:var(--teal,#2dd4bf)}.tmrc.ck-digital{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-weight:700;color:#f59e0b;letter-spacing:.04em}
`;
class FensterHeizungPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._narrow = false; this._edit = false; this._modal = null; this._dragging = false;
    this._cfg = { layout: { blocks: [], rooms: [], icons: {}, groups: [] }, plans: {}, presence: { mode: "home" } };
    this._gen = { updates: true, summer: { mode: "auto", temp: 18, days: 3 }, wxadj: { on: false, mild: 12, down: 1, frost: 0, up: 1 }, pv: { ...PVDEF } };
    this._learn = {}; this._st = null; this._stOpen = false; this._labOpen = false; this._ortOpen = false; this._igOpen = false; this._pollN = 0;
  }
  connectedCallback() {
    this._ro = new ResizeObserver(() => { if (this._hass && !this._dragging && Math.abs(this.clientWidth - (this._w || 0)) > 24) this._render(); });
    this._ro.observe(this);
    this._ti = setInterval(() => this._tick(), 1000);
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); clearInterval(this._ti); }
  _tick() {
    this._tmTick();
    if (this._hass && ++this._pollN % 60 === 0) { this._pollGen(); this._mdPoll(); }
    this.shadowRoot.querySelectorAll("[data-since]").forEach((el) => {
      const c = cdown(+el.dataset.since, +el.dataset.need), b = el.querySelector("[data-cd]"), f = el.querySelector("[data-bar]");
      if (b) b.textContent = c.txt; if (f) f.style.width = c.pct + "%"; el.classList.toggle("done", c.left <= 0);
    });
  }
  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (first) this._load();
    this._render();
    if (this._modal && this._modal.type === "why") this._renderModal();  // Gründe bleiben aktuell
  }
  set narrow(v) { this._narrow = v; this._render(); }
  set panel(_) {}
  set route(_) {}

  async _load() {
    try {
      const r = await this._hass.callWS({ type: "fenster_heizung/get_state" });
      this._cfg = { layout: { blocks: [], rooms: [], icons: {}, groups: [], ...(r.layout || {}) }, plans: r.plans || {}, presence: r.presence || { mode: "home" } };
      this._ver = r.version || "";
      this._st = r.status || null;
      this._gen = { updates: true, summer: { mode: "auto", temp: 18, days: 3 }, wxadj: { on: false, mild: 12, down: 1, frost: 0, up: 1 }, ...(r.general || {}) };
      this._gen.summer = { mode: "auto", temp: 18, days: 3, ...(this._gen.summer || {}) };
      this._gen.wxadj = { on: false, mild: 12, down: 1, frost: 0, up: 1, ...(this._gen.wxadj || {}) };
      this._gen.pv = { ...PVDEF, ...(this._gen.pv || {}) };
      this._mdApply(r);
    } catch (e) { /* älteres Backend: Standardwerte */ }
    this._cfgReady = true;
    try { await this._tmLoad(); } catch (_) { /* Tablet-Modus ist optional */ }
    try { await this._spnLoad(); this._spnApply(); } catch (_) { /* Sponsor-Bereich ist optional */ }
    try { this._upd = await this._hass.callWS({ type: "fenster_heizung/get_update" }); } catch (_) { this._upd = null; }
    this._render();
  }
  _admin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }
  _saveLayout() { this._hass.callWS({ type: "fenster_heizung/set_layout", layout: this._cfg.layout }).catch(() => this._toast("Layout konnte nicht gespeichert werden")); }
  _toast(msg) {
    const t = this.shadowRoot.getElementById("toast"); if (!t) return;
    t.innerHTML = `<div class="toast">${esc(msg)}</div>`; clearTimeout(this._tt);
    this._tt = setTimeout(() => (t.innerHTML = ""), 2600);
  }

  _my() { try { const j = JSON.parse(localStorage.getItem("fh_my") || "{}"); return { on: !!j.on, hidden: j.hidden || [], order: j.order || [], hb: j.hb || [] }; } catch (_) { return { on: false, hidden: [], order: [], hb: [] }; } }
  _mySet(m) { try { localStorage.setItem("fh_my", JSON.stringify(m)); } catch (_) { /* privater Modus */ } }
  _collect(raw) {
    const l = this._collect0(), my = this._my();
    if (raw || this._edit || !my.on) return l;
    const v = l.filter((r) => !my.hidden.includes(r.id));
    return my.order.length ? v.sort((x, y) => { const a = my.order.indexOf(x.id), b = my.order.indexOf(y.id); return (a < 0 ? 999 : a) - (b < 0 ? 999 : b); }) : v;
  }
  _collect0() {
    const h = this._hass, rooms = new Map();
    for (const [eid, ent] of Object.entries(h.entities || {})) {
      if (ent.platform !== "fenster_heizung") continue;
      const st = h.states[eid];
      if (!st) continue;
      const key = ent.device_id || eid;
      let r = rooms.get(key);
      if (!r) {
        const dev = (h.devices || {})[key] || {};
        r = { id: key, name: dev.name_by_user || dev.name || eid, sc: {}, hist: {} };
        rooms.set(key, r);
      }
      const a = st.attributes || {};
      if (eid.startsWith("switch.")) { if (a.funktion === "heizplan") { r.planOn = st.state === "on"; } else if (a.funktion === "heizer") { r.htrSw = eid; r.htrOn = st.state === "on"; } else { r.sw = eid; r.on = st.state === "on"; } }
      else if (a.zeitraum) {
        r.fuel = FUELS[a.brennstoff] ? a.brennstoff : "erdgas";
        r.sc[a.zeitraum] = { min: Number(st.state) || 0, gas: Number(a.gespart_menge ?? a.gespartes_gas_m3) || 0, kwh: a.gespartes_gas_kwh || 0 };
        r.apk = Number(a.menge_pro_kwh) || r.apk || 0.1;
        if (a.zeitraum === "day") { r.pauses = a.pausen_heute || 0; r.kw = a.aktuelle_leistung_kw || 0; r.hist = a.verlauf || {}; }
      } else if ("thermostate" in a) {
        r.modeEid = eid; r.mode = st.state; r.why = a.grund || []; r.windows = a.fenster || []; r.thermos = Object.keys(a.thermostate || {}); if (a.entry_id) r.id = a.entry_id; r.humEid = a.luftfeuchte_sensor || ""; r.wxOff = a.wetter_anpassung === "aus"; r.htr = a.heizer || null; r.airOff = a.lueftungshinweise === "aus"; r.airEvery = a.lueften_nach_h != null ? Number(a.lueften_nach_h) : 8; r.lastAir = a.zuletzt_gelueftet ? new Date(a.zuletzt_gelueftet).getTime() : 0;
      }
    }
    const list = [...rooms.values()];
    const cc = this._cfg.layout.colors || {};
    [...list].sort((x, y) => x.name.localeCompare(y.name, "de")).forEach((r, i) => { r.ci = i; r.color = HEX.test(cc[r.id] || "") ? cc[r.id] : COLORS[i % COLORS.length]; });
    const order = this._cfg.layout.rooms || [], prio = { heizung_pausiert: 0, regelung_aktiv: 1, nur_fenstermeldung: 2, regelung_aus: 3 };
    return list.sort((x, y) => {
      const ix = order.indexOf(x.id), iy = order.indexOf(y.id);
      if (ix >= 0 && iy >= 0) return ix - iy;
      if (ix >= 0) return -1;
      if (iy >= 0) return 1;
      return (prio[x.mode] ?? 9) - (prio[y.mode] ?? 9) || x.name.localeCompare(y.name, "de");
    });
  }
  _icon(r) { return (this._cfg.layout.icons || {})[r.id] || roomIcon(r.name); }
  _blockOrder() {
    const known = Object.keys(BLOCKS), o = (this._cfg.layout.blocks || []).filter((b) => known.includes(b)), my = this._my();
    const miss = known.filter((b) => !o.includes(b));
    let all = [...o, ...miss];
    if (miss.includes("pv") && all.includes("rooms")) { all = all.filter((b) => b !== "pv"); all.splice(all.indexOf("rooms"), 0, "pv"); }
    return my.on && !this._edit ? all.filter((b) => !my.hb.includes(b)) : all;
  }

  _days(rooms, n = 14) {
    const out = [], now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      out.push({ d, iso, v: rooms.map((r) => (i === 0 ? r.sc.day?.min || 0 : Number(r.hist[iso]) || 0)) });
    }
    return out;
  }
  _chart(rooms) {
    const days = this._days(rooms), W = Math.max(300, Math.min(1100, (this.clientWidth || 390) - 62)), H = 230, L = 36, R = 6, T = 12, B = 30;
    this._w = this.clientWidth;
    const lblStep = W < 480 ? 3 : 2;
    const tot = days.map((x) => x.v.reduce((a, b) => a + b, 0));
    const step = [30, 60, 120, 240, 480].find((s) => Math.max(...tot, 1) / s <= 4) || 480;
    const max = Math.max(Math.ceil(Math.max(...tot, 1) / step) * step, step);
    const iw = (W - L - R) / days.length, bw = iw * 0.62, y = (v) => T + (H - T - B) * (1 - v / max);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Pausenzeit pro Tag">`;
    for (let v = 0; v <= max; v += step) {
      s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-dasharray="${v ? "3 4" : "0"}"/>`;
      s += `<text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="var(--mut)">${v}</text>`;
    }
    days.forEach((dd, i) => {
      const x = L + iw * i + (iw - bw) / 2; let acc = 0;
      dd.v.forEach((v, k) => {
        if (v <= 0) return;
        const y1 = y(acc + v), h = y(acc) - y1; acc += v;
        s += `<rect x="${x}" y="${y1}" width="${bw}" height="${Math.max(h, 1)}" rx="3" fill="${rooms[k].color}"/>`;
      });
      const today = i === days.length - 1, lab = (days.length - 1 - i) % lblStep === 0;
      if (lab) s += `<text x="${today ? x + bw : x + bw / 2}" y="${H - 8}" text-anchor="${today ? "end" : "middle"}" font-size="12" fill="${today ? "var(--primary-text-color)" : "var(--mut)"}" font-weight="${today ? 700 : 400}">${today ? "heute" : dd.d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })}</text>`;
    });
    if (!tot.some(Boolean)) s += `<text x="${(L + W - R) / 2}" y="${(T + H - B) / 2}" text-anchor="middle" font-size="13" fill="var(--mut)">Noch keine Pausen in den letzten 14 Tagen</text>`;
    return s + "</svg>";
  }
  _spark(r) {
    const days = this._days([r], 7).map((x) => x.v[0]), max = Math.max(...days, 1);
    return `<svg viewBox="0 0 84 30" width="84" height="30" aria-hidden="true">${days.map((v, i) =>
      `<rect x="${i * 12 + 1}" y="${28 - Math.max((v / max) * 26, 1.5)}" width="9" height="${Math.max((v / max) * 26, 1.5)}" rx="2.5" fill="var(--teal)" opacity="${i === 6 ? 1 : 0.45}"/>`).join("")}</svg>`;
  }
  _art() {
    return `<svg class="art" viewBox="0 0 200 150" aria-hidden="true">
    <circle cx="100" cy="72" r="62" fill="rgba(255,255,255,.07)"/>
    <rect x="26" y="8" width="114" height="84" rx="9" fill="#ecfeff"/><rect x="34" y="16" width="98" height="68" rx="5" fill="#0b3b4a"/>
    <rect x="38" y="20" width="44" height="60" rx="2" fill="#bfeaf2"/><path d="M60 20v60M38 50h44" stroke="#ecfeff" stroke-width="3"/>
    <path d="M88 20l36 9v42l-36 9z" fill="#d4f3f8" stroke="#ecfeff" stroke-width="3" stroke-linejoin="round"/><path d="M88 50l36 0" stroke="#ecfeff" stroke-width="2.5"/>
    <rect x="34" y="104" width="100" height="36" rx="9" fill="#fff"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${44 + i * 15}" y="111" width="8" height="22" rx="4" fill="#0f766e"/>`).join("")}
    <circle cx="150" cy="122" r="9" fill="#f59e0b"/><circle cx="150" cy="122" r="4.5" fill="#fde68a"/>
    <g transform="translate(144 4) scale(2.2)"><path d="M12 2.5c1.1 3 5.2 5.4 5.2 10.2A5.2 5.2 0 0 1 12 18a5.2 5.2 0 0 1-5.2-5.3c0-2.2 1.2-3.6 2.4-4.8.2 1.8 1 2.8 2 3.2C11.6 8.6 10.8 5.4 12 2.5z" fill="#fb923c"/>
    <path d="M12 9c.6 1.8 2.8 2.9 2.8 5.2A2.8 2.8 0 0 1 12 17a2.8 2.8 0 0 1-2.8-2.8c0-1.2.7-2 1.3-2.6.1 1 .5 1.5 1 1.8C11.4 11.3 11 10 12 9z" fill="#fde047"/></g>
    <path d="M150 50l36 36" stroke="#ecfeff" stroke-width="4" stroke-linecap="round"/></svg>`;
  }

  _pres() { return { mode: "home", temp: 16, preheat: true, preheat_time: "12:00", auto: true, persons: [], away_after: 30, ...(this._cfg.presence || {}) }; }
  _away() { const p = this._pres(); return (p.effective ?? p.mode) !== "home"; }
  _fmtD(iso) { return iso ? new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) : "–"; }

  /* ---------------- Gruppen ---------------- */
  _collapsed() {
    try { return new Set(JSON.parse(localStorage.getItem("fh_collapsed") || "[]")); } catch (_) { return new Set(); }
  }
  _setCollapsed(set) { try { localStorage.setItem("fh_collapsed", JSON.stringify([...set])); } catch (_) { /* Speicher gesperrt */ } }
  _updBanner() {
    const u = this._upd, g = this._gen || {};
    if (!this._admin() || !u || g.updates === false || !vgt(u.latest, this._ver)) return "";
    try { if (localStorage.getItem("fh_upd_skip") === u.latest) return ""; } catch (_) { /* egal */ }
    return `<div class="upd">${ic("bell", 22)}<div><b>Neue Version ${esc(u.latest)} verfügbar</b><span>Installiert ist ${esc(this._ver)}${u.date ? " · veröffentlicht am " + esc(new Date(u.date + "T12:00:00").toLocaleDateString("de-DE")) : ""}</span>${this._spnLine()}</div><button class="lnk" data-act="news">Das ist neu</button><button class="ibtn" data-act="updx" aria-label="Ausblenden">${ic("close", 18)}</button></div>`;
  }
  _view() { try { return localStorage.getItem("fh_view") === "compact" ? "compact" : "detail"; } catch (_) { return "detail"; } }
  _viewBar() {
    const v = this._view();
    return `<div class="vbar"><button class="myb ${this._my().on ? "on" : ""}" data-act="my">${ic("user", 15)}Meine Ansicht</button><div class="vseg" role="group" aria-label="Ansicht der Raumkarten">${[["compact", "list", "Kompakt"], ["detail", "grid", "Detail"]].map(([k, i, l]) => `<button class="${v === k ? "sel" : ""}" data-act="view" data-k="${k}" aria-pressed="${v === k}">${ic(i, 16)}${l}</button>`).join("")}</div></div>`;
  }
  _rv(r) { return this._view() === "compact" ? this._row(r) : this._room(r); }
  _head() { return this._view() === "compact" ? `<div class="chead ${this._edit ? "ed" : ""}">${this._edit ? "<span></span>" : ""}<span></span><span>Raum</span><span>Fenster</span><span>Heizung</span><span>Heizplan</span><span>Pausiert</span><span></span><span></span></div>` : ""; }
  _row(r) {
    const h = this._hass, m = MODE[r.mode] || MODE.regelung_aus, edit = this._edit, adm = this._admin();
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), open = wins.filter((w) => ["on", "open"].includes(w.state));
    const th = (r.thermos || []).map((e) => h.states[e]).filter(Boolean), t0 = th[0], cur = t0?.attributes.current_temperature, tgt = t0?.attributes.temperature;
    const hv = t0 ? (t0.state === "off" ? "aus" : t0.state === "heat" ? "heizt" : t0.state === "auto" ? "Automatik" : t0.state) : "–";
    const d = r.sc.day || { min: 0, gas: 0, kwh: 0 };
    const p0 = this._cfg.plans[r.id] || { enabled: false, entries: [] }, pts = points(p0.entries), now = nowMin(), today = Math.floor(now / 1440);
    const planOn = (r.planOn ?? p0.enabled) && !this._away() && !this._sum().active;
    const plan = pts.length
      ? `<b>${num(at(pts, now), 1)} °C jetzt</b><span ${planOn ? "" : 'style="opacity:.5"'}>${barRow(pts, today, now)}</span>`
      : `<b style="color:var(--mut);font-weight:500">kein Plan</b>`;
    const icon = edit
      ? `<button class="rico" style="${rcStyle(r.color)}" data-act="icon" data-id="${esc(r.id)}" aria-label="Symbol ändern">${ico(this._icon(r), 28)}<span class="pen">${ic("pencil", 11)}</span></button>`
      : `<div class="rico" style="${rcStyle(r.color)}">${ico(this._icon(r), 28)}</div>`;
    return `<div class="card crow ${edit ? "ed" : ""}${this._ph(r).c}"${this._ph(r).s} data-sort="room" data-id="${esc(r.id)}">
      ${edit ? `<span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>` : ""}${icon}
      <div class="rn"><b>${esc(r.name)}</b><span class="pill ${m.c}">${m.t}</span>${this._airChip(r)}${this._htrChip(r)}${this._devChip(r)}</div>
      <div class="cells">
        <div class="cell w1 win ${open.length ? "amber" : ""}"><b>${ic(open.length ? "windowOpen" : "window", 15)}${open.length ? `${open.length} von ${wins.length} offen` : "geschlossen"}</b>${esc(open.length ? open.map((w) => w.attributes.friendly_name || w.entity_id).join(", ") : wins.length + (wins.length === 1 ? " Fenster" : " Fenster"))}</div>
        <div class="cell w2"><b>${cur != null ? num(cur, 1) + " °C" : hv}</b>${t0 ? (cur != null && tgt != null ? `Ziel ${num(tgt, 1)} · ` : "") + hv : "kein Thermostat"}</div>
        <div class="cell plan2">${plan}</div>
        <div class="cell w4"><b>${num(d.min)} Min.</b>~${num(d.gas, 2)} ${unitOf(FUELS[r.fuel || "erdgas"])}</div>
      </div>
      <div class="acts">${adm ? `<button class="ibtn" data-act="opt" data-id="${esc(r.id)}" aria-label="Raumeinstellungen">${ic("sliders", 16)}</button>` : ""}<button class="ibtn" data-act="why" data-id="${esc(r.id)}" aria-label="Warum?">${ic("info", 16)}</button><button class="ibtn" data-act="rep" data-id="${esc(r.id)}" aria-label="Bericht">${ic("chart", 16)}</button>${adm ? `<button class="ibtn" data-act="plan" data-id="${esc(r.id)}" aria-label="Heizplan bearbeiten">${ic("pencil", 16)}</button>` : ""}</div>
      <button class="sw ${r.on ? "on" : ""}" data-act="sw" data-sw="${esc(r.sw)}" aria-label="Fensterregelung umschalten" aria-pressed="${!!r.on}"></button></div>`;
  }
  _groupsHtml(rooms) {
    const groups = (this._cfg.layout.groups || []).filter((g) => g && g.name), edit = this._edit, adm = this._admin();
    const roomBtn = adm ? `<button class="gadd" data-act="oadd">${ic("plus", 18)}Raum hinzufügen</button>` : "";
    const addBtn = (edit && adm ? `<button class="gadd" data-act="gadd">${ic("plus", 18)}Gruppe hinzufügen</button>` : "") + roomBtn;
    if (!groups.length) return this._viewBar() + this._head() + `<div class="rooms ${this._view() === "compact" ? "list" : ""}" data-sort-container="room">${rooms.map((r) => this._rv(r)).join("")}</div>${addBtn}`;
    const used = new Set(groups.flatMap((g) => g.rooms || [])), rest = rooms.filter((r) => !used.has(r.id)), col = this._collapsed();
    const list = groups.map((g) => ({ ...g, members: rooms.filter((r) => (g.rooms || []).includes(r.id)) }));
    if (rest.length) list.push({ id: "_rest", name: "Weitere Räume", icon: "home", members: rest, fixed: true });
    const dot = { green: "#34d399", amber: "#f59e0b", slate: "#7dd3fc", gray: "#94a3b8" };
    const html = list.map((g, gi) => {
      const m = g.members, paused = m.filter((r) => r.mode === "heizung_pausiert").length, min = m.reduce((a, r) => a + (r.sc.day?.min || 0), 0);
      const fs = new Set(m.map((r) => r.fuel || "erdgas")), amount = fs.size === 1 ? `${num(m.reduce((a, r) => a + (r.sc.day?.gas || 0), 0), 2)} ${FUELS[[...fs][0]].label}` : `${num(m.reduce((a, r) => a + (r.sc.day?.kwh || 0), 0), 1)} kWh Wärme`;
      const allOn = m.length > 0 && m.every((r) => r.on), closed = col.has(g.id);
      const stat = m.length ? `${m.length} ${m.length === 1 ? "Raum" : "Räume"} · ${paused ? paused + " pausiert" : "alle aktiv"} · ${num(min)} Min. · ${amount}` : "Noch keine Räume";
      const mv = edit && adm && !g.fixed ? `<button class="gmv up" data-act="gmv" data-g="${esc(g.id)}" data-dir="-1" ${gi === 0 ? "disabled" : ""} aria-label="Gruppe nach oben">${ic("chev", 16)}</button><button class="gmv" data-act="gmv" data-g="${esc(g.id)}" data-dir="1" ${gi >= groups.length - 1 ? "disabled" : ""} aria-label="Gruppe nach unten">${ic("chev", 16)}</button><button class="gedit" data-act="gedit" data-g="${esc(g.id)}" aria-label="Gruppe bearbeiten">${ic("pencil", 16)}</button>` : "";
      const body = !m.length ? "" : closed
        ? `<div class="gmini">${m.map((r) => { const t = (r.thermos || []).map((e) => this._hass.states[e]).filter(Boolean)[0]?.attributes.current_temperature; return `<span class="gm" style="--c:${dot[(MODE[r.mode] || MODE.regelung_aus).c]}"><i></i>${esc(r.name)}${t != null ? `<small>${num(t, 1)} °C</small>` : ""}</span>`; }).join("")}</div>`
        : `<div class="rooms ${this._view() === "compact" ? "list" : ""}" data-sort-container="room">${m.map((r) => this._rv(r)).join("")}</div>`;
      return `<section class="grp ${closed ? "col" : ""}" data-gid="${esc(g.id)}"><div class="gh">
        <span class="gico">${ic(g.icon || "layers", 20)}</span><div class="gn"><b>${esc(g.name)}</b><span>${stat}</span></div>${mv}
        ${m.some((r) => r.sw) ? `<div class="gsw"><span>Fensterregelung</span><button class="sw ${allOn ? "on" : ""}" data-act="gsw" data-g="${esc(g.id)}" aria-label="Fensterregelung der Gruppe ${esc(g.name)} umschalten" aria-pressed="${allOn}"></button></div>` : ""}
        <button class="gtog" data-act="gtog" data-g="${esc(g.id)}" aria-label="Gruppe ein- oder ausklappen" aria-expanded="${!closed}">${ic("chev", 18)}</button></div>${body}</section>`;
    }).join("");
    return this._viewBar() + this._head() + html + addBtn;
  }
  _gActions(a, b) {
    const L = this._cfg.layout; L.groups = L.groups || [];
    if (a === "gtog") { const c = this._collapsed(), id = b.dataset.g; c.has(id) ? c.delete(id) : c.add(id); this._setCollapsed(c); this._render(); }
    else if (a === "gsw") {
      const rooms = this._collect(), g = L.groups.find((x) => x.id === b.dataset.g);
      const ids = g ? g.rooms : rooms.filter((r) => !L.groups.some((x) => x.rooms.includes(r.id))).map((r) => r.id);
      const mem = rooms.filter((r) => ids.includes(r.id) && r.sw), all = mem.every((r) => r.on);
      if (mem.length) this._hass.callService("switch", all ? "turn_off" : "turn_on", { entity_id: mem.map((r) => r.sw) });
    }
    else if (a === "gmv") {
      const i = L.groups.findIndex((x) => x.id === b.dataset.g), j = i + +b.dataset.dir;
      if (i >= 0 && L.groups[j]) { [L.groups[i], L.groups[j]] = [L.groups[j], L.groups[i]]; this._saveLayout(); this._render(); }
    }
    else if (a === "gedit" || a === "gadd") {
      const g = a === "gedit" ? L.groups.find((x) => x.id === b.dataset.g) : null;
      this._modal = { type: "grp", draft: g ? { ...g, rooms: [...g.rooms] } : { id: "g" + Date.now().toString(36).slice(-8), name: "", icon: GROUP_ICONS[0], rooms: [], isNew: true } };
      this._renderModal();
    }
    else if (a === "gpick") { const d = this._modal.draft, id = b.dataset.r; d.rooms = d.rooms.includes(id) ? d.rooms.filter((x) => x !== id) : [...d.rooms, id]; this._renderModal(); }
    else if (a === "gicon") { this._modal.draft.icon = b.dataset.k; this._renderModal(); }
    else if (a === "gsave") {
      const d = this._modal.draft; d.name = (d.name || "").trim();
      if (!d.name) { this._toast("Bitte einen Namen eingeben"); return; }
      L.groups.forEach((x) => (x.rooms = x.rooms.filter((r) => !d.rooms.includes(r))));
      const i = L.groups.findIndex((x) => x.id === d.id), { isNew, ...clean } = d;
      if (i >= 0) L.groups[i] = clean; else L.groups.push(clean);
      this._saveLayout(); this._modal = null; this._renderModal(); this._render();
    }
    else if (a === "gdel") { L.groups = L.groups.filter((x) => x.id !== this._modal.draft.id); this._saveLayout(); this._modal = null; this._renderModal(); this._render(); }
  }

  /* ---------------- Bericht ---------------- */
  _repDays(n = 14) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push({ iso: this._isoDay(-i), d, today: i === 0 }); }
    return out;
  }
  _hrOpen(id) { this._modal = { type: "hrep", id, day: this._isoDay(0), loading: true }; this._hrLoad(this._modal); this._renderModal(); }
  async _hrLoad(m) {
    const r = this._collect(true).find((x) => x.id === m.id); if (!r || !r.htr) return;
    const [y, mo, d] = m.day.split("-").map(Number), start = new Date(y, mo - 1, d), end = new Date(Math.min(+new Date(y, mo - 1, d + 1), Date.now()));
    const h = r.htr, p = this._pv(), ids = [h.leistung_sensor || h.entity, p.sensor, (r.thermos || [])[0]].filter(Boolean);
    m.loading = true; m.data = null; m.error = null; const tok = (this._hrTok = (this._hrTok || 0) + 1); m.tok = tok;
    try {
      const res = await this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false });
      if (m.tok !== tok) return;
      m.data = this._hrBuild(r, res || {}, start, end);
    } catch (e) { if (m.tok !== tok) return; m.error = "Der Verlauf konnte nicht aus Home Assistant geladen werden."; }
    m.loading = false; if (this._modal === m) this._renderModal();
  }
  _hrBuild(r, res, start, end) {
    const h = r.htr, p = this._pv(), t0 = +start / 1000, last = Math.min(1435, Math.floor((+end - +start) / 60000));
    const ser = (eid) => { let a = {}; return ((res && res[eid]) || []).map((x) => { if (x.a) a = x.a; return { t: ((x.lu ?? x.lc ?? t0) - t0) / 60, s: x.s, a }; }); };
    const at = (list, m) => { let v = null; for (const x of list) { if (x.t <= m) v = x; else break; } return v; };
    const hs = ser(h.leistung_sensor || h.entity), ps = ser(p.sensor), ts = ser((r.thermos || [])[0]), pts = [];
    for (let m = 0; m <= last; m += 5) {
      const hv = at(hs, m); let heat = 0;
      if (hv) { if (h.leistung_sensor) { heat = parseFloat(hv.s); if (!isFinite(heat)) heat = 0; } else if (["on", "heat", "auto", "heat_cool"].includes(hv.s)) { const stp = stepsOf(h), pi = (h.presets || []).indexOf(hv.a && hv.a.preset_mode); heat = pi >= 0 && stp[pi] ? stp[pi] : stp[0] || Number(h.watt) || 0; } else heat = 0; }
      const pv = at(ps, m); let ex = pv ? parseFloat(pv.s) : 0; if (!isFinite(ex)) ex = 0; if (p.sign === "import") ex = -ex;
      const tv = at(ts, m), temp = tv && tv.a && tv.a.current_temperature != null ? Number(tv.a.current_temperature) : null;
      pts.push({ t: m, heat, pv: Math.max(0, ex) + heat, temp });
    }
    let kwh = 0, pvk = 0, mins = 0; const ev = []; let prev = 0;
    for (const q of pts) {
      kwh += (q.heat * 5) / 60000; pvk += (Math.min(q.heat, q.pv) * 5) / 60000; if (q.heat > 0) mins += 5;
      if (q.heat > 0 && prev === 0) ev.push({ t: q.t, c: "#34d399", x: "Heizer an", y: `Überschuss ${wfmt(q.pv)}${stepsOf(h).length > 1 ? " · Stufe " + (stepsOf(h).indexOf(q.heat) + 1) : ""}${h.thermo_aus ? " · Thermostat aus" : ""}` });
      if (q.heat === 0 && prev > 0) ev.push({ t: q.t, c: "#94a3b8", x: "Heizer aus", y: q.temp != null && q.temp >= (Number(h.ziel) || 99) - 0.3 ? `Zieltemperatur ${num(h.ziel, 1)} °C erreicht` : "Überschuss zu gering" }); if (h.thermo_aus && q.heat === 0 && prev > 0) ev[ev.length - 1].y += " · Thermostat regelt wieder";
      if (q.heat > 0 && prev > 0 && q.heat !== prev) ev.push({ t: q.t, c: q.heat > prev ? "#fbbf24" : "#fb923c", x: q.heat > prev ? "Stufe erhöht" : "Stufe verringert", y: `${wfmt(prev)} → ${wfmt(q.heat)} bei ${wfmt(q.pv)} Überschuss` });
      prev = q.heat;
    }
    return { steps: stepsOf(h), pts, kwh, pvk, mins, ev, hasT: pts.some((q) => q.temp != null) };
  }
  _hrChart(d) {
    const cw = this.clientWidth || 390, avail = cw >= 720 ? Math.min(780, cw * 0.94) : cw, W = Math.max(300, Math.min(748, Math.floor(avail - 32))), H = W < 500 ? 240 : 280, L = 42, R = d.hasT ? 34 : 10, T = 12, B = 26, iw = W - L - R, ih = H - T - B;
    const wmax = Math.max(1000, Math.ceil(Math.max(...d.pts.map((q) => Math.max(q.pv, q.heat))) / 1000) * 1000);
    const tv = d.pts.map((q) => q.temp).filter((v) => v != null), tlo = tv.length ? Math.floor(Math.min(...tv) - 1) : 0, thi = tv.length ? Math.ceil(Math.max(...tv) + 1) : 1;
    const x = (m) => L + (iw * m) / 1440, y = (w) => T + ih * (1 - w / wmax), yt = (t) => T + ih * (1 - (t - tlo) / (thi - tlo));
    this._hrGeo = { W, x, L, iw };
    let s = `<svg class="hchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="PV-Überschuss und Heizerleistung">`;
    for (let i = 0; i <= 4; i++) { const w = (wmax * i) / 4; s += `<line x1="${L}" x2="${W - R}" y1="${y(w)}" y2="${y(w)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y(w) + 4}" text-anchor="end" font-size="10.5" fill="var(--mut)">${w >= 1000 ? num(w / 1000, 1) + " kW" : w + " W"}</text>`; }
    for (const hh of [0, 6, 12, 18, 24]) s += `<line x1="${x(hh * 60)}" x2="${x(hh * 60)}" y1="${T}" y2="${T + ih}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${x(hh * 60)}" y="${H - 8}" text-anchor="${hh === 0 ? "start" : hh === 24 ? "end" : "middle"}" font-size="10.5" fill="var(--mut)">${String(hh).padStart(2, "0")}:00</text>`;
    const a = d.pts[0], z = d.pts[d.pts.length - 1], dx = x(5) - x(0);
    for (const w of d.steps || []) if (w <= wmax) s += `<line x1="${L}" x2="${W - R}" y1="${y(w)}" y2="${y(w)}" stroke="var(--teal)" stroke-width="1" stroke-dasharray="2 3" opacity=".55"/>`;
    s += `<path d="${d.pts.map((q, i) => `${i ? "L" : "M"}${x(q.t).toFixed(1)} ${y(q.pv).toFixed(1)}`).join(" ")} L${x(z.t)} ${T + ih} L${x(a.t)} ${T + ih} Z" fill="#fbbf24" opacity=".2"/><path d="${d.pts.map((q, i) => `${i ? "L" : "M"}${x(q.t).toFixed(1)} ${y(q.pv).toFixed(1)}`).join(" ")}" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linejoin="round"/>`;
    for (const q of d.pts) if (q.heat > 0) s += `<rect x="${x(q.t).toFixed(1)}" y="${y(q.heat).toFixed(1)}" width="${(dx + 0.6).toFixed(1)}" height="${(T + ih - y(q.heat)).toFixed(1)}" fill="var(--teal)" opacity=".62"/>`;
    if (tv.length) {
      s += `<path d="${d.pts.filter((q) => q.temp != null).map((q, i) => `${i ? "L" : "M"}${x(q.t).toFixed(1)} ${yt(q.temp).toFixed(1)}`).join(" ")}" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      for (let t = Math.ceil(tlo / 2) * 2; t <= thi; t += 2) s += `<text x="${W - R + 5}" y="${yt(t) + 4}" font-size="10.5" fill="#7dd3fc">${t}°</text>`;
    }
    s += `<line id="hxl" x1="0" x2="0" y1="${T}" y2="${T + ih}" stroke="var(--mut)" opacity=".7"/></svg>`;
    return s;
  }
  _hrHover(min) {
    const d = this._hrData; if (!d || !d.pts.length || !this._hrGeo) return;
    const sr = this.shadowRoot, p = d.pts.reduce((a, q) => (Math.abs(q.t - min) < Math.abs(a.t - min) ? q : a), d.pts[0]), xl = sr.getElementById("hxl"), out = sr.getElementById("hxr");
    if (xl) { xl.setAttribute("x1", this._hrGeo.x(p.t)); xl.setAttribute("x2", this._hrGeo.x(p.t)); }
    if (out) out.innerHTML = `<b>${String(Math.floor(p.t / 60)).padStart(2, "0")}:${String(p.t % 60).padStart(2, "0")} Uhr</b><span><i style="background:#fbbf24"></i>Überschuss ${wfmt(p.pv)}</span><span><i style="background:var(--teal)"></i>Heizer ${p.heat > 0 ? wfmt(p.heat) : "aus"}</span>${p.temp != null ? `<span><i style="background:#7dd3fc"></i>${num(p.temp, 1)} °C</span>` : ""}`;
  }
  _hrBody(r, m) {
    const h = r.htr; if (!h) return `<div class="mut">Für diesen Raum ist kein Elektroheizer eingerichtet.</div>`;
    const p = this._pv(), vk = h.verlauf || {}, today = this._isoDay(0), days = Array.from({ length: 7 }, (_, i) => this._isoDay(i - 6));
    const kw = (iso) => (iso === today ? Number(h.heute_kwh) || 0 : vk[iso] ? Number(vk[iso][0]) || 0 : 0), mx = Math.max(0.1, ...days.map(kw));
    const chips = days.map((iso) => `<button class="hrd ${iso === m.day ? "sel" : ""}" data-act="hrday" data-d="${iso}" aria-label="${iso}"><span>${new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2)}</span><i><b style="height:${Math.max(5, (kw(iso) / mx) * 100)}%"></b></i><em>${num(kw(iso), 1)}</em></button>`).join("");
    let body = "";
    if (m.loading) body = `<div class="mut" style="padding:34px 0;text-align:center">Lädt …</div>`;
    else if (m.error) body = `<div class="mut" style="padding:24px 0">${esc(m.error)}</div>`;
    else if (m.data) {
      const d = m.data; this._hrData = d;
      const share = d.kwh > 0 ? Math.round((d.pvk / d.kwh) * 100) : 0, gain = (d.pvk * Math.max(0, this._price() - this._feed())) / 100;
      body = `<div class="hrt"><div style="--a:var(--teal)"><span>${ic("clock", 15)}Laufzeit</span><b>${hmin(d.mins)}</b></div><div style="--a:#fbbf24"><span>${ic("bolt", 15)}Energie</span><b>${num(d.kwh, 1)} <small>kWh</small></b></div><div style="--a:#34d399"><span>${ic("sun", 15)}aus PV</span><b>${share} <small>%</small></b></div><div style="--a:#a78bfa"><span>${ic("flame", 15)}Vorteil</span><b>${num(gain, 2)} <small>€</small></b></div></div>
        <div class="hlg"><span><i style="background:#fbbf24"></i>PV-Überschuss</span><span><i style="background:var(--teal)"></i>Heizer (gestrichelt: Stufen)</span>${d.hasT ? `<span><i style="background:#7dd3fc"></i>Raumtemperatur</span>` : ""}</div>
        <div class="hcw">${this._hrChart(d)}</div><div class="hxr" id="hxr"></div>
        <div class="lsec" style="margin-top:14px">Ereignisse</div>${d.ev.length ? d.ev.map((e) => `<div class="hre"><em>${String(Math.floor(e.t / 60)).padStart(2, "0")}:${String(e.t % 60).padStart(2, "0")}</em><i style="background:${e.c}"></i><div><b>${e.x}</b><span>${e.y}</span></div></div>`).join("") : `<div class="mut sm">An diesem Tag hat der Heizer nicht geheizt.</div>`}
        <div class="mut sm" style="margin-top:10px">Vorteil = PV-Strom statt Netzbezug (${num(this._price(), 2)} ct/kWh${p.price_mode === "entity" && p.price_sensor ? ", aktuell" : ""}) abzüglich entgangener Einspeisevergütung (${num(this._feed(), 2)} ct/kWh${p.feed_mode === "entity" && p.feed_sensor ? ", aktuell" : ""}).</div>`;
    }
    return `<div class="hrds">${chips}</div>${body}`;
  }
  _hrAllBody() {
    const rs = this._htrRooms(), p = this._pv(), today = this._isoDay(0), days = Array.from({ length: 7 }, (_, i) => this._isoDay(i - 6));
    const kw = (r, iso) => (iso === today ? Number(r.htr.heute_kwh) || 0 : r.htr.verlauf && r.htr.verlauf[iso] ? Number(r.htr.verlauf[iso][0]) || 0 : 0);
    const pvd = (r, iso) => (iso === today ? Number(r.htr.heute_pv_kwh) || 0 : r.htr.verlauf && r.htr.verlauf[iso] ? Number(r.htr.verlauf[iso][1]) || 0 : 0);
    const tot = days.map((iso) => rs.reduce((a, r) => a + kw(r, iso), 0)), mx = Math.max(0.1, ...tot);
    const sum = tot.reduce((a, b) => a + b, 0), pvs = days.reduce((a, iso) => a + rs.reduce((b, r) => b + pvd(r, iso), 0), 0), gain = (pvs * Math.max(0, this._price() - this._feed())) / 100;
    const cols = days.map((iso, i) => `<div class="hac"><em>${num(tot[i], 1)}</em><div class="hab">${rs.map((r) => `<b style="height:${(kw(r, iso) / mx) * 100}%;background:${r.color}" title="${esc(r.name)} ${num(kw(r, iso), 1)} kWh"></b>`).join("")}</div><span>${new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short" }).slice(0, 2)}</span></div>`).join("");
    return `<div class="hrt"><div style="--a:#fbbf24"><span>${ic("bolt", 15)}Energie, 7 Tage</span><b>${num(sum, 1)} <small>kWh</small></b></div><div style="--a:#34d399"><span>${ic("sun", 15)}aus PV</span><b>${sum > 0 ? Math.round((pvs / sum) * 100) : 0} <small>%</small></b></div><div style="--a:#a78bfa"><span>${ic("flame", 15)}Vorteil</span><b>${num(gain, 2)} <small>€</small></b></div><div style="--a:var(--teal)"><span>${ic("clock", 15)}Heizer</span><b>${rs.length}</b></div></div>
      <div class="hac-w">${cols}</div><div class="hlg">${rs.map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div>
      <div class="lsec" style="margin-top:12px">Pro Raum</div>${rs.map((r) => { const k = days.reduce((a, iso) => a + kw(r, iso), 0), pk = days.reduce((a, iso) => a + pvd(r, iso), 0); return `<div class="hre"><i style="background:${r.color}"></i><div style="flex:1"><b>${esc(r.name)}</b><span>${wfmt(r.htr.watt)} · Ziel ${num(r.htr.ziel, 1)} °C</span></div><div style="text-align:right"><b>${num(k, 1)} kWh</b><span>${k > 0 ? Math.round((pk / k) * 100) : 0} % PV</span></div></div>`; }).join("")}`;
  }
  _repOpen(id) { this._modal = { type: "rep", id, day: this._isoDay(0), keepScroll: 99999 }; this._repLoad(this._modal); this._renderModal(); }
  async _repLoad(m) {
    const r = this._collect().find((x) => x.id === m.id); if (!r) return;
    const day = m.day, [y, mo, d] = day.split("-").map(Number), start = new Date(y, mo - 1, d), nextDay = new Date(y, mo - 1, d + 1), end = new Date(Math.min(+nextDay, Date.now()));
    this._repCache = this._repCache || new Map();
    const key = m.id + "|" + day, hit = this._repCache.get(key);
    if (hit && (day !== this._isoDay(0) ? true : Date.now() - hit.at < 60000)) { m.data = hit.data; m.error = null; m.loading = false; return; }
    const tok = (this._repTok = (this._repTok || 0) + 1);
    m.loading = true; m.data = null; m.error = null; m.tok = tok;
    const ids = [...(r.thermos || []), ...(r.windows || []), ...(r.modeEid ? [r.modeEid] : [])];
    try {
      const res = await this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false });
      if (m.tok !== tok) return;
      m.data = this._repBuild(r, res || {}, start, end);
      this._repCache.set(key, { at: Date.now(), data: m.data });
    } catch (e) {
      if (m.tok !== tok) return;
      m.error = "Der Verlauf konnte nicht aus Home Assistant geladen werden.";
    }
    m.loading = false;
    if (this._modal === m) this._renderModal();
  }
  _repBuild(r, res, start, end) {
    const t0 = +start / 1000, endMin = Math.max(5, Math.floor((+end - +start) / 60000));
    const ser = (eid) => { let a = {}; return (res[eid] || []).map((x) => { if (x.a) a = x.a; return { t: Math.max(0, ((x.lu ?? x.lc ?? t0) - t0) / 60), s: x.s, a }; }); };
    const at = (list, t) => { let v = null; for (const x of list) { if (x.t <= t) v = x; else break; } return v; };
    const th = (r.thermos || []).map(ser), wins = (r.windows || []).map((e) => ({ e, list: ser(e), name: this._hass.states[e]?.attributes.friendly_name || "Fenster" })), mode = r.modeEid ? ser(r.modeEid) : [];
    const num2 = (v) => (typeof v === "number" ? v : Number(v)), ok = (v) => v != null && v !== "" && Number.isFinite(num2(v));
    const pts = []; let lastTemp = null;
    for (let m = 0; m <= endMin; m += 5) {
      const ts = th.map((l) => at(l, m)).filter(Boolean), cs = ts.map((x) => x.a.current_temperature).filter(ok).map(num2);
      if (cs.length) lastTemp = cs.reduce((a, b) => a + b, 0) / cs.length;
      const md = at(mode, m), paused = !!md && md.s === "heizung_pausiert";
      const tg = ts.filter((x) => x.s !== "off" && x.s !== "unavailable").map((x) => x.a.temperature).filter(ok).map(num2);
      const w = wins.find((x) => at(x.list, m)?.s === "on");
      if (lastTemp != null) pts.push({ t: m, temp: Math.round(lastTemp * 10) / 10, tgt: !paused && tg.length ? tg.reduce((a, b) => a + b, 0) / tg.length : null, paused, open: w ? w.name : null });
    }
    const intervals = (list, on) => { const out = []; let cur = null; for (const x of list) { if (on(x)) { if (!cur) cur = [x.t, endMin]; } else if (cur) { cur[1] = x.t; out.push(cur); cur = null; } } if (cur) out.push(cur); return out; };
    const pauses = intervals(mode, (x) => x.s === "heizung_pausiert").filter(([a, b]) => b > a);
    const opens = []; wins.forEach((w) => intervals(w.list, (x) => x.s === "on").forEach(([a, b]) => b > a && opens.push({ s: a, e: b, name: w.name })));
    opens.sort((a, b) => a.s - b.s);
    const hh = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m) % 60).padStart(2, "0")}`, ev = [];
    for (const o of opens) {
      ev.push({ t: o.s, c: "#60a5fa", x: `${o.name} geöffnet`, y: "Offenes Fenster erkannt" });
      if (o.e < endMin || !(Date.now() - +end < 90000)) ev.push({ t: o.e, c: "#60a5fa", x: `${o.name} geschlossen`, y: `${Math.round(o.e - o.s)} Min. offen` });
    }
    for (const [a, b] of pauses) { ev.push({ t: a, c: "#f59e0b", x: "Heizung pausiert", y: "wegen offenem Fenster" }); if (b < endMin) ev.push({ t: b, c: "#34d399", x: "Heizung wieder aktiv", y: "Fenster geschlossen" }); }
    let prev = null;
    for (const p of pts) { if (p.tgt != null) { if (prev != null && Math.abs(p.tgt - prev) >= 0.25) ev.push({ t: p.t, c: "var(--teal)", x: `Solltemperatur ${num(p.tgt, 1)} °C`, y: "Heizplan oder Änderung am Thermostat" }); prev = p.tgt; } }
    ev.sort((a, b) => a.t - b.t).forEach((e) => (e.h = hh(e.t)));
    const temps = pts.map((p) => p.temp), pm = pauses.reduce((a, [x, y]) => a + (y - x), 0), openMin = opens.reduce((a, o) => a + (o.e - o.s), 0);
    return { pts, pauses, opens, ev, end: endMin, pm, openMin, kwh: pm / 60 * (r.kw || 0), apk: r.apk || 0.1, fuel: r.fuel || "erdgas",
      avg: temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0, min: temps.length ? Math.min(...temps) : 0, max: temps.length ? Math.max(...temps) : 0 };
  }
  _repHover(min) {
    const d = this._repData; if (!d || !d.pts.length) return;
    const sr = this.shadowRoot, g = this._repGeo, p = d.pts.reduce((a, q) => (Math.abs(q.t - min) < Math.abs(a.t - min) ? q : a), d.pts[0]);
    const x = g.x(p.t), y = g.y(p.temp), xl = sr.getElementById("rxl"), c = sr.getElementById("rxc"), tip = sr.getElementById("rtip");
    if (xl) { xl.setAttribute("x1", x); xl.setAttribute("x2", x); }
    if (c) { c.setAttribute("cx", x); c.setAttribute("cy", y); }
    if (!tip) return;
    const hh = `${String(Math.floor(p.t / 60)).padStart(2, "0")}:${String(p.t % 60).padStart(2, "0")}`;
    tip.style.left = Math.min(Math.max(x / g.W * 100, 17), 83) + "%";
    tip.innerHTML = `${hh} Uhr<b>${num(p.temp, 1)} °C</b><div class="st" style="--c:${p.paused ? "#f59e0b" : "#34d399"}"><i></i>${p.paused ? "Heizung pausiert" : p.tgt != null ? "Ziel " + num(p.tgt, 1) + " °C" : "Thermostat aus"}</div>${p.open ? `<div class="wo">${esc(p.open)} offen</div>` : ""}`;
  }
  _repChart(d) {
    const cw = this.clientWidth || 390, avail = cw >= 720 ? Math.min(780, cw * 0.94) : cw, W = Math.max(300, Math.min(748, Math.floor(avail - 32))), H = W < 500 ? 250 : 300, L = 34, R = 10, T = 12, B = 26;
    const iw = W - L - R, ih = H - T - B, vals = d.pts.flatMap((p) => (p.tgt != null ? [p.temp, p.tgt] : [p.temp]));
    let lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1); if (hi - lo < 6) { lo -= 2; hi += 2; }
    const x = (m) => L + iw * m / 1440, y = (v) => T + ih * (1 - (v - lo) / (hi - lo));
    this._repGeo = { W, x, y, L, iw };
    let s = `<svg class="rchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Temperaturverlauf"><defs><linearGradient id="rag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--teal)" stop-opacity=".34"/><stop offset="1" stop-color="var(--teal)" stop-opacity="0"/></linearGradient></defs>`;
    for (let v = Math.ceil(lo / 2) * 2; v <= hi; v += 2) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${v}°</text>`;
    for (const h of [0, 6, 12, 18, 24]) s += `<line x1="${x(h * 60)}" x2="${x(h * 60)}" y1="${T}" y2="${T + ih}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${x(h * 60)}" y="${H - 8}" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}" font-size="11" fill="var(--mut)">${String(h).padStart(2, "0")}:00</text>`;
    for (const [a, b] of d.pauses) s += `<rect x="${x(a)}" y="${T}" width="${Math.max(2, x(b) - x(a))}" height="${ih}" fill="#f59e0b" opacity=".16"/>`;
    let tp = "", open = false, py = null;
    for (const p of d.pts) {
      if (p.tgt == null) { open = false; py = null; continue; }
      if (!open) { tp += `M${x(p.t).toFixed(1)} ${y(p.tgt).toFixed(1)} `; open = true; }
      else { if (py !== p.tgt) tp += `L${x(p.t).toFixed(1)} ${y(py).toFixed(1)} `; tp += `L${x(p.t).toFixed(1)} ${y(p.tgt).toFixed(1)} `; }
      py = p.tgt;
    }
    if (tp) s += `<path d="${tp}" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-dasharray="5 4" opacity=".9"/>`;
    const line = d.pts.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.temp).toFixed(1)}`).join(" "), last = d.pts[d.pts.length - 1];
    s += `<path d="${line} L${x(last.t)} ${T + ih} L${x(d.pts[0].t)} ${T + ih} Z" fill="url(#rag)"/><path d="${line}" fill="none" stroke="var(--teal)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (const o of d.opens) { const p = d.pts.find((q) => q.t >= o.s) || last; s += `<circle cx="${x(o.s)}" cy="${y(p.temp)}" r="5" fill="var(--card)" stroke="#60a5fa" stroke-width="2.4"/>`; }
    s += `<line id="rxl" x1="0" x2="0" y1="${T}" y2="${T + ih}" stroke="var(--mut)" opacity=".7"/><circle id="rxc" r="5.5" cx="0" cy="0" fill="var(--card)" stroke="var(--teal)" stroke-width="2.4"/></svg>`;
    return s;
  }
  _repBody(r, m) {
    const days = this._repDays(), idx = days.findIndex((x) => x.iso === m.day), d = m.data;
    const head = `<div class="rdays">${days.map((x) => `<button class="rd ${x.iso === m.day ? "sel" : ""} ${x.today ? "today" : ""}" data-act="repday" data-d="${x.iso}" aria-label="${x.d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}"><small>${"SMDMDFS"[x.d.getDay()]}</small><b>${x.d.getDate()}</b></button>`).join("")}</div>`;
    const nav = `<div class="rnav"><button class="lnk" data-act="repnav" data-s="-1" ${idx <= 0 ? "disabled style=\"opacity:.4\"" : ""}>‹ Vorheriger Tag</button><button class="lnk" data-act="repnav" data-s="1" ${idx >= days.length - 1 ? "disabled style=\"opacity:.4\"" : ""}>Nächster Tag ›</button></div>`;
    this._repData = null;
    if (m.loading) return head + `<div class="rmsg">Verlauf wird geladen …</div>` + nav;
    if (m.error) return head + `<div class="rmsg">${esc(m.error)}</div>` + nav;
    if (!d || !d.pts.length) return head + `<div class="rmsg">Für diesen Tag liegen keine Verlaufsdaten vor.<br><span class="sm">Der Bericht nutzt den Verlauf (Recorder) von Home Assistant. Er reicht so weit zurück, wie dort Daten aufbewahrt werden.</span></div>` + nav;
    this._repData = d;
    const F = FUELS[d.fuel] || FUELS.erdgas, bar = []; let prev = null;
    for (const p of d.pts) { const k = p.paused ? "p" : "a"; if (prev && prev.k === k) prev.n += 5; else bar.push((prev = { k, n: 5 })); }
    return head + `<div class="rtiles">
        <div class="tile" style="--a:var(--teal)"><div class="t">${ic("thermo", 15)}Ø Temperatur</div><div class="v">${num(d.avg, 1)}<small>°C</small></div><div class="g">${num(d.min, 1)} – ${num(d.max, 1)} °C</div></div>
        <div class="tile" style="--a:#f59e0b"><div class="t">${ic("radiator", 15)}Pausiert</div><div class="v">${num(d.pm)}<small>Min.</small></div><div class="g">${ic("flame", 13)}~${num(d.kwh * d.apk, 2)} ${F.label.split(" ")[0]}</div></div>
        <div class="tile" style="--a:#60a5fa"><div class="t">${ic("windowOpen", 15)}Fenster offen</div><div class="v">${d.opens.length}<small>×</small></div><div class="g">${num(d.openMin)} Min. gesamt</div></div>
      </div>
      <div class="rleg"><span style="--c:var(--teal)"><i></i>Temperatur</span><span style="--c:#7dd3fc"><i class="d"></i>Ziel (Thermostat)</span><span style="--c:#f59e0b"><i class="b"></i>Heizung pausiert</span><span style="--c:#60a5fa"><i class="o"></i>Fenster geöffnet</span></div>
      <div class="rwrap" id="rwrap">${this._repChart(d)}<div class="rtip" id="rtip"></div></div>
      <div class="rbar" aria-hidden="true">${bar.map((b) => `<i style="width:${b.n / 1440 * 100}%;background:${b.k === "p" ? "#f59e0b" : "#34d399"}"></i>`).join("")}</div>
      <div class="rleg" style="margin:6px 0 0"><span style="--c:#34d399"><i class="b" style="background:#34d399"></i>Heizung aktiv</span><span style="--c:#f59e0b"><i class="b" style="background:#f59e0b"></i>pausiert wegen Fenster</span></div>
      <div class="mut sm" style="margin:14px 0 2px"><b style="color:var(--primary-text-color)">Ereignisse</b></div>
      <div class="rev">${d.ev.length ? d.ev.map((e) => `<div style="--c:${e.c}"><time>${e.h}</time><i></i><span>${esc(e.x)}<small>${esc(e.y)}</small></span></div>`).join("") : `<div style="--c:var(--line)"><time></time><i></i><span>Keine Ereignisse an diesem Tag</span></div>`}</div>` + nav;
  }

  _isoDay(add = 0) { const d = new Date(); d.setDate(d.getDate() + add); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  _savePresence() {
    this._hass.callWS({ type: "fenster_heizung/set_presence", presence: this._cfg.presence })
      .then((r) => { this._cfg.presence = r; this._render(); })
      .catch(() => this._toast("Anwesenheit konnte nicht gespeichert werden"));
  }
  _presenceCard() {
    const p = this._pres(), h = this._hass, adm = this._admin();
    const persons = this._ortPersons().filter((x) => !p.persons.length || p.persons.includes(x.id)), zn = this._ort().own ? this._ort().zone : null;
    const days = p.to ? Math.max(0, Math.ceil((new Date(p.to + "T23:59:59") - new Date()) / 864e5)) : 0;
    const stat = p.mode === "vacation" && p.effective === "home"
      ? `<b>Urlaub geplant:</b> ${this._fmtD(p.from)} bis ${this._fmtD(p.to)} · Absenkung ${num(p.temp, 1)} °C`
      : p.mode === "vacation"
        ? `<b>Urlaub bis ${this._fmtD(p.to)}</b> (noch ${days} Tage) · Absenkung ${num(p.temp, 1)} °C${p.preheat ? ` · Vorheizen am Rückkehrtag ab ${p.preheat_time} Uhr` : ""}`
        : p.mode === "away" ? `<b>Abwesend:</b> Räume auf ${num(p.temp, 1)} °C abgesenkt. ${p.origin === "auto" ? "Bei Rückkehr einer Person" : "Nach dem Umschalten auf „Zu Hause“"} gilt wieder der Heizplan.`
        : `<b>Zu Hause:</b> Alle Heizpläne laufen normal.${p.auto ? " Automatisch abwesend, wenn alle Personen " + p.away_after + " Min. unterwegs sind." : ""}`;
    return `<div class="card pres"><h2>${ic("home", 18)}Anwesenheit &amp; Urlaub</h2>
      <div class="seg3">${[["home", "home", "Zu Hause"], ["away", "door", "Abwesend"], ["vacation", "suitcase", "Urlaub"]].map(([k, i, l]) => `<button class="${p.mode === k ? "sel" : ""}" data-act="pm" data-k="${k}" ${adm ? "" : "disabled"}>${ic(i, 22)}${l}</button>`).join("")}</div>
      <div class="pstat">${stat}</div>
      ${persons.length ? `<div class="pers">${persons.map((s) => `<span class="per ${s.home ? "home" : ""}"><i></i>${esc(s.name)} · ${s.unavailable && !s.tr.length ? "keine Ortung" : s.home ? "zu Hause" : s.dist != null ? "unterwegs, " + this._ortFmtD(s.dist) : "unterwegs"}</span>`).join("")}</div>${zn ? `<div class="mut sm" style="margin-top:6px">Home-Zone ${zn.r} m · ${persons.filter((x) => x.home).length} von ${persons.length} zu Hause</div>` : ""}` : ""}
      ${adm ? `<div class="plnk"><button class="lnk" data-act="vac">${ic("suitcase", 16)}Urlaub planen</button><button class="lnk" data-act="pset">${ic("sliders", 16)}Einstellungen</button><button class="lnk" data-act="ortopen">${ic("pin", 16)}Personen &amp; Standort</button></div>` : ""}</div>`;
  }

  _planBox(r) {
    const p0 = this._cfg.plans[r.id] || { enabled: false, entries: [] }, p = { ...p0, enabled: r.planOn ?? p0.enabled }, pts = points(p.entries), adm = this._admin();
    const btn = adm ? `<button class="ibtn" data-act="plan" data-id="${esc(r.id)}" aria-label="Heizplan bearbeiten">${ic("pencil", 17)}</button>` : "";
    if (!pts.length) return `<div class="plan"><div class="ph"><span class="pt">${ic("plan", 18)}Heizplan</span><span class="pill gray">nicht eingerichtet</span></div>${adm ? `<button class="lnk" data-act="plan" data-id="${esc(r.id)}">${ic("plus", 16)}Heizplan einrichten</button>` : ""}</div>`;
    const now = nowMin(), today = Math.floor(now / 1440), cur = at(pts, now), nx = nextPt(pts, now), nw = nx.w % 10080, nd = Math.floor(nw / 1440);
    const when = nd === today && nx.w > now ? "heute" : nd === (today + 1) % 7 ? "morgen" : DAYS[nd];
    return `<div class="plan ${p.enabled && !this._away() && !this._sum().active ? "" : "off"}"><div class="ph"><span class="pt">${ic("plan", 18)}Heizplan</span><span class="pill ${p.enabled ? "green" : "gray"}">${p.enabled ? "aktiv" : "aus"}</span>${btn}</div>
      <div class="pnow">Jetzt <b>${num(cur, 1)} °C</b> · ab ${when} ${fmtT(nw % 1440)} Uhr <b>${num(nx.t, 1)} °C</b></div>${bar(pts, today, now)}</div>`;
  }

  _ph(r) { const u = (this._cfg.layout.photos || {})[r.id]; return u ? { c: " hph", s: ` style="--ph:url('${esc(u)}')"` } : { c: "", s: "" }; }
  _out() {
    const c = this._wxCfg(), st = this._hass.states, wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, o = c.outdoor ? st[c.outdoor] : null;
    const ov = o && isFinite(parseFloat(o.state)) ? parseFloat(o.state) : null, wv = w && w.attributes.temperature != null ? Number(w.attributes.temperature) : null;
    return { t: ov ?? wv, rh: w && w.attributes.humidity != null ? Number(w.attributes.humidity) : null, w: w ? w.state : null };
  }
  _sum() {
    const g = (this._gen || {}).summer || { mode: "auto", temp: 18, days: 3 }, o = this._out();
    const on = this._st && typeof this._st.summer === "boolean" ? this._st.summer : g.mode === "on" || (g.mode === "auto" && o.t != null && o.t >= Number(g.temp));
    return { ...g, active: on, out: o.t };
  }
  _wxAdj(r) {
    const g = (this._gen || {}).wxadj;
    if (!g || !g.on || (r && r.wxOff) || this._away() || this._sum().active) return null;
    if (this._st && this._st.delta !== undefined) { const d = Number(this._st.delta) || 0; return d ? { d, fr: d > 0, why: this._st.why || "" } : null; }
    const o = this._out(); if (o.t == null) return null;
    if (o.t <= g.frost) return { d: Number(g.up), fr: true, why: `Frost, ${num(o.t, 1)} °C draußen` };
    const sun = o.w === "sunny";
    if (o.t >= g.mild || (sun && o.t >= g.mild - 5)) return { d: -Number(g.down), fr: false, why: `${sun ? "Sonne" : "mild"}, ${num(o.t, 1)} °C draußen` };
    return null;
  }
  _wxaNote(r) {
    const a = this._wxAdj(r); if (!a || !a.d) return "";
    return `<div class="pnote wxa ${a.fr ? "fr" : ""}">${ic(a.fr ? "snow" : "sun", 16)}Wetter-Anpassung: Ziel ${a.d > 0 ? "+" : "−"}${num(Math.abs(a.d), 1)} °C (${a.why})</div>`;
  }
  _learnFor(id) {
    if (this._learn[id] !== undefined) return this._learn[id];
    this._learn[id] = null;
    this._hass.callWS({ type: "fenster_heizung/get_learning", entry_id: id }).then((d) => { this._learn[id] = d || false; if (this._modal && this._modal.type === "rep" && this._modal.id === id) this._renderModal(); }).catch(() => { this._learn[id] = false; });
    return null;
  }
  _learnBox(r) {
    const d = this._learnFor(r.id);
    if (d === null) return "";
    if (!d) return `<div class="learn"><div class="lt">${ic("clock", 16)}Aufheizzeit</div><div class="mut sm">Noch nicht genug Daten. Nach ein paar Aufheizphasen erscheint hier die gelernte Zeit.</div></div>`;
    const fmt = (h) => { const m = Math.round(h * 60); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} Min.` : `${m} Min.`; };
    const t = fmt(4 / d.rate), mx = Math.max(...d.bands.map((b) => b.min_per_k));
    return `<div class="learn"><div class="lt">${ic("clock", 16)}Aufheizzeit<em>gelernt aus ${d.days} Tagen · ${d.samples} Aufheizphasen</em></div>
      <div class="lbig"><b>${t}</b><span>von 17 auf 21 °C, etwa ${num(d.rate, 1)} K pro Stunde</span></div>
      ${d.bands.map((b) => `<div class="lrow"><span>${esc(b.label)}</span><div class="lbar"><i style="width:${Math.round((b.min_per_k / mx) * 100)}%"></i></div><b>${b.min_per_k} Min./K</b><small>${b.n}×</small></div>`).join("")}
      <div class="lhint">${ic("info", 14)}Tipp: Lege Heizplan-Einträge etwa ${t} früher, damit der Raum pünktlich warm ist. Bei Frost dauert es länger.</div></div>`;
  }
  _airData(r) {
    const h = this._hass, he = !r.airOff && r.humEid && h.states[r.humEid]; if (!he) return null;
    const rh = parseFloat(he.state), t0 = (r.thermos || []).map((e) => h.states[e]).filter(Boolean)[0], t = t0 && t0.attributes.current_temperature;
    if (!isFinite(rh) || t == null) return null;
    const o = this._out(), c = airCalc(Number(t), rh, o.t, o.rh);
    const open = (r.windows || []).map((e) => h.states[e]).filter((w) => w && ["on", "open"].includes(w.state));
    const since = open.length ? Math.min(...open.map((w) => new Date(w.last_changed || Date.now()).getTime())) : 0;
    return { rh, t: Number(t), ...c, o, open: open.length, since, need: ventMin(o.t) };
  }
  _airMsg(a) {
    if (a.open) { const c = cdown(a.since, a.need); return `<div class="airmsg ${c.left <= 0 ? "done" : "green"}" data-since="${a.since}" data-need="${a.need}">${ic("windy", 16)}<div><b>Lüften läuft</b> · <span data-cd>${c.txt}</span><div class="pr"><i data-bar style="width:${c.pct}%"></i></div></div></div>`; }
    const dry = a.dry ? "" : " Draußen ist die Luft gerade feuchter, Lüften bringt wenig. Besser etwas wärmer heizen oder entfeuchten.";
    if (a.lvl === 2) return `<div class="airmsg red">${ic("alert", 16)}<div><b>Schimmelgefahr an kalten Wänden</b> (ca. ${num(a.rs)} % Wandfeuchte). ${a.dry ? `Jetzt ca. ${a.need} Min. stoßlüften und Möbel von Außenwänden abrücken.` : dry.trim()}</div></div>`;
    if (a.lvl === 1 || a.rh >= 60) return `<div class="airmsg amber">${ic("drop", 16)}<div><b>Luft ist feucht</b>${a.dry ? `: bald ca. ${a.need} Min. stoßlüften.` : "."}${a.dry ? "" : dry}</div></div>`;
    return `<div class="airmsg green">${ic("check", 16)}<div><b>Raumluft in Ordnung</b>, kein Lüftungsbedarf.</div></div>`;
  }
  _airBox(r) {
    const a = this._airData(r); if (!a) return this._airLiteBox(r);
    const [ml, mc] = MOLD[a.lvl], hc = a.rh >= 70 ? "red" : a.rh >= 60 ? "amber" : "green";
    return `<div class="air"><div class="ac ${hc}"><div class="t">${ic("drop", 13)}Luftfeuchte</div><div class="v">${num(a.rh)} %</div><div class="gauge"><i style="width:${Math.min(100, a.rh)}%"></i></div></div>
      <div class="ac slate"><div class="t">${ic("thermo", 13)}Taupunkt</div><div class="v">${num(a.td, 1)} °C</div><div class="s">Wand ${num(a.ts, 1)} °C</div></div>
      <div class="ac ${mc}"><div class="t">${ic("alert", 13)}Schimmel</div><div class="v">${ml}</div><div class="s">${num(a.rs)} % Wand</div></div></div>${this._airMsg(a)}`;
  }
  _rate(k) {
    const p = this._pv();
    if (p[k + "_mode"] === "entity" && p[k + "_sensor"]) {
      const s = this._hass.states[p[k + "_sensor"]], v = s ? parseFloat(String(s.state).replace(",", ".")) : NaN;
      if (isFinite(v) && v >= 0) {
        const u = String((s.attributes || {}).unit_of_measurement || "").toLowerCase();
        return /ct|cent/.test(u) ? v : /€|eur/.test(u) || v < 5 ? v * 100 : v;
      }
    }
    return Number(p[k]) || 0;
  }
  _price() { return this._rate("price"); }
  _feed() { return this._rate("feed"); }
  _pv() { return { ...PVDEF, ...((this._gen || {}).pv || {}) }; }
  _htrRooms() { return this._collect(true).filter((r) => r.htr).sort((a, b) => (a.htr.prio || 9) - (b.htr.prio || 9)); }
  _htrTotal() { return this._htrRooms().reduce((a, r) => a + (Number(r.htr.watt_now) || 0), 0); }
  _pvNow() {
    const p = this._pv(), st = p.sensor && this._hass.states[p.sensor]; if (!st) return null;
    let v = parseFloat(st.state); if (!isFinite(v)) return null;
    if (st.attributes.unit_of_measurement === "kW") v *= 1000;
    if (p.sign === "import") v = -v;
    return Math.max(0, v) + this._htrTotal();   // Leistung der Heizer wird hinzugerechnet
  }
  _soc() { const p = this._pv(), st = p.soc_sensor && this._hass.states[p.soc_sensor], v = st && parseFloat(st.state); return isFinite(v) ? v : null; }
  _pvChip() { if (!this._htrRooms().length) return ""; const w = this._pvNow(); return w == null ? "" : `<span class="chip">${ic("bolt", 16)}PV-Überschuss ${wfmt(w)}</span>`; }
  _htrBox(r) {
    const h = r.htr; if (!h) return "";
    const [lab, c] = HTR[h.status] || HTR.aus, on = h.status === "pv", share = h.heute_kwh > 0 ? Math.round((h.heute_pv_kwh / h.heute_kwh) * 100) : null;
    return `<div class="htr ${c}"><div class="htrh"><span class="htri">${ic("bolt", 18)}</span><div class="htrt"><b>Elektroheizer</b><span>${on ? (stepsOf(h).length > 1 ? `Stufe ${h.stufe} von ${stepsOf(h).length} · ` : "Heizt mit PV-Überschuss · ") + wfmt(h.watt_now) : lab}</span></div>
      <button class="why" data-act="hrep" data-id="${esc(r.id)}" aria-label="Heizer-Bericht">${ic("chart", 13)}Bericht</button>${r.htrSw ? `<button class="sw ${r.htrOn ? "on" : ""}" data-act="sw" data-sw="${esc(r.htrSw)}" aria-pressed="${!!r.htrOn}" aria-label="Elektroheizer ein oder aus"></button>` : ""}</div>
      ${this._stepBar(h)}<div class="htrm"><span>${num(h.heute_kwh, 1)} kWh heute${share != null ? ` · ${share} % PV` : ""}</span><span>${hmin(h.heute_min)} Laufzeit</span><span>Ziel ${num(h.ziel, 1)} °C</span></div>${h.thermo_aus ? (on ? `<div class="htrn">${ic("check", 13)}Thermostat ist aus, solange der Heizer läuft</div>` : `<div class="htrn mut">${ic("clock", 13)}Thermostat regelt, bis der Heizer startet</div>`) : ""}</div>`;
  }
  _presetRows(d, st, row) {
    const e = st[d.htr_entity]; if (!d.htr_entity || !d.htr_entity.startsWith("climate.") || !e) return "";
    const pm = (e.attributes.preset_modes || []).filter((x) => x !== "none"), steps = parseSteps(d.htr_steps).length ? parseSteps(d.htr_steps) : [Number(d.htr_watt) || 0];
    const guess = pm.filter((x) => /^[A-Za-z]*\d+$/.test(x)), cur = (i) => (d.htr_presets && d.htr_presets[i]) || guess[i] || "";
    return `<div class="lsec" style="margin-top:6px">${ic("sliders", 15)}Stufen am Gerät</div>
      <div class="mut sm" style="margin:0 0 6px">Einschalten: Modus Heizen mit der gewählten Voreinstellung. Ausschalten: Modus Aus. Beim Stufenwechsel ändert sich nur die Voreinstellung.</div>
      ${steps.map((w, i) => row(`Stufe ${i + 1} · ${wfmt(w)}`, "", `<select class="osel" data-f="hpre" data-i="${i}"><option value="">– keine –</option>${pm.map((x) => `<option ${cur(i) === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>`)).join("")}
      ${row("Zieltemperatur am Gerät", "Das Gerät hat ein eigenes Thermostat (aktuell " + num(e.attributes.temperature, 0) + " °C). Es würde sonst vorzeitig abschalten.", this._seg2(d, "htr_devtemp", [["max", "Auf " + num(e.attributes.max_temp || 35) + " °C"], ["keep", "Unverändert"]]))}`;
  }
  _seg2(d, k, opts) { return `<div class="seg oseg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="oset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`; }
  _stepScale(h) {
    const st = stepsOf(h), p = this._pv(); let av = this._pvNow(); if (av != null) av = Math.max(0, av - this._htrRooms().filter((x) => x.htr !== h && (x.htr.prio || 9) < (h.prio || 9)).reduce((a, x) => a + (Number(x.htr.watt_now) || 0), 0)); if (av == null || h.status === "warm" || h.status === "aus" || h.status === "zeit") return "";
    const th = st.map((w) => w + p.reserve), max = Math.max(av, th[th.length - 1]) * 1.05, pc = (w) => Math.min(100, (w / max) * 100);
    const i = h.status === "pv" ? (h.stufe || 1) - 1 : -1, auto = h.auto !== "off";
    const up = i >= 0 && th[i + 1] != null ? th[i + 1] : null, hint = !auto ? `Feste Vorgabe: läuft nur auf der höchsten Stufe, ab ${wfmt(th[th.length - 1])}.` : i < 0 ? "" : `Regelt automatisch: ${up != null ? `ab ${wfmt(up)} Stufe ${i + 2}, ` : "höchste Stufe erreicht, "}unter ${wfmt(th[i])} ${i > 0 ? "Stufe " + i : "aus"}.`;
    return `<div class="stsc" aria-label="Überschuss im Verhältnis zu den Stufen"><div class="stbar"><i style="width:${pc(av)}%"></i>${th.map((w, k) => `<u style="left:${pc(w)}%" class="${av >= w ? "ok" : ""}"><b>${k + 1}</b></u>`).join("")}</div><div class="stlb"><span>Für diesen Heizer frei: ${wfmt(av)}</span></div></div>${hint ? `<div class="htrn">${ic("bolt", 13)}${hint}</div>` : ""}`;
  }
  _stepBar(h) {
    const st = stepsOf(h), p = this._pv();
    return `${st.length > 1 ? `<div class="stp">${st.map((w, i) => `<span class="${h.status === "pv" && h.stufe === i + 1 ? "on" : ""}"><b>${i + 1}</b>${wfmt(w)}${h.presets && h.presets[i] ? `<small>${esc(h.presets[i])}</small>` : ""}</span>`).join("")}</div>` : ""}${this._stepScale(h)}${h.status === "wartet" ? `<div class="htrn mut">${ic("bolt", 13)}Startet ab ${wfmt(st[0] + p.reserve)} Überschuss (Stufe 1 plus ${wfmt(p.reserve)} Reserve)</div>` : ""}`;
  }
  _htrChip(r) {
    const h = r.htr; if (!h) return "";
    const [lab, c] = HTR[h.status] || HTR.aus;
    return `<span class="achip ${c}">${ic("bolt", 12)}${h.status === "pv" ? (stepsOf(h).length > 1 ? "Stufe " + h.stufe + " · " : "PV-Heizer ") + wfmt(h.watt_now) : lab}</span>`;
  }
  _pvBlock() {
    const rs = this._htrRooms(); if (!rs.length) return "";
    const p = this._pv(), w = this._pvNow(), tot = this._htrTotal(), soc = this._soc();
    const kwh = rs.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), pvk = rs.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const share = kwh > 0 ? Math.round((pvk / kwh) * 100) : 0, gain = (pvk * Math.max(0, this._price() - this._feed())) / 100, cap = Math.max(w ?? 0, tot, 1);
    const seg = rs.filter((r) => r.htr.watt_now > 0).map((r) => `<i style="width:${(r.htr.watt_now / cap) * 100}%;background:${r.color}" title="${esc(r.name)} ${wfmt(r.htr.watt_now)}"></i>`).join("");
    return `<div class="card pvb"><div class="pvh"><span class="pt">${ic("bolt", 18)}PV-Heizer</span><button class="lnk" data-act="hrepall">${ic("chart", 15)}Bericht</button></div>
      ${w == null ? `<div class="mut sm">Noch kein PV-Sensor gewählt. Das stellst du unter „Allgemein“ ein.</div>` : `<div class="pvbig"><b>${wfmt(w)}</b><span>PV-Überschuss${soc != null ? ` · Batterie ${num(soc)} %${p.soc_min ? ` (ab ${num(p.soc_min)} % für Heizer)` : ""}` : ""}</span></div>
      <div class="pvbar">${seg}</div><div class="pvlg"><span>${wfmt(tot)} an Heizer verteilt</span><span>${wfmt(Math.max(0, w - tot))} frei</span></div>`}
      <div class="pvrows">${rs.map((r) => { const h = r.htr, [lab, c] = HTR[h.status] || HTR.aus; return `<div class="pvr"><i style="background:${r.color}"></i><b>${esc(r.name)}</b><span class="pill ${c}">${lab}</span><em>${h.watt_now > 0 ? (stepsOf(h).length > 1 ? `St. ${h.stufe}/${stepsOf(h).length} · ` : "") + wfmt(h.watt_now) : "bis " + wfmt(stepsOf(h).slice(-1)[0])}</em></div>`; }).join("")}</div>
      <div class="pvt"><div><b>${num(kwh, 1)} kWh</b><span>Heizer heute</span></div><div><b>${share} %</b><span>aus PV-Überschuss</span></div><div><b>≈ ${num(gain, 2)} €</b><span>Vorteil heute</span></div></div></div>`;
  }
  _airLite(r) {
    if (r.airOff || r.humEid) return null;
    const h = this._hass, t0 = (r.thermos || []).map((e) => h.states[e]).filter(Boolean)[0], t = t0 && t0.attributes.current_temperature;
    if (t == null) return null;
    const o = this._out(), ts = o.t == null ? Number(t) - 4 : o.t + 0.7 * (Number(t) - o.t), crit = Math.min(100, (80 * esat(Number(t))) / esat(ts));
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), open = wins.filter((w) => ["on", "open"].includes(w.state));
    const since = open.length ? Math.min(...open.map((w) => new Date(w.last_changed || Date.now()).getTime())) : 0;
    const last = open.length ? Date.now() : (r.lastAir || this._airHistFor(r) || 0);
    const hrs = last ? (Date.now() - last) / 3600000 : null, every = r.airEvery == null ? 8 : r.airEvery;
    return { t: Number(t), ts, crit, open: open.length, since, need: ventMin(o.t), hrs, every, due: every > 0 && hrs != null && hrs >= every, estimated: o.t == null };
  }
  _airHistFor(r) {
    const hist = (this._airHist = this._airHist || {}), c = hist[r.id];
    if (c !== undefined) return c;   // gefunden (ms) oder 0 = nichts im Verlauf
    hist[r.id] = 0;
    const ids = r.windows || []; if (!ids.length) return 0;
    const end = new Date(), start = new Date(+end - 9 * 864e5);
    this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: true, no_attributes: true }).then((res) => {
      let best = 0;
      for (const id of ids) { let prev = null; for (const x of (res && res[id]) || []) { const on = ["on", "open"].includes(x.s); const t = (x.lu ?? x.lc ?? 0) * 1000; if (prev && !on && t > best) best = t; prev = on; } }
      hist[r.id] = best; if (best) this._render();
    }).catch(() => {});
    return 0;
  }
  _ago(h) { return h == null ? "unbekannt" : h < 1 ? (h * 60 < 2 ? "gerade eben" : `vor ${Math.round(h * 60)} Min.`) : h < 48 ? `vor ${Math.round(h)} Std.` : `vor ${Math.round(h / 24)} Tagen`; }
  _airLiteBox(r) {
    const a = this._airLite(r); if (!a) return "";
    const cc = a.crit < 60 ? "amber" : "slate", adm = this._admin();
    let msg;
    if (a.open) { const c = cdown(a.since, a.need); msg = `<div class="airmsg ${c.left <= 0 ? "done" : "green"}" data-since="${a.since}" data-need="${a.need}">${ic("windy", 16)}<div><b>Lüften läuft</b> · <span data-cd>${c.txt}</span><div class="pr"><i data-bar style="width:${c.pct}%"></i></div></div></div>`; }
    else if (a.due) msg = `<div class="airmsg amber">${ic("windy", 16)}<div><b>Länger nicht gelüftet</b> (${this._ago(a.hrs)}). Jetzt ca. ${a.need} Min. stoßlüften.</div></div>`;
    else if (a.crit < 60) msg = `<div class="airmsg amber">${ic("alert", 16)}<div><b>Kalte Wände:</b> halte die Luftfeuchte unter ${num(Math.floor(a.crit))} %. Ohne Sensor kann die Karte sie nicht messen.</div></div>`;
    else msg = `<div class="airmsg green">${ic("check", 16)}<div><b>Kein Lüftungsbedarf erkannt</b>, zuletzt gelüftet ${this._ago(a.hrs)}</div></div>`;
    return `<div class="air"><div class="ac ${a.due ? "amber" : "green"}"><div class="t">${ic("windy", 13)}Gelüftet</div><div class="v">${a.open ? "jetzt" : a.hrs == null ? "unbekannt" : this._ago(a.hrs).replace("vor ", "")}</div><div class="s">${a.every > 0 ? `Erinnern: ${a.every}&nbsp;Std.` : "ohne Erinnerung"}</div></div>
      <div class="ac slate"><div class="t">${ic("thermo", 13)}Wand</div><div class="v">${num(a.ts, 1)}&nbsp;°C</div><div class="s">${a.estimated ? "grob geschätzt" : "Außenwand"}</div></div>
      <div class="ac ${cc}"><div class="t">${ic("drop", 13)}Kritisch ab</div><div class="v">${a.crit >= 90 ? "&gt;&nbsp;90" : num(Math.floor(a.crit))}&nbsp;%</div><div class="s">an der Wand</div></div></div>${msg}
      ${adm ? `<button class="lnk" data-act="airsetup" data-id="${esc(r.id)}">${ic("drop", 15)}Luftfeuchte-Sensor wählen für genaue Warnung</button>` : ""}`;
  }
  _airLiteChip(r) {
    const a = this._airLite(r); if (!a) return "";
    if (a.open) { const c = cdown(a.since, a.need); return `<span class="achip green" data-since="${a.since}" data-need="${a.need}">${ic("windy", 12)}<span data-cd>${c.txt}</span></span>`; }
    return `<span class="achip ${a.due ? "amber" : "slate"}">${ic("windy", 12)}Gelüftet ${this._ago(a.hrs)}</span>`;
  }
  _airChip(r) {
    const a = this._airData(r); if (!a) return this._airLiteChip(r);
    if (a.open) { const c = cdown(a.since, a.need); return `<span class="achip green" data-since="${a.since}" data-need="${a.need}">${ic("windy", 12)}<span data-cd>${c.txt}</span></span>`; }
    const [ml, mc] = MOLD[a.lvl]; return `<span class="achip ${mc}">${ic("drop", 12)}${num(a.rh)} % · Schimmel ${ml}</span>`;
  }
  _acc() { const a = this._cfg.layout.accent; return HEX.test(a || "") ? a : DEF_ACC; }
  _applyLook() { const a = this._acc(); this.style.setProperty("--teal", a); this.style.setProperty("--on-acc", onColor(a)); }
  /* ---------------- Kopfkarten-Hintergrund ---------------- */
  _heroCfg() { const h = this._cfg.layout.hero || {}; return { mode: ["time", "season", "weather"].includes(h.mode) ? h.mode : "standard", own: h.own && typeof h.own === "object" ? h.own : {} }; }
  _sunPhase() {
    const s = (this._hass.states || {})["sun.sun"];
    if (s) { const el = Number(s.attributes.elevation); if (isFinite(el)) return el < -4 ? "night" : el <= 8 ? (s.attributes.rising ? "sunrise" : "sunset") : "day"; return s.state === "below_horizon" ? "night" : "day"; }
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60; return h < 5.5 || h >= 21 ? "night" : h < 8 ? "sunrise" : h < 18 ? "day" : "sunset";
  }
  _season() {
    const m = new Date().getMonth(), lat = this._hass.config && Number(this._hass.config.latitude), n = m >= 2 && m <= 4 ? 0 : m >= 5 && m <= 7 ? 1 : m >= 8 && m <= 10 ? 2 : 3, order = ["spring", "summer", "autumn", "winter"];
    return order[isFinite(lat) && lat < 0 ? (n + 2) % 4 : n];
  }
  _wxSlot() {
    const c = this._wxCfg(), st = this._hass.states, wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather.")), night = this._sunPhase() === "night";
    if (!wid) return night ? "clear-night" : "sunny";
    const map = { sunny: "sunny", "clear-night": "clear-night", partlycloudy: "partlycloudy", cloudy: "cloudy", rainy: "rainy", pouring: "pouring", snowy: "snowy", "snowy-rainy": "snowy", hail: "snowy", fog: "fog", lightning: "lightning", "lightning-rainy": "lightning", windy: "cloudy", "windy-variant": "cloudy", exceptional: "cloudy" };
    let k = map[st[wid].state] || "cloudy"; if (k === "sunny" && night) k = "clear-night"; if (k === "clear-night" && !night) k = "sunny"; return k;
  }
  _heroSlot(mode) { return mode === "time" ? this._sunPhase() : mode === "season" ? this._season() : this._wxSlot(); }
  _heroBg() {
    const c = this._heroCfg(); if (c.mode === "standard") return "";
    const slot = this._heroSlot(c.mode), own = c.own[c.mode + ":" + slot];
    return own && /^data:image\//.test(own) ? `<div class="hbg hph" style="background-image:url('${esc(own)}')"></div>` : this._heroSvg(c.mode, slot, "h", this._sunPhase() === "night");
  }
  _heroSvg(mode, slot, p, night) {
    night = !!night && mode === "weather" && slot !== "clear-night";
    let seed = 11; const R = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296, f = (n) => Math.round(n * 10) / 10;
    const mix = (hex, t) => { const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)), b = [5, 10, 28]; return "#" + a.map((v, i) => Math.round(v * (1 - t) + b[i] * t).toString(16).padStart(2, "0")).join(""); };
    const grad = (st) => `<defs><linearGradient id="${p}g" x1="0" y1="0" x2="0" y2="1">${st.map(([o, col]) => `<stop offset="${o}" stop-color="${night ? mix(col, 0.62) : col}"/>`).join("")}</linearGradient></defs><rect width="400" height="200" fill="url(#${p}g)"/>`;
    const stars = (n) => Array.from({ length: n }, () => `<circle cx="${f(R() * 400)}" cy="${f(R() * 115)}" r="${f(0.5 + R() * 1)}" fill="#fff" opacity="${f(0.35 + R() * 0.6)}"/>`).join("");
    const hills = (c1, c2, y = 150) => `<path d="M0 ${y}C60 ${y - 30} 120 ${y - 24} 190 ${y - 8}S330 ${y - 34} 400 ${y - 12}V200H0Z" fill="${c1}"/><path d="M0 ${y + 22}C80 ${y + 4} 150 ${y + 12} 230 ${y + 20}S350 ${y + 6} 400 ${y + 16}V200H0Z" fill="${c2}"/>`;
    const sun = (x, y, r, col, glow) => `<circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${glow}" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r * 1.7}" fill="${glow}" opacity=".3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
    const moon = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="#cfd8ff" opacity=".12"/><mask id="${p}m"><rect width="400" height="200" fill="#fff"/><circle cx="${x + r * 0.5}" cy="${y - r * 0.25}" r="${r * 0.92}" fill="#000"/></mask><circle cx="${x}" cy="${y}" r="${r}" fill="#f4f1d8" mask="url(#${p}m)"/>`;
    const cloud = (x, y, s, op, col) => `<g opacity="${op}" fill="${col}" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="36" ry="12"/><ellipse cx="-17" cy="-9" rx="19" ry="13"/><ellipse cx="11" cy="-14" rx="23" ry="16"/></g>`;
    const rain = (n, len, op) => Array.from({ length: n }, () => { const x = f(R() * 420), y = f(R() * 190); return `<path d="M${x} ${y}l-4 ${len}" stroke="#cfe6ff" stroke-width="1.2" opacity="${op}" stroke-linecap="round"/>`; }).join("");
    const snow = (n, c) => Array.from({ length: n }, () => `<circle cx="${f(R() * 400)}" cy="${f(R() * 190)}" r="${f(0.8 + R() * 1.9)}" fill="${c || "#fff"}" opacity="${f(0.5 + R() * 0.5)}"/>`).join("");
    const fog = () => [40, 78, 112, 146].map((y, i) => `<rect x="${i % 2 ? -30 : 20}" y="${y}" width="420" height="22" rx="11" fill="#e8eef2" opacity="${f(0.16 + i * 0.05)}"/>`).join("");
    const leaves = (n) => Array.from({ length: n }, () => `<ellipse cx="${f(R() * 400)}" cy="${f(R() * 190)}" rx="${f(3 + R() * 3)}" ry="${f(1.8 + R() * 1.6)}" fill="${["#e0451f", "#f08a1f", "#f4c430", "#b5471d"][Math.floor(R() * 4)]}" opacity=".85" transform="rotate(${Math.round(R() * 180)} ${f(R() * 400)} ${f(R() * 190)})"/>`).join("");
    const petals = (n) => Array.from({ length: n }, () => `<circle cx="${f(R() * 400)}" cy="${f(R() * 190)}" r="${f(1.6 + R() * 2)}" fill="${["#ffd1e3", "#fff", "#ffb6d2"][Math.floor(R() * 3)]}" opacity=".85"/>`).join("");
    const bolt = (x, y) => `<polygon points="${x},${y} ${x - 14},${y + 34} ${x - 3},${y + 34} ${x - 10},${y + 62} ${x + 16},${y + 24} ${x + 4},${y + 24} ${x + 12},${y}" fill="#fff6b0" opacity=".95"/><polygon points="${x},${y} ${x - 14},${y + 34} ${x - 3},${y + 34} ${x - 10},${y + 62} ${x + 16},${y + 24} ${x + 4},${y + 24} ${x + 12},${y}" fill="#fff6b0" opacity=".25" transform="scale(1.4)" transform-origin="${x} ${y}"/>`;
    const cl = (op, col, pts) => pts.map(([x, y, s]) => cloud(x, y, s, op, col)).join("");
    let b = "";
    if (mode === "time") {
      if (slot === "night") b = grad([[0, "#050a1c"], [0.6, "#14214a"], [1, "#2a2f66"]]) + stars(70) + moon(310, 48, 18) + hills("#0a1230", "#070d24", 160);
      else if (slot === "sunrise") b = grad([[0, "#27255e"], [0.45, "#8a4a86"], [0.75, "#f08a6a"], [1, "#fbd38a"]]) + sun(300, 152, 22, "#fff3c0", "#ffd27a") + hills("#3a2a52", "#241a3c", 152);
      else if (slot === "sunset") b = grad([[0, "#1c2a60"], [0.4, "#75397c"], [0.75, "#e5604b"], [1, "#fbab5c"]]) + sun(110, 152, 24, "#ffe2a0", "#ff9f5a") + hills("#3b2447", "#241634", 152);
      else b = grad([[0, "#1a5aa6"], [0.6, "#3f9ad6"], [1, "#9ad8f0"]]) + sun(320, 44, 20, "#fff7c2", "#fff1a0") + cl(0.7, "#fff", [[90, 56, 1.1], [210, 92, 0.8]]) + hills("#2f7d6a", "#1f5f55", 160);
    } else if (mode === "season") {
      if (slot === "spring") b = grad([[0, "#1b6a7a"], [0.55, "#6fbf9a"], [1, "#d6efb0"]]) + sun(330, 40, 14, "#fffbd0", "#fff2a0") + hills("#4f9a5a", "#3a7d49", 152) + petals(34);
      else if (slot === "summer") b = grad([[0, "#0d5f9a"], [0.5, "#29a8c8"], [1, "#fbe9a0"]]) + sun(318, 42, 24, "#fff4b0", "#ffe27a") + cl(0.55, "#fff", [[100, 60, 0.9]]) + hills("#e1b84a", "#c79a2e", 155);
      else if (slot === "autumn") b = grad([[0, "#2c1a14"], [0.5, "#8e4520"], [1, "#e6903a"]]) + sun(290, 78, 15, "#ffd9a0", "#ff9f5a") + hills("#4b2412", "#33180d", 155) + leaves(34);
      else b = grad([[0, "#0a2240"], [0.55, "#2c5d8c"], [1, "#a9cbe3"]]) + snow(74) + hills("#e8f1f8", "#cfe0ee", 158);
    } else {
      const day = !night;
      if (slot === "clear-night") b = grad([[0, "#050a1c"], [0.6, "#14214a"], [1, "#2a2f66"]]) + stars(70) + moon(310, 48, 18) + hills("#0a1230", "#070d24", 160);
      else if (slot === "sunny") b = grad([[0, "#1a5aa6"], [0.6, "#3f9ad6"], [1, "#9ad8f0"]]) + sun(320, 44, 20, "#fff7c2", "#fff1a0") + hills("#2f7d6a", "#1f5f55", 160);
      else if (slot === "partlycloudy") b = grad([[0, "#2a649f"], [0.6, "#5aa0d0"], [1, "#a9d6ea"]]) + sun(320, 48, 18, "#fff7c2", "#fff1a0") + cl(0.85, "#fff", [[110, 64, 1.2], [250, 96, 1], [330, 74, 0.8]]) + hills("#2f7d6a", "#1f5f55", 162);
      else if (slot === "cloudy") b = grad([[0, "#46566a"], [0.6, "#6f8196"], [1, "#a2b2c2"]]) + cl(0.85, "#d6dee6", [[80, 52, 1.3], [200, 86, 1.5], [320, 56, 1.2], [140, 120, 1.1]]) + hills("#44566a", "#34455a", 166);
      else if (slot === "rainy") b = grad([[0, "#2b3a4f"], [0.6, "#4b5f78"], [1, "#7288a0"]]) + cl(0.9, "#8b9bb0", [[80, 46, 1.4], [210, 70, 1.6], [330, 48, 1.3]]) + rain(60, 14, 0.55) + hills("#2c3b50", "#1f2d40", 168);
      else if (slot === "pouring") b = grad([[0, "#1b2638"], [0.6, "#35465d"], [1, "#586d86"]]) + cl(0.95, "#6f8096", [[70, 44, 1.5], [200, 64, 1.7], [330, 44, 1.4]]) + rain(140, 18, 0.6) + hills("#1d2a3c", "#142030", 170);
      else if (slot === "snowy") b = grad([[0, "#415a74"], [0.6, "#7f9bb5"], [1, "#c4d6e4"]]) + cl(0.8, "#e4ecf3", [[90, 48, 1.3], [250, 74, 1.4]]) + snow(80) + hills("#eef4f9", "#d6e4ef", 164);
      else if (slot === "fog") b = grad([[0, "#5c6b78"], [0.6, "#8a98a4"], [1, "#b9c4cc"]]) + hills("#6f7f8c", "#5f6f7c", 150) + fog();
      else b = grad([[0, "#1c2233"], [0.6, "#323a55"], [1, "#4f5a78"]]) + cl(0.95, "#59627f", [[80, 46, 1.5], [220, 66, 1.7], [330, 44, 1.3]]) + rain(70, 14, 0.4) + bolt(250, 70) + hills("#171d2e", "#101626", 170);
      void day;
    }
    return `<svg class="hbg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${b}</svg>`;
  }
  _heroPick(inp) {
    const file = inp.files && inp.files[0], key = this._heroTarget; if (!file || !key) return;
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const w = Math.min(900, img.width), h = Math.round(img.height * w / img.width), c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      let q = 0.72, d = c.toDataURL("image/jpeg", q);
      while (d.length > 150000 && q > 0.3) { q -= 0.08; d = c.toDataURL("image/jpeg", q); }
      if (d.length > 190000) { this._toast("Bild ist zu groß"); return; }
      const hc = this._heroCfg(), own = { ...hc.own, [key]: d };
      if (Object.keys(own).length > 12) { this._toast("Höchstens 12 eigene Hintergründe"); return; }
      this._cfg.layout.hero = { mode: hc.mode, own }; this._saveLayout(); this._render(); this._renderModal();
    };
    img.onerror = () => this._toast("Bild konnte nicht gelesen werden");
    img.src = url;
  }
  _heroLook() {
    const c = this._heroCfg(), slots = HERO_SLOTS[c.mode] || [], act = c.mode === "standard" ? "" : this._heroSlot(c.mode);
    const info = { standard: "Die gewohnte Kopfkarte.", time: "Der Hintergrund folgt dem Sonnenstand (Sonne „sun.sun“, sonst die Uhrzeit): Nacht, Sonnenaufgang, Tag und Sonnenuntergang.", season: "Der Hintergrund folgt der Jahreszeit (meteorologisch, auf der Südhalbkugel umgekehrt).", weather: "Der Hintergrund zeigt das aktuelle Wetter, nachts dunkler. Das Wetter kommt von der Wetter-Entität oben." }[c.mode];
    return `<div class="lsec">${ic("image", 15)}Kopfkarten-Hintergrund</div>
      <div class="seg" style="margin-top:6px">${HERO_MODES.map(([k, l]) => `<button class="${c.mode === k ? "sel" : ""}" data-act="hmode" data-k="${k}">${l}</button>`).join("")}</div>
      <div class="mut sm" style="margin:0 0 8px">${info}</div>
      ${slots.length ? `<div class="hsl">${slots.map(([k, l], i) => { const own = c.own[c.mode + ":" + k], key = c.mode + ":" + k; return `<div class="hsc ${act === k ? "on" : ""}"><div class="hth">${own ? `<div class="hbg hph" style="background-image:url('${esc(own)}')"></div>` : this._heroSvg(c.mode, k, "t" + i, false)}${act === k ? `<em>jetzt</em>` : ""}</div><b>${l}</b><div class="hac"><button class="lnk" data-act="hup" data-k="${key}">${own ? "Ersetzen" : "Eigenes Foto"}</button>${own ? `<button class="lnk dng" data-act="hdel" data-k="${key}">${ic("trash", 13)}</button>` : ""}</div></div>`; }).join("")}</div><input type="file" accept="image/*" data-f="hfile" hidden>
      <div class="mut sm" style="margin:6px 0 8px">Mit „Eigenes Foto“ ersetzt du den Hintergrund für diesen Fall. Das Foto wird verkleinert (ca. 900 px) und für alle Nutzer gespeichert. Höchstens 12 Fotos.</div>` : ""}`;
  }
  _wxCfg() { const w = this._cfg.layout.wx || {}; return { on: w.on !== false, entity: w.entity || "", outdoor: w.outdoor || "" }; }
  _wx() {
    const c = this._wxCfg(); if (!c.on) return "";
    const st = this._hass.states, wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, o = c.outdoor ? st[c.outdoor] : null;
    const ov = o && isFinite(parseFloat(o.state)) ? parseFloat(o.state) : null, wv = w && w.attributes.temperature != null ? Number(w.attributes.temperature) : null;
    const temp = ov ?? wv; if (temp == null && !w) return "";
    const [ico, lab] = w ? (WX[w.state] || ["cloud", w.state]) : ["thermo", "Außentemperatur"];
    const a = w ? w.attributes : {}, unit = (o && o.attributes.unit_of_measurement) || a.temperature_unit || "°C";
    const det = [a.humidity != null ? `${num(Math.round(a.humidity))} % Luftfeuchte` : "", a.wind_speed != null ? `Wind ${num(Math.round(a.wind_speed))} ${a.wind_speed_unit || "km/h"}` : ""].filter(Boolean).join(" · ");
    return `<div class="wx"><span class="wxi">${ic(ico, 28)}</span><div><div class="wxt">${temp != null ? num(temp, 1) : "–"}<small>${esc(unit)} draußen</small></div><div class="wxc">${esc(lab)}</div>${det ? `<div class="wxd">${esc(det)}</div>` : ""}</div></div>`;
  }
  _saveGen() {
    this._hass.callWS({ type: "fenster_heizung/set_general", general: this._gen }).then((r) => {
      if (r && r.general) { this._gen = { ...this._gen, ...r.general }; this._st = r.status || null; this._render(); if (this._modal && (this._modal.type === "gen" || this._modal.type === "fh")) this._renderModal(); }
    }).catch(() => this._toast("Einstellung konnte nicht gespeichert werden"));
  }
  _pollGen() {
    this._hass.callWS({ type: "fenster_heizung/get_general" }).then((r) => {
      if (!r || this._dragging || (this._modal && (this._modal.type === "gen" || this._modal.type === "fh"))) return;
      this._st = r.status || null; this._gen = { ...this._gen, ...(r.general || {}) }; this._render();
    }).catch(() => {});
  }
  async _backup() {
    const rooms = {}, list = this._collect(true);
    for (const r of list) { try { const o = await this._hass.callWS({ type: "fenster_heizung/get_options", entry_id: r.id }); rooms[r.id] = { name: r.name, options: o.options }; } catch (_) { rooms[r.id] = { name: r.name }; } }
    const data = { app: "fenster_heizung", format: 1, version: this._ver, created: new Date().toISOString(), layout: this._cfg.layout, plans: this._cfg.plans, presence: this._cfg.presence, general: this._gen, modules: this._mdBackup().modules, wasser: this._mdBackup().ww, rooms };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })), a = document.createElement("a");
    a.href = url; a.download = `fenster-heizung-sicherung-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    this._toast(`Sicherung gespeichert (${list.length} ${list.length === 1 ? "Raum" : "Räume"})`);
  }
  async _restore() {
    const d = this._modal && this._modal.restore; if (!d) return;
    let res = null;
    try { res = await this._hass.callWS({ type: "fenster_heizung/restore", data: d }); } catch (e) { this._toast((e && e.message) || "Wiederherstellen fehlgeschlagen"); return; }
    this._modal = null; this._renderModal(); this._learn = {}; await this._load();
    const miss = res && res.missing ? ` · ${res.missing} ${res.missing === 1 ? "Raum" : "Räume"} nicht gefunden` : "";
    this._toast(`Sicherung wiederhergestellt${miss}`);
  }
  _genChange(t) {
    const f = t.dataset && t.dataset.f;
    if (f === "gwxn") { const v = Number(t.value); this._gen.wxadj = { ...this._gen.wxadj, [t.dataset.k]: isFinite(v) ? v : 0 }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gpvs" || f === "gpvb") { this._gen.pv = { ...this._pv(), [f === "gpvs" ? "sensor" : "soc_sensor"]: t.value }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gpvp") { this._gen.pv = { ...this._pv(), [t.dataset.p + "_sensor"]: t.value }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gpvn") { const v = Number(t.value); this._gen.pv = { ...this._pv(), [t.dataset.k]: isFinite(v) ? Math.min(100, Math.max(0, Math.round(v * 100) / 100)) : 0 }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "gth") { const v = Math.min(35, Math.max(5, Number(t.value) || 18)); this._gen.summer = { ...this._gen.summer, temp: v }; this._saveGen(); this._render(); this._renderModal(); return true; }
    if (f === "rsfile") {
      const file = t.files && t.files[0]; if (!file) return true;
      file.text().then((txt) => {
        let d; try { d = JSON.parse(txt); } catch (_) { d = null; }
        if (!d || d.app !== "fenster_heizung" || !d.rooms) { this._toast("Das ist keine gültige Sicherung"); return; }
        this._modal = { type: "gen", restore: d }; this._renderModal();
      });
      t.value = ""; return true;
    }
    return false;
  }
  _lookChange(t) {
    if (this._genChange(t)) return;
    const f = t.dataset && t.dataset.f, L = this._cfg.layout, m = this._modal;
    if (!f) return false;
    if (f === "rfile") { this._photoPick(t); return true; }
    if (f === "hfile") { this._heroPick(t); t.value = ""; return true; }
    if (f === "lacc" && HEX.test(t.value)) L.accent = t.value;
    else if (f === "rcolc" && m && HEX.test(t.value)) L.colors = { ...(L.colors || {}), [m.id]: t.value };
    else if (f === "lwxe") L.wx = { ...(L.wx || {}), entity: t.value };
    else if (f === "lwxo") L.wx = { ...(L.wx || {}), outdoor: t.value };
    else return false;
    this._saveLayout(); this._render(); this._renderModal(); return true;
  }
  _photoPick(inp) {
    const file = inp.files && inp.files[0], m = this._modal; if (!file || !m) return;
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const w = Math.min(560, img.width), h = Math.round(img.height * w / img.width), c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      let q = 0.72, d = c.toDataURL("image/jpeg", q);
      while (d.length > 110000 && q > 0.3) { q -= 0.08; d = c.toDataURL("image/jpeg", q); }
      if (d.length > 140000) { this._toast("Bild ist zu groß"); return; }
      this._cfg.layout.photos = { ...(this._cfg.layout.photos || {}), [m.id]: d };
      this._saveLayout(); this._render(); this._renderModal();
    };
    img.onerror = () => this._toast("Bild konnte nicht gelesen werden");
    img.src = url;
  }
  _room(r) {
    const h = this._hass, m = MODE[r.mode] || MODE.regelung_aus, edit = this._edit;
    const wins = (r.windows || []).map((e) => h.states[e]).filter(Boolean), open = wins.filter((w) => ["on", "open"].includes(w.state));
    const wc = open.length ? "amber" : "green", winName = (w) => w.attributes.friendly_name || w.entity_id;
    const th = (r.thermos || []).map((e) => h.states[e]).filter(Boolean), t0 = th[0], cur = t0?.attributes.current_temperature, tgt = t0?.attributes.temperature;
    const hv = t0 ? (t0.state === "off" ? "aus" : t0.state === "heat" ? "heizt" : t0.state === "auto" ? "Automatik" : t0.state) : "–";
    const hc = !t0 ? "gray" : t0.state === "off" ? "slate" : "green";
    const d = r.sc.day || { min: 0, gas: 0, kwh: 0 };
    const icon = edit
      ? `<button class="rico" style="${rcStyle(r.color)}" data-act="icon" data-id="${esc(r.id)}" aria-label="Symbol ändern">${ico(this._icon(r), 32)}<span class="pen">${ic("pencil", 11)}</span></button>`
      : `<div class="rico" style="${rcStyle(r.color)}">${ico(this._icon(r), 32)}</div>`;
    return `<div class="card room${this._ph(r).c}"${this._ph(r).s} data-m="${m.c}" data-sort="room" data-id="${esc(r.id)}"><div class="rh">
      ${edit ? `<span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>` : ""}${icon}
      <div class="rn"><b>${esc(r.name)}</b><div class="pl"><span class="pill ${m.c}">${m.t}</span><button class="why" data-act="why" data-id="${esc(r.id)}" aria-label="Warum?">${ic("info", 13)}Warum?</button><button class="why" data-act="rep" data-id="${esc(r.id)}" aria-label="Bericht">${ic("chart", 13)}Bericht</button>${this._devChip(r)}</div></div>
      ${this._admin() ? `<button class="ibtn gear" data-act="opt" data-id="${esc(r.id)}" aria-label="Raumeinstellungen">${ic("sliders", 17)}</button>` : ""}
      <button class="sw ${r.on ? "on" : ""}" data-act="sw" data-sw="${esc(r.sw)}" aria-label="Fensterregelung umschalten" aria-pressed="${!!r.on}"></button></div>
      <div class="two">
        <div class="box ${wc}"><div class="t">${ic(open.length ? "windowOpen" : "window", 18)}Fenster</div>
          <div class="v">${open.length ? `${open.length} von ${wins.length} offen` : "alle geschlossen"}</div>
          <div class="s">${esc(open.length ? open.map(winName).join(", ") : wins.map(winName).join(", ") || "–")}</div></div>
        <div class="box ${hc}"><div class="t">${ic("radiator", 18)}Heizung</div>
          <div class="v">${cur != null ? num(cur, 1) + " °C" : hv}</div>
          <div class="s">${t0 ? (cur != null && tgt != null ? `Ziel ${num(tgt, 1)} °C · ` : "") + hv : "kein Thermostat"}${th.length > 1 ? ` (+${th.length - 1})` : ""}</div></div>
      </div>
      ${this._planBox(r)}${this._wxaNote(r)}${this._away() ? `<div class="pnote">${ic("suitcase", 16)}${this._pres().effective === "vacation" || this._pres().mode === "vacation" ? "Urlaubsmodus" : "Abwesend"}: Absenkung auf ${num(this._pres().temp, 1)} °C, der Heizplan ruht.</div>` : this._sum().active ? `<div class="pnote">${ic("sun", 16)}Sommermodus: Der Heizplan ruht, die Fenstermeldung bleibt aktiv.</div>` : ""}
      ${this._htrBox(r)}${this._airBox(r)}
      <div class="foot"><div class="a"><b>${num(d.min)} Min. pausiert</b><span>${r.pauses || 0}× heute · ~${num(d.gas, 2)} ${FUELS[r.fuel || "erdgas"].label} · ${num(r.kw, 2)} kW</span></div>${this._spark(r)}</div></div>`;
  }

  /* Die Modulleiste behält beim Neuzeichnen ihre Scrollposition. Beim Wechsel des Moduls wird das gewählte Tab in die Mitte geholt. */
  _render() {
    const sr0 = this.shadowRoot, ae0 = sr0 && sr0.activeElement;
    /* Läuft gerade eine Eingabe (Uhrzeit, Zahl, Text), wird die Seite nicht neu aufgebaut. Home Assistant meldet laufend neue Werte, das würde das Feld mitten im Tippen wegwerfen. Nach dem Verlassen des Feldes wird nachgezogen. */
    if (ae0 && ae0.tagName === "INPUT" && ["time", "date", "number", "text"].includes(ae0.type) && !ae0.classList.contains("stoq") && sr0.getElementById("main") && sr0.getElementById("main").contains(ae0)) {
      if (this._inHook !== ae0) { this._inHook = ae0; ae0.addEventListener("blur", () => { this._inHook = null; setTimeout(() => this._render(), 0); }, { once: true }); }
      return;
    }
    const bar = sr0 && sr0.querySelector(".mbar"), x = bar ? bar.scrollLeft : null, id = this._mdActive();
    this._render0();
    const nb = sr0 && sr0.querySelector(".mbar"); if (!nb) { this._mbId = id; return; }
    if (this._mbId !== id || x == null) {
      const t = nb.querySelector(".mtab.sel"); if (t) nb.scrollLeft = Math.max(0, t.offsetLeft - (nb.clientWidth - t.offsetWidth) / 2);
    } else nb.scrollLeft = x;
    this._mbId = id;
  }
  _render0() {
    if (!this._hass || this._dragging) return;
    const sr = this.shadowRoot;
    if (!this._built) { this._build(); }
    const bg = getComputedStyle(this).backgroundColor.match(/\d+/g) || [15, 20, 25];
    this.style.colorScheme = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) < 140 ? "dark" : "light";
    this._applyLook();
    if (this._tmOn()) { this._tmRender(); return; }
    if (this._igOpen && this._admin()) { this._igRender(); return; }
    if (this._ortOpen && this._admin()) { this._ortRender(); return; }
    if (this._labOpen && this._admin()) { this._labRender(); return; }
    if (this._stOpen && this._admin()) { this._stRender(); return; }
    if (this._mdActive() !== "fh") { this._mdRender(); return; }
    const rooms = this._collect(), edit = this._edit, adm = this._admin();
    const sum = (sc, k) => rooms.reduce((a, r) => a + (r.sc[sc]?.[k] || 0), 0);
    const paused = rooms.filter((r) => r.mode === "heizung_pausiert").length;
    const fset = new Set(rooms.map((r) => r.fuel || "erdgas")), F = fset.size === 1 ? FUELS[[...fset][0]] : MIXED, mixed = fset.size > 1;
    const amt = (sc) => (mixed ? sum(sc, "kwh") : sum(sc, "gas"));
    const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const tiles = [["day", "today", "Heute", "var(--teal)"], ["month", "month", "Monat", "#60a5fa"], ["year", "year", "Jahr", "#a78bfa"], ["total", "total", "Gesamt", "#f472b6"]];
    const content = {
      hero: () => `<div class="card hero${this._heroCfg().mode !== "standard" ? " hs" : ""}">${this._heroBg()}${this._art()}
        <div class="lbl">${ic("flame", 16)}Heute ${F.short} gespart (geschätzt)</div>
        <div class="big">${num(amt("day"), 2)}<small>${F.label}</small></div><div class="sub">${esc(dateStr)}</div>${this._wx()}
        <div class="chips">${this._sum().active ? `<span class="chip sum">${ic("sun", 16)}Sommermodus${this._sum().out != null ? ` · ${num(this._sum().out, 1)} °C draußen` : ""}</span>` : ""}${(() => { const a = this._wxAdj(); return a && a.d ? `<span class="chip">${ic(a.fr ? "snow" : "partly", 16)}Wetter-Anpassung ${a.d > 0 ? "+" : "−"}${num(Math.abs(a.d), 1)} °C</span>` : ""; })()}${this._pvChip()}<span class="chip">${ic("clock", 16)}${num(sum("day", "min"))} Min. pausiert</span>
          <span class="chip">${ic("radiator", 16)}${paused} von ${rooms.length} ${rooms.length === 1 ? "Raum" : "Räumen"} pausiert</span>
          <span class="chip">${ic("thermo", 16)}${num(sum("day", "kwh"), 1)} kWh Wärme</span></div></div>`,
      presence: () => this._presenceCard(),
      pv: () => this._pvBlock(),
      tiles: () => `<div class="tiles">${tiles.map(([sc, ico, lab, col]) => `<div class="tile" style="--a:${col}">
        <div class="t">${ic(ico, 17)}${lab}</div><div class="v">${num(sum(sc, "min"))}<small>Min.</small></div>
        <div class="g">${ic("flame", 14)}${num(amt(sc), 2)} ${unitOf(F)}</div></div>`).join("")}</div>`,
      chart: () => `<div class="card"><h2>${ic("clock", 18)}Pausenzeit pro Tag · letzte 14 Tage</h2>${this._chart(rooms)}
        <div class="legend">${[...rooms].sort((a, b) => a.ci - b.ci).map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div></div>`,
      rooms: () => this._groupsHtml(rooms),
    };
    // Reihenfolge der Räume im Diagramm = Reihenfolge der Farben, deshalb nach Farbe
    const chartRooms = [...rooms].sort((a, b) => a.ci - b.ci);
    content.chart = () => `<div class="card"><h2>${ic("clock", 18)}Pausenzeit pro Tag · letzte 14 Tage</h2>${this._chart(chartRooms)}
        <div class="legend">${chartRooms.map((r) => `<span><i style="background:${r.color}"></i>${esc(r.name)}</span>`).join("")}</div></div>`;
    const blocks = rooms.length ? this._blockOrder().map((id) => (!content[id]() && !edit ? "" : `<section class="blk ${edit ? "editing" : ""}" data-sort="block" data-id="${id}">
        ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${BLOCKS[id]}</div>` : ""}${content[id]()}</section>`)).join("")
      : `<div class="card empty">Noch keine Räume eingerichtet.<br>${adm ? `<button class="btn2 pri" data-act="wz" style="margin-top:14px;flex:none;padding:12px 22px">${ic("tools", 16)} Einrichtungsassistent starten</button>` : "Ein Administrator kann die Einrichtung starten."}</div>`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b><i class="mn">Modul 1 – </i>Fenster &amp; Heizung</b><span><em class="tag">Smarte Fenster- und Heizungssteuerung</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        ${this._tmBtn()}${this._spnBtn()}${this._labBtn()}${this._stoBtn()}${adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""}${adm ? (edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`) : ""}</div>
      ${this._mdBar()}<div class="wrap">${edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe Karten und Bereiche an den Griffen, um sie zu verschieben. Tippe auf ein Raumsymbol, um Symbol, Farbe und Foto zu ändern. Unter „Darstellung“ stellst du Akzentfarbe und Wetter ein.</div></div>` : ""}
        ${!edit ? this._updBanner() : ""}${!edit ? this._tmHint() : ""}${!edit ? this._labCards("fh") : ""}${blocks}${rooms.length ? `<div class="note">${mixed ? "Bei gemischten Brennstoffen wird die Ersparnis als Heizenergie in kWh gezeigt. Sie ist eine grobe Schätzung." : "Die " + F.noun + " ist eine grobe Schätzung. Die echte Ersparnis liegt etwas darunter."}</div>` : ""}</div>`;
  }

  _build() {
    const sr = this.shadowRoot;
    sr.innerHTML = `<style>${CSS}</style><div id="main"></div><div id="modal"></div><div id="toast"></div>`;
    this._built = true; this._t0 = Date.now();
    /* Ein Klick zählt nur, wenn der Finger oder die Maus auch hier aufgesetzt wurde. So lösen Geisterklicks (zum Beispiel nach dem Antippen der Seitenleiste oder beim Wischen) keine Schaltfläche aus. Tastatur (detail 0) bleibt erlaubt. */
    const sig = (b) => `${b.dataset.act}|${b.dataset.k || ""}|${b.dataset.id || ""}|${b.dataset.i || ""}`;
    sr.addEventListener("pointerdown", (e) => { const b = e.target.closest && e.target.closest("[data-act]"); this._pd = b ? { s: sig(b), t: Date.now() } : null; }, true);
    sr.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (!b) return; if (e.detail !== 0 && !(this._pd && this._pd.s === sig(b) && Date.now() - this._pd.t < 2000)) return; if (b.dataset.act === "mdst" && Date.now() - (this._t0 || 0) < 1200) return; this._act(b.dataset.act, b); });
    /* Wischen auf der Modulleiste soll nicht die Seitenleiste von Home Assistant öffnen. */
    sr.addEventListener("touchstart", (e) => { if (e.target.closest && e.target.closest(".mbar,.rdays,.sxl,.ohint")) e.stopPropagation(); }, { passive: true });
    const hov = (e) => { const c = e.target.closest && e.target.closest(".rchart"); if (!c || !this._repGeo) return; const bb = c.getBoundingClientRect(), g = this._repGeo; this._repHover(Math.min(1439, Math.max(0, ((e.clientX - bb.left) / bb.width * g.W - g.L) / g.iw * 1440))); };
    sr.addEventListener("pointermove", hov); sr.addEventListener("pointerdown", hov);
    const whv = (e) => { const c = e.target.closest && e.target.closest(".wwc2"); if (!c || !this._wwGeo) return; const bb = c.getBoundingClientRect(), g = this._wwGeo; this._wwHover(Math.min(g.total, Math.max(0, ((e.clientX - bb.left) / bb.width * g.W - g.L) / g.iw * g.total))); };
    sr.addEventListener("pointermove", whv); sr.addEventListener("pointerdown", whv);
    const hhov = (e) => { const c = e.target.closest && e.target.closest(".hchart"); if (!c || !this._hrGeo) return; const bb = c.getBoundingClientRect(), g = this._hrGeo; this._hrHover(Math.min(1439, Math.max(0, Math.round((((e.clientX - bb.left) / bb.width) * g.W - g.L) / g.iw * 1440)))); };
    sr.addEventListener("pointermove", hhov); sr.addEventListener("pointerdown", hhov);
    sr.addEventListener("input", (e) => this._onInput(e.target));
    sr.addEventListener("pointerdown", (e) => { const g = e.target.closest("[data-handle]"); if (g) this._dragStart(e, g); });
    sr.addEventListener("input", (e) => { const t = e.target; if (t.dataset && t.dataset.f === "enq") { const q = t.value.trim().toLowerCase(); let n = 0; t.closest(".pkbox").querySelectorAll(".pkrow").forEach((r) => { const ok = !q || r.dataset.s.includes(q); r.hidden = !ok; if (ok) n++; }); const z = t.closest(".pkbox").querySelector(".pkno"); if (z) z.hidden = n > 0; } });
    sr.addEventListener("change", (e) => this._onChange(e.target));
  }

  _onChange(t) {
      if (t.dataset && (t.dataset.f === "vnotify" || t.dataset.f === "vwarn" || t.dataset.f === "vdays" || t.dataset.f === "vbat" || t.dataset.f === "vbatinv")) { const v = { ...this._vcfg() }; if (t.dataset.f === "vbat" || t.dataset.f === "vbatinv") { const bs = { ...(v.batsrc || {}) }, e = t.dataset.e, cur = bs[e] || { src: "", inv: false }; if (t.dataset.f === "vbat") { if (t.value) bs[e] = { src: t.value, inv: t.value.startsWith("binary_sensor.") ? !!cur.inv : false }; else delete bs[e]; } else if (bs[e]) bs[e] = { ...bs[e], inv: t.checked }; v.batsrc = bs; } else if (t.dataset.f === "vnotify") v.notify = t.value; else if (t.dataset.f === "vdays") { const n = Number(String(t.value).replace(",", ".")); v.days = isFinite(n) ? Math.min(60, Math.max(1, Math.round(n))) : 7; } else { const n = Number(String(t.value).replace(",", ".")); v.warn = isFinite(n) ? Math.min(60, Math.max(11, Math.round(n))) : 20; } this._gen.valve = v; this._saveGen(); this._renderModal(); return; }
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("wz") && this._wzChange(t)) return;
      if (t.dataset && t.dataset.f && (t.dataset.f.startsWith("md") || t.dataset.f.startsWith("ww") || t.dataset.f.startsWith("en") || t.dataset.f.startsWith("gs") || t.dataset.f.startsWith("ev")) && this._mdChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("labf_") && this._labChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("ort") && this._ortChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("ig") && this._igChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("wxs") && this._wxsChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("mux") && this._muxChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("lix") && this._lixChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("tgx") && this._tgxChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("hz") && this._hzChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("tm") && this._tmChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("spx") && this._spChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("sfx") && this._sfxChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("wb") && this._wbChange(t)) return;
      if (this._lookChange(t)) return;
      if (t.dataset && t.dataset.k === "htr_steps" && this._modal && this._modal.type === "opt") { this._renderModal(); return; }
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("v") && this._modal && this._modal.type === "vac") { const k = { vfrom: "from", vto: "to", vtime: "preheat_time" }[t.dataset.f]; this._modal.draft[k] = t.value; if (k === "from" && t.value > this._modal.draft.to) this._modal.draft.to = t.value; this._renderModal(); }
      else if (t.dataset && t.dataset.f === "gname" && this._modal) { this._modal.draft.name = t.value; }
      else if (t.dataset && t.dataset.f === "time" && this._modal) { this._modal.draft.entries[+t.dataset.i].time = t.value || "00:00"; this._renderModal(); }
  }
  _onInput(t) { if (t.dataset && t.dataset.f === "hpre" && this._modal && this._modal.type === "opt") { const D = this._modal.draft, a = Array.isArray(D.htr_presets) ? [...D.htr_presets] : []; a[+t.dataset.i] = t.value; D.htr_presets = a; return; } if (t.dataset && t.dataset.f === "oadd" && this._modal && this._modal.type === "opt") { if (t.value) { this._modal.draft[t.dataset.k].push(t.value); this._renderModal(); } return; } if (t.dataset && t.dataset.f === "oval" && this._modal && this._modal.type === "opt") { const D = this._modal.draft; D[t.dataset.k] = t.dataset.num ? (t.value === "" ? "" : Number(t.value)) : t.value; if (t.tagName === "SELECT" || t.dataset.k === "room_area") this._renderModal(); return; } if (t.dataset && t.dataset.f === "gname" && this._modal) this._modal.draft.name = t.value;  }

  /* ---------------- Aktionen ---------------- */
  _act(a, b) {
    const m = this._modal, i = +b.dataset.i, id = b.dataset.id;
    if (a === "menu") this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
    else if (a === "pkopen") { this._pkId = this._pkId === b.dataset.pid ? null : b.dataset.pid; this._renderModal(); const q = this.shadowRoot.querySelector(".pksearch"); if (q) q.focus(); }
    else if (a === "pkpick") { const meta = (this._pkReg || {})[b.dataset.pid]; this._pkId = null; if (meta) { const t = { dataset: { ...meta }, value: b.dataset.v, tagName: "SELECT" }; this._onInput(t); this._onChange(t); } this._renderModal(); }
    else if (a.startsWith("md") || a.startsWith("ww") || a.startsWith("en") || (a.startsWith("gs") && a !== "gsum") || a.startsWith("ev")) this._mdAct(a, b);
    else if (a.startsWith("ort")) this._ortAct(a, b);
    else if (a.startsWith("lab")) this._labAct(a, b);
    else if (a.startsWith("sto")) this._stoAct(a, b);
    else if (a.startsWith("ig")) this._igAct(a, b);
    else if (a.startsWith("wxs")) this._wxsAct(a, b);
    else if (a.startsWith("mux")) this._muxAct(a, b);
    else if (a.startsWith("lix")) this._lixAct(a, b);
    else if (a.startsWith("tgx")) this._tgxAct(a, b);
    else if (a.startsWith("hz")) this._hzAct(a, b);
    else if (a.startsWith("tm") && a !== "tmin") this._tmAct(a, b);
    else if (a.startsWith("spn")) this._spnAct(a, b);
    else if (a.startsWith("spx")) this._spAct(a, b);
    else if (a.startsWith("sfx")) this._sfxAct(a, b);
    else if (a.startsWith("wb")) this._wbAct(a, b);
    else if (["gtog", "gsw", "gmv", "gedit", "gadd", "gpick", "gicon", "gsave", "gdel"].includes(a)) this._gActions(a, b);
    else if (a === "opt") this._optOpen(id);
    else if (a === "oadd") this._nav(HA_PAGE);
    else if (a === "wz") this._wzOpen();
    else if (a === "diag") this._dgOpen(b.dataset.k);
    else if (a.startsWith("dg") && m && m.type === "diag") this._dgAct(a, b);
    else if (a.startsWith("wz") && m && m.type === "wiz") this._wzAct(a, b);
    else if (m && m.type === "opt") this._optAct(a, b);
    else if (a === "rep") this._repOpen(id);
    else if (a === "repday") { m.day = b.dataset.d; m.keepScroll = b.closest(".rdays").scrollLeft; this._repLoad(m).then(() => {}); this._renderModal(); }
    else if (a === "repnav") { const ds = this._repDays(), k = ds.findIndex((x) => x.iso === m.day) + +b.dataset.s; if (ds[k]) { m.day = ds[k].iso; m.keepScroll = this.shadowRoot.querySelector(".rdays")?.scrollLeft; this._repLoad(m).then(() => {}); this._renderModal(); } }
    else if (a === "sw") this._hass.callService("switch", "toggle", { entity_id: b.dataset.sw });
    else if (a === "edit") { this._edit = true; this._render(); }
    else if (a === "done") { this._edit = false; this._render(); }
    else if (a === "view") { try { localStorage.setItem("fh_view", b.dataset.k); } catch (_) { /* Speicher gesperrt */ } this._render(); }
    else if (a === "plan") this._openPlan(id);
    else if (a === "icon") { this._modal = { type: "icon", id }; this._renderModal(); }
    else if (a === "airsetup") { this._optOpen(id).then(() => { if (this._modal && this._modal.type === "opt") { this._modal.open.add("air"); this._renderModal(); } }); }
    else if (a === "hrep") this._hrOpen(id);
    else if (a === "hrepall") { this._modal = { type: "hrepall" }; this._renderModal(); }
    else if (a === "hrday") { m.day = b.dataset.d; this._hrLoad(m); this._renderModal(); }
    else if (a === "gpvpm") { this._gen.pv = { ...this._pv(), [b.dataset.p + "_mode"]: b.dataset.k }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gpvsign") { this._gen.pv = { ...this._pv(), sign: b.dataset.k }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "fhset") { this._modal = { type: "fh" }; this._renderModal(); }
    else if (a === "fhsec") { const s = this._fhOpenSet(); s.has(b.dataset.k) ? s.delete(b.dataset.k) : s.add(b.dataset.k); try { localStorage.setItem("fh-open", JSON.stringify([...s])); } catch (_) {} this._renderModal(); }
    else if (a === "gen") { this._modal = { type: "gen", restore: null }; this._renderModal(); }
    else if (a === "news") { this._modal = { type: "news" }; this._renderModal(); }
    else if (a === "updx") { try { localStorage.setItem("fh_upd_skip", this._upd.latest); } catch (_) { /* egal */ } this._render(); this._toast("Hinweis ausgeblendet bis zur nächsten Version"); }
    else if (a === "skipv") { try { localStorage.setItem("fh_upd_skip", this._upd.latest); } catch (_) { /* egal */ } this._modal = null; this._renderModal(); this._render(); }
    else if (a === "hacs") { this._modal = null; this._renderModal(); this._nav("/hacs"); }
    else if (a === "chk") {
      this._toast("Prüfe auf neue Version …");
      this._hass.callWS({ type: "fenster_heizung/get_update", force: true }).then((u) => {
        this._upd = u || this._upd;
        if (u && u.error) this._toast(`Prüfung nicht möglich: ${u.error}`);
        else this._toast(u && vgt(u.latest, this._ver) ? `Version ${u.latest} ist verfügbar` : `Du hast die neueste Version${this._ver ? " (" + this._ver + ")" : ""}`);
        this._render(); this._renderModal();
      }).catch(() => this._toast("Prüfung nicht möglich"));
    }
    else if (a === "gupd") { this._gen.updates = this._gen.updates === false; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gsum") { this._gen.summer = { ...this._gen.summer, mode: b.dataset.k }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gdays") { this._gen.summer = { ...this._gen.summer, days: Number(b.dataset.k) }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "gwx") { this._gen.wxadj = { ...this._gen.wxadj, on: !this._gen.wxadj.on }; this._saveGen(); this._render(); this._renderModal(); }
    else if (a === "bk") this._backup();
    else if (a === "rs") { const f = this.shadowRoot.querySelector('input[data-f="rsfile"]'); if (f) f.click(); }
    else if (a === "rsno") { this._modal.restore = null; this._renderModal(); }
    else if (a === "rsgo") this._restore();
    else if (a === "my") { this._modal = { type: "my" }; this._renderModal(); }
    else if (a === "mytog") { const x = this._my(); x.on = !x.on; this._mySet(x); this._render(); this._renderModal(); }
    else if (a === "myvis") { const x = this._my(), id = b.dataset.id; x.hidden = x.hidden.includes(id) ? x.hidden.filter((i) => i !== id) : [...x.hidden, id]; x.on = true; this._mySet(x); this._render(); this._renderModal(); }
    else if (a === "myblk") { const x = this._my(), id = b.dataset.id; x.hb = x.hb.includes(id) ? x.hb.filter((i) => i !== id) : [...x.hb, id]; x.on = true; this._mySet(x); this._render(); this._renderModal(); }
    else if (a === "mymv") { const x = this._my(), ids = this._collect(true).map((r) => r.id), cur = x.order.length ? [...x.order.filter((i) => ids.includes(i)), ...ids.filter((i) => !x.order.includes(i))] : ids, i = cur.indexOf(b.dataset.id), j = i + Number(b.dataset.d); if (i >= 0 && j >= 0 && j < cur.length) { [cur[i], cur[j]] = [cur[j], cur[i]]; x.order = cur; x.on = true; this._mySet(x); this._render(); this._renderModal(); } }
    else if (a === "myreset") { this._mySet({ on: false, hidden: [], order: [], hb: [] }); this._render(); this._renderModal(); }
    else if (a === "look") { this._modal = { type: "look" }; this._renderModal(); }
    else if (a === "lacc") { this._cfg.layout.accent = b.dataset.k || ""; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "hmode") { const hc = this._heroCfg(); this._cfg.layout.hero = { mode: b.dataset.k, own: hc.own }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "hup") { this._heroTarget = b.dataset.k; const inp = this.shadowRoot.querySelector("[data-f=hfile]"); if (inp) inp.click(); }
    else if (a === "hdel") { const hc = this._heroCfg(), own = { ...hc.own }; delete own[b.dataset.k]; this._cfg.layout.hero = { mode: hc.mode, own }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "lwx") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), on: !this._wxCfg().on }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "rcol") { const c = { ...(this._cfg.layout.colors || {}) }; if (b.dataset.k) c[m.id] = b.dataset.k; else delete c[m.id]; this._cfg.layout.colors = c; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "rphoto") { const f = this.shadowRoot.querySelector('[data-f="rfile"]'); if (f) f.click(); }
    else if (a === "rphotodel") { const c = { ...(this._cfg.layout.photos || {}) }; delete c[m.id]; this._cfg.layout.photos = c; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "close") { this._modal = null; this._renderModal(); }
    else if (a === "pick") { this._cfg.layout.icons = { ...(this._cfg.layout.icons || {}), [m.id]: b.dataset.k }; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "preset") { const ic2 = { ...(this._cfg.layout.icons || {}) }; delete ic2[m.id]; this._cfg.layout.icons = ic2; this._saveLayout(); this._render(); this._renderModal(); }
    else if (a === "why") { this._modal = { type: "why", id }; this._renderModal(); }
    else if (a === "pm") {
      const p = this._pres();
      if (b.dataset.k === "vacation" && !(p.from && p.to)) { this._act("vac", b); return; }
      this._cfg.presence = { ...p, mode: b.dataset.k, origin: "manual" }; this._savePresence(); this._render();
    }
    else if (a === "vac") {
      const p = this._pres(), all = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      this._modal = { type: "vac", draft: { ...p, from: p.from || this._isoDay(0), to: p.to || this._isoDay(7), persons: p.persons.length ? [...p.persons] : all } }; this._renderModal();
    }
    else if (a === "pset") {
      const p = this._pres(), all = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      this._modal = { type: "pset", draft: { ...p, persons: p.persons.length ? [...p.persons] : all } }; this._renderModal();
    }
    else if (m && (m.type === "vac" || m.type === "pset")) {
      const d = m.draft;
      if (a === "vtm") d.temp = Math.max(5, d.temp - 0.5);
      else if (a === "vtp") d.temp = Math.min(25, d.temp + 0.5);
      else if (a === "vpre") d.preheat = !d.preheat;
      else if (a === "vauto") d.auto = !d.auto;
      else if (a === "vawm") d.away_after = Math.max(15, d.away_after - 15);
      else if (a === "vawp") d.away_after = Math.min(120, d.away_after + 15);
      else if (a === "vper") { const e = b.dataset.e; d.persons = d.persons.includes(e) ? d.persons.filter((x) => x !== e) : [...d.persons, e]; }
      else if (a === "psetsave") {
        this._cfg.presence = { ...this._pres(), temp: d.temp, auto: d.auto, away_after: d.away_after, persons: d.persons }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Einstellungen gespeichert"); return;
      }
      else if (a === "vsave") {
        if (!d.from || !d.to || d.to < d.from) { this._toast("Bitte ein gültiges Datum wählen"); return; }
        this._cfg.presence = { ...d, mode: "vacation", origin: "manual" }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Urlaub gespeichert"); return;
      }
      this._renderModal();
    }
    else if (m && m.type === "plan") {
      const d = m.draft;
      if (a === "penable") d.enabled = !d.enabled;
      else if (a === "pday") m.day = m.day === +b.dataset.d ? null : +b.dataset.d;
      else if (a === "pdc") { const e = d.entries[i], k = +b.dataset.d; e.days = e.days.includes(k) ? e.days.filter((x) => x !== k) : [...e.days, k].sort(); }
      else if (a === "tmin") d.entries[i].temp = Math.max(5, Math.round((d.entries[i].temp - 0.5) * 2) / 2);
      else if (a === "tplus") d.entries[i].temp = Math.min(30, Math.round((d.entries[i].temp + 0.5) * 2) / 2);
      else if (a === "pdel") d.entries.splice(i, 1);
      else if (a === "pmode") d.mode = b.dataset.k;
      else if (a === "pdq") d.entries[i].days = { wk: [0, 1, 2, 3, 4], we: [5, 6], all: [0, 1, 2, 3, 4, 5, 6] }[b.dataset.q];
      else if (a === "pdup") d.entries.splice(i + 1, 0, { ...d.entries[i], days: [...d.entries[i].days], id: this._uid() });
      else if (a === "padd") d.entries.push({ id: this._uid(), days: [0, 1, 2, 3, 4], time: "06:00", temp: 21 });
      else if (a === "ptpl") d.entries = TEMPLATE.map((e) => ({ ...e, id: this._uid() }));
      else if (a === "psave") return this._savePlan();
      this._renderModal();
    }
  }
  _nav(path) {
    try { history.pushState(null, "", path); window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } })); } catch (_) { location.href = path; }
  }
  async _optOpen(id) {
    if (!this._admin()) return;
    let res;
    try { res = await this._hass.callWS({ type: "fenster_heizung/get_options", entry_id: id }); } catch (_) { this._toast("Einstellungen konnten nicht geladen werden"); return; }
    const o = (res && res.options) || {};
    const d = { window_sensors: [], thermostats: [], open_delay: 60, close_delay: 30, action: "off", setback_temp: 12, heating_entity: "", heating_off_states: "off", outdoor_sensor: "", outdoor_max_temp: 15, block_from: "", block_to: "", notify_service: [], notify_after: 0, notify_title: "", notify_message: "", fuel: "erdgas", energy_per_unit: "", cop: 3.5, room_area: 0, heat_load_w_m2: 60, design_temp: -12, heat_power_kw: 1, humidity_sensor: "", air_hint: "on", weather_adj: "on", air_every: 8, htr_on: "off", htr_entity: "", htr_watt: 1500, htr_target: 22, htr_prio: 5, htr_steps: "", htr_thermo: "off", htr_auto: "on", htr_presets: [], htr_devtemp: "max", htr_from: "", htr_to: "" };
    for (const k of Object.keys(d)) if (o[k] !== undefined && o[k] !== null) d[k] = Array.isArray(o[k]) ? [...o[k]] : o[k];
    if (Array.isArray(d.htr_steps)) d.htr_steps = d.htr_steps.join(", ");
    this._modal = { type: "opt", id, name: (res && res.name) || "", draft: d, open: new Set(["dev", "ctl"]), busy: false };
    this._renderModal();
  }
  async _optAct(a, b) {
    const m = this._modal, d = m.draft, k = b.dataset.k;
    if (a === "close") { this._modal = null; this._renderModal(); return; }
    else if (a === "osec") { m.open.has(k) ? m.open.delete(k) : m.open.add(k); }
    else if (a === "oset") d[k] = b.dataset.v;
    else if (a === "orm") d[k] = d[k].filter((x) => x !== b.dataset.e);
    else if (a === "oclr") d[k] = "";
    else if (a === "ohost" || a === "odel") { this._modal = null; this._renderModal(); this._nav(HA_PAGE); return; }
    else if (a === "osave") {
      if (m.busy) return;
      m.busy = true; this._renderModal();
      try {
        await this._hass.callWS({ type: "fenster_heizung/set_options", entry_id: m.id, options: d });
        this._modal = null; this._renderModal(); this._toast("Einstellungen gespeichert");
        setTimeout(() => this._load && this._load(), 2500);
      } catch (e) { m.busy = false; this._toast((e && e.message) || "Speichern fehlgeschlagen"); this._renderModal(); }
      return;
    }
    this._renderModal();
  }
  _optBody(m) {
    const d = m.draft, st = this._hass.states, ent = (dom, cls) => Object.keys(st).filter((e) => e.startsWith(dom + ".") && (!cls || st[e].attributes.device_class === cls));
    const notify = Object.keys((this._hass.services && this._hass.services.notify) || {}).filter((n) => !["send_message", "reload"].includes(n)).map((n) => "notify." + n).sort();
    const fn = (e) => esc((st[e] && st[e].attributes.friendly_name) || e);
    const usedTh = new Set(this._collect(true).flatMap((r) => r.thermos || []));
    const row = (label, hint, ctl) => `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const num = (k, unit, o = {}) => row(o.l, o.h, `<span class="onum"><input type="number" inputmode="decimal" data-f="oval" data-k="${k}" data-num="1" value="${d[k]}" min="${o.min ?? ""}" max="${o.max ?? ""}" step="${o.step ?? 1}" ${o.ph ? `placeholder="${o.ph}"` : ""}><i>${unit}</i></span>`);
    const txt = (k, o = {}) => row(o.l, o.h, `<input class="otxt" data-f="oval" data-k="${k}" value="${esc(d[k])}">`);
    const time = (k, o) => row(o.l, o.h, `<span class="onum"><input type="time" data-f="oval" data-k="${k}" value="${d[k] || ""}">${d[k] ? `<button class="oclr" data-act="oclr" data-k="${k}" aria-label="Zurücksetzen">${ic("close", 14)}</button>` : ""}</span>`);
    const seg = (k, opts) => `<div class="seg oseg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="oset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const multi = (k, cand, l, h) => row(l, h, `<div class="ochips">${d[k].map((e) => `<span class="och">${fn(e)}<button data-act="orm" data-k="${k}" data-e="${esc(e)}" aria-label="Entfernen">${ic("close", 12)}</button></span>`).join("")}${this._wzSel(cand.filter((e) => !d[k].includes(e)), "", "oadd", `data-k="${k}"`, "＋ hinzufügen")}</div>`);
    const one = (k, cand, l, h) => { const c = d[k] && !cand.includes(d[k]) ? [d[k], ...cand] : cand; return row(l, h, this._wzSel(c, d[k], "oval", `data-k="${k}"`, "– keine –")); };
    const FU = { erdgas: ["Erdgas", "m³", 10], heizoel: ["Heizöl", "l", 10], fluessiggas: ["Flüssiggas", "l", 6.6], pellets: ["Pellets", "kg", 4.8], strom: ["Wärmepumpe / Strom", "kWh", 1] }, fu = FU[d.fuel] || FU.erdgas;
    const sec = (id, ic2, title, sum, body) => `<section class="osec ${m.open.has(id) ? "open" : ""}"><button class="oh" data-act="osec" data-k="${id}" aria-expanded="${m.open.has(id)}"><span class="oi">${ic(ic2, 18)}</span><div><b>${title}</b><span>${sum}</span></div>${ic("chev", 18)}</button>${m.open.has(id) ? `<div class="ob">${body}</div>` : ""}</section>`;
    const A = d.action === "setback" ? `Absenken auf ${num0(d.setback_temp)} °C` : "Thermostat aus";
    return [
      sec("dev", "window", "Fenster &amp; Thermostate", `${d.window_sensors.length} Fenster · ${d.thermostats.length} Thermostat${d.thermostats.length === 1 ? "" : "e"}`,
        multi("window_sensors", ent("binary_sensor"), "Fenstersensoren") + multi("thermostats", ent("climate"), "Heizungsthermostate") + this._hsRoomNote(d.thermostats)),
      sec("ctl", "radiator", "Regelung", `${d.open_delay} s auf · ${d.close_delay} s zu · ${A}`,
        num("open_delay", "s", { l: "Verzögerung nach Öffnen", h: "So lange muss das Fenster offen sein, bevor die Heizung pausiert.", min: 0, max: 3600, step: 5 }) +
        num("close_delay", "s", { l: "Verzögerung nach Schließen", min: 0, max: 3600, step: 5 }) +
        row("Aktion bei offenem Fenster", "", seg("action", [["off", "Thermostat aus"], ["setback", "Absenken"]])) +
        (d.action === "setback" ? num("setback_temp", "°C", { l: "Absenktemperatur", min: 5, max: 25, step: 0.5 }) : "") +
        one("heating_entity", ent("climate").concat(ent("binary_sensor"), ent("sensor"), ent("switch"), ent("input_boolean"), ent("input_select"), ent("select")), "Heizungs-Sensor (optional)", "Steht er auf einem „Heizung aus“-Zustand, wird nicht geregelt.") +
        txt("heating_off_states", { l: "Zustände für „Heizung aus“", h: "Komma getrennt, z. B. off" })),
      sec("cond", "clock", "Bedingungen", `${d.block_from && d.block_to ? "Sperrzeit " + d.block_from + "–" + d.block_to : "keine Sperrzeit"} · unter ${num0(d.outdoor_max_temp)} °C`,
        time("block_from", { l: "Sperrzeit von", h: "In dieser Zeit wird nicht geregelt, z. B. nachts." }) + time("block_to", { l: "Sperrzeit bis" }) +
        one("outdoor_sensor", ent("sensor", "temperature"), "Außentemperatursensor (optional)") +
        num("outdoor_max_temp", "°C", { l: "Nur regeln, wenn draußen kälter als", min: -20, max: 40, step: 0.5 })),
      sec("note", "info", "Erinnerung", d.notify_service.length ? `nach ${d.notify_after} Min. an ${d.notify_service.length} Gerät${d.notify_service.length === 1 ? "" : "e"}` : "aus",
        multi("notify_service", notify, "Benachrichtigungs-Aktionen", "Wie in den Entwicklerwerkzeugen, z. B. notify.mobile_app_handy.") +
        num("notify_after", "min", { l: "Erinnerung nach … Minuten offen", h: "0 = aus", min: 0, max: 240, step: 1 }) +
        txt("notify_title", { l: "Titel (optional)", h: "Platzhalter: {raum}, {minuten}, {fenster}" }) + txt("notify_message", { l: "Nachrichtentext" })),
      sec("air", "drop", "Raumluft", d.humidity_sensor ? fn(d.humidity_sensor) : `ohne Sensor${Number(d.air_every) > 0 ? ` · Lüften nach ${d.air_every} Std.` : ""}`,
        one("humidity_sensor", ent("sensor", "humidity"), "Luftfeuchte-Sensor", "Mit Sensor zeigt die Karte Luftfeuchte, Taupunkt und Schimmelrisiko. Ohne Sensor gibt es Lüftungs-Erinnerung, Wandtemperatur und kritische Feuchte.") +
        num("air_every", "Std.", { l: "Erinnern, wenn länger nicht gelüftet", h: "0 = aus. Gemessen am letzten Schließen des Fensters.", min: 0, max: 48, step: 1 }) +
        row("Lüftungshinweise und Schimmelwarnung", "Auf der Karte und als Erinnerung nach dem Lüften.", seg("air_hint", [["on", "An"], ["off", "Aus"]]))),
      sec("wxa", "partly", "Wetter-Anpassung", d.weather_adj === "off" ? "ausgenommen" : "folgt der allgemeinen Einstellung",
        row("Zieltemperatur nach Wetter anpassen", "Die Grenzwerte stellst du unter „Allgemein“ ein.", seg("weather_adj", [["on", "Ja"], ["off", "Ausnehmen"]]))),
      sec("htr", "bolt", "Elektroheizer", d.htr_on === "on" ? `${parseSteps(d.htr_steps).length > 1 ? parseSteps(d.htr_steps).length + " Stufen bis " + wfmt(parseSteps(d.htr_steps).slice(-1)[0]) : wfmt(parseSteps(d.htr_steps)[0] || d.htr_watt)} · bis ${d.htr_target} °C` : "nicht aktiviert",
        row("Elektroheizer in diesem Raum", "Heizt nur bei genug PV-Überschuss. Die Karte zeigt Status und Bericht.", seg("htr_on", [["off", "Aus"], ["on", "An"]])) +
        (d.htr_on === "on" ? one("htr_entity", ent("switch").concat(ent("climate").filter((e) => !usedTh.has(e) || e === d.htr_entity)), "Schalter oder Gerät des Heizers", "Ein Schalter oder ein Klima-Gerät. Thermostate der Räume stehen hier nicht zur Auswahl.") +
          txt("htr_steps", { l: "Leistungsstufen in Watt", h: "Falls der Heizer Stufen hat, z. B. 800, 1200, 1800. Leer = eine Stufe mit der Leistung unten." }) +
          (parseSteps(d.htr_steps).length ? `<div class="stpv">${parseSteps(d.htr_steps).map((w, i) => `<span><b>${i + 1}</b>${wfmt(w)}</span>`).join("")}</div>` : num("htr_watt", "W", { l: "Leistung des Heizers", h: "Nennleistung laut Typenschild.", min: 50, max: 5000, step: 50 })) +
          this._presetRows(d, st, row) +
          (parseSteps(d.htr_steps).length > 1 ? row("Stufen regeln", "Automatisch: höhere Stufe bei mehr Überschuss, niedrigere bei weniger. Fest: nur die höchste Stufe.", seg("htr_auto", [["on", "Automatisch"], ["off", "Fest"]])) : "") +
          row("Thermostat während des Heizers", "Aus = die Heizkörper-Thermostate des Raums werden abgestellt, solange der Heizer läuft. Danach regeln sie wieder.", seg("htr_thermo", [["off", "Ausschalten"], ["on", "Weiterlaufen"]])) +
          num("htr_target", "°C", { l: "Heizen bis", h: "Der Heizer schaltet ab, sobald der Raum so warm ist.", min: 10, max: 30, step: 0.5 }) +
          num("htr_prio", "", { l: "Priorität", h: "1 wird zuerst versorgt, wenn der Überschuss nicht für alle reicht.", min: 1, max: 9, step: 1 }) +
          time("htr_from", { l: "Erlaubt ab", h: "Optional. Leer = ganztägig." }) + time("htr_to", { l: "Erlaubt bis" }) : "")),
      sec("fuel", "flame", "Brennstoff &amp; Ersparnis", `${fu[0]} · ${d.energy_per_unit || fu[2]} kWh/${fu[1]}${Number(d.room_area) > 0 ? " · " + d.room_area + " m²" : ""}`,
        row("Brennstoff", "Bestimmt Einheit und Beschriftung im Dashboard.", `<select class="osel" data-f="oval" data-k="fuel">${Object.entries(FU).map(([v, x]) => `<option value="${v}" ${d.fuel === v ? "selected" : ""}>${x[0]} (${x[1]})</option>`).join("")}</select>`) +
        num("energy_per_unit", "kWh/" + fu[1], { l: "Energie pro Einheit", h: "Leer = Standard des Brennstoffs.", min: 0, max: 40, step: 0.1, ph: String(fu[2]) }) +
        (d.fuel === "strom" ? num("cop", "", { l: "Jahresarbeitszahl JAZ / COP", h: "Nur Wärmepumpe.", min: 1, max: 8, step: 0.1 }) : "") +
        num("room_area", "m²", { l: "Raumfläche", h: "Größer als 0: Heizleistung wird berechnet. 0 = feste Leistung.", min: 0, max: 300, step: 0.5 }) +
        (Number(d.room_area) > 0 ? num("heat_load_w_m2", "W/m²", { l: "Spezifische Heizlast", h: "Neubau ca. 40, saniert ca. 60, Altbau ca. 100.", min: 10, max: 250, step: 1 }) + num("design_temp", "°C", { l: "Auslegungs-Außentemperatur", min: -30, max: 5, step: 0.5 }) : num("heat_power_kw", "kW", { l: "Feste Heizleistung des Raums", min: 0.1, max: 30, step: 0.1 }))),
    ].join("");
  }
  _uid() { return "e" + Math.random().toString(36).slice(2, 8); }
  _openPlan(id) {
    if (!this._admin()) return;
    const p0 = this._cfg.plans[id] || { enabled: true, entries: [] }, pr = this._collect().find((x) => x.id === id), p = { ...p0, enabled: pr && pr.planOn !== undefined ? pr.planOn : p0.enabled };
    const draft = { mode: p.mode || "heat", enabled: p.entries.length ? p.enabled : true, entries: p.entries.map((e) => ({ ...e, days: [...e.days], id: e.id || this._uid() })) };
    this._modal = { type: "plan", id, draft, day: Math.floor(nowMin() / 1440) };
    this._renderModal();
  }
  async _savePlan() {
    const m = this._modal, entries = m.draft.entries.filter((e) => e.days.length);
    entries.sort((a, b) => Math.min(...a.days) - Math.min(...b.days) || toMin(a.time) - toMin(b.time));
    const plan = { enabled: m.draft.enabled && entries.length > 0, entries };
    try {
      await this._hass.callWS({ type: "fenster_heizung/set_plan", entry_id: m.id, enabled: plan.enabled, entries, mode: m.draft.mode });
      this._cfg.plans[m.id] = { ...plan, mode: m.draft.mode }; this._modal = null; this._renderModal(); this._render(); this._toast("Heizplan gespeichert");
    } catch (e) { this._toast("Heizplan konnte nicht gespeichert werden"); }
  }

  /* ---------------- Einrichtungsassistent ---------------- */
  _wzOpen() {
    const pv = { ...PVDEF, ...(this._gen.pv || {}) }, sm = this._gen.summer || {};
    this._modal = { type: "wiz", step: 0, busy: false, done: null, draft: { rooms: [], open_delay: 60, close_delay: 30, action: "off", setback_temp: 12, summer: sm.mode || "auto", fuel: "erdgas", outdoor: "", wx: !!(this._gen.wxadj || {}).on, pvon: !!pv.sensor, pv, notify: "", notify_after: 0 } };
    this._renderModal();
  }
  _wzFind() {
    const H = this._hass, st = H.states || {}, ids = Object.keys(st), dc = (e) => (st[e].attributes || {}).device_class || "";
    const area = (e) => { const en = (H.entities || {})[e]; if (!en) return ""; if (en.area_id) return en.area_id; const dv = en.device_id && (H.devices || {})[en.device_id]; return (dv && dv.area_id) || ""; };
    const win = ids.filter((e) => e.startsWith("binary_sensor.") && ["window", "door", "opening", "garage_door"].includes(dc(e))), cl = ids.filter((e) => e.startsWith("climate.") && !((H.entities || {})[e] || {}).platform?.includes?.("fenster_heizung"));
    const hum = ids.filter((e) => e.startsWith("sensor.") && dc(e) === "humidity"), tmp = ids.filter((e) => e.startsWith("sensor.") && dc(e) === "temperature");
    const sw = ids.filter((e) => e.startsWith("switch.") || e.startsWith("climate.") || e.startsWith("input_boolean."));
    const notify = Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).map((n) => "notify." + n).sort();
    const have = new Set(this._collect().map((r) => (r.name || "").toLowerCase())), groups = {};
    for (const e of [...win, ...cl]) { const a = area(e); if (a) (groups[a] = groups[a] || { w: [], c: [] })[e.startsWith("climate.") ? "c" : "w"].push(e); }
    const sug = Object.entries(groups).filter(([, g]) => g.w.length && g.c.length).map(([a, g]) => ({ name: ((H.areas || {})[a] || {}).name || a, windows: g.w, thermos: g.c })).filter((s) => !have.has(s.name.toLowerCase()));
    return { win, cl, hum, tmp, sw, notify, sug };
  }
  _wzName(e) { const s = this._hass.states[e]; return (s && s.attributes.friendly_name) || e; }
  _wzSel(opts, cur, f, extra = "", none = "– keiner –", hint = null) {
    const st = this._hass.states, id = f + "|" + extra, open = this._pkId === id, meta = { f };
    extra.replace(/data-([a-z]+)="([^"]*)"/g, (_, a, v) => { meta[a] = v.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"); });
    (this._pkReg = this._pkReg || {})[id] = meta;
    const h = hint || PK_HINT[meta.k] || null, val = (e) => { const x = st[e]; return x ? `${esc(x.state)}${x.attributes.unit_of_measurement ? " " + esc(x.attributes.unit_of_measurement) : ""}` : "nicht verfügbar"; };
    const btn = `<button class="pkbtn ${cur ? "set" : ""}" data-act="pkopen" data-pid="${esc(id)}" aria-expanded="${open}"><span class="pkt">${cur ? `<b>${esc(this._wzName(cur))}</b><small>${esc(cur)} · ${val(cur)}</small>` : `<span class="mut">${esc(none)}</span>`}</span>${ic(open ? "close" : "pencil", 16)}</button>`;
    if (!open) return btn;
    const all = [...new Set([...opts, ...(cur && !opts.includes(cur) ? [cur] : [])])], sc = (e) => (h && (h.test(e) || h.test(this._wzName(e))) ? 0 : 1);
    all.sort((a, b) => sc(a) - sc(b) || this._wzName(a).localeCompare(this._wzName(b), "de"));
    return btn + `<div class="pkbox"><input class="pksearch" data-f="enq" type="search" placeholder="Suchen: Name oder Entity-ID" autocomplete="off">
      <div class="pklist">${/add$/.test(f) ? "" : `<button class="pkrow pkclr" data-act="pkpick" data-pid="${esc(id)}" data-v="" data-s="">${esc(none)}</button>`}
      ${all.map((e) => `<button class="pkrow ${e === cur ? "cur" : ""}" data-act="pkpick" data-pid="${esc(id)}" data-v="${esc(e)}" data-s="${esc((this._wzName(e) + " " + e).toLowerCase())}"><span><b>${esc(this._wzName(e))}</b><small>${esc(e)}</small></span><span class="pkv">${h && sc(e) === 0 ? "<i>Passt</i>" : ""}${val(e)}</span></button>`).join("")}
      <div class="pkno" hidden>Keine passende Entität gefunden.</div></div></div>`;
  }
  _wzRate(d, k, label, F) {
    const p = d.pv, ent = p[k + "_mode"] === "entity", sn = p[k + "_sensor"], opts = Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "monetary" || (/(kwh|wh)$/i.test(this._hass.states[e].attributes.unit_of_measurement || "") && /€|eur|ct|cent/i.test(this._hass.states[e].attributes.unit_of_measurement || ""))));
    return `<div class="mut sm" style="margin:8px 0 0">${label}</div>
      <div class="seg">${[["fix", "Festwert"], ["entity", "Entität"]].map(([m, t]) => `<button class="${(ent ? "entity" : "fix") === m ? "sel" : ""}" data-act="wzrm" data-p="${k}" data-k="${m}">${t}</button>`).join("")}</div>
      ${ent ? this._wzSel(opts, sn, "wzv", `data-k="pv.${k}_sensor"`) : `<div class="of"><div class="ol"><b>${F}</b></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="wzv" data-num="1" data-k="pv.${k}" value="${p[k]}" min="0" max="100" step="0.01"><i>ct/kWh</i></span></div></div>`}`;
  }
  _wzSet(path, val) { const d = this._modal.draft, ks = path.split("."); let o = d; for (const k of ks.slice(0, -1)) o = o[k]; o[ks[ks.length - 1]] = val; }
  _wzChange(t) {
    const m = this._modal, f = t.dataset.f; if (!m || m.type !== "wiz") return false;
    if (f === "wzv") { let v = t.value; if (t.dataset.num) { v = Number(String(v).replace(",", ".")); v = isFinite(v) ? Math.max(0, Math.round(v * 100) / 100) : 0; } this._wzSet(t.dataset.k, v); this._renderModal(); return true; }
    if (f === "wzr") { m.draft.rooms[+t.dataset.i][t.dataset.k] = t.value; if (t.dataset.k === "heater") this._renderModal(); return true; }
    if (f === "wzadd") { const r = m.draft.rooms[+t.dataset.i], k = t.dataset.k; if (t.value && !r[k].includes(t.value)) r[k].push(t.value); this._renderModal(); return true; }
    return false;
  }
  _wzAct(a, b) {
    const m = this._modal, d = m.draft, i = +b.dataset.i, F = this._wzFind();
    if (a === "wznext") { m.step = Math.min(WZ_STEPS.length - 1, m.step + 1); }
    else if (a === "wzback") { m.step = Math.max(0, m.step - 1); }
    else if (a === "wzgo") { m.step = +b.dataset.k; }
    else if (a === "wzsug") { const s = F.sug[i]; if (s && !d.rooms.some((r) => r.name === s.name)) d.rooms.push({ name: s.name, windows: [...s.windows], thermos: [...s.thermos], hum: "", heater: "", steps: "" }); }
    else if (a === "wzsugall") { for (const s of F.sug) if (!d.rooms.some((r) => r.name === s.name)) d.rooms.push({ name: s.name, windows: [...s.windows], thermos: [...s.thermos], hum: "", heater: "", steps: "" }); }
    else if (a === "wzroom") { d.rooms.push({ name: "", windows: [], thermos: [], hum: "", heater: "", steps: "" }); }
    else if (a === "wzdel") { d.rooms.splice(i, 1); }
    else if (a === "wzrm") { if (b.dataset.e) { const r = d.rooms[i]; r[b.dataset.k] = r[b.dataset.k].filter((x) => x !== b.dataset.e); } else d.pv[b.dataset.p + "_mode"] = b.dataset.k; }
    else if (a === "wzact") { d.action = b.dataset.k; }
    else if (a === "wzsum") { d.summer = b.dataset.k; }
    else if (a === "wzpvon") { d.pvon = !d.pvon; }
    else if (a === "wzsign") { d.pv.sign = b.dataset.k; }
    else if (a === "wzwx") { d.wx = !d.wx; }
    else if (a === "wzapply") { this._wzApply(); return; }
    else if (a === "wzclose") { this._modal = null; this._renderModal(); this._load(); return; }
    this._renderModal();
  }
  _wzValid(d) { return d.rooms.filter((r) => r.name.trim() && r.windows.length && r.thermos.length); }
  async _wzApply() {
    const m = this._modal, d = m.draft, rooms = this._wzValid(d), out = []; m.busy = true; m.step = WZ_STEPS.length - 1; this._renderModal();
    const H = this._hass, steps = (s) => String(s || "").split(/[,;\s]+/).map(Number).filter((n) => n > 0);
    for (const r of rooms) {
      try {
        const fl = await H.callApi("POST", "config/config_entries/flow", { handler: "fenster_heizung", show_advanced_options: false });
        const res = await H.callApi("POST", "config/config_entries/flow/" + fl.flow_id, { name: r.name.trim(), window_sensors: r.windows, thermostats: r.thermos, open_delay: d.open_delay, close_delay: d.close_delay, action: d.action, setback_temp: d.setback_temp, fuel: d.fuel, ...(d.outdoor ? { outdoor_sensor: d.outdoor } : {}), ...(d.notify ? { notify_service: [d.notify], notify_after: d.notify_after } : {}) });
        if (res.type !== "create_entry") throw new Error(res.reason || "Abbruch");
        const id = typeof res.result === "string" ? res.result : res.result && res.result.entry_id, extra = {};
        if (id && r.hum) extra.humidity_sensor = r.hum;
        if (id && d.pvon && r.heater) Object.assign(extra, { htr_on: "on", htr_entity: r.heater, ...(steps(r.steps).length ? { htr_steps: steps(r.steps).join(", ") } : {}) });
        if (id && Object.keys(extra).length) { const o = await H.callWS({ type: "fenster_heizung/get_options", entry_id: id }); await H.callWS({ type: "fenster_heizung/set_options", entry_id: id, options: { ...((o && o.options) || {}), ...extra } }); }
        out.push([r.name, true, ""]);
      } catch (e) { out.push([r.name, false, (e && (e.message || e.body?.message)) || "Fehler"]); }
    }
    try {
      const pv = d.pvon ? d.pv : { ...this._pv(), sensor: "" };
      this._gen = { ...this._gen, summer: { ...this._gen.summer, mode: d.summer }, wxadj: { ...this._gen.wxadj, on: d.wx }, pv: { ...this._pv(), ...pv } };
      await this._saveGen();
    } catch (_) { out.push(["Allgemeine Einstellungen", false, "nicht gespeichert"]); }
    m.busy = false; m.done = out; this._renderModal();
  }
  _wzBody(m) {
    const d = m.draft, F = this._wzFind(), s = m.step, ex = this._collect();
    const chips = (r, i, k, list) => `<div class="wzch">${list.map((e) => `<span class="wzc">${esc(this._wzName(e))}<button data-act="wzrm" data-i="${i}" data-k="${k}" data-e="${esc(e)}" aria-label="Entfernen">${ic("close", 12)}</button></span>`).join("")}</div>`;
    const num = (label, hint, key, unit, lo, hi, st) => `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="wzv" data-num="1" data-k="${key}" value="${key.split(".").reduce((o, k) => o[k], d)}" min="${lo}" max="${hi}" step="${st}"><i>${unit}</i></span></div></div>`;
    if (m.done) return `<div class="wzhero ok">${ic("check", 34)}</div><h3 class="wzt">Einrichtung abgeschlossen</h3>
      ${m.done.map(([n, ok, err]) => `<div class="wzres ${ok ? "ok" : "bad"}">${ic(ok ? "check" : "alert", 16)}<b>${esc(n)}</b><span>${ok ? "eingerichtet" : esc(err)}</span></div>`).join("") || `<div class="mut">Es wurden keine neuen Räume angelegt.</div>`}
      <div class="mut sm" style="margin-top:10px">Heizpläne, Anwesenheit und Darstellung stellst du danach im Dashboard ein. Diesen Assistenten findest du jederzeit unter „Allgemein“.</div>`;
    if (s === 0) return `<div class="wzhero">${ic("windowOpen", 34)}</div><h3 class="wzt">Willkommen</h3>
      <div class="mut" style="margin-bottom:10px">In wenigen Schritten richtest du Räume, Fenstermeldung, Heizung und optional PV-Elektroheizer ein. Du kannst jeden Schritt überspringen und später alles ändern.</div>
      <div class="gbox"><b>Das hat der Assistent gefunden</b>${F.cl.length} Thermostate · ${F.win.length} Fenster- und Türsensoren · ${F.hum.length} Luftfeuchte-Sensoren${F.sug.length ? `<br>${F.sug.length} Räume lassen sich aus deinen Bereichen vorschlagen.` : ""}</div>
      <div class="mut sm">${ex.length ? `Bereits eingerichtet: ${ex.length} ${ex.length === 1 ? "Raum" : "Räume"}. Sie bleiben unverändert.` : "Es ist noch kein Raum eingerichtet."}</div>`;
    if (s === 1) return `<h3 class="wzt">Räume</h3><div class="mut sm" style="margin-bottom:8px">Ein Raum braucht mindestens einen Fenstersensor und ein Thermostat.</div>
      ${ex.length ? `<div class="wzex">${ex.map((r) => `<span class="wzc ok">${ic("check", 12)}${esc(r.name)}</span>`).join("")}</div>` : ""}
      ${F.sug.length ? `<div class="lsec">${ic("home", 15)}Vorschläge aus deinen Bereichen</div>${F.sug.map((x, i) => { const on = d.rooms.some((r) => r.name === x.name); return `<div class="wzs"><div><b>${esc(x.name)}</b><span>${x.windows.length} Fenster · ${x.thermos.length} Thermostat${x.thermos.length > 1 ? "e" : ""}</span></div><button class="btn2 ${on ? "" : "pri"}" ${on ? "disabled" : ""} data-act="wzsug" data-i="${i}">${on ? "Hinzugefügt" : "Übernehmen"}</button></div>`; }).join("")}${F.sug.some((x) => !d.rooms.some((r) => r.name === x.name)) ? `<button class="lnk" data-act="wzsugall">Alle Vorschläge übernehmen</button>` : ""}` : ""}
      <div class="lsec">${ic("plus", 15)}Neue Räume</div>
      ${d.rooms.map((r, i) => `<div class="wzr ${r.name.trim() && r.windows.length && r.thermos.length ? "" : "inc"}"><div class="wzrh"><input class="otxt" data-f="wzr" data-i="${i}" data-k="name" value="${esc(r.name)}" placeholder="Raumname"><button class="ibtn" data-act="wzdel" data-i="${i}" aria-label="Raum entfernen">${ic("trash", 18)}</button></div>
        <div class="mut sm">Fenster- und Türsensoren</div>${chips(r, i, "windows", r.windows)}${this._wzSel(F.win.filter((e) => !r.windows.includes(e)), "", "wzadd", `data-i="${i}" data-k="windows"`, "+ Sensor hinzufügen")}
        <div class="mut sm">Thermostate</div>${chips(r, i, "thermos", r.thermos)}${this._wzSel(F.cl.filter((e) => !r.thermos.includes(e)), "", "wzadd", `data-i="${i}" data-k="thermos"`, "+ Thermostat hinzufügen")}</div>`).join("")}
      <button class="btn2" data-act="wzroom" style="width:100%">${ic("plus", 16)} Raum manuell hinzufügen</button>`;
    if (s === 2) return `<h3 class="wzt">Fenstermeldung</h3><div class="mut sm" style="margin-bottom:6px">Gilt für alle neuen Räume. Pro Raum änderst du es später in den Einstellungen.</div>
      ${num("Fenster offen nach", "So lange muss es offen sein, bevor geheizt wird.", "open_delay", "s", 0, 3600, 5)}${num("Fenster zu nach", "Wartezeit, bevor wieder geheizt wird.", "close_delay", "s", 0, 3600, 5)}
      <div class="mut sm" style="margin:8px 0 0">Bei offenem Fenster</div><div class="seg">${[["off", "Thermostat aus"], ["setback", "Absenken"]].map(([k, l]) => `<button class="${d.action === k ? "sel" : ""}" data-act="wzact" data-k="${k}">${l}</button>`).join("")}</div>
      ${d.action === "setback" ? num("Absenktemperatur", "", "setback_temp", "°C", 5, 25, 0.5) : ""}
      <div class="mut sm" style="margin:8px 0 0">Sommermodus</div><div class="seg">${[["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]].map(([k, l]) => `<button class="${d.summer === k ? "sel" : ""}" data-act="wzsum" data-k="${k}">${l}</button>`).join("")}</div>`;
    if (s === 3) return `<h3 class="wzt">Heizung &amp; Energie</h3><div class="mut sm" style="margin-bottom:6px">Für die Ersparnis im Dashboard.</div>
      <div class="mut sm">Brennstoff</div><select class="lsel" data-f="wzv" data-k="fuel">${Object.entries({ erdgas: "Erdgas", heizoel: "Heizöl", fluessiggas: "Flüssiggas", pellets: "Pellets", strom: "Strom / Wärmepumpe" }).map(([v, l]) => `<option value="${v}" ${d.fuel === v ? "selected" : ""}>${l}</option>`).join("")}</select>
      <div class="mut sm">Außentemperatur-Sensor (optional)</div>${this._wzSel(F.tmp, d.outdoor, "wzv", `data-k="outdoor"`)}
      <div class="of"><div class="ol"><b>Wetterabhängige Absenkung</b><span>Bei Sonne oder Milde sinkt die Zieltemperatur, bei Frost steigt sie.</span></div><div class="oc"><button class="sw ${d.wx ? "on" : ""}" data-act="wzwx" aria-pressed="${d.wx}"></button></div></div>`;
    if (s === 4) return `<h3 class="wzt">Luftfeuchte</h3><div class="mut sm" style="margin-bottom:8px">Optional. Mit einem Sensor je Raum warnt das Dashboard genauer vor Schimmel.</div>
      ${d.rooms.length ? d.rooms.map((r, i) => `<div class="mut sm" style="margin:6px 0 0">${esc(r.name || "Raum " + (i + 1))}</div>${this._wzSel(F.hum, r.hum, "wzr", `data-i="${i}" data-k="hum"`)}`).join("") : `<div class="mut">Für neue Räume. Bestehende Räume stellst du in deren Einstellungen ein.</div>`}`;
    if (s === 5) return `<h3 class="wzt">PV &amp; Elektroheizer</h3><div class="of"><div class="ol"><b>Elektroheizer mit PV-Überschuss</b><span>Heizen nur, wenn Strom übrig ist.</span></div><div class="oc"><button class="sw ${d.pvon ? "on" : ""}" data-act="wzpvon" aria-pressed="${d.pvon}"></button></div></div>
      ${d.pvon ? `<div class="mut sm">Sensor für die Einspeisung ins Netz</div>${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "power" || /^k?W$/.test(this._hass.states[e].attributes.unit_of_measurement || ""))), d.pv.sensor, "wzv", `data-k="pv.sensor"`)}
        <div class="seg">${[["export", "Einspeisung positiv"], ["import", "Netzbezug positiv"]].map(([k, l]) => `<button class="${d.pv.sign === k ? "sel" : ""}" data-act="wzsign" data-k="${k}">${l}</button>`).join("")}</div>
        <div class="mut sm">Batterie-Ladestand (optional)</div>${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "battery" || this._hass.states[e].attributes.unit_of_measurement === "%")), d.pv.soc_sensor, "wzv", `data-k="pv.soc_sensor"`)}
        ${this._wzRate(d, "price", "Strompreis (Netzbezug)", "Festpreis")}${this._wzRate(d, "feed", "Einspeisevergütung", "Festvergütung")}
        <div class="lsec">${ic("radiator", 15)}Heizer in neuen Räumen</div>
        ${d.rooms.length ? d.rooms.map((r, i) => `<div class="mut sm" style="margin:6px 0 0">${esc(r.name || "Raum " + (i + 1))}</div>${this._wzSel(F.sw, r.heater, "wzr", `data-i="${i}" data-k="heater"`, "– kein Elektroheizer –")}${r.heater ? `<div class="of"><div class="ol"><b>Leistungsstufen</b><span>In Watt, z. B. 800, 1200, 1800.</span></div><div class="oc"><input class="otxt" data-f="wzr" data-i="${i}" data-k="steps" value="${esc(r.steps)}" placeholder="800, 1200, 1800"></div></div>` : ""}`).join("") : `<div class="mut">Heizer in bestehenden Räumen richtest du in deren Einstellungen ein.</div>`}` : ""}`;
    if (s === 6) return `<h3 class="wzt">Meldungen</h3><div class="mut sm" style="margin-bottom:8px">Optional. Eine Erinnerung, wenn ein Fenster zu lange offen steht.</div>
      <div class="mut sm">Benachrichtigen über</div><select class="lsel" data-f="wzv" data-k="notify"><option value="">– keine –</option>${F.notify.map((n) => `<option value="${esc(n)}" ${d.notify === n ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
      ${d.notify ? num("Erinnern nach", "Minuten, die das Fenster offen steht.", "notify_after", "Min.", 0, 240, 1) : ""}`;
    const ok = this._wzValid(d), bad = d.rooms.length - ok.length;
    const heat = d.pvon ? ok.filter((r) => r.heater).length : 0;
    return `<h3 class="wzt">Zusammenfassung</h3>
      <div class="wzsum"><div><em>${ic("home", 16)}</em><b>${ok.length} neue ${ok.length === 1 ? "Raum" : "Räume"}</b><span>${ok.map((r) => esc(r.name)).join(", ") || "keine"}${bad ? ` · ${bad} unvollständig, wird übersprungen` : ""}</span></div>
      <div><em>${ic("window", 16)}</em><b>Fenstermeldung</b><span>offen nach ${d.open_delay} s, zu nach ${d.close_delay} s · ${d.action === "off" ? "Thermostat aus" : "Absenken auf " + num2(d.setback_temp) + " °C"}</span></div>
      <div><em>${ic("sun", 16)}</em><b>Sommermodus</b><span>${{ off: "Aus", auto: "Automatisch", on: "Immer an" }[d.summer]}</span></div>
      <div><em>${ic("flame", 16)}</em><b>Heizung</b><span>${esc(d.fuel)}${d.outdoor ? " · Außensensor gewählt" : ""}${d.wx ? " · Wetter-Absenkung an" : ""}</span></div>
      <div><em>${ic("bolt", 16)}</em><b>PV-Überschuss</b><span>${d.pvon ? `${d.pv.sensor ? "Sensor gewählt" : "kein Sensor"} · ${heat} Elektroheizer` : "nicht eingerichtet"}</span></div>
      <div><em>${ic("bell", 16)}</em><b>Meldungen</b><span>${d.notify ? esc(d.notify) + ", nach " + d.notify_after + " Min." : "aus"}</span></div></div>
      <div class="mut sm" style="margin-top:8px">Bestehende Räume bleiben unverändert.</div>`;
  }
  _wzModal() {
    const m = this._modal, s = m.step, n = WZ_STEPS.length, last = s === n - 1;
    return `<div class="ov" data-act="${m.done ? "wzclose" : "close"}"></div><div class="sheet wide wz" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Einrichtungsassistent</b><span>${m.done ? "Fertig" : `Schritt ${s + 1} von ${n} · ${WZ_STEPS[s]}`}</span></div><button class="ibtn" data-act="${m.done ? "wzclose" : "close"}" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="wzp">${WZ_STEPS.map((t, i) => `<i class="${i <= s ? "on" : ""}" ${m.done ? "" : `data-act="wzgo" data-k="${i}" title="${t}"`}></i>`).join("")}</div>
      <div class="wzb">${this._wzBody(m)}</div>
      <div class="foot2 wzf">${m.done ? `<button class="btn2 pri" data-act="wzclose">Fertig</button>` : `${s > 0 ? `<button class="btn2" data-act="wzback">Zurück</button>` : ""}${last ? `<button class="btn2 pri" data-act="wzapply" ${m.busy ? "disabled" : ""}>${m.busy ? "Richte ein …" : "Einrichtung anwenden"}</button>` : `<button class="btn2 pri" data-act="wznext">${s === 0 ? "Los geht’s" : "Weiter"}</button>`}`}</div>
      ${!m.done && s > 0 && !last ? `<button class="lnk wzskip" data-act="wznext">Diesen Schritt überspringen</button>` : ""}</div>`;
  }
  /* ---------------- Heizkörperventil-Diagnose ---------------- */
  _vcfg() { return { warn: 20, days: 7, notify: "", ...((this._gen || {}).valve || {}) }; }
  _vBattery(eid) {
    const H = this._hass, st = H.states || {}, s = st[eid]; if (!s) return null;
    const ov = (this._vcfg().batsrc || {})[eid];
    if (ov) {
      if (ov.src === "none") return null;
      const bs = st[ov.src], nm = bs && bs.attributes.friendly_name;
      if (!bs || bs.state === "unavailable" || bs.state === "unknown") return { pct: null, low: false, unknown: true, manual: true, src: ov.src, name: nm };
      if (ov.src.startsWith("binary_sensor.")) return { pct: null, low: (bs.state === "on") !== !!ov.inv, manual: true, bin: true, src: ov.src, name: nm };
      const n = parseFloat(String(bs.state).replace(",", ".")); return isFinite(n) ? { pct: Math.round(n), manual: true, src: ov.src, name: nm } : { pct: null, low: false, unknown: true, manual: true, src: ov.src, name: nm };
    }
    const a = s.attributes || {}, num0 = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
    for (const k of ["battery_level", "battery"]) if (a[k] != null && num0(a[k]) != null) return { pct: Math.round(num0(a[k])), src: "Attribut" };
    if (a.battery_low === true) return { pct: null, low: true, bin: true, src: "Attribut" };
    const dv = (H.entities || {})[eid] && H.entities[eid].device_id; if (!dv) return null;
    for (const [e, en] of Object.entries(H.entities || {})) {
      if (en.device_id !== dv || !st[e]) continue; const dc = (st[e].attributes || {}).device_class;
      if (e.startsWith("sensor.") && dc === "battery" && num0(st[e].state) != null) return { pct: Math.round(num0(st[e].state)), src: e, name: st[e].attributes.friendly_name };
      if (e.startsWith("binary_sensor.") && dc === "battery") return { pct: null, low: st[e].state === "on", bin: true, src: e, name: st[e].attributes.friendly_name };
    }
    return null;
  }
  _batCands(eid) {
    const H = this._hass, st = H.states || {}, dv = ((H.entities || {})[eid] || {}).device_id, out = [];
    for (const e of Object.keys(st)) { const dc = (st[e].attributes || {}).device_class; if ((e.startsWith("sensor.") && dc === "battery") || (e.startsWith("binary_sensor.") && ["battery", "battery_charging"].includes(dc)) || (e.startsWith("binary_sensor.") && /batt|akku/i.test(e + " " + (st[e].attributes.friendly_name || "")))) out.push(e); }
    const same = (e) => dv && ((H.entities || {})[e] || {}).device_id === dv;
    return out.sort((a, b) => same(b) - same(a) || a.localeCompare(b));
  }
  _batRow(eid, b) {
    const cfg = this._vcfg(), ov = (cfg.batsrc || {})[eid], pc = b && b.pct != null ? Math.max(0, Math.min(100, b.pct)) : null, bc = b && (b.low || (pc != null && pc <= 10)) ? "bad" : b && pc != null && pc <= cfg.warn ? "warn" : "ok";
    const open = this._modal && this._modal.bat === eid;
    const val = !b ? `<span class="mut">${ov && ov.src === "none" ? "ohne Batterie-Überwachung" : "kein Batteriewert gefunden"}</span>` : b.unknown ? `<b class="vwarn">Batteriesensor meldet nichts</b>` : pc != null ? `<div class="batbar ${bc}"><i style="width:${pc}%"></i></div><b>${pc} %</b>` : `<b class="${b.low ? "vbad" : ""}">${b.low ? "leer / schwach" : "in Ordnung"}</b>`;
    const src = b && b.src ? `<span class="vsrc">${b.manual ? "Quelle: " : "erkannt: "}${esc(b.name || b.src)}${b.bin ? " (Binärsensor)" : ""}</span>` : "";
    let ed = "";
    if (open) {
      const c = this._batCands(eid), cur = ov ? ov.src : "", isBin = cur.startsWith("binary_sensor."), nm = (e) => esc((this._hass.states[e] || { attributes: {} }).attributes.friendly_name || e);
      const sens = c.filter((e) => e.startsWith("sensor.")), bins = c.filter((e) => e.startsWith("binary_sensor."));
      ed = `<div class="vbe"><select class="lsel" data-f="vbat" data-e="${esc(eid)}"><option value="">Automatisch erkennen</option><option value="none" ${cur === "none" ? "selected" : ""}>Keine Batterie-Überwachung</option>
        ${sens.length ? `<optgroup label="Prozent-Sensor">${sens.map((e) => `<option value="${esc(e)}" ${cur === e ? "selected" : ""}>${nm(e)}</option>`).join("")}</optgroup>` : ""}
        ${bins.length ? `<optgroup label="Binärsensor (an = Batterie schwach)">${bins.map((e) => `<option value="${esc(e)}" ${cur === e ? "selected" : ""}>${nm(e)}</option>`).join("")}</optgroup>` : ""}
        ${cur && !c.includes(cur) && cur !== "none" ? `<option value="${esc(cur)}" selected>${esc(cur)}</option>` : ""}</select>
        ${isBin ? `<label class="vinv"><input type="checkbox" data-f="vbatinv" data-e="${esc(eid)}" ${ov.inv ? "checked" : ""}> Umgekehrt: „an“ bedeutet Batterie in Ordnung</label>` : ""}
        ${!c.length ? `<div class="mut sm">Es wurde kein Batterie-Sensor gefunden. Ein Binärsensor, der bei schwacher Batterie „an“ ist, reicht.</div>` : ""}</div>`;
    }
    return `<div class="vb"><span class="vl">Batterie</span>${val}<button class="lnk vch" data-act="dgbat" data-e="${esc(eid)}">${open ? "Fertig" : "Quelle"}</button></div>${src ? `<div class="vb vbs">${src}</div>` : ""}${ed}`;
  }
  _vInfo(eid, rv) {
    const s = (this._hass.states || {})[eid], cfg = this._vcfg(), now = Date.now();
    if (!s) return { lvl: "bad", msg: "Entität existiert nicht mehr", bat: null, lines: [] };
    const a = s.attributes || {}, at = Date.parse(s.last_updated || ""), age = isFinite(at) ? now - at : null, bat = this._vBattery(eid), out = [];
    let lvl = "ok";
    const up = (l) => { if (l === "bad" || (l === "warn" && lvl === "ok")) lvl = l; };
    if (s.state === "unavailable") { up("bad"); out.push(["bad", "Nicht erreichbar", "Das Ventil meldet sich nicht. Funkverbindung oder Batterie prüfen."]); }
    else {
      if (age != null && age > 6 * 36e5 && s.state !== "off") { up("warn"); out.push(["warn", `Keine Meldung seit ${this._dgAgo(age).replace("vor ", "")}`, "Das Ventil sendet keine neuen Werte."]); }
      if (rv && rv.ok === false && rv.expect != null) { up("bad"); out.push(["bad", "Reagiert nicht auf Befehle", `Ziel ${num(rv.expect, 1)} °C gesendet ${this._dgAgo(now - Date.parse(rv.cmd_at))}, das Ventil meldet ${rv.actual != null ? "als Ziel " + num(rv.actual, 1) + " °C" : "keinen Zielwert"}.`]); }
    }
    if (bat && bat.unknown) { up("warn"); out.push(["warn", "Batteriesensor meldet nichts", "Der gewählte Batterie-Sensor ist nicht erreichbar. Quelle prüfen."]); }
    if (bat) { if (bat.low || (bat.pct != null && bat.pct <= 10)) { up("bad"); out.push(["bad", bat.pct != null ? `Batterie fast leer (${bat.pct} %)` : "Batterie leer", "Jetzt wechseln, sonst bleibt das Ventil stehen."]); } else if (bat.pct != null && bat.pct <= cfg.warn) { up("warn"); out.push(["warn", `Batterie schwach (${bat.pct} %)`, "Bald wechseln."]); } }
    return { lvl, bat, age, s, lines: out, cur: a.current_temperature, tgt: a.temperature, act: a.hvac_action, rv };
  }
  _valveChip(r) {
    let w = null;
    for (const e of r.thermos || []) { const i = this._vInfo(e); if (i.lvl === "ok") continue; const l = i.lines[0] || []; if (!w || (i.lvl === "bad" && w[0] !== "bad")) w = [i.lvl, l[1] || l[0] || "Ventil prüfen", l[0] || ""]; }
    if (!w) return "";
    const short = /Batterie/.test(w[2]) ? w[2].replace("Batterie ", "Batterie ").replace(/ \((\d+) %\)/, " $1 %") : /Nicht erreichbar/.test(w[2]) ? "Ventil offline" : /Reagiert/.test(w[2]) ? "Ventil reagiert nicht" : "Ventil prüfen";
    return `<button class="achip ${w[0] === "bad" ? "red" : "amber"}" data-act="diag" data-k="valve" aria-label="Ventil-Diagnose öffnen">${ic("thermo", 12)}${esc(short)}</button>`;
  }
  _wInfo(eid) {
    const s = (this._hass.states || {})[eid], cfg = this._vcfg(), now = Date.now(), out = [];
    if (!s) return { lvl: "bad", lines: [["bad", "Entität existiert nicht mehr", "Der Sensor wurde gelöscht oder umbenannt."]], bat: null, s: null };
    const ch = Date.parse(s.last_changed || ""), up = Date.parse(s.last_updated || ""), ageC = isFinite(ch) ? now - ch : null, ageU = isFinite(up) ? now - up : null, bat = this._vBattery(eid), days = cfg.days || 7;
    let lvl = "ok"; const u = (l) => { if (l === "bad" || (l === "warn" && lvl === "ok")) lvl = l; };
    if (s.state === "unavailable") { u("bad"); out.push(["bad", "Nicht erreichbar", "Der Sensor meldet sich nicht. Batterie und Funkverbindung prüfen."]); }
    else {
      if (s.state === "on" && ageC != null && ageC > 12 * 36e5) { u("warn"); out.push(["warn", `Seit ${this._dgAgo(ageC).replace("vor ", "")} offen`, "Fenster wirklich offen? Sonst hängt der Sensor."]); }
      else if (ageC != null && ageC > days * 864e5) { u("warn"); out.push(["warn", `Seit ${Math.floor(ageC / 864e5)} Tagen unverändert`, "Normal, wenn das Fenster nie geöffnet wird. Sonst Sensor prüfen."]); }
      if (ageU != null && ageU > 3 * 864e5 && ageC != null && ageU < ageC) { u("warn"); out.push(["warn", `Keine Meldung seit ${Math.floor(ageU / 864e5)} Tagen`, "Auch Batterie- und Signalwerte kommen nicht mehr an."]); }
    }
    if (bat && bat.unknown) { u("warn"); out.push(["warn", "Batteriesensor meldet nichts", "Der gewählte Batterie-Sensor ist nicht erreichbar. Quelle prüfen."]); }
    if (bat) { if (bat.low || (bat.pct != null && bat.pct <= 10)) { u("bad"); out.push(["bad", bat.pct != null ? `Batterie fast leer (${bat.pct} %)` : "Batterie leer", "Jetzt wechseln, sonst erkennt die Regelung offene Fenster nicht mehr."]); } else if (bat.pct != null && bat.pct <= cfg.warn) { u("warn"); out.push(["warn", `Batterie schwach (${bat.pct} %)`, "Bald wechseln."]); } }
    return { lvl, bat, s, ageC, ageU, lines: out };
  }
  _dgWindows(m) {
    const cfg = this._vcfg(), list = []; for (const r of this._collect()) for (const e of r.windows || []) list.push({ r, e, i: this._wInfo(e) });
    const bad = list.filter((x) => x.i.lvl === "bad").length, warn = list.filter((x) => x.i.lvl === "warn").length, rk = { bad: 0, warn: 1, ok: 2 };
    const hdr = !list.length ? `<div class="mut" style="padding:16px 0">Noch keine Fensterkontakte eingerichtet.</div>` : `<div class="mut sm" style="margin:2px 0 10px">${bad ? `${bad} Kontakt${bad > 1 ? "e brauchen" : " braucht"} Aufmerksamkeit.` : warn ? `${warn} Hinweis${warn > 1 ? "e" : ""}.` : "Alle Fensterkontakte melden und haben genug Batterie."}</div>`;
    const cards = list.sort((a, b) => rk[a.i.lvl] - rk[b.i.lvl]).map(({ r, e, i }) => {
      const b = i.bat, pc = b && b.pct != null ? Math.max(0, Math.min(100, b.pct)) : null, bc = b && (b.low || (pc != null && pc <= 10)) ? "bad" : b && pc != null && pc <= cfg.warn ? "warn" : "ok", nm = i.s ? i.s.attributes.friendly_name || e : e;
      const st = !i.s ? "–" : i.s.state === "unavailable" ? "nicht erreichbar" : i.s.state === "on" ? "offen" : "zu";
      return `<div class="vc ${i.lvl}"><div class="vh"><i class="dgd ${i.lvl}"></i><div><b>${esc(nm)}</b><span>${esc(r.name)}</span></div><em>${i.lvl === "ok" ? "In Ordnung" : i.lvl === "warn" ? "Hinweis" : "Problem"}</em></div>
        <div class="vb"><span class="vl">Zustand</span><b>${st}</b></div>
        <div class="vb"><span class="vl">Zuletzt geändert</span><b>${i.ageC != null ? this._dgAgo(i.ageC) : "–"}</b></div>
        <div class="vb"><span class="vl">Letzte Meldung</span><b>${i.ageU != null ? this._dgAgo(i.ageU) : "–"}</b></div>
        ${this._batRow(e, i.bat)}
        ${i.lines.map(([l, t, h]) => `<div class="vm ${l}">${ic(l === "bad" ? "alert" : "info", 15)}<div><b>${esc(t)}</b><span>${esc(h)}</span></div></div>`).join("")}</div>`;
    }).join("");
    const set = `<div class="lsec" style="margin-top:14px">${ic("window", 15)}Wann auffällig?</div>
      <div class="of"><div class="ol"><b>Unverändert ab</b><span>Tage ohne Wechsel zwischen offen und zu.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="vdays" value="${cfg.days || 7}" min="1" max="60" step="1"><i>Tage</i></span></div></div>
      <div class="mut sm" style="margin-top:4px">Batterie-Schwelle und Benachrichtigung stellst du im Reiter „Ventile“ ein. Sie gelten auch für die Fensterkontakte.</div>`;
    return hdr + cards + set;
  }
  _devChip(r) {
    let w = null;
    for (const e of r.thermos || []) { const i = this._vInfo(e); if (i.lvl === "ok") continue; const l = i.lines[0] || []; if (!w || (i.lvl === "bad" && w[0] !== "bad")) w = [i.lvl, l[1] || "", "valve", "Ventil"]; }
    for (const e of r.windows || []) { const i = this._wInfo(e); if (i.lvl === "ok") continue; const l = i.lines[0] || []; if (!w || (i.lvl === "bad" && w[0] !== "bad")) w = [i.lvl, l[1] || "", "win", "Kontakt"]; }
    if (!w) return "";
    const t = w[1], k = w[3], short = /Batterie/.test(t) ? `${k === "Ventil" ? "Batterie" : "Kontakt-Batterie"}${(t.match(/\((\d+) %\)/) || [])[1] ? " " + t.match(/\((\d+) %\)/)[1] + " %" : " leer"}` : /Nicht erreichbar/.test(t) ? `${k} offline` : /Reagiert/.test(t) ? "Ventil reagiert nicht" : /unverändert/.test(t) ? "Kontakt unverändert" : /offen/.test(t) ? "Fenster lange offen" : `${k} prüfen`;
    return `<button class="achip ${w[0] === "bad" ? "red" : "amber"}" data-act="diag" data-k="${w[2]}" aria-label="Diagnose öffnen">${ic(w[2] === "win" ? "window" : "thermo", 12)}${esc(short)}</button>`;
  }
  _dgValves(m) {
    const rooms = this._collect(), cfg = this._vcfg(), rvs = (m.data && m.data.valves) || [], rvf = (e) => rvs.find((v) => v.entity === e);
    const list = []; for (const r of rooms) for (const e of r.thermos || []) list.push({ r, e, i: this._vInfo(e, rvf(e)) });
    const bad = list.filter((x) => x.i.lvl === "bad").length, warn = list.filter((x) => x.i.lvl === "warn").length;
    const hdr = !list.length ? `<div class="mut" style="padding:16px 0">Noch keine Thermostate eingerichtet.</div>` : `<div class="mut sm" style="margin:2px 0 10px">${bad ? `${bad} Ventil${bad > 1 ? "e brauchen" : " braucht"} Aufmerksamkeit.` : warn ? `${warn} Warnung${warn > 1 ? "en" : ""}.` : "Alle Ventile reagieren und haben genug Batterie."}</div>`;
    const cards = list.sort((a, b) => ({ bad: 0, warn: 1, ok: 2 }[a.i.lvl] - { bad: 0, warn: 1, ok: 2 }[b.i.lvl])).map(({ r, e, i }) => {
      const b = i.bat, pc = b && b.pct != null ? Math.max(0, Math.min(100, b.pct)) : null, bc = b && (b.low || (pc != null && pc <= 10)) ? "bad" : b && pc != null && pc <= cfg.warn ? "warn" : "ok";
      const nm = i.s ? i.s.attributes.friendly_name || e : e, rv = i.rv;
      return `<div class="vc ${i.lvl}"><div class="vh"><i class="dgd ${i.lvl}"></i><div><b>${esc(nm)}</b><span>${esc(r.name)}</span></div><em>${i.lvl === "ok" ? "In Ordnung" : i.lvl === "warn" ? "Warnung" : "Problem"}</em></div>
        ${this._batRow(e, i.bat)}
        <div class="vb"><span class="vl">Ventil</span><b>${i.cur != null ? `Ist ${num(i.cur, 1)} °C` : "keine Temperatur"}${i.tgt != null ? ` · Ziel ${num(i.tgt, 1)} °C` : ""}${i.act ? ` · ${{ heating: "heizt", idle: "ruht", off: "aus" }[i.act] || i.act}` : ""}</b></div>
        <div class="vb"><span class="vl">Letzte Meldung</span><b>${i.age != null ? this._dgAgo(i.age) : "–"}</b></div>
        ${rv ? `<div class="vb"><span class="vl">Letzter Befehl</span><b>${this._dgAgo(Date.now() - Date.parse(rv.cmd_at))}: ${rv.expect != null ? "Ziel " + num(rv.expect, 1) + " °C" : "Modus " + esc(rv.mode || "")} ${rv.ok === false ? "nicht übernommen" : rv.ok ? "übernommen" : "wird geprüft"}</b></div>` : ""}
        ${i.lines.map(([l, t, h]) => `<div class="vm ${l}">${ic(l === "bad" ? "alert" : "info", 15)}<div><b>${esc(t)}</b><span>${esc(h)}</span></div></div>`).join("")}</div>`;
    }).join("");
    const notify = ((this._hass.services || {}).notify) ? Object.keys(this._hass.services.notify).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).map((n) => "notify." + n).sort() : [];
    const set = `<div class="lsec" style="margin-top:14px">${ic("bell", 15)}Benachrichtigung bei Problemen</div>
      <div class="mut sm" style="margin:2px 0 4px">Du bekommst eine Meldung, wenn ein Ventil ausfällt, nicht reagiert oder die Batterie schwach ist. Pro Problem höchstens einmal am Tag.</div>
      <div class="mut sm">Benachrichtigen über</div><select class="lsel" data-f="vnotify"><option value="">– keine –</option>${[...new Set([...notify, ...(cfg.notify ? [cfg.notify] : [])])].map((n) => `<option value="${esc(n)}" ${cfg.notify === n ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>
      <div class="of"><div class="ol"><b>Batterie schwach ab</b><span>Unter 10 % gilt sie als fast leer.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="vwarn" value="${cfg.warn}" min="11" max="60" step="1"><i>%</i></span></div></div>`;
    return hdr + cards + set;
  }
  /* ---------------- Gerätediagnose ---------------- */
  async _dgOpen(tab) {
    this._modal = { type: "diag", tab: tab || "status", only: false, data: null, loading: true, at: null };
    this._renderModal(); await this._dgLoad();
  }
  async _dgLoad() {
    const m = this._modal; if (!m || m.type !== "diag") return; m.loading = true; this._renderModal();
    try { m.data = await this._hass.callWS({ type: "fenster_heizung/get_diag" }); m.error = ""; } catch (e) { m.data = m.data || { devices: [], notify: [], log: [] }; m.error = "Die Diagnose konnte nicht vom Server geladen werden."; }
    m.at = new Date(); m.loading = false; if (this._modal === m) this._renderModal();
  }
  _dgAgo(ms) { const s = Math.max(0, Math.round(ms / 1000)); if (s < 45) return "gerade eben"; const mi = Math.round(s / 60); if (mi < 60) return `vor ${mi} Min.`; const h = Math.round(mi / 60); if (h < 48) return `vor ${h} Std.`; return `vor ${Math.round(h / 24)} Tagen`; }
  _dgRows(data) {
    const st = this._hass.states || {}, now = Date.now(), R = DG_ROLES, rows = [];
    for (const d of data.devices || []) {
      const s = st[d.entity], dom = String(d.entity).split(".")[0], at = s ? Date.parse(s.last_updated || s.last_changed || "") : NaN, age = isFinite(at) ? now - at : null, name = s ? s.attributes.friendly_name || d.entity : d.entity;
      let lvl = "ok", msg = "OK", val = "";
      if (!s) { lvl = "bad"; msg = "Entität existiert nicht mehr"; }
      else if (s.state === "unavailable") { lvl = "bad"; msg = "Nicht erreichbar"; val = "nicht erreichbar"; }
      else if (s.state === "unknown") { lvl = "warn"; msg = "Wert unbekannt"; val = "unbekannt"; }
      else {
        val = dom === "climate" ? (s.attributes.current_temperature != null ? `${num(s.attributes.current_temperature, 1)} °C` : s.state) : dom === "binary_sensor" ? (s.state === "on" ? "offen" : "zu") : `${s.state}${s.attributes.unit_of_measurement ? " " + s.attributes.unit_of_measurement : ""}`;
        if (dom === "climate" && s.attributes.current_temperature == null) { lvl = "warn"; msg = "Meldet keine Raumtemperatur"; }
        else if (["sensor"].includes(dom) && age != null && age > 864e5) { lvl = "warn"; msg = `Seit ${this._dgAgo(age).replace("vor ", "")} keine Meldung`; }
        else if (d.role === "window" && s.state === "on" && age != null && age > 12 * 36e5) { lvl = "warn"; msg = `Seit ${this._dgAgo(age).replace("vor ", "")} offen. Sensor hängt?`; }
        else if (["pv", "soc", "price", "feed", "power"].includes(d.role) && !isFinite(parseFloat(String(s.state).replace(",", ".")))) { lvl = "warn"; msg = "Kein Zahlenwert"; }
      }
      rows.push({ room: d.room || "Allgemein", role: R[d.role] || d.role, entity: d.entity, name, val, age, lvl, msg });
    }
    for (const n of data.notify || []) { const [dm, sv] = String(n.service).split("."), ok = !!((this._hass.services || {})[dm] || {})[sv]; rows.push({ room: n.room || "Allgemein", role: "Benachrichtigung", entity: n.service, name: n.service, val: ok ? "vorhanden" : "fehlt", age: null, lvl: ok ? "ok" : "warn", msg: ok ? "Dienst verfügbar" : "Dienst nicht gefunden" }); }
    return rows;
  }
  _dgBody(m) {
    if (!m.data) return `<div class="mut" style="padding:34px 0;text-align:center">Lädt …</div>`;
    const wp = this._collect().reduce((a, r) => a + (r.windows || []).filter((e) => this._wInfo(e).lvl !== "ok").length, 0), vp = this._collect().reduce((a, r) => a + (r.thermos || []).filter((e) => this._vInfo(e, ((m.data.valves || []).find((v) => v.entity === e))).lvl !== "ok").length, 0), rows = this._dgRows(m.data), vx = this._collect().flatMap((r) => [...(r.thermos || []).map((e) => [e, this._vInfo(e, (m.data.valves || []).find((v) => v.entity === e))]), ...(r.windows || []).map((e) => [e, this._wInfo(e)])]).filter(([e, i]) => i.lvl !== "ok" && !rows.some((r) => r.entity === e && r.lvl !== "ok")), bad = rows.filter((r) => r.lvl === "bad").length + vx.filter(([, i]) => i.lvl === "bad").length, warn = rows.filter((r) => r.lvl === "warn").length + vx.filter(([, i]) => i.lvl === "warn").length, lg = m.data.log || [];
    const sum = bad ? ["bad", "alert", `${bad} ${bad === 1 ? "Fehler" : "Fehler"}${warn ? ` und ${warn} ${warn === 1 ? "Warnung" : "Warnungen"}` : ""}`, "Diese Geräte melden nicht. Die Regelung kann dadurch eingeschränkt sein."] : warn ? ["warn", "info", `${warn} ${warn === 1 ? "Warnung" : "Warnungen"}`, "Läuft, aber ein Gerät fällt auf."] : ["ok", "check", "Alles in Ordnung", `${rows.length} Geräte und Dienste geprüft, Ventile und Batterien eingeschlossen.`];
    const head = `<div class="dgs ${sum[0]}">${ic(sum[1], 22)}<div><b>${sum[2]}</b><span>${sum[3]}${m.at ? ` Geprüft um ${m.at.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.` : ""}</span></div><button class="btn2" data-act="dgre" ${m.loading ? "disabled" : ""}>${m.loading ? "Prüfe …" : "Erneut prüfen"}</button></div>${m.error ? `<div class="gst">${ic("alert", 15)}${esc(m.error)}</div>` : ""}`;
    const tabs = `<div class="seg">${[["status", "Status"], ["sens", "Gemeldet"], ["valve", `Ventile${vp ? " (" + vp + ")" : ""}`], ["win", `Fenster${wp ? " (" + wp + ")" : ""}`], ["log", `Protokoll${lg.length ? " (" + lg.length + ")" : ""}`]].map(([k, l]) => `<button class="${m.tab === k ? "sel" : ""}" data-act="dgtab" data-k="${k}">${l}</button>`).join("")}</div>`;
    const dot = (l) => `<i class="dgd ${l}" aria-hidden="true"></i>`, rank = { bad: 0, warn: 1, ok: 2 };
    let body = "";
    if (m.tab === "status") {
      const by = {}; for (const r of rows) (by[r.room] = by[r.room] || []).push(r);
      body = Object.entries(by).sort((a, b) => (a[0] === "Allgemein") - (b[0] === "Allgemein") || a[0].localeCompare(b[0], "de")).map(([room, list]) => { const w = list.reduce((a, r) => (rank[r.lvl] < rank[a] ? r.lvl : a), "ok"); return `<div class="dgr"><div class="dgh">${dot(w)}<b>${esc(room)}</b><span>${w === "ok" ? "in Ordnung" : list.filter((r) => r.lvl !== "ok").length + " auffällig"}</span></div>${list.map((r) => `<div class="dgl ${r.lvl}">${dot(r.lvl)}<div><b>${esc(r.role)}</b><span>${esc(r.name)}</span></div><em>${esc(r.msg)}</em></div>`).join("")}</div>`; }).join("") || `<div class="mut">Noch keine Geräte eingerichtet.</div>`;
    } else if (m.tab === "valve") { body = this._dgValves(m);
    } else if (m.tab === "win") { body = this._dgWindows(m);
    } else if (m.tab === "sens") {
      const list = rows.filter((r) => r.entity.includes(".") && !r.entity.startsWith("notify.")).filter((r) => !m.only || r.lvl !== "ok").sort((a, b) => (b.age == null ? 1e15 : b.age) - (a.age == null ? 1e15 : a.age) || rank[a.lvl] - rank[b.lvl]);
      body = `<div class="dgf"><button class="chipb ${m.only ? "" : "sel"}" data-act="dgonly" data-k="0">Alle</button><button class="chipb ${m.only ? "sel" : ""}" data-act="dgonly" data-k="1">Nur auffällige</button></div>` + (list.map((r) => `<div class="dgt ${r.lvl}">${dot(r.lvl)}<div class="dgn"><b>${esc(r.name)}</b><span>${esc(r.room)} · ${esc(r.role)}</span></div><div class="dgv"><b>${esc(r.val || "–")}</b><span>${r.age == null ? "–" : this._dgAgo(r.age)}</span></div></div>`).join("") || `<div class="mut" style="padding:16px 0">Nichts Auffälliges.</div>`);
    } else {
      body = lg.length ? `<div class="dgf"><button class="chipb" data-act="dgcopy">${ic("copy", 14)} Kopieren</button><button class="chipb" data-act="dgclr">${ic("trash", 14)} Leeren</button></div>` + lg.map((e) => `<div class="dgg ${e.level}">${dot(e.level === "error" ? "bad" : e.level === "warning" ? "warn" : "ok")}<div><b>${esc(e.msg)}</b><span>${esc(e.room || "Allgemein")}</span></div><em>${new Date(e.t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</em></div>`).join("") : `<div class="dgempty">${ic("check", 26)}<b>Keine Fehler protokolliert</b><span>Hier erscheinen fehlgeschlagene Schaltvorgänge, nicht erreichbare Geräte und Meldungen der Heizer-Steuerung.</span></div>`;
    }
    return head + tabs + `<div class="dgb">${body}</div>`;
  }
  _dgModal() {
    const m = this._modal;
    return `<div class="ov" data-act="close"></div><div class="sheet wide dg" role="dialog" aria-modal="true"><div class="sh"><div><b>Gerätediagnose</b><span>Sensoren, Thermostate, Heizer und Fehler</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>${this._dgBody(m)}<div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Schließen</button></div></div>`;
  }
  _dgAct(a, b) {
    const m = this._modal;
    if (a === "dgtab") m.tab = b.dataset.k;
    else if (a === "dgonly") m.only = b.dataset.k === "1";
    else if (a === "dgbat") m.bat = m.bat === b.dataset.e ? null : b.dataset.e;
    else if (a === "dgre") { this._dgLoad(); return; }
    else if (a === "dgclr") { this._hass.callWS({ type: "fenster_heizung/clear_diag" }).then(() => { m.data.log = []; this._renderModal(); }).catch(() => this._toast("Protokoll konnte nicht geleert werden")); return; }
    else if (a === "dgcopy") { const t = (m.data.log || []).map((e) => `${e.t} [${e.level}] ${e.room || "Allgemein"}: ${e.msg}`).join("\n"); try { navigator.clipboard.writeText(t).then(() => this._toast("Protokoll kopiert")); } catch (_) { this._toast("Kopieren nicht möglich"); } return; }
    this._renderModal();
  }
  _renderModal() {
    const box = this.shadowRoot.getElementById("modal"), m = this._modal;
    const old = box.querySelector(".sheet"), top = old ? old.scrollTop : 0;
    if (!m) { box.innerHTML = ""; return; }
    const r = this._collect().find((x) => x.id === m.id) || { name: "" };
    if (m.type === "diag") { box.innerHTML = this._dgModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "wbon") { box.innerHTML = this._wbOnModal(); return; }
    if (m.type === "sfset") { box.innerHTML = this._sfxModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "spset") { box.innerHTML = this._spModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["spndlg", "spnadm"].includes(m.type)) { box.innerHTML = this._spnModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["tmpin", "tmset", "tmnorm", "tmmore"].includes(m.type)) { box.innerHTML = this._tmModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["hzset", "hzbub", "hzpin"].includes(m.type)) { box.innerHTML = this._hzModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["tgxmgr", "tgxedit", "tgxfb"].includes(m.type)) { box.innerHTML = this._tgxModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (["lixset", "lixdet", "lixoff"].includes(m.type)) { box.innerHTML = this._lixModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "muset") { box.innerHTML = this._muxModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "wxset") { box.innerHTML = this._wxsModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "igtb") { box.innerHTML = this._igTbModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "stodet") { box.innerHTML = this._stoModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "labdet") { box.innerHTML = this._labModal(m.id); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "labok") { box.innerHTML = this._labOkModal(m.id); return; }
    if (m.type === "labset") { box.innerHTML = this._labSetModal(); return; }
    if (m.type === "stoset") { box.innerHTML = this._stoSetModal(); return; }
    if (m.type === "iggoe") { box.innerHTML = this._igGoeModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "ortper" || m.type === "ortzone") { box.innerHTML = m.type === "ortper" ? this._ortPerModal() : this._ortZoneModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; this._ortBind(); return; }
    if (m.type === "mods" || m.type === "wwset" || m.type === "wwsch" || m.type === "enset" || m.type === "gsset" || m.type === "evset") { box.innerHTML = this._mdModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
    if (m.type === "wiz") { box.innerHTML = this._wzModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = m.keepTop ? top : 0; m.keepTop = true; return; }
    if (m.type === "icon") {
      const cur = this._icon(r), L = this._cfg.layout, cc = (L.colors || {})[m.id], ph = (L.photos || {})[m.id];
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Raum anpassen</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="lsec">Symbol</div>
        ${ICON_GROUPS.map(([g, list]) => `<div class="igt">${g}</div><div class="igrid">${list.map(([k, l]) => `<button class="${k === cur ? "sel" : ""}" data-act="pick" data-k="${k}" title="${l}" aria-label="${l}">${ic2(k, 36)}</button>`).join("")}</div>`).join("")}
        <button class="lnk" data-act="preset">Symbol automatisch nach Raumname</button>
        <div class="lsec">Farbe</div>
        <div class="swatches"><button class="sw2 auto ${!cc ? "sel" : ""}" data-act="rcol" data-k="" aria-label="Automatisch" title="Automatisch"></button>${ROOM_COLORS.map((c) => `<button class="sw2 ${cc === c ? "sel" : ""}" style="background:${c}" data-act="rcol" data-k="${c}" aria-label="${c}"></button>`).join("")}<label class="cpick"><input type="color" data-f="rcolc" value="${HEX.test(cc || "") ? cc : (HEX.test(r.color || "") ? r.color : DEF_ACC)}">Eigene</label></div>
        <div class="lsec">Foto als Kartenhintergrund</div>
        <div class="phbox"><div class="pth" ${ph ? `style="background-image:url('${esc(ph)}')"` : ""}>${ph ? "" : ic("image", 22)}</div>
          <div class="pbs"><input type="file" accept="image/*" data-f="rfile" hidden><button class="lnk" data-act="rphoto">${ph ? "Foto ersetzen" : "Foto auswählen"}</button>${ph ? `<button class="lnk dng" data-act="rphotodel">Foto entfernen</button>` : ""}</div></div>
        <div class="mut sm" style="margin:0 0 8px">Das Foto wird verkleinert (ca. 560 px) und für alle Nutzer gespeichert. Höchstens 12 Fotos.</div>
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "fh") {
      const g = this._gen, sm = g.summer, S = this._sum(), wa = g.wxadj, wadj = this._wxAdj(), pv = this._pv();
      const sumInfo = S.active ? `Aktiv${S.out != null ? `: ${num(S.out, 1)} °C draußen` : ""}. Der Heizplan ruht, die Fenstermeldung bleibt.` : sm.mode === "off" ? "Aus. Der Heizplan läuft wie gewohnt." : `Inaktiv${S.out != null ? `: ${num(S.out, 1)} °C draußen, Schwelle ${num(sm.temp, 1)} °C` : ""}.`;
      const open = this._fhOpenSet(), pvn = this._pvNow(), rp = this._rate("price"), rf = this._rate("feed"), dn = (n) => (n === 1 ? "1 Tag" : n + " Tage");
      const sec = (id, ico, ttl, txt, chip, tone, body) => `<div class="fhs ${open.has(id) ? "open" : ""}"><button class="sxrow" data-act="fhsec" data-k="${id}" aria-expanded="${open.has(id)}"><span class="sxi">${ic(ico, 20)}</span><span class="sxt"><b>${ttl}</b><small>${txt}</small></span><em class="sxc ${tone}">${chip}</em><span class="sxg">${ic("chev", 16)}</span></button>${open.has(id) ? `<div class="fhb">${body}</div>` : ""}</div>`;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Modul 1 · Einstellungen</b><span>Fenster &amp; Heizung, gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${sec("sum", "sun", "Sommermodus", sm.mode === "off" ? "Die Heizpläne laufen wie gewohnt." : sm.mode === "on" ? "Die Heizpläne ruhen." : `Automatisch ab ${num(sm.temp, 1)} °C, Mittel über ${dn(sm.days)}.`, S.active ? "Aktiv" : sm.mode === "off" ? "Aus" : "Bereit", S.active ? "ok" : "off", `
        <div class="mut sm" style="margin:10px 0 8px">Wenn es draußen warm genug ist, ruhen die Heizpläne. Die Fenstermeldung und alle Erinnerungen bleiben aktiv.</div>
        <div class="seg">${[["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]].map(([k, l]) => `<button class="${sm.mode === k ? "sel" : ""}" data-act="gsum" data-k="${k}">${l}</button>`).join("")}</div>
        ${sm.mode === "auto" ? `<div class="of"><div class="ol"><b>Ab einer Außentemperatur von</b><span>Mittel der letzten Tage, Sensor siehe Darstellung.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gth" value="${sm.temp}" min="5" max="35" step="0.5"><i>°C</i></span></div></div>
        <div class="of"><div class="ol"><b>Gemittelt über</b></div><div class="oc"><div class="seg oseg">${[1, 3, 7].map((d) => `<button class="${sm.days === d ? "sel" : ""}" data-act="gdays" data-k="${d}">${d === 1 ? "1 Tag" : d + " Tage"}</button>`).join("")}</div></div></div>` : ""}
        <div class="gst ${S.active ? "on" : ""}">${ic(S.active ? "sun" : "info", 15)}${sumInfo}</div>`)}
        ${sec("wx", "partly", "Wetterabhängige Absenkung", wa.on ? `Mild ab ${num(wa.mild, 0)} °C um ${num(wa.down, 1)} K senken, bei Frost bis ${num(wa.frost, 0)} °C um ${num(wa.up, 1)} K anheben.` : "Die Zieltemperatur bleibt wie im Heizplan.", !wa.on ? "Aus" : wadj && wadj.d ? "Aktiv" : "An", wa.on ? "ok" : "off", `
        <div class="mut sm" style="margin:2px 0 4px">Bei Sonne oder milder Luft sinkt die Zieltemperatur, bei Frost steigt sie. Gilt für alle Räume, die du nicht ausnimmst.</div>
        <div class="ltog"><span>Zieltemperatur nach Wetter anpassen</span><button class="sw ${wa.on ? "on" : ""}" data-act="gwx" aria-pressed="${wa.on}" aria-label="Wetter-Anpassung"></button></div>
        ${wa.on ? [["mild", "Mild ab", "°C", "Bei Sonne schon ab 5 °C weniger."], ["down", "Dann absenken um", "K", ""], ["frost", "Frost bis", "°C", ""], ["up", "Dann anheben um", "K", ""]].map(([k, l, u, h]) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<span>${h}</span>` : ""}</div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gwxn" data-k="${k}" value="${wa[k]}" min="${k === "mild" || k === "frost" ? -20 : 0}" max="${k === "mild" || k === "frost" ? 40 : 5}" step="0.5"><i>${u}</i></span></div></div>`).join("") : ""}
        <div class="gst ${wadj && wadj.d ? "on" : ""}">${ic(wadj && wadj.d ? (wadj.fr ? "snow" : "sun") : "info", 15)}${!wa.on ? "Aus." : wadj && wadj.d ? `Aktiv: ${wadj.d > 0 ? "+" : "−"}${num(Math.abs(wadj.d), 1)} °C (${wadj.why}).` : "Gerade keine Anpassung nötig."}</div>`)}
        ${sec("pv", "bolt", "PV-Überschuss für Elektroheizer", pv.sensor ? (pvn != null ? `${wfmt(pvn)} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Sensor gewählt, noch kein Wert.") : "Noch kein Sensor für die Einspeisung gewählt.", pv.sensor ? "Eingerichtet" : "Offen", pv.sensor ? "ok" : "", `
        <div class="mut sm" style="margin:2px 0 4px">Elektroheizer in den Räumen heizen nur bei genug Überschuss. Sie schaltest du in den Raumeinstellungen ein.</div>
        <div class="mut sm" style="margin:0">Sensor für die Einspeisung ins Netz</div>${this._wzSel(Object.keys(this._hass.states).filter((k) => k.startsWith("sensor.") && (this._hass.states[k].attributes.device_class === "power" || /^k?W$/.test(this._hass.states[k].attributes.unit_of_measurement || ""))), pv.sensor, "gpvs", "", "– keiner –", PK_HINT.grid)}
        <div class="seg">${[["export", "Einspeisung positiv"], ["import", "Netzbezug positiv"]].map(([k, l]) => `<button class="${pv.sign === k ? "sel" : ""}" data-act="gpvsign" data-k="${k}">${l}</button>`).join("")}</div>
        ${[["reserve", "Reserve", "W", "Bleibt zusätzlich zur Heizerleistung übrig.", 0, 2000, 50], ["delay", "Einschalten nach", "Min.", "So lange muss der Überschuss anliegen.", 0, 30, 1], ["minrun", "Mindestlaufzeit", "Min.", "Kürzer läuft ein Heizer nicht an einem Stück.", 0, 120, 5]].map(([k, l, u, h, lo, hi, st]) => `<div class="of"><div class="ol"><b>${l}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="${lo}" max="${hi}" step="${st}"><i>${u}</i></span></div></div>`).join("")}
        <div class="mut sm" style="margin:6px 0 0">Batterie-Ladestand (optional)</div>${this._wzSel(Object.keys(this._hass.states).filter((k) => k.startsWith("sensor.") && (this._hass.states[k].attributes.device_class === "battery" || this._hass.states[k].attributes.unit_of_measurement === "%")), pv.soc_sensor, "gpvb", "", "– keiner –", PK_HINT.bat)}
        ${pv.soc_sensor ? `<div class="of"><div class="ol"><b>Heizer erst ab</b><span>Die Batterie wird zuerst geladen.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="soc_min" value="${pv.soc_min}" min="0" max="100" step="5"><i>%</i></span></div></div>` : ""}
        <div class="gst ${this._pvNow() != null ? "on" : ""}">${ic(this._pvNow() != null ? "bolt" : "info", 15)}${this._pvNow() != null ? `Aktuell ${wfmt(this._pvNow())} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Noch kein Sensor gewählt."}</div>`)}
        ${sec("pr", "chart", "Strompreis und Einspeisevergütung", `Netzbezug ${num(rp, 2)} ct/kWh, Einspeisung ${num(rf, 2)} ct/kWh. Grundlage für den Vorteil im Bericht.`, rp > 0 || rf > 0 ? "Eingerichtet" : "Offen", rp > 0 || rf > 0 ? "ok" : "", `
        ${[["price", "Strompreis (Netzbezug)", "Festpreis", "Preis pro kWh aus dem Netz."], ["feed", "Einspeisevergütung", "Festvergütung", "Vergütung pro eingespeister kWh."]].map(([k, l, fl, h]) => { const ent = pv[k + "_mode"] === "entity", sn = pv[k + "_sensor"]; return `<div class="mut sm" style="margin:6px 0 0">${l}${k === "price" ? " für den Vorteil im Bericht" : ""}</div>
        <div class="seg">${[["fix", "Festwert"], ["entity", "Entität"]].map(([m, t]) => `<button class="${(ent ? "entity" : "fix") === m ? "sel" : ""}" data-act="gpvpm" data-p="${k}" data-k="${m}">${t}</button>`).join("")}</div>
        ${ent ? `${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "monetary" || (/(kwh|wh)$/i.test(this._hass.states[e].attributes.unit_of_measurement || "") && /€|eur|ct|cent/i.test(this._hass.states[e].attributes.unit_of_measurement || "")) || e === sn)), sn, "gpvp", `data-p="${k}"`, "– keiner –", /preis|price|tarif|tibber|awattar|strom/i)}
        <div class="mut sm" style="margin:2px 0 0">${sn ? `Aktuell ${num(this._rate(k), 2)} ct/kWh${Number(pv[k]) ? ` (${fl} ${num(pv[k], 2)} ct/kWh, falls der Sensor ausfällt)` : ""}` : `Ohne Sensor gilt der ${fl}.`}</div>` : `<div class="of"><div class="ol"><b>${fl}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="0" max="100" step="0.01"><i>ct/kWh</i></span></div></div>`}`; }).join("")}`)}
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "gen") {
      const g = this._gen, rs = m.restore, u = this._upd;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Sichern &amp; Wiederherstellen</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:2px 0 4px">Eine Datei mit allen Räumen, Einstellungen, Heizplänen, Anwesenheit und dem Aussehen des Dashboards.</div>
        ${rs ? `<div class="gbox"><b>Sicherung gefunden</b>${esc(new Date(rs.created).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }))} · Version ${esc(rs.version || "?")}<br>${Object.keys(rs.rooms).length} Räume · ${Object.values(rs.plans || {}).filter((p) => p && p.entries && p.entries.length).length} Heizpläne · Aussehen · Anwesenheit<br><span class="mut">Das ersetzt die aktuellen Einstellungen.</span></div>
          <div class="foot2"><button class="btn2" data-act="rsno">Abbrechen</button><button class="btn2 pri" data-act="rsgo">Wiederherstellen</button></div>`
        : `<div class="gbtns"><button class="btn2" data-act="bk">${ic("download", 16)}Sicherung speichern</button><button class="btn2" data-act="rs">${ic("upload", 16)}Sicherung einlesen</button></div><input type="file" accept="application/json,.json" data-f="rsfile" hidden>`}
        <div class="lsec">${ic("bell", 15)}Updates</div>
        <div class="ltog"><span>Auf neue Versionen hinweisen</span><button class="sw ${g.updates !== false ? "on" : ""}" data-act="gupd" aria-pressed="${g.updates !== false}" aria-label="Update-Hinweise"></button></div>
        <div class="gst">${ic("info", 15)}Installiert ${esc(this._ver || "–")}${u ? ` · neueste ${esc(u.latest)}` : ""}<button class="lnk" data-act="chk" style="margin-left:auto">Jetzt prüfen</button></div>
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "news") {
      const u = this._upd || { latest: "", notes: [] };
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Neu in Version ${esc(u.latest)}</b><span>${u.date ? "veröffentlicht am " + esc(new Date(u.date + "T12:00:00").toLocaleDateString("de-DE")) : ""}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <ul class="news">${(u.notes || []).map(([i, t]) => `<li>${ic(i, 18)}<span>${esc(t)}</span></li>`).join("")}</ul>
        <div class="mut sm" style="margin:10px 0">Aktualisieren kannst du in HACS. Danach Home Assistant neu starten.</div>
        <div class="foot2"><button class="btn2" data-act="skipv">Überspringen</button><button class="btn2 pri" data-act="hacs">In HACS öffnen</button></div></div>`;
    } else if (m.type === "my") {
      const my = this._my(), all = this._collect(true), ids = all.map((r) => r.id);
      const ord = my.order.length ? [...my.order.filter((i) => ids.includes(i)), ...ids.filter((i) => !my.order.includes(i))] : ids, byId = Object.fromEntries(all.map((r) => [r.id, r]));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Meine Ansicht</b><span>nur für dich, andere Nutzer sehen die gemeinsame Ansicht</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="ltog"><span>Eigene Ansicht verwenden</span><button class="sw ${my.on ? "on" : ""}" data-act="mytog" aria-pressed="${my.on}" aria-label="Eigene Ansicht"></button></div>
        <div class="lsec">${ic("home", 15)}Räume</div>
        ${ord.map((id, i) => `<div class="myrow ${my.hidden.includes(id) ? "off" : ""}"><button class="sw ${my.hidden.includes(id) ? "" : "on"}" data-act="myvis" data-id="${esc(id)}" aria-label="Raum anzeigen"></button><span>${esc(byId[id].name)}</span>
          <button class="ibtn" data-act="mymv" data-id="${esc(id)}" data-d="-1" ${i === 0 ? "disabled" : ""} aria-label="Nach oben">${ic("up", 16)}</button><button class="ibtn" data-act="mymv" data-id="${esc(id)}" data-d="1" ${i === ord.length - 1 ? "disabled" : ""} aria-label="Nach unten">${ic("chev", 16)}</button></div>`).join("")}
        <div class="lsec">${ic("grid", 15)}Bereiche</div>
        ${Object.entries(BLOCKS).map(([k, l]) => `<div class="myrow"><button class="sw ${my.hb.includes(k) ? "" : "on"}" data-act="myblk" data-id="${k}" aria-label="${l} anzeigen"></button><span>${l}</span></div>`).join("")}
        <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="myreset">Zurücksetzen</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "hrep") {
      const rr = this._collect(true).find((x) => x.id === m.id) || { name: "", htr: null };
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Heizer-Bericht</b><span>${esc(rr.name)} · ${m.day.split("-").reverse().join(".")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${this._hrBody(rr, m)}</div>`;
      if (m.data && !m.loading) this._hrHover(Math.min(13 * 60, m.data.pts[m.data.pts.length - 1].t));
    } else if (m.type === "hrepall") {
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Heizer-Bericht</b><span>alle Räume · letzte 7 Tage</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${this._hrAllBody()}</div>`;
    } else if (m.type === "look") {
      const S = this._hass.states, a = this._acc(), w = this._wxCfg(), nm = (k) => S[k].attributes.friendly_name || k;
      const wl = Object.keys(S).filter((k) => k.startsWith("weather.")), sl = Object.keys(S).filter((k) => k.startsWith("sensor.") && (S[k].attributes.device_class === "temperature" || /°[CF]/.test(S[k].attributes.unit_of_measurement || "")));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Darstellung</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="lsec">${ic("palette", 15)}Akzentfarbe</div>
        <div class="swatches">${ACCENTS.map((c) => `<button class="sw2 ${a === c ? "sel" : ""}" style="background:${c}" data-act="lacc" data-k="${c}" aria-label="${c}"></button>`).join("")}<label class="cpick"><input type="color" data-f="lacc" value="${a}">Eigene</label></div>
        ${this._heroLook()}
        <div class="lsec">${ic("sun", 15)}Wetter in der Kopfkarte</div>
        <div class="ltog"><span>Außentemperatur und Wetter anzeigen</span><button class="sw ${w.on ? "on" : ""}" data-act="lwx" aria-pressed="${w.on}" aria-label="Wetter anzeigen"></button></div>
        ${w.on ? `<div class="mut sm" style="margin:0">Wetter-Entität</div>${this._wzSel(wl, w.entity, "lwxe", "", "Automatisch" + (wl[0] ? ` (${nm(wl[0])})` : ""), /wetter|weather|dwd|home/i)}
        <div class="mut sm" style="margin:0">Außentemperatur-Sensor</div>${this._wzSel(sl, w.outdoor, "lwxo", "", "Vom Wetterdienst übernehmen", PK_HINT.outdoor)}` : ""}
        <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    } else if (m.type === "opt") {
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Raumeinstellungen</b><span>${esc(m.name || r.name)} · gilt nach dem Speichern</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="osecs">${this._optBody(m)}</div>
        <div class="olinks"><button class="lnk" data-act="ohost">${ic("sliders", 15)}In den Home-Assistant-Einstellungen öffnen</button><button class="lnk dng" data-act="odel">${ic("trash", 15)}Raum entfernen</button></div>
        <div class="foot2"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="osave" ${m.busy ? "disabled" : ""}>${m.busy ? "Speichert …" : "Speichern"}</button></div></div>`;
    } else if (m.type === "rep") {
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Bericht</b><span>${esc(r.name)} · ${m.day.split("-").reverse().join(".")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        ${this._learnBox(r)}${this._repBody(r, m)}</div>`;
      const dd = box.querySelector(".rdays"); if (dd) dd.scrollLeft = m.keepScroll ?? 99999;
      if (this._repData) { const ev = this._repData.ev.find((e) => e.c === "#60a5fa"), last = this._repData.pts[this._repData.pts.length - 1].t; this._repHover(ev ? ev.t + 2 : Math.min(12 * 60, last)); }
    } else if (m.type === "grp") {
      const d = m.draft, rooms = this._collect(), owner = (id) => (this._cfg.layout.groups || []).find((g) => g.id !== d.id && (g.rooms || []).includes(id));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>${d.isNew ? "Neue Gruppe" : "Gruppe bearbeiten"}</b><span>Räume zusammenfassen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0">Name</div><input class="gname" data-f="gname" value="${esc(d.name)}" placeholder="z. B. Obergeschoss" maxlength="30">
        <div class="mut sm" style="margin:0">Symbol</div><div class="gicons">${GROUP_ICONS.map((k) => `<button class="${d.icon === k ? "sel" : ""}" data-act="gicon" data-k="${k}" aria-label="${k}">${ic(k, 22)}</button>`).join("")}</div>
        <div class="mut sm" style="margin:0">Räume in dieser Gruppe</div>
        <div class="dchips">${rooms.map((r) => { const o = owner(r.id); return `<button class="dc ${d.rooms.includes(r.id) ? "sel" : ""}" data-act="gpick" data-r="${esc(r.id)}">${esc(r.name)}${o && !d.rooms.includes(r.id) ? ` <small style="opacity:.7">· ${esc(o.name)}</small>` : ""}</button>`; }).join("")}</div>
        <div class="mut sm" style="margin:0 0 12px">Ein Raum gehört immer nur zu einer Gruppe. Nicht zugeordnete Räume stehen unter „Weitere Räume“.</div>
        <div class="foot2">${d.isNew ? "" : `<button class="btn2 del" data-act="gdel" aria-label="Gruppe löschen">${ic("trash", 17)}</button>`}<button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="gsave">Speichern</button></div></div>`;
    } else if (m.type === "why") {
      const mm = MODE[r.mode] || MODE.regelung_aus;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>${r.mode === "heizung_pausiert" ? "Warum pausiert die Heizung?" : "Warum „" + mm.t + "“?"}</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="why-l">${(r.why || []).map((w) => `<div class="wl ${w.s}"><i></i><span>${esc(w.t)}</span></div>`).join("") || `<div class="mut">Keine Angaben vorhanden.</div>`}</div>
        <div class="foot2"><button class="btn2" data-act="close">Schließen</button></div></div>`;
    } else if (m.type === "vac") {
      const d = m.draft;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Urlaub planen</b><span>Alle Räume · Absenkung ${num(d.temp, 1)} °C</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="vrow"><span>Von</span><input type="date" value="${d.from}" data-f="vfrom"></div>
        <div class="vrow"><span>Bis</span><input type="date" value="${d.to}" data-f="vto" min="${d.from}"></div>
        <div class="vrow"><span>Am Rückkehrtag vorheizen</span><button class="sw ${d.preheat ? "on" : ""}" data-act="vpre" aria-pressed="${d.preheat}"></button></div>
        ${d.preheat ? `<div class="vrow"><span>Vorheizen ab</span><input type="time" value="${d.preheat_time}" data-f="vtime" style="background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit"></div>` : ""}
        <div class="mut sm" style="margin:2px 0 0">${d.preheat ? `Am Bis-Tag gilt ab ${d.preheat_time} Uhr wieder der Heizplan.` : "Der Heizplan gilt wieder ab dem Tag nach dem Bis-Datum."}</div>
        <div class="mut sm" style="margin:10px 0 0">Die Absenktemperatur und die automatische Erkennung stellst du unter „Einstellungen“ ein.</div>
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="vsave">Urlaub starten</button></div></div>`;
    } else if (m.type === "pset") {
      const d = m.draft, persons = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Einstellungen</b><span>Anwesenheit &amp; Urlaub</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0 0 4px">Absenkung</div>
        <div class="vrow"><span>Temperatur bei Abwesenheit und Urlaub</span><div class="step"><button data-act="vtm" aria-label="kälter">${ic("minus", 18)}</button><b style="color:${heat(d.temp)}">${num(d.temp, 1)} °C</b><button data-act="vtp" aria-label="wärmer">${ic("plus", 18)}</button></div></div>
        <div class="mut sm" style="margin:14px 0 4px">Automatisch erkennen</div>
        <div class="vrow"><span>Abwesend, wenn niemand zu Hause ist</span><button class="sw ${d.auto ? "on" : ""}" data-act="vauto" aria-pressed="${d.auto}"></button></div>
        ${d.auto ? `<div class="dchips">${persons.map((e) => `<button class="dc ${d.persons.includes(e) ? "sel" : ""}" data-act="vper" data-e="${esc(e)}">${esc(this._hass.states[e].attributes.friendly_name || e)}</button>`).join("")}</div>
        <div class="vrow"><span>Nach</span><div class="step"><button data-act="vawm" aria-label="weniger">${ic("minus", 18)}</button><b>${d.away_after} Min.</b><button data-act="vawp" aria-label="mehr">${ic("plus", 18)}</button></div></div>` : ""}
        <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="psetsave">Speichern</button></div></div>`;
    } else {
      const d = m.draft, pts = points(d.entries), today = Math.floor(nowMin() / 1440);
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Heizplan</b><span>${esc(r.name)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="row"><span>Heizplan aktiv</span><button class="sw ${d.enabled ? "on" : ""}" data-act="penable" aria-label="Heizplan aktiv" aria-pressed="${d.enabled}"></button></div>
        <div class="mut sm" style="margin:0 0 6px">Beim Planstart ausgeschaltete Thermostate einschalten</div>
        <div class="seg">${[["keep", "Nein"], ["heat", "Heizen"], ["auto", "Automatik"]].map(([k, l]) => `<button class="${d.mode === k ? "sel" : ""}" data-act="pmode" data-k="${k}">${l}</button>`).join("")}</div>
        <div class="mut sm" style="margin:0 0 4px">Woche · Tag antippen, um dessen Schaltpunkte zu markieren</div>
        ${pts.length ? `<div class="wax"><span></span><div><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div><span></span></div>
        <div class="week">${DAYS.map((x, k) => { const sg = segs(pts, k), lo = Math.min(...sg.map((q) => q.t)), hi = Math.max(...sg.map((q) => q.t)); return `<button class="wd ${m.day === k ? "sel" : ""} ${k === today ? "today" : ""}" data-act="pday" data-d="${k}" aria-pressed="${m.day === k}" aria-label="${DAYS_LONG[k]}"><span>${x}</span>${barRow(pts, k, k === today ? nowMin() : null)}<em>${lo === hi ? num(lo, 1) + "°" : num(lo, 1) + "–" + num(hi, 1) + "°"}</em></button>`; }).join("")}</div>` : `<div class="mut">Noch keine Schaltpunkte.</div>`}
        <div class="mut sm">Farbe = Temperatur</div>
        ${d.entries.map((e, i) => `<div class="sp ${m.day != null && !e.days.includes(m.day) ? "dim" : ""}"><div class="sp1">
          <input type="time" value="${e.time}" data-i="${i}" data-f="time" aria-label="Uhrzeit">
          <div class="step"><button data-act="tmin" data-i="${i}" aria-label="kälter">${ic("minus", 18)}</button><b style="color:${heat(e.temp)}">${num(e.temp, 1)} °C</b><button data-act="tplus" data-i="${i}" aria-label="wärmer">${ic("plus", 18)}</button></div>
          <button class="ibtn" data-act="pdel" data-i="${i}" aria-label="Schaltpunkt löschen">${ic("trash", 17)}</button></div>
          <div class="mut sm" style="margin:2px 0 2px">Gilt an (mehrere Tage möglich)</div>
          <div class="dchips sm">${DAYS.map((x, k) => `<button class="dc ${e.days.includes(k) ? "sel" : ""}" data-act="pdc" data-i="${i}" data-d="${k}">${x}</button>`).join("")}</div>
          <div class="quick"><button class="lnk" data-act="pdq" data-i="${i}" data-q="wk">Mo–Fr</button><button class="lnk" data-act="pdq" data-i="${i}" data-q="we">Sa–So</button><button class="lnk" data-act="pdq" data-i="${i}" data-q="all">Alle Tage</button><button class="lnk" data-act="pdup" data-i="${i}">${ic("copy", 14)}Kopie</button></div></div>`).join("")}
        <div class="btns"><button class="lnk" data-act="padd">${ic("plus", 16)}Schaltpunkt</button><button class="lnk" data-act="ptpl">Vorlage laden</button></div>
        <div class="foot2"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="psave">Speichern</button></div></div>`;
    }
    const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top;
  }

  /* ---------------- Verschieben per Ziehen ---------------- */
  _scroller() {
    let n = this;
    while (n) {
      if (n instanceof HTMLElement) { const s = getComputedStyle(n); if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 2) return n; }
      n = n.parentElement || (n.getRootNode && n.getRootNode().host);
    }
    return document.scrollingElement;
  }
  _dragStart(e, h) {
    if (e.button !== undefined && e.button > 0) return;
    const item = h.closest("[data-sort]"); if (!item) return;
    e.preventDefault();
    const rc = item.getBoundingClientRect(), ghost = item.cloneNode(true);
    ghost.classList.add("ghost"); ghost.removeAttribute("data-sort");
    Object.assign(ghost.style, { left: rc.left + "px", top: rc.top + "px", width: rc.width + "px", height: rc.height + "px", overflow: "hidden" });
    this.shadowRoot.appendChild(ghost); item.classList.add("dragging");
    this._drag = { item, container: item.parentElement, group: item.dataset.sort, ghost, dx: e.clientX - rc.left, dy: e.clientY - rc.top, x: e.clientX, y: e.clientY, t: null, after: false };
    this._dragging = true;
    try { h.setPointerCapture(e.pointerId); } catch (_) { /* egal */ }
    this._mv = (ev) => { ev.preventDefault(); const d = this._drag; d.x = ev.clientX; d.y = ev.clientY; d.ghost.style.left = d.x - d.dx + "px"; d.ghost.style.top = d.y - d.dy + "px"; this._retarget(); };
    this._up = () => this._dragEnd(true);
    this._cancel = () => this._dragEnd(false);
    window.addEventListener("pointermove", this._mv, { passive: false });
    window.addEventListener("pointerup", this._up);
    window.addEventListener("pointercancel", this._cancel);
    const loop = () => {
      if (!this._dragging) return;
      const d = this._drag, sc = this._scroller();
      if (sc) { if (d.y < 110) sc.scrollTop -= (110 - d.y) / 5; else if (d.y > innerHeight - 110) sc.scrollTop += (d.y - (innerHeight - 110)) / 5; }
      this._retarget(); this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
    this._retarget();
  }
  _retarget() {
    const d = this._drag; if (!d) return;
    const sibs = [...d.container.children].filter((c) => c !== d.item && c.dataset.sort === d.group);
    sibs.forEach((s) => s.classList.remove("drop-before", "drop-after"));
    let best = null, bd = 1e9;
    for (const s of sibs) {
      const r = s.getBoundingClientRect();
      if (d.x >= r.left && d.x <= r.right && d.y >= r.top && d.y <= r.bottom) { best = s; break; }
      const dist = Math.hypot(d.x - (r.left + r.width / 2), d.y - (r.top + r.height / 2));
      if (dist < bd) { bd = dist; best = s; }
    }
    d.t = best; if (!best) return;
    const r = best.getBoundingClientRect(), cols = getComputedStyle(d.container).gridTemplateColumns.split(" ").length;
    const sameRow = Math.abs(r.top + r.height / 2 - d.y) < r.height / 2;
    d.after = (d.group === "room" || d.group === "mublk" || d.group === "hzblk") && cols > 1 && sameRow ? d.x > r.left + r.width / 2 : d.y > r.top + r.height / 2;
    best.classList.add(d.after ? "drop-after" : "drop-before");
  }
  _dragEnd(commit) {
    const d = this._drag; if (!d) return;
    window.removeEventListener("pointermove", this._mv); window.removeEventListener("pointerup", this._up); window.removeEventListener("pointercancel", this._cancel);
    cancelAnimationFrame(this._raf); d.ghost.remove(); d.item.classList.remove("dragging");
    [...d.container.children].forEach((s) => s.classList.remove("drop-before", "drop-after"));
    if (commit && d.t) {
      d.after ? d.t.after(d.item) : d.t.before(d.item);
      const ids = [...d.container.children].filter((c) => c.dataset.sort === d.group).map((c) => c.dataset.id);
      if (d.group === "room") {
        const all = this._collect().map((r) => r.id), slots = all.map((id, i) => (ids.includes(id) ? i : -1)).filter((i) => i >= 0);
        slots.forEach((pos, k) => (all[pos] = ids[k])); this._cfg.layout.rooms = all;
      } else if (d.group === "mublk") this._cfg.layout.mu = { ...(this._cfg.layout.mu || {}), order: ids };
      else if (d.group === "hzblk") { const h = this._hzCfg(); this._cfg.layout.start = { ...(this._cfg.layout.start || {}), order: [...ids, ...h.order.filter((x) => !ids.includes(x))] }; }
      else this._cfg.layout.blocks = ids;
      this._saveLayout();
    }
    this._drag = null; this._dragging = false; this._render();
  }

  /* ================= Module (Modul 2: Warmwasser & Zirkulation, weitere Module) ================= */
  _mdState() {
    if (!this._mds) {
      let act = "fh"; try { act = localStorage.getItem("fh_mod_active") || "fh"; } catch (_) { /* Speicher gesperrt */ }
      this._mds = { active: act, on: { ww: true, en: true, gs: true, lu: false, rb: false, wp: false, ev: false, wx: false, ga: false, sf: false, pl: false, bt: false, dt: false, wa: false, sp: false }, ext: [], ww: JSON.parse(JSON.stringify(WW_DEF)), loaded: false };
    }
    return this._mds;
  }
  _mdApply(r) {
    const s = this._mdState();
    if (r && r.modules) {
      s.on = { ww: true, en: true, gs: true, lu: false, rb: false, wp: false, ev: false, wx: false, ga: false, sf: false, pl: false, bt: false, dt: false, wa: false, sp: false, ...(r.modules.on || {}) }; s.ext = Array.isArray(r.modules.ext) ? r.modules.ext : [];
      if (r.modules.gs) this._mdState().gs = r.modules.gs;
      if (r.modules.ev) { const ev = this._mdState().ev = { brand: "", model: "", body: "limousine", color: "blue", ...r.modules.ev }; ev.ent = { soc: "", odo: "", range: "", plug: "", power: "", charging: "", ...(r.modules.ev.ent || {}) }; }
      const en = r.modules.energy, E = this._enState(); E.on = s.on.en !== false;
      if (en) {
        const has = Object.values(en.ent || {}).some(Boolean); let mig = false; try { mig = localStorage.getItem("fh_energy_mig") === "1"; } catch (_) { /* Speicher gesperrt */ }
        if (has || mig) { E.ent = { ...E.ent, ...(en.ent || {}) }; E.sign = en.sign || ""; E.bsign = en.bsign || "charge"; E.bmode = en.bmode === "two" ? "two" : "one"; E.pvn = en.pvn || ""; E.pv2n = en.pv2n || ""; }
        else if (Object.values(E.ent).some(Boolean) && this._admin()) { try { localStorage.setItem("fh_energy_mig", "1"); } catch (_) { /* Speicher gesperrt */ } this._mdSave(); }
        else { try { localStorage.setItem("fh_energy_mig", "1"); } catch (_) { /* Speicher gesperrt */ } }
      }
    }
    const w = r && r.wasser; if (!w) return;
    const d = JSON.parse(JSON.stringify(WW_DEF)), c = w.ww || {}, st = w.status || {}, keep = { day: s.ww.day };
    s.ww = { ...d, ...c, ent: { ...d.ent, ...(c.ent || {}) }, heat: { ...d.heat, ...(c.heat || {}) }, circ: { ...d.circ, ...(c.circ || {}) }, leg: { ...d.leg, ...(c.leg || {}), last: st.leg_last || null }, pv: { ...d.pv, ...(c.pv || {}) }, boost: !!st.boost, circ5: !!st.circ5, away: !!st.away, info: { want: st.want, leg: !!st.leg_running }, ...keep };
    s.loaded = true;
  }
  _mdBackup() { const W = this._mdState().ww, ww = JSON.parse(JSON.stringify(W)); ["boost", "circ5", "away", "day", "info"].forEach((k) => delete ww[k]); delete ww.leg.last; const E = this._enState(); return { modules: { on: this._mdState().on, ext: this._mdState().ext, gs: this._gsState(), ev: this._evState(), energy: { ent: E.ent, sign: E.sign || "", bsign: E.bsign, bmode: E.bmode === "two" ? "two" : "one", pvn: E.pvn || "", pv2n: E.pv2n || "" } }, ww }; }
  _mdSave() {
    clearTimeout(this._mdT);
    this._mdT = setTimeout(() => {
      this._mdT = null;
      if (!this._hass) return; const b = this._mdBackup();
      this._hass.callWS({ type: "fenster_heizung/set_modules", modules: b.modules })
        .then(() => this._hass.callWS({ type: "fenster_heizung/set_wasser", ww: b.ww }))
        .then((r) => { this._mdPoll(r); })
        .catch(() => this._toast("Modul-Einstellung konnte nicht gespeichert werden"));
    }, 500);
  }
  _mdPoll(r) {
    if (!this._hass) return;
    const apply = (x) => { if (!x || this._dragging || (this._modal && ["wwset", "wwsch", "mods", "enset", "gsset", "evset"].includes(this._modal.type)) || this._mdT) return; this._mdApply(x); this._render(); };
    if (r) { apply(r); return; }
    this._hass.callWS({ type: "fenster_heizung/get_modules" }).then(apply).catch(() => {});
  }
  _mdActiveSet(id) { const s = this._mdState(); s.active = id; try { localStorage.setItem("fh_mod_active", id); } catch (_) { /* Speicher gesperrt */ } }
  _mdList() { const s = this._mdState(); return [...(this._hzOn() ? [{ ...MOD_HOME, tag: this._hzGreet() }] : []), MODS[0], ...(s.on.ww ? [MODS[1]] : []), ...(this._enOn() ? [MODS[2]] : []), ...(s.on.gs !== false ? [MODS[3]] : []), ...MODS.filter((m) => m.beta && s.on[m.id] === true), ...(this._labOn("mm") ? [MOD_MU] : []), ...(this._labOn("li") ? [MOD_LI] : []), ...s.ext.filter((x) => x.on).map((x) => ({ id: x.id, n: 0, name: x.name, short: x.name, icon: "puzzle", tag: "Externes Modul", ext: x }))]; }
  _mdActive() {
    const s = this._mdState();
    if (!this._hzDec && this._cfgReady) {
      this._hzDec = true; let q = ""; try { q = new URLSearchParams(location.search).get("modul") || ""; } catch (_) { /* kein Zugriff */ }
      if (q && this._mdList().some((m) => m.id === q)) s.active = q;
      else if (this._hzOn() && this._hzCfg().open === "start") s.active = "st";
    }
    return this._mdList().some((m) => m.id === s.active) ? s.active : this._hzOn() ? "st" : "fh";
  }
  _stDone(id) {
    if (id === "fh") { const n = this._collect().length; return n ? n + (n === 1 ? " Raum" : " Räume") : ""; }
    if (id === "gs") { const n = this._gsState().devices.length; return n ? n + (n === 1 ? " Gerät" : " Geräte") : ""; }
    const E = id === "ww" ? (this._mdState().ww.ent || {}) : (this._enState().ent || {});
    return Object.values(E).some((v) => v) ? "Eingerichtet" : "";
  }
  _fhOpenSet() {
    if (!this._fhOpen) { let a = null; try { a = JSON.parse(localStorage.getItem("fh-open") || "null"); } catch (_) {} this._fhOpen = new Set(Array.isArray(a) ? a : [this._pv().sensor ? "sum" : "pv"]); }
    return this._fhOpen;
  }
  _stRender() {
    const sr = this.shadowRoot, s = this._mdState();
    const row = (icn, ttl, txt, act, k, extra) => `<button class="sxrow" data-act="${act}"${k ? ` data-k="${k}"` : ""}><span class="sxi">${ic(icn, 20)}</span><span class="sxt"><b>${ttl}</b><small>${txt}</small></span>${extra || ""}<span class="sxg">${ic("chev", 16)}</span></button>`;
    const isOn = (m) => m.id === "fh" || (m.id === "ww" ? s.on.ww : m.beta ? s.on[m.id] === true : m.id === "gs" ? s.on.gs !== false : this._enOn());
    const act = MODS.filter(isOn), off = MODS.filter((m) => !isOn(m));
    const mods = act.map((m) => {
      const d = this._stDone(m.id), chip = m.beta ? `<em class="sxc ${STG[modSt(m)].c}">${STG[modSt(m)].t}</em>` : d ? `<em class="sxc ok">${esc(d)}</em>` : `<em class="sxc">Offen</em>`;
      return row(m.icon, `<i>Modul ${m.n}</i> ${esc(m.name)}`, esc(MOD_SET[m.id].txt), MOD_SET[m.id].act, "", chip);
    }).join("");
    const ext = s.ext.map((x) => row("puzzle", `<i>Eigenes Modul</i> ${esc(x.name)}`, esc(x.url), "mdmgr", "", `<em class="sxc ${x.on ? "ok" : "off"}">${x.on ? "An" : "Aus"}</em>`)).join("");
    const offG = off.map((m) => `<button class="sxoff" data-act="mdtog" data-k="${m.id}"><span class="sxi">${ic(m.icon, 18)}</span><span class="sxt"><b>${esc(m.name)}</b><small>Modul ${m.n}</small></span><em class="sxc">Einschalten</em></button>`).join("");
    const soon = MOD_SOON.map((x) => `<div class="sxoff soon"><span class="sxi">${ic(x[0], 18)}</span><span class="sxt"><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span><em class="sxc">Bald</em></div>`).join("");
    const grp = (ico, ttl, sub, body) => `<div class="sxh2"><span class="sxhi">${ic(ico, 16)}</span><b>${ttl}</b><small>${sub}</small></div>${body}`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Einstellungen</b><span><em class="tag">Alle Module an einem Ort</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn pri" data-act="mdstx">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap">
        <div class="sxw">
        <div class="sxsum"><div><b>${act.length}</b><span>${act.length === 1 ? "Modul aktiv" : "Module aktiv"}</span></div><div><b>${this._collect().length}</b><span>Räume</span></div><div><b>${this._ortPersons().length}</b><span>Personen</span></div><div><b>${this._ver ? esc(this._ver) : "–"}</b><span>Version</span></div></div>
        ${grp("tools", "Allgemein", "Einrichtung und Verbindungen", `<div class="card sxl">
          ${row("tools", "Einrichtungsassistent", "Räume, Ventile und Fenster zuordnen", "wz")}
          ${row("puzzle", "Store &amp; Integrationen", "Dienste und Geräte entdecken, verbinden und verwalten", "igopen")}
          ${row("flask", "Labs", "Experimentelle Funktionen ansehen und einschalten", "labopen", "", `<em class="sxc ${this._labCount() ? "ok" : "off"}">${this._labCount() ? this._labCount() + " an" : "Aus"}</em>`)}
          ${row("users", "Personen &amp; Standort", "Personen, iCloud-Standort und Home-Zone auf der Karte", "ortopen", "", this._ortChip())}
          ${this._labOn("tg") && adm ? row("nfc", "Tags &amp; Karten", "RFID-Karten und NFC-Sticker anlernen und zuordnen", "tgxopen") : ""}
          ${row("palette", "Darstellung", "Akzentfarbe, Wetter, Raumsymbole", "look")}
          ${this._spnRow()}</div>`)}
        ${grp("layers", "Meine Module", `${act.length} aktiv · Einstellungen je Modul`, `<div class="card sxl">${mods}${ext}</div>`)}
        ${off.length || soon ? grp("plus", "Weitere Module", "Ausgeschaltet – mit einem Tipp einschalten", `<div class="sxgrid">${offG}${soon}</div>`) : ""}
        ${grp("shield", "System", "Sichern, prüfen, verwalten", `<div class="card sxl">
          ${row("sliders", "Sichern &amp; Wiederherstellen", "Einstellungen als Datei sichern und zurückspielen", "gen")}
          ${row("shield", "Diagnose", "Ventile, Fenster und Verbindung prüfen", "diag")}
          ${row("puzzle", "Module verwalten", "Module ein- und ausschalten, eigene Module hinzufügen", "mdmgr")}</div>`)}</div>
      </div>`;
  }
  /* ---------------- Personen & Standort: iCloud-Ortung, Personen-Einstellungen, Home-Zone auf der Karte ---------------- */
  _ort() {
    if (!this._ortS) {
      const h = this._hass, hz = h && h.states["zone.home"], hc = (h && h.config) || {};
      this._ortS = { zdef: { lat: Number(hz ? hz.attributes.latitude : hc.latitude) || 51.1657, lon: Number(hz ? hz.attributes.longitude : hc.longitude) || 10.4515, r: Math.round(Number(hz && hz.attributes.radius) || 150) }, draft: null, map: null };
    }
    const pr = this._cfg.presence || {};
    this._ortS.zone = pr.zone || this._ortS.zdef; this._ortS.per = pr.people || {}; this._ortS.own = !!pr.zone;
    return this._ortS;
  }
  _ortZone() { return this._ort().zone; }
  _ortDist(lat, lon) {
    const z = this._ortZone(), R = 6371000, rad = (x) => (x * Math.PI) / 180, dl = rad(lat - z.lat), dn = rad(lon - z.lon);
    const a = Math.sin(dl / 2) ** 2 + Math.cos(rad(z.lat)) * Math.cos(rad(lat)) * Math.sin(dn / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  _ortFmtD(m) { return m == null ? "–" : m < 1000 ? `${Math.round(m / 10) * 10} m` : `${num(m / 1000, m < 10000 ? 1 : 0)} km`; }
  _ortAgo(iso) { const t = iso ? new Date(iso).getTime() : NaN; if (!isFinite(t)) return ""; const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; }
  _ortTracker(id) {
    const h = this._hass, s = h.states[id]; if (!s) return { id, name: id, missing: true };
    const a = s.attributes || {}, reg = (h.entities || {})[id], cloud = (reg && reg.platform === "icloud") || /icloud/i.test(id) || a.source_type === "gps" && /iphone|ipad|apple/i.test(String(a.friendly_name || id));
    const bat = a.battery_level ?? a.battery;
    return { id, name: a.friendly_name || id, state: s.state, icloud: !!cloud, bat: bat != null && isFinite(Number(bat)) ? Number(bat) : null, acc: a.gps_accuracy != null ? Number(a.gps_accuracy) : null, lat: a.latitude != null ? Number(a.latitude) : null, lon: a.longitude != null ? Number(a.longitude) : null, seen: this._ortAgo(s.last_updated || s.last_changed) };
  }
  _ortPersons() {
    const h = this._hass, st = h.states, o = this._ort(), COL = ["#14b8a6", "#6366f1", "#f59e0b", "#ec4899", "#22c55e", "#0ea5e9"];
    return Object.keys(st).filter((e) => e.startsWith("person.")).map((id, i) => {
      const s = st[id], a = s.attributes || {}, cfg = o.per[id] || {};
      const trackers = cfg.trackers ? cfg.trackers.slice() : [...new Set([...(a.device_trackers || []), ...(a.source ? [a.source] : [])])].filter((x) => x.startsWith("device_tracker."));
      const tr = trackers.map((t) => this._ortTracker(t));
      const good = tr.filter((x) => x.lat != null && (cfg.acc ?? 100) >= (x.acc ?? 0));
      let lat = a.latitude != null ? Number(a.latitude) : null, lon = a.longitude != null ? Number(a.longitude) : null;
      if (lat == null && good[0]) { lat = good[0].lat; lon = good[0].lon; }
      const dist = lat != null ? this._ortDist(lat, lon) : null, inZone = o.own && dist != null && dist <= o.zone.r;
      const home = s.state === "home" || inZone || tr.some((x) => x.state === "home") || (cfg.wifi && (st[cfg.wifi] || {}).state === "home");
      return { id, name: cfg.label || a.friendly_name || id, state: s.state, col: COL[i % COL.length], tr, lat, lon, dist, home, count: cfg.count !== false, acc: cfg.acc ?? 100, wifi: cfg.wifi || "", noSrc: !tr.length && !cfg.wifi, unavailable: s.state === "unavailable" || s.state === "unknown" };
    });
  }
  _ortChip() {
    const P = this._ortPersons(), n = P.filter((x) => !x.noSrc).length;
    return P.length ? `<em class="sxc ${n === P.length ? "ok" : ""}">${n} von ${P.length} mit Ortung</em>` : `<em class="sxc">Offen</em>`;
  }
  /* Karte: eigene Kachelberechnung (OpenStreetMap), ohne Zusatzbibliothek */
  _ortPx(lat, lon, z) { const n = 256 * 2 ** z, sn = Math.sin((lat * Math.PI) / 180); return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + sn) / (1 - sn)) / (4 * Math.PI)) * n]; }
  _ortLL(x, y, z) { const n = 256 * 2 ** z, lon = (x / n) * 360 - 180, lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI; return [lat, lon]; }
  _ortMapInner(c, z, zone, dots, showZone = true) {
    const [cx, cy] = this._ortPx(c.lat, c.lon, z), n = 2 ** z, tx0 = Math.floor(cx / 256), ty0 = Math.floor(cy / 256);
    let t = "";
    for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) {
      const tx = tx0 + dx, ty = ty0 + dy; if (ty < 0 || ty >= n) continue;
      const X = ((tx % n) + n) % n;
      t += `<img class="otile" alt="" draggable="false" src="https://tile.openstreetmap.org/${z}/${X}/${ty}.png" style="left:calc(50% + ${Math.round(tx * 256 - cx)}px);top:calc(50% + ${Math.round(ty * 256 - cy)}px)">`;
    }
    const mpp = (156543.03392 * Math.cos((c.lat * Math.PI) / 180)) / 2 ** z, rp = Math.max(6, zone.r / mpp);
    const d = dots.map((p) => { const [px, py] = this._ortPx(p.lat, p.lon, z); return `<div class="odot" style="left:calc(50% + ${Math.round(px - cx)}px);top:calc(50% + ${Math.round(py - cy)}px);background:${p.col}" title="${esc(p.name)}">${esc(p.name.slice(0, 1).toUpperCase())}</div>`; }).join("");
    return `<div class="otiles">${t}</div>${showZone ? `<div class="ozone" style="width:${rp * 2}px;height:${rp * 2}px;left:calc(50% + ${Math.round(this._ortPx(zone.lat, zone.lon, z)[0] - cx)}px);top:calc(50% + ${Math.round(this._ortPx(zone.lat, zone.lon, z)[1] - cy)}px)"></div>` : ""}${d}`;
  }
  _ortZoomFor(r) { const lat = this._ortZone().lat; for (let z = 18; z >= 12; z--) { if (r / ((156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** z) <= 70) return z; } return 12; }
  _ortRender() {
    const sr = this.shadowRoot, o = this._ort(), P = this._ortPersons(), z = o.zone, adm = this._admin();
    const withSrc = P.filter((x) => x.dist != null && x.lat != null), inZ = P.filter((x) => x.home).length;
    const cloud = P.flatMap((x) => x.tr).filter((x) => x.icloud), clouds = [...new Set(cloud.map((x) => x.id))].length;
    const pres = this._pres();
    const per = P.map((x) => {
      const t0 = x.tr[0], st = x.unavailable ? ["off", "Nicht erreichbar"] : x.home ? ["home", "Zu Hause"] : x.dist != null ? ["away", `Unterwegs · ${this._ortFmtD(x.dist)}`] : ["off", "Keine Ortung"];
      const src = x.tr.length ? x.tr.map((q) => `${q.icloud ? "iCloud" : "Gerät"}${q.bat != null ? ` · Akku ${Math.round(q.bat)} %` : ""}${q.seen ? ` · ${q.seen}` : ""}`).slice(0, 1).join("") : x.wifi ? "Nur WLAN-Erkennung" : "Noch keine Quelle gewählt";
      return `<div class="oper"><span class="oav" style="background:${x.col}">${esc(x.name.slice(0, 1).toUpperCase())}</span><div class="opi"><b>${esc(x.name)}</b><small>${esc(t0 ? t0.name + " · " : "")}${esc(src)}</small><small>${x.count ? "Zählt für automatisches Abwesend" : "Zählt nicht für automatisches Abwesend"}</small></div><span class="ost ${st[0]}">${esc(st[1])}</span><button class="ibtn" data-act="ortper" data-k="${esc(x.id)}" aria-label="${esc(x.name)} bearbeiten">${ic("pencil", 17)}</button></div>`;
    }).join("");
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Personen &amp; Standort</b><span><em class="tag">Wer ist zu Hause und wo ist das Zuhause</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn pri" data-act="ortback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw">
        <div class="card ocard"><h2>${ic("pin", 18)}Standort-Quelle</h2>
          <div class="oper" style="padding-top:0"><span class="oav" style="background:#64748b">${ic("cloud", 22)}</span><div class="opi"><b>Apple iCloud (Wo ist?)</b><small>${clouds ? `${clouds} iCloud-Gerät${clouds > 1 ? "e" : ""} gefunden. Der Standort kommt von der Home-Assistant-Integration „Apple iCloud“.` : "Noch kein iCloud-Gerät gefunden. Richte zuerst die Home-Assistant-Integration „Apple iCloud“ ein."}</small></div><span class="ost ${clouds ? "home" : "off"}">${clouds ? "Verbunden" : "Nicht eingerichtet"}</span></div>
          <details class="ohint"><summary>iPhone: Das muss stimmen</summary><ol>
            <li><b>Wo ist? und Standortdienste an.</b> Auf dem iPhone: Einstellungen → Apple-Account → Wo ist? → „Mein iPhone suchen“ an. Dazu Datenschutz &amp; Sicherheit → Ortungsdienste an.</li>
            <li><b>Zwei-Faktor-Anmeldung.</b> Home Assistant fragt beim Einrichten einen sechsstelligen Code ab, der auf einem vertrauenswürdigen Apple-Gerät erscheint. Apple beendet die Sitzung gelegentlich, dann musst du dich in Home Assistant erneut anmelden.</li>
            <li><b>Jede Person mit eigener Apple-ID</b> bekommt in Home Assistant einen eigenen Eintrag „Apple iCloud“. Die Geräte stammen aus dem jeweils angemeldeten Konto.</li>
            <li><b>Die Aktualisierung ist nicht sekundengenau.</b> Die Integration fragt in einem wechselnden Takt ab, abhängig von Zone, Entfernung und Akkustand. Der Stromsparmodus des iPhones kann Standortmeldungen zusätzlich verzögern.</li>
            <li><b>Zusätzlich das WLAN nutzen.</b> Als zweite Quelle bei der Person ist ein Router- oder Ping-Gerät sehr zuverlässig, wenn das Handy im Haus ist. Die Person gilt als zu Hause, sobald eine Quelle „zu Hause“ meldet.</li>
            <li><b>Datenschutz.</b> „Strom &amp; Wärme“ nutzt nur „zu Hause“ oder „unterwegs“ und die Entfernung zur Home-Zone. Es wird kein Standortverlauf gespeichert.</li></ol></details></div>
        <div class="card ocard"><h2>${ic("home", 18)}Home-Zone</h2>
          <div class="omap sm" id="omap-main">${this._ortMapInner(z, this._ortZoomFor(Math.max(z.r, ...withSrc.map((x) => Math.min(x.dist, 2000)).concat([0])) * 0.9 || z.r), z, withSrc)}<div class="opin">${ic("pin", 34)}</div><span class="oatt">© OpenStreetMap-Mitwirkende</span></div>
          <div class="ocoord"><span>Radius <b>${z.r} m</b></span><span>Breite <b>${num(z.lat, 5)}</b></span><span>Länge <b>${num(z.lon, 5)}</b></span><span>In der Zone <b>${inZ} von ${P.length}</b></span></div>
          <div class="mut sm" style="margin:8px 0 0">Die Zone gilt für „Anwesenheit &amp; Urlaub“ und für die automatische Erkennung. Eine Person zählt als zu Hause, wenn ihr Standort in der Zone liegt oder Home Assistant „zu Hause“ meldet.${o.own ? "" : " Noch keine eigene Zone festgelegt: Es gilt vorerst die Zone von Home Assistant."}</div>
          ${adm ? `<div class="plnk"><button class="lnk" data-act="ortzone">${ic("pencil", 16)}Home-Zone auf der Karte festlegen</button></div>` : ""}</div>
        <div class="card ocard"><h2>${ic("users", 18)}Personen im Haushalt</h2>${per || `<div class="mut">Keine Personen gefunden. Lege sie in Home Assistant unter Einstellungen → Personen an.</div>`}
          <div class="mut sm" style="margin-top:8px">${pres.auto ? `Der Haushalt wird abwesend, wenn alle zählenden Personen ${pres.away_after} Min. nicht zu Hause sind.` : "Die automatische Erkennung ist aus (Anwesenheit &amp; Urlaub → Einstellungen)."}</div></div>
      </div></div>`;
  }
  _ortPerModal() {
    const d = this._ort().draft, h = this._hass, p = this._ortPersons().find((x) => x.id === d.id) || { name: d.id }, all = Object.keys(h.states).filter((e) => e.startsWith("device_tracker.")).filter((e) => !d.trackers.includes(e)).sort((a, b) => Number(this._ortTracker(b).icloud) - Number(this._ortTracker(a).icloud));
    const wifi = Object.keys(h.states).filter((e) => e.startsWith("device_tracker.") || e.startsWith("binary_sensor.")).sort();
    const tr = d.trackers.map((id) => { const q = this._ortTracker(id); return `<div class="otr"><span class="oav" style="width:36px;height:36px;background:#64748b">${ic("user", 18)}</span><div class="opi"><b>${esc(q.name)} ${q.icloud ? `<span class="ocp">iCloud</span>` : ""}</b><small>${q.missing ? "Entität nicht gefunden" : [q.state === "home" ? "Zu Hause" : q.state === "not_home" ? "Unterwegs" : q.state, q.bat != null ? `Akku ${Math.round(q.bat)} %` : "", q.acc != null ? `Genauigkeit ${Math.round(q.acc)} m` : "", q.seen].filter(Boolean).join(" · ")}</small></div><button class="ibtn" data-act="ortrm" data-k="${esc(id)}" aria-label="Quelle entfernen">${ic("trash", 17)}</button></div>`; }).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(p.name)}</b><span>${esc(d.id)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("user", 15)}Name</div>
      <input class="osel" type="text" data-f="ortlabel" maxlength="30" value="${esc(d.label)}" placeholder="${esc((h.states[d.id].attributes || {}).friendly_name || d.id)}">
      <div class="lsec">${ic("pin", 15)}Standortquellen</div>
      ${tr || `<div class="mut sm">Noch keine Quelle. Wähle das iPhone aus der Liste.</div>`}
      <select class="osel" data-f="ortadd" aria-label="Gerät hinzufügen"><option value="">+ Gerät hinzufügen …</option>${all.map((e) => { const q = this._ortTracker(e); return `<option value="${esc(e)}">${q.icloud ? "iCloud · " : ""}${esc(q.name)} (${esc(e)})</option>`; }).join("")}</select>
      <div class="mut sm">iCloud-Geräte stehen oben. Mehrere Quellen: Die Person ist zu Hause, sobald eine davon „zu Hause“ meldet.</div>
      <div class="lsec">${ic("shield", 15)}WLAN- oder Router-Erkennung (optional)</div>
      <select class="osel" data-f="ortwifi" aria-label="WLAN-Erkennung"><option value="">Keine</option>${wifi.map((e) => `<option value="${esc(e)}" ${d.wifi === e ? "selected" : ""}>${esc((h.states[e].attributes || {}).friendly_name || e)} (${esc(e)})</option>`).join("")}</select>
      <div class="lsec">${ic("sliders", 15)}Regeln</div>
      <div class="vrow"><span>Zählt für automatisches Abwesend</span><button class="sw ${d.count ? "on" : ""}" data-act="ortcount" aria-pressed="${d.count}" aria-label="Zählt für Abwesenheit"></button></div>
      <div class="vrow"><span>Ungenaue Standorte ignorieren ab</span><div class="step"><button data-act="ortacc" data-k="-50" aria-label="weniger">${ic("minus", 18)}</button><b>${d.acc} m</b><button data-act="ortacc" data-k="50" aria-label="mehr">${ic("plus", 18)}</button></div></div>
      <div class="mut sm">Meldet das iPhone eine schlechtere Genauigkeit, wird die Position nicht für die Home-Zone benutzt.</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="ortpsave">Speichern</button></div></div>`;
  }
  _ortZoneModal() {
    const o = this._ort(), m = o.map, P = this._ortPersons().filter((x) => x.lat != null), h = this._hass, hc = h.config || {};
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Home-Zone</b><span>Karte verschieben, der Pin zeigt dein Zuhause</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="omap" id="omap-edit">${this._ortMapInner(m, m.z, { lat: m.lat, lon: m.lon, r: m.r }, P)}<div class="opin">${ic("pin", 34)}</div><div class="ozb"><button data-act="ortz" data-k="1" aria-label="Vergrößern">+</button><button data-act="ortz" data-k="-1" aria-label="Verkleinern">−</button></div><span class="oatt">© OpenStreetMap-Mitwirkende</span></div>
      <div class="ocoord"><span>Breite <b id="olat">${num(m.lat, 5)}</b></span><span>Länge <b id="olon">${num(m.lon, 5)}</b></span></div>
      <div class="vrow" style="margin-top:8px"><span>Radius</span><b id="orv">${m.r} m</b></div>
      <input class="orng" type="range" min="30" max="1000" step="10" value="${m.r}" data-f="ortr" aria-label="Radius der Home-Zone">
      <div class="plnk"><button class="lnk" data-act="ortha">${ic("home", 16)}Standort von Home Assistant übernehmen</button><button class="lnk" data-act="ortme">${ic("pin", 16)}Position einer Person übernehmen</button></div>
      <div class="mut sm" style="margin:6px 0 0">Tipp: Ein Radius von 100 bis 200 m ist für iCloud sinnvoll, weil die Position des iPhones einige Meter abweichen kann. Zu klein, und die Person gilt am Gartentor schon als unterwegs.${hc.latitude ? "" : ""}</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="ortzsave">Zone speichern</button></div></div>`;
  }
  _ortBind() {
    const box = this.shadowRoot.getElementById("modal"), el = box && box.querySelector("#omap-edit"); if (!el || el._ob) return; el._ob = true;
    let drag = null, raf = 0;
    const redraw = () => { raf = 0; const o = this._ort(), m = o.map; const inner = el.querySelector(".otiles"); const html = this._ortMapInner(m, m.z, { lat: m.lat, lon: m.lon, r: m.r }, this._ortPersons().filter((x) => x.lat != null)); const tmp = document.createElement("div"); tmp.innerHTML = html; el.querySelectorAll(".otiles,.ozone,.odot").forEach((n) => n.remove()); [...tmp.children].reverse().forEach((n) => el.insertBefore(n, el.firstChild)); const la = box.querySelector("#olat"), lo = box.querySelector("#olon"); if (la) la.textContent = num(m.lat, 5); if (lo) lo.textContent = num(m.lon, 5); };
    el.addEventListener("pointerdown", (e) => { if (e.target.closest(".ozb")) return; drag = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
    el.addEventListener("pointermove", (e) => { if (!drag) return; const m = this._ort().map, [cx, cy] = this._ortPx(m.lat, m.lon, m.z), [la, lo] = this._ortLL(cx - (e.clientX - drag.x), cy - (e.clientY - drag.y), m.z); drag = { x: e.clientX, y: e.clientY }; m.lat = Math.max(-80, Math.min(80, la)); m.lon = lo; if (!raf) raf = requestAnimationFrame(redraw); });
    const rg = box.querySelector("[data-f=ortr]"); if (rg) rg.addEventListener("input", () => { const m = this._ort().map; m.r = Number(rg.value); const v = box.querySelector("#orv"); if (v) v.textContent = `${m.r} m`; if (!raf) raf = requestAnimationFrame(redraw); });
    const end = () => { drag = null; }; el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("wheel", (e) => { e.preventDefault(); this._ortAct("ortz", { dataset: { k: e.deltaY < 0 ? "1" : "-1" } }); }, { passive: false });
  }
  _ortAct(a, b) {
    const o = this._ort(), k = b.dataset ? b.dataset.k : "";
    if (a === "ortopen") { this._ortOpen = true; this._render(); }
    else if (a === "ortback") { this._ortOpen = false; this._render(); }
    else if (a === "ortper") { const x = this._ortPersons().find((q) => q.id === k); if (!x) return; o.draft = { id: k, label: (o.per[k] || {}).label || "", trackers: x.tr.map((q) => q.id), wifi: x.wifi, count: x.count, acc: x.acc }; this._modal = { type: "ortper" }; this._renderModal(); }
    else if (a === "ortrm") { o.draft.trackers = o.draft.trackers.filter((e) => e !== k); this._renderModal(); }
    else if (a === "ortcount") { o.draft.count = !o.draft.count; this._renderModal(); }
    else if (a === "ortacc") { o.draft.acc = Math.max(20, Math.min(500, o.draft.acc + Number(k))); this._renderModal(); }
    else if (a === "ortpsave") { const d = o.draft; this._cfg.presence = { ...this._pres(), people: { ...o.per, [d.id]: { label: d.label.trim(), trackers: d.trackers, wifi: d.wifi, count: d.count, acc: d.acc } } }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Person gespeichert"); }
    else if (a === "ortzone") { const z = o.zone; o.map = { lat: z.lat, lon: z.lon, r: z.r, z: this._ortZoomFor(z.r) }; this._modal = { type: "ortzone" }; this._renderModal(); }
    else if (a === "ortz") { const m = o.map; m.z = Math.max(5, Math.min(19, m.z + Number(k))); this._renderModal(); }
    else if (a === "ortha") { const hz = this._hass.states["zone.home"], hc = this._hass.config || {}; const la = Number(hz ? hz.attributes.latitude : hc.latitude), lo = Number(hz ? hz.attributes.longitude : hc.longitude); if (isFinite(la) && isFinite(lo)) { o.map.lat = la; o.map.lon = lo; this._renderModal(); } }
    else if (a === "ortme") { const x = this._ortPersons().find((q) => q.lat != null); if (x) { o.map.lat = x.lat; o.map.lon = x.lon; this._renderModal(); this._toast(`Position von ${x.name} übernommen`); } else this._toast("Keine Position verfügbar"); }
    else if (a === "ortzsave") { const m = o.map; this._cfg.presence = { ...this._pres(), zone: { lat: Math.round(m.lat * 1e6) / 1e6, lon: Math.round(m.lon * 1e6) / 1e6, r: m.r } }; this._savePresence(); this._modal = null; this._renderModal(); this._render(); this._toast("Home-Zone gespeichert"); }
  }
  _ortChange(t) {
    const o = this._ort(), f = t.dataset.f;
    if (f === "ortlabel") { o.draft.label = t.value; return true; }
    if (f === "ortadd") { if (t.value && !o.draft.trackers.includes(t.value)) { o.draft.trackers.push(t.value); this._renderModal(); } return true; }
    if (f === "ortwifi") { o.draft.wifi = t.value; return true; }
    if (f === "ortr") { o.map.r = Number(t.value); return true; }
    return false;
  }
  /* Integrationen: Wallbox (go-e Charger) direkt über die lokale HTTP-API verbinden. Die Daten liegen im Backend (wb_get, wb_set, wb_test). */
  _wbDef() { return { ip: "", enabled: false, mode: "off", minA: 6, maxA: 16, ph: "auto", startW: 1400, onMin: 1, offMin: 3, limit: 80, plan: false, planSoc: 80, planTime: "07:00", planDays: "all", cap: 60, batOn: true, batSoc: 30, priceOn: false, priceMax: 18, lock: false, reset: true, planOn: false, planStrat: "mix", planSrc: "auto", pvSrc: "forecast", baseW: 400, vehicles: [], guest: { mode: "off", limit: 80 }, guard: { on: false, maxA: 35 }, notify: { start: true, goal: true, plan: true, off: true, long: false, to: [] } }; }
  _wbSnap() { const s = (this._wbD && this._wbD.snap) || {}; return { ...s, cfg: { ...this._wbDef(), ...(s.cfg || {}) }, info: s.info || {}, want: s.want || {}, log: s.log || [], plan: s.plan || {} }; }
  _wb() { return this._wbSnap().cfg; }
  _wbVisible() { return !this._modal && ((this._igOpen && this._admin()) || (!this._stOpen && !this._ortOpen && this._mdActive() === "ev")); }
  _wbLoad(force) {
    if (!this._hass || this._wbBusy) return;
    if (!force && this._wbD && Date.now() - this._wbD.ts < 4000) return;
    this._wbBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wb_get" }).then((r) => { if (!this._wbSaveT) this._wbD = { snap: r || {}, ts: Date.now() }; }).catch(() => { this._wbD = { snap: { ok: false, error: "Keine Antwort von Home Assistant" }, ts: Date.now() }; })
      .finally(() => { this._wbBusy = false; if (this._wbVisible()) this._render(); clearTimeout(this._wbT); this._wbT = setTimeout(() => { this._wbT = null; if (this._wbVisible()) this._wbLoad(true); }, 5000); });
  }
  _wbSave(patch, now) {
    const sn = this._wbSnap(); this._wbD = { snap: { ...sn, cfg: { ...sn.cfg, ...patch } }, ts: Date.now() };
    clearTimeout(this._wbSaveT);
    this._wbSaveT = setTimeout(() => {
      this._wbSaveT = null; const cfg = this._wbSnap().cfg;
      this._hass.callWS({ type: "fenster_heizung/wb_set", cfg }).then((r) => { this._wbD = { snap: r, ts: Date.now() }; if (this._wbVisible()) this._render(); })
        .catch(() => this._toast("Wallbox-Einstellung konnte nicht gespeichert werden"));
    }, now ? 0 : 500);
  }
  _igChip() { const s = this._wbSnap(); this._wbLoad(); return s.cfg.ip ? (s.ok ? `<em class="sxc ok">go-e verbunden</em>` : `<em class="sxc">Nicht erreichbar</em>`) : `<em class="sxc">Nicht verbunden</em>`; }
  /* ===== Store: Katalog aller Dienste, Startseite (A) und Detailseite (C) ===== */
  _sto0() { return this._sto || (this._sto = { q: "", c: "all" }); }
  _stoCfg() { const t = (this._cfg && this._cfg.layout && this._cfg.layout.store) || {}; return { icon: t.icon !== false, tab: t.tab !== false }; }
  /* ===== Herstellerprofile für Heizkörperthermostate ===== */
  _hsProfiles() {
    const Z = "Zigbee-Integration (ZHA oder Zigbee2MQTT) einrichten und das Thermostat anlernen";
    const T3 = "In den Raumeinstellungen unter „Fenster & Thermostate“ das Thermostat auswählen, das Profil wird automatisch erkannt";
    return {
      tado: { n: "tado°", sub: "Thermostate · Cloud", c: "#f97316", d: "tado", conn: "Cloud", src: "Offiziell", desc: "Heizkörper- und Raumthermostate über die tado-Cloud, mit Zeitplan aus der tado-App.",
        feats: ["Heizung beim Lüften ausschalten und danach auf den Zeitplan zurück", "Zeitplan der tado-App bleibt erhalten", "Zieltemperatur und Heizstatus im Dashboard"],
        quirks: [["Zurück zum Zeitplan", "Eine geänderte Temperatur wirkt bei tado als manuelle Übersteuerung. Nach dem Lüften wird deshalb die Automatik erneut gesetzt, damit wieder der Zeitplan gilt."], ["Echtes Aus", "Beim Lüften wird das Thermostat ausgeschaltet, nicht nur abgesenkt."], ["Eigene Fensterfunktion", "tado erkennt offene Fenster teils selbst. Wenn du Fenstersensoren nutzt, ist es sinnvoll, diese Funktion in der tado-App auszuschalten, damit sich beides nicht in die Quere kommt."], ["Zeitlich begrenzt ändern", "Die tado-Aktion „Climate-Timer“ setzt eine Temperatur für eine Dauer, danach gilt wieder der Zeitplan."], ["Cloud", "Befehle laufen über die tado-Cloud und können einige Sekunden brauchen. Die Verzögerung für „Fenster offen“ nicht zu kurz wählen."]],
        steps: ["Unten „Einrichten“ tippen, Home Assistant öffnet die tado-Einrichtung", "Mit dem tado-Konto anmelden", T3], note: "" },
      hmip: { n: "Homematic IP", sub: "Thermostate · Access Point", c: "#0ea5e9", d: "homematicip_cloud", conn: "Cloud", src: "Offiziell", desc: "Heizkörperthermostate (z. B. HmIP-eTRV) über den Homematic-IP-Access-Point.",
        feats: ["Heizung beim Lüften auf die kleinste Temperatur und danach zurück auf Automatik", "Zeitprofile des Geräts bleiben erhalten", "Boost und Normal als Voreinstellung nutzbar"],
        quirks: [["Kein echtes Aus", "Die Thermostate kennen nur Automatik und Manuell. „Ausschalten“ setzt darum die kleinste Temperatur des Geräts (meist um 5 °C)."], ["Zurück zum Zeitplan", "Nach dem Lüften wird die Automatik erneut gesetzt, statt die alte Temperatur als manuelle Einstellung zu setzen."], ["Verknüpfung im Gerät", "Mit einem Homematic-IP-Fensterkontakt kann das Thermostat selbst absenken. Nutze entweder die Verknüpfung in der Homematic-IP-App oder Strom & Wärme, nicht beides für dasselbe Fenster."], ["Funk-Begrenzung", "Homematic IP darf nur begrenzt oft senden (Duty Cycle). Viele Befehle in kurzer Zeit werden verzögert."]],
        steps: ["Unten „Einrichten“ tippen und die Homematic-IP-Integration hinzufügen", "Am Access Point die Taste drücken, wenn Home Assistant danach fragt", T3], note: "" },
      fritz: { n: "AVM FRITZ!DECT", sub: "Thermostate · FRITZ!Box", c: "#ef4444", d: "fritzbox", conn: "Lokal", src: "Offiziell", desc: "FRITZ!DECT 301 und 302 sowie Comet DECT an der FRITZ!Box, ohne Cloud.",
        feats: ["Heizung beim Lüften ausschalten und danach zurück", "Läuft lokal über die FRITZ!Box", "Komfort- und Spar-Temperatur als Voreinstellung"],
        quirks: [["Eigene Fenstererkennung", "FRITZ!DECT-Thermostate erkennen einen Temperatursturz selbst als offenes Fenster. Das kann mit den Fenstersensoren zusammenfallen, schadet aber nicht."], ["Aus möglich", "Das Thermostat lässt sich ausschalten. Die FRITZ!Box setzt dafür den Aus-Wert des Geräts."], ["Zurück zum Zeitplan", "Falls das Thermostat im Automatikbetrieb lief, wird die Automatik nach dem Lüften erneut gesetzt."], ["Aktualität", "Die Werte kommen von der FRITZ!Box und können einige Sekunden alt sein."]],
        steps: ["Unten „Einrichten“ tippen, Home Assistant sucht die FRITZ!Box", "Einen FRITZ!Box-Benutzer mit Berechtigung für Smart Home verwenden", T3], note: "" },
      shelly: { n: "Shelly TRV", sub: "Thermostate · lokal", c: "#2563eb", d: "shelly", conn: "Lokal", src: "Offiziell", desc: "Shelly-Heizkörperthermostate, direkt im Heimnetz.",
        feats: ["Heizung beim Lüften auf die kleinste Temperatur und danach zurück", "Ventilstellung im Blick", "Optional mit externem Raumfühler"],
        quirks: [["Kein echtes Aus", "Das Gerät hat keinen eigenen Aus-Zustand. „Ausschalten“ bedeutet die kleinste Temperatur (meist 4 °C)."], ["Verzögerte Werte", "Bei Batteriegeräten kommen Werte und Befehle teils erst nach einigen Minuten an. Die Verzögerung für „Fenster offen“ nicht zu kurz wählen."], ["Externer Fühler", "Mit einem externen Raumfühler misst das Thermostat nicht mehr direkt am Heizkörper und regelt genauer."]],
        steps: ["Unten „Einrichten“ tippen und die Shelly-Integration hinzufügen", "Thermostat im selben Netz (BLU TRV über ein Shelly-Gateway)", T3], note: "" },
      aqara: { n: "Aqara E1", sub: "Thermostat · Zigbee", c: "#14b8a6", d: "zha", conn: "Lokal", src: "Zigbee", desc: "Aqara Radiator Thermostat E1 über Zigbee (ZHA oder Zigbee2MQTT).",
        feats: ["Heizung beim Lüften ausschalten und danach zurück", "Temperaturbereich 5 bis 30 °C", "Läuft lokal, ohne Cloud"],
        quirks: [["Echtes Aus", "Das Thermostat kennt Aus und Heizen. Beim Lüften wird es ausgeschaltet."], ["Eigene Fenstererkennung", "Die eingebaute Fenstererkennung kann zusätzlich eingreifen. Mit Fenstersensoren in Strom & Wärme ist es sinnvoll, sie im Gerät auszuschalten."], ["Kalibrieren", "Nach dem Einbau einmal kalibrieren, damit das Ventil sauber fährt."], ["Kindersicherung", "Ist sie an, sind die Tasten am Gerät gesperrt, die Steuerung über Home Assistant geht weiter."]],
        steps: [Z, "Zum Anlernen den Mittelring etwa 10 Sekunden gedrückt halten", T3], note: "" },
      danfoss: { n: "Danfoss Ally", sub: "Thermostat · Zigbee", c: "#dc2626", d: "zha", conn: "Lokal", src: "Zigbee", desc: "Danfoss Ally Heizkörperthermostat über Zigbee (ZHA oder Zigbee2MQTT).",
        feats: ["Heizung beim Lüften auf die kleinste Temperatur und danach zurück", "Temperaturbereich 5 bis 35 °C", "Läuft lokal, ohne Cloud"],
        quirks: [["Kein echtes Aus", "Das Thermostat kennt nur Heizen. „Ausschalten“ setzt darum die kleinste Temperatur (5 °C)."], ["Eigene Fensterfunktion", "Das Thermostat kann ein offenes Fenster selbst erkennen. Mit Fenstersensoren in Strom & Wärme ist es sinnvoll, diese Funktion im Gerät auszuschalten."], ["Heizkörper verdeckt", "Ist der Heizkörper verdeckt (Vorhang, Möbel), den Raumfühler-Modus einstellen, sonst misst das Thermostat zu warm."], ["Externer Raumfühler", "Ein externer Fühler muss regelmäßig neu gemeldet werden, sonst fällt das Thermostat auf den eigenen Fühler zurück."]],
        steps: [Z, "Heizkörper-Einbau mit dem mitgelieferten Adapter, danach Anpassungslauf abwarten", T3], note: "" },
    };
  }
  _hsOf(eid) {
    const H = this._hass, e = (H.entities || {})[eid]; if (!e) return null;
    const pl = String(e.platform || "").toLowerCase(), dev = e.device_id && H.devices ? H.devices[e.device_id] : null, man = String((dev && dev.manufacturer) || "").toLowerCase(), mod = String((dev && dev.model) || "").toLowerCase();
    const P = { tado: "tado", homematicip_cloud: "hmip", homematicip_local: "hmip", homematic: "hmip", fritzbox: "fritz", shelly: "shelly" };
    if (P[pl]) return P[pl];
    if (man.includes("danfoss")) return "danfoss";
    if (/aqara|lumi|xiaomi/.test(man) || mod.includes("srts")) return "aqara";
    return null;
  }
  _hsRoomNote(list) {
    const P = this._hsProfiles(), ids = [...new Set((list || []).map((e) => this._hsOf(e)).filter(Boolean))]; if (!ids.length) return "";
    return ids.map((id) => { const x = P[id]; return `<details class="ohint hsn"><summary><span class="hsd" style="background:${x.c}"></span>${esc(x.n)} erkannt · Besonderheiten (${x.quirks.length})</summary><ul class="stoul">${x.quirks.map(([t, d]) => `<li><b>${esc(t)}:</b> ${esc(d)}</li>`).join("")}</ul></details>`; }).join("");
  }
  _stoCat() {
    const H = this._hass, E = H.entities || {}, S = H.states, ids = Object.keys(S), byDom = (d) => ids.filter((k) => (E[k] || {}).platform === d);
    const wb = this._wbSnap(), c = wb.cfg, T = this._tb(), det = this._sfList(), out = [];
    const X = { xsense: ["Cloud", "Community"], zha: ["Lokal", "Offiziell"], mqtt: ["Lokal", "Offiziell"], homematicip_cloud: ["Cloud", "Offiziell"], fritzbox: ["Lokal", "Offiziell"], zwave_js: ["Lokal", "Offiziell"], matter: ["Lokal", "Offiziell"], tuya: ["Cloud", "Offiziell"], ecowitt: ["Lokal", "Offiziell"], tempest: ["Lokal", "Offiziell"], met: ["Cloud", "Offiziell"], dwd_weather_warnings: ["Cloud", "Offiziell"], nina: ["Cloud", "Offiziell"], meteoalarm: ["Cloud", "Offiziell"] };
    out.push({ id: "goe", n: "go-e Charger", sub: "Wallbox", cat: "auto", c: "#0ea5e9", i: "energy", mid: "ev", mods: ["Modul 8"], on: !!c.ip, bad: !!c.ip && !wb.ok, top: 1, act: "iggoe", conn: "Lokal", src: "Direkt",
      st: c.ip ? (wb.ok ? `${(wb.info && wb.info.type) || "go-e Charger"} · ${c.ip}` : `${c.ip} · ${wb.error || "keine Antwort"}`) : "", desc: "Wallbox direkt im Heimnetz lesen und steuern, ohne Cloud.",
      feats: ["Laden nach Sonne, Strompreis und Abfahrtszeit planen", "Status, Leistung und Ladestand direkt sehen", "Läuft lokal im Heimnetz, ohne Cloud"],
      steps: ["In der go-e-App: Einstellungen → Verbindung → API-Einstellungen → „Zugriff auf lokale HTTP API“ einschalten", "Dem go-e im Router eine feste IP-Adresse geben", "Hier „Einrichten“ tippen, IP-Adresse eintragen und die Verbindung testen"], note: "Die lokale API v2 gibt es nur bei neueren Geräten. Der go-e Charger Gemini unterstützt sie." });
    out.push({ id: "tibber", n: "Tibber", sub: "Stromtarif", cat: "tarif", c: "#6366f1", i: "energy", mid: "ev", mods: ["Modul 8"], on: !!T.connected, top: 1, act: "igtb", conn: "Cloud", src: "Offiziell",
      st: T.connected ? `${T.home || "Zuhause"}${T.price_now != null ? " · jetzt " + num(T.price_now, 1) + " ct/kWh" : ""}` : "", desc: "Stundenpreise direkt von Tibber, ohne zusätzliche Integration.",
      feats: ["Strompreise von heute und morgen (ab etwa 13 Uhr)", "Ladeplanung in Modul 8 zur günstigsten Zeit", "Preise als Stunde, Viertelstunde oder Preisstufe"],
      steps: ["Auf developer.tibber.com anmelden und einen Zugriffstoken erstellen", "Hier „Einrichten“ tippen und den Token eintragen", "Verbindung testen und speichern"], note: "Der Token wird nur in Home Assistant gespeichert und nur an api.tibber.com gesendet. Es werden nur Strompreise abgerufen." });
    const W = { warn: ["Amtliche Warnungen mit Stufe 1 bis 4 in Modul 9", "Meldung aufs Handy und Aktionen bei Warnung"], weather: ["Wetter und Vorhersage für Modul 9 und die Kopfkarte", "Vorwarnung aus der Stundenvorhersage"], station: ["Wind, Regen und Temperatur direkt vor Ort", "Genauer als eine Vorhersage für Sturmwarnungen"] };
    const WL = { warn: "Warnungen", weather: "Wetter", station: "Wetterstation" };
    for (const x of this._igWxCatalog()) { const n = byDom(x.d).length, cx = X[x.d] || ["Cloud", "Offiziell"];
      out.push({ id: x.d, d: x.d, n: x.n, sub: WL[x.k], cat: "wetter", c: x.c, i: x.i, mid: "wx", mods: ["Modul 9"], on: n > 0, top: x.top, conn: cx[0], src: cx[1], st: n ? `${n} ${n === 1 ? "Entität" : "Entitäten"} · genutzt von Modul 9` : "", desc: x.t, feats: W[x.k],
        steps: ["Unten „Einrichten“ tippen, Home Assistant öffnet die Einrichtung", "Dienst hinzufügen und die Angaben eintragen", "Modul 9 erkennt ihn automatisch. Bei mehreren Quellen wählst du die Zuordnung unter Einstellungen → Modul 9"], note: "" }); }
    const anyX = ids.some((k) => (E[k] || {}).platform === "xsense");
    for (const x of this._igSfCatalog()) { const n = det.filter((y) => (y.src || (E[y.id] || {}).platform) === x.d).length, up = n > 0 || (x.d === "xsense" && anyX), cx = X[x.d] || ["Cloud", "Offiziell"], isx = x.d === "xsense";
      out.push({ id: x.d, d: x.d, n: x.n, sub: "Melder", cat: "sicherheit", c: x.c, i: x.i, mid: "sf", mods: ["Modul 11"], on: up, top: x.top, feat: isx, hacs: x.hacs, conn: cx[0], src: cx[1], st: up ? (n ? `${n} Melder · genutzt von Modul 11` : "Verbunden, aber noch ohne Melder") : "", desc: x.t,
        feats: ["Alarm aufs Handy und Aktionen (Licht, Ventil, Sirene)", "Batteriestand und Erreichbarkeit im Blick", "Erinnerung an die regelmäßige Prüfung"],
        steps: isx ? ["Community-Integration in HACS als benutzerdefiniertes Repository (Kategorie „Integration“) hinzufügen, die Adresse steht hinter „Anleitung“", "Home Assistant neu starten und unter Geräte & Dienste „X-Sense“ hinzufügen, besser mit einem zweiten Konto, mit dem du nur die Melder teilst", "Fertig: Die Melder erscheinen in Modul 11, mit Batterie und, wenn vorhanden, Testknopf"] : ["Unten „Einrichten“ tippen und den Dienst in Home Assistant hinzufügen", "Melder anlernen", "Modul 11 erkennt alle Melder (Rauch, CO, Gas, Wasser, Hitze) automatisch"],
        note: isx ? "Inoffiziell und cloud-basiert, von der Community gepflegt. Nach Home-Assistant-Updates kann sie kurz ausfallen. Die Melder selbst alarmieren auch ohne Home Assistant weiter." : "" }); }
    const hp = this._hsProfiles(), cnt = {}; ids.filter((k) => k.startsWith("climate.")).forEach((k) => { const id = this._hsOf(k); if (id) cnt[id] = (cnt[id] || 0) + 1; });
    for (const id of Object.keys(hp)) { const x = hp[id], n = cnt[id] || 0;
      out.push({ id: "hs_" + id, d: x.d, n: x.n, sub: x.sub, cat: "heizung", c: x.c, i: "thermo", mid: "fh", mods: ["Modul 1"], on: n > 0, top: 1, nodot: 1, conn: x.conn, src: x.src, st: n ? `${n} ${n === 1 ? "Thermostat" : "Thermostate"} in Home Assistant gefunden` : "", desc: x.desc, feats: x.feats, quirks: x.quirks, steps: x.steps, note: x.note }); }
    if (this._labOn("mm")) { const n = ids.filter((k) => (E[k] || {}).platform === "waste_collection_schedule").length;
      out.push({ id: "wcs", d: "waste_collection_schedule", n: "Abfallkalender", sub: "waste_collection_schedule", cat: "haus", c: "#16a34a", i: "trash", mid: "mu", mods: ["Modul 17"], on: n > 0, top: 1, hacs: "https://github.com/mampfes/hacs_waste_collection_schedule", conn: "Cloud", src: "Community", st: n ? `${n} ${n === 1 ? "Entität" : "Entitäten"} · genutzt von Modul 17` : "",
        desc: "Holt die Abholtermine deines Entsorgers in einen Kalender von Home Assistant. Dafür gibt es Hunderte Anbieter.",
        feats: ["Termine für Restmüll, Bio, Papier und Gelben Sack als Kalender", "Modul 17 zeigt sie an und erinnert am Vorabend", "Kennt viele Entsorger in Deutschland, Österreich und der Schweiz"],
        steps: ["Community-Integration in HACS als benutzerdefiniertes Repository (Kategorie „Integration“) hinzufügen, die Adresse steht hinter „Anleitung“", "Home Assistant neu starten und unter Geräte & Dienste „Waste Collection Schedule“ hinzufügen, dann den Entsorger wählen", "Fertig: Der Kalender erscheint automatisch in Modul 17, oder du wählst ihn in den Einstellungen des Moduls"],
        note: "Inoffiziell, von der Community gepflegt. Der Eintrag erscheint nur, solange das Lab „Müllabfuhr“ eingeschaltet ist. Ausgeschaltet verschwindet er hier wieder, die Integration selbst bleibt in Home Assistant, bis du sie dort entfernst." }); }
    out.forEach((x) => { x.tag = x.src === "Community" ? "Inoffiziell" : x.conn === "Cloud" ? "Konto nötig" : "In HA einrichten"; });
    return out;
  }
  _stoTodo() {
    if (!this._hass || !this._admin()) return 0;
    if (this._stoT && Date.now() - this._stoT.ts < 4000) return this._stoT.n;
    let n = 0; try { const ml = this._mdList().map((m) => m.id); n = this._stoCat().filter((x) => !x.on && x.top && !x.nodot && ml.includes(x.mid)).length; } catch (_) { /* egal */ }
    this._stoT = { ts: Date.now(), n }; return n;
  }
  _stoBtn() {
    if (!this._admin() || !this._stoCfg().icon) return "";
    const n = this._stoTodo();
    return `<button class="pillbtn sto" data-act="igopen" aria-label="Store: Integrationen und Dienste" title="Store">${ic("puzzle", 17)}${n ? `<i class="sdot">${n}</i>` : ""}</button>`;
  }
  _stoCard(x) {
    return `<button class="stoc" data-act="stodet" data-k="${esc(x.id)}"><span class="stot"><span class="stoi" style="background:${x.c}">${ic(x.i, 24)}</span><span class="ston"><b>${esc(x.n)}</b><small>${esc(x.sub)} · ${esc(x.mods.join(", "))}</small></span></span><span class="stod">${esc(x.on ? x.st : x.desc)}</span><span class="stof">${x.on ? `<span class="stos ${x.bad ? "bad" : "ok"}">● ${x.bad ? "Nicht erreichbar" : "Verbunden"}</span><em>Ansehen</em>` : `<span class="stos wn">${esc(x.tag)}</span><em class="pri">Einrichten</em>`}</span></button>`;
  }
  _stoGrid() {
    const { q, c } = this._sto0(), cat = this._stoCat(), all = q || c !== "all";
    const hay = (x) => (x.n + " " + x.sub + " " + x.desc + " " + x.mods.join(" ") + " " + x.cat + " " + (x.quirks ? x.quirks.map((q) => q[0]).join(" ") : "")).toLowerCase();
    const vis = cat.filter((x) => (c === "all" || c === "on" ? c === "on" ? x.on : true : x.cat === c) && (!q || hay(x).includes(q.toLowerCase())) && (all || x.on || x.top));
    const on = vis.filter((x) => x.on), off = vis.filter((x) => !x.on);
    if (!vis.length) return `<div class="card empty">${ic("puzzle", 30)}<div style="margin-top:8px">Nichts gefunden. Wünsche kannst du auf GitHub melden.</div></div>`;
    return `${on.length ? `<h3 class="stoh">Verbunden<small>${on.length} ${on.length === 1 ? "Dienst" : "Dienste"}</small></h3><div class="stog">${on.map((x) => this._stoCard(x)).join("")}</div>` : ""}${off.length ? `<h3 class="stoh">${c === "all" && !q ? "Entdecken" : "Weitere Dienste"}<small>${c === "all" && !q ? "Passend zu deinen Modulen" : off.length + " Treffer"}</small></h3><div class="stog">${off.map((x) => this._stoCard(x)).join("")}</div>` : ""}`;
  }
  _stoFeat() {
    const { q, c } = this._sto0(); if (q || c !== "all") return "";
    const cat = this._stoCat(), x = ["xsense", "tibber", "nina"].map((id) => cat.find((y) => y.id === id)).find((y) => y && !y.on); if (!x) return "";
    return `<button class="stofe" data-act="stodet" data-k="${esc(x.id)}"><span class="stobig">${ic(x.i, 44)}</span><span class="stofx"><em>${x.id === "xsense" ? "Neu · Modul 11" : "Empfohlen · " + esc(x.mods[0])}</em><b>${esc(x.n)}${x.id === "xsense" ? " Rauchmelder" : ""}</b><span>${esc(x.id === "xsense" ? "Rauch- und CO-Melder aus der X-Sense-Cloud ins Dashboard holen. Alarm, Batterie und Prüf-Erinnerung inklusive." : x.desc)}</span><i class="stobt">Ansehen</i></span></button>`;
  }
  _igRender() {
    this._wbLoad(); this._tbLoad(); this._sfxLoad();
    const sr = this.shadowRoot, mainEl = sr.getElementById("main"), ae = sr.activeElement;
    if (ae && mainEl.contains(ae) && (ae.tagName === "SELECT" || ae.classList.contains("stoq"))) return; /* offene Auswahl und Suchfeld nicht durch das automatische Aktualisieren stören */
    const prevOpen = [...mainEl.querySelectorAll("details")].map((d) => d.open), st = this._sto0(), cat = this._stoCat();
    const chips = [["all", "Alle"], ["on", `Verbunden (${cat.filter((x) => x.on).length})`], ["tarif", "Strom & Tarife"], ["auto", "Elektroauto"], ["heizung", "Heizung"], ["wetter", "Wetter"], ["sicherheit", "Sicherheit"], ...(cat.some((x) => x.cat === "haus") ? [["haus", "Haus"]] : [])];
    const keep = mainEl.querySelector(".wrap") ? mainEl.scrollTop : 0;
    mainEl.innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Store</b><span><em class="tag">Integrationen und Dienste</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn" data-act="mdmgr" aria-label="Module verwalten">${ic("layers", 16)}<span class="bl">Module</span></button>
        <button class="pillbtn" data-act="stoset" aria-label="Store anzeigen">${ic("sliders", 16)}<span class="bl">Anzeige</span></button>
        <button class="pillbtn pri" data-act="igback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw stow">
        <label class="stosr"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input class="stoq" type="search" data-f="stoq" value="${esc(st.q)}" placeholder="Suchen, z. B. Tibber, Rauchmelder, Wetter" aria-label="Suchen" autocomplete="off" spellcheck="false"></label>
        <div class="stoch">${chips.map(([k, t]) => `<button class="${st.c === k ? "on" : ""}" data-act="stoc" data-k="${k}" aria-pressed="${st.c === k}">${t}</button>`).join("")}</div>
        <div id="stofe">${this._stoFeat()}</div>
        <div id="stogrid">${this._stoGrid()}</div>
        <div class="mut sm" style="margin:6px 4px 0">Der Store ist ein Katalog: Er zeigt, was zu deinen Modulen passt, erkennt, was in Home Assistant schon läuft, und führt dich durch die Einrichtung.</div>
      </div></div>`;
    const ds = [...mainEl.querySelectorAll("details")]; if (prevOpen.length === ds.length) ds.forEach((d, n) => { d.open = prevOpen[n]; });
    const inp = mainEl.querySelector(".stoq"); if (inp) inp.addEventListener("input", () => { this._sto0().q = inp.value.trim(); const g = sr.getElementById("stogrid"), f = sr.getElementById("stofe"); if (g) g.innerHTML = this._stoGrid(); if (f) f.innerHTML = this._stoFeat(); });
  }
  _stoModal() {
    const m = this._modal, x = this._stoCat().find((y) => y.id === m.id); if (!x) return `<div class="ov" data-act="close"></div>`;
    const adm = this._admin(), add = `/config/integrations/dashboard/add?domain=${x.d}`, man = `/config/integrations/integration/${x.d}`;
    const btn = x.act ? `<button class="btn2 pri" data-act="stogo" data-k="${x.act}">${x.on ? "Verwalten" : "Einrichten"}</button>` : (adm ? `<a class="btn2 pri" href="${x.on ? man : add}" target="_blank" rel="noopener">${x.on ? "Verwalten" : "Einrichten"}</a>${!x.on && x.hacs ? `<a class="btn2" href="${x.hacs}" target="_blank" rel="noopener">Anleitung</a>` : ""}` : "");
    return `<div class="ov" data-act="close"></div><div class="sheet wide stosh" role="dialog" aria-modal="true">
      <div class="stohd"><span class="stoi big" style="background:${x.c}">${ic(x.i, 38)}</span><div><b>${esc(x.n)}</b><small>${esc(x.sub)}${x.src === "Community" ? " · Community" : ""}</small><div class="stoact">${btn}${x.on ? `<span class="stos ${x.bad ? "bad" : "ok"}">● ${x.bad ? "Nicht erreichbar" : "Verbunden"}</span>` : ""}</div></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${x.on && x.st ? `<div class="mut sm" style="margin:0 0 8px">${esc(x.st)}</div>` : ""}
      <div class="stofa"><div><b>${esc(x.mods.join(", "))}</b><small>wird genutzt von</small></div><div><b>${esc(x.conn)}</b><small>Verbindung</small></div><div><b>${esc(x.src === "Direkt" ? "Direkt" : x.src)}</b><small>Quelle</small></div></div>
      <div class="lsec">${ic("check", 15)}Was du bekommst</div><ul class="stoul">${x.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      ${x.quirks ? `<div class="lsec">${ic("sliders", 15)}Besonderheiten dieses Herstellers</div><ul class="stoul stoq2">${x.quirks.map(([t, d]) => `<li><b>${esc(t)}:</b> ${esc(d)}</li>`).join("")}</ul>` : ""}
      <div class="lsec">${ic("tools", 15)}So geht es</div>${x.steps.map((t, n) => `<div class="stost"><b>${n + 1}</b><span>${esc(t)}</span></div>`).join("")}
      ${x.note ? `<div class="stowarn">${ic("info", 16)}<span>${esc(x.note)}</span></div>` : ""}
      ${x.quirks ? `<div class="mut sm" style="margin-top:10px">Die Hinweise stammen aus Herstellerangaben und Erfahrungen der Community. Bitte am eigenen Gerät prüfen, Firmware und Integration können sich unterscheiden.</div>` : ""}
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Schließen</button></div></div>`;
  }
  _stoSetModal() {
    const t = this._stoCfg();
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Store anzeigen</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">Der Store bleibt immer unter Einstellungen → Allgemein erreichbar. Hier schaltest du die zusätzlichen Zugänge einzeln ein oder aus.</div>
      <div class="ltog"><span><b>Store-Symbol im Kopf</b><br><small class="mut">Puzzle-Symbol neben den Einstellungen, mit Zähler für Dienste, die noch fehlen</small></span><button class="sw ${t.icon ? "on" : ""}" data-act="stotog" data-k="icon" aria-pressed="${t.icon}" aria-label="Store-Symbol im Kopf"></button></div>
      <div class="ltog"><span><b>Tab „Store“ in der Modul-Leiste</b><br><small class="mut">Ersetzt den gestrichelten Tab „Erweitern“ am Ende der Leiste</small></span><button class="sw ${t.tab ? "on" : ""}" data-act="stotog" data-k="tab" aria-pressed="${t.tab}" aria-label="Tab Store in der Modul-Leiste"></button></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _stoAct(a, b) {
    const k = b.dataset.k;
    if (a === "stoc") { this._sto0().c = k; this._render(); }
    else if (a === "stodet") { this._modal = { type: "stodet", id: k }; this._renderModal(); }
    else if (a === "stogo") { this._igAct(k, b); }
    else if (a === "stoset") { this._modal = { type: "stoset" }; this._renderModal(); }
    else if (a === "stotog") { const t = this._stoCfg(); this._cfg.layout.store = { ...t, [k]: !t[k] }; this._saveLayout(); this._render(); this._renderModal(); }
  }
  /* Integrationen für Wetter und Warnungen: Dienste mit Status. Eingerichtete Dienste nutzt Modul 9 automatisch (Zuordnung nur bei mehreren). */
  _wxOffAny() { const E = this._hass.entities || {}; return Object.keys(this._hass.states).some((k) => ["dwd_weather_warnings", "nina", "meteoalarm"].includes((E[k] || {}).platform)); }
  _igWxCatalog() {
    return [
      { d: "dwd_weather_warnings", n: "Deutscher Wetterdienst (DWD)", t: "Amtliche Unwetterwarnungen für deinen Landkreis", k: "warn", c: "#ef4444", i: "shield", top: 1 },
      { d: "nina", n: "NINA Bevölkerungsschutz", t: "Warnungen von Bund und Ländern (Unwetter, Hochwasser, Gefahren)", k: "warn", c: "#f97316", i: "alert", top: 1 },
      { d: "meteoalarm", n: "MeteoAlarm", t: "Europäische Wetterwarnungen", k: "warn", c: "#eab308", i: "shield" },
      { d: "met", n: "Met.no", t: "Wetter und Vorhersage, kostenlos und ohne Anmeldung", k: "weather", c: "#0ea5e9", i: "cloud", top: 1 },
      { d: "openweathermap", n: "OpenWeatherMap", t: "Wetter und Vorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "open_meteo", n: "Open-Meteo", t: "Wetter und Stundenvorhersage, kostenlos", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "accuweather", n: "AccuWeather", t: "Wetter und Vorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "pirateweather", n: "Pirate Weather", t: "Wetter und Stundenvorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "tomorrowio", n: "Tomorrow.io", t: "Wetter und Vorhersage, Schlüssel nötig", k: "weather", c: "#0ea5e9", i: "cloud" },
      { d: "ecowitt", n: "Ecowitt", t: "Eigene Wetterstation: Wind, Regen, Temperatur vor Ort", k: "station", c: "#64748b", i: "fan" },
      { d: "netatmo", n: "Netatmo", t: "Eigene Wetterstation: Temperatur, Regen, Wind", k: "station", c: "#64748b", i: "fan" },
      { d: "tempest", n: "WeatherFlow Tempest", t: "Eigene Wetterstation: Wind, Regen, Blitze", k: "station", c: "#64748b", i: "fan" },
    ];
  }
  /* Zuordnung der Wetter-Quellen: gehört zu Modul 9 und steht in dessen Einstellungen */
  _wxsAssign() {
    this._wxsLoad(); const H = this._hass, S = H.states, E = H.entities || {}, adm = this._admin(), W = this._wxs().cfg, L = this._wxCfg();
    const nm = (id) => esc((S[id].attributes || {}).friendly_name || id), un = (id) => (S[id].attributes || {}).unit_of_measurement || "";
    const ids = Object.keys(S), byDom = (d) => ids.filter((k) => (E[k] || {}).platform === d);
    const weather = ids.filter((k) => k.startsWith("weather.")), wind = ids.filter((k) => k.startsWith("sensor.") && (S[k].attributes.device_class === "wind_speed" || /^(km\/h|m\/s|mph|kn)$/i.test(un(k))) && !/gust|boe|böe/i.test(k)).slice(0, 12);
    const tmp = ids.filter((k) => k.startsWith("sensor.") && S[k].attributes.device_class === "temperature" && /au(ß|ss)en|outdoor|outside|garten|terrasse|balkon/i.test(k + " " + (S[k].attributes.friendly_name || ""))).slice(0, 12);
    const off = ids.filter((k) => /^(sensor|binary_sensor)\./.test(k) && ["dwd_weather_warnings", "nina", "meteoalarm"].includes((E[k] || {}).platform));
    const notify = [...new Set([...Object.keys((H.services || {}).notify || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...W.notify.to])];
    const opt = (ids2, cur, auto, lab) => `<option value="" ${cur ? "" : "selected"}>${esc(auto)}</option>${ids2.map((id) => `<option value="${esc(id)}" ${cur === id ? "selected" : ""}>${lab(id)}</option>`).join("")}`;
    const sel = (ico, t, f, body, dis) => `<div class="vrow"><span>${ic(ico, 15)} ${t}</span><select class="osel" style="max-width:55%;margin:0" data-f="${f}" aria-label="${t}" ${adm && !dis ? "" : "disabled"}>${body}</select></div>`;
    const multi = weather.length > 1 || wind.length > 1 || tmp.length > 1 || off.length > 1;
    return `<div class="mut sm" style="margin:0 0 4px">${multi ? "Es gibt mehrere Quellen. Standard ist „Automatisch“, du kannst eine bestimmte wählen." : "Es ist jeweils nur eine Quelle da, deshalb passt „Automatisch“."} Die Wetter-Entität und die Außentemperatur gelten auch für die Wetter-Anzeige im Dashboard.</div>
      ${sel("cloud", "Wetter", "wxsselw", opt(weather, L.entity && S[L.entity] ? L.entity : "", weather[0] ? `Automatisch (${(S[weather[0]].attributes || {}).friendly_name || weather[0]})` : "Keine gefunden", (id) => nm(id)), !weather.length)}
      ${sel("fan", "Wind", "wxsselwind", opt(wind, W.wind && S[W.wind] ? W.wind : "", "Automatisch (aus der Wetter-Entität)", (id) => `${nm(id)} · ${esc(S[id].state)} ${esc(un(id))}`), !wind.length)}
      ${sel("thermo", "Außentemperatur", "wxsselout", opt(tmp, L.outdoor && S[L.outdoor] ? L.outdoor : "", "Automatisch (aus der Wetter-Entität)", (id) => `${nm(id)} · ${esc(S[id].state)} ${esc(un(id))}`), !tmp.length)}
      ${sel("shield", "Amtliche Warnung", "wxsseloff", `<option value="" ${W.official.on && !W.official.ent ? "selected" : ""}>${off[0] ? "Automatisch (" + esc((S[off[0]].attributes || {}).friendly_name || off[0]) + ")" : "Keine gefunden"}</option>${off.map((id) => `<option value="${esc(id)}" ${W.official.on && W.official.ent === id ? "selected" : ""}>${nm(id)}</option>`).join("")}<option value="__off" ${W.official.on ? "" : "selected"}>Nicht verwenden</option>`, !off.length)}`;
  }
  _igSfCatalog() {
    return [
      { d: "xsense", n: "X-Sense", t: "Rauch-, CO-, Hitze- und Wassermelder über die X-Sense-Basisstation. Inoffizielle Community-Integration (HACS), nutzt die X-Sense-Cloud.", c: "#e11d48", i: "flame", top: 1, hacs: "https://github.com/Jarnsen/ha-xsense-component_test" },
      { d: "zha", n: "Zigbee (ZHA)", t: "Zigbee-Melder direkt über Home Assistant, ohne Cloud", c: "#f59e0b", i: "shield", top: 1 },
      { d: "mqtt", n: "Zigbee2MQTT / MQTT", t: "Melder über Zigbee2MQTT oder MQTT-Bridges", c: "#a855f7", i: "shield", top: 1 },
      { d: "homematicip_cloud", n: "Homematic IP", t: "Rauch- und Wassermelder von Homematic IP", c: "#0ea5e9", i: "shield", top: 1 },
      { d: "fritzbox", n: "AVM FRITZ!SmartHome", t: "FRITZ!DECT-Geräte und Melder an der FRITZ!Box", c: "#ef4444", i: "shield" },
      { d: "zwave_js", n: "Z-Wave JS", t: "Z-Wave-Rauch- und CO-Melder", c: "#14b8a6", i: "shield" },
      { d: "matter", n: "Matter", t: "Melder über Matter", c: "#64748b", i: "shield" },
      { d: "tuya", n: "Tuya / Smart Life", t: "Rauch- und Wassermelder von Tuya-Marken, Cloud nötig", c: "#f97316", i: "shield" },
    ];
  }
  /* Tibber: Strompreise direkt über die Tibber-Schnittstelle */
  _tbLoad(force) {
    if (!this._hass || this._tbBusy) return;
    if (!force && this._tbD && Date.now() - this._tbD.ts < 20000) return;
    this._tbBusy = true;
    this._hass.callWS({ type: "fenster_heizung/tb_get" }).then((r) => { this._tbD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._tbD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._tbBusy = false; if (this._igOpen || this._wbVisible()) this._render(); });
  }
  _tb() { return (this._tbD && this._tbD.d) || {}; }
  _tbMini(k) {
    const pr = [20, 19, 17, 15, 14, 14, 15, 18, 24, 30, 33, 31, 27, 22, 18, 16, 16, 18, 24, 28, 25, 21, 19, 18]; // Beispielverlauf
    if (k === "h") return pr.filter((_, i) => i % 4 === 0).map((v, i) => `<rect x="${3 + i * 19.5}" y="${42 - v}" width="16" height="${v}" rx="2" fill="#f59e0b"/>`).join("");
    if (k === "q") return pr.map((v, i) => `<rect x="${3 + i * 4.9}" y="${42 - v}" width="3.6" height="${v}" rx="1" fill="#f59e0b"/>`).join("");
    const col = (v) => v < 17 ? "#2dd4bf" : v < 25 ? "#a3a3a3" : "#f87171";
    return pr.filter((_, i) => i % 2 === 0).map((v, i) => `<rect x="${3 + i * 9.8}" y="${v < 17 ? 18 : v < 25 ? 26 : 34}" width="8.6" height="${v < 17 ? 24 : v < 25 ? 16 : 8}" rx="2" fill="${col(v)}"/>`).join("");
  }
  _igTbModal() {
    const I = this._igS, d = I.tb, t = I.tbTest, T = this._tb();
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Tibber</b><span>Strompreise über die Tibber-Schnittstelle</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("shield", 15)}Zugriffstoken</div>
      <input class="osel" type="password" data-f="igtbtok" maxlength="200" value="${esc(d.token)}" placeholder="${T.connected ? "Gespeichert – zum Ändern neu eingeben" : "Persönlicher Zugriffstoken von Tibber"}" aria-label="Zugriffstoken" autocomplete="off" spellcheck="false">
      <div class="mut sm">Den Token erstellst du auf developer.tibber.com nach der Anmeldung mit deinem Tibber-Konto (Bereich „Create token“).</div>
      <div class="foot2" style="margin:10px 0"><button class="btn2" data-act="igtbtest" ${I.busy || !d.token ? "disabled" : ""}>${ic("check", 16)} ${I.busy ? "Prüfe …" : "Verbindung testen"}</button></div>
      ${t ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:${t.ok ? "#22c55e" : "#f87171"}">${ic(t.ok ? "check" : "alert", 18)}</span><div class="opi"><b>${t.ok ? "Verbindung steht" : "Keine Verbindung"}</b><small>${t.ok ? `${esc(t.home || "Zuhause")} · jetzt ${num(t.price_now, 1)} ct/kWh · heute ${num(t.min, 1)} bis ${num(t.max, 1)} ct/kWh · morgen ${t.tomorrow ? "vorhanden" : "noch nicht veröffentlicht"}` : esc(t.error || "Der Token wurde nicht akzeptiert")}</small></div></div>` : ""}
      ${t && t.ok && (t.homes || []).length > 1 ? `<div class="lsec">${ic("energy", 15)}Zuhause wählen</div><div class="gschips">${t.homes.map((h) => `<button class="gsch ${d.home === h.id ? "sel" : ""}" data-act="igtbhome" data-k="${esc(h.id)}" aria-pressed="${d.home === h.id}">${esc(h.name)}</button>`).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("chart", 15)}Preisauflösung</div>
      <div class="tbvar">${[["h", "Stundenmittel", "Ein Preis pro Stunde (Mittel aus vier Viertelstunden). Übersichtlich und stabil, empfohlen."], ["q", "Viertelstunden", "Die genauen 15-Minuten-Preise von Tibber. Der Plan nutzt auch kurze Preistäler, braucht aber mehr Schaltvorgänge."], ["lvl", "Preisstufen", "Nur Tibbers Einstufung (sehr günstig bis teuer). Lädt in günstigen Stufen, ohne genaue Preise zu rechnen. Kosten in der Statistik sind dann grob."]].map(([k, t, x]) => `<button class="${d.res === k ? "sel" : ""}" data-act="igtbres" data-k="${k}" aria-pressed="${d.res === k}"><svg viewBox="0 0 120 44" width="100%" height="44" aria-hidden="true">${this._tbMini(k)}</svg><b>${t}</b><small>${x}</small></button>`).join("")}</div>
      <div class="gst">${ic("info", 15)}Der Token wird nur in Home Assistant gespeichert und nur an api.tibber.com gesendet. Es werden ausschließlich die Strompreise abgerufen, keine Verbrauchsdaten.</div>
      <div class="foot2" style="margin-top:14px">${T.connected ? `<button class="btn2 dng" data-act="igtbrm">${ic("trash", 16)} Entfernen</button>` : `<button class="btn2" data-act="close">Abbrechen</button>`}<button class="btn2 pri" data-act="igtbsave" ${(t && t.ok) || (T.connected && !d.token) ? "" : "disabled"}>Speichern</button></div></div>`;
  }
  _igGoeModal() {
    const I = this._igS, d = I.draft, t = I.test, c = this._wb();
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>go-e Charger</b><span>Direkte Verbindung im lokalen Netzwerk</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("energy", 15)}IP-Adresse</div>
      <input class="osel" type="text" inputmode="decimal" data-f="igip" maxlength="64" value="${esc(d.ip)}" placeholder="z. B. 192.168.1.45" aria-label="IP-Adresse" autocomplete="off">
      <div class="mut sm">Die Adresse findest du in der go-e-App oder in deinem Router. Es sind nur Adressen im lokalen Netz erlaubt.</div>
      <div class="foot2" style="margin:10px 0"><button class="btn2" data-act="igtest" ${I.busy ? "disabled" : ""}>${ic("check", 16)} ${I.busy ? "Prüfe …" : "Verbindung testen"}</button></div>
      ${t ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:${t.ok ? "#22c55e" : "#f87171"}">${ic(t.ok ? "check" : "alert", 18)}</span><div class="opi"><b>${t.ok ? "Verbindung steht" : "Keine Antwort"}</b><small>${t.ok ? `${esc(t.type || "go-e")} · Seriennummer ${esc(t.serial || "–")} · Firmware ${esc(t.fw || "–")}` : esc(t.error || "Prüfe IP-Adresse, WLAN der Wallbox und ob die lokale HTTP-API in der App aktiv ist.")}</small></div></div>` : ""}
      <div class="gst">${ic("info", 15)}Es werden nur Status und Ladeeinstellungen der Wallbox gelesen und gesetzt. Es werden keine Daten an Dritte gesendet.</div>
      <div class="foot2" style="margin-top:14px">${c.ip ? `<button class="btn2 dng" data-act="igrm">${ic("trash", 16)} Entfernen</button>` : `<button class="btn2" data-act="close">Abbrechen</button>`}<button class="btn2 pri" data-act="igsave" ${t && t.ok ? "" : "disabled"}>Speichern</button></div></div>`;
  }
  _igAct(a, b) {
    const I = this._igS || (this._igS = { draft: { ip: "" }, test: null, busy: false, tb: { token: "", home: "", res: "h" }, tbTest: null });
    if (!I.tb) I.tb = { token: "", home: "" };
    if (a === "igopen") { this._igOpen = true; this._stOpen = false; this._sto = { q: "", c: "all" }; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "igback") { this._igOpen = false; this._render(); }
    else if (a === "iggoe") { I.draft = { ip: this._wb().ip }; I.test = null; this._modal = { type: "iggoe" }; this._renderModal(); }
    else if (a === "igtest") {
      I.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/wb_test", ip: (I.draft.ip || "").trim() }).then((r) => { I.test = r; }).catch(() => { I.test = { ok: false, error: "Keine Antwort von Home Assistant" }; })
        .finally(() => { I.busy = false; if (this._modal && this._modal.type === "iggoe") this._renderModal(); });
    }
    else if (a === "igtb") { I.tb = { token: "", home: this._tb().home_id || "", res: this._tb().res || "h" }; I.tbTest = null; this._modal = { type: "igtb" }; this._renderModal(); }
    else if (a === "igtbtest") {
      I.busy = true; this._renderModal();
      this._hass.callWS({ type: "fenster_heizung/tb_test", token: (I.tb.token || "").trim() }).then((r) => { I.tbTest = r; if (r && r.ok && !I.tb.home) I.tb.home = ((r.homes || [])[0] || {}).id || ""; }).catch(() => { I.tbTest = { ok: false, error: "Keine Antwort von Home Assistant" }; })
        .finally(() => { I.busy = false; if (this._modal && this._modal.type === "igtb") this._renderModal(); });
    }
    else if (a === "igtbres") { I.tb.res = b.dataset.k; this._renderModal(); }
    else if (a === "igtbhome") { I.tb.home = b.dataset.k; this._renderModal(); }
    else if (a === "igtbsave") { this._hass.callWS({ type: "fenster_heizung/tb_set", ...(I.tb.token.trim() ? { token: I.tb.token.trim() } : {}), home: I.tb.home, res: I.tb.res || "h" }).then(() => this._tbLoad(true)).catch(() => {}); this._modal = null; this._renderModal(); this._toast("Tibber gespeichert"); }
    else if (a === "igtbrm") { this._hass.callWS({ type: "fenster_heizung/tb_set", token: "", home: "" }).then(() => this._tbLoad(true)).catch(() => {}); this._modal = null; this._renderModal(); this._toast("Tibber entfernt"); }
    else if (a === "igsave") { this._wbSave({ ip: I.draft.ip.trim() }, true); this._modal = null; this._renderModal(); this._render(); this._toast("go-e Charger gespeichert"); }
    else if (a === "igrm") { this._wbSave({ ip: "", enabled: false, mode: "off" }, true); this._modal = null; this._renderModal(); this._render(); this._toast("go-e Charger entfernt"); }
  }
  _igChange(t) { const I = this._igS; if (I && t.dataset.f === "igip") { I.draft.ip = t.value; I.test = null; return true; } if (I && t.dataset.f === "igtbtok") { I.tb.token = t.value; I.tbTest = null; if (this._modal && this._modal.type === "igtb") this._renderModal(); return true; } return false; }

  /* Modul 8: Heute, Schnellstart, Hausanschluss-Schutz, Benachrichtigungen */
  _wbxToday(d) {
    const s = this._wbSnap(), i = s.info, T = (this._wbStD && this._wbStD.data) || null, td = ((n) => `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`)(new Date()), r = T && (T.days || []).find((x) => x.d === td);
    this._wbStatLoad();
    const kwh = r ? r.pv + r.grid : 0, pv = r ? r.pv : 0, share = kwh > 0 ? pv / kwh * 100 : 0, now = i.power != null ? i.power : 0, sur = s.want && s.want.surplus_w != null ? s.want.surplus_w : 0, ns = now > 0 ? Math.min(100, sur / now * 100) : 0;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `<div class="card ocard"><h2>${ic("clock", 18)}Heute</h2>
      <div class="lugrid">${tile("Geladen", num(kwh, 1) + " kWh", `${num(pv, 1)} kWh Sonne`)}${tile("Sonnenanteil", num(share, 0) + " %", "heute")}${tile("Kosten", num(r ? r.cost : 0, 2) + " €", "Netzstrom")}${tile("Jetzt", num(now / 1000, 1) + " kW", now > 0 ? num(ns, 0) + " % davon Sonne" : "keine Ladung")}</div>
      ${now > 0 ? `<div class="gsbar" style="margin-top:10px" role="img" aria-label="Anteil Sonne und Netz jetzt"><i style="width:${ns}%;background:#2dd4bf"></i><i style="width:${100 - ns}%;background:#f59e0b"></i></div><div class="gsleg" style="margin-top:6px"><span><i style="background:#2dd4bf"></i>Sonne</span><span><i style="background:#f59e0b"></i>Netz</span></div>` : ""}</div>`;
  }
  _wbxParts() {
    const sn = this._wbSnap(), c = sn.cfg, G = c.guard, N = c.notify, q = sn.quick && sn.quick.k, adm = this._admin(), sw = (lab, k, on, hint) => `<div class="vrow"><span>${lab}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span><button class="sw ${on ? "on" : ""}" data-act="wbxsw" data-k="${k}" aria-pressed="${on}" aria-label="${lab}" ${adm ? "" : "disabled"}></button></div>`;
    const Q = [["h1", "1 Stunde voll"], ["goal", "Bis zum Ziel voll"], ["sun", "Heute nur Sonne"]], gi = sn.guard;
    const svc = [...new Set([...Object.keys((this._hass.services || {}).notify || {}).filter((n) => n !== "send_message").sort().map((n) => "notify." + n), ...N.to])];
    const min = sn.quick && sn.quick.until ? Math.max(1, Math.ceil((sn.quick.until * 1000 - Date.now()) / 6e4)) : 0;
    return {
      quick: `        <div class="mut sm" style="margin:0 0 6px">Einmalig, ohne den Modus oder die Planung zu ändern. Endet von selbst, beim Abstecken oder mit „Stopp“.</div>
        ${q ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:#2dd4bf">${ic("energy", 18)}</span><div class="opi"><b>Schnellstart läuft: ${esc(Q.find((x) => x[0] === q)[1])}</b><small>${q === "h1" ? `Noch ${min} Minuten.` : q === "goal" ? "Bis zum Ladelimit oder zum Abstecken." : "Bis Mitternacht, nur mit Überschuss."}</small></div><button class="btn2 dng" data-act="wbxq" data-k="" style="flex:none">Stopp</button></div>` : `<div class="gschips">${Q.map(([k, l]) => `<button class="gsch" data-act="wbxq" data-k="${k}" ${adm && c.enabled ? "" : "disabled"}>${l}</button>`).join("")}</div>${c.enabled ? "" : `<div class="mut sm" style="margin-top:6px">Schalte zuerst die Laderegelung ein.</div>`}`}`,
      guard: `        ${sw("Wallbox drosseln, wenn der Hausanschluss voll ist", "guard", G.on, "Schützt die Hauptsicherung, zum Beispiel wenn Herd, Backofen und Wallbox zusammen laufen.")}
        ${G.on ? `<div class="vrow"><span>Höchststrom am Hausanschluss<small class="mut" style="display:block">Pro Phase, Wert deiner Hauptsicherung oder niedriger.</small></span><div class="step" style="flex:none"><button data-act="wbxg" data-s="-1" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${G.maxA} A</b><button data-act="wbxg" data-s="1" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>
        ${gi ? `<div class="gsbar" style="margin-top:8px" role="progressbar" aria-valuenow="${gi.total_a}" aria-valuemin="0" aria-valuemax="${G.maxA}"><i style="width:${Math.min(100, gi.house_a / G.maxA * 100)}%;background:#6366f1"></i><i style="width:${Math.min(100 - Math.min(100, gi.house_a / G.maxA * 100), gi.wb_a / G.maxA * 100)}%;background:#2dd4bf"></i></div><div class="gsleg" style="margin-top:6px"><span><i style="background:#6366f1"></i>Haus</span><span><i style="background:#2dd4bf"></i>Wallbox</span></div><div class="mut sm" style="margin-top:4px">Haus ${num(gi.house_a, 1)} A + Wallbox ${num(gi.wb_a, 1)} A = ${num(gi.total_a, 1)} A von ${G.maxA} A${gi.limited ? " · Die Wallbox wird gerade gedrosselt." : "."}</div>` : `<div class="mut sm" style="margin-top:8px">Für die Messung braucht Modul 3 (Energie) oder die Photovoltaik-Einstellung einen Zähler-Sensor.</div>`}
        <div class="mut sm" style="margin-top:4px">Der Hausstrom wird aus dem Netzbezug geschätzt (gleichmäßig auf drei Phasen). Die Wallbox wird zuerst gedrosselt, nie das Haus.</div>` : ""}`,
      notify: `        <div class="mut sm" style="margin:0 0 6px">Meldungen aufs Handy, zum Beispiel über die Home-Assistant-App.</div>
        ${sw("Ladung gestartet", "start", N.start)}${sw("Ziel-Ladestand erreicht", "goal", N.goal)}${sw("Ladeplan reicht nicht, Netzstrom nötig", "plan", N.plan)}${sw("Wallbox nicht erreichbar", "off", N.off)}${sw("Auto steckt lange ohne Ladung", "long", N.long, "Nach 12 Stunden, zum Beispiel wenn der Ladeplan nie startet.")}
        <div class="lsec" style="margin-top:8px">${ic("bell", 15)}Senden an</div>
        ${svc.length ? `<div class="gschips">${svc.map((n) => `<button class="gsch ${N.to.includes(n) ? "sel" : ""}" data-act="wbxn" data-k="${esc(n)}" aria-pressed="${N.to.includes(n)}" ${adm ? "" : "disabled"}>${esc(n.replace("notify.", ""))}${((this._hass.services || {}).notify || {})[n.slice(7)] === undefined ? " (nicht gefunden)" : ""}</button>`).join("")}</div>` : `<div class="mut sm">Keine Benachrichtigungsdienste gefunden. Installiere die Home-Assistant-App auf dem Handy, dann erscheint sie hier.</div>`}` };
  }
  _wbxQuickCard() { return `<div class="card ocard"><h2>${ic("energy", 18)}Schnellstart</h2>${this._wbxParts().quick}</div>`; }
  _wbSecS() {
    if (!this._wbSecO) { let v = {}; try { v = JSON.parse(localStorage.getItem("fh_wbsec") || "{}") || {}; } catch (e) { v = {}; } this._wbSecO = v && typeof v === "object" ? v : {}; }
    return this._wbSecO;
  }
  _wbSecSave() { try { localStorage.setItem("fh_wbsec", JSON.stringify(this._wbSecO || {})); } catch (e) { /* ohne Speicher */ } }
  _wbSec(key, ico, title, sum, body, warn) {
    const o = !!this._wbSecS()[key];
    return `<div class="card ocard wsec ${o ? "open" : ""}"><button data-act="wbsec" data-k="${key}" aria-expanded="${o}">${ic(ico, 20)}<span class="wst"><b>${title}${warn ? `<em class="wdot" title="Braucht Aufmerksamkeit">!</em>` : ""}</b><span>${sum}</span></span><span class="wch">${ic("chev", 18)}</span></button>${o ? `<div class="wbody">${body}</div>` : ""}</div>`;
  }
  /* Statusleiste über allen Registern: Zustand, Modus, Fahrzeug, Leistung und Hinweise mit Sprung zur Lösung */
  _wbBar() {
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want || {}, who = s.who;
    const veh = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null, MN = { off: "Aus", pv: "Sonne", minpv: "Sonne + Netz", now: "Voll" };
    const em = who ? (veh ? veh.mode : who.kind === "guest" ? c.guest.mode : c.mode) : c.mode;
    const st = !s.ok ? ["bad", "Nicht erreichbar"] : !c.enabled ? ["off", "Regelung aus"] : s.hold > 0 ? ["warn", "Pausiert"] : c.planOn ? ["ok", "Planung aktiv"] : ["ok", "Regelung aktiv"];
    const chip = (cls, t) => `<span class="wbchip ${cls}">${cls ? "<i></i>" : ""}${t}</span>`;
    const chips = chip(st[0], st[1]) + (s.ok && c.enabled && !c.planOn ? chip("", `Modus ${MN[em] || "–"}`) : "") + (s.ok && who ? chip("", `${ic("car", 13)} ${esc(who.name)}`) : "") + (s.ok && i.power > 0 ? chip("", `${ic("energy", 13)} ${wfmt(i.power)}`) : "") + (s.quick ? chip("warn", "Schnellstart") : "");
    const N = [];
    if (!s.ok) N.push([`Keine Verbindung zur Wallbox${s.error ? " (" + esc(s.error) + ")" : ""}. Prüfe Strom und WLAN der Wallbox.`, "wb", "Verbindung prüfen"]);
    else if (c.enabled && s.hold > 0) N.push([`Du hast die Wallbox von Hand umgestellt. Die Regelung pausiert noch ${Math.ceil(s.hold / 60)} Min. und regelt dann wieder.`]);
    if (s.ok && c.enabled && !s.hold && w.state === "gesperrt") N.push(["Die Regelung wartet auf eine Karte. Lege die Karte an der Wallbox an.", "veh", "Karten ansehen"]);
    if (s.ok && c.enabled && !s.hold && w.state && w.state !== "gesperrt" && w.surplus_w == null && (em === "pv" || em === "minpv" || c.planOn)) N.push(["Es fehlt ein Netz-Sensor für den Überschuss (Modul 3 oder Photovoltaik in Modul 1). Ohne ihn wird nicht mit Sonne geladen."]);
    return `<div class="wbbar">${chips}</div>${N.map((n) => `<div class="gst on" style="margin:0 0 10px">${ic("info", 15)}<span>${n[0]}${n[1] ? ` <button class="lnk" data-act="wbgo" data-k="${n[1]}">${n[2]}</button>` : ""}</span></div>`).join("")}`;
  }
  /* Einrichtungs-Check im Register Einstellungen */
  _wbCheck() {
    this._wbFcLoad(); this._tbLoad();
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want || {}, F = this._wbFcD && this._wbFcD.data, TB = this._tb(), cards = (i && i.cards) || [];
    const noCard = c.vehicles.filter((x) => !x.ids.length);
    const R = [
      [s.ok ? "ok" : "bad", "Wallbox verbunden", s.ok ? `${esc(i.name || "go-e Charger")} antwortet.` : "Keine Antwort von der Wallbox.", "wb", "Prüfen"],
      [s.soc != null ? "ok" : "warn", "Ladestand-Sensor des Fahrzeugs", s.soc != null ? `Ladestand ${num(s.soc, 0)} %.` : "Ohne ihn gibt es keine Planung und kein Ladelimit.", null, null, "mdevset"],
      [!c.enabled || !w.state ? "opt" : w.surplus_w != null ? "ok" : "warn", "Netz-Sensor für den Überschuss", !c.enabled || !w.state ? "Wird geprüft, sobald die Regelung läuft." : w.surplus_w != null ? `Überschuss ${wfmt(w.surplus_w)}.` : "Fehlt in Modul 3 und in der Photovoltaik-Einstellung von Modul 1."],
      [c.vehicles.length ? "ok" : "warn", "Fahrzeug angelegt", c.vehicles.length ? c.vehicles.map((x) => esc(x.name)).join(", ") : "Lege ein Fahrzeug an, damit Modus und Limit pro Fahrzeug gelten.", "veh", "Anlegen"],
      [!c.vehicles.length ? "opt" : !cards.length ? "warn" : noCard.length ? "warn" : "ok", "Karten zugeordnet", !c.vehicles.length ? "Zuerst ein Fahrzeug anlegen." : !cards.length ? "In der go-e-App sind noch keine RFID-Karten angelegt." : noCard.length ? `${noCard.map((x) => esc(x.name)).join(", ")} ${noCard.length === 1 ? "hat" : "haben"} noch keine Karte.` : "Jedes Fahrzeug hat mindestens eine Karte.", "veh", "Zuordnen"],
      [TB.connected ? "ok" : "opt", "Strompreis (optional)", TB.connected ? "Tibber ist verbunden." : "Für die Planung nach Preis: Tibber unter Einstellungen → Integrationen verbinden oder einen Preis-Sensor in Modul 1 wählen."],
      [F && F.fs && F.fs.found ? "ok" : "opt", "PV-Prognose (optional)", F && F.fs && F.fs.found ? "Forecast.Solar wurde erkannt." : "Für die Planung nach Sonne: die Integration Forecast.Solar in Home Assistant einrichten."],
    ];
    const need = R.filter((r) => r[0] !== "opt"), done = need.filter((r) => r[0] === "ok").length, all = need.length && done === need.length;
    const ico = { ok: ["check", "#2dd4bf"], warn: ["info", "#f59e0b"], bad: ["info", "#f87171"], opt: ["minus", "#64748b"] };
    return `<div class="card ocard"><h2>${ic("check", 18)}Einrichtung<span class="mut sm" style="margin-left:auto;font-weight:500">${all ? "Alles bereit" : `${done} von ${need.length} erledigt`}</span></h2>
      <div class="gsbar" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${need.length}"><i style="width:${need.length ? done / need.length * 100 : 0}%;background:${all ? "#2dd4bf" : "#f59e0b"}"></i></div>
      ${R.map((r) => `<div class="wck"><span class="wcki" style="color:${ico[r[0]][1]}">${ic(ico[r[0]][0], 16)}</span><span class="wckt"><b>${r[1]}</b><small class="mut">${r[2]}</small></span>${r[0] !== "ok" && r[3] && this._admin() ? `<button class="lnk" data-act="wbgo" data-k="${r[3]}">${r[4]}</button>` : ""}${r[0] !== "ok" && r[5] && this._admin() ? `<button class="lnk" data-act="${r[5]}">Einrichten</button>` : ""}</div>`).join("")}</div>`;
  }
  _wbxAct(a, b) {
    const c = this._wb(), k = b.dataset.k;
    if (a === "wbxq") { this._hass.callWS({ type: "fenster_heizung/wb_quick", kind: k || "" }).then((r) => { this._wbD = { snap: this._wbSaveT ? { ...r, cfg: this._wbSnap().cfg } : r, ts: Date.now() }; this._render(); }).catch(() => this._toast("Schnellstart konnte nicht gestartet werden")); return; }
    if (a === "wbxsw") { if (k === "guard") this._wbSave({ guard: { ...c.guard, on: !c.guard.on } }, true); else this._wbSave({ notify: { ...c.notify, [k]: !c.notify[k] } }, true); }
    else if (a === "wbxg") this._wbSave({ guard: { ...c.guard, maxA: Math.max(10, Math.min(63, c.guard.maxA + Number(b.dataset.s))) } });
    else if (a === "wbxn") this._wbSave({ notify: { ...c.notify, to: c.notify.to.includes(k) ? c.notify.to.filter((x) => x !== k) : [...c.notify.to, k] } }, true);
    else if (a === "wbcsv") return this._wbCsv();
    this._render();
  }
  _wbCsv() {
    const D = (this._wbStD && this._wbStD.data) || {}, days = D.days || [];
    if (!days.length) return this._toast("Noch keine Ladungen zum Exportieren");
    const f = (v, n) => String(Number(v || 0).toFixed(n)).replace(".", ","), rows = [["Datum", "Sonne kWh", "Netz kWh", "Gesamt kWh", "Kosten EUR", "Kosten ohne Sonne EUR", "Kilometer"]];
    days.forEach((r) => rows.push([r.d, f(r.pv, 2), f(r.grid, 2), f(r.pv + r.grid, 2), f(r.cost, 2), f(r.full, 2), f(r.km, 1)]));
    rows.push([]); rows.push(["Ladevorgänge"]); rows.push(["Start", "Dauer Minuten", "Fahrzeug", "kWh", "davon Sonne kWh", "Kosten EUR"]);
    (D.sessions || []).forEach((x) => rows.push([x.start, f(x.min, 0), x.veh, f(x.kwh, 2), f(x.pv, 2), f(x.cost, 2)]));
    const csv = "\ufeff" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    try { const u = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), el = document.createElement("a"); el.href = u; el.download = "ladestatistik.csv"; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); this._toast("Ladestatistik exportiert"); }
    catch (e) { this._toast("Export nicht möglich"); }
  }
  /* Abfahrtszeit pro Fahrzeug (in der Planung): eigenes Ziel, eigene Uhrzeit, eigene Tage */
  _wbDep(v) { const c = this._wb(), d = (v && v.dep) || {}; return { on: !!d.on, soc: d.soc || c.planSoc, time: d.time || c.planTime, days: d.days || c.planDays }; }
  _wbdAct(a, b) {
    const c = this._wb(), id = b.dataset.v, k = b.dataset.k;
    const upd = (fn) => this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? { ...x, dep: fn(this._wbDep(x)) } : x)) });
    if (a === "wbdsw") upd((d) => ({ ...d, on: !d.on }));
    else if (a === "wbdsoc") upd((d) => ({ ...d, soc: Math.max(20, Math.min(100, d.soc + Number(b.dataset.s))) }));
    else if (a === "wbddays") upd((d) => ({ ...d, days: k }));
    this._render();
  }
  /* Planung: Strompreis- und PV-Vorhersage, günstigste Ladefenster */
  _wbFcLoad(force) {
    if (!this._hass || this._wbFcBusy) return;
    if (!force && this._wbFcD && Date.now() - this._wbFcD.ts < 60000) return;
    this._wbFcBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wb_forecast" }).then((r) => { this._wbFcD = { data: r || {}, ts: Date.now() }; }).catch(() => { this._wbFcD = { data: { error: true }, ts: Date.now() }; })
      .finally(() => { this._wbFcBusy = false; if (this._wbStT() === "plan" && this._wbVisible()) this._render(); });
  }
  _wbPlanCalc(hours, o) {
    const SL = o.sh || 1, now = new Date(), [hh, mm] = String(o.until || "07:00").split(":").map(Number), dl = new Date(now); dl.setHours(hh || 0, mm || 0, 0, 0); if (dl <= now) dl.setDate(dl.getDate() + 1);
    const P = o.pmax, need = Math.max(0, (o.target - o.soc) / 100 * o.cap), sun = o.strat === "sun", price = o.strat === "price", lv = o.rank === "level", LR = { VERY_CHEAP: 0, CHEAP: 1, NORMAL: 2, EXPENSIVE: 3, VERY_EXPENSIVE: 4 };
    const cand = hours.map((h, i) => ({ i, h, t: new Date(h.t) })).filter((c) => c.t.getTime() + SL * 36e5 > now.getTime() && c.t.getTime() + SL * 36e5 <= dl.getTime());
    const pw = (c) => sun ? Math.min(P, c.h.pv) : P, share = (c) => { const e = pw(c); return e > 0 ? Math.min(c.h.pv, e) / e : 0; }, rk = (c) => lv ? (LR[c.h.level || "NORMAL"] ?? 2) * 100 : 0;
    const pool = cand.filter((c) => !sun || c.h.pv >= o.minkw);
    pool.sort((a, b) => sun ? b.h.pv - a.h.pv : price ? rk(a) + a.h.price - (rk(b) + b.h.price) : rk(a) + a.h.price * (1 - share(a)) - (rk(b) + b.h.price * (1 - share(b))));
    const sel = {}; let left = need;
    for (const c of pool) { if (left <= 0.01) break; const e = Math.min(pw(c) * SL, left); if (e <= 0) continue; sel[c.i] = e; left -= e; }
    const calc = (m) => { let kwh = 0, pv = 0, cost = 0; Object.keys(m).forEach((i) => { const h = hours[i], e = m[i], kw = e / SL, s = kw > 0 ? Math.min(1, h.pv / kw) : 0; kwh += e; pv += e * s; cost += e * (1 - s) * h.price / 100; }); return { kwh, pv, cost }; };
    const imm = {}; let l2 = need; cand.forEach((c) => { if (l2 <= 0.01) return; const e = Math.min(P * SL, l2); imm[c.i] = e; l2 -= e; });
    return { sel, left: Math.max(0, left), need, dl, plan: calc(sel), imm: calc(imm), cand };
  }
  _wbPlan(d) {
    this._wbFcLoad(); this._tbLoad();
    const F = this._wbFcD && this._wbFcD.data, c = this._wbSnap().cfg, adm = this._admin();
    if (!F) return `<div class="card empty">${ic("sun", 30)}<div class="sm" style="margin-top:8px">Vorhersage wird geladen …</div></div>`;
    if (F.error || !(F.hours || []).length) return `<div class="card empty">${ic("sun", 30)}<div style="margin:8px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Vorhersage verfügbar</div><div class="sm" style="max-width:480px;margin:0 auto">Wähle in den Einstellungen von Modul 3 einen Preis-Sensor mit Stundenpreisen (zum Beispiel Tibber oder aWATTar) und eine PV-Prognose (zum Beispiel Forecast.Solar oder Solcast).</div></div>`;
    const who = this._wbSnap().who, veh = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null, vd = veh ? this._wbDep(veh) : null, eff = vd && vd.on ? { soc: vd.soc, time: vd.time, days: vd.days, name: veh.name } : { soc: c.planSoc, time: c.planTime, days: c.planDays, name: "" };
    const P = { strat: c.planStrat || "mix" }, pad = (v) => String(v).padStart(2, "0"), hrs = F.hours, SL = (F.slot_min || 60) / 60, tm = (t) => pad(t.getHours()) + ":" + pad(t.getMinutes());
    const soc = d.soc != null ? d.soc : this._wbSnap().soc != null ? this._wbSnap().soc : 40, ph = c.ph === 1 ? 1 : 3, pmax = Math.round(c.maxA * 0.23 * ph * 10) / 10;
    const R = this._wbPlanCalc(hrs, { strat: P.strat, target: eff.soc, soc, cap: c.cap, until: eff.time, pmax, minkw: Math.max(1.4, c.startW / 1000), sh: SL, rank: this._tb().connected && c.planSrc !== "sensor" && this._tb().res === "lvl" ? "level" : "price" });
    const shown = hrs.map((h, i) => ({ h, i, t: new Date(h.t) })).filter((x) => x.t.getTime() + SL * 36e5 > Date.now()).slice(0, Math.round(30 / SL)), n = shown.length;
    const W = 640, Hh = 240, pl = 36, pr = 40, pb = 24, pt = 8, bw = (W - pl - pr) / n, bar = Math.min(bw * (SL < 1 ? 0.8 : 0.7), 18);
    const mxP = Math.max(pmax, ...shown.map((x) => x.h.pv)), stepP = enStep(mxP), topP = Math.ceil(mxP / stepP) * stepP, mxC = Math.max(...shown.map((x) => x.h.price), 1), topC = Math.ceil(mxC / 10) * 10, minC = Math.min(0, ...shown.map((x) => x.h.price));
    const yP = (v) => Hh - pb - (v / topP) * (Hh - pb - pt), yC = (v) => Hh - pb - ((v - minC) / (topC - minC)) * (Hh - pb - pt);
    let g = "", bars = "", line = "", pts = [];
    for (let v = 0; v <= topP + 1e-9; v += stepP) { const y = yP(v); g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="#2dd4bf">${num(v, 0)}</text>`; }
    for (let v = 0; v <= topC; v += topC / 4) g += `<text x="${W - pr + 6}" y="${yC(v) + 4}" font-size="11" fill="#f59e0b">${num(v, 0)}</text>`;
    shown.forEach((x, k) => { const xx = pl + k * bw, cx = xx + bw / 2, on = R.sel[x.i] != null, beyond = x.t.getTime() + SL * 36e5 > R.dl.getTime();
      if (on) bars += `<rect x="${xx + 1}" y="${pt}" width="${bw - 2}" height="${Hh - pb - pt}" rx="4" fill="#2dd4bf" opacity=".16" stroke="#2dd4bf" stroke-opacity=".5"/>`;
      bars += `<rect x="${cx - bar / 2}" y="${yP(x.h.pv)}" width="${bar}" height="${Math.max(0, Hh - pb - yP(x.h.pv))}" rx="2" fill="#2dd4bf" opacity="${beyond ? .3 : .9}"><title>${tm(x.t)} · PV ${num(x.h.pv, 1)} kW · ${num(x.h.price, 1)} ct/kWh${on ? " · Ladung " + num(R.sel[x.i], 1) + " kWh" : ""}</title></rect>`;
      pts.push(`${cx},${yC(x.h.price)}`); if ((x.t.getMinutes() === 0 && x.t.getHours() % 3 === 0) || k === 0) bars += `<text x="${cx}" y="${Hh - 7}" text-anchor="middle" font-size="11" fill="var(--mut)">${pad(x.t.getHours())}${x.t.getHours() === 0 ? "" : ""}</text>`;
      if (x.t.getHours() === 0 && x.t.getMinutes() === 0 && k > 0) bars += `<line x1="${xx}" x2="${xx}" y1="${pt}" y2="${Hh - pb}" stroke="var(--line)"/>`; });
    const dlk = shown.findIndex((x) => x.t.getTime() + SL * 36e5 > R.dl.getTime()); if (dlk > 0) bars += `<line x1="${pl + dlk * bw}" x2="${pl + dlk * bw}" y1="${pt}" y2="${Hh - pb}" stroke="#f87171" stroke-dasharray="4 3"/><text x="${pl + dlk * bw - 4}" y="${pt + 10}" text-anchor="end" font-size="11" fill="#f87171">Bis ${esc(eff.time)}</text>`;
    line = `<polyline points="${pts.join(" ")}" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linejoin="round"/>`;
    const win = []; Object.keys(R.sel).map(Number).sort((a, b) => a - b).forEach((i) => { const l = win[win.length - 1]; if (l && l.end === i) { l.end = i + 1; l.kwh += R.sel[i]; l.idx.push(i); } else win.push({ start: i, end: i + 1, kwh: R.sel[i], idx: [i] }); });
    const hm = (i) => tm(new Date(hrs[i].t)), hend = (i) => tm(new Date(new Date(hrs[i].t).getTime() + SL * 36e5)), wsum = (w) => { let pv = 0, co = 0; w.idx.forEach((i) => { const h = hrs[i], e = R.sel[i], s = Math.min(1, h.pv / Math.max(e / SL, 0.0001)); pv += e * s; co += e * (1 - s) * h.price / 100; }); return { s: w.kwh > 0 ? pv / w.kwh * 100 : 0, c: co }; };
    const chip = (k, t) => `<button class="gsch ${P.strat === k ? "sel" : ""}" data-act="wbplan" data-k="${k}" aria-pressed="${P.strat === k}">${t}</button>`;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const sh = R.plan.kwh > 0 ? R.plan.pv / R.plan.kwh * 100 : 0, sav = Math.max(0, R.imm.cost - R.plan.cost), STR = { mix: "Sonne zuerst, dann günstig: wählt die Stunden mit den niedrigsten effektiven Kosten aus PV-Anteil und Preis.", sun: "Nur Sonne: lädt nur in Stunden mit genug PV-Überschuss. Reicht das nicht, fehlt am Ende Energie.", price: "Günstigster Preis: wählt die Stunden mit dem niedrigsten Strompreis, egal ob die Sonne scheint." };
    const FS = F.fs || {}, pvs = c.pvSrc === "sensor" ? "sensor" : "forecast", pvChip = (k, t) => `<button class="gsch ${pvs === k ? "sel" : ""}" data-act="wbpv" data-k="${k}" aria-pressed="${pvs === k}" ${adm ? "" : "disabled"}>${t}</button>`;
    const TB = this._tb(), tbOn = !!TB.connected, src = c.planSrc === "sensor" || !tbOn ? "sensor" : "tibber", srcChip = (k, t) => `<button class="gsch ${src === k ? "sel" : ""}" data-act="wbsrc" data-k="${k}" aria-pressed="${src === k}" ${adm && (k === "sensor" || tbOn) ? "" : "disabled"}>${t}</button>`;
    return `<div class="card"><h2>${ic("sun", 18)}Ladeplanung nach Preis und Sonne</h2>
      <div class="vrow"><span>Planung aktiv<small class="mut" style="display:block">${c.planOn ? "Echte Steuerung: Die Wallbox lädt nur in den geplanten Fenstern und wird dazwischen pausiert." : "Aus: Der Plan wird nur angezeigt, die Wallbox lädt nicht danach."}</small></span><button class="sw ${c.planOn ? "on" : ""}" data-act="wbsw" data-k="planOn" aria-pressed="${!!c.planOn}" aria-label="Planung aktiv" ${adm ? "" : "disabled"}></button></div>
      ${c.planOn ? (() => { const nowI = hrs.findIndex((h) => { const t = new Date(h.t); return t <= new Date() && t.getTime() + SL * 36e5 > Date.now(); }), run = nowI >= 0 && R.sel[nowI] != null, nxt = Object.keys(R.sel).map(Number).filter((i) => i > nowI).sort((a, b) => a - b)[0], fin = R.need <= 0.05;
        return `<div class="otr"><span class="oav" style="width:36px;height:36px;background:${run ? "#2dd4bf" : "#64748b"}">${ic(run ? "energy" : "clock", 18)}</span><div class="opi"><b>${fin ? "Ziel erreicht, es wird nicht geladen" : run ? "Lädt jetzt nach Plan" : nxt != null ? "Wartet auf das nächste Ladefenster" : "Kein Ladefenster geplant"}</b><small>${fin ? "Der Ladestand liegt schon über dem Ziel." : run ? `Bis ${hend(nowI)} Uhr, ${num(R.sel[nowI], 1)} kWh geplant.` : nxt != null ? `Nächster Start um ${hm(nxt)} Uhr.` : "Das Ziel wird mit dem Ladeplan erreicht."}</small></div></div>`; })() : ""}
      ${c.planOn && !c.enabled ? `<div class="gst on">${ic("info", 15)}Die Laderegelung ist aus. Schalte sie im Register „Laden“ ein, sonst wird nichts nach Plan geladen.</div>` : ""}
      <div class="mut sm" style="margin:6px 0 8px">Ziel: <b>${eff.soc} %</b> bis <b>${esc(eff.time)} Uhr</b>${soc != null ? ` · jetzt ${num(soc, 0)} %` : ""} · Ladeleistung bis ${num(pmax, 1)} kW. ${eff.name ? `Abfahrt von <b>${esc(eff.name)}</b>, siehe unten.` : "Ziel und Uhrzeit stellst du unten unter „Standard-Abfahrt“ ein, pro Fahrzeug unten."}</div>
      ${(() => { const wd = R.dl.getDay(), bad = (eff.days === "wk" && (wd === 0 || wd === 6)) || (eff.days === "we" && wd > 0 && wd < 6); return bad ? `<div class="gst on" style="margin:0 0 10px">${ic("info", 15)}<span>Das Ziel liegt auf ${["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][wd]}, dafür gilt keine Abfahrt (${eff.days === "wk" ? "Mo–Fr" : "Wochenende"}). Es wird nicht nach Plan geladen, es gilt der normale Modus.</span></div>` : ""; })()}
      <div class="gschips">${chip("mix", "Sonne zuerst, dann günstig")}${chip("sun", "Nur Sonne")}${chip("price", "Günstigster Preis")}</div>
      <div class="mut sm" style="margin:2px 0 10px">${STR[P.strat]}</div>
      ${R.left > 0.05 ? `<div class="gst on">${ic("info", 15)}Bis ${esc(eff.time)} Uhr fehlen voraussichtlich ${num(R.left, 1)} kWh. Dann lädt der Ladeplan zum Schluss mit Netzstrom nach.</div>` : ""}
      <div class="wbsc"><svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="PV-Prognose in kW und Strompreis in ct/kWh für die nächsten Stunden">${g}${bars}${line}</svg></div>
      <div class="gsleg" style="margin-top:6px"><span><i style="background:#2dd4bf"></i>PV-Überschuss (kW)</span><span><i style="background:#f59e0b"></i>Strompreis (ct/kWh)</span><span><i style="background:#2dd4bf;opacity:.35;outline:1px solid #2dd4bf"></i>Geplante Ladung</span></div>
      <div class="lugrid" style="margin-top:12px">${tile("Geplant", num(R.plan.kwh, 1) + " kWh", `von ${num(R.need, 1)} kWh benötigt`)}${tile("Sonnenanteil", num(sh, 0) + " %", "erwartet")}${tile("Kosten", num(R.plan.cost, 2) + " €", "erwarteter Netzstrom")}${tile("Ersparnis", num(sav, 2) + " €", "gegenüber sofort laden")}</div></div>
      ${this._wbCard(d, "dep")}
      <div class="card"><h2>${ic("car", 18)}Abfahrtszeit pro Fahrzeug</h2>
        <div class="mut sm" style="margin:0 0 8px">Jedes Fahrzeug kann sein eigenes Ziel und seine eigene Uhrzeit haben. Es gilt das Fahrzeug, das an der Karte erkannt wird. Ohne eigene Abfahrt, bei Gästen und ohne erkannte Karte gilt die Standard-Abfahrt (<b>${c.planSoc} %</b> bis <b>${esc(c.planTime)} Uhr</b>).</div>
        ${c.vehicles.length ? c.vehicles.map((x) => { const dd = this._wbDep(x), act = veh && veh.id === x.id; return `<div class="rfv"><div class="oper" style="padding:0"><span class="oav" style="background:#2dd4bf">${ic("car", 20)}</span><div class="opi"><b>${esc(x.name)}</b><small>${dd.on ? `${dd.soc} % bis ${esc(dd.time)} Uhr · ${({ all: "täglich", wk: "Mo–Fr", we: "Wochenende" })[dd.days]}` : "Nutzt den Ladeplan"}</small></div>${act ? `<span class="ost home">Aktiv</span>` : ""}<button class="sw ${dd.on ? "on" : ""}" data-act="wbdsw" data-v="${x.id}" aria-pressed="${dd.on}" aria-label="Eigene Abfahrt für ${esc(x.name)}" ${adm ? "" : "disabled"}></button></div>
          ${dd.on ? `<div class="vrow"><span>Ziel-Ladestand</span><div class="step" style="flex:none"><button data-act="wbdsoc" data-v="${x.id}" data-s="-5" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${dd.soc} %</b><button data-act="wbdsoc" data-v="${x.id}" data-s="5" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>
          <div class="vrow"><span>Abfahrt</span><input class="osel" type="time" data-f="wbdt" data-v="${x.id}" value="${esc(dd.time)}" style="width:auto;margin:0" aria-label="Abfahrtszeit ${esc(x.name)}" ${adm ? "" : "disabled"}></div>
          <div class="gschips">${[["all", "Täglich"], ["wk", "Mo–Fr"], ["we", "Wochenende"]].map(([k, t]) => `<button class="gsch ${dd.days === k ? "sel" : ""}" data-act="wbddays" data-v="${x.id}" data-k="${k}" aria-pressed="${dd.days === k}" ${adm ? "" : "disabled"}>${t}</button>`).join("")}</div>` : ""}</div>`; }).join("") : `<div class="mut sm">Lege unter „Laden“ → Fahrzeuge &amp; Karten ein Fahrzeug an, dann kannst du hier seine Abfahrtszeit einstellen.</div>`}</div>
      <div class="card"><h2>${ic("clock", 18)}Geplante Ladefenster</h2>${win.length ? `<div class="wbses">${win.map((w) => { const x = wsum(w), d0 = new Date(hrs[w.start].t), tom = d0.toDateString() !== new Date().toDateString(); return `<div class="wbse"><div><b>${hm(w.start)} – ${hend(w.end - 1)}</b><span class="mut sm">${tom ? "morgen" : "heute"} · ${SL < 1 ? num((w.end - w.start) * SL * 60, 0) + " Min." : (w.end - w.start) + " " + (w.end - w.start === 1 ? "Stunde" : "Stunden")}</span></div><div class="wbsb"><i style="width:${x.s}%"></i></div><div class="wbsv"><b>${num(w.kwh, 1)} kWh</b><span class="mut sm">${num(x.s, 0)} % Sonne · ${num(x.c, 2)} €</span></div></div>`; }).join("")}</div>` : `<div class="mut sm">Es ist keine Ladung nötig, das Ziel ist schon erreicht.</div>`}
      <div class="mut sm" style="margin:10px 0 0">Quellen: Preis ${src === "tibber" ? "Tibber" + (TB.home ? " · " + esc(TB.home) : "") : esc(F.price_src || "–")} · PV-Prognose ${pvs === "forecast" ? "Forecast.Solar" : esc(F.pv_src || "–")}. Die Vorhersage ändert sich im Laufe des Tages, der Plan wird alle paar Minuten neu berechnet.</div></div>
      <div class="card"><h2>${ic("tools", 18)}Quellen der Vorhersage</h2>
        <div class="lsec">${ic("energy", 15)}Strompreis</div><div class="gschips">${srcChip("tibber", "Tibber")}${srcChip("sensor", "Preis-Sensor (Modul 1)")}</div>
        ${tbOn ? `<div class="mut sm" style="margin:0 0 10px">Tibber · ${esc(TB.home || "Zuhause")} · ${({ h: "Stundenmittel", q: "Viertelstunden", lvl: "Preisstufen" })[TB.res || "h"]}. Die Auflösung stellst du unter Einstellungen → Integrationen → Tibber ein.</div>` : `<div class="mut sm" style="margin:0 0 10px">Tibber ist nicht verbunden. Du richtest es unter Einstellungen → Integrationen ein.</div>`}
        <div class="lsec">${ic("sun", 15)}PV-Prognose</div><div class="gschips">${pvChip("forecast", "Forecast.Solar")}${pvChip("sensor", "Eigener Sensor")}</div>
        ${pvs === "forecast" ? (FS.found ? `<div class="otr"><span class="oav" style="width:36px;height:36px;background:#f59e0b">${ic("sun", 18)}</span><div class="opi"><b>Forecast.Solar erkannt</b><small>${(FS.sites || []).map((x) => esc(x.name) + " " + num(x.kwp, 1) + " kWp").join(" · ")} · heute ${num(FS.today, 1)} kWh · morgen ${num(FS.tomorrow, 1)} kWh</small></div></div>` : `<div class="gst on">${ic("info", 15)}Forecast.Solar wurde in Home Assistant nicht gefunden. Richte es unter Einstellungen → Geräte &amp; Dienste → Integration hinzufügen ein. Mehrere Dachflächen werden addiert.</div>`) : `<div class="mut sm" style="margin:0 0 6px">Der eigene Prognose-Sensor wird in den Einstellungen von Modul 3 gewählt.</div>`}
        <div class="vrow"><span>Grundverbrauch des Hauses<small class="mut" style="display:block">Wird von der Prognose abgezogen: Überschuss = Erzeugung minus Hausverbrauch.</small></span><div class="step" style="flex:none"><button data-act="wbstep" data-k="baseW" data-s="-100" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${num(c.baseW / 1000, 1)} kW</b><button data-act="wbstep" data-k="baseW" data-s="100" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>
        <div class="mut sm">Forecast.Solar liefert die Werte in Home Assistant, ein Abruf pro Stunde genügt. Die kostenlose Stufe hat ein Limit von 12 Abrufen pro Stunde, das reicht für diese Planung.</div></div>`;
  }
  /* Ladestatistik: Balkendiagramm pro Tag, Anteil Sonne/Netz, Kosten */
  _wbStT() { return this._wbTab === "stat" ? "stat" : this._wbTab === "plan" ? "plan" : this._wbTab === "set" ? "set" : "laden"; }
  _wbTabs() {
    const t = this._wbStT(), b = (k, l, i) => `<button class="${t === k ? "sel" : ""}" data-act="wbtab" data-k="${k}" aria-pressed="${t === k}">${ic(i, 16)}${l}</button>`;
    return `<div class="wbtabs" role="tablist">${b("laden", "Laden", "energy")}${b("plan", "Planung", "sun")}${b("stat", "Ladestatistik", "chart")}${b("set", "Einstellungen", "sliders")}</div>`;
  }
  _wbStatLoad(force) {
    if (!this._hass || this._wbStBusy) return;
    if (!force && this._wbStD && Date.now() - this._wbStD.ts < 30000) return;
    this._wbStBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wb_stats" }).then((r) => { this._wbStD = { data: r || {}, ts: Date.now() }; }).catch(() => { this._wbStD = { data: { error: true }, ts: Date.now() }; })
      .finally(() => { this._wbStBusy = false; if (this._wbStT() === "stat" && this._wbVisible()) this._render(); });
  }
  _wbStS() { const n = new Date(); return this._wbStV || (this._wbStV = { per: "m", y: n.getFullYear(), m: n.getMonth(), what: "e", by: "src" }); }
  _wbStat() {
    this._wbStatLoad();
    const S = this._wbStS(), D = (this._wbStD && this._wbStD.data) || null;
    if (!D) return `<div class="card empty">${ic("chart", 30)}<div class="sm" style="margin-top:8px">Ladestatistik wird geladen …</div></div>`;
    if (D.error) return `<div class="card empty">${ic("chart", 30)}<div class="sm" style="margin-top:8px">Die Ladestatistik konnte nicht geladen werden.</div></div>`;
    const days = D.days || [], pad = (v) => String(v).padStart(2, "0"), MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const kosten = S.what === "k", byV = S.by === "veh";
    let slots = [], lab = (s) => s.l;
    if (S.per === "m") { const n = new Date(S.y, S.m + 1, 0).getDate(); for (let i = 1; i <= n; i++) slots.push({ k: `${S.y}-${pad(S.m + 1)}-${pad(i)}`, l: String(i) }); }
    else if (S.per === "y") for (let i = 0; i < 12; i++) slots.push({ k: `${S.y}-${pad(i + 1)}`, l: MON[i].slice(0, 3) });
    else { const ys = [...new Set(days.map((r) => r.d.slice(0, 4)))].sort(); (ys.length ? ys : [String(S.y)]).forEach((y) => slots.push({ k: y, l: y })); }
    const klen = S.per === "m" ? 10 : S.per === "y" ? 7 : 4, ix = Object.fromEntries(slots.map((s, i) => [s.k, i]));
    const vehs = []; days.forEach((r) => Object.keys(r.veh || {}).forEach((n) => { if (!vehs.includes(n)) vehs.push(n); }));
    const PAL = ["#2dd4bf", "#f59e0b", "#a78bfa", "#60a5fa", "#f472b6", "#a3e635"], SRC = ["#2dd4bf", "#f59e0b"];
    const series = byV ? vehs.map((n, i) => ({ id: n, name: n, col: PAL[i % PAL.length] })) : kosten ? [{ id: "grid", name: "Netzkosten", col: "#f59e0b" }] : [{ id: "pv", name: "Sonne", col: SRC[0] }, { id: "grid", name: "Netz", col: SRC[1] }];
    slots.forEach((s) => { s.v = series.map(() => 0); });
    let tot = { kwh: 0, pv: 0, grid: 0, cost: 0, full: 0, km: 0 };
    days.forEach((r) => { const i = ix[r.d.slice(0, klen)]; if (i == null) return; tot.pv += r.pv; tot.grid += r.grid; tot.cost += r.cost; tot.full += r.full || 0; tot.km += r.km || 0; tot.kwh += r.pv + r.grid;
      series.forEach((se, j) => { slots[i].v[j] += byV ? ((r.veh || {})[se.id] ? (kosten ? r.veh[se.id].cost : r.veh[se.id].kwh) : 0) : se.id === "pv" ? r.pv : kosten ? r.cost : r.grid; }); });
    const mx = Math.max(...slots.map((s) => s.v.reduce((a, b) => a + b, 0)), 0.1), step = enStep(mx), top = Math.ceil(mx / step) * step, W = 640, Hh = 210, pl = 34, pb = 22, n = slots.length, bw = (W - pl) / n, bar = Math.min(bw * 0.66, 30);
    const unit = kosten ? "€" : "kWh"; let grid = "", bars = "";
    for (let v = 0; v <= top + 1e-9; v += step) { const y = Hh - pb - (v / top) * (Hh - pb - 8); grid += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${num(v, step < 1 ? 1 : 0)}</text>`; }
    slots.forEach((s, i) => { let y = Hh - pb; const x = pl + i * bw + (bw - bar) / 2; s.v.forEach((v, j) => { const h = (v / top) * (Hh - pb - 8); if (h > 0.4) { y -= h; bars += `<rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${series[j].col}" rx="2"><title>${esc(series[j].name)} ${num(v, 2)} ${unit}</title></rect>`; } });
      if (n <= 14 || i % 2 === 0 || S.per === "m" && (i + 1) % 5 === 0 || i === n - 1) bars += `<text x="${x + bar / 2}" y="${Hh - 6}" text-anchor="middle" font-size="11" fill="var(--mut)">${esc(lab(s))}</text>`; });
    const share = tot.kwh > 0 ? tot.pv / tot.kwh * 100 : 0, ppk = tot.kwh > 0 ? tot.cost / tot.kwh : 0, fullGrid = tot.full > 0 ? tot.full : null, saved = fullGrid != null ? Math.max(0, fullGrid - tot.cost) : null;
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${on}">${t}</button>`;
    const title = S.per === "m" ? `${MON[S.m]} ${S.y}` : S.per === "y" ? String(S.y) : "Gesamt";
    const nav = S.per === "all" ? "" : `<div class="wbnav"><button data-act="wbnav" data-k="-1" aria-label="Zurück">‹</button><b>${title}</b><button data-act="wbnav" data-k="1" aria-label="Weiter">›</button></div>`;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const ses = (D.sessions || []).filter((r) => S.per === "all" ? true : S.per === "y" ? r.start.slice(0, 4) === String(S.y) : r.start.slice(0, 7) === `${S.y}-${pad(S.m + 1)}`).slice(0, 8);
    const fd = (iso) => { const t = new Date(iso); return t.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " " + t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); };
    return `<div class="card"><h2>${ic("chart", 18)}Ladestatistik</h2>
      <div class="wbsh"><div class="gschips">${[["m", "Monat"], ["y", "Jahr"], ["all", "Gesamt"]].map(([k, t]) => chip("wbsper", k, t, S.per === k)).join("")}</div>${nav}</div>
      <div class="wbsh"><div class="gschips">${chip("wbswhat", "e", "Energie", !kosten)}${chip("wbswhat", "k", "Kosten", kosten)}</div><div class="gschips">${chip("wbsby", "src", "Sonne / Netz", !byV)}${vehs.length ? chip("wbsby", "veh", "Fahrzeug", byV) : ""}</div></div>
      <div class="wbst"><b>${kosten ? "Ladekosten" : "Geladene Energie"}</b> <span class="mut">${kosten ? num(tot.cost, 2) + " € gesamt" : num(tot.kwh, 1) + " kWh gesamt"} · ${num(share, 0)} % Sonne</span></div>
      <div class="wbsc"><svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="${kosten ? "Ladekosten in Euro" : "Geladene Energie in kWh"} pro ${S.per === "m" ? "Tag" : S.per === "y" ? "Monat" : "Jahr"}">${grid}${bars}</svg></div>
      <div class="gsleg" style="margin-top:6px">${series.map((se) => `<span><i style="background:${se.col}"></i>${esc(se.name)} <b>${byV ? "" : num(se.id === "pv" ? tot.pv : kosten ? tot.cost : tot.grid, kosten ? 2 : 1) + " " + unit}</b></span>`).join("")}<span class="mut">${unit} pro ${S.per === "m" ? "Tag" : S.per === "y" ? "Monat" : "Jahr"}</span></div>
      <div class="lugrid" style="margin-top:12px">${tile("Geladen", num(tot.kwh, 1) + " kWh", `${num(tot.pv, 1)} kWh Sonne · ${num(tot.grid, 1)} kWh Netz`)}${tile("Sonnenanteil", num(share, 0) + " %", "der geladenen Energie")}${tile("Kosten", num(tot.cost, 2) + " €", "nur Netzstrom")}${tile("Ø Preis", tot.kwh > 0 ? num(ppk * 100, 1) + " ct/kWh" : "–", fullGrid != null ? `Ersparnis ${num(saved, 2)} € durch Sonne` : "Preis aus Modul 1")}${tile("Ø Verbrauch", tot.km > 0 ? num(tot.kwh / tot.km * 100, 1) + " kWh/100 km" : "–", tot.km > 0 ? `${num(tot.km, 0)} km laut Kilometerstand` : "braucht den Kilometerstand-Sensor")}${tile("CO₂ gespart", num(tot.pv * 0.38, 0) + " kg", "Sonne statt Netz-Mix (0,38 kg/kWh)")}</div>
      <div class="foot2" style="margin-top:10px"><button class="btn2" data-act="wbcsv">${ic("check", 16)} Als CSV exportieren</button></div>
      <div class="mut sm" style="margin:10px 0 0">Sonne = Überschuss und Hausbatterie, Netz = Bezug vom Netzanschluss. Die Aufteilung wird alle 10 Sekunden aus Ladeleistung und Netzbezug berechnet. Kosten = Netzstrom × Preis zum Zeitpunkt des Ladens.</div></div>
      <div class="card"><h2>${ic("clock", 18)}Letzte Ladevorgänge</h2>${ses.length ? `<div class="wbses">${ses.map((r) => `<div class="wbse"><div><b>${esc(r.veh || "Unbekannt")}</b><span class="mut sm">${fd(r.start)} · ${num(r.min / 60, 1)} h</span></div><div class="wbsb"><i style="width:${r.kwh > 0 ? r.pv / r.kwh * 100 : 0}%"></i></div><div class="wbsv"><b>${num(r.kwh, 1)} kWh</b><span class="mut sm">${num(r.kwh > 0 ? r.pv / r.kwh * 100 : 0, 0)} % Sonne · ${num(r.cost, 2)} €</span></div></div>`).join("")}</div>` : `<div class="mut sm">In diesem Zeitraum gab es keine Ladevorgänge.</div>`}</div>`;
  }
  _wbStAct(a, b) {
    const S = this._wbStS(), k = b.dataset.k;
    if (a === "wbtab") this._wbTab = k;
    else if (a === "wbsec") { this._wbSecO = { ...this._wbSecS(), [k]: !this._wbSecS()[k] }; this._wbSecSave(); }
    else if (a === "wbsecall") { this._wbSecO = Object.fromEntries(["wb", "reg", "veh", "bat", "grd", "ntf"].map((x) => [x, k === "1"])); this._wbSecSave(); }
    else if (a === "wbgo") { this._wbTab = "set"; this._wbSecO = { ...this._wbSecS(), [k]: true }; this._wbSecSave(); }
    else if (a === "wbplan") this._wbSave({ planStrat: k });
    else if (a === "wbsrc") { this._wbSave({ planSrc: k }); }
    else if (a === "wbpv") { this._wbSave({ pvSrc: k }); }
    else if (a === "wbsper") S.per = k;
    else if (a === "wbswhat") S.what = k;
    else if (a === "wbsby") S.by = k;
    else if (a === "wbnav") { const d = Number(k); if (S.per === "m") { let m = S.m + d, y = S.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } S.m = m; S.y = y; } else S.y += d; }
    this._render();
  }
  /* Laderegelung der Wallbox in Modul 8 (Modus, Ladeplan, Schwellen; angelehnt an das Prinzip von evcc) */
  _wbCard(d, part) {
    this._wbLoad();
    const s = this._wbSnap(), c = s.cfg, i = s.info, w = s.want, adm = this._admin(), soc = d.soc != null ? d.soc : s.soc;
    if (!c.ip) return `<div class="card lusoon">${ic("energy", 26)}<div><b>Laderegelung</b><span class="mut">Verbinde zuerst deine Wallbox unter Einstellungen → Integrationen.</span></div>${adm ? `<button class="btn2 pri" data-act="igopen" style="flex:none">Integrationen</button>` : ""}</div>`;
    const modes = [["off", "Aus", "close"], ["pv", "Sonne", "sun"], ["minpv", "Sonne + Netz", "bolt"], ["now", "Voll", "energy"]];
    const wsn = s.who, wveh = wsn && wsn.kind === "vehicle" ? c.vehicles.find((x) => x.name === wsn.name) : null, em = wsn ? (wveh ? wveh.mode : wsn.kind === "guest" ? c.guest.mode : c.mode) : c.mode;
    const info = { off: "Es wird nicht geladen.", pv: "Lädt nur mit Überschuss aus der Solaranlage. Ohne Überschuss pausiert die Ladung.", minpv: "Lädt immer mit dem Mindeststrom und nutzt zusätzlich den PV-Überschuss.", now: "Lädt sofort mit dem eingestellten Höchststrom, unabhängig von der Sonne." }[em];
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const stp = (lab, key, val, unit, step, hint) => `<div class="vrow"><span>${lab}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span><div class="step" style="flex:none"><button data-act="wbstep" data-k="${key}" data-s="${-step}" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${val} ${unit}</b><button data-act="wbstep" data-k="${key}" data-s="${step}" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>`;
    const sw = (lab, key, on, hint) => `<div class="vrow"><span>${lab}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span><button class="sw ${on ? "on" : ""}" data-act="wbsw" data-k="${key}" aria-pressed="${on}" aria-label="${lab}" ${adm ? "" : "disabled"}></button></div>`;
    const chips = (key, opts, cur) => `<div class="gschips" style="margin:6px 0">${opts.map(([k, l]) => `<button class="gsch ${cur === k ? "sel" : ""}" data-act="wbset" data-key="${key}" data-k="${k}" aria-pressed="${cur === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div>`;
    const hhmm = (iso) => { const t = iso ? new Date(iso) : null; return t && isFinite(t) ? t.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : ""; };
    const pw = i.power != null ? wfmt(i.power) : "–", pl = s.plan || {};
    const status = !s.ok ? ["Nicht erreichbar", s.error || "keine Antwort"] : c.enabled ? [i.car_text || "–", (w.state === "pausiert" ? "Regelung pausiert" : w.state === "pv" ? "Lädt mit PV-Überschuss" : w.state === "voll" ? "Lädt mit voller Leistung" : w.state === "minpv" ? "Mindeststrom plus PV" : w.state === "wartet" ? "Wartet auf Überschuss" : w.state === "plan_wartet" ? "Wartet auf das Ladefenster" : w.state === "gesperrt" ? "Wartet auf eine Karte" : w.state === "limit" ? "Ladelimit erreicht" : w.state === "fertig" ? "Fertig geladen" : "Wallbox ist aus")] : [i.car_text || "–", "Regelung ist aus"];
    const sec = (k, ico, t, sm, b, wn) => this._wbSec(k, ico, t, sm, b, wn), X = this._wbxParts(), nv = c.vehicles.length, nc = ((i && i.cards) || []).length, nt = Object.values(c.notify || {}).filter((v) => v === true).length;
    const mainCard = `<div class="card ocard"><h2>${ic("energy", 18)}Wallbox · ${esc(i.name || i.type || "go-e Charger")}</h2>
        ${sw("Laderegelung aktiv", "wbon", c.enabled, c.enabled ? "Strom &amp; Wärme steuert Start, Ladestrom und Phasen." : "Aus: Es wird nichts an der Wallbox verändert.")}
        <div class="seg3 wbm" style="grid-template-columns:repeat(4,1fr)">${modes.map(([k, l, ic_]) => `<button class="${em === k ? "sel" : ""}" data-act="wbmode" data-k="${k}" aria-pressed="${em === k}" ${adm && !c.planOn ? "" : "disabled"}>${ic(ic_, 22)}${l}</button>`).join("")}</div>
        <div class="mut sm" style="margin:-2px 0 10px">${c.planOn ? "Die <b>Planung</b> steuert die Wallbox. Der Modus gilt wieder, wenn du sie im Register „Planung“ ausschaltest." : info + " " + (wsn ? (wveh ? `Gilt für <b>${esc(wveh.name)}</b> (Karte ${esc(String(wsn.card))}).` : "Gilt für das Gastfahrzeug.") : "Gilt, solange kein Fahrzeug an einer Karte erkannt wird.")}</div>
        <div class="lugrid">${tile("Status", esc(status[0]), esc(status[1]))}${tile("Ladeleistung", pw, i.cur != null ? `${num(i.cur, 0)} A · ${i.phases || "–"} ${i.phases === 1 ? "Phase" : "Phasen"}` : "–")}${tile("PV-Überschuss", w.surplus_w != null ? wfmt(w.surplus_w) : "–", c.enabled ? "aus dem Netz-Sensor (Modul 3 oder 1)" : "bei aktiver Regelung")}${tile("Ladestand", soc != null ? num(soc, 0) + " %" : "–", soc != null ? `Limit ${c.limit} %` : "kein Sensor gewählt")}</div>
        ${c.enabled && w.reason ? `<div class="gst">${ic("info", 15)}${esc(w.reason)}</div>` : ""}
        ${i.session_wh != null ? `<div class="mut sm" style="margin-top:6px">Diese Ladung: ${num(i.session_wh / 1000, 1)} kWh · gesamt ${i.total_wh != null ? num(i.total_wh / 1000, 0) + " kWh" : "–"} · Firmware ${esc(i.fw || "–")}</div>` : ""}</div>`;
    const logCard = `<div class="card ocard"><h2>${ic("list", 18)}Letzte Entscheidungen</h2>${s.log.length ? `<div class="rev">${s.log.slice(0, this._wbLogAll ? 12 : 4).map((e) => `<div style="--c:var(--teal)"><time>${hhmm(e.t)}</time><i></i><span>${esc(e.x)}</span></div>`).join("")}${s.log.length > 4 ? `<button class="lnk" data-act="wblog" style="margin-top:6px">${this._wbLogAll ? "Weniger anzeigen" : `Alle ${Math.min(12, s.log.length)} anzeigen`}</button>` : ""}</div>` : `<div class="mut sm">Noch nichts. Hier steht, wann die Regelung die Wallbox umgestellt hat und warum.</div>`}</div>`;
    const regBody = `<div class="lsec">${ic("energy", 15)}Ladestrom</div>
        ${stp("Mindest-Ladestrom", "minA", c.minA, "A", 1, "Darunter lädt das Auto nicht (6 bis 16 A)")}${stp("Höchster Ladestrom", "maxA", c.maxA, "A", 1)}
        <div class="lsec" style="margin-top:12px">${ic("sliders", 15)}Phasenumschaltung</div>${chips("ph", [["auto", "Automatisch"], ["1", "1 Phase"], ["3", "3 Phasen"]], c.ph)}
        <div class="mut sm">Automatisch: Bei wenig Sonne 1 Phase (ab ${wfmt(230 * c.minA)}), bei viel Sonne 3 Phasen (ab ${wfmt(230 * 3 * c.minA)}). Die Umschaltung erfolgt höchstens alle 10 Minuten.</div>
        <div class="lsec" style="margin-top:12px">${ic("sun", 15)}Start und Stopp bei Sonne</div>
        ${stp("Starten ab Überschuss", "startW", wfmt(c.startW), "", 100)}${stp("Start nach", "onMin", c.onMin, "Min.", 1, "Der Überschuss muss so lange da sein")}${stp("Stopp nach", "offMin", c.offMin, "Min.", 1, "Verhindert ständiges Ein- und Ausschalten bei Wolken")}
        <div class="lsec" style="margin-top:12px">${ic("car", 15)}Fahrzeug</div>
        ${stp("Laden bis Ladestand", "limit", c.limit, "%", 5, "Braucht den Ladestand-Sensor des Fahrzeugs")}${stp("Akkukapazität", "cap", c.cap, "kWh", 5, "Für die Berechnung des Ladeplans")}`;
    const batBody = `${sw("Hausbatterie zuerst laden", "batOn", c.batOn, "Das Auto bekommt erst Überschuss, wenn die Batterie voll genug ist (Ladestand-Sensor in Modul 1)")}
        ${c.batOn ? stp("Batterie mindestens", "batSoc", c.batSoc, "%", 5) : ""}
        ${sw("Netzstrom nur bei günstigem Preis", "priceOn", c.priceOn, "Braucht einen Preis-Sensor (dynamischer Tarif) in Modul 1")}
        ${c.priceOn ? stp("Höchster Preis", "priceMax", c.priceMax, "ct/kWh", 1) : ""}`;
    const depCard = `<div class="card ocard"><h2>${ic("clock", 18)}Standard-Abfahrt</h2>
        <div class="mut sm" style="margin:0 0 8px">Gilt für alle Fahrzeuge ohne eigene Abfahrt, für Gäste und ohne erkannte Karte. Braucht den Ladestand-Sensor des Fahrzeugs.</div>
        ${stp("Ziel-Ladestand", "planSoc", c.planSoc, "%", 5)}
        <div class="vrow"><span>Bis</span><input class="osel" type="time" data-f="wbtime" value="${esc(c.planTime)}" style="width:auto;margin:0" aria-label="Uhrzeit" ${adm ? "" : "disabled"}></div>${chips("planDays", [["all", "Täglich"], ["wk", "Mo–Fr"], ["we", "Wochenende"]], c.planDays)}
        ${sw("Spätestens mit Netzstrom nachladen", "plan", c.plan, "Reicht die Sonne nicht, startet die Wallbox im Modus „Sonne“ zur berechneten Zeit mit Netzstrom. Die Planung nach Preis und Sonne ersetzt das, wenn sie aktiv ist.")}
        <div class="gst">${ic("clock", 15)}<span>${soc == null ? "Ohne Ladestand-Sensor ist keine Planung möglich (Fahrzeug einrichten)." : pl.need_kwh > 0 && pl.start ? `Es fehlen etwa <b>${num(pl.need_kwh, 0)} kWh</b>. Reicht die Sonne bis ${esc(c.planTime)} nicht, startet die Wallbox spätestens um <b>${hhmm(pl.start)} Uhr</b> mit Netzstrom.` : pl.need_kwh > 0 ? "Für diesen Tag ist keine Ladung geplant." : "Das Ziel ist schon erreicht."}</span></div></div>`;
    if (part === "dep") return depCard;
    if (part === "set") return `${this._wbCheck()}<div class="wsall"><span class="mut sm">Tippe auf einen Bereich, um ihn zu öffnen.</span><span><button class="lnk" data-act="wbsecall" data-k="1">Alle öffnen</button><button class="lnk" data-act="wbsecall" data-k="0">Alle schließen</button></span></div>
      ${sec("wb", "energy", "Wallbox und Verbindung", `${esc(i.name || i.type || "go-e Charger")} · ${esc(c.ip)}${s.ok ? "" : " · nicht erreichbar"}`, `<div class="lugrid">${tile("Gerät", esc(i.type || "go-e Charger"), esc(i.name || "–"))}${tile("Adresse", esc(c.ip), s.ok ? "erreichbar" : "nicht erreichbar")}${tile("Firmware", esc(i.fw || "–"), i.serial ? "Seriennr. " + esc(i.serial) : "–")}${tile("Gesamt geladen", i.total_wh != null ? num(i.total_wh / 1000, 0) + " kWh" : "–", "seit Inbetriebnahme")}</div>
        <div class="mut sm" style="margin:8px 0">Die Verbindung zur Wallbox richtest du unter Einstellungen → Integrationen ein, dort auch Tibber.</div><div style="display:flex;gap:8px;flex-wrap:wrap">${adm ? `<button class="btn2" data-act="wbtest" ${this._wbTest && this._wbTest.busy ? "disabled" : ""}>${ic("check", 16)} Verbindung testen</button><button class="btn2" data-act="igopen">${ic("tools", 16)} Verbindung ändern</button>` : ""}</div>${this._wbTest && !this._wbTest.busy ? `<div class="gst ${this._wbTest.ok ? "" : "on"}" style="margin-top:8px">${ic(this._wbTest.ok ? "check" : "info", 15)}<span>${this._wbTest.ok ? `Verbindung steht: ${esc(this._wbTest.type || "go-e Charger")}, Firmware ${esc(this._wbTest.fw || "–")}.` : esc(this._wbTest.error || "Keine Antwort")}</span></div>` : ""}`, !s.ok)}
      ${sec("reg", "sliders", "Laderegelung", `${c.minA} bis ${c.maxA} A · Phasen ${c.ph === "auto" ? "automatisch" : c.ph} · Limit ${c.limit} %`, regBody)}
      ${sec("veh", "car", "Fahrzeuge und Karten", `${nv} ${nv === 1 ? "Fahrzeug" : "Fahrzeuge"} · ${nc} ${nc === 1 ? "Karte" : "Karten"}${c.lock ? " · nur mit Karte" : ""}`, this._rfCard(true), !nv || c.vehicles.some((x) => !x.ids.length))}
      ${sec("bat", "home", "Hausbatterie und Strompreis", `Batterie ${c.batOn ? "zuerst bis " + c.batSoc + " %" : "egal"} · Preisgrenze ${c.priceOn ? c.priceMax + " ct" : "aus"}`, batBody)}
      ${sec("grd", "shield", "Hausanschluss-Schutz", c.guard.on ? `An · höchstens ${c.guard.maxA} A pro Phase` : "Aus", X.guard)}
      ${sec("ntf", "bell", "Benachrichtigungen", nt ? `${nt} von 5 Meldungen · ${c.notify.to.length ? c.notify.to.map((x) => esc(x.replace("notify.", ""))).join(", ") : "kein Empfänger"}` : "Aus", X.notify)}`;
    return `${mainCard}
      <div class="card ocard"><h2>${ic("energy", 18)}Schnellstart</h2>${X.quick}</div>
      ${logCard}`;
  }
  /* Fahrzeuge und Karten (nach dem Vorbild von evcc): Das Fahrzeug wird an der Karte erkannt, die an der Wallbox angelegt wird. */
  _rfCard(bare) {
    const sn = this._wbSnap(), c = sn.cfg, adm = this._admin(), cards = (sn.info && sn.info.cards) || [], who = sn.who || null;
    const nm = (i) => (cards.find((x) => x.i === i) || {}).n || `Karte ${i}`;
    const MODES = [["off", "Aus"], ["pv", "Sonne"], ["minpv", "Sonne + Netz"], ["now", "Voll"]], ML = Object.fromEntries(MODES);
    const mode = (id, cur) => `<div class="gschips" style="margin:6px 0">${MODES.map(([k, l]) => `<button class="gsch ${cur === k ? "sel" : ""}" data-act="wbrmode" data-v="${id}" data-k="${k}" aria-pressed="${cur === k}" ${adm ? "" : "disabled"}>${l}</button>`).join("")}</div>`;
    const lim = (id, val) => `<div class="vrow"><span>Ladelimit</span><div class="step" style="flex:none"><button data-act="wbrlim" data-v="${id}" data-s="-5" aria-label="weniger" ${adm ? "" : "disabled"}>${ic("minus", 18)}</button><b>${val} %</b><button data-act="wbrlim" data-v="${id}" data-s="5" aria-label="mehr" ${adm ? "" : "disabled"}>${ic("plus", 18)}</button></div></div>`;
    const used = new Set(c.vehicles.flatMap((x) => x.ids));
    const owner = (i) => c.vehicles.find((x) => x.ids.includes(i)), E = this._evState(), evName = [E.brand === "Andere" ? "" : E.brand, E.model].filter(Boolean).join(" ").trim(), canTake = adm && evName && c.vehicles.length < 6 && !c.vehicles.some((x) => x.name === evName);
    const assign = `<div class="rfa"><div class="lsec">${ic("shield", 15)}Karten zuordnen</div><div class="mut sm" style="margin:2px 0 6px">Pro Fahrzeug sind beliebig viele Karten möglich. Jede Karte gehört aber nur zu einem Fahrzeug.</div>
      ${canTake ? `<button class="btn2" data-act="wbrfromev" style="margin:4px 0 8px">${ic("car", 16)} Fahrzeug aus den Einstellungen übernehmen: ${esc(evName)}</button>` : ""}
      ${cards.length ? cards.map((k) => { const o = owner(k.i), act = who && who.card === k.i; return `<div class="rfc"><div class="rfn"><b>${esc(k.n)}</b>${act ? `<span class="ost home">Aktiv</span>` : ""}<small class="mut">Karte ${k.i} · ${num(k.kwh, 0)} kWh geladen · ${o ? "gehört zu " + esc(o.name) : "keinem Fahrzeug zugeordnet (Gast)"}</small></div>
        ${c.vehicles.length ? `<div class="gschips" style="margin:4px 0 0">${c.vehicles.map((x) => `<button class="gsch ${o && o.id === x.id ? "sel" : ""}" data-act="wbrassign" data-v="${x.id}" data-k="${k.i}" aria-pressed="${!!(o && o.id === x.id)}" ${adm ? "" : "disabled"}>${esc(x.name)}</button>`).join("")}</div>` : `<div class="mut sm">Lege zuerst ein Fahrzeug an.</div>`}</div>`; }).join("") : `<div class="mut sm">Es wurden noch keine Karten von der Wallbox gelesen. Lege sie in der go-e-App an (Einstellungen → Zugang → RFID-Karten).</div>`}</div>`;
    const veh = c.vehicles.map((x) => `<div class="rfv"><div class="oper" style="padding:0"><span class="oav" style="background:#14b8a6">${ic("car", 20)}</span><div class="opi"><b>${esc(x.name)}</b><small>${x.ids.length ? "Erkannt an: " + x.ids.map((i) => esc(nm(i))).join(", ") : "Noch keine Kennung zugeordnet"}</small></div>${adm ? `<button class="ibtn" data-act="wbrvdel" data-v="${x.id}" aria-label="Fahrzeug entfernen">${ic("trash", 16)}</button>` : ""}</div>
      <div class="mut sm" style="margin-top:8px">Kennungen (Karten aus der Wallbox)</div>
      <div class="gschips" style="margin:6px 0">${x.ids.map((i) => `<button class="gsch sel" data-act="wbrrm" data-v="${x.id}" data-k="${i}" aria-label="${esc(nm(i))} entfernen" ${adm ? "" : "disabled"}>${esc(nm(i))} ${ic("close", 12)}</button>`).join("")}</div>
      ${cards.some((k) => !used.has(k.i)) ? `<div class="mut sm" style="margin-top:4px">Freie Karten antippen, um sie diesem Fahrzeug zuzuordnen</div><div class="gschips" style="margin:6px 0">${cards.filter((k) => !used.has(k.i)).map((k) => `<button class="gsch" data-act="wbrcadd" data-v="${x.id}" data-k="${k.i}" aria-label="${esc(k.n)} zuordnen" ${adm ? "" : "disabled"}>${ic("plus", 12)} ${esc(k.n)}</button>`).join("")}</div>` : (cards.length ? `<div class="mut sm" style="margin-top:4px">Alle Karten der Wallbox sind zugeordnet.</div>` : `<div class="mut sm" style="margin-top:4px">Es sind noch keine Karten in der go-e-App angelegt.</div>`)}
      <div class="mut sm" style="margin-top:8px">Modus, sobald das Fahrzeug erkannt wird</div>${mode(x.id, x.mode)}${lim(x.id, x.limit)}</div>`).join("");
    const st = !sn.ok ? ["Wallbox nicht erreichbar", sn.error || "keine Antwort"]
      : !who ? ["Keine Kennung erkannt", c.lock ? "Strom & Wärme verändert nichts, bis eine Karte angelegt wird." : "Es gilt der Modus der Laderegelung oben."]
      : who.kind === "vehicle" ? [`Erkannt: ${who.name} (Karte „${nm(who.card)}“)`, `Die Regelung arbeitet im Modus „${ML[who.mode]}“ mit Ladelimit ${who.limit} %.`]
      : [`Erkannt: Gastfahrzeug (Karte „${nm(who.card)}“)`, `Die Karte ist keinem Fahrzeug zugeordnet. Es gilt der Modus „${ML[who.mode]}“.`];
    return `${bare ? "<div>" : `<div class="card ocard"><h2>${ic("car", 18)}Fahrzeuge &amp; Karten</h2>`}
      <div class="mut sm" style="margin-bottom:8px">Wie bei evcc wird das Fahrzeug an der Karte erkannt, die an der Wallbox angelegt wird. Als Kennung dient der Kartenname aus der go-e-App. Eine Karte gehört zu genau einem Fahrzeug, ein Fahrzeug kann mehrere Karten haben.</div>
      <div class="gst" style="margin:0 0 10px">${ic(who ? "check" : "info", 15)}<span><b>${esc(st[0])}</b><br>${esc(st[1])}</span></div>
      ${assign}
      ${veh}
      ${adm && c.vehicles.length < 6 ? `<button class="lnk" data-act="wbrvadd">${ic("plus", 16)}Fahrzeug hinzufügen</button>` : ""}
      <div class="rfv"><div class="oper" style="padding:0"><span class="oav" style="background:#64748b">${ic("user", 20)}</span><div class="opi"><b>Gastfahrzeug</b><small>Unbekannte Karte</small></div></div>${mode("guest", c.guest.mode)}${lim("guest", c.guest.limit)}</div>
      <div class="vrow"><span>Nur mit erkannter Karte regeln<small class="mut" style="display:block">Ohne angelegte Karte verändert Strom &amp; Wärme nichts an der Wallbox. Die eigentliche Sperre kommt von der Kartenpflicht in der go-e-App.</small></span><button class="sw ${c.lock ? "on" : ""}" data-act="wbrlock" aria-pressed="${c.lock}" aria-label="Nur mit erkannter Karte regeln" ${adm ? "" : "disabled"}></button></div>
      <div class="vrow"><span>Nach dem Abstecken zurücksetzen<small class="mut" style="display:block">Die Wallbox wird auf „neutral“ gestellt und die Erkennung vergessen. Sie gilt nur für eine Ladung.</small></span><button class="sw ${c.reset ? "on" : ""}" data-act="wbrreset" aria-pressed="${c.reset}" aria-label="Nach dem Abstecken zurücksetzen" ${adm ? "" : "disabled"}></button></div></div>`;
  }
  _rfAct(a, b) {
    const c = this._wb(), k = b.dataset.k, id = b.dataset.v;
    const upd = (fn) => { if (id === "guest") this._wbSave({ guest: fn({ ...c.guest }) }); else this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? fn({ ...x }) : x)) }); };
    if (a === "wbrlock") this._wbSave({ lock: !c.lock });
    else if (a === "wbrreset") this._wbSave({ reset: !c.reset });
    else if (a === "wbrmode") upd((x) => ({ ...x, mode: k }));
    else if (a === "wbrlim") upd((x) => ({ ...x, limit: Math.max(50, Math.min(100, x.limit + Number(b.dataset.s))) }));
    else if (a === "wbrrm") upd((x) => ({ ...x, ids: x.ids.filter((i) => i !== Number(k)) }));
    else if (a === "wbrcadd" || a === "wbrassign") { const n = Number(k), has = (c.vehicles.find((x) => x.id === id) || { ids: [] }).ids.includes(n); this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === id ? { ...x, ids: has ? x.ids.filter((i) => i !== n) : [...x.ids, n] } : { ...x, ids: x.ids.filter((i) => i !== n) })) }, true); }
    else if (a === "wbrfromev") { const E = this._evState(), nm2 = [E.brand === "Andere" ? "" : E.brand, E.model].filter(Boolean).join(" ").trim().slice(0, 30); if (nm2) this._wbSave({ vehicles: [...c.vehicles, { id: "v" + Date.now().toString(36), name: nm2, ids: [], mode: "pv", limit: 80 }] }, true); }
    else if (a === "wbrvadd") { const n = c.vehicles.length + 1; this._wbSave({ vehicles: [...c.vehicles, { id: "v" + Date.now().toString(36), name: "Fahrzeug " + n, ids: [], mode: "pv", limit: 80 }] }, true); }
    else if (a === "wbrvdel") this._wbSave({ vehicles: c.vehicles.filter((x) => x.id !== id) }, true);
    this._render();
  }
  _wbAct(a, b) {
    if (a.startsWith("wbr")) return this._rfAct(a, b);
    if (a.startsWith("wbx") || a === "wbcsv") return this._wbxAct(a, b);
    if (a.startsWith("wbd")) return this._wbdAct(a, b);
    if (a === "wbtab" || a === "wbsec" || a === "wbsecall" || a === "wbgo" || a === "wbplan" || a === "wbsrc" || a === "wbpv" || a === "wbsper" || a === "wbswhat" || a === "wbsby" || a === "wbnav") return this._wbStAct(a, b);
    if (a === "wbtest") { this._wbTest = { busy: true }; this._render(); this._hass.callWS({ type: "fenster_heizung/wb_test", ip: this._wb().ip }).then((r) => { this._wbTest = r || { ok: false, error: "Keine Antwort" }; }).catch(() => { this._wbTest = { ok: false, error: "Keine Antwort von Home Assistant" }; }).finally(() => this._render()); return; }
    if (a === "wblog") { this._wbLogAll = !this._wbLogAll; this._render(); return; }
    const c = this._wb(), k = b.dataset.k, R = { minA: [6, 16], maxA: [6, 16], startW: [500, 8000], onMin: [0, 15], offMin: [0, 30], limit: [50, 100], planSoc: [20, 100], cap: [10, 120], batSoc: [0, 100], priceMax: [1, 80], baseW: [0, 3000] };
    if (a === "wbmode") { const who = this._wbSnap().who, v = who && who.kind === "vehicle" ? c.vehicles.find((x) => x.name === who.name) : null; if (v) this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === v.id ? { ...x, mode: k } : x)) }); else if (who && who.kind === "guest") this._wbSave({ guest: { ...c.guest, mode: k } }); else this._wbSave({ mode: k }); }
    else if (a === "wbset") this._wbSave({ [b.dataset.key]: k });
    else if (a === "wbsw" && k === "wbon") { if (c.enabled) this._wbSave({ enabled: false }, true); else { this._modal = { type: "wbon" }; this._renderModal(); return; } }
    else if (a === "wbsw") this._wbSave({ [k]: !c[k] });
    else if (a === "wbstep") { const r = R[k], v = Math.max(r[0], Math.min(r[1], c[k] + Number(b.dataset.s))), p = { [k]: v }; if (k === "minA" && c.maxA < v) p.maxA = v; if (k === "maxA" && c.minA > v) p.minA = v; this._wbSave(p); }
    else if (a === "wbyes") { this._wbSave({ enabled: true }, true); this._modal = null; this._renderModal(); this._toast("Laderegelung ist an"); }
    this._render();
  }
  _wbOnModal() {
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Laderegelung einschalten?</b><span>Wallbox · go-e Charger</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut" style="margin:6px 0 10px">Strom &amp; Wärme startet und stoppt dann die Ladung und stellt Ladestrom und Phasen ein. Wenn du die Wallbox in der go-e-App von Hand umstellst, pausiert die Regelung 30 Minuten.</div>
      <div class="gst">${ic("info", 15)}Tipp für den ersten Test: Modus „Aus“ lassen, dann „Voll“ mit niedrigem Höchststrom (zum Beispiel 6 A) und die Wirkung in der go-e-App beobachten.</div>
      <div class="foot2" style="margin-top:14px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="wbyes">Einschalten</button></div></div>`;
  }
  _wbLater(t) { /* Zeitfeld nicht mitten in der Eingabe neu aufbauen (Safari meldet jede Ziffer einzeln) */ clearTimeout(this._wbLT); this._wbLT = setTimeout(() => { const ae = this.shadowRoot.activeElement; if (ae && ae.type === "time") { ae.addEventListener("blur", () => this._render(), { once: true }); } else this._render(); }, 700); }
  _wbChange(t) { const f = t.dataset.f; if (f === "wbdt") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t.value)) { const c = this._wb(); this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === t.dataset.v ? { ...x, dep: { ...this._wbDep(x), time: t.value } } : x)) }); this._wbLater(t); } return true; } if (f === "wbradd") { const c = this._wb(); if (t.value) { this._wbSave({ vehicles: c.vehicles.map((x) => (x.id === t.dataset.v ? { ...x, ids: [...x.ids, Number(t.value)] } : x)) }, true); this._render(); } return true; } if (f === "wbtime") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t.value)) { this._wbSave({ planTime: t.value }); this._wbLater(t); } return true; } return false; }
  /* Gerätestrom: eigene Berechnung im Backend (fenster_heizung/gs_get). Solar, Netz, Batterie kommen aus Modul 3, Preise aus Modul 1. */
  _gsState() {
    const s = this._mdState();
    return s.gs || (s.gs = { devices: [], bat_cost: 0, forecast: "", notify: [] });
  }
  _gsReady() { return this._enConfigured(); }
  _gsLoad(force) {
    if (!this._hass || this._gsBusy) return;
    if (!force && this._gsD && Date.now() - this._gsD.ts < 15000) return;
    this._gsBusy = true;
    this._hass.callWS({ type: "fenster_heizung/gs_get" }).then((r) => { this._gsD = { ...(r || {}), ts: Date.now() }; }).catch(() => { this._gsD = { devices: [], hist: {}, err: true, ts: Date.now() }; })
      .finally(() => { this._gsBusy = false; if (this._mdActive() === "gs" && !this._modal && !this._stOpen) this._render(); });
  }
  _gsAct(a, b) {
    const G = this._gsState(), k = b.dataset.k, i = +b.dataset.i;
    if (a === "gsset") { this._modal = { type: "gsset" }; this._renderModal(); }
    else if (a === "gsdone") { this._pkId = null; this._modal = null; this._renderModal(); this._gsLoad(true); this._render(); }
    else if (a === "gsadd") { if (G.devices.length < 8) { G.devices.push({ id: "g" + Date.now().toString(36), name: "", ent: "", thr: 20, end: 5 }); this._mdSave(); this._renderModal(); } }
    else if (a === "gsdel") { G.devices.splice(i, 1); this._pkId = null; this._mdSave(); this._renderModal(); }
    else if (a === "gsnot") { const n = new Set(G.notify); if (n.has(k)) n.delete(k); else n.add(k); G.notify = [...n]; this._mdSave(); this._renderModal(); }
    else if (a === "gsper") { this._gsRange = k; this._render(); }
    else if (a === "gsdev") { this._gsSel = k; this._render(); }
  }
  _gsChange(t) {
    const f = t.dataset.f, G = this._gsState(), d = G.devices[+t.dataset.i];
    if (f === "gsent" && d) { d.ent = t.value; this._mdSave(); return true; }
    if (f === "gsname" && d) { d.name = String(t.value || "").replace(/[<>"'&]/g, "").slice(0, 30); this._mdSave(); return true; }
    if (f === "gsnum" && d) { const v = Math.max(1, Math.min(t.dataset.k === "thr" ? 500 : 120, Math.round(parseFloat(String(t.value).replace(",", ".")) || 1))); d[t.dataset.k] = v; this._mdSave(); return true; }
    if (f === "gsbat") { G.bat_cost = Math.max(0, Math.min(100, parseFloat(String(t.value).replace(",", ".")) || 0)); this._mdSave(); return true; }
    if (f === "gsfc") { G.forecast = t.value; this._mdSave(); return true; }
    return false;
  }
  _gsSetModal() {
    const G = this._gsState(), st = this._hass.states, ks = Object.keys(st), p = this._pv(), E = this._enState(), g = this._enGrid();
    const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
    const nm = (e) => (e ? esc(this._wzName(e)) : "–");
    const svc = Object.keys((this._hass.services || {}).notify || {}).filter((n) => n !== "send_message").sort().map((n) => "notify." + n);
    const opts = [...svc, ...G.notify.filter((n) => !svc.includes(n))];
    const eur = (c) => num(c, 1) + " ct/kWh";
    return `<div class="ov" data-act="gsdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Gerätestrom</b><span>Einstellungen</span></div><button class="ibtn" data-act="gsdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("laundry", 15)}Geräte</div>
      <div class="mut sm" style="margin:2px 0 6px">Je Gerät ein Leistungssensor (Steckdose oder Zähler, in Watt). Ein Durchlauf beginnt über der Startschwelle und endet, wenn die Leistung die eingestellte Zeit darunter bleibt.</div>
      ${G.devices.map((d, i) => `<div class="gsdc"><div class="gsdh"><input class="otxt" type="text" maxlength="30" placeholder="Name, z. B. Waschmaschine" value="${esc(d.name)}" data-f="gsname" data-i="${i}" aria-label="Gerätename"><button class="ibtn" data-act="gsdel" data-i="${i}" aria-label="Gerät entfernen">${ic("trash", 17)}</button></div>
        ${this._wzSel(pw, d.ent, "gsent", `data-i="${i}" data-k="ent"`, "– Leistungssensor wählen –", /wasch|trockn|sp(ü|u)l|geschirr|power|leistung/i)}
        <div class="gsnums"><label>Startschwelle<span class="onum"><input type="number" inputmode="numeric" data-f="gsnum" data-i="${i}" data-k="thr" value="${d.thr}" min="1" max="500"><u>W</u></span></label><label>Ende nach<span class="onum"><input type="number" inputmode="numeric" data-f="gsnum" data-i="${i}" data-k="end" value="${d.end}" min="1" max="120"><u>min</u></span></label></div></div>`).join("")}
      ${G.devices.length < 8 ? `<button class="btn2" data-act="gsadd" style="width:100%;flex:none">${ic("plus", 16)} Gerät hinzufügen</button>` : ""}
      <div class="lsec">${ic("sun", 15)}Quellen und Preise</div>
      <div class="gst ${this._gsReady() ? "" : "on"}">${ic(this._gsReady() ? "check" : "alert", 15)}<div>${this._gsReady() ? `Solar: <b>${nm(E.ent.pv)}</b>${E.ent.pv2 ? " + " + nm(E.ent.pv2) : ""} · Netz: <b>${nm(g.ent)}</b>${E.ent.bat || E.ent.bdis ? ` · Batterie: <b>${nm(E.ent.bat || E.ent.bdis)}</b>` : ""}<br><span class="mut">kommen aus Modul 3 – Energie-Übersicht.</span>` : "Solar- und Netz-Sensor fehlen. Sie werden einmal in Modul 3 – Energie-Übersicht gewählt und hier mitgenutzt."}</div></div>
      <div class="gst">${ic("info", 15)}<div>Bezugspreis <b>${eur(p.price)}</b>${p.price_mode === "entity" ? " (Sensor)" : ""}, Einspeisevergütung <b>${eur(p.feed)}</b>${p.feed_mode === "entity" ? " (Sensor)" : ""}<br><span class="mut">kommen aus Modul 1 → Allgemein → Photovoltaik.</span></div></div>
      <div class="gsq"><button class="btn2" data-act="mdensetup" style="flex:none">${ic("energy", 15)} Modul 3 öffnen</button></div>
      <div class="lsec">${ic("bolt", 15)}Batterie</div>
      <div class="of"><div class="ol"><b>Speicherkosten</b><span>Was eine kWh aus der Batterie kostet. 0 = Batteriestrom gilt als kostenlos.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gsbat" value="${G.bat_cost}" min="0" max="100" step="0.5"><u>ct/kWh</u></span></div></div>
      <div class="lsec">${ic("sun", 15)}Startempfehlung</div>
      <div class="mut sm" style="margin:2px 0 0">Prognose-Sensor in Watt (optional). Ohne Sensor zählt die aktuelle Solarleistung.</div>${this._wzSel(pw, G.forecast, "gsfc", "", "– keiner –", /prognose|forecast|solar|pv/i)}
      <div class="lsec">${ic("bell", 15)}Meldung am Ende eines Durchlaufs</div>
      ${opts.length ? `<div class="gschips">${opts.map((n) => `<button class="gsch ${G.notify.includes(n) ? "sel" : ""}" data-act="gsnot" data-k="${esc(n)}" aria-pressed="${G.notify.includes(n)}">${esc(n.replace("notify.", ""))}</button>`).join("")}</div>` : `<div class="mut sm">Keine Benachrichtigungsdienste gefunden.</div>`}
      <div class="mut sm" style="margin:6px 0 0">Zusätzlich wird das Ereignis <code>geraetestrom_run_finished</code> ausgelöst.</div>
      <div class="foot2"><button class="btn2 pri" data-act="gsdone">Fertig</button></div></div>`;
  }
  _gsPage() {
    const adm = this._admin(), G = this._gsState();
    this._gsLoad();
    const D = this._gsD, eur = (v) => num(v, 2) + " €";
    if (!G.devices.length) return `<div class="card empty">${ic("laundry", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Gerät eingerichtet</div>
      <div class="sm" style="max-width:480px;margin:0 auto 14px">Zeigt pro Gerät (Waschmaschine, Trockner, Spülmaschine …), woher der Strom kommt – Solar, Batterie oder Netz – und was er kostet. Dazu Ersparnis, Durchläufe und eine Startempfehlung.</div>
      <ul class="wwl"><li>${ic("sun", 16)}Anteile Solar, Batterie, Netz pro Gerät</li><li>${ic("chart", 16)}Kosten und Ersparnis: heute, Monat, Jahr, gesamt</li><li>${ic("bell", 16)}Meldung am Ende eines Durchlaufs</li></ul>
      ${adm ? `<button class="btn2 pri" data-act="gsset" style="margin-top:16px;flex:none;padding:12px 22px">${ic("tools", 16)} Gerät hinzufügen</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const warn = !this._gsReady() ? `<div class="banner">${ic("alert", 18)}<div><b>Solar- und Netz-Sensor fehlen.</b> Sie werden in Modul 3 – Energie-Übersicht gewählt. Bis dahin gilt der gesamte Strom als Netzstrom.${adm ? ` <button class="lnk" data-act="mdensetup">Modul 3 öffnen</button>` : ""}</div></div>` : "";
    if (!D) return `${warn}<div class="card empty">Lade Gerätestrom …</div>`;
    const devs = D.devices || [];
    const sum = (f) => devs.reduce((a, d) => a + (f(d) || 0), 0), cols = ["#e9a413", "#13a97b", "#6f78e8"], srcN = ["Solar", "Batterie", "Netz"];
    const per = [["Heute", "day", "today", "#2dd4bf"], ["Monat", "month", "month", "#60a5fa"], ["Jahr", "year", "year", "#a78bfa"], ["Gesamt", "total", "total", "#f472b6"]];
    const tiles = per.map(([t, k, ico, c]) => `<div class="card gstile" style="--c:${c}"><div class="gst"><span class="gsi">${ic(ico, 15)}</span>${t}</div><div class="gsv">${eur(sum((d) => d[k].saved))}</div><div class="mut sm">gespart · Kosten ${eur(sum((d) => d[k].cost))} · ${num(sum((d) => d[k].kwh), 1)} kWh</div></div>`).join("");
    const cards = devs.map((d) => {
      const run = d.running, base = run ? d.w : d.e, tot = base[0] + base[1] + base[2] || 1, adv = d.advice || "", ac = /^Jetzt/.test(adv) ? "green" : /^Teil/.test(adv) ? "amber" : "slate";
      return `<div class="card gsdev"><div class="gsh"><span class="gsi big">${ic("laundry", 20)}</span><b>${esc(d.name)}</b><span class="gsst ${run ? "on" : ""}">${run ? num(d.w[0] + d.w[1] + d.w[2], 0) + " W" : "Aus"}</span></div>
        <div class="gsbar" role="img" aria-label="Anteile Solar, Batterie, Netz">${base.map((v, i) => `<i style="width:${v / tot * 100}%;background:${cols[i]}"></i>`).join("")}</div>
        <div class="gsleg">${srcN.map((t, i) => `<span><i style="background:${cols[i]}"></i><em>${t}</em><b>${run ? num(d.w[i], 0) + " W" : num(d.e[i], 1) + " kWh"}</b></span>`).join("")}</div>
        <div class="gsrows"><div class="gsrow"><span class="mut">Heute</span><b>${eur(d.day.cost)} Kosten</b><em>${eur(d.day.saved)} gespart</em></div>
        <div class="gsrow"><span class="mut">Letzter Durchlauf</span><b>${d.last ? eur(d.last.cost) + " · " + num(d.last.kwh, 2) + " kWh" : "noch keiner"}</b><em>${d.last ? num(d.last.share, 0) + " % Eigenanteil" : ""}</em></div></div>
        ${adv ? `<div class="gsadv ${ac}">${ic("sun", 15)}${esc(adv)} <span class="mut">· Solardeckung ${num(d.cover, 0)} %</span></div>` : ""}</div>`; }).join("");
    return `${warn}<div class="card hero gshero">${(() => { const e0 = sum((d) => d.e[0] + d.e[1]), et = sum((d) => d.e[0] + d.e[1] + d.e[2]), pc = et > 0 ? Math.round(e0 / et * 100) : 0; return `<div class="gsring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="rb"/><circle cx="60" cy="60" r="50" class="rf" stroke-dasharray="${(pc * 3.1416).toFixed(1)} 314.2" transform="rotate(-90 60 60)"/></svg><div class="rv"><b>${pc}<small>%</small></b><span>Eigenstrom</span></div></div>`; })()}<div class="mut" style="opacity:.85">${ic("laundry", 16)} Heute gespart</div><div class="gsbig">${eur(sum((d) => d.day.saved))}</div><div style="opacity:.85">${num(sum((d) => d.day.runs))} ${sum((d) => d.day.runs) === 1 ? "Durchlauf" : "Durchläufe"} heute · ${num(sum((d) => d.day.kwh), 1)} kWh</div></div>
      <div class="gstiles">${tiles}</div><div class="gsgrid">${cards}</div>${this._gsChart(D, devs, cols, srcN)}`;
  }
  _gsChart(D, devs, cols, srcN) {
    const rg = this._gsRange || "7", sel = devs.some((d) => d.id === this._gsSel) ? this._gsSel : "", H = D.hist || {};
    const pick = sel ? [sel] : devs.map((d) => d.id), mon = rg === "12", n = rg === "30" ? 30 : rg === "7" ? 7 : 12;
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const keyOf = (dt) => mon ? dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") : dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
    const slots = []; for (let i = n - 1; i >= 0; i--) { const dt = new Date(today); if (mon) dt.setMonth(dt.getMonth() - i, 1); else dt.setDate(dt.getDate() - i); slots.push({ k: keyOf(dt), dt, v: [0, 0, 0], c: 0, s: 0 }); }
    const ix = Object.fromEntries(slots.map((s, i) => [s.k, i]));
    pick.forEach((id) => (H[id] || []).forEach((r) => { const i = ix[mon ? r.d.slice(0, 7) : r.d]; if (i == null) return; slots[i].v[0] += r.s; slots[i].v[1] += r.b; slots[i].v[2] += r.g; slots[i].c += r.cost; slots[i].s += r.saved; }));
    const mx = Math.max(...slots.map((s) => s.v[0] + s.v[1] + s.v[2]), 0.1), step = enStep(mx), top = Math.ceil(mx / step) * step, W = 640, Hh = 190, pl = 34, pb = 22, bw = (W - pl) / n, bar = Math.min(bw * 0.62, 34);
    const lab = (s) => mon ? s.dt.toLocaleDateString("de-DE", { month: "short" }) : n > 7 ? String(s.dt.getDate()) : s.dt.toLocaleDateString("de-DE", { weekday: "short" });
    let grid = "", bars = "";
    for (let v = 0; v <= top + 1e-9; v += step) { const y = Hh - pb - (v / top) * (Hh - pb - 8); grid += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${num(v, step < 1 ? 1 : 0)}</text>`; }
    slots.forEach((s, i) => { let y = Hh - pb; const x = pl + i * bw + (bw - bar) / 2; s.v.forEach((v, j) => { const h = (v / top) * (Hh - pb - 8); if (h > 0.4) { y -= h; bars += `<rect x="${x}" y="${y}" width="${bar}" height="${h}" fill="${cols[j]}" rx="3"><title>${srcN[j]} ${num(v, 2)} kWh</title></rect>`; } });
      bars += `<text x="${x + bar / 2}" y="${Hh - 6}" text-anchor="middle" font-size="11" fill="var(--mut)">${esc(lab(s))}</text>`; });
    const totE = slots.reduce((a, s) => a + s.v[0] + s.v[1] + s.v[2], 0), totS = slots.reduce((a, s) => a + s.s, 0), totC = slots.reduce((a, s) => a + s.c, 0);
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${on}">${t}</button>`;
    return `<div class="card gsc"><h2>${ic("chart", 18)}Verlauf nach Quelle</h2>
      <div class="gschips">${[["7", "7 Tage"], ["30", "30 Tage"], ["12", "12 Monate"]].map(([k, t]) => chip("gsper", k, t, rg === k)).join("")}</div>
      <div class="gschips">${chip("gsdev", "", "Alle Geräte", !sel)}${devs.map((d) => chip("gsdev", esc(d.id), esc(d.name), sel === d.id)).join("")}</div>
      <svg viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="Energie nach Quelle in kWh">${grid}${bars}</svg>
      <div class="gsleg" style="margin-top:6px">${srcN.map((t, i) => `<span><i style="background:${cols[i]}"></i>${t}</span>`).join("")}<span class="mut">kWh pro ${mon ? "Monat" : "Tag"}</span></div>
      <div class="mut sm" style="margin:8px 0 0">Zeitraum: ${num(totE, 1)} kWh · Kosten ${num(totC, 2)} € · gespart ${num(totS, 2)} €</div></div>`;
  }
  /* Elektroauto & Wallbox (Beta) */
  _evState() { const s = this._mdState(); return s.ev || (s.ev = { brand: "", model: "", body: "limousine", color: "blue", ent: { soc: "", odo: "", range: "", plug: "", power: "", charging: "" } }); }
  _evNum(eid) { const st = eid && this._hass.states[eid]; if (!st) return null; const v = parseFloat(String(st.state).replace(",", ".")); return isFinite(v) ? (st.attributes.unit_of_measurement === "kW" ? v * 1000 : v) : null; }
  _evData() {
    const E = this._evState().ent, st = this._hass.states, S = (e) => (e && st[e] ? String(st[e].state).toLowerCase() : "");
    const power = this._evNum(E.power), soc = this._evNum(E.soc), odo = this._evNum(E.odo), range = this._evNum(E.range);
    const ON = /^(on|true|yes|connected|plugged|plugged_in|ev_connected|vehicle_connected|charging|ready|waiting|complete|finished|preparing|suspended)/, OFF = /^(off|false|no|disconnected|unplugged|not_connected|available|unavailable|unknown|none)/;
    const chg = E.charging ? ON.test(S(E.charging)) && !OFF.test(S(E.charging)) : power != null && power >= 100;
    const plug = E.plug ? ON.test(S(E.plug)) && !OFF.test(S(E.plug)) : chg;
    return { soc, odo, range, power, charging: plug && chg, plugged: plug || chg, any: Object.values(E).some(Boolean) };
  }
  _evScene(d) {
    const V = this._evState(), H = EV_SHAPES[V.body] || EV_SHAPES.limousine, C = EV_COLORS[V.color] || EV_COLORS.blue, [px, py] = H.port, [w1, w2] = H.wh;
    const led = d.charging ? "#22e06b" : d.plugged ? "#ffa51f" : "#9aa5b1", cab = `M112 207 C108 272 196 270 236 248 C${px - 38} ${py + 49} ${px - 14} ${py + 19} ${px} ${py}`;
    const wheel = (cx) => `<g><ellipse cx="${cx}" cy="250" rx="30" ry="3" fill="#000" opacity=".5"/><circle cx="${cx}" cy="217" r="33" fill="#0b0d11"/><circle cx="${cx}" cy="217" r="33" fill="none" stroke="#1d222b" stroke-width="3"/><circle cx="${cx}" cy="217" r="27" fill="none" stroke="#252b36" stroke-width="1.5"/>
        <circle cx="${cx}" cy="217" r="23" fill="url(#evrim)"/><circle cx="${cx}" cy="217" r="23" fill="none" stroke="#4b5563" stroke-width="1.2"/><circle cx="${cx}" cy="217" r="19" fill="#161a21"/>
        <circle cx="${cx}" cy="217" r="17" fill="none" stroke="#9aa3b1" stroke-width="1" opacity=".5"/><path d="M${cx - 15} 212 A16 16 0 0 1 ${cx - 4} 202" stroke="#d7141f" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
        <g stroke="url(#evrim)" stroke-width="3" stroke-linecap="round">${Array.from({ length: 10 }, (_, k) => k * 36).map((ang) => `<line x1="${cx + 6 * Math.sin(ang * Math.PI / 180)}" y1="${217 - 6 * Math.cos(ang * Math.PI / 180)}" x2="${cx + 20 * Math.sin((ang + 8) * Math.PI / 180)}" y2="${217 - 20 * Math.cos((ang + 8) * Math.PI / 180)}"/>`).join("")}</g>
        <circle cx="${cx}" cy="217" r="7" fill="#2b313b"/><circle cx="${cx}" cy="217" r="3.2" fill="#b4bcc8"/><path d="M${cx - 24} 205 A26 26 0 0 1 ${cx + 6} 192" stroke="#fff" stroke-width="1.5" fill="none" opacity=".25"/></g>`;
    return `<svg class="evsvg" viewBox="0 0 760 290" role="img" aria-label="${d.charging ? "Fahrzeug lädt" : d.plugged ? "Ladekabel angesteckt" : "Ladekabel nicht angesteckt"}">
      <defs>
        <linearGradient id="evsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa7e6"/><stop offset=".62" stop-color="#bfe0f7"/><stop offset="1" stop-color="#eaf5fb"/></linearGradient>
        <radialGradient id="evsun" cx=".86" cy=".16" r=".45"><stop offset="0" stop-color="#fff7d1" stop-opacity=".95"/><stop offset=".35" stop-color="#fff2b0" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="evpaint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[1]}"/><stop offset=".45" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[3]}"/></linearGradient>
        <linearGradient id="evglass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b3e52"/><stop offset=".5" stop-color="#16222f"/><stop offset="1" stop-color="#0a1018"/></linearGradient>
        <linearGradient id="evrim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5e9ef"/><stop offset=".5" stop-color="#9aa3b1"/><stop offset="1" stop-color="#d7dce4"/></linearGradient>
        <linearGradient id="evwall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ece7df"/><stop offset="1" stop-color="#d6cfc4"/></linearGradient>
        <linearGradient id="evbox" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dde3"/></linearGradient>
        <linearGradient id="evroad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7280"/><stop offset="1" stop-color="#4b5563"/></linearGradient>
        <clipPath id="evbody"><path d="${H.body}"/></clipPath><clipPath id="evgl"><path d="${H.glass}"/></clipPath><linearGradient id="evrefl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".35" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
        <filter id="evblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="evglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
      <rect width="760" height="290" rx="16" fill="url(#evsky)"/><rect width="760" height="290" rx="16" fill="url(#evsun)"/>
      <g opacity=".9" fill="#fff"><ellipse cx="260" cy="58" rx="46" ry="12" opacity=".85"/><ellipse cx="292" cy="50" rx="30" ry="11" opacity=".9"/><ellipse cx="520" cy="46" rx="38" ry="9" opacity=".75"/></g>
      <g filter="url(#evblur)" opacity=".55"><ellipse cx="300" cy="244" rx="120" ry="16" fill="#6f9a74"/><ellipse cx="480" cy="246" rx="150" ry="13" fill="#5d8a66"/><ellipse cx="680" cy="244" rx="110" ry="15" fill="#7aa57f"/></g>
      <rect y="248" width="760" height="42" fill="url(#evroad)"/><rect y="248" width="760" height="3" fill="#8b93a0"/><g stroke="#e5e7eb" stroke-width="3" opacity=".75"><path d="M250 276H330M440 276H520M630 276H710" stroke-linecap="round"/></g>
      <rect x="20" y="30" width="170" height="218" fill="url(#evwall)"/><rect x="20" y="30" width="170" height="10" fill="#bdb5a8"/><rect x="190" y="30" width="6" height="218" fill="#a69d8f" opacity=".6"/>
      <g stroke="#c8c0b3" stroke-width="1" opacity=".7">${[70, 110, 150, 190, 230].map((y) => `<line x1="20" y1="${y}" x2="190" y2="${y}"/>`).join("")}</g>
      <rect x="96" y="102" width="86" height="118" rx="18" fill="#000" opacity=".22" filter="url(#evblur)"/>
      <g><rect x="86" y="92" width="76" height="116" rx="16" fill="url(#evbox)" stroke="#aeb5bf" stroke-width="1.5"/>
        <rect x="86" y="92" width="76" height="116" rx="16" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>
        <rect x="96" y="102" width="56" height="26" rx="8" fill="#0d141c"/><text x="124" y="120" text-anchor="middle" font-size="12" font-weight="700" fill="${d.charging ? "#4ade80" : "#8da0b3"}">${d.charging && d.power != null ? num(d.power / 1000, 1) + " kW" : d.plugged ? "bereit" : "frei"}</text>
        <circle cx="124" cy="152" r="14" fill="#eef0f3" stroke="#c4cad2"/><circle cx="124" cy="152" r="11" fill="none" stroke="${led}" stroke-width="3.5"/><circle cx="124" cy="152" r="11" fill="none" stroke="${led}" stroke-width="3.5" filter="url(#evglow)" class="${d.charging ? "evpulse" : ""}" opacity=".8"/>
        <path d="M121 146 L126 146 L123 152 L127 152 L121 160 L123 154 L119 154 Z" fill="${led}"/>
        <rect x="108" y="190" width="32" height="14" rx="6" fill="#1a1f26"/><circle cx="124" cy="197" r="4" fill="#050709"/></g>
      <ellipse cx="490" cy="251" rx="215" ry="9" fill="#000" opacity=".45" filter="url(#evblur)"/>
      <g class="evcable ${d.plugged ? "on" : ""}">
        ${d.charging ? `<path d="${cab}" fill="none" stroke="#22e06b" stroke-width="12" stroke-linecap="round" opacity=".45" filter="url(#evglow)" class="evpulse"/>` : ""}
        <path d="${cab}" fill="none" stroke="#0b0e12" stroke-width="9" stroke-linecap="round"/><path d="${cab}" fill="none" stroke="#3a424d" stroke-width="2" stroke-linecap="round" transform="translate(-1.5 -2)"/>
        <path d="${cab}" fill="none" stroke="${d.charging ? "#a7f3c0" : "none"}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="5 13" class="${d.charging ? "evflow" : ""}"/>
        <g transform="rotate(-52 ${px} ${py})"><rect x="${px - 10}" y="${py - 8}" width="24" height="16" rx="6" fill="#14181e" stroke="#2c333c"/><rect x="${px + 10}" y="${py - 5}" width="6" height="10" rx="2" fill="#0b0e12"/><rect x="${px - 8}" y="${py - 6}" width="10" height="3" rx="1.5" fill="${led}" opacity=".9"/></g></g>
      <g>
        <path d="${H.body}" fill="url(#evpaint)"/>
        <g clip-path="url(#evbody)">
          <rect x="${H.rear - 4}" y="${H.gb}" width="420" height="40" fill="url(#evrefl)"/>
          <path d="M${H.rear} ${H.gt + 36} C420 ${H.gt + 28} 560 ${H.gt + 36} ${H.front} ${H.gt + 62}" stroke="#fff" stroke-width="3" fill="none" opacity=".38"/>
          <path d="M${H.rear} ${H.gb + 12} C420 ${H.gb + 8} 560 ${H.gb + 10} ${H.front} ${H.gb + 24}" stroke="${C[4]}" stroke-width="2.2" fill="none" opacity=".4"/>
          <path d="M${H.rear} ${H.gb + 14} C420 ${H.gb + 10} 560 ${H.gb + 12} ${H.front} ${H.gb + 26}" stroke="#fff" stroke-width="1" fill="none" opacity=".3"/>
          <path d="M${H.rear - 2} 224 L700 224 L700 240 L${H.rear - 2} 240 Z" fill="#10141b"/><path d="M${H.rear - 2} 224 L700 224" stroke="#fff" stroke-width="1" opacity=".18"/>
          <g stroke="${C[4]}" stroke-width="1.3" opacity=".65" fill="none">${H.seams.map((x, k) => `<path d="M${x} ${H.gb} C${x - 2} 190 ${x - 4} 210 ${x - 5} 224"/>`).join("")}</g>
          ${H.handles.map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="3.4" rx="1.7" fill="#0b0e12" opacity=".55"/><rect x="${x}" y="${y - 1}" width="22" height="1.6" rx=".8" fill="#fff" opacity=".4"/>`).join("")}
          <ellipse cx="${(H.rear + H.front) / 2}" cy="${H.gt - 6}" rx="${(H.front - H.rear) / 3.2}" ry="10" fill="#fff" opacity=".2"/></g>
        <path d="${H.glass}" fill="url(#evglass)"/>
        <g clip-path="url(#evgl)"><path d="M${H.gx[0] + 10} ${H.gb} L${H.gx[0] + 58} ${H.gt - 2} L${H.gx[0] + 84} ${H.gt - 2} L${H.gx[0] + 38} ${H.gb} Z" fill="#fff" opacity=".24"/><path d="M${H.pil + 24} ${H.gb} L${H.pil + 62} ${H.gt - 2} L${H.pil + 78} ${H.gt - 2} L${H.pil + 40} ${H.gb} Z" fill="#fff" opacity=".15"/><rect x="${H.gx[0]}" y="${H.gb - 12}" width="${H.gx[1] - H.gx[0]}" height="12" fill="#000" opacity=".25"/></g>
        <path d="M${H.pil - 3} ${H.gt - 2} L${H.pil + 1} ${H.gb + 1} L${H.pil + 5} ${H.gb + 1} L${H.pil + 3} ${H.gt - 2} Z" fill="${C[3]}" stroke="#05070a" stroke-width="1"/>
        <path d="${H.glass}" fill="none" stroke="#05070a" stroke-width="2.2" stroke-linejoin="round"/><path d="${H.glass.replace(/ Z$/, "")}" fill="none" stroke="#c9d3e3" stroke-width="1" opacity=".55" transform="translate(0 -2.6)"/>
        <path d="M${H.mir[0]} ${H.mir[1]} L${H.mir[0] + 14} ${H.mir[1]} C${H.mir[0] + 20} ${H.mir[1]} ${H.mir[0] + 22} ${H.mir[1] + 6} ${H.mir[0] + 16} ${H.mir[1] + 9} L${H.mir[0] - 2} ${H.mir[1] + 10} Z" fill="${C[2]}" stroke="${C[4]}"/>
        <path d="M${H.tl[0]} ${H.tl[1] - 9} L${H.tl[0] + 8} ${H.tl[1] - 11} L${H.tl[0] + 8} ${H.tl[1] + 9} L${H.tl[0]} ${H.tl[1] + 11} Z" fill="#d6192a"/><path d="M${H.tl[0]} ${H.tl[1] - 9} L${H.tl[0] + 8} ${H.tl[1] - 11} L${H.tl[0] + 8} ${H.tl[1] + 9} L${H.tl[0]} ${H.tl[1] + 11} Z" fill="#ff5a66" opacity=".55" filter="url(#evglow)"/>
        <path d="M${H.front - 34} ${H.ly - 2} C${H.front - 18} ${H.ly - 2} ${H.front - 6} ${H.ly + 2} ${H.front} ${H.ly + 8} L${H.front} ${H.ly + 13} C${H.front - 10} ${H.ly + 8} ${H.front - 22} ${H.ly + 6} ${H.front - 34} ${H.ly + 6} Z" fill="#f8fbff"/><path d="M${H.front - 34} ${H.ly - 2} L${H.front} ${H.ly + 10} L${H.front} ${H.ly + 14} Z" fill="#fff6c8" opacity=".6" filter="url(#evglow)"/>
        <path d="M${H.front - 6} ${H.ly + 22} L${H.front - 2} ${H.ly + 22} L${H.front - 2} ${H.ly + 40} L${H.front - 8} ${H.ly + 42} Z" fill="#0b0f16" opacity=".8"/>
        <path d="${H.body}" fill="none" stroke="${C[4]}" stroke-width="1.6"/>
        <circle cx="${px}" cy="${py}" r="7" fill="#0d1426" stroke="#8aa0c8" stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="3.2" fill="${led}" class="${d.charging ? "evpulse" : ""}"/>
        <circle cx="${w1}" cy="217" r="41" fill="#07090d"/><circle cx="${w1}" cy="217" r="41" fill="none" stroke="${C[4]}" stroke-width="2"/><circle cx="${w2}" cy="217" r="41" fill="#07090d"/><circle cx="${w2}" cy="217" r="41" fill="none" stroke="${C[4]}" stroke-width="2"/>
        ${wheel(w1)}${wheel(w2)}</g>
      <g><rect x="562" y="30" width="162" height="40" rx="20" fill="#0f172a" opacity=".82"/>
        ${d.charging ? `<path d="M590 40 L580 52 H588 L585 62 L598 49 H590 Z" fill="#facc15"/>` : `<circle cx="588" cy="50" r="6" fill="${led}"/>`}
        <text x="642" y="57" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">${d.soc != null ? num(d.soc, 0) + " %" : "–"}</text></g></svg>`;
  }
  _evPage() {
    const adm = this._admin(), d = this._evData();
    if (!d.any) return `${this._betaBox("Wähle in den Einstellungen die Sensoren deines Fahrzeugs und der Wallbox.")}
      <div class="card empty">${ic("car", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch kein Fahrzeug eingerichtet</div>
      <div class="sm" style="max-width:460px;margin:0 auto 14px">Zeigt Ladestand, Reichweite und Kilometerstand. Die Wallbox ist abgebildet, das Ladekabel erscheint beim Anstecken und leuchtet beim Laden.</div>
      ${adm ? `<button class="btn2 pri" data-act="mdevset" style="flex:none;padding:12px 22px">${ic("tools", 16)} Fahrzeug einrichten</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const stT = d.charging ? `Lädt${d.power != null ? " mit " + num(d.power / 1000, 1) + " kW" : ""}` : d.plugged ? "Angesteckt, lädt nicht" : "Nicht angesteckt";
    const tile = (ico, t, v, sub) => `<div class="luroom"><span class="mut lt"><span class="ti">${ic(ico, 15)}</span>${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const bar = d.soc != null ? `<div class="gsbar" style="margin-top:6px" role="progressbar" aria-valuenow="${num(d.soc, 0)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(0, Math.min(100, d.soc))}%;background:${d.soc < 20 ? "#f87171" : "#34d399"}"></i></div>` : "";
    const wbOn = !!this._wbSnap().cfg.ip, wbTabs = wbOn ? this._wbTabs() + this._wbBar() : "";
    if (wbOn && this._wbStT() === "plan") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbPlan(d)}`;
    if (wbOn && this._wbStT() === "set") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbCard(d, "set")}`;
    if (wbOn && this._wbStT() === "stat") return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}${this._wbStat()}`;
    return `${this._betaBox("Die Darstellung nutzt die Sensoren, die du in den Einstellungen wählst.")}${wbTabs}
      <div class="evtop"><div class="card evcard ${d.charging ? "chg" : d.plugged ? "plg" : ""}"><div class="evhead"><b>${ic("car", 18)}${esc([this._evState().brand === "Andere" ? "" : this._evState().brand, this._evState().model].filter(Boolean).join(" ") || "Fahrzeug & Wallbox")}</b><span class="gsst ${d.charging ? "on" : ""}">${stT}</span></div>${this._evScene(d)}</div>
      <div class="lugrid">${tile("energy", "Ladestand", d.soc != null ? num(d.soc, 0) + " %" : "–", bar || "kein Sensor")}${tile("car", "Reichweite", d.range != null ? num(d.range, 0) + " km" : "–", d.range != null ? "laut Fahrzeug" : "kein Sensor")}${tile("total", "Kilometerstand", d.odo != null ? num(d.odo, 0) + " km" : "–", d.odo != null ? "gesamt" : "kein Sensor")}${tile("bolt", "Ladeleistung", d.power != null ? num(d.power / 1000, 1) + " kW" : "–", stT)}</div></div>
      <div class="mcols">${wbOn ? this._wbxToday(d) : ""}${this._wbCard(d)}</div>`;
  }
  _evSetModal() {
    const V = this._evState(), E = V.ent, st = this._hass.states, ks = Object.keys(st);
    const num_ = ks.filter((e) => e.startsWith("sensor.") && !isNaN(parseFloat(st[e].state)));
    const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
    const bin = ks.filter((e) => e.startsWith("binary_sensor.") || e.startsWith("sensor.") || e.startsWith("switch."));
    const sel = (k, o, none, h) => this._wzSel(o, E[k], "event", `data-k="${k}"`, none || "– keiner –", h);
    return `<div class="ov" data-act="evdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Elektroauto &amp; Wallbox</b><span>Einstellungen · Beta</span></div><button class="ibtn" data-act="evdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("car", 15)}Dein Auto</div>
      <div class="mut sm" style="margin:2px 0 4px">Marke</div><div class="gschips">${EV_BRANDS.map((b) => `<button class="gsch ${V.brand === b ? "sel" : ""}" data-act="evbrand" data-k="${esc(b)}" aria-pressed="${V.brand === b}">${esc(b)}</button>`).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Modell (optional)</div><input class="otxt" type="text" maxlength="30" placeholder="z. B. Modellname" value="${esc(V.model)}" data-f="evmodel" aria-label="Modell">
      <div class="mut sm" style="margin:8px 0 4px">Form der Zeichnung</div><div class="gschips">${Object.entries(EV_BODIES).map(([k, t]) => `<button class="gsch ${V.body === k ? "sel" : ""}" data-act="evbody" data-k="${k}" aria-pressed="${V.body === k}">${t}</button>`).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Farbe</div><div class="gschips">${Object.entries(EV_COLORS).map(([k, c]) => `<button class="evsw ${V.color === k ? "sel" : ""}" data-act="evcol" data-k="${k}" style="--c:${c[2]};--c2:${c[1]}" aria-label="${c[0]}" aria-pressed="${V.color === k}" title="${c[0]}"></button>`).join("")}</div>
      <div class="gst">${ic("info", 15)}Marke und Modell erscheinen als Beschriftung. Die Zeichnung ist allgemein gehalten, ohne Logos und nicht dem Modell nachgebaut.</div>
      <div class="lsec">${ic("energy", 15)}Fahrzeug-Sensoren</div>
      <div class="mut sm" style="margin:2px 0 0">Ladestand (Prozent)</div>${sel("soc", num_, "", /soc|batter|ladestand|akku/i)}
      <div class="mut sm" style="margin:0">Kilometerstand</div>${sel("odo", num_, "", /odo|kilometer|km|mileage|stand/i)}
      <div class="mut sm" style="margin:0">Reichweite (optional)</div>${sel("range", num_, "", /reichweite|range/i)}
      <div class="lsec">${ic("bolt", 15)}Wallbox</div>
      <div class="mut sm" style="margin:2px 0 0">Ladekabel angesteckt (Sensor oder Status der Wallbox)</div>${sel("plug", bin, "", /plug|kabel|cable|connect|angesteckt|status/i)}
      <div class="mut sm" style="margin:0">Lädt gerade (optional, sonst aus der Ladeleistung)</div>${sel("charging", bin, "", /charging|l(ä|a)dt|lade/i)}
      <div class="mut sm" style="margin:0">Ladeleistung (Watt)</div>${sel("power", pw, "", /lade|charg|wallbox|power|leistung/i)}
      <div class="gst">${ic("info", 15)}Das Ladekabel erscheint, sobald „angesteckt“ meldet, und verschwindet beim Abstecken. Beim Laden leuchtet es und die Ladung läuft sichtbar.</div>
      <div class="foot2"><button class="btn2 pri" data-act="evdone">Fertig</button></div></div>`;
  }
  _betaBox(txt) {
    const m = MODS.find((x) => x.id === (this._mdActive && this._mdActive())), st = modSt(m);
    if (st === "vorab") return this._vorabBox(txt);
    if (st === "dev") return `<div class="betabox dvbox">${ic("alert", 20)}<div><b>In Entwicklung – diese Seite zeigt Beispielwerte</b>Das Modul steuert noch nichts. ${txt} Rückmeldungen helfen: <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Fehler oder Wunsch melden</a>.</div></div>`;
    return `<div class="betabox">${ic("alert", 20)}<div><b>Beta-Version – dieses Modul ist noch in Entwicklung</b>Funktionen können sich ändern oder fehlen noch. ${txt} Rückmeldungen helfen: <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Fehler oder Wunsch melden</a>.</div></div>`; }
  _betaSoon(ico, t, d) { return `<div class="card lusoon">${ic(ico, 26)}<div><b>${t}</b><span class="mut">${d}</span></div><em class="beta">In Entwicklung</em></div>`; }
  _betaPage(id) { return id === "sp" ? this._spPage() : id === "wa" ? this._waPage() : id === "bt" ? this._btPage() : id === "dt" ? this._dtPage() : id === "sf" ? this._sfPage() : id === "pl" ? this._plPage() : id === "wx" ? this._wxPage() : id === "ga" ? this._gaPage() : id === "ev" ? this._evPage() : id === "rb" ? this._rbPage() : id === "wp" ? this._wpPage() : this._luPage(); }
  /* Modul 16: Solar-Prognose (Vorabversion) – Daten und Tagesvergleich laufen im Backend (solar.py) */
  _vorabBox(txt) { return `<div class="vabox">${ic("sun", 20)}<div><b>Vorabversion – funktioniert, ist aber noch nicht endgültig</b>Aussehen und Einstellungen können sich noch ändern. ${txt} Rückmeldungen helfen: <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Fehler oder Wunsch melden</a>.</div></div>`; }
  _spLoad(force) {
    if (!this._hass || this._spBusy) return;
    if (!force && this._spD && Date.now() - this._spD.ts < 60000) return;
    this._spBusy = true;
    this._hass.callWS({ type: "fenster_heizung/sp_get" }).then((r) => { this._spD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._spD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._spBusy = false; if (this._spVisible()) { this._render(); if (this._modal && this._modal.type === "spset") this._renderModal(); } });
  }
  _spVisible() { return !!(this._modal && this._modal.type === "spset") || (!!this._mdActive && this._mdActive() === "sp" && !this._stOpen); }
  _sp() { const d = (this._spD && this._spD.d) || {}; return { ...d, cfg: { src: "forecast", fc_sensor: "", act: "", mode: "day", ...(d.cfg || {}) } }; }
  _spSave(cfg) {
    const s = this._sp(); this._spD = { d: { ...s, cfg }, ts: Date.now() };
    this._hass.callWS({ type: "fenster_heizung/sp_set", cfg }).then((r) => { this._spD = { d: r || {}, ts: Date.now() }; if (this._spVisible()) { this._render(); if (this._modal && this._modal.type === "spset") this._renderModal(); } })
      .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    this._render(); if (this._modal && this._modal.type === "spset") this._renderModal();
  }
  _spAct(a, b) {
    const k = b.dataset.k, c = { ...this._sp().cfg };
    if (a === "spxopen") { this._spLoad(true); this._modal = { type: "spset" }; this._renderModal(); return; }
    if (a === "spxday") { this._spDay = k; this._render(); return; }
    if (a === "spxsrc") c.src = k; else if (a === "spxmode") c.mode = k; else if (a === "spxm3") c.act = k || ""; else if (a === "spxgoig") { this._modal = null; this._renderModal(); this._sto = { q: "forecast", c: "" }; this._igOpen = true; this._render(); return; } else return;
    this._spSave(c);
  }
  _spChange(t) {
    const f = t.dataset.f, v = t.value || "", c = { ...this._sp().cfg };
    if (t.blur) t.blur();
    if (f === "spxfc") c.fc_sensor = v; else if (f === "spxact") c.act = v; else return false;
    this._spSave(c); return true;
  }
  _spModal() {
    const H = this._hass, S = H.states, adm = this._admin(), C = this._sp().cfg, ids = Object.keys(S);
    const nm = (id) => esc((S[id].attributes || {}).friendly_name || id), un = (id) => (S[id].attributes || {}).unit_of_measurement || "";
    const eng = ids.filter((k) => k.startsWith("sensor.") && /^(Wh|kWh|MWh)$/.test(un(k)) && !/prognose|forecast|estimated|energy_production_(today|tomorrow)/i.test(k));
    const fc = ids.filter((k) => k.startsWith("sensor.") && S[k].attributes && S[k].attributes.wh_period);
    const m3 = (() => { try { const e = this._enState().ent; return e.pve || ""; } catch (x) { return ""; } })();
    const opt = (list, cur, auto) => `<option value="" ${cur ? "" : "selected"}>${esc(auto)}</option>${list.map((id) => `<option value="${esc(id)}" ${cur === id ? "selected" : ""}>${nm(id)} · ${esc(S[id].state)} ${esc(un(id))}</option>`).join("")}`;
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" ${adm ? "" : "disabled"}>${t}</button>`;
    const sel = (ico, t, f, body, dis) => `<div class="vrow"><span>${ic(ico, 15)} ${t}</span><select class="osel" style="max-width:55%;margin:0" data-f="${f}" aria-label="${t}" ${adm && !dis ? "" : "disabled"}>${body}</select></div>`;
    const fsN = this._sp().sites || [];
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Solar-Prognose</b><span>Einstellungen · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("sun", 15)}Prognose-Quelle</div>
      <div class="gschips">${chip("spxsrc", "forecast", "Forecast.Solar", C.src === "forecast")}${chip("spxsrc", "sensor", "Eigener Sensor", C.src === "sensor")}</div>
      ${C.src === "forecast" ? `<div class="gst">${ic("info", 15)}<span>${fsN.length ? `Gefunden: ${fsN.map(esc).join(", ")}. Mehrere Anlagen werden addiert.` : `Die Integration Forecast.Solar ist nicht eingerichtet oder liefert gerade nichts. Sie lässt sich im <button class="lnk" data-act="spxgoig">Store</button> finden.`}</span></div>`
      : sel("chart", "Prognose-Sensor", "spxfc", opt(fc, C.fc_sensor, fc.length ? "Bitte wählen" : "Keiner gefunden"), !fc.length) + `<div class="mut sm">Der Sensor braucht das Attribut <code>wh_period</code> (Wh je Stunde), wie es Forecast.Solar liefert.</div>`}
      <div class="lsec" style="margin-top:12px">${ic("energy", 15)}Tatsächlicher Ertrag</div>
      ${sel("zap", "Ertragssensor", "spxact", opt(eng, C.act, eng.length ? "Ohne Vergleich" : "Keine Energie-Sensoren"), !eng.length)}
      ${m3 && m3 !== C.act && S[m3] ? `<div class="gst">${ic("info", 15)}<span>Modul 3 nutzt <b>${nm(m3)}</b>. <button class="lnk" data-act="spxm3" data-k="${esc(m3)}">Denselben Sensor verwenden</button></span></div>` : ""}
      <div class="mut sm" style="margin:8px 0 4px">Was zählt der Sensor?</div>
      <div class="gschips">${chip("spxmode", "day", "Nur den heutigen Tag", C.mode === "day")}${chip("spxmode", "total", "Gesamtzähler (steigt immer)", C.mode === "total")}</div>
      <div class="mut sm" style="margin-top:6px">Die Prognose des Tages wird morgens festgehalten. So bleibt der Vergleich über die Tage ehrlich, auch wenn sich die Vorhersage tagsüber ändert.</div>
      ${this._labFields("sp")}
    </div>`;
  }
  _spPage() {
    this._spLoad();
    const S = this._sp(), adm = this._admin(), DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], f1 = (v) => num(v, 1);
    const head = this._vorabBox("Die Prognose kommt aus Forecast.Solar oder einem eigenen Sensor, der Ertrag aus einem Energie-Sensor deiner Anlage.");
    if (!this._spD) return head + `<div class="card empty">${ic("sun", 36)}<div style="margin-top:8px">Lade Prognose …</div></div>`;
    if (S.error) return head + `<div class="card empty">${ic("alert", 36)}<div style="margin-top:8px">Die Prognose konnte nicht geladen werden.</div></div>`;
    if (!S.found) return head + `<div class="card empty">${ic("sun", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch keine Prognose da</div>Wähle in den Einstellungen die Quelle. Am einfachsten geht es mit der Integration Forecast.Solar.${adm ? `<div style="margin-top:12px"><button class="btn2" data-act="spxopen">${ic("sliders", 16)}Einstellungen öffnen</button></div>` : ""}</div>`;
    const today = S.today, got = S.got, base = S.today_f != null ? S.today_f : today, pc = got != null && base > 0 ? Math.round(got / base * 100) : null, nowH = S.now_h;
    const dlt = S.tomorrow - today, dp = today > 0 ? Math.round(dlt / today * 100) : null;
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const day = this._spDay === "tomorrow" ? "tomorrow" : "today", rows = day === "today" ? S.hours : S.hours_tm;
    const mx = Math.max(1, ...rows.map((r) => r[1]), 0.5), H0 = rows.length ? Math.min(...rows.map((r) => r[0])) : 6, H1 = rows.length ? Math.max(...rows.map((r) => r[0])) : 20, n = H1 - H0 + 1, bw = 560 / Math.max(n, 1);
    const byh = Object.fromEntries(rows);
    const bars = Array.from({ length: n }, (_, i) => { const h = H0 + i, v = byh[h] || 0, ht = Math.round(v / mx * 110), past = day === "today" && h < nowH, cur = day === "today" && h === nowH;
      return `<g><title>${h}:00 Uhr · ${num(v, 2)} kWh</title><rect x="${(i * bw + 2).toFixed(1)}" y="${130 - ht}" width="${(bw - 4).toFixed(1)}" height="${Math.max(ht, 1)}" rx="3" fill="#f59e0b" opacity="${cur ? 1 : past ? 0.4 : 0.75}"/>${i % 2 === 0 || n < 10 ? `<text x="${(i * bw + bw / 2).toFixed(1)}" y="146" text-anchor="middle" font-size="10" fill="var(--secondary-text-color)">${h}</text>` : ""}</g>`; }).join("");
    const chart = rows.length ? `<svg viewBox="0 0 560 150" role="img" aria-label="Stündliche Prognose" style="width:100%;height:auto;display:block;margin-top:10px">${bars}</svg><div class="mut sm">kWh je Stunde, Höchstwert ${f1(mx)} kWh. ${day === "today" ? "Vergangene Stunden sind blasser, die aktuelle ist voll." : ""}</div>` : `<div class="mut" style="padding:16px 0">Für diesen Tag gibt es keine Stundenwerte.</div>`;
    const hist = S.hist || [], hm = Math.max(1, ...hist.map((x) => Math.max(x.f || 0, x.a || 0)), today, got || 0);
    const hcol = (lab, f, a, tdy) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0"><div style="display:flex;align-items:flex-end;gap:3px;height:110px"><div title="Prognose ${f1(f)} kWh" style="width:12px;height:${Math.max(2, Math.round(f / hm * 104))}px;border-radius:3px;background:#f59e0b;opacity:.45"></div>${a != null ? `<div title="Ertrag ${f1(a)} kWh" style="width:12px;height:${Math.max(2, Math.round(a / hm * 104))}px;border-radius:3px;background:#22c55e;${tdy ? "opacity:.65" : ""}"></div>` : ""}</div><span class="mut" style="font-size:.7rem${tdy ? ";font-weight:700;color:var(--primary-text-color)" : ""}">${lab}</span></div>`;
    const hbars = hist.map((x) => hcol(DAYS[new Date(x.d + "T12:00:00").getDay()], x.f, x.a, false)).join("") + hcol("Heute", base, got, true);
    const best = S.best, dev = S.dev;
    return `${head}
      <div class="card"><h2>${ic("sun", 18)}Ertrag heute und morgen</h2><div class="lugrid">
        ${tile("Heute, Prognose", f1(today) + " kWh", "Gesamter Tag")}
        ${tile("Heute, bisher", got != null ? f1(got) + " kWh" : "–", got != null ? (pc != null ? pc + " % der Tagesprognose" : "") : S.has_act ? "Sensor liefert keinen Wert" : "Kein Ertragssensor gewählt")}
        ${tile("Morgen, Prognose", f1(S.tomorrow) + " kWh", dp == null ? "" : dp === 0 ? "Wie heute" : dp < 0 ? `${-dp} % weniger als heute` : `${dp} % mehr als heute`)}
        ${tile("Abweichung " + hist.length + (hist.length === 1 ? " Tag" : " Tage"), dev == null ? "–" : (dev >= 0 ? "+" : "") + f1(dev) + " %", dev == null ? "Braucht Ertragssensor und einige Tage" : dev >= 0 ? "Ertrag über der Prognose" : "Ertrag unter der Prognose")}</div>
        ${pc != null ? `<div style="margin-top:12px;height:8px;border-radius:99px;background:color-mix(in srgb,var(--primary-text-color) 10%,transparent);overflow:hidden" role="progressbar" aria-valuenow="${Math.min(pc, 100)}" aria-valuemin="0" aria-valuemax="100"><i style="display:block;height:100%;width:${Math.min(pc, 100)}%;background:#22c55e"></i></div>` : ""}</div>
      <div class="card"><h2>${ic("chart", 18)}Verlauf über den Tag</h2>
        <div class="gschips" style="margin-top:6px"><button class="gsch ${day === "today" ? "sel" : ""}" data-act="spxday" data-k="today" aria-pressed="${day === "today"}">Heute</button><button class="gsch ${day === "tomorrow" ? "sel" : ""}" data-act="spxday" data-k="tomorrow" aria-pressed="${day === "tomorrow"}">Morgen</button></div>${chart}</div>
      ${best ? `<div class="card"><h2>${ic("clock", 18)}Beste Zeit für Verbraucher</h2><div style="margin-top:6px">${S.best_day === "today" ? "Heute" : "Morgen"} zwischen <b>${best.from}:00 und ${best.to}:00 Uhr</b> ist mit rund ${f1(best.kwh)} kWh die ergiebigste Zeit. Dann lohnen sich Waschen, Laden oder Bewässern am meisten.</div></div>` : ""}
      <div class="card"><h2>${ic("chart", 18)}Prognose gegen tatsächlich</h2>
        ${hist.length || got != null ? `<div style="display:flex;gap:6px;margin-top:10px;align-items:flex-end">${hbars}</div>
        <div class="gst" style="margin-top:10px;flex-wrap:wrap"><span style="display:inline-flex;align-items:center;gap:5px;margin-right:14px"><i style="width:10px;height:10px;border-radius:3px;background:#f59e0b;opacity:.45"></i>Prognose</span><span style="display:inline-flex;align-items:center;gap:5px"><i style="width:10px;height:10px;border-radius:3px;background:#22c55e"></i>Ertrag</span></div>`
        : `<div class="mut" style="padding:12px 0">${S.has_act ? "Der Vergleich füllt sich ab morgen. Die Prognose des Tages wird morgens festgehalten." : "Wähle in den Einstellungen einen Ertragssensor, dann zeigt dieser Vergleich Prognose und Ertrag pro Tag."}</div>`}
        <div class="mut sm" style="margin-top:6px">Quelle: ${esc(S.src || "–")}${(S.sites || []).length ? " · " + S.sites.map(esc).join(", ") : ""}</div></div>`;
  }
  _waPage() {
    const day = 864e5, now = Date.now(), fmt = (d) => new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const items = [["Lüftungsfilter wechseln", "Alle 3 Monate", now + 12 * day, "fan"], ["Schornsteinfeger", "Jährliche Messung", now + 38 * day, "flame"], ["Heizungswartung", "Jährlich, Fachbetrieb", now + 120 * day, "tools"], ["Zisternenfilter reinigen", "Alle 6 Monate", now + 160 * day, "drop"]];
    const rest = (t) => Math.round((t - now) / day), tone = (d) => (d < 0 ? "#ef4444" : d <= 14 ? "#f59e0b" : "#22c55e");
    const row = (x) => { const d = rest(x[2]); return `<div class="luroom"><b>${ic(x[3], 16)} ${x[0]}</b><span style="color:${tone(d)};font-weight:700">${d < 0 ? `${-d} Tage überfällig` : d === 0 ? "Heute fällig" : `in ${d} Tagen`}</span><span class="mut">${x[1]} · ${fmt(x[2])}</span></div>`; };
    const hrs = [["Wärmepumpe", 4820, 5000], ["Zirkulationspumpe", 9340, 20000]];
    const hrow = (x) => { const pc = Math.min(100, Math.round((x[1] / x[2]) * 100)), c = pc >= 90 ? "#f59e0b" : "#22c55e"; return `<div class="luroom"><b>${ic("clock", 16)} ${x[0]}</b><span class="lv">${num(x[1], 0)} h</span><div style="height:8px;border-radius:5px;background:rgba(127,127,127,.25);overflow:hidden;margin:4px 0"><div style="width:${pc}%;height:100%;background:${c}"></div></div><span class="mut">Nächste Wartung bei ${num(x[2], 0)} h (${pc} %)</span></div>`; };
    const soon = items.filter((x) => rest(x[2]) <= 30).length, tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Die Einträge sind Beispiele. Eigene Termine, Filter und Zähler richtest du später in den Einstellungen ein.")}
      <div class="card"><h2>${ic("tools", 18)}Überblick</h2><div class="gst" style="margin-bottom:10px">${ic("alert", 15)}${soon === 1 ? "1 Termin ist" : soon + " Termine sind"} in den nächsten 30 Tagen fällig.</div>
        <div class="lugrid">${tile("Fällig in 30 Tagen", String(soon), "Zum Beispiel Filter und Schornsteinfeger")}${tile("Überfällig", "0", "Nichts versäumt")}${tile("Termine gesamt", String(items.length), "Beispieleinträge")}</div></div>
      <div class="card"><h2>${ic("clock", 18)}Termine (Beispiel)</h2><div class="lugrid">${items.map(row).join("")}</div></div>
      <div class="card"><h2>${ic("tools", 18)}Betriebsstunden (Beispiel)</h2><div class="lugrid">${hrs.map(hrow).join("")}</div></div>
      ${this._betaSoon("plus", "Eigene Termine anlegen", "Name, Abstand und nächstes Datum, mit Erledigt-Knopf")}
      ${this._betaSoon("bell", "Erinnerung", "Aufs Handy, einige Tage vor dem Termin")}
      ${this._betaSoon("clock", "Betriebsstunden aus Sensoren", "Zähler aus Home Assistant lesen und Wartung bei Stundenzahl melden")}`;
  }
  _btPage() {
    const soc = this._soc(), p = this._pv(), pv = this._pvNow();
    const modes = [["sun", "PV laden", "Überschuss in die Batterie"], ["shield", "Halten", "Ladestand nicht verändern"], ["home", "Haus aus Batterie", "Verbrauch aus dem Speicher decken"], ["energy", "Netzladen", "Bei günstigem Strom aus dem Netz laden"]];
    const mc = modes.map((m, i) => `<div class="luroom ${i ? "off" : ""}"><b>${ic(m[0], 16)} ${m[1]}</b><span class="mut">${m[2]}</span></div>`).join("");
    const seg = [[0, 6, "#6366f1", "Netzladen"], [6, 10, "#64748b", "Halten"], [10, 16, "#f59e0b", "PV laden"], [16, 22, "#22c55e", "Haus aus Batterie"], [22, 24, "#64748b", "Halten"]];
    const bar = seg.map((x) => `<div title="${x[3]}" style="flex:${x[1] - x[0]};background:${x[2]};opacity:.85"></div>`).join("");
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Die Planung ist eine Vorschau mit Beispielwerten. Es wird nichts an der Batterie geschaltet.")}
      <div class="card"><h2>${ic("energy", 18)}Speicher jetzt</h2><div class="lugrid">
        ${tile("Ladestand", soc != null ? num(soc, 0) + " %" : "–", soc != null ? "Aus dem Sensor in Modul 1" : "Noch kein Ladestand-Sensor gewählt")}
        ${tile("PV-Überschuss", pv != null ? wfmt(pv) : "–", pv != null ? "Verfügbar zum Laden" : "Noch kein Sensor gewählt")}
        ${tile("Untergrenze", p.soc_min != null && p.soc_sensor ? num(p.soc_min, 0) + " %" : "–", "Heizer erst darüber (Modul 1)")}</div></div>
      <div class="card"><h2>${ic("sliders", 18)}Betriebsarten</h2><div class="lugrid">${mc}</div></div>
      <div class="card"><h2>${ic("clock", 18)}Beispiel-Zeitplan</h2>
        <div style="display:flex;height:26px;border-radius:8px;overflow:hidden;margin:8px 0 4px">${bar}</div>
        <div style="display:flex;justify-content:space-between" class="mut sm"><span>0 Uhr</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
        <div class="gst" style="margin-top:10px;flex-wrap:wrap">${seg.map((x) => `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px"><i style="width:10px;height:10px;border-radius:3px;background:${x[2]}"></i>${x[3]}</span>`).join("")}</div></div>
      ${this._betaSoon("sliders", "Ladestand-Grenzen", "Untere und obere Grenze je Betriebsart festlegen")}
      ${this._betaSoon("clock", "Zeitplan", "Betriebsart nach Uhrzeit und Wochentag wählen")}
      ${this._betaSoon("bolt", "Netzladen nach Preis", "Nur laden, wenn der Strom günstig ist (Modul 14)")}`;
  }
  _dtPrices() {
    const p = this._pv(), e = p.price_sensor && this._hass.states[p.price_sensor]; if (!e) return null;
    const a = e.attributes || {}, raw = a.raw_today || a.prices_today || a.today || a.prices;
    if (!Array.isArray(raw) || raw.length < 12) return null;
    const vals = raw.map((x) => Number(typeof x === "object" && x ? (x.value ?? x.price) : x));
    if (vals.some((v) => !isFinite(v))) return null;
    const f = vals.every((v) => Math.abs(v) < 5) ? 100 : 1, per = vals.length > 30 ? 4 : 1;
    const h = []; for (let i = 0; i < 24; i++) { let t = 0, n = 0; for (let k = 0; k < per; k++) { const v = vals[i * per + k]; if (v != null) { t += v; n++; } } h.push(n ? (t / n) * f : null); }
    return h.every((v) => v != null) ? h : null;
  }
  _dtPage() {
    const h = this._dtPrices(), now = new Date().getHours(), tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    let body = `<div class="card empty">${ic("chart", 30)}<div style="margin-top:8px">Noch keine Stundenpreise. Wähle in Modul 1 unter „Strompreis“ einen Sensor mit Preisliste (zum Beispiel Tibber, Awattar oder Nord Pool).</div></div>`;
    if (h) {
      const mn = Math.min(...h), mx = Math.max(...h), avg = h.reduce((a, b) => a + b, 0) / 24, span = Math.max(mx - mn, 0.01);
      const col = (v) => (v - mn) / span < 0.34 ? "#22c55e" : (v - mn) / span < 0.67 ? "#f59e0b" : "#ef4444";
      let bi = 0, bs = Infinity; for (let i = 0; i <= 21; i++) { const sm = h[i] + h[i + 1] + h[i + 2]; if (sm < bs) { bs = sm; bi = i; } }
      const bars = h.map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px" title="${i}:00 · ${num(v, 1)} ct/kWh"><div style="width:100%;height:${Math.round(12 + ((v - mn) / span) * 108)}px;border-radius:4px 4px 0 0;background:${col(v)};opacity:${i < now ? 0.4 : 0.95};${i === now ? "outline:2px solid var(--primary-text-color);outline-offset:1px" : ""}"></div><span class="mut" style="font-size:.62rem">${i % 3 === 0 ? i : ""}</span></div>`).join("");
      body = `<div class="card"><h2>${ic("chart", 18)}Preisverlauf heute</h2><div style="display:flex;align-items:flex-end;gap:2px;height:150px;margin-top:8px">${bars}</div>
        <div class="gst" style="margin-top:8px">Cent pro kWh, grün günstig, rot teuer. Der Rahmen zeigt die aktuelle Stunde.</div></div>
        <div class="card"><h2>${ic("clock", 18)}Günstigste Zeiten</h2><div class="lugrid">
          ${tile("Günstigste 3 Stunden", `${bi}–${bi + 3} Uhr`, `Ø ${num(bs / 3, 1)} ct/kWh · zum Laden und Waschen`)}
          ${tile("Günstigste Stunde", `${h.indexOf(mn)}:00 Uhr`, `${num(mn, 1)} ct/kWh`)}
          ${tile("Teuerste Stunde", `${h.indexOf(mx)}:00 Uhr`, `${num(mx, 1)} ct/kWh`)}</div></div>`;
      body = `<div class="card"><h2>${ic("bolt", 18)}Preis jetzt</h2><div class="lugrid">
          ${tile("Jetzt", num(h[now], 1) + " ct/kWh", h[now] <= avg ? "Unter dem Tagesschnitt" : "Über dem Tagesschnitt")}
          ${tile("Tagesschnitt", num(avg, 1) + " ct/kWh", `Spanne ${num(mn, 1)} bis ${num(mx, 1)} ct`)}
          ${tile("Nächste Stunde", num(h[(now + 1) % 24], 1) + " ct/kWh", h[(now + 1) % 24] < h[now] ? "Wird günstiger" : "Wird teurer")}</div></div>` + body;
    }
    return `${this._betaBox("Die Stundenpreise kommen aus dem Preis-Sensor, den du in Modul 1 gewählt hast.")}${body}
      ${this._betaSoon("clock", "Günstige Fenster", "Beste Zeit zum Laden, Waschen oder Heizen vorschlagen")}
      ${this._betaSoon("bell", "Preisalarm", "Melden, wenn der Preis unter oder über eine Grenze geht")}
      ${this._betaSoon("chart", "Morgen", "Preise des nächsten Tages, sobald sie veröffentlicht sind")}`;
  }
  /* Modul 11: Rauch- & Sicherheitsmelder (Alarme, Batterie, Erreichbarkeit, Prüf-Erinnerung, Aktionen und Meldungen laufen im Backend) */
  _sfxDef() { return { kinds: ["smoke", "co", "gas", "water", "heat", "safety"], excl: [], repeat: 10, bat: { on: true, pct: 20 }, off: { on: true, min: 60 }, test: { on: true, months: 6 }, acts: [], notify: { alarm: true, end: false, bat: true, off: true, test: true, to: [] } }; }
  _sfxNames() { return { smoke: "Rauch", co: "CO", gas: "Gas", water: "Wasser", heat: "Hitze", safety: "Sicherheit" }; }
  _sfxKind() { return { smoke: ["Rauchmelder", "flame"], co: ["CO-Melder", "alert"], gas: ["Gasmelder", "flame"], water: ["Wassermelder", "drop"], heat: ["Hitzemelder", "thermo"], safety: ["Sicherheitsmelder", "shield"] }; }
  _sfxLoad(force) {
    if (!this._hass || this._sfxBusy) return;
    if (!force && this._sfxD && Date.now() - this._sfxD.ts < 15000) return;
    this._sfxBusy = true;
    this._hass.callWS({ type: "fenster_heizung/sf_get" }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._sfxD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._sfxBusy = false; if (this._sfxVisible()) { this._render(); if (this._modal && this._modal.type === "sfset") this._renderModal(); } });
  }
  _sfxVisible() { return !!(this._modal && this._modal.type === "sfset") || (!!this._mdActive && this._mdActive() === "sf" && !this._stOpen); }
  _sfx() { const d = (this._sfxD && this._sfxD.d) || {}, df = this._sfxDef(), c = d.cfg || {}; return { ...d, cfg: { ...df, ...c, bat: { ...df.bat, ...(c.bat || {}) }, off: { ...df.off, ...(c.off || {}) }, test: { ...df.test, ...(c.test || {}) }, notify: { ...df.notify, ...(c.notify || {}) }, kinds: c.kinds || df.kinds, excl: c.excl || [], acts: c.acts || [] } }; }
  _sfxSave(cfg) {
    const s = this._sfx(); this._sfxD = { d: { ...s, cfg }, ts: Date.now() };
    clearTimeout(this._sfxT);
    this._sfxT = setTimeout(() => {
      this._sfxT = null;
      this._hass.callWS({ type: "fenster_heizung/sf_set", cfg: this._sfx().cfg }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; if (this._sfxVisible()) { this._render(); if (this._modal && this._modal.type === "sfset") this._renderModal(); } })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._render(); if (this._modal && this._modal.type === "sfset") this._renderModal();
  }
  _sfxPatch(fn) { const c = JSON.parse(JSON.stringify(this._sfx().cfg)); fn(c); this._sfxSave(c); }
  _sfxAct(a, b) {
    const k = b.dataset.k, i = Number(b.dataset.i), s = Number(b.dataset.s);
    if (a === "sfxopen") { this._sfxLoad(true); this._modal = { type: "sfset" }; this._renderModal(); return; }
    if (a === "sfxtest") { this._hass.callWS({ type: "fenster_heizung/sf_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "sfxtested") { this._hass.callWS({ type: "fenster_heizung/sf_tested" }).then((r) => { this._sfxD = { d: r || {}, ts: Date.now() }; this._render(); this._toast("Melder als geprüft eingetragen"); }).catch(() => this._toast("Das hat nicht geklappt")); return; }
    if (a === "sfxpress") { this._hass.callWS({ type: "fenster_heizung/sf_press", ent: k }).then((r) => { this._toast(r && r.ok ? "Test am Melder ausgelöst" : "Der Melder hat keinen Testknopf"); this._sfxLoad(true); }).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "sfxgoig") { this._modal = null; this._renderModal(); this._sto = { q: "", c: "sicherheit" }; this._igOpen = true; this._render(); return; }
    this._sfxPatch((c) => {
      if (a === "sfxkind") c.kinds = c.kinds.includes(k) ? c.kinds.filter((x) => x !== k) : [...c.kinds, k];
      else if (a === "sfxexcl") c.excl = c.excl.includes(k) ? c.excl.filter((x) => x !== k) : [...c.excl, k];
      else if (a === "sfxrep") c.repeat = Math.min(60, Math.max(0, (Number(c.repeat) || 0) + s));
      else if (a === "sfxbat") c.bat.on = !c.bat.on;
      else if (a === "sfxbatp") c.bat.pct = Math.min(50, Math.max(5, (Number(c.bat.pct) || 20) + s));
      else if (a === "sfxoff") c.off.on = !c.off.on;
      else if (a === "sfxoffm") c.off.min = Number(k);
      else if (a === "sfxtst") c.test.on = !c.test.on;
      else if (a === "sfxtstm") c.test.months = Number(k);
      else if (a === "sfxn") c.notify[k] = !c.notify[k];
      else if (a === "sfxns") c.notify.to = c.notify.to.includes(k) ? c.notify.to.filter((x) => x !== k) : [...c.notify.to, k];
      else if (a === "sfxak") c.acts[i].kind = k;
      else if (a === "sfxad") c.acts[i].do = k;
      else if (a === "sfxrm") c.acts.splice(i, 1);
    });
  }
  _sfxChange(t) {
    const f = t.dataset.f, v = t.value || "";
    if (f === "sfxadd") { if (v) this._sfxPatch((c) => { if (c.acts.length < 12) c.acts.push({ id: "a" + Date.now().toString(36), kind: "smoke", ent: v, do: this._sfxDo(v)[0][0] }); }); return true; }
    if (f === "sfxent") { this._sfxPatch((c) => { const x = c.acts[Number(t.dataset.i)]; if (x && v) x.ent = v; }); return true; }
    return false;
  }
  /* Ohne Antwort vom Backend: Melder direkt aus den Zuständen lesen */
  _sfxDo(ent) { const d = String(ent).split(".")[0]; return d === "cover" ? [["open", "Öffnen"], ["close", "Schließen"]] : d === "script" || d === "scene" ? [["run", "Ausführen"]] : [["on", "Einschalten"], ["off", "Ausschalten"]]; }
  /* Ohne Antwort vom Backend: Melder direkt aus den Zuständen lesen */
  _sfxLocal() {
    const H = this._hass, E = H.entities || {}, K = { smoke: "smoke", carbon_monoxide: "co", gas: "gas", moisture: "water", heat: "heat", safety: "safety" }, KN = this._sfxKind();
    return Object.entries(H.states).filter(([id, e]) => id.startsWith("binary_sensor.") && K[(e.attributes || {}).device_class]).map(([id, e]) => {
      const a = e.attributes || {}, b = a.battery_level ?? a.battery, bv = b != null && isFinite(Number(b)) ? Number(b) : null, k = K[a.device_class];
      return { id, name: a.friendly_name || id, k, kind: KN[k][0], area: "", src: (E[id] || {}).platform || "", alarm: e.state === "on", off: e.state === "unavailable" || e.state === "unknown", bat: bv, test: "" };
    }).sort((x, y) => Number(y.alarm) - Number(x.alarm) || x.name.localeCompare(y.name, "de"));
  }
  _sfList() { const S = this._sfx(); return !S.error && S.det ? S.det : this._sfxLocal(); }
  _sfAgo(iso) { const t = iso ? new Date(iso).getTime() : NaN; if (!isFinite(t)) return ""; const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? "gerade eben" : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : `vor ${Math.round(m / 1440)} Tagen`; }
  _sfPage() {
    this._sfxLoad();
    const S = this._sfx(), C = S.cfg, adm = this._admin(), live = !S.error && !!S.det, l = this._sfList(), KN = this._sfxKind();
    const al = l.filter((x) => x.alarm), low = l.filter((x) => x.bat != null && x.bat < C.bat.pct), off = l.filter((x) => x.off), tst = S.test || {};
    const bad = al.length ? "alarm" : low.length || off.length || tst.due ? "warn" : "ok";
    const msg = !l.length ? ["Noch keine Melder gefunden", "Melder aus Home Assistant erscheinen hier automatisch, zum Beispiel von X-Sense, Zigbee, Z-Wave oder Homematic."]
      : al.length ? [`${al.length} ${al.length === 1 ? "Alarm" : "Alarme"} aktiv`, al.map((x) => x.name + (x.area ? " (" + x.area + ")" : "")).join(", ")]
        : bad === "warn" ? ["Alles ruhig, aber es gibt Hinweise", [low.length ? `${low.length} ${low.length === 1 ? "Batterie ist" : "Batterien sind"} schwach` : "", off.length ? `${off.length} nicht erreichbar` : "", tst.due ? "Prüfung fällig" : ""].filter(Boolean).join(" · ")]
          : ["Alles in Ordnung", `${l.length} ${l.length === 1 ? "Melder meldet" : "Melder melden"} keinen Alarm, alle erreichbar und mit guter Batterie`];
    const hero = `<div class="card hero sfh ${bad}"><div class="sfi">${ic(bad === "alarm" ? "alert" : bad === "warn" ? "info" : "shield", 56)}</div><div class="lbl">${ic("shield", 16)}Sicherheit im Haus</div><div class="big">${esc(msg[0])}</div><div class="sub">${esc(msg[1])}</div>
      <div class="chips"><span class="chip">${ic("shield", 16)}${l.length} ${l.length === 1 ? "Melder" : "Melder"}</span>${low.length ? `<span class="chip st warn">${ic("alert", 16)}${low.length} Batterie schwach</span>` : ""}${off.length ? `<span class="chip st warn">${ic("alert", 16)}${off.length} nicht erreichbar</span>` : ""}${tst.due ? `<span class="chip st warn">${ic("clock", 16)}Prüfung fällig</span>` : ""}${C.notify.to.length ? `<span class="chip">${ic("bell", 16)}Meldung an ${C.notify.to.length} ${C.notify.to.length === 1 ? "Dienst" : "Dienste"}</span>` : `<span class="chip">${ic("bell", 16)}Keine Meldung eingerichtet</span>`}</div></div>`;
    const tiles = `<div class="tiles">${[
      ["shield", "Melder", String(l.length), "", "#2dd4bf", "In Home Assistant gefunden"],
      ["alert", "Alarme", String(al.length), "", al.length ? "#ef4444" : "#34d399", al.length ? "Sofort prüfen" : "Keine aktiv"],
      ["energy", "Batterie schwach", String(low.length), "", low.length ? "#f59e0b" : "#34d399", low.length ? `Unter ${C.bat.pct} %` : `Alle über ${C.bat.pct} %`],
      ["info", "Nicht erreichbar", String(off.length), "", off.length ? "#f59e0b" : "#34d399", off.length ? "Prüfen" : "Alle melden sich"],
    ].map(([ico, lab, v, u, c, sub]) => `<div class="tile" style="--a:${c}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div></div>`).join("")}</div>`;
    const card = (x) => { const st = x.alarm ? ["alarm", "ALARM"] : x.off ? ["off", "Nicht erreichbar"] : ["ok", "In Ordnung"], bt = x.bat != null ? Math.max(0, Math.min(100, x.bat)) : null, bc = bt == null ? "" : bt < C.bat.pct ? "#f87171" : bt < 40 ? "#f59e0b" : "#34d399";
      return `<div class="sfd ${st[0]}"><div class="sfdh"><span class="sfdi">${ic(KN[x.k][1], 20)}</span><div class="sfdt"><b>${esc(x.name)}</b><small>${esc(x.kind)}${x.area ? " · " + esc(x.area) : ""}${x.src === "xsense" ? " · X-Sense" : ""}</small></div><span class="sfs ${st[0]}">${st[1]}</span></div>
        <div class="sfb">${bt != null ? `<div class="sfbar"><i style="width:${bt}%;background:${bc}"></i></div><span>${ic("energy", 13)} Batterie ${num(bt, 0)} %${bt < C.bat.pct ? " · schwach" : ""}</span>` : `<span class="mut">Batterie unbekannt</span>`}${x.alarm && x.since ? `<span class="sfsince">seit ${esc(this._sfAgo(x.since))}</span>` : ""}${adm && x.test ? `<button class="lnk" data-act="sfxpress" data-k="${esc(x.id)}">${ic("bell", 14)}Testen</button>` : ""}</div></div>`; };
    const list = l.length ? `<div class="card sfc"><h2>${ic("bell", 18)}Melder<small class="mut">${l.length}</small></h2><div class="sfg">${l.map(card).join("")}</div></div>` : "";
    const E = this._hass.entities || {}, anyXs = !!(S.xs && S.xs.found) || Object.keys(E).some((k) => (E[k] || {}).platform === "xsense");
    const empty = !l.length ? `<div class="card sfc"><h2>${ic("puzzle", 18)}Melder verbinden</h2><div class="mut sm" style="margin:0 0 10px">Das Modul liest Melder mit der Geräteklasse Rauch, CO, Gas, Wasser, Hitze oder Sicherheit. ${anyXs ? "X-Sense ist verbunden, hat aber noch keine Melder geliefert." : "Für X-Sense, Zigbee, Z-Wave und Homematic gibt es unter Einstellungen → Integrationen eine Anleitung."}</div>${adm ? `<button class="btn2 pri" data-act="sfxgoig" style="flex:none;padding:10px 18px">${ic("puzzle", 16)} Integrationen öffnen</button>` : ""}</div>` : "";
    const testC = `<div class="card sfc"><h2>${ic("clock", 18)}Prüfung</h2>
      <div class="dgs ${tst.due ? "warn" : "ok"}">${ic(tst.due ? "alert" : "check", 22)}<div><b>${!C.test.on ? "Erinnerung ausgeschaltet" : tst.due ? "Prüfung fällig" : tst.last ? "Zuletzt geprüft " + esc(this._sfAgo(tst.last)) : "Noch nicht geprüft"}</b><span>${C.test.on ? `Alle ${C.test.months} ${C.test.months === 1 ? "Monat" : "Monate"} Testknopf an jedem Melder drücken. ${tst.last ? "" : "Die Frist läuft ab dem ersten Start des Moduls."}` : "Du bekommst keine Erinnerung an den Melder-Test."}</span></div><span></span></div>
      ${adm && l.length ? `<div class="foot2" style="margin-top:10px"><button class="btn2 pri" data-act="sfxtested">${ic("check", 16)} Geprüft</button></div>` : ""}</div>`;
    const log = (S.log || []).length ? `<div class="card sfc"><h2>${ic("list", 18)}Protokoll</h2><div class="wxlog">${S.log.slice(0, 8).map((x) => `<div><time>${new Date(x.t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time><span>${esc(x.x)}</span></div>`).join("")}</div></div>` : `<div class="card sfc"><h2>${ic("list", 18)}Protokoll</h2><div class="mut sm">Noch keine Ereignisse. Alarme, schwache Batterien und Prüfungen erscheinen hier.</div></div>`;
    return `${this._betaBox("Das Modul liest vorhandene Melder und meldet Alarme aufs Handy. Es ersetzt keine zertifizierten Rauchmelder oder Alarmanlage.")}${hero}${l.length ? tiles : ""}${empty}${list}<div class="enc"><div class="enco">${testC}</div><div class="enco">${log}</div></div>`;
  }
  _sfxModal() {
    const S = this._sfx(), C = S.cfg, H = this._hass, NM = this._sfxNames(), KN = this._sfxKind();
    const sw = (act, k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const step = (act, val, unit, s) => `<div class="step" style="flex:none"><button data-act="${act}" data-s="-${s}" aria-label="weniger">${ic("minus", 18)}</button><b>${val} ${unit}</b><button data-act="${act}" data-s="${s}" aria-label="mehr">${ic("plus", 18)}</button></div>`;
    const chip = (act, k, t, on, extra = "") => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" ${extra} aria-pressed="${!!on}">${t}</button>`;
    const actOpts = Object.keys(H.states).filter((e) => /^(light|switch|cover|input_boolean|script|scene)\./.test(e));
    const svc = [...new Set([...Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.notify.to])];
    const all = [...(S.det || []), ...(S.excl || []).filter((x) => !(S.det || []).some((d) => d.id === x.id)).map((x) => ({ id: x.id, name: x.name, k: "safety", kind: "ausgeschlossen", area: "" }))];
    const acts = C.acts.map((x, i) => `<div class="rfv"><div class="vrow" style="margin:0"><span><b>${esc(this._wzName(x.ent))}</b><small class="mut" style="display:block">${esc(x.ent)}</small></span><button class="ibtn" data-act="sfxrm" data-i="${i}" aria-label="Aktion entfernen">${ic("trash", 18)}</button></div>
      <div class="mut sm" style="margin:6px 0 4px">Bei</div><div class="gschips">${[["any", "Jedem Alarm"], ...Object.keys(NM).map((k) => [k, NM[k]])].map(([k, t]) => chip("sfxak", k, t, x.kind === k, `data-i="${i}"`)).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Dann</div><div class="gschips">${this._sfxDo(x.ent).map(([k, t]) => chip("sfxad", k, t, x.do === k, `data-i="${i}"`)).join("")}</div></div>`).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Rauch- &amp; Sicherheitsmelder</b><span>Einstellungen · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("shield", 15)}Welche Melder</div>
      <div class="mut sm" style="margin:0 0 6px">Gelesen werden Melder mit passender Geräteklasse. Schalte Arten aus, die du nicht brauchst.</div>
      <div class="gschips">${Object.keys(NM).map((k) => chip("sfxkind", k, NM[k], C.kinds.includes(k))).join("")}</div>
      ${all.length ? `<details class="ohint"><summary>Einzelne Melder ausschließen (${C.excl.length})</summary>${all.map((d) => `<div class="vrow"><span>${esc(d.name)}<small class="mut" style="display:block">${esc(d.kind)}${d.area ? " · " + esc(d.area) : ""}</small></span>${sw("sfxexcl", esc(d.id), !C.excl.includes(d.id), d.name)}</div>`).join("")}<div class="mut sm">Ein Schalter aus bedeutet: wird nicht überwacht.</div></details>` : ""}
      <div class="gst">${ic("info", 15)}<span>X-Sense und andere Hersteller richtest du unter <button class="lnk" data-act="sfxgoig">Einstellungen → Integrationen</button> ein.</span></div>
      <div class="lsec" style="margin-top:12px">${ic("alert", 15)}Bei Alarm</div>
      <div class="vrow"><span>Erinnerung wiederholen<small class="mut" style="display:block">Solange der Alarm anhält, kommt alle paar Minuten eine Meldung. 0 = nur einmal.</small></span>${step("sfxrep", C.repeat, "Min.", 5)}</div>
      <div class="mut sm" style="margin:10px 0 6px">Aktionen: das Modul schaltet nur, was du hier auswählst, einmal pro Alarm. Gut sind Licht an, Rollläden öffnen (Fluchtweg), Wasserventil schließen oder eine Sirene per Skript.</div>
      ${acts}${C.acts.length < 12 ? this._wzSel(actOpts, "", "sfxadd", "", "+ Aktion hinzufügen", /licht|light|flur|ventil|sirene|rollo/i) : ""}
      <div class="lsec" style="margin-top:12px">${ic("energy", 15)}Batterie und Erreichbarkeit</div>
      <div class="vrow"><span>Schwache Batterie melden<small class="mut" style="display:block">Einmal pro Woche, solange sie unter der Grenze liegt.</small></span>${C.bat.on ? step("sfxbatp", C.bat.pct, "%", 5) : ""}${sw("sfxbat", "", C.bat.on, "Batterie")}</div>
      <div class="vrow"><span>Nicht erreichbar melden<small class="mut" style="display:block">Wenn sich ein Melder so lange nicht meldet. Einmal pro Tag.</small></span>${sw("sfxoff", "", C.off.on, "Erreichbarkeit")}</div>
      ${C.off.on ? `<div class="gschips">${[[15, "15 Min."], [60, "1 Std."], [180, "3 Std."], [720, "12 Std."], [1440, "1 Tag"]].map(([k, t]) => chip("sfxoffm", k, t, C.off.min === k)).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Prüf-Erinnerung</div>
      <div class="vrow"><span>Regelmäßig an den Test erinnern<small class="mut" style="display:block">Du drückst den Testknopf und tippst danach auf „Geprüft“.</small></span>${sw("sfxtst", "", C.test.on, "Prüf-Erinnerung")}</div>
      ${C.test.on ? `<div class="gschips">${[[1, "Monatlich"], [3, "Alle 3 Monate"], [6, "Alle 6 Monate"], [12, "Jährlich"]].map(([k, t]) => chip("sfxtstm", k, t, C.test.months === k)).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Benachrichtigung</div>
      ${[["alarm", "Alarm"], ["end", "Alarm beendet"], ["bat", "Batterie schwach"], ["off", "Nicht erreichbar"], ["test", "Prüfung fällig"]].map(([k, t]) => `<div class="vrow"><span>${t}</span>${sw("sfxn", k, C.notify[k], t)}</div>`).join("")}
      <div class="lsec" style="margin-top:8px">${ic("bell", 15)}Senden an</div>
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("sfxns", esc(n), esc(n), C.notify.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="sfxtest" ${C.notify.to.length ? "" : "disabled"}>${ic("bell", 16)} Test senden</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _plPage() {
    const pv = this._pvNow(), pr = this._price(), tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    const o = this._out();
    return `${this._betaBox("Überschuss und Strompreis kommen aus den PV-Einstellungen von Modul 1.")}
      <div class="card"><h2>${ic("wave", 18)}Bedingungen jetzt</h2><div class="lugrid">
        ${tile("PV-Überschuss", pv != null ? wfmt(pv) : "–", pv != null ? (pv >= 1000 ? "Gut für Pumpe und Heizung" : "Eher wenig") : "Noch kein Sensor gewählt")}
        ${tile("Strompreis", pr ? num(pr, 1) + " ct/kWh" : "–", pr ? "Aus Modul 1" : "Noch kein Preis gewählt")}
        ${tile("Außentemperatur", o.t != null ? num(o.t, 1) + " °C" : "–", o.t != null && o.t < 10 ? "Pool-Heizung lohnt kaum" : "Draußen")}</div></div>
      ${this._betaSoon("wave", "Poolpumpe", "Filterzeiten nach Sonne und Überschuss, Mindestlaufzeit pro Tag")}
      ${this._betaSoon("flame", "Pool-Heizung", "Wärmepumpe oder Heizstab bei Überschuss oder günstigem Strom")}
      ${this._betaSoon("thermo", "Sauna", "Aufheizen nach Wunschzeit, bevorzugt mit Solarstrom")}
      ${this._betaSoon("bolt", "Kosten & Solaranteil", "Was Pumpe und Heizung kosten und wie viel davon Solarstrom war")}`;
  }
  _wxWarn() {
    const st = this._hass.states, c = this._wxCfg(), wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, a = w ? w.attributes : {}, o = this._out();
    const wind = a.wind_speed != null ? Number(a.wind_speed) : null, gust = a.wind_gust_speed != null ? Number(a.wind_gust_speed) : null, mx = Math.max(isFinite(wind) ? wind : 0, isFinite(gust) ? gust : 0);
    const storm = ["lightning", "lightning-rainy", "hail"].includes(w ? w.state : ""), gale = mx >= 60, frost = o.t != null && o.t <= 0;
    return { w, o, wind, mx, storm, gale, frost };
  }
  /* Modul 9: Wetter & Warnungen (Regeln, Vorwarnung, Aktionen, Fenster-Erinnerung und Benachrichtigung laufen im Backend) */
  _wxsDef() { return { warn: { storm: { on: true, kmh: 60 }, thunder: { on: true }, frost: { on: true, temp: 0 }, heat: { on: false, temp: 30 }, rain: { on: false } }, wind: "", ahead: { on: true, hours: 3 }, official: { on: true, ent: "" }, acts: [], win: { on: false, warn: ["storm", "thunder", "rain"] }, notify: { start: true, end: false, ahead: true, to: [] } }; }
  _wxsLoad(force) {
    if (!this._hass || this._wxsBusy) return;
    if (!force && this._wxsD && Date.now() - this._wxsD.ts < 20000) return;
    this._wxsBusy = true;
    this._hass.callWS({ type: "fenster_heizung/wx_get" }).then((r) => { this._wxsD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._wxsD = { d: { error: true }, ts: Date.now() }; })
      .finally(() => { this._wxsBusy = false; if (this._wxsVisible()) { this._render(); if (this._modal && this._modal.type === "wxset") this._renderModal(); } });
  }
  _wxsVisible() { return !!(this._modal && this._modal.type === "wxset") || (!!this._mdActive && this._mdActive() === "wx" && !this._stOpen); }
  _wxs() { const d = (this._wxsD && this._wxsD.d) || {}, df = this._wxsDef(), c = d.cfg || {}; return { ...d, cfg: { ...df, ...c, warn: Object.fromEntries(Object.keys(df.warn).map((k) => [k, { ...df.warn[k], ...((c.warn || {})[k] || {}) }])), ahead: { ...df.ahead, ...(c.ahead || {}) }, official: { ...df.official, ...(c.official || {}) }, win: { ...df.win, ...(c.win || {}) }, notify: { ...df.notify, ...(c.notify || {}) }, acts: c.acts || [] } }; }
  _wxsSave(cfg) {
    const s = this._wxs(); this._wxsD = { d: { ...s, cfg }, ts: Date.now() };
    clearTimeout(this._wxsT);
    this._wxsT = setTimeout(() => {
      this._wxsT = null;
      this._hass.callWS({ type: "fenster_heizung/wx_set", cfg: this._wxs().cfg }).then((r) => { this._wxsD = { d: r || {}, ts: Date.now() }; if (this._wxsVisible()) this._render(); })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._render(); if (this._modal && this._modal.type === "wxset") this._renderModal();
  }
  _wxsPatch(fn) { const c = JSON.parse(JSON.stringify(this._wxs().cfg)); fn(c); this._wxsSave(c); }
  _wxsAct(a, b) {
    const k = b.dataset.k, i = Number(b.dataset.i), s = Number(b.dataset.s);
    if (a === "wxsopen") { this._wxsLoad(true); this._modal = { type: "wxset" }; this._renderModal(); return; }
    if (a === "wxstest") { this._hass.callWS({ type: "fenster_heizung/wx_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "wxsgoig") { this._modal = null; this._renderModal(); this._sto = { q: "", c: "wetter" }; this._igOpen = true; this._render(); return; }
    if (a === "wxsweather") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), entity: k || "" }; this._saveLayout(); this._render(); return; }
    if (a === "wxsout") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), outdoor: k || "" }; this._saveLayout(); this._render(); return; }
    this._wxsPatch((c) => {
      if (a === "wxswindset") c.wind = k || "";
      else if (a === "wxsoff") c.official = k ? { on: true, ent: k } : { on: false, ent: "" };
      else if (a === "wxsw") c.warn[k].on = !c.warn[k].on;
      else if (a === "wxstep") { const w = c.warn[k], f = b.dataset.f, lim = { kmh: [30, 120, 5], temp: k === "heat" ? [20, 45, 1] : [-10, 5, 1] }[f]; w[f] = Math.min(lim[1], Math.max(lim[0], (Number(w[f]) || 0) + s)); }
      else if (a === "wxsahead") c.ahead.on = !c.ahead.on;
      else if (a === "wxsaheadh") c.ahead.hours = Math.min(12, Math.max(1, (Number(c.ahead.hours) || 3) + s));
      else if (a === "wxsn") c.notify[k] = !c.notify[k];
      else if (a === "wxsns") c.notify.to = c.notify.to.includes(k) ? c.notify.to.filter((x) => x !== k) : [...c.notify.to, k];
      else if (a === "wxsaw") c.acts[i].warn = k;
      else if (a === "wxsad") c.acts[i].do = k;
      else if (a === "wxsau") c.acts[i].undo = !c.acts[i].undo;
      else if (a === "wxsrm") c.acts.splice(i, 1);
      else if (a === "wxswin") c.win.on = !c.win.on;
      else if (a === "wxswinw") c.win.warn = c.win.warn.includes(k) ? c.win.warn.filter((x) => x !== k) : [...c.win.warn, k];
    });
  }
  _wxsChange(t) {
    const f = t.dataset.f, v = t.value || "";
    if (f.startsWith("wxssel") && t.blur) t.blur(); /* Auswahl schließen, damit die Seite neu gezeichnet wird */
    if (f === "wxswind") { this._wxsPatch((c) => { c.wind = v; }); return true; }
    if (f === "wxsadd") { if (v) this._wxsPatch((c) => { if (c.acts.length < 12) c.acts.push({ id: "a" + Date.now().toString(36), warn: "storm", ent: v, do: this._wxsDo(v)[0][0], undo: true }); }); return true; }
    if (f === "wxsselw") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), entity: v }; this._saveLayout(); this._render(); this._renderModal(); return true; }
    if (f === "wxsselout") { this._cfg.layout.wx = { ...(this._cfg.layout.wx || {}), outdoor: v }; this._saveLayout(); this._render(); this._renderModal(); return true; }
    if (f === "wxsselwind") { this._wxsPatch((c) => { c.wind = v; }); return true; }
    if (f === "wxsseloff") { this._wxsPatch((c) => { c.official = v === "__off" ? { on: false, ent: "" } : { on: true, ent: v }; }); return true; }
    if (f === "wxsent") { this._wxsPatch((c) => { const x = c.acts[Number(t.dataset.i)]; if (x && v) { x.ent = v; if (!this._wxsDo(v).some((d) => d[0] === x.do)) x.do = this._wxsDo(v)[0][0]; } }); return true; }
    return false;
  }
  _wxsDo(ent) {
    const d = String(ent).split(".")[0];
    return d === "cover" ? [["close", "Schließen"], ["open", "Öffnen"]] : d === "script" || d === "scene" ? [["run", "Ausführen"]] : [["on", "Einschalten"], ["off", "Ausschalten"]];
  }
  _wxsNames() { return { storm: "Sturm", thunder: "Gewitter & Hagel", frost: "Frost", heat: "Hitze", rain: "Starkregen" }; }
  _wxsLocal() {
    const d = this._wxWarn(), c = this._wxs().cfg.warn, st = d.w ? d.w.state : "";
    return { storm: { a: !!c.storm.on && d.mx >= c.storm.kmh, v: d.mx }, thunder: { a: !!c.thunder.on && ["lightning", "lightning-rainy", "hail"].includes(st), v: null }, frost: { a: !!c.frost.on && d.o.t != null && d.o.t <= c.frost.temp, v: d.o.t },
      heat: { a: !!c.heat.on && d.o.t != null && d.o.t >= c.heat.temp, v: d.o.t }, rain: { a: !!c.rain.on && st === "pouring", v: null } };
  }
  _wxPage() {
    this._wxsLoad(); const S = this._wxs(), C = S.cfg, adm = this._admin(), d = this._wxWarn(), NM = this._wxsNames(), live = !S.error && S.state, W = (live ? S.state.warn : this._wxsLocal()) || {};
    const hm = (iso) => { const t = new Date(iso); return String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0"); };
    const ICO = { storm: "fan", thunder: "flame", frost: "thermo", heat: "sun", rain: "drop" }, KEYS = Object.keys(NM), on = (k) => !!C.warn[k].on;
    const act = KEYS.filter((k) => on(k) && (W[k] || {}).a), soon = KEYS.filter((k) => on(k) && !(W[k] || {}).a && (W[k] || {}).ahead);
    const O = (live && S.state.official) || {}, offOn = C.official.on && this._wxOffAny(), offHot = offOn && O.level > 0;
    const wx = d.w ? (WX[d.w.state] || ["cloud", d.w.state])[1] : "", wnd = isFinite(d.wind) ? d.wind : null;
    /* Kopf: ein Satz zur Lage, darunter die Werte von jetzt */
    const tone = act.length || offHot ? "hot" : soon.length ? "soon" : "ok";
    const head = act.length ? `${NM[act[0]]}${act.length > 1 ? ` und ${act.length - 1} weitere` : ""}` : offHot ? O.title : soon.length ? `${NM[soon[0]]} wird erwartet` : "Keine Warnung";
    const sub = act.length ? ((W[act[0]] || {}).since ? `Seit ${hm(W[act[0]].since)} Uhr${offHot ? " · " + O.title : ""}` : "Gerade aktiv") : offHot ? `${O.text || "Amtliche Warnung"}` : soon.length ? `Ab etwa ${hm(W[soon[0]].ahead)} Uhr, ${C.ahead.hours} ${C.ahead.hours === 1 ? "Stunde" : "Stunden"} Vorlauf` : "Alle Werte liegen unter den Grenzen.";
    const now = [wx && `<span>${ic((WX[d.w.state] || ["cloud"])[0], 16)}${wx}</span>`, d.o.t != null && `<span>${ic("thermo", 16)}${num(d.o.t, 1)} °C</span>`, wnd != null && `<span>${ic("fan", 16)}${num(wnd, 0)} km/h${d.mx > wnd ? `, Böen ${num(d.mx, 0)}` : ""}</span>`].filter(Boolean).join("");
    /* Kurve: Wind der nächsten Stunden gegen die Sturmgrenze, Warnstunden getönt */
    const fc = C.ahead.on ? (S.fc || []).slice(0, 12) : [], n = fc.length;
    let chart = "";
    if (n > 1) {
      const VW = 600, VH = 132, px = 8, top = 22, bot = 10, cw = (VW - 2 * px) / n, lim = on("storm") ? C.warn.storm.kmh : null, vals = fc.map((x) => (isFinite(x.wind) ? x.wind : 0)), ym = Math.max(lim ? lim * 1.3 : 0, ...vals, 20) * 1.08;
      const X = (i) => px + cw * (i + 0.5), Y = (v) => top + (VH - top - bot) * (1 - v / ym), line = vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join("");
      chart = `<div class="wxc"><svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Windvorhersage der nächsten ${n} Stunden${lim ? " mit Sturmgrenze " + lim + " km/h" : ""}">
          ${fc.map((x, i) => ((x.w || []).length ? `<rect x="${(px + cw * i).toFixed(1)}" y="0" width="${cw.toFixed(1)}" height="${VH}" class="wxbad"/>` : "")).join("")}
          <path d="${line}L${X(n - 1).toFixed(1)} ${VH - bot}L${X(0).toFixed(1)} ${VH - bot}Z" class="wxar"/>
          ${lim ? `<line x1="${px}" x2="${VW - px}" y1="${Y(lim).toFixed(1)}" y2="${Y(lim).toFixed(1)}" class="wxlim"/><text x="${VW - px - 2}" y="${(Y(lim) - 6).toFixed(1)}" text-anchor="end" class="wxlt">Sturmgrenze ${lim} km/h</text>` : ""}
          <path d="${line}" class="wxln"/>${vals.map((v, i) => `<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${(fc[i].w || []).length ? 3.6 : 2.4}" class="${(fc[i].w || []).length ? "wxdb" : "wxd"}"/>`).join("")}</svg>
        <div class="wxh" style="grid-template-columns:repeat(${n},1fr)">${fc.map((x) => `<div class="${(x.w || []).length ? "bad" : ""}" title="${(x.w || []).length ? x.w.map((k) => NM[k]).join(", ") : "Keine Warnung"}"><small>${hm(x.t).slice(0, 2)}</small>${ic((WX[x.cond] || ["cloud"])[0], 18)}<b>${isFinite(x.temp) ? num(x.temp, 0) + "°" : "–"}</b></div>`).join("")}</div></div>`;
    } else if (C.ahead.on) chart = `<div class="wxnote">${ic("info", 15)}Keine Stundenvorhersage von der Wetter-Entität. Die Vorwarnung braucht sie.</div>`;
    const hero = `<div class="card wxhero ${tone}"><div class="wxhead"><span class="wxdot" aria-hidden="true">${ic(tone === "ok" ? "check" : "alert", 22)}</span><div><b>${esc(head)}</b><small>${esc(sub)}</small></div></div>
      ${now ? `<div class="wxnow">${now}</div>` : ""}${chart}</div>`;
    /* Warnstufen: je ein Pegel gegen die eingestellte Grenze */
    const gauge = (k) => {
      const c = C.warn[k]; let v = null, fill = 0, mark = 0, val = "";
      if (k === "storm") { v = d.mx > 0 ? d.mx : wnd != null ? wnd : (S.fc || []).length && isFinite(S.fc[0].wind) ? S.fc[0].wind : null; if (v != null) { const m = c.kmh * 1.25; fill = v / m; mark = c.kmh / m; val = `${num(v, 0)} von ${c.kmh} km/h`; } }
      else if (k === "frost") { v = d.o.t; if (v != null) { fill = (c.temp + 10 - v) / 15; mark = 10 / 15; val = `${num(v, 1)} °C, Grenze ${c.temp} °C`; } }
      else if (k === "heat") { v = d.o.t; if (v != null) { fill = (v - (c.temp - 15)) / 20; mark = 15 / 20; val = `${num(v, 1)} °C, Grenze ${c.temp} °C`; } }
      return { has: v != null, fill: Math.max(0.02, Math.min(1, fill)), mark, val };
    };
    const row = (k) => {
      const w = W[k] || {}, o = on(k), a = o && w.a, ah = o && !a && w.ahead, g = gauge(k), st = !o ? "Aus" : a ? `Aktiv${w.since ? " seit " + hm(w.since) : ""}` : ah ? `Erwartet ab ${hm(w.ahead)}` : "Keine Warnung";
      const tx = k === "thunder" ? (a ? "Gewitter oder Hagel gemeldet" : "") : k === "rain" ? (a ? "Starkregen gemeldet" : "") : (g.has ? g.val : "Kein Messwert");
      return `<div class="wxr ${!o ? "off" : a ? "hot" : ah ? "soon" : ""}"><span class="wxi">${ic(ICO[k], 18)}</span><div class="wxm"><div class="wxt"><b>${NM[k]}</b><em>${st}</em></div>${g.has && o ? `<div class="wxg" role="img" aria-label="${esc(g.val)}"><i style="width:${(g.fill * 100).toFixed(0)}%"></i><u style="left:${(g.mark * 100).toFixed(0)}%"></u></div>` : ""}${o && tx ? `<small>${esc(tx)}</small>` : ""}</div></div>`;
    };
    const lv = Math.max(0, Math.min(4, O.level || 0));
    const offRow = offOn ? `<div class="wxr ${offHot ? "hot" : ""}"><span class="wxi">${ic("shield", 18)}</span><div class="wxm"><div class="wxt"><b>Amtliche Warnung</b><em>${offHot ? esc(String(O.title).replace(/^Amtliche Warnung:\s*/, "")) : "Keine Warnung"}</em></div><div class="wxp" role="img" aria-label="Stufe ${lv} von 4">${[1, 2, 3, 4].map((i) => `<i class="${i <= lv ? "on l" + lv : ""}"></i>`).join("")}</div><small>${offHot ? esc(O.text || "") : "Deutscher Wetterdienst, NINA oder MeteoAlarm"}</small></div></div>` : "";
    const lamp = KEYS.some(on) ? "" : `<div class="wxnote">${ic("info", 15)}Alle eigenen Warnungen sind aus. Einschalten unter Einstellungen → Modul 9.</div>`;
    const warn = `<div class="card"><h2>${ic("alert", 18)}Warnstufen</h2><div class="wxl">${KEYS.map(row).join("")}${offRow}</div>${lamp}</div>`;
    /* Aktionen und Erinnerungen */
    const A = C.acts, ST = (live && S.state.acts) || {}, wo = S.open || [];
    const arow = (x) => { const on2 = (W[x.warn] || {}).a, s = ST[x.id] || {}, dn = (this._wxsDo(x.ent).find((y) => y[0] === x.do) || [0, x.do])[1], run = s.state === "run"; return `<div class="wxr ${run ? "hot" : ""}"><span class="wxi">${ic(String(x.ent).startsWith("cover.") ? "blinds" : "bolt", 18)}</span><div class="wxm"><div class="wxt"><b>${esc(this._wzName(x.ent))}</b><em>${run ? "Ausgelöst" + (s.at ? " " + hm(s.at) : "") : on2 ? "Wartet" : "Bereit"}</em></div><small>Bei ${NM[x.warn]}: ${dn}${x.undo ? ", danach zurück" : ""}</small></div></div>`; };
    const info = (ico, t, txt, onn) => `<div class="wxr ${onn ? "" : "off"}"><span class="wxi">${ic(ico, 18)}</span><div class="wxm"><div class="wxt"><b>${t}</b><em>${onn ? "An" : "Aus"}</em></div><small>${txt}</small></div></div>`;
    const nTo = C.notify.to.length, nWhat = [C.notify.start && "Beginn", C.notify.end && "Ende", C.notify.ahead && C.ahead.on && "Vorwarnung"].filter(Boolean).join(", ");
    const acts = `<div class="card"><h2>${ic("blinds", 18)}Aktionen und Erinnerungen</h2><div class="wxl">
        ${A.map(arow).join("")}
        ${info("window", "Fenster-Erinnerung", C.win.on ? `Bei ${C.win.warn.map((k) => NM[k]).join(", ")}. ${wo.length ? "Jetzt offen: " + wo.map(esc).join(", ") + "." : "Zurzeit ist kein Fenster offen."}` : "Meldet offene Fenster bei Sturm, Gewitter oder Starkregen.", C.win.on)}
        ${info("bell", "Benachrichtigung", nTo ? `An ${nTo} ${nTo === 1 ? "Dienst" : "Dienste"}: ${nWhat || "nichts ausgewählt"}.` : "Noch kein Dienst gewählt (Einstellungen → Integrationen).", nTo > 0)}</div>
        ${A.length ? "" : `<div class="wxnote">${ic("info", 15)}Noch keine Aktion. Unter Einstellungen → Modul 9 legst du fest, was bei einer Warnung passiert, etwa Markise einfahren.</div>`}</div>`;
    const lg = (S.log || []).slice(0, 8), dd = (iso) => { const t = new Date(iso), td = new Date(); return t.toDateString() === td.toDateString() ? hm(iso) : t.toLocaleDateString("de-DE", { weekday: "short" }) + " " + hm(iso); };
    const log = lg.length ? `<div class="card"><h2>${ic("clock", 18)}Protokoll</h2><div class="wxlog">${lg.map((x) => `<div><time>${dd(x.t)}</time><span>${esc(x.x)}</span></div>`).join("")}</div></div>` : "";
    return `${this._betaBox("Die Warnungen werden im Hintergrund aus deiner Wetter-Entität oder Wetterstation berechnet, auch wenn das Dashboard geschlossen ist. Eigene Grenzwerte sind keine amtlichen Warnungen, diese kommen vom Deutschen Wetterdienst oder NINA, wenn eingerichtet.")}${hero}<div class="wxcols">${warn}${acts}</div>${log}`;
  }
  _wxsModal() {
    const S = this._wxs(), C = S.cfg, NM = this._wxsNames(), st = this._hass.states, H = this._hass;
    const step = (act, k, f, val, unit, min) => `<div class="step" style="flex:none"><button data-act="${act}" data-k="${k}" data-f="${f}" data-s="-${min}" aria-label="weniger">${ic("minus", 18)}</button><b>${val} ${unit}</b><button data-act="${act}" data-k="${k}" data-f="${f}" data-s="${min}" aria-label="mehr">${ic("plus", 18)}</button></div>`;
    const sw = (act, k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" aria-label="${label}"></button>`;
    const WR = [["storm", "Sturm", "Ab dieser Windstärke oder Böe (km/h).", step("wxstep", "storm", "kmh", C.warn.storm.kmh, "km/h", 5)], ["thunder", "Gewitter und Hagel", "Wenn die Wetter-Entität Gewitter oder Hagel meldet.", ""], ["frost", "Frost", "Bei dieser Außentemperatur oder darunter.", step("wxstep", "frost", "temp", C.warn.frost.temp, "°C", 1)], ["heat", "Hitze", "Ab dieser Außentemperatur, zum Beispiel für Beschattung.", step("wxstep", "heat", "temp", C.warn.heat.temp, "°C", 1)], ["rain", "Starkregen", "Wenn die Wetter-Entität Starkregen meldet.", ""]];
    const windOpts = Object.keys(st).filter((e) => e.startsWith("sensor.") && (/(km\/h|m\/s|mph|kn)$/i.test(st[e].attributes.unit_of_measurement || "") || /wind/i.test(e)));
    const actOpts = Object.keys(st).filter((e) => /^(cover|switch|input_boolean|script|scene)\./.test(e));
    const svc = [...new Set([...Object.keys(((H.services || {}).notify) || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.notify.to])];
    const chip = (act, k, t, on, extra = "") => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" ${extra} aria-pressed="${!!on}">${t}</button>`;
    const acts = C.acts.map((x, i) => `<div class="rfv"><div class="vrow" style="margin:0"><span><b>${esc(this._wzName(x.ent))}</b><small class="mut" style="display:block">${esc(x.ent)}</small></span><button class="ibtn" data-act="wxsrm" data-i="${i}" aria-label="Aktion entfernen">${ic("trash", 18)}</button></div>
      <div class="mut sm" style="margin:6px 0 4px">Bei</div><div class="gschips">${Object.keys(NM).map((k) => chip("wxsaw", k, NM[k], x.warn === k, `data-i="${i}"`)).join("")}</div>
      <div class="mut sm" style="margin:6px 0 4px">Dann</div><div class="gschips">${this._wxsDo(x.ent).map(([k, t]) => chip("wxsad", k, t, x.do === k, `data-i="${i}"`)).join("")}</div>
      ${["cover", "switch", "input_boolean"].includes(String(x.ent).split(".")[0]) ? `<div class="vrow"><span>Danach zurück<small class="mut" style="display:block">Eine Viertelstunde nach Ende der Warnung wird der vorige Zustand wiederhergestellt.</small></span>${sw("wxsau", "", x.undo, "Danach zurück").replace('data-k=""', `data-i="${i}"`)}</div>` : ""}</div>`).join("");
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Wetter &amp; Warnungen</b><span>Einstellungen · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("alert", 15)}Warnstufen</div>
      ${WR.map(([k, t, h, ctl]) => `<div class="vrow"><span>${t}<small class="mut" style="display:block">${h}</small></span>${C.warn[k].on && ctl ? ctl : ""}${sw("wxsw", k, C.warn[k].on, t)}</div>`).join("")}
      <div class="lsec" style="margin-top:12px">${ic("sliders", 15)}Datenquellen</div>
      ${this._wxsAssign()}
      <div class="gst">${ic("info", 15)}<span>Weitere Dienste für Wetter und Warnungen findest du im <button class="lnk" data-act="wxsgoig">Store</button>.</span></div>
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Vorwarnung</div>
      <div class="vrow"><span>Warnung vorab melden<small class="mut" style="display:block">Aus der Stundenprognose der Wetter-Entität. Gilt für Sturm, Gewitter, Frost, Hitze und Starkregen.</small></span>${C.ahead.on ? step("wxsaheadh", "", "", C.ahead.hours, C.ahead.hours === 1 ? "Std." : "Std.", 1) : ""}${sw("wxsahead", "", C.ahead.on, "Vorwarnung")}</div>
      <div class="lsec" style="margin-top:12px">${ic("blinds", 15)}Aktionen bei einer Warnung</div>
      <div class="mut sm" style="margin:0 0 6px">Das Modul schaltet nur, was du hier auswählst: Rollläden, Markisen, Schalter, Skripte und Szenen. Eine Aktion läuft einmal, wenn die Warnung beginnt.</div>
      ${acts}${C.acts.length < 12 ? this._wzSel(actOpts, "", "wxsadd", "", "+ Aktion hinzufügen", /cover|markise|rollo|rolllad/i) : ""}
      <div class="lsec" style="margin-top:12px">${ic("window", 15)}Fenster-Erinnerung</div>
      <div class="vrow"><span>Offene Fenster melden<small class="mut" style="display:block">Nutzt die Fenster-Kontakte deiner Räume aus Modul 1. Die Meldung kommt einmal pro Warnung.</small></span>${sw("wxswin", "", C.win.on, "Fenster-Erinnerung")}</div>
      ${C.win.on ? `<div class="gschips">${["storm", "thunder", "rain"].map((k) => chip("wxswinw", k, NM[k], C.win.warn.includes(k))).join("")}</div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Benachrichtigung</div>
      ${[["start", "Warnung beginnt"], ["ahead", "Vorwarnung"], ["end", "Warnung endet"]].map(([k, t]) => `<div class="vrow"><span>${t}</span>${sw("wxsn", k, C.notify[k], t)}</div>`).join("")}
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("wxsns", esc(n), esc(n), C.notify.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}
      <div class="mut sm" style="margin:2px 0 6px">${C.notify.to.length ? `Gesendet wird an: ${C.notify.to.map(esc).join(", ")}.` : "Es ist noch kein Benachrichtigungsdienst gewählt."}</div>
      ${this._labFields("wx")}
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="wxstest" ${C.notify.to.length ? "" : "disabled"}>${ic("bell", 16)} Test senden</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _gaPage() {
    const st = this._hass.states, c = this._wxCfg(), wid = c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather."));
    const w = wid ? st[wid] : null, rainy = w && ["rainy", "pouring", "lightning-rainy", "snowy-rainy"].includes(w.state), pv = this._pvNow();
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Regen kommt aus deiner Wetter-Entität, der Überschuss aus den PV-Einstellungen von Modul 1.")}
      <div class="card"><h2>${ic("plant", 18)}Garten jetzt</h2><div class="lugrid">
        ${tile("Regen", w ? (rainy ? "Es regnet" : "Trocken") : "–", w ? (rainy ? "Bewässern nicht nötig" : "Kein Regen gemeldet") : "Keine Wetter-Entität gefunden")}
        ${tile("PV-Überschuss", pv != null ? wfmt(pv) : "–", pv != null ? (pv >= 500 ? "Genug zum Bewässern" : "Eher wenig") : "Noch kein Sensor gewählt")}
        ${tile("Zisterne", "–", "Füllstand-Sensor folgt")}</div></div>
      ${this._betaSoon("drop", "Regenprognose", "Bewässerung überspringen, wenn Regen erwartet wird")}
      ${this._betaSoon("tree", "Zisterne", "Füllstand anzeigen und auf Leitungswasser umschalten, wenn sie leer ist")}
      ${this._betaSoon("sun", "Bewässerung bei PV-Überschuss", "Pumpe oder Ventil starten, wenn genug Solarstrom übrig ist")}
      ${this._betaSoon("clock", "Zeitplan", "Bewässerungszeiten pro Zone mit Dauer und Wochentagen")}`;
  }
  _rbPage() {
    const h = this._hass, sun = h.states["sun.sun"], o = this._out(), el = sun ? Number(sun.attributes.elevation) : NaN, az = sun ? Number(sun.attributes.azimuth) : NaN;
    const dir = isFinite(az) ? ["Nord", "Nordost", "Ost", "Südost", "Süd", "Südwest", "West", "Nordwest"][Math.round(az / 45) % 8] : "";
    const tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Der Sonnenstand kommt aus der Sonnen-Entität von Home Assistant.")}
      <div class="card"><h2>${ic("sun", 18)}Sonne &amp; Wetter jetzt</h2><div class="lugrid">
        ${tile("Sonnenhöhe", isFinite(el) ? num(el, 0) + " °" : "–", isFinite(el) ? (el > 0 ? "Sonne über dem Horizont" : "Sonne unter dem Horizont") : "Keine Sonnen-Entität gefunden")}
        ${tile("Richtung", dir || "–", isFinite(az) ? num(az, 0) + " °" : "")}
        ${tile("Draußen", o.t != null ? num(o.t, 1) + " °C" : "–", o.rh != null ? num(o.rh) + " % Luftfeuchte" : "")}</div></div>
      ${this._betaSoon("blinds", "Rollläden steuern", "Zeitpläne, Sonnenstand und Fenster-Stellung")}
      ${this._betaSoon("sun", "Hitzeschutz im Sommer", "Beschatten, wenn die Sonne aufs Fenster scheint")}
      ${this._betaSoon("thermo", "Wärme nutzen im Winter", "Rollläden öffnen, wenn die Sonne mitheizt, und nachts schließen")}`;
  }
  _wpPage() {
    const o = this._out(), tile = (t, v, sub) => `<div class="luroom"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${sub}</span></div>`;
    return `${this._betaBox("Entitäten der Wärmepumpe wählst du später in den Einstellungen des Moduls.")}
      <div class="card"><h2>${ic("thermo", 18)}Außenbedingungen</h2><div class="lugrid">
        ${tile("Außentemperatur", o.t != null ? num(o.t, 1) + " °C" : "–", o.t != null && o.t < 7 ? "Abtauen wird wahrscheinlicher" : "Kaum Abtau-Bedarf")}
        ${tile("Luftfeuchte", o.rh != null ? num(o.rh) + " %" : "–", "Draußen")}</div></div>
      ${this._betaSoon("heatpump", "Laufzeit & Takten", "Starts, Laufzeit am Stück und Taktung erkennen")}
      ${this._betaSoon("thermo", "Vorlauf, Rücklauf & Effizienz", "Temperaturen, Spreizung und Leistungszahl (COP)")}
      ${this._betaSoon("snow", "Abtauen", "Abtauzyklen zählen und auswerten")}`;
  }
  _luPage() {
    const rooms = this._collect(), adm = this._admin();
    const cards = rooms.map((r) => { const a = this._airData(r); if (!a) return `<div class="luroom off"><b>${esc(r.name)}</b><span class="mut">Kein Luftfeuchte-Sensor</span></div>`;
      const [ml, mc] = MOLD[a.lvl], hc = a.rh >= 70 ? "red" : a.rh >= 60 ? "amber" : "green";
      return `<div class="luroom ${mc}"><b>${esc(r.name)}</b><span class="lv ${hc}">${num(a.rh)} %</span><span class="mut">Taupunkt ${num(a.td, 1)} °C · Schimmel ${ml}</span></div>`; }).join("");
    const soon = (ico, t, d) => `<div class="card lusoon">${ic(ico, 26)}<div><b>${t}</b><span class="mut">${d}</span></div><em class="beta">In Entwicklung</em></div>`;
    return `<div class="betabox">${ic("alert", 20)}<div><b>Beta-Version – dieses Modul ist noch in Entwicklung</b>Funktionen können sich ändern oder fehlen noch. Die Raumluft-Übersicht nutzt die Luftfeuchte-Sensoren aus Modul 1. Rückmeldungen helfen: <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Fehler oder Wunsch melden</a>.</div></div>
      <div class="card"><h2>${ic("drop", 18)}Raumluft-Übersicht</h2>${rooms.length ? `<div class="lugrid">${cards}</div>` : `<div class="mut sm">Noch keine Räume eingerichtet.</div>`}
        <div class="mut sm" style="margin:10px 0 0">Luftfeuchte, Taupunkt und Schimmelrisiko je Raum. Sensoren wählst du in den Raumeinstellungen von Modul 1.</div></div>
      ${soon("fan", "Lüftungsanlage (KWL)", "Stufen, Bypass und Filterwechsel schalten und überwachen")}
      ${soon("windy", "CO₂ & Luftqualität", "CO₂-Sensoren auswerten und Lüften empfehlen")}`;
  }
  /* Labs: experimentelle Funktionen. Ein/Aus und Werte stehen im Layout (layout.labs), gelten für alle Nutzer.
     Eingeschaltet erscheinen sie als Karte mit Labs-Zeichen im passenden Modul, ausgeschaltet sind sie dort komplett weg. */
  _labCfg() { const l = (this._cfg && this._cfg.layout && this._cfg.layout.labs) || {}; return { on: Array.isArray(l.on) ? l.on : [], icon: l.icon !== false, tab: l.tab !== false, cfg: l.cfg && typeof l.cfg === "object" ? l.cfg : {} }; }
  _labOn(id) { return this._labCfg().on.includes(id); }
  _labV(k) { const d = { lx_diff: 0.5, ae_cons: 12, ae_share: 60, wl_wind: 6, lf_days: 14, vh_dk: 3, vh_max: 90, dz_days: 14, dz_lead: 45, ld_wait: 3, ld_min: 8, lk_hi: 90, lk_dur: 2 }, v = this._labCfg().cfg[k]; return typeof v === "number" && isFinite(v) ? v : d[k]; }
  _labStr(k) { const v = this._labCfg().cfg[k]; return typeof v === "string" ? v : ""; }
  _labSet(patch) { const c = this._labCfg(); this._cfg.layout.labs = { on: c.on, icon: c.icon, tab: c.tab, cfg: c.cfg, ...patch }; this._saveLayout(); setTimeout(() => this._labLoad(true), 900); this._render(); if (this._modal) this._renderModal(); }
  _labPill(t = "Labs") { return `<em class="labp">${ic("flask", 11)}${t}</em>`; }
  /* Katalog: nur Funktionen, die etwas anzeigen */
  _labCat() {
    return this._labCat0().filter((x) => this._labVisible(x)).map((x) => ({ k: "s", ...x }));
  }
  /* Vorabversionen: ein Lab mit early: "JJJJ-MM-TT" sehen Sponsoren (Schalter „Vorabversionen zuerst“) vorher, alle anderen ab diesem Tag */
  _labEarlyTs(x) { if (!x.early) return 0; const t = new Date(x.early + "T00:00:00").getTime(); return isFinite(t) ? t : 0; }
  _labIsEarly(x) { return !!x.early && Date.now() < this._labEarlyTs(x); }
  _labVisible(x) { return !this._labIsEarly(x) || this._spnEarly(); }
  _labEarlyDate(x) { return new Date(this._labEarlyTs(x)).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }); }
  _labEarlyHidden() { return this._labCat0().filter((x) => !this._labVisible(x)); }
  _labCat0() {
    return [
      { id: "lx", mid: "fh", mod: "Modul 1", mn: "Fenster & Heizung", n: "Bester Lüftungszeitpunkt", st: "Test", i: "windy", soon: false,
        d: "Vergleicht Innen- und Außenluft und sagt, wann Stoßlüften gegen Feuchte und Schimmel am meisten bringt.",
        feats: ["Pro Raum: lohnt Lüften jetzt oder ist die Luft draußen feuchter?", "Zusammenfassung oben in Modul 1: in wie vielen Räumen Lüften sich lohnt", "Auf Wunsch eigene Schwelle für den Unterschied der absoluten Feuchte"],
        how: ["Aus Temperatur und Luftfeuchte wird die absolute Feuchte (g/m³) innen und außen berechnet.", "Ist es draußen um mehr als die eingestellte Schwelle trockener, lohnt Lüften.", "Die Außenwerte kommen aus der Wetter-Entität oder dem Außensensor aus den Einstellungen."],
        needs: () => [["Räume mit Luftfeuchte-Sensor und Thermostat", this._collect().some((r) => this._airData(r))], ["Außenwerte (Wetter-Entität oder Außensensor)", this._out().t != null]],
        f: [["lx_diff", "Unterschied der Feuchte", "Ab diesem Unterschied (g/m³) lohnt Lüften", "g/m³", 0.5, 4, 0.5]] },
      { id: "ae", mid: "en", mod: "Modul 3", mn: "Energie", n: "Autarkie-Prognose", st: "Test", i: "energy", soon: false,
        d: "Zeigt, wie viel Prozent deines Tagesverbrauchs heute voraussichtlich aus Solarstrom kommen.",
        feats: ["Voraussichtlicher Autarkie-Anteil für heute", "Nutzt die Prognose aus Modul 16"],
        how: ["Solarertrag der Prognose mal Anteil, den das Haus direkt nutzt, geteilt durch den Tagesverbrauch.", "Der Tagesverbrauch kommt aus dem gewählten Zeitraum von Modul 3 (7 oder 30 Tage), sonst aus deiner Angabe.", "Das ist eine grobe Schätzung. Sie ersetzt keine Messung."],
        needs: () => [["Modul 16 ist an und liefert eine Prognose", !!(this._mdState().on.sp && this._sp().found)], ["Modul 3 ist eingerichtet", this._enOn()]],
        f: [["ae_cons", "Täglicher Verbrauch", "Wird genutzt, wenn Modul 3 noch keinen Verlauf hat", "kWh", 3, 60, 1], ["ae_share", "Direkt genutzter Anteil", "Wie viel vom Solarstrom das Haus selbst nutzt", "%", 20, 95, 5]] },
      { id: "wl", mid: "wx", mod: "Modul 9", mn: "Wetter & Warnungen", n: "Wäsche-Wetter", st: "Test", i: "sun", soon: false,
        d: "Sagt, ob Wäsche heute draußen trocknet: Regen, Wind und Luftfeuchte auf einen Blick.",
        feats: ["Ampel: gut, geht so oder eher nicht", "Die drei Werte dahinter: Luftfeuchte, Wind, Niederschlag", "Eigene Mindest-Windstärke einstellbar"],
        how: ["Regen, Schnee, Hagel und Gewitter in der Wetter-Entität bedeuten „eher nicht“.", "Bis 75 % Luftfeuchte und ab der Mindest-Windstärke ist es „gut“, bis 85 % „geht so“.", "Die Werte kommen aus deiner Wetter-Entität (Modul 9 → Datenquellen)."],
        needs: () => [["Eine Wetter-Entität", Object.keys(this._hass.states).some((k) => k.startsWith("weather."))]],
        f: [["wl_wind", "Mindest-Wind", "Ab dieser Windstärke trocknet Wäsche gut", "km/h", 0, 25, 1]] },
      { id: "lf", mid: "sp", mod: "Modul 16", mn: "Solar-Prognose", n: "Lernfaktor für die Prognose", st: "Früh", i: "chart", soon: false,
        d: "Korrigiert die Prognose um die gelernte Abweichung deiner Anlage, zum Beispiel durch Verschattung.",
        feats: ["Gelernter Faktor aus Prognose gegen tatsächlichen Ertrag", "Korrigierte Prognose für heute", "Zeigt, wie viele Tage in den Faktor eingeflossen sind"],
        how: ["Aus den letzten Tagen: Summe des Ertrags geteilt durch Summe der Prognose.", "Der Faktor wird auf 0,5 bis 1,5 begrenzt. Er braucht mindestens 3 Tage Verlauf.", "Die korrigierte Prognose ist nur eine Anzeige. Andere Module nutzen weiter die Originalprognose."],
        needs: () => [["Modul 16 ist an und liefert eine Prognose", !!(this._mdState().on.sp && this._sp().found)], ["Ertragssensor in Modul 16 gewählt", !!this._sp().has_act]],
        f: [["lf_days", "Tage für den Faktor", "So viele Tage fließen in die Berechnung ein", "Tage", 3, 30, 1]] },
      { id: "vh", k: "g", mid: "fh", mod: "Modul 1", mn: "Fenster & Heizung", n: "Smart Vorheizen", st: "Test", i: "flame",
        d: "Der Heizplan startet früher, wenn die gelernte Aufheizzeit es nötig macht. Ziel: Der Raum ist pünktlich warm.",
        feats: ["Pro Raum: so viel früher würde der Heizplan starten", "Nutzt die gelernte Aufheizzeit aus dem Raumbericht", "Greift nur ein, wenn der Raum zum Schaltpunkt kälter ist als das Ziel"],
        how: ["Aus der gelernten Aufheizzeit (Kelvin pro Stunde) wird die Dauer für die gewünschte Erwärmung berechnet.", "Der Schaltpunkt des Heizplans wird um diese Dauer vorgezogen, höchstens um den eingestellten Wert.", "Fenster auf, Abwesend und Urlaub haben weiter Vorrang."],
        needs: () => [["Heizplan in mindestens einem Raum", this._collect().length > 0], ["Gelernte Aufheizzeit (nach ein paar Aufheizphasen)", this._collect().some((r) => { const d = this._learn[r.id]; return !!d; })]],
        f: [["vh_dk", "Aufheizen um", "So viel Grad soll der Raum bis zum Schaltpunkt gewinnen", "K", 1, 6, 0.5], ["vh_max", "Höchstens vorziehen", "Längster Vorlauf vor dem Schaltpunkt", "Min.", 15, 180, 15]] },
      { id: "dz", k: "g", mid: "ww", mod: "Modul 2", mn: "Warmwasser", n: "Duschzeiten lernen", st: "Früh", i: "drop",
        d: "Erkennt aus dem Speicherverlauf, wann du warmes Wasser brauchst, und heizt passend vor, statt nach festem Plan.",
        feats: ["Erkannte Zeiten mit hohem Verbrauch", "Vorheizen vor diesen Zeiten statt nach festem Zeitplan", "Der feste Zeitplan bleibt als Rückfall bestehen"],
        how: ["Aus dem Temperaturabfall im Speicher werden Zapfzeiten erkannt.", "Nach dem Lernzeitraum zeigt das Lab typische Zeiten für Wochentage und Wochenende.", "Der Erzeuger startet den eingestellten Vorlauf vor der Zeit. Ab 65 °C schaltet Modul 2 weiter immer ab."],
        needs: () => [["Speichersensor in Modul 2", !!this._mdState().ww.ent.top], ["Wärmeerzeuger in Modul 2", !!(this._mdState().ww.ent.src || this._mdState().ww.ent.rod)]],
        f: [["dz_days", "Lernzeitraum", "So viele Tage werden beobachtet", "Tage", 7, 30, 7], ["dz_lead", "Vorlauf", "So früh vor der Zeit wird aufgeheizt", "Min.", 15, 120, 15]] },
      { id: "ld", k: "g", mid: "ww", mod: "Modul 2", mn: "Warmwasser", n: "Legionellenschutz nach Sonne", st: "Test", i: "shield",
        d: "Verschiebt den wöchentlichen Lauf auf den sonnigeren Tag, damit er mit PV-Überschuss läuft.",
        feats: ["Vergleich der Prognose für den geplanten Tag mit dem Folgetag", "Vorschlag, den Lauf zu verschieben", "Nutzt die Prognose aus Modul 16"],
        how: ["Der Lauf bleibt am geplanten Tag, wenn die Prognose dort mindestens die Mindestmenge erreicht.", "Sonst wandert er auf den nächsten Tag mit besserer Prognose, höchstens um die eingestellten Tage.", "Ist der Schutz überfällig (mehr als 9 Tage), läuft er trotzdem sofort."],
        needs: () => [["Legionellenschutz in Modul 2 an", !!this._mdState().ww.leg.on], ["Modul 16 liefert eine Prognose", !!(this._mdState().on.sp && this._sp().found)]],
        f: [["ld_wait", "Höchstens verschieben", "Um so viele Tage darf der Lauf wandern", "Tage", 1, 5, 1], ["ld_min", "Mindestprognose", "Ab dieser Tagesprognose gilt ein Tag als sonnig", "kWh", 3, 30, 1]] },
      { id: "lk", k: "g", mid: "ev", mod: "Modul 8", mn: "Elektroauto & Wallbox", n: "Ladeziel nach Kalender", st: "Früh", i: "clock",
        d: "Setzt den Ziel-Ladestand nach Terminen im Home-Assistant-Kalender: längerer Termin, höheres Ziel.",
        feats: ["Nächster Termin aus deinem Kalender", "Vorschlag für den Ziel-Ladestand", "Der normale Ladeplan bleibt der Rückfall"],
        how: ["Das Lab liest den nächsten Termin der gewählten Kalender-Entität.", "Dauert er mindestens so lange wie eingestellt, gilt das höhere Ziel, sonst das Ziel aus dem Ladeplan.", "Geschaltet wird nur das Ziel, nicht der Ladevorgang selbst. Die Regelung von Modul 8 bleibt maßgeblich."],
        needs: () => [["Kalender in Home Assistant", Object.keys(this._hass.states).some((k) => k.startsWith("calendar."))], ["Wallbox-Regelung in Modul 8", !!(this._mdState().on.ev !== false)]],
        f: [["lk_cal", "Kalender", "Aus diesem Kalender wird der nächste Termin gelesen", "sel"], ["lk_hi", "Ziel bei langem Termin", "Ziel-Ladestand für lange Termine", "%", 60, 100, 10], ["lk_dur", "Als lang gilt ab", "Dauer des Termins", "Std.", 1, 6, 1]] },
      { id: "mm", k: "g", mid: "mu", mod: "Modul 17", mn: "Müllabfuhr", n: "Müllabfuhr", st: "Früh", i: "trash",
        d: "Neues Modul 17: Abholtermine aus deinem Abfallkalender, Tonnen-Ampel, Erinnerung am Vorabend, Ansage und Licht.",
        feats: ["Nächste Abholungen und Monatskalender für Rest, Bio, Papier und Gelben Sack", "Tonnen-Ampel: am Vorabend orange, nach dem Abhaken grün", "Nachricht aufs Handy zu einer Uhrzeit, die du einstellst", "Ansage über einen Lautsprecher und Licht in der Farbe der Tonne", "Hinweise bei verschobenen Terminen, Sturm und Frost", "Leerungen und Kosten im Jahr"],
        how: ["Die Termine liest das Modul aus einem Kalender von Home Assistant, zum Beispiel dem von waste_collection_schedule. Den Eintrag dafür gibt es im Store, solange dieses Lab an ist.", "Der Titel jedes Termins wird den Tonnen zugeordnet. Die Erkennungswörter kannst du in den Einstellungen ändern.", "Am Vorabend zur eingestellten Uhrzeit schickt das Modul die Nachricht, sagt sie an und schaltet das Licht, wenn du das eingeschaltet hast. Einmal pro Tag, und nur für Tonnen, die noch nicht als draußen markiert sind."],
        needs: () => [["Abfallkalender in Home Assistant (waste_collection_schedule)", this._muHasWcs()], ["Ein Kalender mit den Abholterminen", Object.keys(this._hass.states).some((k) => k.startsWith("calendar."))], ["Benachrichtigungsdienst für die Erinnerung (optional)", Object.keys((this._hass.services || {}).notify || {}).some((n) => !["send_message", "reload", "persistent_notification"].includes(n))]],
        after: "Ausgeschaltet verschwinden Modul 17 und der Eintrag „Abfallkalender“ im Store. Gesendet und geschaltet wird dann nichts mehr. Die Einstellungen bleiben gespeichert. Die Integration waste_collection_schedule selbst bleibt in Home Assistant installiert, sie entfernst du dort.",
        f: [] },
      { id: "sb", mid: "st", mod: "Startseite", mn: "", n: "Start-Bubbles", st: "Früh", i: "layers",
        d: "Runde Kurzinfos ganz oben auf der Startseite. Du wählst selbst, was sie zeigen: Wetter, Personen, Alarm, Solar, Batterie und mehr.",
        feats: ["Bis zu 8 runde Kurzinfos in einer Reihe, auf dem Handy wischbar", "Inhalt und Reihenfolge wählst du selbst", "Warnfarben: Gelb bei Hinweisen, Rot bei ausgelöstem Alarm", "Ein Tipp springt zur passenden Karte oder öffnet das Modul"],
        how: ["Die Bubbles lesen nur Werte, die Home Assistant und die Module schon haben. Es wird nichts geschaltet.", "Eine Bubble ohne Daten wird ausgelassen, zum Beispiel „Solar“, wenn Modul 3 nicht eingerichtet ist.", "Die Auswahl öffnest du auf der Startseite über Einstellungen oder Anpassen."],
        needs: () => [["Die Startseite ist eingeschaltet", this._hzOn()]],
        after: "Ausgeschaltet verschwindet die Bubble-Reihe von der Startseite. Deine Auswahl bleibt gespeichert.",
        f: [] },
      { id: "st", mid: "en", mod: "Modul 3", mn: "Energie", n: "Spartipp der Woche", st: "Früh", i: "tools", early: "2026-11-11",
        d: "Zeigt, welches Gerät in den letzten 7 Tagen am meisten Netzstrom brauchte und wann die Sonne es am günstigsten versorgt.",
        feats: ["Gerät mit dem größten Netzbezug der Woche", "Beste Sonnenzeit laut Prognose aus Modul 16", "Geschätzte Ersparnis pro Woche, wenn das Gerät dann läuft"],
        how: ["Aus dem Verlauf von Modul 4 wird der Netzbezug jedes Geräts der letzten 7 Tage addiert.", "Die ergiebigste Sonnenzeit kommt aus der Prognose von Modul 16, heute oder morgen.", "Ersparnis = Netzbezug mal (Strompreis minus Einspeisevergütung). Das ist eine Obergrenze, nicht jedes Gerät lässt sich verschieben."],
        needs: () => [["Modul 4 mit mindestens einem Gerät", this._gsState().devices.length > 0], ["Modul 16 liefert eine Prognose (für die Sonnenzeit)", !!(this._mdState().on.sp && this._sp().found)]],
        f: [] },
      { id: "li", k: "g", mid: "li", mod: "Modul 18", mn: "Licht & Lampen", n: "Licht & Lampen", st: "Früh", i: "lamp", early: "2026-11-11",
        d: "Neues Modul 18: alle Lampen aus Home Assistant nach Räumen, schalten, dimmen, Farbe und Szenen.",
        feats: ["Alle Lampen (light.*) nach Räumen aus deinen Home-Assistant-Bereichen", "Schalten, Helligkeit und Lichtfarbe, wenn die Lampe es kann", "Knöpfe für Gute Nacht, Ankommen und Gemütlich, verknüpfbar mit deinen Szenen oder Skripten, dazu „Alle aus“", "Hinweis, wenn Licht länger als eingestellt brennt (nicht, wenn ein Bewegungssensor im Raum etwas meldet)"],
        how: ["Die Seite liest die Lampen und Räume aus Home Assistant und schaltet nur, wenn du tippst. Es gibt keine Automatik.", "Die Szenenknöpfe rufen die Szene oder das Skript auf, das du in den Einstellungen verknüpfst. „Alle aus“ ist eingebaut und fragt vorher nach.", "Der Hinweis „Licht lange an“ rechnet ab dem letzten Schalten der Lampe."],
        needs: () => [["Lampen in Home Assistant (light.*)", Object.keys(this._hass.states).some((k) => k.startsWith("light."))], ["Räume (Bereiche) für die Lampen (optional)", Object.values(this._hass.entities || {}).some((e) => e && e.entity_id && e.entity_id.startsWith("light.") && (e.area_id || e.device_id))]],
        after: "Ausgeschaltet verschwindet Modul 18. Es wird nichts mehr geschaltet, die Einstellungen (verknüpfte Szenen, Räume) bleiben gespeichert. Eingeschaltete Lampen bleiben, wie sie sind.",
        f: [] },
      { id: "tg", k: "g", mid: "tg", mod: "Übergreifend", mn: "Tags & Karten", n: "Tags & Karten", st: "Früh", i: "nfc", early: "2026-11-11",
        d: "RFID-Karten und NFC-Sticker lösen feste Aktionen aus, zum Beispiel Abwesend, Warmwasser-Boost oder Licht aus.",
        feats: ["Karten oder Sticker anlernen: einmal an einen Leser halten, fertig", "Jeder Tag führt genau eine Aktion aus einer festen Liste aus, auch „Person ist zu Hause/unterwegs“", "Optional nur für bestimmte Personen und nur in einem Zeitfenster", "Rückmeldung per Handy-Nachricht, Ansage oder blinkendem Licht, dazu ein Protokoll"],
        how: ["Home Assistant meldet jeden Scan als Ereignis. Die Integration prüft die Kennung, Person und Zeit und führt dann die gewählte Aktion aus.", "Es gibt keine freien Dienstaufrufe, keine Alarm- und keine Türaktionen, weil sich Karten kopieren lassen.", "Doppelte Scans innerhalb von 3 Sekunden zählen einmal."],
        needs: () => [["Ein Leser, der Tags an Home Assistant meldet (Handy mit NFC, ESPHome PN532/RC522)", true]],
        after: "Ausgeschaltet reagiert kein Tag mehr. Die angelernten Tags bleiben gespeichert.",
        f: [] },
    ];
  }
  _labK(x) { return x.k === "g" ? ["Schaltet Geräte", "g"] : ["Nur Anzeige", "s"]; }
  _labMods() { return [...new Set(this._labCat().map((x) => x.mid))]; }
  _labCount(mid) { return this._labCat().filter((x) => this._labOn(x.id) && (!mid || x.mid === mid)).length; }
  _labBtn() {
    if (!this._admin() || !this._labCfg().icon) return "";
    const n = this._labCount();
    return `<button class="pillbtn sto lab" data-act="labopen" aria-label="Labs: experimentelle Funktionen" title="Labs">${ic("flask", 17)}${n ? `<i class="sdot ldot">${n}</i>` : ""}</button>`;
  }
  _labHdr(mid) { const n = this._labCount(mid); return n ? `<em class="labp">${ic("flask", 11)}${n} ${n === 1 ? "Lab" : "Labs"} aktiv</em>` : ""; }
  _labTab() {
    if (!this._admin() || !this._labCfg().tab) return "";
    const n = this._labCount();
    return `<button class="mtab labt" data-act="labopen" aria-label="Labs: experimentelle Funktionen">${ic("flask", 20)}<span><small>Experimentell</small><b>Labs</b></span>${n ? `<i class="sdot ldot">${n}</i>` : ""}</button>`;
  }
  /* Kennzeichnung im Modul */
  _labCard(x, body) {
    return `<div class="card labc"><em class="labp tr">${ic("flask", 11)}Labs</em><h2>${ic(x.i, 18)}${esc(x.n)}</h2>${body}<div class="labfoot"><span class="risk ${this._labK(x)[1]}">${this._labK(x)[0]}</span><span class="mut sm">Experimentell, kann sich ändern.</span>${this._admin() ? `<button class="lnk" data-act="labdet" data-k="${x.id}">Info</button>` : ""}</div></div>`;
  }
  _labField(label, hint, ctrl) { return `<div class="vrow labf"><span>${label} ${this._labPill()}${hint ? `<small class="mut" style="display:block">${hint}</small>` : ""}</span>${ctrl}</div>`; }
  _labStep(f, adm) {
    if (f[3] === "sel") { const cur = this._labStr(f[0]), H = this._hass.states, ids = Object.keys(H).filter((e) => e.startsWith("calendar.")); return `<select class="osel" style="max-width:55%;margin:0" data-f="labf_${f[0]}" aria-label="${esc(f[1])}" ${adm ? "" : "disabled"}><option value="">${ids.length ? "Bitte wählen" : "Kein Kalender gefunden"}</option>${ids.map((e) => `<option value="${esc(e)}" ${cur === e ? "selected" : ""}>${esc((H[e].attributes || {}).friendly_name || e)}</option>`).join("")}</select>`; }
    const [k, , , unit, lo, hi, st] = f, v = this._labV(k), t = (s) => `data-act="labstep" data-k="${k}" data-s="${s}" data-lo="${lo}" data-hi="${hi}" ${adm ? "" : "disabled"}`;
    return `<div class="step" style="flex:none"><button ${t(-st)} aria-label="weniger">${ic("minus", 18)}</button><b>${num(v, st < 1 ? 1 : 0)} ${unit}</b><button ${t(st)} aria-label="mehr">${ic("plus", 18)}</button></div>`;
  }
  /* Felder einer Funktion in den Einstellungen des Moduls (nur wenn die Funktion an ist) */
  _labFields(mid) {
    const adm = this._admin();
    return this._labCat().filter((x) => x.mid === mid && this._labOn(x.id) && x.f.length).map((x) => x.f.map((f) => this._labField(`${esc(x.n)}: ${esc(f[1])}`, esc(f[2]), this._labStep(f, adm))).join("")).join("");
  }
  /* Karten oben in der Seite des Moduls */
  _labCards(mid) {
    return this._labCat().filter((x) => x.mid === mid && !["mm", "sb", "li"].includes(x.id) && this._labOn(x.id) && !x.soon).map((x) => {
      let body = ""; try { body = this["_lab_" + x.id](); } catch (e) { body = `<div class="mut sm">Diese Funktion kann gerade nichts anzeigen.</div>`; }
      return this._labCard(x, body);
    }).join("");
  }
  _labTile(t, v, s, c = "") { return `<div class="luroom ${c}"><span class="mut">${t}</span><span class="lv">${v}</span><span class="mut">${s}</span></div>`; }
  _lab_lx() {
    const rooms = this._collect(), th = this._labV("lx_diff"), o = this._out(), rows = [];
    rooms.forEach((r) => { const a = this._airData(r); if (!a || o.t == null || o.rh == null) return; const d = absH(a.t, a.rh) - absH(o.t, o.rh); rows.push({ r, a, d, ok: d >= th }); });
    if (!rows.length) return `<div class="mut sm">Es fehlen Räume mit Luftfeuchte-Sensor oder die Außenwerte. Sensoren wählst du in den Raumeinstellungen.</div>`;
    const n = rows.filter((x) => x.ok).length;
    return `<div style="font-size:1.05rem;margin:2px 0 10px"><b>${n ? `Jetzt lüften lohnt in ${n} von ${rows.length} ${rows.length === 1 ? "Raum" : "Räumen"}` : "Jetzt lohnt Lüften nirgends"}</b><span class="mut sm" style="display:block">${n ? "Draußen ist die Luft trockener als drinnen." : "Draußen ist die Luft gerade genauso feucht oder feuchter."} Draußen ${num(o.t, 1)} °C, ${num(o.rh)} % Luftfeuchte.</span></div>
      <div class="lugrid">${rows.map((x) => this._labTile(esc(x.r.name), x.ok ? "Lüften lohnt" : "Warten", `${x.ok ? "Trockener draußen um " : "Feuchter draußen um "}${num(Math.abs(x.d), 1)} g/m³`, x.ok ? "green" : "amber")).join("")}</div>`;
  }
  _lab_ae() {
    this._spLoad(); const S = this._sp();
    if (!S.found) return `<div class="mut sm">Braucht Modul 16 mit einer Prognose. Richte dort Forecast.Solar oder einen Prognose-Sensor ein.</div>`;
    let cons = this._labV("ae_cons"), src = "deine Angabe";
    try { const s = this._enSum(); const rg = this._enState().range, n = rg === "week" ? 7 : rg === "month" ? 30 : 0; if (s && !s.empty && n && s.house > 0) { cons = s.house / n; src = `Verbrauchsmuster der letzten ${n} Tage`; } } catch (e) { /* Angabe nutzen */ }
    const share = this._labV("ae_share") / 100, pc = Math.min(100, Math.round(S.today * share / Math.max(cons, 0.1) * 100));
    return `<div class="lugrid">${this._labTile("Heute voraussichtlich", pc + " %", "aus Solar gedeckt")}${this._labTile("Prognose Solar", num(S.today, 1) + " kWh", "Modul 16")}${this._labTile("Tagesverbrauch", num(cons, 1) + " kWh", src)}</div>
      <div class="mut sm" style="margin-top:8px">Grobe Schätzung: ${Math.round(share * 100)} % des Solarstroms nutzt das Haus direkt. Für ein genaueres Muster stelle in Modul 3 den Zeitraum auf 7 oder 30 Tage.</div>`;
  }
  _lab_wl() {
    const w = Object.entries(this._hass.states).find(([k]) => k.startsWith("weather."));
    if (!w) return `<div class="mut sm">Es gibt keine Wetter-Entität in Home Assistant.</div>`;
    const a = w[1].attributes || {}, rh = a.humidity != null ? Number(a.humidity) : null, wind = a.wind_speed != null ? Number(a.wind_speed) : null, wet = ["rainy", "pouring", "lightning-rainy", "lightning", "snowy", "snowy-rainy", "hail"].includes(w[1].state), mw = this._labV("wl_wind");
    let lvl = 0; if (wet || (rh != null && rh > 85)) lvl = 2; else if ((rh != null && rh > 75) || (wind != null && wind < mw)) lvl = 1;
    const T = [["Gut", "Wäsche trocknet draußen gut.", "green"], ["Geht so", "Trocknet, aber langsamer.", "amber"], ["Eher nicht", wet ? "Es regnet oder ist nass." : "Zu feucht zum Trocknen.", "red"]][lvl];
    return `<div class="lugrid">${this._labTile("Wäsche draußen", T[0], T[1], T[2])}${this._labTile("Luftfeuchte", rh != null ? num(rh) + " %" : "–", "bis 75 % gut")}${this._labTile("Wind", wind != null ? num(wind, 0) + " km/h" : "–", `ab ${num(mw, 0)} km/h gut`)}${this._labTile("Niederschlag", wet ? "Ja" : "Nein", esc(w[1].state))}</div>`;
  }
  _lab_vh() {
    const rooms = this._collect(), dk = this._labV("vh_dk"), mx = this._labV("vh_max"), rows = [];
    rooms.forEach((r) => { const d = this._learnFor(r.id); if (d) rows.push({ r, lead: Math.min(mx, Math.round(dk / d.rate * 60)), rate: d.rate }); });
    if (!rows.length) return `<div class="mut sm">Noch keine gelernte Aufheizzeit. Sie entsteht nach ein paar Aufheizphasen und steht im Raumbericht.</div>`;
    return `<div class="lugrid">${rows.map((x) => this._labTile(esc(x.r.name), `${x.lead} Min. früher`, `+${num(dk, 1)} K bei ${num(x.rate, 1)} K/h`, x.lead >= mx ? "amber" : "green")).join("")}</div><div class="mut sm" style="margin-top:8px">So viel früher würde der Heizplan starten. Geschaltet wird nur, wenn der Raum zum Schaltpunkt kälter ist als das Ziel.</div>`;
  }
  _lab_st() {
    this._gsLoad(); this._spLoad();
    const G = this._gsState(), D = this._gsD;
    if (!G.devices.length) return `<div class="mut sm">Braucht Modul 4 mit mindestens einem Gerät, zum Beispiel Waschmaschine oder Trockner.</div>`;
    if (!D || !D.hist) return `<div class="mut sm">Der Verlauf wird geladen.</div>`;
    const d0 = new Date(Date.now() - 7 * 864e5), key = d0.getFullYear() + "-" + String(d0.getMonth() + 1).padStart(2, "0") + "-" + String(d0.getDate()).padStart(2, "0");
    const rows = (D.devices || []).map((v) => { const h = (D.hist[v.id] || []).filter((r) => r.d >= key); return { v, g: h.reduce((a, r) => a + (r.g || 0), 0), c: h.reduce((a, r) => a + (r.cost || 0), 0), n: h.length }; }).sort((a, b) => b.g - a.g);
    const top = rows[0];
    if (!top || top.g < 0.05) return `<div class="mut sm">In den letzten 7 Tagen gab es kaum Netzbezug bei deinen Geräten. Für einen Tipp braucht es ein paar Tage mit Verlauf.</div>`;
    const sav = top.g * Math.max(0, this._price() - this._feed()) / 100, S = this._sp(), b = S.found ? S.best : null, win = b ? `${b.from}:00 bis ${b.to}:00 Uhr` : "";
    return `<div class="lugrid">${this._labTile("Größter Netzbezug", esc(top.v.name), `${num(top.g, 1)} kWh in 7 Tagen · ${num(top.c, 2)} €`, "amber")}${this._labTile("Beste Sonnenzeit", win || "–", b ? `${S.best_day === "today" ? "heute" : "morgen"}, rund ${num(b.kwh, 1)} kWh Ertrag` : "Braucht Modul 16 mit Prognose")}${this._labTile("Mögliche Ersparnis", `bis zu ${num(sav, 2)} €`, "pro Woche, wenn es mit Sonne läuft", "green")}</div>
      <div class="mut sm" style="margin-top:8px"><b>Tipp:</b> Starte ${esc(top.v.name)}${win ? ` ${S.best_day === "today" ? "heute" : "morgen"} zwischen ${win}` : " zur sonnigsten Zeit"}, statt abends. Das ist eine Obergrenze: Nicht jeder Lauf lässt sich verschieben.</div>`;
  }
  _labLoad(force) {
    if (!this._hass || this._labBusy) return;
    if (!force && this._labD && Date.now() - this._labD.ts < 60000) return;
    this._labBusy = true;
    this._hass.callWS({ type: "fenster_heizung/labs_get" }).then((r) => { this._labD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._labD = { d: {}, ts: Date.now() }; })
      .finally(() => { this._labBusy = false; if (this._labShown()) { this._render(); if (this._modal && this._modal.type === "labdet") this._renderModal(); } });
  }
  _labShown() { return !this._stOpen && !this._igOpen && !this._ortOpen && (this._labOn("dz") || this._labOn("ld")) && (!!(this._modal && this._modal.type === "labdet") || this._labOpen || ["ww"].includes(this._mdActive())); }
  _labSnap() { return (this._labD && this._labD.d) || {}; }
  _lab_dz() {
    this._labLoad(); const S = this._labSnap().dz;
    if (!S) return `<div class="mut sm">Der Lernstand wird geladen.</div>`;
    const pct = Math.min(100, Math.round(S.seen / Math.max(1, S.need) * 100));
    const t = (a) => a && a.length ? a.join(", ") : "keine erkannt";
    return `<div class="lugrid">${this._labTile("Lernstand", `${S.seen} von ${S.need} Tagen`, S.ready ? "Lernzeit abgeschlossen" : "Das Modul beobachtet den Speicher", S.ready ? "green" : "amber")}${this._labTile("Werktags", S.ready ? t(S.wd) : "–", `${this._labV("dz_lead")} Min. Vorlauf`)}${this._labTile("Wochenende", S.ready ? t(S.we) : "–", "Rückfall: fester Zeitplan")}</div>
      <div class="mut sm" style="margin-top:8px">${S.ready ? "Vor diesen Zeiten heizt der Erzeuger auf die Temperatur des Zeitplans vor. Der feste Zeitplan bleibt zusätzlich bestehen." : `Noch wird nichts geschaltet. Nach ${S.need} Tagen mit Messwerten beginnt das Vorheizen.`} ${pct < 100 ? `(${pct} %)` : ""}</div>`;
  }
  _lab_ld() {
    this._labLoad(); const S = this._labSnap().ld;
    if (!S) return `<div class="mut sm">Der Stand wird geladen.</div>`;
    if (S.on_leg === false) return `<div class="mut sm">Der Legionellenschutz ist in Modul 2 ausgeschaltet.</div>`;
    if (S.found === false) return `<div class="mut sm">Braucht Modul 16 mit einer Prognose. Ohne sie läuft der Schutz wie geplant.</div>`;
    const plan = DAYS_LONG[S.plan_day], eff = DAYS_LONG[S.eff_day], min = this._labV("ld_min"), wait = this._labV("ld_wait");
    const msg = S.shift > 0 ? `Der Lauf wurde auf ${eff} verschoben, weil die Prognose am ${plan} unter ${num(min, 0)} kWh lag.` : `Am ${plan} um ${esc(S.time || "")} Uhr entscheidet das Lab: Reicht die Prognose (ab ${num(min, 0)} kWh), läuft der Schutz wie geplant, sonst am nächsten sonnigeren Tag, höchstens ${num(wait, 0)} Tage später.`;
    return `<div class="lugrid">${this._labTile("Geplant", plan, `${esc(S.time || "")} Uhr`)}${this._labTile("Läuft am", eff, S.shift > 0 ? `${S.shift} Tag${S.shift > 1 ? "e" : ""} verschoben` : "wie geplant", S.shift > 0 ? "amber" : "green")}${this._labTile("Prognose heute", S.today != null ? num(S.today, 1) + " kWh" : "–", "Modul 16")}${this._labTile("Prognose morgen", S.tomorrow != null ? num(S.tomorrow, 1) + " kWh" : "–", "Modul 16")}</div><div class="mut sm" style="margin-top:8px">${msg}</div>`;
  }
  _lab_lk() {
    const id = this._labStr("lk_cal"), st = id && this._hass.states[id];
    if (!st) return `<div class="mut sm">Wähle in der Infoseite einen Kalender.</div>`;
    const a = st.attributes || {}, t0 = a.start_time ? new Date(String(a.start_time).replace(" ", "T")) : null, t1 = a.end_time ? new Date(String(a.end_time).replace(" ", "T")) : null;
    if (!a.message || !t0 || isNaN(t0)) return `<div class="mut sm">Im Kalender steht kein kommender Termin.</div>`;
    const h = t1 && !isNaN(t1) ? (t1 - t0) / 36e5 : 0, long = h >= this._labV("lk_dur"), base = (this._wb() || {}).planSoc || 80, goal = long ? Math.max(base, this._labV("lk_hi")) : base;
    return `<div class="lugrid">${this._labTile("Nächster Termin", esc(String(a.message).slice(0, 28)), t0.toLocaleString("de-DE", { weekday: "short", hour: "2-digit", minute: "2-digit" }))}${this._labTile("Dauer", num(h, 1) + " Std.", long ? "gilt als lang" : "gilt als kurz")}${this._labTile("Ziel-Ladestand", goal + " %", long ? `statt ${base} % im Ladeplan` : "wie im Ladeplan", long ? "amber" : "green")}</div>`;
  }
  _lab_lf() {
    this._spLoad(); const S = this._sp();
    if (!S.found) return `<div class="mut sm">Braucht Modul 16 mit einer Prognose.</div>`;
    const days = (S.hist || []).filter((x) => x.f > 0 && x.a != null).slice(-this._labV("lf_days"));
    if (days.length < 3) return `<div class="mut sm">Noch zu wenig Verlauf: ${days.length} von mindestens 3 Tagen mit Prognose und Ertrag. Wähle in Modul 16 einen Ertragssensor, dann lernt die Funktion mit.</div>`;
    const f = Math.min(1.5, Math.max(0.5, days.reduce((s, x) => s + x.a, 0) / days.reduce((s, x) => s + x.f, 0)));
    return `<div class="lugrid">${this._labTile("Gelernter Faktor", num(f, 2), `aus ${days.length} Tagen`)}${this._labTile("Prognose heute", num(S.today, 1) + " kWh", "Original")}${this._labTile("Korrigiert", num(S.today * f, 1) + " kWh", f < 1 ? "Anlage liefert weniger als die Prognose" : f > 1 ? "Anlage liefert mehr als die Prognose" : "Prognose passt", f < 1 ? "amber" : "green")}</div>`;
  }
  /* Seite „Labs“ (Karten wie im Store) */
  _lab0() { if (!this._labS) this._labS = { c: "all" }; return this._labS; }
  _labCardEl(x) {
    const on = this._labOn(x.id), adm = this._admin();
    return `<div class="labk ${on ? "on" : ""} ${x.soon ? "soon" : ""}"><div class="labkt"><span class="ico">${ic(x.i, 22)}</span>${x.soon ? `<em class="risk">Bald</em>` : `<button class="sw ${on ? "on" : ""}" data-act="labtog" data-k="${x.id}" aria-pressed="${on}" aria-label="${esc(x.n)} ${on ? "ausschalten" : "einschalten"}" ${adm ? "" : "disabled"}></button>`}</div>
      <button class="labkb" data-act="labdet" data-k="${x.id}"><b>${esc(x.n)}</b><span>${esc(x.d)}</span><span class="labtg"><em class="mod">${esc(x.mod)}</em><em class="risk ${this._labK(x)[1]}">${this._labK(x)[0]}</em><em class="risk">${esc(x.st)}</em>${this._labIsEarly(x) ? `<em class="risk vab">Vorab bis ${this._labEarlyDate(x)}</em>` : ""}</span></button></div>`;
  }
  _labRender() {
    const sr = this.shadowRoot, mainEl = sr.getElementById("main"), st = this._lab0(), cat = this._labCat(), n = this._labCount();
    const chips = [["all", `Alle (${cat.length})`], ["on", `Eingeschaltet (${n})`], ["s", "Nur Anzeige"], ["g", "Schaltet Geräte"], ...this._labMods().map((m) => [m, cat.find((x) => x.mid === m).mod])];
    const vis = cat.filter((x) => st.c === "all" || (st.c === "on" ? this._labOn(x.id) : st.c === "s" || st.c === "g" ? x.k === st.c : x.mid === st.c));
    mainEl.innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>Labs</b><span><em class="tag">Experimentelle Funktionen</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        <button class="pillbtn" data-act="labset" aria-label="Labs anzeigen">${ic("sliders", 16)}<span class="bl">Anzeige</span></button>
        <button class="pillbtn" data-act="laboff" ${n ? "" : "disabled"}>${ic("close", 16)}<span class="bl">Alle Labs aus</span></button>
        <button class="pillbtn pri" data-act="labback">${ic("check", 16)}<span class="bl">Fertig</span></button></div>
      <div class="wrap"><div class="sxw stow">
        <div class="labban">${ic("flask", 22)}<div><b>Labs sind Experimente</b>Sie funktionieren schon, sind aber noch nicht überall erprobt. Eingeschaltet erscheinen sie im passenden Modul mit dem Zeichen <em class="labp">${ic("flask", 11)}Labs</em>. Ausgeschaltet sind sie dort wieder weg.</div></div>
        <div class="stoch">${chips.map(([k, t]) => `<button class="${st.c === k ? "on" : ""}" data-act="labc" data-k="${k}" aria-pressed="${st.c === k}">${esc(t)}</button>`).join("")}</div>
        ${(() => { const ear = vis.filter((x) => this._labIsEarly(x)), rest = vis.filter((x) => !this._labIsEarly(x)); return `${ear.length ? `<div class="labsec">${ic("heart", 15)}Vorabversion für Sponsoren</div><div class="stog">${ear.map((x) => this._labCardEl(x)).join("")}</div>${rest.length ? `<div class="labsec" style="margin-top:14px">${ic("flask", 15)}Für alle</div>` : ""}` : ""}${rest.length ? `<div class="stog">${rest.map((x) => this._labCardEl(x)).join("")}</div>` : ear.length ? "" : `<div class="card empty">${ic("flask", 30)}<div style="margin-top:8px">Noch nichts eingeschaltet.</div></div>`}`; })()}
        ${this._labTease()}
        <div class="mut sm" style="margin:14px 2px">Ideen und Fehler gern auf <a href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">GitHub</a> melden. Eine Funktion kann sich ändern, später fest eingebaut werden oder wieder entfallen.</div></div></div>`;
  }
  /* Hinweis auf Vorabversionen, die man (noch) nicht sieht */
  _labTease() {
    const h = this._labEarlyHidden(); if (!h.length) return "";
    const sp = this._spnS(), ea = this._labEarlyDate(h.slice().sort((a, b) => this._labEarlyTs(a) - this._labEarlyTs(b))[0]);
    return `<div class="labtease">${ic("heart", 20)}<div><b>${h.length} ${h.length === 1 ? "Vorabversion" : "Vorabversionen"} für Sponsoren</b><span>${h.map((x) => esc(x.n)).join(", ")}. ${sp.active ? "Schalte im Sponsor-Bereich „Vorabversionen zuerst“ ein, um sie schon jetzt zu sehen." : `Sponsoren sehen neue Labs ein bis zwei Wochen früher. Für alle ab ${ea}.`}</span></div><button class="btn2" data-act="spnopen">${ic("heart", 15)} ${sp.active ? "Sponsor-Bereich" : "Sponsor werden"}</button></div>`;
  }
  /* Infoseite einer Funktion */
  _labModal(id) {
    const x = this._labCat().find((y) => y.id === id); if (!x) return "";
    const on = this._labOn(id), adm = this._admin(), nd = x.needs();
    return `<div class="ov" data-act="close"></div><div class="sheet wide stosh" role="dialog" aria-modal="true">
      <div class="stohd"><span class="stoi big labi">${ic(x.i, 38)}</span><div><b>${esc(x.n)}</b><small>Labs · ${esc(x.mod)} ${esc(x.mn)}</small><div class="stoact">${x.soon ? `<span class="risk">In Vorbereitung</span>` : `<button class="btn2 pri" data-act="labtog" data-k="${x.id}" ${adm ? "" : "disabled"}>${on ? "Ausschalten" : "Einschalten"}</button>${on ? `<span class="stos ok">● Eingeschaltet</span>` : ""}`}</div></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">${esc(x.d)}</div>
      <div class="stofa"><div><b>${esc(x.mod)}</b><small>wird angezeigt in</small></div><div><b>${this._labK(x)[0]}</b><small>Art</small></div><div><b>${esc(x.st)}${this._labIsEarly(x) ? ` · Vorab bis ${this._labEarlyDate(x)}` : ""}</b><small>Stand</small></div></div>
      <div class="lsec">${ic("check", 15)}Was du bekommst</div><ul class="stoul">${x.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      ${x.soon ? "" : `<div class="lsec">${ic("tools", 15)}So wird gerechnet</div>${x.how.map((t, n) => `<div class="stost"><b>${n + 1}</b><span>${esc(t)}</span></div>`).join("")}`}
      ${nd.length ? `<div class="lsec">${ic("info", 15)}Voraussetzungen</div><ul class="stoul">${nd.map(([t, ok]) => `<li>${ok ? "✓" : "✗"} ${esc(t)}</li>`).join("")}</ul>` : ""}
      ${x.f.length ? `<div class="lsec">${ic("sliders", 15)}Einstellungen dieser Funktion</div>${x.f.map((f) => this._labField(esc(f[1]), esc(f[2]), this._labStep(f, adm))).join("")}` : ""}
      <div class="stowarn ${x.k === "g" ? "dng" : ""}">${ic("alert", 16)}<span>${x.k === "g" ? `<b>Diese Funktion greift in Geräte ein.</b> Du bestätigst das vor dem Einschalten. Ausgeschaltet schaltet sie nichts mehr. Fenster auf, Abwesend und die Sicherheitsgrenzen der Module haben weiter Vorrang.` : `Labs sind Experimente. Diese Funktion zeigt nur etwas an und schaltet nichts.`} ${x.after ? esc(x.after) : `Ausgeschaltet verschwindet sie aus ${esc(x.mod)}, die Einstellungen bleiben gespeichert.`}</span></div>
      <div class="foot2" style="margin-top:12px">${x.id === "tg" && on && adm ? `<button class="btn2" data-act="tgxopen">Tags verwalten</button>` : ""}<a class="btn2" href="https://github.com/Maddog3010/ha-fenster-heizung/issues" target="_blank" rel="noopener">Rückmeldung geben</a><button class="btn2" data-act="close">Schließen</button></div></div>`;
  }
  _labOkModal(id) {
    const x = this._labCat().find((y) => y.id === id); if (!x) return "";
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${esc(x.n)} einschalten?</b><span>Labs · ${esc(x.mod)}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="stowarn dng">${ic("alert", 16)}<span><b>Diese Funktion greift in Geräte ein.</b> Sie ist ein Experiment und noch nicht überall erprobt.</span></div>
      <ul class="stoul">${x.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <div class="mut sm">Beobachte die ersten Tage, ob alles wie gewünscht reagiert. Mit „Alle Labs aus“ ist sie sofort wieder aus.</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="labgo" data-k="${esc(id)}">Einschalten</button></div></div>`;
  }
  _labChange(t) {
    const k = String(t.dataset.f || "").replace("labf_", ""), c = this._labCfg();
    if (!/^lk_cal$/.test(k)) return false;
    this._labSet({ cfg: { ...c.cfg, [k]: t.value } }); return true;
  }
  _labSetModal() {
    const t = this._labCfg();
    return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Labs anzeigen</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="mut sm" style="margin:0 0 8px">Die Labs-Seite bleibt immer unter Einstellungen → Allgemein erreichbar. Hier schaltest du die zusätzlichen Zugänge einzeln ein oder aus.</div>
      <div class="ltog"><span><b>Labs-Symbol im Kopf</b><br><small class="mut">Kolben-Symbol neben dem Store, mit Zähler für eingeschaltete Labs</small></span><button class="sw ${t.icon ? "on" : ""}" data-act="labtz" data-k="icon" aria-pressed="${t.icon}" aria-label="Labs-Symbol im Kopf"></button></div>
      <div class="ltog"><span><b>Tab „Labs“ in der Modul-Leiste</b><br><small class="mut">Am Ende der Leiste, neben dem Store</small></span><button class="sw ${t.tab ? "on" : ""}" data-act="labtz" data-k="tab" aria-pressed="${t.tab}" aria-label="Tab Labs in der Modul-Leiste"></button></div>
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _labAct(a, b) {
    const k = b.dataset.k;
    if (a === "labopen") { this._labOpen = true; this._igOpen = false; this._stOpen = false; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "labback") { this._labOpen = false; this._render(); }
    else if (a === "labc") { this._lab0().c = k; this._render(); }
    else if (a === "labdet") { this._modal = { type: "labdet", id: k }; this._renderModal(); }
    else if (a === "labset") { this._modal = { type: "labset" }; this._renderModal(); }
    else if (a === "labtz") { const c = this._labCfg(); this._labSet({ [k]: !c[k] }); }
    else if (a === "labtog") { const c = this._labCfg(), x = this._labCat().find((y) => y.id === k); if (!x || x.soon) return; if (x.k === "g" && !c.on.includes(k)) { this._modal = { type: "labok", id: k }; this._renderModal(); return; } this._labSet({ on: c.on.includes(k) ? c.on.filter((y) => y !== k) : [...c.on, k] }); }
    else if (a === "labgo") { const c = this._labCfg(); this._modal = null; this._labSet({ on: c.on.includes(k) ? c.on : [...c.on, k] }); this._renderModal(); }
    else if (a === "laboff") { this._labSet({ on: [] }); this._toast("Alle Labs sind aus"); }
    else if (a === "labstep") { const c = this._labCfg(), v = Math.min(Number(b.dataset.hi), Math.max(Number(b.dataset.lo), Math.round((this._labV(k) + Number(b.dataset.s)) * 100) / 100)); this._labSet({ cfg: { ...c.cfg, [k]: v } }); }
  }
  /* Modul 17: Müllabfuhr (Labs). Termine, Ampel, Erinnerung, Ansage und Licht laufen im Backend (muell.py).
     Das Modul gibt es nur, solange das Lab „Müllabfuhr“ (mm) an ist. Ausgeschaltet verschwinden Modul und Store-Eintrag. */
  _muDef() { return { cal: "", time: "18:30", bins: { rest: { on: true, match: "rest,hausmüll,hausmuell,schwarz" }, bio: { on: true, match: "bio" }, papier: { on: true, match: "papier,pappe,blau" }, gelb: { on: true, match: "gelb,wertstoff,verpackung,lvp" } }, push: { on: false, to: [] }, cost: { on: false, fee: 0, incl: 0 }, wx: true, tts: { on: false, ent: "", player: "", text: "Morgen wird {tonnen} abgeholt." }, light: { on: false, ent: "" } }; }
  _mu() {
    const d = (this._muD && this._muD.d) || {}, df = this._muDef(), c = d.cfg || {};
    return { ...d, cfg: { ...df, ...c, bins: Object.fromEntries(Object.keys(df.bins).map((k) => [k, { ...df.bins[k], ...((c.bins || {})[k] || {}) }])), push: { ...df.push, ...(c.push || {}) }, cost: { ...df.cost, ...(c.cost || {}) }, tts: { ...df.tts, ...(c.tts || {}) }, light: { ...df.light, ...(c.light || {}) } } };
  }
  _muLoad(force) {
    if (!this._hass || this._muBusy) return;
    if (!force && this._muD && Date.now() - this._muD.ts < 20000) return;
    this._muBusy = true;
    this._hass.callWS({ type: "fenster_heizung/mu_get" }).then((r) => { if (!this._muT) this._muD = { d: r || {}, ts: Date.now() }; }).catch(() => { this._muD = { d: { error: "Keine Antwort von Home Assistant" }, ts: Date.now() }; })
      .finally(() => { this._muBusy = false; if (this._muVisible()) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); } });
  }
  _muVisible() { return !!(this._modal && this._modal.type === "muset") || (!!this._mdActive && this._mdActive() === "mu" && !this._stOpen && !this._igOpen && !this._labOpen); }
  _muHasWcs() { return Object.values(this._hass.entities || {}).some((e) => e && e.platform === "waste_collection_schedule"); }
  _muSave(cfg, quiet) {
    const s = this._mu(); this._muD = { d: { ...s, cfg }, ts: Date.now() };
    clearTimeout(this._muT);
    this._muT = setTimeout(() => {
      this._muT = null;
      this._hass.callWS({ type: "fenster_heizung/mu_set", cfg: this._mu().cfg }).then((r) => { this._muD = { d: r || {}, ts: Date.now() }; if (this._muVisible() && !this._muQuiet) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); } })
        .catch(() => this._toast("Die Einstellung konnte nicht gespeichert werden"));
    }, 500);
    this._muQuiet = !!quiet;
    if (!quiet) { this._render(); if (this._modal && this._modal.type === "muset") this._renderModal(); }
  }
  _muPatch(fn, quiet) { const c = JSON.parse(JSON.stringify(this._mu().cfg)); fn(c); this._muSave(c, quiet); }
  _muCall(act, bin) { this._hass.callWS({ type: "fenster_heizung/mu_act", act, ...(bin ? { bin } : {}) }).then((r) => { this._muD = { d: r || {}, ts: Date.now() }; this._render(); }).catch(() => this._toast("Das hat nicht geklappt")); }
  _muDate(iso) { return iso ? new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) : ""; }
  _muWhen(d) { return d == null ? "" : d === 0 ? "heute" : d === 1 ? "morgen" : `in ${d} Tagen`; }
  _muxAct(a, b) {
    const k = b.dataset.k;
    if (a === "muxopen") { this._muLoad(true); this._modal = { type: "muset" }; this._renderModal(); return; }
    if (a === "muxdone") { this._muCall("done", k); return; }
    if (a === "muxundo") { this._muCall("undo", k); return; }
    if (a === "muxsnooze") { this._muCall("snooze"); this._toast("Ich erinnere in einer Stunde noch einmal"); return; }
    if (a === "muxtest") { this._hass.callWS({ type: "fenster_heizung/mu_test" }).then((r) => this._toast(r && r.sent ? `Test an ${r.sent} ${r.sent === 1 ? "Dienst" : "Diensten"} gesendet` : "Kein Benachrichtigungsdienst gewählt")).catch(() => this._toast("Test fehlgeschlagen")); return; }
    if (a === "muxhide") { const h = this._muLay().hidden; this._muLaySave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "muxreset") { this._muLaySave({ order: Object.keys(MU_NAMES), hidden: [] }); this._toast("Anordnung zurückgesetzt"); return; }
    if (a === "muxstore") { this._modal = null; this._renderModal(); this._sto = { q: "", c: "haus" }; this._igOpen = true; this._labOpen = false; this._render(); return; }
    this._muPatch((c) => {
      if (a === "muxsw") { if (k.startsWith("bin:")) c.bins[k.slice(4)].on = !c.bins[k.slice(4)].on; else if (k === "push") c.push.on = !c.push.on; else if (k === "tts") c.tts.on = !c.tts.on; else if (k === "light") c.light.on = !c.light.on; else if (k === "cost") c.cost.on = !c.cost.on; else if (k === "wx") c.wx = !c.wx; }
      else if (a === "muxns") c.push.to = c.push.to.includes(k) ? c.push.to.filter((x) => x !== k) : [...c.push.to, k];
    });
  }
  _muxChange(t) {
    const f = t.dataset.f, k = t.dataset.k, v = t.value || "";
    if (f === "muxsel") { this._muPatch((c) => { if (k === "cal") c.cal = v; else if (k === "tts_ent") c.tts.ent = v; else if (k === "tts_player") c.tts.player = v; else if (k === "light") c.light.ent = v; }); return true; }
    if (f === "muxtime") { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) this._muPatch((c) => { c.time = v; }, true); return true; }
    if (f === "muxmatch") { this._muPatch((c) => { c.bins[k].match = v; }, true); return true; }
    if (f === "muxtext") { this._muPatch((c) => { c.tts.text = v; }, true); return true; }
    if (f === "muxnum") { const n = Number(String(v).replace(",", ".")); if (isFinite(n)) this._muPatch((c) => { c.cost[k] = Math.max(0, n); }, true); return true; }
    return false;
  }
  _muSetupCard(S) {
    const none = !S.cal;
    return `<div class="card"><h2>${ic("trash", 18)}${none ? "Noch kein Abfallkalender" : "Kalender liefert keine Termine"}</h2>
      <div class="mut sm" style="margin:0 0 10px">${none ? "Modul 17 liest die Abholtermine aus einem Kalender von Home Assistant. Am einfachsten geht das mit der Integration waste_collection_schedule, sie kennt viele Entsorger." : esc(S.error || "Bitte einen anderen Kalender wählen.")}</div>
      ${none ? `<div class="stost"><b>1</b><span>Im Store „Abfallkalender“ öffnen und einrichten</span></div><div class="stost"><b>2</b><span>Dort deinen Entsorger wählen, es entsteht ein Kalender</span></div><div class="stost"><b>3</b><span>Hier erscheint er automatisch, oder du wählst ihn in den Einstellungen</span></div>` : ""}
      <div class="gbtns" style="margin-top:10px">${this._admin() ? `<button class="btn2 pri" data-act="muxstore">${ic("puzzle", 16)} Zum Store</button><button class="btn2" data-act="muxopen">${ic("sliders", 16)} Einstellungen</button>` : `<span class="mut sm">Das richtet ein Administrator ein.</span>`}</div></div>`;
  }
  _muPage() {
    this._muLoad(); const S = this._mu(), C = S.cfg, adm = this._admin();
    const banner = `<div class="labban">${ic("flask", 22)}<div><b>Labs · Müllabfuhr</b>Dieses Modul ist ein Experiment und nur da, solange das Lab eingeschaltet ist. Die Termine kommen aus deinem Abfallkalender, die Erinnerungen laufen im Hintergrund.</div></div>`;
    if (!S.on) return `${banner}<div class="card empty">${S.error ? esc(S.error) : "Lädt …"}</div>`;
    if (!S.cal || (S.error && !(S.bins || []).some((x) => x.next))) return `${banner}${this._muSetupCard(S)}`;
    const rows = S.bins || [], due = rows.filter((x) => ["out", "today"].includes(x.state)), up = rows.filter((x) => x.next);
    const lbl = { out: "raus!", today: "heute", soon: "morgen", ok: "ok", done: "draußen", none: "–" };
    const tile = (x) => { const tap = ["out", "today", "soon"].includes(x.state) ? "muxdone" : x.state === "done" ? "muxundo" : ""; return `<${tap ? `button data-act="${tap}" data-k="${x.k}"` : "div"} class="mubin ${x.state}" ${tap ? `aria-label="${esc(x.name)}: ${tap === "muxdone" ? "steht draußen" : "wieder zurücknehmen"}"` : ""}><i class="bin" style="background:${x.color}"></i><b>${esc(x.name)}</b><small>${lbl[x.state]}</small></${tap ? "button" : "div"}>`; };
    const head = due.length ? `<div class="mulead"><b>${due.some((x) => x.state === "today") ? "Heute wird abgeholt" : "Morgen wird abgeholt"}</b><span>${due.map((x) => esc(x.name)).join(", ")}. Tippe auf die Tonne, wenn sie draußen steht.</span></div>` : `<div class="mulead ok"><b>Nichts zu tun</b><span>${up[0] ? `Als Nächstes: ${esc(up[0].name)}, ${this._muWhen(up[0].days)}.` : "Keine Termine in den nächsten Wochen."}</span></div>`;
    const ampel = `<div class="card"><h2>${ic("trash", 18)}Tonnen</h2>${head}<div class="mugrid">${rows.map(tile).join("")}</div>${C.push.on && due.some((x) => x.state === "out") ? `<div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="muxsnooze">${ic("clock", 16)} Später erinnern</button></div>` : ""}</div>`;
    const next = `<div class="card"><h2>${ic("clock", 18)}Nächste Abholungen</h2><div class="wxl">${up.map((x) => `<div class="wxr ${x.days <= 1 ? "hot" : ""}"><span class="wxi"><i class="bin sm" style="background:${x.color}"></i></span><div class="wxm"><div class="wxt"><b>${esc(x.name)}</b><em>${this._muWhen(x.days)}</em></div><small>${this._muDate(x.next)}</small></div></div>`).join("") || `<div class="mut sm">Keine Termine gefunden.</div>`}</div></div>`;
    const M = S.month || {}, first = (new Date(M.y || 2026, (M.m || 1) - 1, 1).getDay() + 6) % 7, n = new Date(M.y || 2026, M.m || 1, 0).getDate(), col = Object.fromEntries(rows.map((x) => [x.k, x.color]));
    const cells = [...Array(first).fill(`<i class="mucd e"></i>`), ...Array.from({ length: n }, (_, i) => { const d = i + 1, bs = (M.d || {})[d] || []; return `<i class="mucd ${d === M.today ? "today" : ""}"><b>${d}</b><span>${bs.map((k) => `<u style="background:${col[k] || "#999"}"></u>`).join("")}</span></i>`; })];
    const mon = new Date(M.y || 2026, (M.m || 1) - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    const cal = `<div class="card"><h2>${ic("today", 18)}${esc(mon)}</h2><div class="mucal">${DAYS_SHORT_MU.map((d) => `<em>${d}</em>`).join("")}${cells.join("")}</div></div>`;
    const notes = S.notes || [], nt = `<div class="card"><h2>${ic("info", 18)}Hinweise</h2>${notes.length ? `<div class="wxl">${notes.map((x) => `<div class="wxr hot"><span class="wxi">${ic(x.k === "storm" ? "windy" : x.k === "frost" ? "snow" : "alert", 18)}</span><div class="wxm"><small>${esc(x.text)}</small></div></div>`).join("")}</div>` : `<div class="mut sm">Keine Verschiebung und keine Wetterwarnung für die nächsten Abholungen.${C.wx ? "" : " Wetter-Hinweise sind aus."}</div>`}</div>`;
    const info = (ico, t, txt, on) => `<div class="wxr ${on ? "" : "off"}"><span class="wxi">${ic(ico, 18)}</span><div class="wxm"><div class="wxt"><b>${t}</b><em>${on ? "An" : "Aus"}</em></div><small>${txt}</small></div></div>`;
    const nTo = C.push.to.length, tn = (e) => esc(this._wzName(e) || e);
    const rem = `<div class="card"><h2>${ic("bell", 18)}Erinnerung am Vorabend</h2><div class="wxl">
      ${info("bell", "Nachricht aufs Handy", C.push.on ? (nTo ? `Um ${esc(C.time)} Uhr an ${nTo} ${nTo === 1 ? "Dienst" : "Dienste"}.` : "An, aber noch kein Dienst gewählt (Einstellungen).") : "Aus. In den Einstellungen einschalten.", C.push.on)}
      ${info("music", "Ansage", C.tts.on && C.tts.ent && C.tts.player ? `Sprachausgabe auf ${tn(C.tts.player)} um ${esc(C.time)} Uhr.` : "Sprachausgabe über einen Lautsprecher, zum Beispiel im Flur.", C.tts.on && !!C.tts.ent && !!C.tts.player)}
      ${info("lamp", "Licht", C.light.on && C.light.ent ? `${tn(C.light.ent)} leuchtet in der Farbe der Tonne ab ${esc(C.time)} Uhr${S.light_on ? " (jetzt an)" : ""}, bis sie als draußen markiert ist.` : "Ein Licht in der Farbe der Tonne, bis sie draußen steht.", C.light.on && !!C.light.ent)}</div>
      ${adm ? `<div class="gbtns" style="margin-top:8px"><button class="btn2" data-act="muxopen">${ic("sliders", 16)} Einstellungen</button></div>` : ""}</div>`;
    let cost = ""; if (C.cost.on && S.stats) { const s = S.stats; cost = `<div class="card"><h2>${ic("chart", 18)}Restmüll ${s.year}: Leerungen und Kosten</h2><div class="lugrid">${this._labTile("Bisher geleert", `${s.done} von ${s.total}`, "Restmüll in diesem Jahr")}${this._labTile("Enthalten", s.incl ? String(s.incl) : "–", s.incl ? `noch ${s.free} frei` : "Keine Zahl eingetragen", s.incl && s.free === 0 ? "amber" : "")}${this._labTile("Extra", s.extra != null ? String(s.extra) : "–", s.cost != null ? `${num(s.cost, 2)} € zusätzlich` : "Gebühr je Leerung eintragen", s.extra ? "amber" : "green")}</div></div>`; }
    const B = { tonnen: ampel, next, cal, rem, hint: nt, cost }, lay = this._muLay(), edit = this._edit && adm;
    const eb = edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe die Karten an den Griffen, um sie zu verschieben. Mit dem Auge blendest du eine Karte aus. <button class="lnk" data-act="muxreset">Zurücksetzen</button></div></div>` : "";
    const blocks = lay.order.filter((id) => B[id] && (edit || !lay.hidden.includes(id))).map((id) => `<section class="blk mub ${MU_WIDE.includes(id) ? "wide" : ""} ${edit ? "editing" : ""} ${lay.hidden.includes(id) ? "hid" : ""}" data-sort="mublk" data-id="${id}">
      ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${MU_NAMES[id]}<button class="eyeb" data-act="muxhide" data-k="${id}" aria-pressed="${!lay.hidden.includes(id)}" aria-label="${MU_NAMES[id]} ${lay.hidden.includes(id) ? "einblenden" : "ausblenden"}" title="${lay.hidden.includes(id) ? "Einblenden" : "Ausblenden"}">${ic(lay.hidden.includes(id) ? "eyeOff" : "eye", 18)}<span>${lay.hidden.includes(id) ? "Ausgeblendet" : "Sichtbar"}</span></button></div>` : ""}${B[id]}</section>`).join("");
    return `${banner}${eb}<div class="mublks">${blocks}</div>`;
  }
  _muLay() { const l = (this._cfg && this._cfg.layout && this._cfg.layout.mu) || {}, known = Object.keys(MU_NAMES), o = (Array.isArray(l.order) ? l.order : []).filter((x) => known.includes(x)); return { order: [...o, ...known.filter((x) => !o.includes(x))], hidden: (Array.isArray(l.hidden) ? l.hidden : []).filter((x) => known.includes(x)) }; }
  _muLaySave(patch) { const l = this._muLay(); this._cfg.layout.mu = { order: l.order, hidden: l.hidden, ...patch }; this._saveLayout(); this._render(); }
  _muxModal() {
    const S = this._mu(), C = S.cfg, H = this._hass, st = H.states, adm = this._admin();
    const sw = (k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="muxsw" data-k="${k}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm ? "" : "disabled"}></button>`;
    const cals = Object.keys(st).filter((e) => e.startsWith("calendar.")), tts = Object.keys(st).filter((e) => e.startsWith("tts.")), pl = Object.keys(st).filter((e) => e.startsWith("media_player.")), li = Object.keys(st).filter((e) => e.startsWith("light."));
    const svc = [...new Set([...Object.keys((H.services || {}).notify || {}).filter((n) => !["send_message", "reload", "persistent_notification"].includes(n)).sort().map((n) => "notify." + n), ...C.push.to])];
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" aria-pressed="${!!on}">${t}</button>`;
    const BN = { rest: "Restmüll", bio: "Bio", papier: "Papier", gelb: "Gelber Sack" }, COL = { rest: "#78716c", bio: "#92400e", papier: "#3b82f6", gelb: "#eab308" };
    const cur = C.cal || S.cal || "";
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Müllabfuhr</b><span>Modul 17 · Labs · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("today", 15)}Abfallkalender</div>
      ${this._wzSel(cals, cur, "muxsel", 'data-k="cal"', "– Kalender wählen –", /abfall|müll|waste|tonne|entsorg/i)}
      <div class="gst">${ic("info", 15)}<span>${C.cal ? "Gewählt." : cur ? "Automatisch erkannt (waste_collection_schedule)." : "Noch keiner gefunden."} Die Integration richtest du im <button class="lnk" data-act="muxstore">Store</button> ein.</span></div>
      <div class="lsec" style="margin-top:12px">${ic("trash", 15)}Tonnen</div>
      <div class="mut sm" style="margin:0 0 6px">Welche Tonnen du hast und woran Modul 17 sie im Kalendertitel erkennt. Mehrere Wörter mit Komma trennen.</div>
      ${Object.keys(BN).map((k) => `<div class="vrow"><span style="display:flex;align-items:center;gap:8px"><i class="bin sm" style="background:${COL[k]}"></i><b>${BN[k]}</b></span><input class="osel" type="text" data-f="muxmatch" data-k="${k}" value="${esc(C.bins[k].match)}" style="width:48%;flex:none;margin:0" aria-label="Erkennungswörter ${BN[k]}" ${adm ? "" : "disabled"}>${sw("bin:" + k, C.bins[k].on, BN[k])}</div>`).join("")}
      <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Vorabend</div>
      <div class="vrow"><span>Uhrzeit<small class="mut" style="display:block">Ab dann gilt „morgen wird abgeholt“: Ampel, Nachricht, Ansage und Licht.</small></span><input class="osel" type="time" data-f="muxtime" value="${esc(C.time)}" style="width:auto;margin:0" aria-label="Uhrzeit am Vorabend" ${adm ? "" : "disabled"}></div>
      <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Nachricht aufs Handy</div>
      <div class="vrow"><span>Am Vorabend erinnern<small class="mut" style="display:block">Eine Nachricht, wenn morgen eine Tonne abgeholt wird und sie noch nicht als draußen markiert ist.</small></span>${sw("push", C.push.on, "Nachricht aufs Handy")}</div>
      ${svc.length ? `<div class="gschips">${svc.map((n) => chip("muxns", n, esc(n), C.push.to.includes(n))).join("")}</div>` : `<div class="mut sm">Es wurde kein Benachrichtigungsdienst (notify.*) gefunden. Die Mobile App von Home Assistant legt einen an.</div>`}
      <div class="mut sm" style="margin:2px 0 6px">${C.push.to.length ? `Gesendet wird an: ${C.push.to.map(esc).join(", ")}.` : "Es ist noch kein Dienst gewählt."}</div>
      <div class="lsec" style="margin-top:12px">${ic("music", 15)}Ansage</div>
      <div class="vrow"><span>Sprachausgabe<small class="mut" style="display:block">Sagt die Erinnerung über einen Lautsprecher an. Im Text steht {tonnen} für die Tonnen.</small></span>${sw("tts", C.tts.on, "Ansage")}</div>
      ${C.tts.on ? `${this._wzSel(tts, C.tts.ent, "muxsel", 'data-k="tts_ent"', "– Sprachdienst (tts) wählen –", /cloud|piper|google|tts/i)}${this._wzSel(pl, C.tts.player, "muxsel", 'data-k="tts_player"', "– Lautsprecher wählen –", /flur|wohn|küche|speaker|echo|nest|sonos/i)}<input class="osel" type="text" data-f="muxtext" value="${esc(C.tts.text)}" style="margin:6px 0" aria-label="Text der Ansage" ${adm ? "" : "disabled"}>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("lamp", 15)}Licht</div>
      <div class="vrow"><span>Licht in der Farbe der Tonne<small class="mut" style="display:block">Leuchtet ab der Vorabend-Uhrzeit, bis die Tonne als draußen markiert ist, und geht dann wieder aus.</small></span>${sw("light", C.light.on, "Licht")}</div>
      ${C.light.on ? this._wzSel(li, C.light.ent, "muxsel", 'data-k="light"', "– Licht wählen –", /flur|eingang|tür|tuer|diele/i) : ""}
      <div class="lsec" style="margin-top:12px">${ic("chart", 15)}Kosten</div>
      <div class="vrow"><span>Leerungen zählen<small class="mut" style="display:block">Zeigt Restmüll-Leerungen im Jahr und was darüber hinaus kostet.</small></span>${sw("cost", C.cost.on, "Kosten")}</div>
      ${C.cost.on ? `<div class="vrow"><span>Enthaltene Leerungen pro Jahr</span><input class="osel" type="number" inputmode="numeric" min="0" max="99" data-f="muxnum" data-k="incl" value="${C.cost.incl}" style="width:90px;margin:0" ${adm ? "" : "disabled"}></div><div class="vrow"><span>Gebühr je weitere Leerung (€)</span><input class="osel" type="number" inputmode="decimal" min="0" step="0.01" data-f="muxnum" data-k="fee" value="${C.cost.fee}" style="width:90px;margin:0" ${adm ? "" : "disabled"}></div>` : ""}
      <div class="lsec" style="margin-top:12px">${ic("alert", 15)}Hinweise</div>
      <div class="vrow"><span>Wetter-Hinweise<small class="mut" style="display:block">Warnt vor Sturm und Frost an Abholtagen. Nutzt Modul 9, falls eingeschaltet.</small></span>${sw("wx", C.wx, "Wetter-Hinweise")}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="muxtest" ${C.push.to.length || C.tts.on ? "" : "disabled"}>${ic("bell", 16)} Test senden</button><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Startseite: der Überblick über das Zuhause. Erscheint nach dem Laden des Dashboards zuerst (abschaltbar).
     Blöcke: Zuhause, Wetter, Personen, Hinweise, Alarm, Energie, Müllabfuhr. Anordnung und Sichtbarkeit stehen in layout.start.
     Lab „Start-Bubbles“ (sb): runde Kurzinfos ganz oben, Auswahl in layout.start.bub. Alles nur Anzeige, nur der Alarm kann (optional) schalten. */
  _hzCfg() {
    const l = (this._cfg && this._cfg.layout && this._cfg.layout.start) || {}, b = l.bub || {}, known = Object.keys(HZ_NAMES), o = (Array.isArray(l.order) ? l.order : []).filter((x) => known.includes(x));
    return {
      on: l.on !== false, open: l.open === "last" ? "last" : "start", greet: l.greet !== false, alarm: typeof l.alarm === "string" ? l.alarm : "", ctl: l.ctl === true,
      order: [...o, ...known.filter((x) => !o.includes(x))], hidden: (Array.isArray(l.hidden) ? l.hidden : []).filter((x) => known.includes(x)),
      bub: { ids: (Array.isArray(b.ids) ? b.ids : HZ_BUB_DEF).filter((x) => HZ_BUBS.includes(x)).slice(0, 8), warn: b.warn !== false, tap: b.tap === "module" ? "module" : "block" },
    };
  }
  _hzOn() { return this._hzCfg().on; }
  _hzSave(patch) {
    const raw = (this._cfg.layout.start && typeof this._cfg.layout.start === "object") ? this._cfg.layout.start : {};
    this._cfg.layout.start = { ...raw, ...patch }; this._saveLayout(); this._render();
    if (this._modal && ["hzset", "hzbub"].includes(this._modal.type)) this._renderModal();
  }
  _hzGreet() {
    const c = this._hzCfg(), d = new Date(), h = d.getHours(), hi = h < 5 ? "Gute Nacht" : h < 11 ? "Guten Morgen" : h < 17 ? "Guten Tag" : "Guten Abend";
    const nm = c.greet && this._hass && this._hass.user && this._hass.user.name ? String(this._hass.user.name).trim().split(/\s+/)[0] : "";
    return `${nm ? `${hi}, ${esc(nm)}` : hi} · ${d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}`;
  }
  _hzSince(iso) { const m = Math.max(0, Math.round((Date.now() - new Date(iso || Date.now()).getTime()) / 60000)); return m < 60 ? `${m} Min.` : m < 1440 ? `${Math.floor(m / 60)} Std.` : `${Math.floor(m / 1440)} Tg.`; }
  /* Offene Fenster je Raum */
  _hzWin() {
    const st = this._hass.states, out = [];
    this._collect().forEach((r) => {
      const open = (r.windows || []).map((e) => st[e]).filter((w) => w && ["on", "open"].includes(w.state));
      if (open.length) out.push({ name: r.name, n: open.length, since: Math.min(...open.map((w) => new Date(w.last_changed || Date.now()).getTime())) });
    });
    return out;
  }
  _hzMu() { return this._labOn("mm") ? (this._mu().bins || []) : []; }
  _hzHints() {
    const H = this._hass, st = H.states, out = [], o = this._out();
    this._hzWin().forEach((w) => { const m = Math.round((Date.now() - w.since) / 60000); if (m >= 15) out.push({ i: "windowOpen", t: `${esc(w.name)}: Fenster seit ${this._hzSince(new Date(w.since).toISOString())} offen`, s: o.t != null ? `Außen ${num(o.t, 0)} °C` : "", r: "jetzt", c: "wa", mod: "fh" }); });
    if (this._mdState().on.ww && this._wwConfigured()) this._wwProblems().filter((p) => p[0] === "bad" || p[0] === "warn").slice(0, 2).forEach((p) => out.push({ i: "drop", t: esc(p[2]), s: esc(p[3]), r: "", c: p[0] === "bad" ? "bad" : "wa", mod: "ww" }));
    const due = this._hzMu().filter((x) => ["out", "today", "soon"].includes(x.state));
    if (due.length) out.push({ i: "trash", t: `${due.some((x) => x.state === "today") ? "Heute" : "Morgen"}: ${due.map((x) => esc(x.name)).join(", ")}`, s: "Abholung, Tonne rausstellen", r: due.some((x) => x.state === "today") ? "heute" : "morgen", c: "wa", mod: "mu" });
    const al = this._hzAlarmEnt(); if (al && st[al] && st[al].state === "triggered") out.push({ i: "shield", t: "Alarm ausgelöst", s: esc(this._wzName(al)), r: "jetzt", c: "bad", blk: "alarm" });
    let nb = 0;
    Object.keys(st).forEach((e) => {
      if (nb >= 3) return; const s = st[e], a = s.attributes || {};
      if (e.startsWith("binary_sensor.") && a.device_class === "battery" && s.state === "on") { nb++; out.push({ i: "alert", t: `Batterie schwach: ${esc(a.friendly_name || e)}`, s: "Batterie wechseln", r: "", c: "wa" }); }
      else if (e.startsWith("sensor.") && a.device_class === "battery" && isFinite(parseFloat(s.state)) && parseFloat(s.state) <= 15) { nb++; out.push({ i: "alert", t: `Batterie schwach: ${esc(a.friendly_name || e)}`, s: `${num(parseFloat(s.state), 0)} %`, r: "", c: "wa" }); }
    });
    try { const sp = this._spnS(); if (this._admin() && sp.soon) out.push({ i: "heart", t: sp.soon === 1 ? "Ein Sponsor-Schlüssel läuft bald ab" : `${sp.soon} Sponsor-Schlüssel laufen bald ab`, s: "Unter Einstellungen, Sponsor-Bereich verlängern", r: "bald", c: "wa" }); } catch (_) { /* egal */ }
    const rank = { bad: 0, wa: 1 }; return out.sort((a, b) => (rank[a.c] ?? 2) - (rank[b.c] ?? 2));
  }
  /* Kachel je aktives Modul */
  _hzTile(m) {
    const st = this._hass.states; let sub = "", c = "";
    if (m.id === "fh") { const n = this._hzWin().reduce((s, w) => s + w.n, 0); sub = n ? `${n} ${n === 1 ? "Fenster" : "Fenster"} offen` : "Alle Fenster zu"; c = n ? "wa" : ""; }
    else if (m.id === "ww") { const E = this._mdState().ww.ent || {}, t = E.top && st[E.top], v = t ? parseFloat(t.state) : NaN, bad = this._wwConfigured() && this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn"); sub = isFinite(v) ? `${num(v, 0)} °C` : "Nicht eingerichtet"; c = bad ? "wa" : isFinite(v) ? "" : "mut"; }
    else if (m.id === "en") { const N = this._enOn() ? this._enNow() : null; sub = N ? `${num(N.pv / 1000, 1)} kW PV` : "Nicht eingerichtet"; c = N ? "" : "mut"; }
    else if (m.id === "gs") { const n = this._gsState().devices.length; sub = n ? `${n} ${n === 1 ? "Gerät" : "Geräte"}` : "Keine Geräte"; c = n ? "" : "mut"; }
    else if (m.id === "ev") { const e = (this._evState().ent || {}).soc, v = e && st[e] ? parseFloat(st[e].state) : NaN; sub = isFinite(v) ? `${num(v, 0)} %` : "Nicht eingerichtet"; c = isFinite(v) ? "" : "mut"; }
    else if (m.id === "mu") { const x = this._hzMu().filter((b) => b.next).sort((a, b) => a.days - b.days)[0]; sub = x ? `${esc(x.name)} ${this._muWhen(x.days)}` : "Keine Termine"; c = x && x.days <= 1 ? "wa" : x ? "" : "mut"; this._muLoad(); }
    else if (m.id === "li") { const L = this._liLamps().filter((x) => !x.un), n = L.filter((x) => x.on).length; sub = L.length ? (n ? `${n} von ${L.length} an` : "Alles aus") : "Keine Lampen"; c = n ? "wa" : "mut"; }
    else { sub = modSt(m) && STG[modSt(m)] ? STG[modSt(m)].t : ""; c = "mut"; }
    return `<button class="hzt ${c}" data-act="hzgo" data-k="${m.id}"><span class="hti">${ic(m.icon, 22)}</span><b>${esc(m.short)}</b><small>${sub}</small></button>`;
  }
  _hzZuhause(hints) {
    const mods = this._mdList().filter((m) => m.id !== "st"), n = hints.length, bad = hints.some((h) => h.c === "bad");
    const head = n ? (bad ? "Es gibt etwas zu tun" : "Fast alles in Ordnung") : "Alles in Ordnung", hc = bad ? "bad" : n ? "" : "ok";
    return `<div class="card"><h2>${ic("home", 18)}Zuhause</h2><div class="hzhead ${hc}">${head}</div><div class="hzsub">${n ? `${n} ${n === 1 ? "Hinweis braucht" : "Hinweise brauchen"} Aufmerksamkeit. ` : ""}Tippe auf eine Kachel, um das Modul zu öffnen.</div><div class="hzgrid">${mods.map((m) => this._hzTile(m)).join("")}</div></div>`;
  }
  /* Wetter */
  _hzWxId() { const c = this._wxCfg(), st = this._hass.states; return c.entity && st[c.entity] ? c.entity : Object.keys(st).find((k) => k.startsWith("weather.")); }
  _hzFc(wid) {
    const d = this._hzFcD; if (d && d.id === wid && Date.now() - d.ts < 900000) return d.list;
    if (this._hzFcBusy || !this._hass) return d && d.id === wid ? d.list : [];
    this._hzFcBusy = true;
    this._hass.callWS({ type: "call_service", domain: "weather", service: "get_forecasts", service_data: { type: "hourly" }, target: { entity_id: wid }, return_response: true })
      .then((r) => { const f = r && r.response && r.response[wid] && r.response[wid].forecast; this._hzFcD = { id: wid, ts: Date.now(), list: Array.isArray(f) ? f : [] }; })
      .catch(() => { this._hzFcD = { id: wid, ts: Date.now(), list: [] }; })
      .finally(() => { this._hzFcBusy = false; if (this._mdActive() === "st" && !this._dragging && !this._modal) this._render(); });
    return d && d.id === wid ? d.list : [];
  }
  _hzWetter() {
    const wid = this._hzWxId(); if (!wid) return "";
    const w = this._hass.states[wid], a = w.attributes || {}, o = this._out(), k = WX[w.state] || ["cloud", w.state || ""];
    const fc = this._hzFc(wid).filter((x) => new Date(x.datetime).getTime() > Date.now()).filter((_, i) => i % 3 === 2).slice(0, 4);
    const bits = [a.humidity != null ? `Luftfeuchte ${num(a.humidity, 0)} %` : "", a.wind_speed != null ? `Wind ${num(a.wind_speed, 0)} ${a.wind_speed_unit || "km/h"}` : ""].filter(Boolean).join(" · ");
    return `<div class="card"><h2>${ic("cloud", 18)}Wetter<span class="hzrt">${esc(a.friendly_name || wid)}</span></h2>
      <div class="hzwx"><span class="hzwi">${ic(k[0], 44)}</span><div><div class="hzbig">${o.t != null ? num(o.t, 1) : "–"}<small> °C</small></div><div class="hzsub" style="margin:2px 0 0">${esc(k[1])}${bits ? ` · ${bits}` : ""}</div></div></div>
      ${fc.length ? `<div class="hzfc">${fc.map((x) => `<div><small>${new Date(x.datetime).getHours()} Uhr</small><b>${x.temperature != null ? num(x.temperature, 0) + "°" : "–"}</b>${ic((WX[x.condition] || ["cloud"])[0], 18)}</div>`).join("")}</div>` : ""}</div>`;
  }
  /* Personen */
  _hzPersonen() {
    const P = this._ortPersons().filter((p) => p.count); if (!P.length) return "";
    const st = this._hass.states, nh = P.filter((p) => p.home).length;
    const dist = (d) => (d >= 1000 ? `${num(d / 1000, d < 10000 ? 1 : 0)} km` : `${num(d, 0)} m`);
    return `<div class="card"><h2>${ic("users", 18)}Personen<span class="hzrt">${nh} von ${P.length} zu Hause</span></h2><div class="hzl">${P.map((p) => {
      const s = st[p.id] || {}, pic = (s.attributes || {}).entity_picture, since = s.last_changed ? new Date(s.last_changed).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
      const sub = p.unavailable ? "Kein Standort" : p.home ? `Zu Hause${since ? ` seit ${since}` : ""}` : p.dist != null ? `Unterwegs, ${dist(p.dist)} entfernt` : (p.state && p.state !== "not_home" ? esc(p.state) : "Unterwegs");
      return `<div class="hzr"><span class="hzav ${p.home ? "home" : ""}" style="--c:${p.col};${pic ? `background-image:url('${esc(pic)}');` : ""}">${pic ? "" : esc(p.name.slice(0, 1).toUpperCase())}<u></u></span><div class="hzrx"><b>${esc(p.name)}</b><small>${sub}</small></div><span class="hzrr ${p.home ? "ok" : ""}">${p.home ? "zu Hause" : "unterwegs"}</span></div>`;
    }).join("")}</div></div>`;
  }
  /* Alarm */
  _hzAlarmEnt() { const c = this._hzCfg(), st = this._hass.states; return c.alarm && st[c.alarm] ? c.alarm : Object.keys(st).find((k) => k.startsWith("alarm_control_panel.")) || ""; }
  _hzAlarmTxt(s) { return { disarmed: ["Unscharf", "ok"], armed_home: ["Scharf, zu Hause", "ok"], armed_away: ["Scharf, abwesend", "ok"], armed_night: ["Scharf, Nacht", "ok"], armed_vacation: ["Scharf, Urlaub", "ok"], armed_custom_bypass: ["Scharf, angepasst", "ok"], arming: ["Wird scharf geschaltet …", "wa"], pending: ["Verzögerung läuft", "wa"], disarming: ["Wird unscharf geschaltet …", "wa"], triggered: ["AUSGELÖST", "bad"] }[s] || ["Nicht verfügbar", "mut"]; }
  _hzAlarm() {
    const e = this._hzAlarmEnt(); if (!e) return ""; const s = this._hass.states[e], [txt, cl] = this._hzAlarmTxt(s.state), c = this._hzCfg(), ctl = c.ctl && this._admin();
    const since = s.last_changed ? new Date(s.last_changed).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    const btn = (k, t, ico, on) => `<button class="hzt ${on ? "sel" : ""}" data-act="hzalarm" data-k="${k}"><span class="hti">${ic(ico, 20)}</span><b>${t}</b>${on ? "<small>aktiv</small>" : ""}</button>`;
    return `<div class="card"><h2>${ic("shield", 18)}Alarm<span class="hzrt">${esc(this._wzName(e))}</span></h2><div class="hzhead ${cl === "ok" ? "ok" : cl === "bad" ? "bad" : ""}" style="font-size:1.25rem">${txt}</div><div class="hzsub">${since ? `Seit ${since} Uhr` : ""}</div>
      ${ctl ? `<div class="hzgrid">${btn("disarm", "Unscharf", "shield", s.state === "disarmed")}${btn("away", "Abwesend", "door", s.state === "armed_away")}${btn("home", "Zu Hause", "home", s.state === "armed_home")}</div><div class="hzsub" style="margin:8px 0 0">Schalten nur mit Bestätigung${(s.attributes || {}).code_format ? " und Code" : ""}.</div>` : ""}</div>`;
  }
  _hzHinweise(hints) {
    return `<div class="card"><h2>${ic("info", 18)}Hinweise<span class="hzrt">alle Module</span></h2>${hints.length ? `<div class="hzl">${hints.slice(0, 6).map((h) => `<${h.mod || h.blk ? `button data-act="hzgo" data-k="${h.mod || ""}" data-b="${h.blk || ""}"` : "div"} class="hzr ${h.c || ""}"><span class="hzri">${ic(h.i, 22)}</span><span class="hzrx"><b>${h.t}</b>${h.s ? `<small>${h.s}</small>` : ""}</span>${h.r ? `<span class="hzrr ${h.c || ""}">${h.r}</span>` : ""}</${h.mod || h.blk ? "button" : "div"}>`).join("")}</div>` : `<div class="mut sm">Keine Hinweise. Fenster, Batterien, Warmwasser und Termine sind in Ordnung.</div>`}</div>`;
  }
  _hzEnergie() {
    if (!this._enOn()) return ""; const N = this._enNow(); if (!N) return "";
    const net = N.exp > 0 ? this._labTile("Netz", `${num(N.exp / 1000, 1)} kW`, "Einspeisung", "green") : this._labTile("Netz", `${num(N.imp / 1000, 1)} kW`, N.imp > 0 ? "Bezug" : "ausgeglichen", N.imp > 0 ? "amber" : "");
    return `<div class="card hzgo" data-act="hzgo" data-k="en" role="button" tabindex="0"><h2>${ic("energy", 18)}Energie jetzt<span class="hzrt">Modul 3</span></h2><div class="lugrid">${this._labTile("Solar", `${num(N.pv / 1000, 1)} kW`, `Haus ${num(N.house / 1000, 1)} kW`)}${N.soc != null ? this._labTile("Batterie", `${num(N.soc, 0)} %`, N.bc > 0 ? `lädt mit ${num(N.bc / 1000, 1)} kW` : N.dis > 0 ? `entlädt mit ${num(N.dis / 1000, 1)} kW` : "ruht") : ""}${net}</div></div>`;
  }
  _hzMuell() {
    if (!this._labOn("mm")) return ""; this._muLoad(); const S = this._mu(), rows = (S.bins || []).filter((x) => x.next); if (!S.on || !rows.length) return "";
    const lbl = { out: "raus!", today: "heute", soon: "morgen", ok: "ok", done: "draußen", none: "–" };
    return `<div class="card"><h2>${ic("trash", 18)}Müllabfuhr<span class="hzrt">Modul 17</span></h2><div class="mugrid">${(S.bins || []).map((x) => { const tap = ["out", "today", "soon"].includes(x.state) ? "muxdone" : x.state === "done" ? "muxundo" : ""; return `<${tap ? `button data-act="${tap}" data-k="${x.k}"` : "div"} class="mubin ${x.state}"><i class="bin" style="background:${x.color}"></i><b>${esc(x.name)}</b><small>${x.next ? (x.days <= 1 ? lbl[x.state] : this._muWhen(x.days)) : "–"}</small></${tap ? "button" : "div"}>`; }).join("")}</div></div>`;
  }
  /* Bubbles (Lab) */
  _hzBubDef(id) {
    const st = this._hass.states, o = () => this._out();
    if (id === "wetter") { const wid = this._hzWxId(), w = wid && st[wid]; if (!w) return null; const t = o().t; return { i: (WX[w.state] || ["cloud"])[0], b: t != null ? `${num(t, 0)} °C` : "–", s: "Wetter", blk: "wetter" }; }
    if (id === "personen") { const P = this._ortPersons().filter((p) => p.count); if (!P.length) return null; const n = P.filter((p) => p.home).length; return { i: "users", b: `${n} zu Hause`, s: "Personen", c: n ? "ok" : "", blk: "personen" }; }
    if (id === "alarm") { const e = this._hzAlarmEnt(); if (!e) return null; const [t, c] = this._hzAlarmTxt(st[e].state); return { i: "shield", b: t.replace(/, .*/, ""), s: "Alarm", c: c === "ok" ? "ok" : c === "bad" ? "bad" : c === "wa" ? "wa" : "", blk: "alarm" }; }
    if (id === "solar" || id === "batterie") { if (!this._enOn()) return null; const N = this._enNow(); if (!N) return null; return id === "solar" ? { i: "sun", b: `${num(N.pv / 1000, 1)} kW`, s: "Solar", mod: "en", blk: "energie" } : N.soc != null ? { i: "bolt", b: `${num(N.soc, 0)} %`, s: "Batterie", mod: "en", blk: "energie" } : null; }
    if (id === "auto") { const E = this._evState().ent || {}, v = E.soc && st[E.soc] ? parseFloat(st[E.soc].state) : NaN; if (!isFinite(v)) return null; const ch = E.charging && st[E.charging] && ["on", "charging"].includes(st[E.charging].state); return { i: "car", b: `${num(v, 0)} %`, s: ch ? "lädt" : "E-Auto", c: ch ? "ok" : "", mod: "ev" }; }
    if (id === "fenster") { const n = this._hzWin().reduce((s, w) => s + w.n, 0); return { i: "windowOpen", b: n ? `${n} offen` : "alle zu", s: "Fenster", c: n ? "wa" : "ok", mod: "fh" }; }
    if (id === "muell") { if (!this._labOn("mm")) return null; this._muLoad(); const x = this._hzMu().filter((b) => b.next).sort((a, b) => a.days - b.days)[0]; return x ? { i: "trash", b: x.days === 0 ? "Heute" : x.days === 1 ? "Morgen" : `in ${x.days} Tg.`, s: x.name, c: x.days <= 1 ? "wa" : "", mod: "mu", blk: "muell" } : null; }
    if (id === "warmwasser") { if (!this._mdState().on.ww) return null; const E = this._mdState().ww.ent || {}, v = E.top && st[E.top] ? parseFloat(st[E.top].state) : NaN; return isFinite(v) ? { i: "drop", b: `${num(v, 0)} °C`, s: "Warmwasser", mod: "ww" } : null; }
    if (id === "preis") { if (!this._enOn()) return null; const p = this._price(); return p ? { i: "chart", b: `${num(p, 1)} ct`, s: "Strompreis", mod: "en" } : null; }
    if (id === "hinweise") { const n = this._hzHints().length; return { i: "info", b: n ? `${n} ${n === 1 ? "Hinweis" : "Hinweise"}` : "keine", s: "Hinweise", c: n ? "wa" : "ok", blk: "hinweise" }; }
    return null;
  }
  _hzBubs() {
    const c = this._hzCfg().bub, items = c.ids.map((id) => ({ id, ...(this._hzBubDef(id) || {}) })).filter((x) => x.i);
    return items.length ? `<div class="hzbubs" role="list">${items.map((x) => `<button class="hzb ${c.warn ? x.c || "" : ""}" role="listitem" data-act="hzbub" data-k="${x.id}"><i>${ic(x.i, 16)}</i><span><b>${esc(x.b)}</b><small>${esc(x.s)}</small></span></button>`).join("")}</div>` : `<div class="mut sm">Keine Bubble hat gerade Daten. Wähle andere unter „Inhalt wählen“.</div>`;
  }
  /* Seite */
  _hzPage() {
    const adm = this._admin(), edit = this._edit && adm, c = this._hzCfg(), hints = this._hzHints();
    const B = { zuhause: this._hzZuhause(hints), wetter: this._hzWetter(), personen: this._hzPersonen(), hinweise: this._hzHinweise(hints), alarm: this._hzAlarm(), energie: this._hzEnergie(), muell: this._hzMuell() };
    const eb = edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe die Karten an den Griffen, um sie zu verschieben. Mit dem Auge blendest du eine Karte aus. <button class="lnk" data-act="hzreset">Zurücksetzen</button></div></div>` : "";
    const bub = this._labOn("sb") ? (edit ? `<div class="hzbe"><div class="etag">${ic("layers", 16)}Bubbles (Lab)<button class="eyeb" data-act="hzbubopen">${ic("sliders", 16)}<span>Inhalt wählen</span></button></div>${this._hzBubs()}</div>` : this._hzBubs()) : "";
    const blocks = c.order.filter((id) => B[id] && (edit || !c.hidden.includes(id))).map((id) => {
      const hid = c.hidden.includes(id);
      return `<section class="blk mub ${HZ_WIDE.includes(id) ? "wide" : ""} ${edit ? "editing" : ""} ${hid ? "hid" : ""}" data-sort="hzblk" data-id="${id}">
      ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${HZ_NAMES[id]}<button class="eyeb" data-act="hzhide" data-k="${id}" aria-pressed="${!hid}" aria-label="${HZ_NAMES[id]} ${hid ? "einblenden" : "ausblenden"}" title="${hid ? "Einblenden" : "Ausblenden"}">${ic(hid ? "eyeOff" : "eye", 18)}<span>${hid ? "Ausgeblendet" : "Sichtbar"}</span></button></div>` : ""}${B[id]}</section>`;
    }).join("");
    return `${bub}${eb}${this._spnCard()}<div class="mublks">${blocks || `<div class="card empty">${ic("home", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Noch nichts zu zeigen</div>Richte ein Modul ein oder blende Karten über „Anpassen“ wieder ein.</div>`}</div>`;
  }
  _hzAct(a, b) {
    const k = b.dataset.k;
    if (a === "hzgo") {
      if (k && this._mdList().some((m) => m.id === k)) { this._stOpen = false; this._edit = false; this._mdActiveSet(k); this._render(); }
      else if (b.dataset.b) this._hzScroll(b.dataset.b);
      return;
    }
    if (a === "hzbub") {
      const d = this._hzBubDef(k) || {}, tap = this._hzCfg().bub.tap, el = d.blk && this.shadowRoot.querySelector(`[data-sort="hzblk"][data-id="${d.blk}"]`);
      if (tap === "block" && el && !el.classList.contains("hid")) this._hzScroll(d.blk);
      else if (d.mod && this._mdList().some((m) => m.id === d.mod)) { this._edit = false; this._mdActiveSet(d.mod); this._render(); }
      else if (d.blk) this._hzScroll(d.blk);
      return;
    }
    if (a === "hzopen") { this._modal = { type: "hzset" }; this._renderModal(); return; }
    if (a === "hzbubopen") { this._modal = { type: "hzbub" }; this._renderModal(); return; }
    if (a === "hzback") { this._modal = { type: "hzset" }; this._renderModal(); return; }
    if (a === "hzhide") { const h = this._hzCfg().hidden; this._hzSave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "hzreset") { this._hzSave({ order: Object.keys(HZ_NAMES), hidden: [] }); this._toast("Anordnung zurückgesetzt"); return; }
    if (a === "hzsw") { const c = this._hzCfg(); if (k === "on") this._hzSave({ on: !c.on }); else if (k === "greet") this._hzSave({ greet: !c.greet }); else if (k === "ctl") this._hzSave({ ctl: !c.ctl }); else if (k === "warn") this._hzSave({ bub: { ...c.bub, warn: !c.bub.warn } }); return; }
    if (a === "hzopenm") { this._hzSave({ open: k === "last" ? "last" : "start" }); return; }
    if (a === "hztap") { const c = this._hzCfg(); this._hzSave({ bub: { ...c.bub, tap: k === "module" ? "module" : "block" } }); return; }
    if (a === "hzbt") { const c = this._hzCfg(), ids = c.bub.ids.slice(); if (ids.includes(k)) ids.splice(ids.indexOf(k), 1); else if (ids.length < 8) ids.push(k); else { this._toast("Mehr als 8 Bubbles sind nicht möglich"); return; } this._hzSave({ bub: { ...c.bub, ids } }); return; }
    if (a === "hzbm") { const c = this._hzCfg(), ids = c.bub.ids.slice(), i = ids.indexOf(k), j = i + (b.dataset.d === "up" ? -1 : 1); if (i < 0 || j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; this._hzSave({ bub: { ...c.bub, ids } }); return; }
    if (a === "hzalarm") { const e = this._hzAlarmEnt(); if (!e || !this._hzCfg().ctl || !this._admin()) return; this._modal = { type: "hzpin", mode: k }; this._renderModal(); return; }
    if (a === "hzpinok") {
      const m = this._modal, e = this._hzAlarmEnt(); if (!m || !e) return; const inp = this.shadowRoot.querySelector(".hzpin"), code = inp ? inp.value.trim() : "";
      const svc = { disarm: "alarm_disarm", away: "alarm_arm_away", home: "alarm_arm_home" }[m.mode]; if (!svc) return;
      this._modal = null; this._renderModal();
      this._hass.callService("alarm_control_panel", svc, { entity_id: e, ...(code ? { code } : {}) }).then(() => this._toast("Alarm wird geschaltet")).catch(() => this._toast("Das hat nicht geklappt. Stimmt der Code?"));
      return;
    }
  }
  _hzScroll(id) {
    const el = this.shadowRoot.querySelector(`[data-sort="hzblk"][data-id="${id}"]`); if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("hzflash"); setTimeout(() => el.classList.remove("hzflash"), 1300);
  }
  _hzChange(t) {
    if (t.dataset.f === "hzsel") { this._hzSave({ alarm: t.value || "" }); return true; }
    return false;
  }
  _hzModal() {
    const m = this._modal, c = this._hzCfg(), adm = this._admin(), st = this._hass.states;
    const sw = (k, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="hzsw" data-k="${k}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm ? "" : "disabled"}></button>`;
    const chip = (act, k, t, on) => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${!!on}" ${adm ? "" : "disabled"}>${t}</button>`;
    if (m.type === "hzpin") {
      const e = this._hzAlarmEnt(), need = e && (st[e].attributes || {}).code_format, T = { disarm: "unscharf schalten", away: "auf „Abwesend“ schalten", home: "auf „Zu Hause“ schalten" }[m.mode] || "schalten";
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Alarm ${T}?</b><span>${esc(e ? this._wzName(e) : "")}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="gst on">${ic("alert", 15)}<span>Das schaltet deine Alarmanlage in Home Assistant.</span></div>
        ${need ? `<div class="vrow"><span>Code</span><input class="osel hzpin" type="password" inputmode="${need === "number" ? "numeric" : "text"}" autocomplete="off" style="width:50%;margin:0" aria-label="Alarm-Code"></div>` : ""}
        <div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="hzpinok">${ic("check", 16)} ${m.mode === "disarm" ? "Unscharf schalten" : "Scharf schalten"}</button></div></div>`;
    }
    if (m.type === "hzbub") {
      const sel = c.bub.ids, rest = HZ_BUBS.filter((x) => !sel.includes(x));
      const row = (id, on, i) => `<div class="hzo ${on ? "on" : ""}"><button class="hzck ${on ? "on" : ""}" data-act="hzbt" data-k="${id}" aria-pressed="${on}" aria-label="${esc(HZ_BUB_N[id][0])}" ${adm ? "" : "disabled"}>${on ? ic("check", 14) : ""}</button><span class="hzoi">${ic(HZ_BUB_N[id][2], 18)}</span><span class="hzot"><b>${HZ_BUB_N[id][0]}</b><small>${HZ_BUB_N[id][1]}</small></span>${on && adm ? `<button class="ibtn" data-act="hzbm" data-d="up" data-k="${id}" aria-label="Nach oben" ${i === 0 ? "disabled" : ""}>${ic("up", 16)}</button><button class="ibtn dn" data-act="hzbm" data-d="down" data-k="${id}" aria-label="Nach unten" ${i === sel.length - 1 ? "disabled" : ""}>${ic("up", 16)}</button>` : ""}</div>`;
      return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Bubbles wählen</b><span>Lab „Start-Bubbles“ · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm" style="margin:0 0 8px">Bis zu 8 möglich, ${sel.length} gewählt. Die Reihenfolge änderst du mit den Pfeilen. Bubbles ohne Daten werden ausgelassen.</div>
        ${sel.map((id, i) => row(id, true, i)).join("")}${rest.map((id) => row(id, false, -1)).join("")}
        <div class="vrow"><span>Warnfarben<small class="mut" style="display:block">Gelb bei Hinweis, Rot bei Alarm</small></span>${sw("warn", c.bub.warn, "Warnfarben")}</div>
        <div class="vrow"><span>Antippen öffnet</span><span class="gschs">${chip("hztap", "block", "Karte", c.bub.tap === "block")}${chip("hztap", "module", "Modul", c.bub.tap === "module")}</span></div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2 pri" data-act="hzback">${ic("check", 16)} Fertig</button></div></div>`;
    }
    const alarms = Object.keys(st).filter((e) => e.startsWith("alarm_control_panel."));
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Startseite</b><span>Gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="vrow"><span>Startseite verwenden<small class="mut" style="display:block">Aus: das Dashboard öffnet wie bisher das zuletzt benutzte Modul.</small></span>${sw("on", c.on, "Startseite verwenden")}</div>
      <div class="vrow"><span>Beim Öffnen zeigen<small class="mut" style="display:block">Gilt, wenn du das Dashboard in Home Assistant neu öffnest. Ein Direktlink mit <code>?modul=</code> öffnet sein Modul.</small></span><span class="gschs">${chip("hzopenm", "start", "Start", c.open === "start")}${chip("hzopenm", "last", "Letztes Modul", c.open === "last")}</span></div>
      <div class="vrow"><span>Begrüßung mit Namen<small class="mut" style="display:block">Vorname des angemeldeten Benutzers.</small></span>${sw("greet", c.greet, "Begrüßung mit Namen")}</div>
      <div class="lsec" style="margin-top:12px">${ic("shield", 15)}Alarm</div>
      ${alarms.length ? this._wzSel(alarms, c.alarm, "hzsel", "", "– automatisch –") : `<div class="mut sm">Keine Alarmanlage in Home Assistant gefunden. Der Block bleibt dann weg.</div>`}
      <div class="vrow"><span>Alarm schalten erlauben<small class="mut" style="display:block">Zeigt Knöpfe für Unscharf, Abwesend und Zu Hause. Jedes Schalten wird bestätigt. Das schaltet echte Geräte.</small></span>${sw("ctl", c.ctl, "Alarm schalten erlauben")}</div>
      ${this._labOn("sb") ? `<div class="gbtns" style="margin-top:12px"><button class="btn2" data-act="hzbubopen">${ic("layers", 16)} Bubbles wählen</button></div>` : `<div class="gst">${ic("info", 15)}<span>Runde Kurzinfos oben gibt es im Lab „Start-Bubbles“ unter Labs.</span></div>`}
      <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="hzreset">Anordnung zurücksetzen</button></div></div>`;
  }
  /* ================= Tablet-Modus (3.0.2.12) =================
     Eine eigene Oberfläche für Wandtablets: große Bedienflächen, untere Knopfleiste, Ruhemodus, PIN für die Einstellungen.
     Was zum Gerät gehört (an/aus, Kennung) liegt im Browser, alles andere pro Tablet im Home Assistant (tablet.py). */
  _tmId() {
    try {
      let i = localStorage.getItem("fh_tm_id");
      if (!/^[a-z0-9]{6,20}$/.test(i || "")) { i = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => (b % 36).toString(36)).join(""); localStorage.setItem("fh_tm_id", i); }
      return i;
    } catch (_) { return this._tmMem || (this._tmMem = Math.random().toString(36).slice(2, 10).padEnd(8, "x")); }
  }
  _tmKind() {
    const ua = navigator.userAgent || "", fully = /FullyKiosk|Fully\//i.test(ua) || !!window.fully, app = /HomeAssistant/i.test(ua);
    const os = /Silk|KFA|KFT|Fire/i.test(ua) ? "Fire OS" : /Android/i.test(ua) ? "Android" : /iPad|iPhone/i.test(ua) || (/Mac/i.test(ua) && navigator.maxTouchPoints > 1) ? "iPadOS/iOS" : "";
    return { kind: fully ? "fully" : app ? "app" : "browser", label: (fully ? "Fully Kiosk" : app ? "Home-Assistant-App" : "Browser") + (os ? " auf " + os : "") };
  }
  _tmTouch() { try { return window.matchMedia("(pointer:coarse)").matches; } catch (_) { return false; } }
  _tmMode() {
    if (!this._tmUrl) {
      this._tmUrl = true;
      try { const q = new URLSearchParams(location.search).get("tablet"); if (q === "1" || q === "0") localStorage.setItem("fh_tm_mode", q === "1" ? "on" : "off"); } catch (_) { /* kein Zugriff */ }
    }
    try { const m = localStorage.getItem("fh_tm_mode"); return m === "on" || m === "auto" ? m : "off"; } catch (_) { return "off"; }
  }
  _tmModeSet(m) { try { localStorage.setItem("fh_tm_mode", m); } catch (_) { /* privater Modus */ } this._tmSleep = false; this._tmLast = Date.now(); }
  _tmOn() { const m = this._tmMode(); return m === "on" || (m === "auto" && this._tmTouch() && window.innerWidth >= 600); }
  _tmMe() { const id = this._tmId(), t = ((this._tm && this._tm.tablets) || []).find((x) => x.id === id); return t || { id, name: "Tablet", has_pin: false, cfg: {} }; }
  _tmC() { return { size: "auto", idle_home: 2, sleep: 15, wake_warn: true, motion: "", screen: "", notify: "", off_after: 0, dock_hide: [], ...(this._tmMe().cfg || {}) }; }
  async _tmLoad() {
    if (this._tmBound !== true) { this._tmBound = true; this._tmBind(); }
    const k = this._tmKind();
    try { this._tm = await this._hass.callWS({ type: "fenster_heizung/tm_hello", tid: this._tmId(), name: k.kind === "fully" ? "Fully-Tablet" : "Tablet", kind: k.kind, size: `${window.innerWidth}x${window.innerHeight}` }); } catch (_) { this._tm = this._tm || { tablets: [] }; }
  }
  _tmBind() {
    this._tmLast = Date.now();
    const act = (e) => {
      this._tmLast = Date.now(); this._tmHomed = false;
      if (this._tmSleep) { e.stopPropagation(); e.preventDefault(); this._tmGuard = Date.now() + 500; this._tmWake(); }
    };
    ["pointerdown", "touchstart", "keydown"].forEach((ev) => this.addEventListener(ev, act, { capture: true, passive: false }));
    this.addEventListener("click", (e) => { if (this._tmSleep || Date.now() < (this._tmGuard || 0)) { e.stopPropagation(); e.preventDefault(); } }, true);
  }
  _tmWake() { this._tmSleep = false; this._tmLast = Date.now(); this._tmHomed = false; this._render(); }
  _tmWarnKey() { try { return this._hzHints().filter((h) => h.c === "bad").map((h) => h.t).join("|"); } catch (_) { return ""; } }
  _tmTick() {
    if (!this._hass || !this._tmOn()) return;
    const sr = this.shadowRoot, c = this._tmC(), d = new Date(), idle = Date.now() - (this._tmLast || Date.now());
    sr.querySelectorAll("[data-tmclk]").forEach((e) => { e.textContent = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }); });
    sr.querySelectorAll("[data-tmdate]").forEach((e) => { e.textContent = d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }); });
    const mo = c.motion && this._hass.states[c.motion] ? this._hass.states[c.motion].state : "";
    const moved = mo === "on" && this._tmMo !== "on"; this._tmMo = mo;
    const wk = c.wake_warn ? this._tmWarnKey() : "", newWarn = wk && wk !== this._tmWk; this._tmWk = wk;
    if (this._tmSleep) { if (moved || newWarn) this._tmWake(); return; }
    if (newWarn && !this._modal) { this._tmView = "st"; this._tmLast = Date.now(); this._render(); return; }
    if (c.sleep && idle >= c.sleep * 60000) { this._tmSleep = true; this._modal = null; this._renderModal(); this._render(); return; }
    if (c.idle_home && idle >= c.idle_home * 60000 && !this._tmHomed) { this._tmHomed = true; if (this._tmV() !== "st" && !this._modal) { this._tmView = "st"; this._render(); } }
  }
  _tmV() { return this._tmView || "st"; }
  _tmItems() {
    const hide = this._tmC().dock_hide, mods = this._mdList().filter((m) => m.id !== "st").map((m) => ({ id: m.id, name: m.short || m.name, icon: m.icon }));
    return [{ id: "st", name: "Start", icon: "home" }, ...mods].filter((x) => x.id === "st" || !hide.includes(x.id));
  }
  _tmDock() {
    const all = this._tmItems(), w = window.innerWidth, max = w < 600 ? 4 : w < 1000 ? 5 : 7, v = this._tmV();
    let vis = all, more = [];
    if (all.length > max) { vis = all.slice(0, max - 1); more = all.slice(max - 1); const cur = more.find((x) => x.id === v); if (cur) { more = more.filter((x) => x !== cur); more.unshift(vis.pop()); vis.push(cur); } }
    const bad = this._wwProblems && this._mdState().on.ww && this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn");
    return `<nav class="tmdock" aria-label="Module">${vis.map((x) => `<button class="tmdk ${v === x.id ? "sel" : ""}" data-act="tmgo" data-k="${x.id}" aria-pressed="${v === x.id}">${ic(x.icon, 28)}<span>${esc(x.name)}</span>${x.id === "ww" && bad ? `<i class="tmdot"></i>` : ""}</button>`).join("")}${more.length ? `<button class="tmdk" data-act="tmmore">${ic("sliders", 28)}<span>Mehr</span></button>` : ""}</nav>`;
  }
  _tmBody(id) {
    const m = this._mdList().find((x) => x.id === id);
    if (id === "st" || !m) return this._tmStart();
    if (id === "fh") return this._tmHeiz();
    if (id === "ww") { this._wwLoad(); return this._wwPage(); }
    if (id === "gs") return this._gsPage();
    if (id === "mu") return this._muPage();
    if (id === "li") return this._liPage();
    if (m.beta) return this._betaPage(id);
    if (id === "en") return this._enPage();
    return `<div class="card empty">${ic("puzzle", 36)}<div style="margin:10px 0 4px;font-weight:700">${esc(m.name)}</div>Dieses Modul gibt es im Tablet-Modus noch nicht.</div>`;
  }
  _tmStart() {
    const hints = this._hzHints(), mods = this._mdList().filter((x) => x.id !== "st"), bubs = this._labOn("sb") ? this._hzBubs().replace(/data-act="hzbub"/g, 'data-act="tmbub"') : "";
    const rows = hints.slice(0, 3).map((h) => `<div class="tmhint ${h.c || ""}"><span class="tmhi">${ic(ICONS[h.i] ? h.i : "info", 20)}</span><span><b>${h.t}</b>${h.s ? `<small>${h.s}</small>` : ""}</span></div>`).join("");
    return `${bubs}<div class="tmgrid">${mods.map((m) => this._hzTile(m).replace('data-act="hzgo"', 'data-act="tmgo"')).join("")}</div>${rows ? `<div class="tmhints">${rows}</div>` : ""}`;
  }
  _tmRoom(r) {
    const st = this._hass.states, cl = (r.thermos || []).map((e) => st[e]).filter(Boolean), A = (cl[0] && cl[0].attributes) || {};
    const cur = cl.map((x) => parseFloat(x.attributes.current_temperature)).filter(isFinite), ist = cur.length ? cur.reduce((a, b) => a + b, 0) / cur.length : NaN;
    const o = (this._tmTgt || {})[r.id], tg = o && Date.now() < o.until ? o.v : parseFloat(A.temperature), paused = r.mode === "heizung_pausiert", off = r.mode === "regelung_aus";
    const sub = paused ? "Fenster offen, Heizung pausiert" : off ? "Regelung aus" : isFinite(ist) ? `Ist ${num(ist, 1)} °C` : "Kein Messwert";
    const can = cl.length && isFinite(tg) && !paused;
    return `<div class="tmroom ${paused ? "wa" : ""}"><div class="tmrt"><span class="hti">${ic(paused ? "windowOpen" : this._icon(r), 26)}</span><b>${esc(r.name)}</b></div><div class="tmrs">${sub}</div>
      <div class="tmpm"><button class="tmb2" data-act="tmt" data-id="${esc(r.id)}" data-d="-1" ${can ? "" : "disabled"} aria-label="kälter">${ic("minus", 26)}</button><div class="tmv">${isFinite(tg) ? num(tg, 1) : "–"}<small> °C</small></div><button class="tmb2" data-act="tmt" data-id="${esc(r.id)}" data-d="1" ${can ? "" : "disabled"} aria-label="wärmer">${ic("plus", 26)}</button></div></div>`;
  }
  _tmHeiz() {
    const rooms = this._collect();
    return rooms.length ? `<div class="tmrooms">${rooms.map((r) => this._tmRoom(r)).join("")}</div>` : `<div class="card empty">Noch keine Räume eingerichtet.</div>`;
  }
  _tmSleepHtml() {
    const facts = ["wetter", "alarm", "personen", "muell"].map((id) => this._hzBubDef(id)).filter((x) => x && x.i).map((x) => `<div>${ic(x.i, 26)}<span>${esc(x.b)}${x.s ? ` · ${esc(x.s)}` : ""}</span></div>`).join("");
    return `<div class="tmrest"><div class="tmrc ${this._spnEarlyClock()}" data-tmclk>${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</div><div class="tmrd" data-tmdate>${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</div><div class="tmrf">${facts}</div><div class="tmrw">Antippen zum Aufwecken</div></div>`;
  }
  _tmRender() {
    const sr = this.shadowRoot, v = this._mdList().some((m) => m.id === this._tmV()) || this._tmV() === "st" ? this._tmV() : "st", m = this._mdList().find((x) => x.id === v), c = this._tmC(), me = this._tmMe();
    this._w = this.clientWidth; this._tmView = v;
    if (this._tmSleep) { sr.getElementById("main").innerHTML = this._tmSleepHtml(); return; }
    const sc = { auto: 1, large: 1.15, xl: 1.3 }[c.size] || 1, title = v === "st" ? this._hzGreet().split(" · ")[0] : esc(m ? m.name : ""), hints = v === "st" ? this._hzHints().length : 0;
    const sub = v === "st" ? (hints ? `${hints} ${hints === 1 ? "Hinweis" : "Hinweise"}` : "Alles in Ordnung") : esc(m ? m.tag || "" : "");
    const x = sr.querySelector(".tmbody"), keep = x && this._tmVOld === v ? x.scrollTop : 0; this._tmVOld = v;
    sr.getElementById("main").innerHTML = `<div class="tmw"><header class="tmh"><img class="blogo" src="${LOGO_URL}" alt="" draggable="false"><div class="tmht"><b>${title}</b><span>${sub}</span></div>
      <div class="tmclk"><span data-tmclk>${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</span><small data-tmdate>${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</small></div>
      <button class="tmgear" data-act="tmlock" aria-label="${me.has_pin ? "Einstellungen (PIN)" : "Einstellungen"}">${ic(me.has_pin ? "lock" : "sliders", 22)}</button></header>
      <div class="tmbody" style="zoom:${sc}">${this._tmBody(v)}</div>${this._tmDock()}</div>`;
    const nb = sr.querySelector(".tmbody"); if (nb && keep) nb.scrollTop = keep;
  }
  /* Hinweis und Knopf in der normalen Ansicht */
  _tmBtn() { return window.innerWidth >= 600 ? `<button class="pillbtn" data-act="tmopen" aria-label="Tablet-Modus">${ic("tablet", 16)}<span class="bl">Tablet-Modus</span></button>` : ""; }
  _tmHint() {
    let no = false; try { no = localStorage.getItem("fh_tm_nohint") === "1"; } catch (_) { /* egal */ }
    if (no || this._tmHintHide || this._tmMode() !== "off" || !this._tmTouch() || window.innerWidth < 600) return "";
    return `<div class="tmbn">${ic("tablet", 26)}<div class="tmbt"><b>Dieses Gerät sieht aus wie ein Tablet.</b><span>Tablet-Modus einschalten? Große Bedienflächen, untere Leiste, Ruhemodus.</span></div><button class="pillbtn pri" data-act="tmstart">Einschalten</button><button class="pillbtn" data-act="tmno">Nicht mehr fragen</button></div>`;
  }
  /* Einstellungen speichern */
  _tmSave(patch, name) {
    const me = this._tmMe(), cfg = { ...this._tmC(), ...patch };
    if (!this._tm) this._tm = { tablets: [] };
    const i = this._tm.tablets.findIndex((x) => x.id === me.id), row = { ...me, cfg, ...(name != null ? { name } : {}) };
    if (i >= 0) this._tm.tablets[i] = row; else this._tm.tablets.push(row);
    this._hass.callWS({ type: "fenster_heizung/tm_set", tid: me.id, cfg, ...(name != null ? { name } : {}), ...(this._tmPin ? { pin: this._tmPin } : {}) })
      .then((r) => { if (r && r.tablets) this._tm = { tablets: r.tablets }; })
      .catch(() => this._toast("Das ging nicht. Ist die PIN noch gültig?"));
    this._renderModal(); this._render();
  }
  _tmAdminList() {
    this._hass.callWS({ type: "fenster_heizung/tm_get" }).then((r) => { this._tm = r; if (this._modal && this._modal.type === "tmnorm") this._renderModal(); }).catch(() => {});
  }
  _tmLocked() { const me = this._tmMe(); return me.has_pin && !this._tmPin && !this._admin(); }
  /* Tastenfeld */
  _tmPinOpen(mode, then) { this._tmPinThen = then || this._tmPinThen || ""; this._modal = { type: "tmpin", mode, buf: "", first: "", err: "" }; this._renderModal(); }
  async _tmKeyDone() {
    const m = this._modal, me = this._tmMe(), pin = m.buf; m.buf = "";
    if (m.mode === "unlock" || m.mode === "chgold") {
      let r; try { r = await this._hass.callWS({ type: "fenster_heizung/tm_check", tid: me.id, pin }); } catch (_) { r = { ok: false, error: "x" }; }
      if (!this._modal || this._modal.type !== "tmpin") return;
      if (r.ok) { this._tmPin = pin; if (m.mode === "chgold") { this._tmPinOpen("new"); return; } this._tmAfterPin(); return; }
      this._modal.err = r.error === "locked" ? `Zu viele Versuche. Bitte ${r.wait} Sekunden warten.` : r.error === "wrong" ? `PIN falsch, noch ${r.left} ${r.left === 1 ? "Versuch" : "Versuche"}.` : "Das hat nicht geklappt."; this._renderModal(); return;
    }
    if (m.mode === "new") { m.first = pin; m.mode = "new2"; m.err = ""; this._renderModal(); return; }
    if (m.mode === "new2") {
      if (pin !== m.first) { m.mode = "new"; m.first = ""; m.err = "Die beiden PINs waren verschieden. Bitte neu festlegen."; this._renderModal(); return; }
      let r; try { r = await this._hass.callWS({ type: "fenster_heizung/tm_pin", tid: me.id, pin, ...(this._tmPin ? { old: this._tmPin } : {}) }); } catch (_) { r = { ok: false }; }
      if (!r || !r.ok) { this._modal = null; this._renderModal(); this._toast("PIN konnte nicht gespeichert werden"); return; }
      this._tmPin = pin; await this._tmLoad(); this._toast("PIN gespeichert"); this._tmAfterPin(true); return;
    }
  }
  _tmAfterPin(fresh) {
    const then = this._tmPinThen; this._tmPinThen = "";
    if (then === "start") { this._tmModeSet("on"); this._tmView = "st"; this._modal = null; this._renderModal(); this._render(); return; }
    this._modal = { type: this._tmOn() ? "tmset" : "tmnorm" }; this._renderModal(); if (this._modal.type === "tmnorm" && this._admin()) this._tmAdminList();
    if (fresh) this._render();
  }
  _tmStartNow() { const me = this._tmMe(); if (!me.has_pin) { this._tmPinOpen("new", "start"); return; } this._tmModeSet("on"); this._tmView = "st"; this._modal = null; this._renderModal(); this._render(); }
  _tmAct(a, b) {
    const k = b.dataset.k, m = this._modal;
    if (a === "tmgo") { this._tmView = k; this._tmHomed = false; this._render(); }
    else if (a === "tmbub") { const d = this._hzBubDef(k) || {}; if (d.mod && this._mdList().some((x) => x.id === d.mod)) { this._tmView = d.mod; this._render(); } }
    else if (a === "tmgomore") { this._tmView = k; this._tmHomed = false; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "tmmore") { this._modal = { type: "tmmore" }; this._renderModal(); }
    else if (a === "tmlock") { this._tmPin = ""; const me = this._tmMe(); if (me.has_pin) this._tmPinOpen("unlock"); else this._tmPinOpen("new"); }
    else if (a === "tmopen") { this._modal = { type: "tmnorm" }; this._renderModal(); if (this._admin()) this._tmAdminList(); }
    else if (a === "tmstart") this._tmStartNow();
    else if (a === "tmno") { try { localStorage.setItem("fh_tm_nohint", "1"); } catch (_) { /* egal */ } this._tmHintHide = true; this._render(); }
    else if (a === "tmkey") {
      if (!m || m.type !== "tmpin") return; if (k === "back") m.buf = m.buf.slice(0, -1); else if (m.buf.length < 6) m.buf += k;
      m.err = m.buf.length ? "" : m.err; this._renderModal(); if (m.buf.length === 6) this._tmKeyDone();
    }
    else if (a === "tmpinx") { this._tmPinThen = ""; this._modal = null; this._renderModal(); }
    else if (a === "tmdone") { this._tmPin = ""; this._modal = null; this._renderModal(); this._render(); }
    else if (a === "tmmode") { this._tmModeSet(k); this._renderModal(); this._render(); }
    else if (a === "tmend") { this._tmModeSet("off"); this._tmPin = ""; this._modal = { type: "tmnorm" }; this._renderModal(); this._render(); }
    else if (a === "tmunl") { this._tmPinOpen("unlock"); }
    else if (a === "tmchg") { this._tmPinOpen(this._tmPin || this._admin() || !this._tmMe().has_pin ? "new" : "chgold"); }
    else if (a === "tmsz") this._tmSave({ size: k });
    else if (a === "tmih") this._tmSave({ idle_home: +k });
    else if (a === "tmsl") this._tmSave({ sleep: +k });
    else if (a === "tmoff") this._tmSave({ off_after: +k });
    else if (a === "tmww") this._tmSave({ wake_warn: !this._tmC().wake_warn });
    else if (a === "tmdock") { const h = this._tmC().dock_hide, n = h.includes(k) ? h.filter((x) => x !== k) : [...h, k]; this._tmSave({ dock_hide: n }); }
    else if (a === "tmcopy") { const u = this._tmUrlStr(); try { navigator.clipboard.writeText(u).then(() => this._toast("Link kopiert")); } catch (_) { this._toast("Kopieren nicht möglich"); } }
    else if (a === "tmreset") { this._hass.callWS({ type: "fenster_heizung/tm_reset", tid: b.dataset.id }).then((r) => { this._tm = r; this._toast("PIN zurückgesetzt"); this._renderModal(); }).catch(() => this._toast("Das ging nicht")); }
    else if (a === "tmdel") { this._hass.callWS({ type: "fenster_heizung/tm_del", tid: b.dataset.id }).then((r) => { this._tm = r; this._renderModal(); }).catch(() => this._toast("Das ging nicht")); }
    else if (a === "tmt") {
      const r = this._collect().find((x) => x.id === b.dataset.id); if (!r) return; const st = this._hass.states, cl = (r.thermos || []).filter((e) => st[e]), A = (cl[0] && st[cl[0]].attributes) || {};
      const o = (this._tmTgt = this._tmTgt || {})[r.id], cur = o && Date.now() < o.until ? o.v : parseFloat(A.temperature); if (!isFinite(cur)) return;
      const step = parseFloat(A.target_temp_step) || 0.5, lo = isFinite(parseFloat(A.min_temp)) ? parseFloat(A.min_temp) : 5, hi = isFinite(parseFloat(A.max_temp)) ? parseFloat(A.max_temp) : 30;
      const v = Math.min(hi, Math.max(lo, Math.round((cur + (+b.dataset.d) * step) / step) * step));
      this._tmTgt[r.id] = { v, until: Date.now() + 8000 }; this._render(); clearTimeout(this._tmTT);
      this._tmTT = setTimeout(() => { cl.forEach((e) => this._hass.callService("climate", "set_temperature", { entity_id: e, temperature: v }).catch(() => this._toast("Temperatur konnte nicht gesetzt werden"))); }, 600);
    }
  }
  _tmChange(t) {
    const f = t.dataset.f;
    if (f === "tmname") { this._tmSave({}, String(t.value || "").trim().slice(0, 24) || "Tablet"); return true; }
    if (f === "tmsel") { const k = t.dataset.k; this._tmPkOpen = false; this._tmSave({ [k]: t.value || "" }); return true; }
    if (f === "tmnot") { this._tmSave({ notify: String(t.value || "").trim().replace(/^notify\./, "") }); return true; }
    return false;
  }
  _tmUrlStr() { try { return `${location.origin}${location.pathname}?tablet=1`; } catch (_) { return "?tablet=1"; } }
  _tmModal() {
    const m = this._modal, st = this._hass.states;
    const close = `<button class="ibtn" data-act="${m.type === "tmpin" ? "tmpinx" : "close"}" aria-label="Schließen">${ic("close", 20)}</button>`;
    if (m.type === "tmpin") {
      const T = { unlock: ["PIN eingeben", "Einstellungen des Tablet-Modus"], chgold: ["Aktuelle PIN", "Zuerst die bisherige PIN eingeben"], new: ["PIN festlegen", "Schritt 1 von 2: neue PIN mit 6 Ziffern"], new2: ["PIN wiederholen", "Schritt 2 von 2: dieselbe PIN noch einmal"] }[m.mode];
      const dots = Array.from({ length: 6 }, (_, i) => `<i class="${i < m.buf.length ? "f" : ""}"></i>`).join("");
      const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-act="tmkey" data-k="${n}" aria-label="${n}">${n}</button>`).join("");
      return `<div class="ov" data-act="tmpinx"></div><div class="sheet tmpad" role="dialog" aria-modal="true"><div class="sh"><div><b>${T[0]}</b><span>${T[1]}</span></div>${close}</div>
        <div class="tmdots">${dots}</div><div class="tmerr" role="alert">${esc(m.err || "")}</div>
        <div class="tmkeys">${keys}<button class="z" data-act="tmpinx">Abbrechen</button><button data-act="tmkey" data-k="0" aria-label="0">0</button><button class="z" data-act="tmkey" data-k="back" aria-label="Löschen">⌫</button></div></div>`;
    }
    if (m.type === "tmmore") {
      const rest = this._tmItems();
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Weitere Module</b><span>Tablet-Modus</span></div>${close}</div>
        <div class="tmmore">${rest.map((x) => `<button class="tmdk ${this._tmV() === x.id ? "sel" : ""}" data-act="tmgo" data-k="${x.id}">${ic(x.icon, 26)}<span>${esc(x.name)}</span></button>`).join("")}</div></div>`.replace(/data-act="tmgo"/g, 'data-act="tmgomore"');
    }
    const inT = m.type === "tmset", me = this._tmMe(), c = this._tmC(), kd = this._tmKind(), mode = this._tmMode(), adm = this._admin(), lock = this._tmLocked();
    const seg = (act, cur, opts) => `<span class="gschs">${opts.map(([k, t]) => `<button class="gsch ${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${String(cur) === String(k)}" ${lock ? "disabled" : ""}>${t}</button>`).join("")}</span>`;
    const row = (t, s, ctl) => `<div class="vrow"><span>${t}${s ? `<small class="mut" style="display:block">${s}</small>` : ""}</span>${ctl}</div>`;
    const sw = (act, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${lock ? "disabled" : ""}></button>`;
    const motions = Object.keys(st).filter((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class)), sws = Object.keys(st).filter((e) => e.startsWith("switch.")).sort((a, b) => (/screen/.test(b) ? 1 : 0) - (/screen/.test(a) ? 1 : 0));
    const moAll = motions.length ? motions : Object.keys(st).filter((e) => e.startsWith("binary_sensor."));
    const mods = this._mdList().filter((x) => x.id !== "st");
    const pinRow = lock
      ? `<div class="gst on">${ic("lock", 15)}<span>Die Einstellungen dieses Tablets sind mit einer PIN geschützt.</span></div><div class="gbtns"><button class="btn2 pri" data-act="tmunl">${ic("lock", 16)} Mit PIN entsperren</button></div>`
      : row("PIN", me.has_pin ? "6 Stellen, schützt die Einstellungen" : "Noch keine PIN festgelegt", `<button class="btn2 ${me.has_pin ? "" : "pri"}" data-act="tmchg" style="flex:none">${ic("lock", 16)} ${me.has_pin ? "PIN ändern" : "PIN festlegen"}</button>`);
    const list = !inT && adm ? `<div class="lsec" style="margin-top:14px">${ic("tablet", 15)}Tablets verwalten</div>${((this._tm && this._tm.tablets) || []).map((t) => `<div class="vrow"><span><b>${esc(t.name)}${t.id === me.id ? " (dieses)" : ""}</b><small class="mut" style="display:block">${t.kind === "fully" ? "Fully Kiosk" : t.kind === "app" ? "HA-App" : "Browser"} · ${t.size || ""} · ${t.has_pin ? "mit PIN" : "ohne PIN"} · zuletzt ${t.seen ? this._hzSince(new Date(t.seen * 1000).toISOString()) : "–"}</small></span><span class="gschs">${t.has_pin ? `<button class="gsch" data-act="tmreset" data-id="${esc(t.id)}">PIN zurücksetzen</button>` : ""}${t.id === me.id ? "" : `<button class="gsch" data-act="tmdel" data-id="${esc(t.id)}">Entfernen</button>`}</span></div>`).join("")}` : "";
    return `<div class="ov" data-act="${inT ? "tmdone" : "close"}"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Tablet-Modus</b><span>Gilt nur für dieses Gerät</span></div><button class="ibtn" data-act="${inT ? "tmdone" : "close"}" aria-label="Schließen">${ic("close", 20)}</button></div>
      ${pinRow}
      <div class="lsec" style="margin-top:12px">${ic("tablet", 15)}${inT ? "Dieses Tablet" : "Aktivierung"}</div>
      ${inT ? "" : row("Tablet-Modus", "Ersetzt die normale Ansicht. Automatisch: auf Touchgeräten ab 600 px Breite.", seg("tmmode", mode, [["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]]))}
      <div class="vrow"><span>Name dieses Tablets<small class="mut" style="display:block">Erkannt: ${esc(kd.label)}, ${window.innerWidth} × ${window.innerHeight}</small></span><input class="osel" data-f="tmname" value="${esc(me.name)}" maxlength="24" style="width:46%;margin:0" ${lock ? "disabled" : ""} aria-label="Name"></div>
      ${row("Größe", "Bedienelemente und Schrift", seg("tmsz", c.size, [["auto", "Auto"], ["large", "Groß"], ["xl", "Sehr groß"]]))}
      ${row("Zurück zu Start nach", "Ohne Berührung", seg("tmih", c.idle_home, [[0, "Aus"], [2, "2 Min."], [5, "5 Min."], [15, "15 Min."]]))}
      ${row("Ruhemodus nach", "Dunkle Uhr statt Inhalt. Berühren oder Bewegung weckt auf.", seg("tmsl", c.sleep, [[0, "Aus"], [5, "5 Min."], [15, "15 Min."], [30, "30 Min."]]))}
      ${row("Warnungen wecken auf", "Zum Beispiel ein ausgelöster Alarm", sw("tmww", c.wake_warn, "Warnungen wecken auf"))}
      <div class="lsec" style="margin-top:12px">${ic("grid", 15)}Untere Leiste</div>
      <div class="mut sm" style="margin:0 0 6px">Start ist immer dabei. Bei schmalen Bildschirmen steht der Rest unter „Mehr“.</div>
      <div class="gschs" style="flex-wrap:wrap">${mods.map((x) => `<button class="gsch ${c.dock_hide.includes(x.id) ? "" : "sel"}" data-act="tmdock" data-k="${x.id}" aria-pressed="${!c.dock_hide.includes(x.id)}" ${lock ? "disabled" : ""}>${esc(x.short || x.name)}</button>`).join("")}</div>
      <div class="lsec" style="margin-top:14px">${ic("eye", 15)}Bewegung und Display</div>
      <div class="mut sm" style="margin:0 0 6px">Der Bewegungsmelder wird im Home Assistant überwacht und funktioniert auch bei ausgeschaltetem Display. Bei Bewegung geht das Display an, ohne Bewegung nach der eingestellten Zeit wieder aus.</div>
      ${lock ? "" : `<div class="of"><div class="ol"><b>Bewegungsmelder</b></div></div>${this._wzSel(moAll, c.motion, "tmsel", 'data-k="motion"', "– keiner –")}<div class="of"><div class="ol"><b>Display-Schalter</b><span>Fully: der Schalter „Screen“ der Fully-Integration</span></div></div>${this._wzSel(sws, c.screen, "tmsel", 'data-k="screen"', "– keiner –")}`}
      ${row("Display ausschalten nach", "Ohne Bewegung. Nur mit Display-Schalter.", seg("tmoff", c.off_after, [[0, "Nie"], [10, "10 Min."], [30, "30 Min."]]))}
      <div class="vrow"><span>HA-App (Android)<small class="mut" style="display:block">Benachrichtigungsdienst, z. B. mobile_app_tablet. Schaltet nur ein.</small></span><input class="osel" data-f="tmnot" value="${esc(c.notify)}" placeholder="mobile_app_…" style="width:46%;margin:0" ${lock ? "disabled" : ""} aria-label="Benachrichtigungsdienst"></div>
      ${inT ? "" : `<div class="lsec" style="margin-top:14px">${ic("copy", 15)}Fully Kiosk</div><div class="mut sm" style="margin:0 0 6px">Diesen Link in Fully unter Web Content Settings als Start-URL eintragen. Dann startet das Tablet immer im Tablet-Modus.</div><div class="tmurl"><code>${esc(this._tmUrlStr())}</code><button class="ibtn" data-act="tmcopy" aria-label="Kopieren">${ic("copy", 18)}</button></div>`}
      ${list}
      <div class="gbtns" style="margin-top:14px">${inT ? `<button class="btn2" data-act="tmend" ${lock ? "disabled" : ""}>Tablet-Modus beenden</button><button class="btn2 pri" data-act="tmdone">${ic("check", 16)} Fertig</button>` : `<button class="btn2" data-act="close">Schließen</button><button class="btn2 pri" data-act="tmstart" ${lock ? "disabled" : ""}>${ic("tablet", 16)} Tablet-Modus jetzt starten</button>`}</div></div>`;
  }
  /* ================= Sponsor-Bereich (3.0.2.13) =================
     Die Integration bleibt kostenlos. Mit einem Sponsor-Schlüssel gibt es Schönes obendrauf: Abzeichen, Farbverläufe,
     Uhr-Stile und Vorabversionen. Der Schlüssel wird im Backend geprüft (sponsor.py). Wer den privaten Schlüssel
     eingetragen hat, sieht zusätzlich die Verwaltung der Sponsoren. */
  async _spnLoad() {
    try { this._spnD = await this._hass.callWS({ type: "fenster_heizung/spn_get" }); } catch (_) { this._spnD = null; }
  }
  _spnS() { return this._spnD || { url: "https://github.com/sponsors/Maddog3010", state: "none", active: false, name: "", bis: "", prefs: { badge: true, grad: "none", clock: "standard", early: false }, saved_prefs: { badge: true, grad: "none", clock: "standard", early: false }, manage: false }; }
  _spnP() { return this._spnS().prefs; }
  _spnEarly() { const s = this._spnS(); return !!(s.active && s.prefs.early); }
  _spnDate(d) { try { return new Date(d + "T12:00:00").toLocaleDateString("de-DE"); } catch (_) { return d; } }
  /* Aussehen: Verlauf im Kopf (Klasse am Panel, das CSS steht in den Stilen) */
  _spnApply() {
    const g = this._spnP().grad, cl = this.classList;
    ["meer", "abend"].forEach((k) => cl.toggle("spg-" + k, g === k));
  }
  _spnEarlyClock() { const s = this._spnS(); return s.active && s.prefs.clock !== "standard" ? "ck-" + s.prefs.clock : ""; }
  _spnBtn() {
    const s = this._spnS(), adm = this._admin();
    if (s.active && s.prefs.badge) return `<button class="pillbtn spnb on" data-act="spnopen" aria-label="Sponsor-Bereich" title="${esc(s.name ? "Danke, " + s.name : "Sponsor")}">${ic("heart", 15)}<span class="bl">Sponsor</span></button>`;
    if (!adm) return "";
    return `<button class="pillbtn spnb" data-act="spnopen" aria-label="Sponsor-Bereich" title="Sponsor werden oder Schlüssel eingeben">${ic("heart", 15)}<span class="bl">Sponsor</span></button>`;
  }
  /* B: Karte auf der Startseite, nur für Administratoren ohne Schlüssel, 60 Tage ausblendbar */
  _spnCard() {
    if (!this._admin() || this._edit || this._spnS().active) return "";
    try { const t = +localStorage.getItem("fh_spn_hide") || 0; if (Date.now() - t < 60 * 86400000) return ""; } catch (_) { /* egal */ }
    return `<div class="spnc"><span class="spnbig">${ic("heart", 24)}</span><div class="spnt"><b>Gefällt dir die Integration?</b><span>Sie ist kostenlos und offen. Wenn du magst, unterstütze die Entwicklung auf GitHub.</span></div><a class="pillbtn spnb pri" href="${esc(this._spnS().url)}" target="_blank" rel="noopener noreferrer">${ic("heart", 15)}Sponsor werden</a><button class="ibtn" data-act="spnhide" aria-label="Ausblenden">${ic("close", 18)}</button></div>`;
  }
  /* C: Zeile im Update-Hinweis */
  _spnLine() { return this._spnS().active ? "" : `<span class="spnl">${ic("heart", 12)} Hobbyprojekt. <a href="${esc(this._spnS().url)}" target="_blank" rel="noopener noreferrer">Unterstützen</a></span>`; }
  /* D: Zeile in den Einstellungen */
  _spnRow() {
    const s = this._spnS(), chip = s.active ? `<em class="sxc ok">${esc(s.name || "Aktiv")}</em>` : s.state === "expired" ? `<em class="sxc wa">Abgelaufen</em>` : `<em class="sxc">Schlüssel</em>`;
    return `<button class="sxrow" data-act="spnopen"><span class="sxi">${ic("heart", 20)}</span><span class="sxt"><b>Sponsor-Bereich</b><small>Schlüssel eingeben, Extras einstellen</small></span>${chip}</button>`;
  }
  _spnAct(a, b) {
    const k = b.dataset.k;
    if (a === "spnopen") { this._modal = { type: "spndlg", err: "" }; this._renderModal(); this._spnLoad().then(() => { if (this._modal && this._modal.type === "spndlg") this._renderModal(); this._render(); }); }
    else if (a === "spnhide") { try { localStorage.setItem("fh_spn_hide", String(Date.now())); } catch (_) { /* egal */ } this._render(); this._toast("Hinweis ausgeblendet"); }
    else if (a === "spnred") {
      const el = this.shadowRoot.querySelector('[data-f="spnkey"]'), key = el ? String(el.value || "").trim() : "";
      if (!key) { this._modal.err = "Bitte den Schlüssel einfügen."; this._renderModal(); return; }
      this._spnRedeem(key);
    }
    else if (a === "spnclr") { this._hass.callWS({ type: "fenster_heizung/spn_clear" }).then((r) => { this._spnD = r; this._spnApply(); this._renderModal(); this._render(); this._toast("Schlüssel entfernt"); }).catch(() => this._toast("Das ging nicht")); }
    else if (a === "spnbadge") this._spnPref({ badge: !this._spnS().saved_prefs.badge });
    else if (a === "spnearly") this._spnPref({ early: !this._spnS().saved_prefs.early });
    else if (a === "spngrad") this._spnPref({ grad: k });
    else if (a === "spnclk") this._spnPref({ clock: k });
    else if (a === "spnadm") { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); this._spnAdminLoad(); }
    else if (a === "spnback") { this._modal = { type: "spndlg", err: "" }; this._renderModal(); }
    else if (a === "spnlist") { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); }
    else if (a === "spnnew") { this._modal = { type: "spnadm", view: "new", err: "" }; this._renderModal(); }
    else if (a === "spncreate") {
      const q = (f) => this.shadowRoot.querySelector(`[data-f="${f}"]`), name = String((q("spnname") || {}).value || "").trim();
      if (!name) { this._modal.err = "Bitte einen Namen eingeben."; this._renderModal(); return; }
      this._spnAdm({ act: "create", name, bis: String((q("spnbis") || {}).value || ""), note: String((q("spnnote") || {}).value || ""), on: !!(q("spndk") || {}).checked }, (r) => {
        if (!r.ok) { this._modal.err = r.error === "date" ? "Das Datum ist ungültig." : "Das ging nicht."; this._renderModal(); return; }
        this._modal = { type: "spnadm", view: "done", id: r.id, key: r.key }; this._renderModal();
      });
    }
    else if (a === "spnext") { this._spnAdm({ act: "extend", sid: k }, (r) => { if (!r.ok) { this._toast("Das ging nicht"); return; } this._modal = { type: "spnadm", view: "done", id: r.id, key: r.key }; this._renderModal(); }); }
    else if (a === "spnkey") { const s = ((this._spnA || {}).items || []).find((x) => x.id === k); if (s) { this._modal = { type: "spnadm", view: "done", id: s.id, key: s.key }; this._renderModal(); } }
    else if (a === "spnrevq") { this._modal = { type: "spnadm", view: "revoke", id: k }; this._renderModal(); }
    else if (a === "spnrev") { this._spnAdm({ act: "revoke", sid: k }, () => { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); this._toast("Gesperrt. Jetzt noch die Liste im Repo ändern."); }); }
    else if (a === "spnunrev") { this._spnAdm({ act: "unrevoke", sid: k }, () => { this._renderModal(); this._toast("Sperre aufgehoben. Die Liste im Repo muss auch angepasst werden."); }); }
    else if (a === "spndel") { this._spnAdm({ act: "remove", sid: k }, () => { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); }); }
    else if (a === "spndk") { const s = ((this._spnA || {}).items || []).find((x) => x.id === k); if (s) this._spnAdm({ act: "danke", sid: k, on: !s.danke }, () => this._renderModal()); }
    else if (a === "spnmine") { this._spnRedeem(this._modal.key, true); }
    else if (a === "spncopy") this._spnCopy(this._modal.key, "Schlüssel kopiert");
    else if (a === "spnmsg") {
      const s = ((this._spnA || {}).items || []).find((x) => x.id === this._modal.id) || {};
      this._spnCopy(`Hallo ${s.name || ""},\n\ndanke für deine Unterstützung! Hier ist dein Sponsor-Schlüssel für Strom & Wärme (gültig bis ${this._spnDate(s.bis || "")}):\n\n${this._modal.key}\n\nEinlösen: Einstellungen > Sponsor-Bereich > Schlüssel einfügen.`, "Nachricht kopiert");
    }
    else if (a === "spnjson2") this._spnCopy(b.dataset.j || "{}", "Liste kopiert");
    else if (a === "spnjson") this._spnCopy(((this._spnA || {}).revoked_json || "{}"), "Liste kopiert");
    else if (a === "spndanke") this._spnCopy(((this._spnA || {}).danke || []).map((n) => `- ${n}`).join("\n"), "Danke-Liste kopiert");
    else if (a === "spnsetup") {
      const el = this.shadowRoot.querySelector('[data-f="spnpriv"]'), v = el ? String(el.value || "").trim() : "";
      this._hass.callWS({ type: "fenster_heizung/spn_admin_setup", priv: v }).then((r) => { if (!r.ok) { this._modal.err = "Das ist nicht der richtige private Schlüssel."; this._renderModal(); return; } this._spnA = r; this._spnLoad().then(() => { this._modal = { type: "spnadm", view: "list" }; this._renderModal(); this._render(); }); }).catch(() => this._toast("Das ging nicht"));
    }
    else if (a === "spnforget") { this._spnAdm({ act: "forget" }, () => { this._spnLoad().then(() => { this._modal = { type: "spndlg", err: "" }; this._renderModal(); this._render(); }); }); }
  }
  _spnCopy(t, ok) { try { navigator.clipboard.writeText(t).then(() => this._toast(ok)); } catch (_) { this._toast("Kopieren nicht möglich"); } }
  _spnRedeem(key, mine) {
    this._hass.callWS({ type: "fenster_heizung/spn_redeem", key }).then((r) => {
      const st = (r.result || {}).state;
      this._spnD = r; this._spnApply(); this._render();
      if (st === "ok") { this._modal = { type: "spndlg", err: "" }; this._renderModal(); this._toast(mine ? "Bei dir eingelöst" : "Danke für deine Unterstützung!"); return; }
      if (!this._modal || this._modal.type !== "spndlg") { this._modal = { type: "spndlg", err: "" }; }
      this._modal.err = st === "expired" ? "Dieser Schlüssel ist abgelaufen." : st === "revoked" ? "Dieser Schlüssel wurde gesperrt." : "Der Schlüssel ist nicht gültig. Bitte vollständig einfügen, ohne Leerzeichen am Ende.";
      this._renderModal();
    }).catch(() => this._toast("Das ging nicht"));
  }
  _spnPref(patch) {
    const old = this._spnS().saved_prefs; if (this._spnD) this._spnD.saved_prefs = { ...old, ...patch }; if (this._spnD && this._spnD.active) this._spnD.prefs = { ...old, ...patch };
    this._spnApply(); this._renderModal(); this._render();
    this._hass.callWS({ type: "fenster_heizung/spn_prefs", prefs: patch }).then((r) => { this._spnD = r; this._spnApply(); this._renderModal(); this._render(); }).catch(() => this._toast("Das ging nicht"));
  }
  _spnAdminLoad() { this._hass.callWS({ type: "fenster_heizung/spn_admin_get" }).then((r) => { this._spnA = r; if (this._modal && this._modal.type === "spnadm") this._renderModal(); }).catch(() => this._toast("Das ging nicht")); }
  _spnAdm(msg, then) { this._hass.callWS({ type: "fenster_heizung/spn_admin_act", ...msg }).then((r) => { this._spnA = { ...this._spnA, ...r }; this._spnLoad().then(() => { then(r); this._render(); }); }).catch(() => this._toast("Das ging nicht")); }
  _spnModal() {
    const m = this._modal, close = `<button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button>`;
    return m.type === "spnadm" ? this._spnAdmModal(close) : this._spnDlg(close);
  }
  _spnDlg(close) {
    const s = this._spnS(), m = this._modal, adm = this._admin(), p = s.saved_prefs;
    const seg = (act, cur, opts) => `<span class="gschs">${opts.map(([k, t]) => `<button class="gsch ${String(cur) === String(k) ? "sel" : ""}" data-act="${act}" data-k="${k}" aria-pressed="${String(cur) === String(k)}" ${adm ? "" : "disabled"}>${t}</button>`).join("")}</span>`;
    const row = (t, sub, ctl) => `<div class="vrow"><span>${t}${sub ? `<small class="mut" style="display:block">${sub}</small>` : ""}</span>${ctl}</div>`;
    const sw = (act, on, label) => `<button class="sw ${on ? "on" : ""}" data-act="${act}" aria-pressed="${!!on}" aria-label="${esc(label)}" ${adm ? "" : "disabled"}></button>`;
    const link = `<a class="btn2 spnb pri" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" style="flex:none;text-decoration:none">${ic("heart", 16)} Sponsor werden</a>`;
    const perks = `<div class="spnperks"><div>${ic("heart", 16)}<span><b>Abzeichen</b>Ein Herz im Kopf</span></div><div>${ic("palette", 16)}<span><b>Farbverläufe</b>Für den Kopf</span></div><div>${ic("moon", 16)}<span><b>Uhr-Stile</b>Für den Ruhemodus</span></div><div>${ic("flask", 16)}<span><b>Vorabversionen</b>Neue Labs zuerst</span></div></div>`;
    let body;
    if (s.active) {
      body = `<div class="spnthx">${ic("heart", 15)}<span>${s.state === "dev" ? "Entwickler-Zugang: Alle Extras und Vorabversionen sind für dich immer frei, ohne Schlüssel." : `Danke${s.name ? ", " + esc(s.name) : ""}! Dein Schlüssel gilt bis ${esc(this._spnDate(s.bis))}.`}</span></div>
        <div class="lsec" style="margin-top:12px">${ic("palette", 15)}Farben und Aussehen</div>
        ${row("Abzeichen im Kopf", "Das Herz neben den Knöpfen", sw("spnbadge", p.badge, "Abzeichen"))}
        ${row("Verlauf im Kopf", "Zusätzliche Farbverläufe", seg("spngrad", p.grad, [["none", "Aus"], ["meer", "Meer"], ["abend", "Abend"]]))}
        <div class="lsec" style="margin-top:12px">${ic("moon", 15)}Tablet-Ruhemodus</div>
        ${row("Uhr-Stil", "Wirkt im Ruhemodus des Tablet-Modus", seg("spnclk", p.clock, [["standard", "Standard"], ["duenn", "Dünn"], ["kraeftig", "Kräftig"], ["digital", "Digital"]]))}
        <div class="lsec" style="margin-top:12px">${ic("flask", 15)}Mitmachen</div>
        ${row("Vorabversionen zuerst", "Neue Labs ein bis zwei Wochen früher sehen", sw("spnearly", p.early, "Vorabversionen"))}
        ${adm ? `<div class="gbtns" style="margin-top:14px">${s.state === "dev" ? "" : `<button class="btn2" data-act="spnclr">Schlüssel entfernen</button>`}${s.manage ? `<button class="btn2 pri" data-act="spnadm">${ic("users", 16)} Sponsoren verwalten</button>` : ""}</div>` : ""}`;
    } else {
      const note = s.state === "expired" ? `<div class="gst bad">${ic("clock", 15)}<span>Dein Schlüssel ist am ${esc(this._spnDate(s.bis))} abgelaufen. Die Extras sind aus, deine Einstellungen bleiben gespeichert.</span></div>` : s.state === "revoked" ? `<div class="gst bad">${ic("lock", 15)}<span>Dieser Schlüssel wurde gesperrt.</span></div>` : "";
      body = `${note}<div class="mut sm" style="margin:2px 0 10px">Die Integration ist und bleibt kostenlos. Sponsoren bekommen Schönes obendrauf. Nichts, was du jetzt nutzt, wird gesperrt.</div>${perks}
        ${adm ? `<div class="lsec" style="margin-top:14px">${ic("key", 15)}Sponsor-Schlüssel</div><div class="mut sm" style="margin:0 0 6px">Bekommst du nach dem Sponsoring. Einfach einfügen.</div>
        <textarea class="osel spnta" data-f="spnkey" rows="3" placeholder="FH1-…" spellcheck="false" aria-label="Sponsor-Schlüssel"></textarea>
        <div class="tmerr" role="alert">${esc(m.err || "")}</div>
        <div class="gbtns" style="margin-top:8px"><button class="btn2 spnb" data-act="spnred">${ic("heart", 16)} Schlüssel einlösen</button>${link}</div>
        ${s.manage ? `<div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spnadm">${ic("users", 16)} Sponsoren verwalten</button></div>` : `<div style="margin-top:12px;text-align:center"><button class="lnk" data-act="spnadm" style="font-size:.7rem;opacity:.45">Entwickler-Zugang</button></div>`}`
        : `<div class="mut sm">Den Schlüssel trägt ein Administrator ein.</div><div class="gbtns" style="margin-top:10px">${link}</div>`}`;
    }
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>${ic("heart", 17)} Sponsor-Bereich</b><span>${s.active ? "Freigeschaltet" : "Noch nicht freigeschaltet"}</span></div>${close}</div>${body}</div>`;
  }
  _spnAdmModal(close) {
    const m = this._modal, A = this._spnA, head = (t, s, back) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div>${back ? `<button class="ibtn" data-act="${back}" aria-label="Zurück">${ic("back", 20)}</button>` : ""}${close}</div>`;
    const wrap = (h, b) => `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${h}${b}</div>`;
    if (!A) return wrap(head("Sponsoren verwalten", "Lädt …", ""), `<div class="mut sm">Einen Moment …</div>`);
    if (A.setup) {
      return wrap(head("Verwaltung einrichten", "Nur für den Entwickler", "spnback"), `<div class="mut sm" style="margin:0 0 8px">Füge hier den privaten Schlüssel ein (beginnt mit FHPRIV1-). Er bleibt in diesem Home Assistant, auch in dessen Sicherungen. Gib ihn nie weiter.</div>
        <textarea class="osel spnta" data-f="spnpriv" rows="2" placeholder="FHPRIV1-…" spellcheck="false" aria-label="Privater Schlüssel"></textarea><div class="tmerr" role="alert">${esc(m.err || "")}</div>
        <div class="gbtns" style="margin-top:8px"><button class="btn2 pri" data-act="spnsetup">${ic("key", 16)} Einrichten</button></div>`);
    }
    const item = (s) => {
      const st = { ok: ["g", "Aktiv"], soon: ["a", s.days === 0 ? "Heute" : `Noch ${s.days} ${s.days === 1 ? "Tag" : "Tage"}`], expired: ["x", "Abgelaufen"], revoked: ["r", "Gesperrt"] }[s.state];
      const act = s.state === "revoked" ? `<button class="spnmini" data-act="spnunrev" data-k="${s.id}">${ic("eye", 14)}Sperre aufheben</button>` : s.state === "ok" ? `<button class="spnmini" data-act="spnkey" data-k="${s.id}">${ic("copy", 14)}Schlüssel</button>` : `<button class="spnmini" data-act="spnext" data-k="${s.id}">${ic("clock", 14)}Verlängern</button>`;
      return `<div class="spnrow"><span class="spna ${s.state === "expired" || s.state === "revoked" ? "off" : ""}">${esc((s.name || "?")[0].toUpperCase())}</span><span class="spnn"><b>${esc(s.name)}</b><small>${s.state === "revoked" ? "gesperrt" + (s.revoked_at ? " am " + esc(this._spnDate(s.revoked_at)) : "") : (s.since ? "seit " + esc(this._spnDate(s.since)) + " · " : "") + "gültig bis " + esc(this._spnDate(s.bis))}${s.note ? " · " + esc(s.note) : ""}</small></span><em class="spns ${st[0]}">${st[1]}</em>${act}<button class="ibtn spnmore" data-act="spnrevq" data-k="${s.id}" aria-label="Sperren oder löschen">${ic("more", 18)}</button></div>`;
    };
    if (m.view === "new") {
      const d = new Date(); d.setFullYear(d.getFullYear() + 1); const def = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return wrap(head("Neuer Sponsor", "Drei Angaben", "spnlist"), `<div class="of"><div class="ol"><b>Name</b><span>Erscheint im Abzeichen und, wenn erlaubt, in der Danke-Liste</span></div></div><input class="osel" data-f="spnname" maxlength="40" placeholder="z. B. Anna K." aria-label="Name" style="width:100%;margin:0 0 8px">
        <div class="of"><div class="ol"><b>Gültig bis</b><span>Vorgabe: ein Jahr ab heute</span></div></div><input class="osel" type="date" data-f="spnbis" value="${def}" aria-label="Gültig bis" style="width:100%;margin:0 0 8px">
        <div class="of"><div class="ol"><b>Notiz (nur für dich)</b></div></div><input class="osel" data-f="spnnote" maxlength="120" placeholder="z. B. GitHub: annak" aria-label="Notiz" style="width:100%;margin:0 0 8px">
        <label class="spnck"><input type="checkbox" data-f="spndk"> In der Danke-Liste nennen (Sponsor ist einverstanden)</label>
        <div class="tmerr" role="alert">${esc(m.err || "")}</div><div class="gbtns" style="margin-top:8px"><button class="btn2 pri" data-act="spncreate">${ic("key", 16)} Schlüssel erzeugen</button></div>`);
    }
    if (m.view === "done") {
      const s = A.items.find((x) => x.id === m.id) || {};
      return wrap(head("Schlüssel", `${esc(s.name || "")}, gültig bis ${esc(this._spnDate(s.bis || ""))}`, "spnlist"), `<div class="spnkeybox">${esc(m.key)}</div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2 pri" data-act="spncopy">${ic("copy", 16)} Kopieren</button><button class="btn2" data-act="spnmsg">${ic("link", 16)} Nachricht kopieren</button></div>
        <div class="gbtns" style="margin-top:8px"><button class="btn2" data-act="spnmine">${ic("heart", 16)} Bei mir einlösen</button></div>
        <div class="mut sm" style="margin-top:8px">„Nachricht kopieren“ legt einen Text mit dem Schlüssel und einer kurzen Anleitung in die Zwischenablage.</div>`);
    }
    if (m.view === "revoke") {
      const s = A.items.find((x) => x.id === m.id); if (!s) return wrap(head("Sponsor", "", "spnlist"), "");
      let ids = []; try { ids = JSON.parse(A.revoked_json).gesperrt || []; } catch (_) { /* leer */ } if (!ids.includes(s.id)) ids = [...ids, s.id].sort();
      const json = JSON.stringify({ gesperrt: ids });
      return wrap(head(`${esc(s.name)}`, "Sperren oder entfernen", "spnlist"), `<div class="mut sm" style="margin:0 0 8px">Beim Sperren wird der Schlüssel hier als gesperrt markiert. Damit er auch beim Sponsor aufhört zu gelten, muss die Sperrliste im Repo aktualisiert werden. Die Datei heißt <b>sponsor_gesperrt.json</b>. Bis dahin gilt der Schlüssel, spätestens bis zum Ablaufdatum.</div>
        <div class="spnkeybox" style="color:#9be7c4">${esc(json)}</div>
        <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spnjson2" data-j="${esc(json)}">${ic("copy", 16)} Liste kopieren</button><button class="btn2 pri" data-act="spnrev" data-k="${s.id}" ${s.state === "revoked" ? "disabled" : ""}>${ic("lock", 16)} Sperren</button></div>
        <label class="spnck" style="margin-top:10px"><input type="checkbox" data-act="spndk" data-k="${s.id}" ${s.danke ? "checked" : ""}> In der Danke-Liste nennen</label>
        <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spndel" data-k="${s.id}">${ic("trash", 16)} Aus der Liste löschen</button></div>`);
    }
    const c = A.count || {};
    return wrap(head("Sponsoren verwalten", "Nur für dich sichtbar", "spnback"), `<div class="spnsum"><div><small>Aktiv</small><b>${(c.ok || 0) + (c.soon || 0)}</b></div><div><small>Laufen bald ab</small><b class="${c.soon ? "wa" : ""}">${c.soon || 0}</b></div><div><small>Abgelaufen oder gesperrt</small><b>${(c.expired || 0) + (c.revoked || 0)}</b></div></div>
      ${A.items.length ? A.items.map(item).join("") : `<div class="mut sm" style="margin:10px 0">Noch keine Sponsoren. Lege den ersten an.</div>`}
      <div class="gbtns" style="margin-top:12px"><button class="btn2 pri" data-act="spnnew">${ic("heart", 16)} Neuer Sponsor</button><button class="btn2" data-act="spndanke" ${A.danke.length ? "" : "disabled"}>${ic("copy", 16)} Danke-Liste kopieren</button></div>
      <div class="mut sm" style="margin-top:10px">Namen, Daten und Notizen bleiben in deinem Home Assistant. Das Dashboard weist dich ${30} Tage vor Ablauf darauf hin.</div>
      <div class="gbtns" style="margin-top:10px"><button class="btn2" data-act="spnforget" style="font-size:.8rem">Verwaltung ausschalten</button></div>`);
  }
  /* Modul 18: Licht & Lampen (Labs). Schaltet nur auf Fingertipp über Home Assistant (light.*, scene.*, script.*).
     Das Modul gibt es nur, solange das Lab „Licht & Lampen“ (li) an ist. Verknüpfte Szenen und ausgeblendete Räume stehen im Layout (layout.li). */
  _liLay() {
    const l = (this._cfg && this._cfg.layout && this._cfg.layout.li) || {}, sc = l.scenes && typeof l.scenes === "object" ? l.scenes : {};
    return { scenes: { night: sc.night || "", arrive: sc.arrive || "", cozy: sc.cozy || "" }, hours: [1, 2, 4].includes(l.hours) ? l.hours : 2, hidden: Array.isArray(l.hidden) ? l.hidden.filter((x) => typeof x === "string") : [] };
  }
  _liSave(patch) { const l = this._liLay(); this._cfg.layout.li = { scenes: l.scenes, hours: l.hours, hidden: l.hidden, ...patch }; this._saveLayout(); this._render(); if (this._modal) this._renderModal(); }
  _liAreaOf(eid) {
    const H = this._hass, en = (H.entities || {})[eid]; if (!en) return "";
    if (en.area_id) return en.area_id;
    const dv = en.device_id && (H.devices || {})[en.device_id]; return (dv && dv.area_id) || "";
  }
  _liAreaName(a) { if (!a) return "Ohne Raum"; const x = (this._hass.areas || {})[a]; return (x && x.name) || a; }
  /* Alle einzelnen Lampen. Lichtgruppen (mit entity_id-Liste) werden ausgelassen, sonst zählt jede Lampe doppelt. */
  _liLamps() {
    const st = this._hass.states, now = Date.now();
    return Object.keys(st).filter((e) => e.startsWith("light.") && !Array.isArray((st[e].attributes || {}).entity_id)).map((e) => {
      const s = st[e], a = s.attributes || {}, modes = Array.isArray(a.supported_color_modes) ? a.supported_color_modes : [], un = s.state === "unavailable" || s.state === "unknown";
      const dim = modes.some((m) => m !== "onoff"), ct = modes.includes("color_temp"), col = modes.some((m) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(m));
      const t = new Date(s.last_changed).getTime();
      return { id: e, name: a.friendly_name || e, on: s.state === "on", un, dim, ct, col, br: a.brightness != null ? Math.round(Number(a.brightness) / 2.55) : (s.state === "on" ? 100 : 0), kel: a.color_temp_kelvin || null, kmin: a.min_color_temp_kelvin || 2000, kmax: a.max_color_temp_kelvin || 6500, since: isFinite(t) ? now - t : 0, area: this._liAreaOf(e) };
    });
  }
  _liRooms() {
    const L = this._liLay(), by = {};
    this._liLamps().forEach((x) => { const k = x.area || "_"; (by[k] = by[k] || { k, name: this._liAreaName(x.area), lamps: [] }).lamps.push(x); });
    const all = Object.values(by).sort((a, b) => (a.k === "_") - (b.k === "_") || a.name.localeCompare(b.name, "de"));
    all.forEach((r) => { r.lamps.sort((a, b) => a.name.localeCompare(b.name, "de")); r.on = r.lamps.filter((x) => x.on); r.dim = r.lamps.filter((x) => x.dim && !x.un); r.hid = L.hidden.includes(r.k); });
    return all;
  }
  /* Ist im Raum ein Bewegungs-, Anwesenheits- oder Belegungssensor aktiv? Dann kein „Licht lange an“-Hinweis. */
  _liBusy(area) {
    if (!area) return false; const st = this._hass.states;
    return Object.keys(st).some((e) => e.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes((st[e].attributes || {}).device_class) && st[e].state === "on" && this._liAreaOf(e) === area);
  }
  _liDur(ms) { const m = Math.round(ms / 60000); return m < 60 ? `${m} Min.` : `${num(Math.floor(m / 60), 0)} Std.${m % 60 >= 10 ? " " + (m % 60) + " Min." : ""}`; }
  _liLong() { const lim = this._liLay().hours * 36e5; return this._liRooms().filter((r) => !r.hid).map((r) => ({ r, l: r.on.filter((x) => x.since >= lim) })).filter((x) => x.l.length && !this._liBusy(x.r.k === "_" ? "" : x.r.k)).map((x) => ({ r: x.r, ms: Math.max(...x.l.map((y) => y.since)), l: x.l })).sort((a, b) => b.ms - a.ms); }
  _liCall(dom, svc, data) { return this._hass.callService(dom, svc, data).catch(() => this._toast("Das hat nicht geklappt")); }
  _liSwatches(x) {
    const out = [];
    if (x.ct) [[2700, "Warmweiß"], [4000, "Neutralweiß"], [6000, "Kaltweiß"]].forEach(([k, t]) => out.push({ t, bg: k < 3500 ? "#ffb36b" : k < 5000 ? "#fff3e0" : "#cfe8ff", d: `data-kel="${Math.min(x.kmax, Math.max(x.kmin, k))}"`, on: x.kel && Math.abs(x.kel - Math.min(x.kmax, Math.max(x.kmin, k))) < 200 }));
    if (x.col) [[[167, 139, 250], "Violett"], [[244, 114, 182], "Rosa"], [[96, 165, 250], "Blau"], [[52, 211, 153], "Grün"], [[251, 191, 36], "Gelb"], [[248, 113, 113], "Rot"]].forEach(([c, t]) => out.push({ t, bg: `rgb(${c.join(",")})`, d: `data-rgb="${c.join(",")}"`, on: false }));
    return out;
  }
  _liSceneBtn(k, label, ico, pri) {
    const L = this._liLay(), e = L.scenes[k], ok = e && this._hass.states[e];
    if (!ok) return `<button class="btn2 lixun" data-act="lixscn" data-k="${k}" title="Noch nicht verknüpft">${ic("link", 15)} ${label}<small>verknüpfen</small></button>`;
    return `<button class="btn2 ${pri ? "pri" : ""}" data-act="lixscn" data-k="${k}" title="${esc(this._wzName(e))}">${ic(ico, 15)} ${label}</button>`;
  }
  _liPage() {
    const adm = this._admin(), rooms = this._liRooms(), shown = rooms.filter((r) => !r.hid), lamps = shown.flatMap((r) => r.lamps).filter((x) => !x.un);
    const banner = `<div class="labban">${ic("flask", 22)}<div><b>Labs · Licht & Lampen</b>Dieses Modul ist ein Experiment und nur da, solange das Lab eingeschaltet ist. Es schaltet nur, wenn du tippst.</div></div>`;
    if (!rooms.length) return `${banner}<div class="card empty">${ic("lamp", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Lampen gefunden</div>Es gibt in Home Assistant keine Entität light.*. Lampen richtest du in Home Assistant unter Geräte und Dienste ein.</div>`;
    const on = lamps.filter((x) => x.on), L = this._liLay(), long = this._liLong();
    const top = shown.slice().sort((a, b) => b.on.length - a.on.length)[0], mx = on.length ? Math.max(...on.map((x) => x.since)) : 0, longest = on.find((x) => x.since === mx);
    const mu = this._labOn("mm") ? this._mu() : null, mul = mu && mu.cfg && mu.cfg.light && mu.cfg.light.on && mu.cfg.light.ent ? mu.cfg.light.ent : "";
    const tiles = `<div class="lugrid lixtiles">${this._labTile("Lampen an", String(on.length), `von ${lamps.length} in ${shown.length} ${shown.length === 1 ? "Raum" : "Räumen"}`, on.length ? "amber" : "")}${this._labTile("Meiste Lampen an", top && top.on.length ? esc(top.name) : "–", top && top.on.length ? `${top.on.length} von ${top.lamps.length} an` : "Alles aus")}${this._labTile("Längste an", on.length ? this._liDur(mx) : "–", on.length && longest ? esc(longest.name) : "Nichts an")}${mul ? this._labTile("Müll-Licht", this._hass.states[mul] && this._hass.states[mul].state === "on" ? "An" : "Aus", esc(this._wzName(mul)) + " (Modul 17)") : ""}</div>`;
    const scn = `<div class="gbtns lixscn">${this._liSceneBtn("night", "Gute Nacht", "moon", true)}<button class="btn2" data-act="lixalloff" ${on.length ? "" : "disabled"}>${ic("lamp", 15)} Alle aus</button>${this._liSceneBtn("arrive", "Ankommen", "home")}${this._liSceneBtn("cozy", "Gemütlich", "fireplace")}</div>`;
    const names = ["night", "arrive", "cozy"].filter((k) => L.scenes[k] && this._hass.states[L.scenes[k]]).map((k) => `${{ night: "Gute Nacht", arrive: "Ankommen", cozy: "Gemütlich" }[k]}: ${esc(this._wzName(L.scenes[k]))}`);
    const now = `<div class="card"><h2>${ic("lamp", 18)}Jetzt</h2>${tiles}<div style="margin-top:12px">${scn}</div>${names.length ? `<div class="mut sm" style="margin-top:8px">${names.join(" · ")}</div>` : adm ? `<div class="mut sm" style="margin-top:8px">Die drei Knöpfe verknüpfst du in den Einstellungen mit deinen Szenen oder Skripten.</div>` : ""}</div>`;
    const hint = long.slice(0, 3).map((x) => `<div class="gst on lixhint">${ic("bell", 15)}<span><b>${esc(x.r.name === "Ohne Raum" ? "Licht ohne Raum" : "Im Raum „" + x.r.name + "“")} brennt seit ${this._liDur(x.ms)}</b> · ${x.l.map((y) => esc(y.name)).join(", ")}</span><button class="lnk" data-act="lixroomoff" data-k="${esc(x.r.k)}">Ausschalten</button></div>`).join("");
    const room = (r) => {
      const n = r.on.length, bp = r.dim.filter((x) => x.on), avg = bp.length ? Math.round(bp.reduce((a, x) => a + x.br, 0) / bp.length) : 0;
      return `<div class="card lixroom ${n ? "on" : ""}"><div class="lixhd"><span class="lixico">${ic("lamp", 20)}</span><div class="lixt"><b>${esc(r.name)}</b><small>${n ? `${n} von ${r.lamps.length} an` : "aus"}</small></div><button class="sw ${n ? "on" : ""}" data-act="lixroom" data-k="${esc(r.k)}" aria-pressed="${!!n}" aria-label="${esc(r.name)}: ${n ? "alle ausschalten" : "alle einschalten"}"></button></div>
        ${bp.length ? `<div class="lixrng"><span>${ic("sun", 14)}</span><input type="range" min="1" max="100" value="${avg}" data-f="lixbr" data-k="${esc(r.k)}" aria-label="Helligkeit ${esc(r.name)}"><b>${avg} %</b></div>` : ""}
        <div class="lixl">${r.lamps.map((x) => `<div class="lixlamp ${x.on ? "on" : ""} ${x.un ? "un" : ""}"><button class="lixnm" data-act="lixdet" data-k="${esc(x.id)}" ${x.un ? "disabled" : ""} aria-label="${esc(x.name)}: Details">${ic("lamp", 16)}<span>${esc(x.name)}${x.un ? `<small>nicht erreichbar</small>` : x.on && x.dim ? `<small>${x.br} %</small>` : ""}</span></button><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}" ${x.un ? "disabled" : ""}></button></div>`).join("")}</div></div>`;
    };
    return `${banner}${now}${hint}<div class="lixgrid">${shown.map(room).join("") || `<div class="card empty">Alle Räume sind ausgeblendet. Einblenden kannst du sie in den Einstellungen.</div>`}</div>`;
  }
  _lixAct(a, b) {
    const k = b.dataset.k, rooms = this._liRooms();
    if (a === "lixopen") { this._modal = { type: "lixset" }; this._renderModal(); return; }
    if (a === "lixdet") { this._modal = { type: "lixdet", id: k }; this._renderModal(); return; }
    if (a === "lixalloff") { this._modal = { type: "lixoff" }; this._renderModal(); return; }
    if (a === "lixalloffgo") { const ids = this._liLamps().filter((x) => x.on).map((x) => x.id); this._modal = null; this._renderModal(); if (ids.length) this._liCall("light", "turn_off", { entity_id: ids }); this._toast("Alle Lampen werden ausgeschaltet"); return; }
    if (a === "lixsw") { const x = this._liLamps().find((y) => y.id === k); if (x) this._liCall("light", x.on ? "turn_off" : "turn_on", { entity_id: k }); return; }
    if (a === "lixroom") { const r = rooms.find((y) => y.k === k); if (r) this._liCall("light", r.on.length ? "turn_off" : "turn_on", { entity_id: (r.on.length ? r.on : r.lamps.filter((x) => !x.un)).map((x) => x.id) }); return; }
    if (a === "lixroomoff") { const r = rooms.find((y) => y.k === k); if (r && r.on.length) this._liCall("light", "turn_off", { entity_id: r.on.map((x) => x.id) }); return; }
    if (a === "lixscn") {
      const e = this._liLay().scenes[k];
      if (!e || !this._hass.states[e]) { if (this._admin()) { this._modal = { type: "lixset" }; this._renderModal(); } else this._toast("Dieser Knopf ist noch nicht mit einer Szene verknüpft"); return; }
      this._liCall(e.split(".")[0], "turn_on", { entity_id: e }); this._toast(`${this._wzName(e)} wird ausgeführt`); return;
    }
    if (a === "lixcol") { const m = this._modal; if (!m || m.type !== "lixdet") return; const d = { entity_id: m.id }; if (b.dataset.kel) d.color_temp_kelvin = +b.dataset.kel; else if (b.dataset.rgb) d.rgb_color = b.dataset.rgb.split(",").map(Number); this._liCall("light", "turn_on", d); return; }
    if (a === "lixhrs") { this._liSave({ hours: +k }); return; }
    if (a === "lixhide") { const h = this._liLay().hidden; this._liSave({ hidden: h.includes(k) ? h.filter((x) => x !== k) : [...h, k] }); return; }
    if (a === "lixunlink") { const l = this._liLay(); this._liSave({ scenes: { ...l.scenes, [k]: "" } }); return; }
  }
  _lixChange(t) {
    const f = t.dataset.f, k = t.dataset.k, v = t.value || "";
    if (f === "lixsel") { if (["night", "arrive", "cozy"].includes(k) && (v === "" || /^(scene|script)\.[a-z0-9_]+$/.test(v))) { const l = this._liLay(); this._liSave({ scenes: { ...l.scenes, [k]: v } }); } return true; }
    if (f === "lixbr") { const r = this._liRooms().find((y) => y.k === k), p = Math.max(1, Math.min(100, Math.round(Number(v)))); if (r && r.dim.some((x) => x.on)) this._liCall("light", "turn_on", { entity_id: r.dim.filter((x) => x.on).map((x) => x.id), brightness_pct: p }); return true; }
    if (f === "lixdbr") { const m = this._modal; if (m && m.type === "lixdet") this._liCall("light", "turn_on", { entity_id: m.id, brightness_pct: Math.max(1, Math.min(100, Math.round(Number(v)))) }); return true; }
    if (f === "lixkel") { const m = this._modal; if (m && m.type === "lixdet") this._liCall("light", "turn_on", { entity_id: m.id, color_temp_kelvin: Math.round(Number(v)) }); return true; }
    return false;
  }
  _lixModal() {
    const m = this._modal, adm = this._admin();
    if (m.type === "lixoff") {
      const n = this._liLamps().filter((x) => x.on).length;
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>Alle Lampen ausschalten?</b><span>Modul 18 · Licht & Lampen</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="mut sm">${n ? `${n} ${n === 1 ? "Lampe ist" : "Lampen sind"} an und ${n === 1 ? "wird" : "werden"} jetzt ausgeschaltet. Das gilt für alle Räume, auch ausgeblendete.` : "Es ist keine Lampe an."}</div>
        <div class="foot2" style="margin-top:12px"><button class="btn2" data-act="close">Abbrechen</button><button class="btn2 pri" data-act="lixalloffgo" ${n ? "" : "disabled"}>Alle aus</button></div></div>`;
    }
    if (m.type === "lixdet") {
      const x = this._liLamps().find((y) => y.id === m.id); if (!x) return `<div class="ov" data-act="close"></div><div class="sheet"><div class="sh"><div><b>Lampe nicht gefunden</b></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div></div>`;
      const sw = this._liSwatches(x);
      return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sh"><div><b>${esc(x.name)}</b><span>${esc(this._liAreaName(x.area))} · ${x.un ? "nicht erreichbar" : x.on ? "an" : "aus"}</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="vrow"><span>Lampe</span><button class="sw ${x.on ? "on" : ""}" data-act="lixsw" data-k="${esc(x.id)}" aria-pressed="${x.on}" aria-label="${esc(x.name)} ${x.on ? "ausschalten" : "einschalten"}"></button></div>
        ${x.dim ? `<div class="vrow"><span>Helligkeit</span><span class="lixrng" style="flex:1;max-width:60%"><input type="range" min="1" max="100" value="${x.on ? x.br : 50}" data-f="lixdbr" aria-label="Helligkeit"><b>${x.on ? x.br + " %" : "aus"}</b></span></div>` : `<div class="mut sm" style="margin:8px 0">Diese Lampe kann nur ein- und ausgeschaltet werden.</div>`}
        ${x.ct ? `<div class="vrow"><span>Weißton<small class="mut" style="display:block">${x.kel ? x.kel + " Kelvin" : "warm bis kalt"}</small></span><span class="lixrng" style="flex:1;max-width:60%"><input type="range" min="${x.kmin}" max="${x.kmax}" step="100" value="${x.kel || Math.round((x.kmin + x.kmax) / 2)}" data-f="lixkel" aria-label="Weißton"></span></div>` : ""}
        ${sw.length ? `<div class="lsec">${ic("palette", 15)}Lichtfarbe</div><div class="lixsw">${sw.map((s) => `<button class="lixc ${s.on ? "on" : ""}" style="background:${s.bg}" data-act="lixcol" ${s.d} aria-label="${esc(s.t)}" title="${esc(s.t)}"></button>`).join("")}</div>` : ""}
        <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
    }
    const L = this._liLay(), H = this._hass, st = H.states, sc = Object.keys(st).filter((e) => e.startsWith("scene.") || e.startsWith("script.")), rooms = this._liRooms();
    const slot = (k, t, h) => `<div class="lsec" style="margin-top:10px">${ic("link", 15)}${t}</div><div class="mut sm" style="margin:0 0 4px">${h}</div>${this._wzSel(sc, L.scenes[k], "lixsel", `data-k="${k}"`, "– nicht verknüpft –", /schlaf|nacht|aus|bed|night|ankomm|heim|home|arriv|gem(ü|u)t|cozy|relax|abend/i)}`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true"><div class="sh"><div><b>Licht & Lampen</b><span>Modul 18 · Labs · gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("lamp", 15)}Szenenknöpfe</div>
      <div class="mut sm" style="margin:0 0 4px">Jeder Knopf ruft eine Szene oder ein Skript aus Home Assistant auf. Ohne Auswahl bleibt er unverknüpft und öffnet diese Einstellungen. „Alle aus“ ist eingebaut.</div>
      ${slot("night", "Gute Nacht", "Zum Beispiel deine Szene zum Schlafengehen")}${slot("arrive", "Ankommen", "Zum Beispiel Licht im Flur und Wohnzimmer")}${slot("cozy", "Gemütlich", "Zum Beispiel warmes, gedimmtes Licht")}
      <div class="lsec" style="margin-top:14px">${ic("bell", 15)}Hinweis „Licht lange an“</div>
      <div class="vrow"><span>Hinweis ab<small class="mut" style="display:block">So lange darf eine Lampe an sein. Meldet ein Bewegungs- oder Anwesenheitssensor im Raum etwas, kommt kein Hinweis.</small></span><div class="seg">${[1, 2, 4].map((h) => `<button class="${L.hours === h ? "sel" : ""}" data-act="lixhrs" data-k="${h}" ${adm ? "" : "disabled"}>${h} Std.</button>`).join("")}</div></div>
      <div class="lsec" style="margin-top:14px">${ic("door", 15)}Räume</div>
      <div class="mut sm" style="margin:0 0 6px">Ausgeblendete Räume (zum Beispiel Garten oder Keller) fehlen auf der Seite, auch bei „Alle aus“ der Seitenübersicht. „Alle aus“ schaltet trotzdem jede Lampe.</div>
      <div class="gschips">${rooms.map((r) => `<button class="gsch ${r.hid ? "" : "sel"}" data-act="lixhide" data-k="${esc(r.k)}" aria-pressed="${!r.hid}" ${adm ? "" : "disabled"}>${esc(r.name)} (${r.lamps.length})</button>`).join("")}</div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  /* Lab „Tags & Karten“ (tg): RFID-Karten und NFC-Sticker lösen feste Aktionen aus. Die Tags und ihre Aktionen liegen im Backend (tags.py),
     hier stehen nur Anzeige und Bedienung. Es gibt keine freien Dienstaufrufe, nur die feste Liste des Backends. */
  _tgxLoad(force) {
    if (!this._hass || this._tgxBusy) return;
    if (!force && this._tgxD && Date.now() - this._tgxTs < 20000) return;
    this._tgxBusy = true;
    this._hass.callWS({ type: "fenster_heizung/tg_get" }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); }).catch(() => {})
      .finally(() => { this._tgxBusy = false; this._tgxRefresh(); });
  }
  _tgxIs() { const m = this._modal; return !!(m && ["tgxmgr", "tgxedit", "tgxfb"].includes(m.type)); }
  _tgxRefresh() { if (this._tgxIs() && this._modal.type === "tgxmgr") { this._renderModal(); this._tgxPoll(); } }
  _tgxPoll() {
    clearTimeout(this._tgxT);
    const D = this._tgxD;
    if (D && D.learn && D.learn.active && this._modal && this._modal.type === "tgxmgr") this._tgxT = setTimeout(() => this._tgxLoad(true), 1500);
  }
  _tgxPut(cfg) {
    return this._hass.callWS({ type: "fenster_heizung/tg_set", cfg }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); }).catch(() => this._toast("Das hat nicht geklappt"));
  }
  _tgxCall(act, tid) {
    return this._hass.callWS({ type: "fenster_heizung/tg_act", act, tid: tid || "" }).then((r) => { this._tgxD = r; this._tgxTs = Date.now(); return r; }).catch(() => { this._toast("Das hat nicht geklappt"); return null; });
  }
  _tgxWhen(ts) {
    const d = new Date(ts * 1000), n = new Date(), hm = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === n.toDateString()) return "Heute " + hm;
    const y = new Date(n.getTime() - 864e5); return (d.toDateString() === y.toDateString() ? "Gestern " : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }) + " ") + hm;
  }
  _tgxPerson(id) { const s = this._hass.states[id]; return s && s.attributes && s.attributes.friendly_name ? s.attributes.friendly_name : String(id || "").replace("person.", ""); }
  _tgxDesc(a) {
    const D = this._tgxD, c = D && D.actions.find((x) => x.k === a.k); if (!c) return "Unbekannte Aktion";
    if (a.k === "pres_vac") return `Urlaub für ${a.arg} ${a.arg === 1 ? "Tag" : "Tage"}`;
    if (a.k === "person_home" || a.k === "person_away") return `${this._tgxPerson(a.arg)} ist ${a.k === "person_home" ? "zu Hause" : "unterwegs"}`;
    if (a.k === "mu_done") return `${(D.bins || {})[a.arg] || "Tonne"} ist draußen`;
    return c.n;
  }
  _tgxIcon(a) { const g = (this._tgxD.actions.find((x) => x.k === a.k) || {}).g; return { fh: "home", pe: "user", ww: "drop", ev: "car", mu: "trash", li: "lamp" }[g] || "nfc"; }
  _tgxNeed(k) {
    const g = ((this._tgxD.actions.find((x) => x.k === k)) || {}).g;
    if (g === "li" && !this._labOn("li")) return "Modul 18 ist nicht eingeschaltet (Labs).";
    if (g === "mu" && !this._labOn("mm")) return "Modul 17 ist nicht eingeschaltet (Labs).";
    return "";
  }
  _tgxCfgNow() { const c = this._tgxD.cfg; return { tags: { ...c.tags }, fb: { ...c.fb } }; }
  _tgxBlank(id) { return { id, isNew: true, name: "", on: true, act: { k: "", arg: null }, persons: [], fb: { notify: false, tts: false, blink: false }, from: "", to: "", g: "" }; }
  _tgxAct(a, b) {
    const k = b.dataset.k, D = this._tgxD, m = this._modal;
    if (a === "tgxopen") { this._modal = { type: "tgxmgr" }; this._tgxLoad(true); this._renderModal(); return; }
    if (!D && a !== "tgxopen") return;
    if (a === "tgxback") { clearTimeout(this._tgxT); this._modal = { type: "tgxmgr" }; this._renderModal(); this._tgxPoll(); return; }
    if (a === "tgxlearn") { this._tgxCall("learn").then(() => { this._renderModal(); this._tgxPoll(); }); return; }
    if (a === "tgxstop") { clearTimeout(this._tgxT); this._tgxCall("stop").then(() => this._renderModal()); return; }
    if (a === "tgxnew") { clearTimeout(this._tgxT); const f = D.learn && D.learn.found; this._tgxCall("stop"); const t = f && D.cfg.tags[f.id]; this._modal = { type: "tgxedit", draft: t ? { ...t, id: f.id, isNew: false, g: (D.actions.find((x) => x.k === t.act.k) || {}).g || "" } : this._tgxBlank(f ? f.id : k) }; this._renderModal(); return; }
    if (a === "tgxedit") { clearTimeout(this._tgxT); const t = D.cfg.tags[k]; if (!t) return; this._modal = { type: "tgxedit", draft: { ...t, id: k, isNew: false, g: (D.actions.find((x) => x.k === t.act.k) || {}).g || "" } }; this._renderModal(); return; }
    if (a === "tgxfb") { clearTimeout(this._tgxT); this._modal = { type: "tgxfb" }; this._renderModal(); return; }
    if (a === "tgxforget") { this._tgxCall("forget", k).then(() => this._renderModal()); return; }
    if (a === "tgxtog") { const c = this._tgxCfgNow(), t = c.tags[k]; if (!t) return; c.tags[k] = { ...t, on: !t.on }; this._tgxPut(c).then(() => this._renderModal()); return; }
    if (a === "tgxfbn") { const c = this._tgxCfgNow(), l = c.fb.notify || []; c.fb = { ...c.fb, notify: l.includes(k) ? l.filter((x) => x !== k) : [...l, k] }; this._tgxPut(c).then(() => this._renderModal()); return; }
    if (!m || m.type !== "tgxedit") return;
    const d = m.draft;
    if (a === "tgxg") { d.g = k; if (!D.actions.some((x) => x.g === k && x.k === d.act.k)) d.act = { k: "", arg: null }; }
    else if (a === "tgxa") { const c = D.actions.find((x) => x.k === k); d.act = { k, arg: c.arg === "days" ? 7 : c.arg === "bin" ? "rest" : c.arg === "person" ? "" : null }; }
    else if (a === "tgxdays") d.act.arg = Math.min(21, Math.max(1, (d.act.arg || 7) + Number(b.dataset.s)));
    else if (a === "tgxbin") d.act.arg = k;
    else if (a === "tgxwho") d.persons = d.persons.includes(k) ? d.persons.filter((x) => x !== k) : [...d.persons, k];
    else if (a === "tgxfbt") d.fb[k] = !d.fb[k];
    else if (a === "tgxwclr") { d.from = ""; d.to = ""; }
    else if (a === "tgxsave") {
      if (!d.act.k || (d.act.k.startsWith("person_") && !d.act.arg)) { this._toast("Bitte eine Aktion wählen"); return; }
      const c = this._tgxCfgNow(), { id, isNew, g, ...t } = d; t.name = (d.name || "").trim() || "Tag"; t.from = d.from && d.to ? d.from : ""; t.to = d.from && d.to ? d.to : "";
      c.tags[id] = t; this._tgxPut(c).then(() => { this._modal = { type: "tgxmgr" }; this._renderModal(); this._tgxPoll(); this._toast("Tag gespeichert"); }); return;
    }
    else if (a === "tgxtest") {
      if (!d.act.k || d.isNew) { this._toast(d.isNew ? "Erst speichern, dann testen" : "Bitte eine Aktion wählen"); return; }
      this._tgxCall("test", d.id).then((r) => this._toast(r && r.test ? r.test.msg : "Das hat nicht geklappt")); return;
    }
    else if (a === "tgxdel") { const c = this._tgxCfgNow(); delete c.tags[d.id]; this._tgxPut(c).then(() => { this._modal = { type: "tgxmgr" }; this._renderModal(); this._toast("Tag gelöscht"); }); return; }
    this._renderModal();
  }
  _tgxChange(t) {
    const f = t.dataset.f, v = t.value || "", m = this._modal;
    if (f === "tgxname" && m && m.draft) { m.draft.name = v.slice(0, 40); return true; }
    if (f === "tgxfrom" && m && m.draft) { m.draft.from = v; if (m.draft.from && !m.draft.to) m.draft.to = "23:59"; return true; }
    if (f === "tgxto" && m && m.draft) { m.draft.to = v; if (m.draft.to && !m.draft.from) m.draft.from = "00:00"; return true; }
    if (f === "tgxperson" && m && m.draft) { m.draft.act.arg = /^person\.[a-z0-9_]+$/.test(v) ? v : ""; this._renderModal(); return true; }
    if (f === "tgxtts" || f === "tgxplayer" || f === "tgxlight") {
      const c = this._tgxCfgNow(), ok = v === "" || /^[a-z_]+\.[a-z0-9_]+$/.test(v);
      if (!ok) return true;
      c.fb = { ...c.fb, tts: { ...c.fb.tts }, ...(f === "tgxlight" ? { light: v } : {}) };
      if (f === "tgxtts") c.fb.tts.ent = v; if (f === "tgxplayer") c.fb.tts.player = v;
      this._tgxPut(c).then(() => this._renderModal()); return true;
    }
    return false;
  }
  _tgxModal() {
    const m = this._modal, D = this._tgxD, adm = this._admin();
    const hd = (t, s, back) => `<div class="sh"><div><b>${t}</b><span>${s}</span></div><button class="ibtn" data-act="${back ? "tgxback" : "close"}" aria-label="${back ? "Zurück" : "Schließen"}">${ic(back ? "back" : "close", 20)}</button></div>`;
    if (!D) return `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${hd("Tags & Karten", "Labs · lädt …")}<div class="mut sm">Die Tags werden geladen.</div></div>`;
    if (m.type === "tgxfb") {
      const F = D.cfg.fb, st = this._hass.states, ids = (p) => Object.keys(st).filter((e) => e.startsWith(p)), svc = Object.keys((this._hass.services || {}).notify || {}).filter((x) => x !== "notify" && x !== "send_message").map((x) => "notify." + x);
      return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd("Rückmeldung einrichten", "Tags & Karten · gilt für alle Tags", true)}
        <div class="mut sm" style="margin:0 0 6px">Hier legst du fest, wohin die Rückmeldung geht. Pro Tag schaltest du dann ein, ob sie kommt.</div>
        <div class="lsec">${ic("bell", 15)}Handy-Nachricht</div>
        <div class="gschips">${svc.length ? svc.map((s) => `<button class="gsch ${F.notify.includes(s) ? "sel" : ""}" data-act="tgxfbn" data-k="${esc(s)}" aria-pressed="${F.notify.includes(s)}" ${adm ? "" : "disabled"}>${esc(s.replace("notify.", ""))}</button>`).join("") : `<span class="mut sm">Es gibt keine Benachrichtigungsdienste (notify).</span>`}</div>
        <div class="lsec" style="margin-top:12px">${ic("tv", 15)}Ansage</div>
        <div class="vrow"><span>Sprachdienst</span>${this._wzSel(ids("tts."), F.tts.ent, "tgxtts", "", "– nicht gewählt –")}</div>
        <div class="vrow"><span>Lautsprecher</span>${this._wzSel(ids("media_player."), F.tts.player, "tgxplayer", "", "– nicht gewählt –")}</div>
        <div class="lsec" style="margin-top:12px">${ic("lamp", 15)}Licht blinkt</div>
        <div class="mut sm" style="margin:0 0 4px">Blinkt kurz grün, bei einem Fehler rot.</div>
        <div class="vrow"><span>Lampe</span>${this._wzSel(ids("light.").filter((e) => !Array.isArray((st[e].attributes || {}).entity_id)), F.light, "tgxlight", "", "– nicht gewählt –")}</div>
        <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="tgxback">Fertig</button></div></div>`;
    }
    if (m.type === "tgxedit") {
      const d = m.draft, A = D.actions, gs = Object.keys(D.groups), cur = A.find((x) => x.k === d.act.k), fb = D.cfg.fb;
      const persons = Object.keys(this._hass.states).filter((e) => e.startsWith("person."));
      const chip = (act, k, label, on, extra = "") => `<button class="gsch ${on ? "sel" : ""}" data-act="${act}" data-k="${esc(k)}" aria-pressed="${on}" ${extra}>${esc(label)}</button>`;
      const need = d.act.k ? this._tgxNeed(d.act.k) : "";
      const arg = !cur ? "" : cur.arg === "days" ? `<div class="vrow"><span>Dauer</span><div class="step" style="flex:none"><button data-act="tgxdays" data-s="-1" aria-label="weniger">${ic("minus", 18)}</button><b>${d.act.arg} ${d.act.arg === 1 ? "Tag" : "Tage"}</b><button data-act="tgxdays" data-s="1" aria-label="mehr">${ic("plus", 18)}</button></div></div>`
        : cur.arg === "bin" ? `<div class="gschips" style="margin:6px 0">${Object.entries(D.bins).map(([k, n]) => chip("tgxbin", k, n, d.act.arg === k)).join("")}</div>`
        : cur.arg === "person" ? `<div style="margin:6px 0">${this._wzSel(persons, d.act.arg || "", "tgxperson", "", "– Person wählen –")}</div><div class="mut sm">${d.act.k === "person_home" ? "Zählt für die automatische Abwesenheit als „zu Hause“, höchstens 12 Stunden." : "Gilt als „unterwegs“. Sind alle unterwegs, wechseln die Räume nach der eingestellten Zeit auf „Abwesend“."}</div>` : "";
      const fbk = (k, t, ok, why) => chip("tgxfbt", k, t, !!d.fb[k] && ok, ok ? "" : `disabled title="${esc(why)}"`);
      return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd(d.isNew ? "Neuen Tag einrichten" : "Tag bearbeiten", `${esc(d.name || "Tag")} · gilt für alle Nutzer`, true)}
        <div class="vrow"><span>Name<small class="mut" style="display:block">Zum Beispiel „Nachttisch-Sticker“</small></span><input type="text" data-f="tgxname" value="${esc(d.name)}" maxlength="40" placeholder="Name" aria-label="Name" style="flex:1;max-width:55%;background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit"></div>
        <div class="mut sm" style="margin:0 0 6px">Kennung: <code>${esc(d.id)}</code></div>
        <div class="lsec">${ic("tools", 15)}Aktion (feste Auswahl)</div>
        <div class="gschips">${gs.map((g) => chip("tgxg", g, D.groups[g], d.g === g)).join("")}</div>
        ${d.g ? `<div class="gschips" style="margin-top:8px">${A.filter((x) => x.g === d.g).map((x) => chip("tgxa", x.k, x.n, d.act.k === x.k)).join("")}</div>` : `<div class="mut sm" style="margin-top:6px">Wähle zuerst den Bereich.</div>`}
        ${arg}${need ? `<div class="stowarn" style="margin-top:8px">${ic("alert", 16)}<span>${esc(need)} Die Aktion tut nichts, solange das aus ist.</span></div>` : ""}
        <div class="lsec" style="margin-top:12px">${ic("users", 15)}Nur diese Personen</div>
        <div class="mut sm" style="margin:0 0 4px">Ohne Auswahl darf jeder. Wer scannt, erkennt Home Assistant nur beim Handy mit Companion-App. Ein Leser ohne Person (zum Beispiel ESPHome) führt einen Tag mit Auswahl nicht aus.</div>
        <div class="gschips">${persons.length ? persons.map((p) => chip("tgxwho", p, this._tgxPerson(p), d.persons.includes(p))).join("") : `<span class="mut sm">Keine Personen in Home Assistant.</span>`}</div>
        <div class="lsec" style="margin-top:12px">${ic("bell", 15)}Rückmeldung</div>
        <div class="gschips">${fbk("notify", "Handy-Nachricht", fb.notify.length > 0, "Erst unter „Rückmeldung einrichten“ einen Dienst wählen")}${fbk("tts", "Ansage", !!(fb.tts.ent && fb.tts.player), "Erst unter „Rückmeldung einrichten“ Sprachdienst und Lautsprecher wählen")}${fbk("blink", "Licht blinkt", !!fb.light, "Erst unter „Rückmeldung einrichten“ eine Lampe wählen")}</div>
        <div class="lsec" style="margin-top:12px">${ic("clock", 15)}Zeitfenster (optional)</div>
        <div class="vrow"><span>Nur zwischen<small class="mut" style="display:block">Über Mitternacht möglich, zum Beispiel 20:00 bis 06:00</small></span><span style="display:flex;gap:6px;align-items:center"><input type="time" data-f="tgxfrom" value="${esc(d.from)}" aria-label="von" style="background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px"> bis <input type="time" data-f="tgxto" value="${esc(d.to)}" aria-label="bis" style="background:var(--primary-background-color);color:var(--primary-text-color);border:1px solid var(--line);border-radius:10px;padding:8px">${d.from ? `<button class="oclr" data-act="tgxwclr" aria-label="Zurücksetzen">${ic("close", 14)}</button>` : ""}</span></div>
        <div class="foot2" style="margin-top:12px">${d.isNew ? "" : `<button class="btn2" data-act="tgxdel" style="color:#fb7185">Löschen</button>`}<button class="btn2" data-act="tgxtest" ${d.isNew ? "disabled" : ""}>Testen</button><button class="btn2 pri" data-act="tgxsave" ${adm ? "" : "disabled"}>Speichern</button></div></div>`;
    }
    const tags = Object.entries(D.cfg.tags), L = D.learn || {}, F = L.found, lg = (D.log || []).slice(0, 6);
    const rc = { ok: "#2dd4bf", fail: "#fb7185", unknown: "#fb7185", deny: "#fbbf24", off: "#fbbf24", time: "#fbbf24" };
    const ready = this._tgxReady();
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">${hd("Tags & Karten", "Labs · gilt für alle Nutzer")}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px"><div class="mut sm">${tags.length ? `${tags.length} ${tags.length === 1 ? "Tag" : "Tags"} angelernt` : "Noch kein Tag angelernt"}${D.unknown.length ? ` · ${D.unknown.length} unbekannt gescannt` : ""}</div><button class="btn2 pri" data-act="tgxlearn" ${adm && !L.active ? "" : "disabled"}>${ic("plus", 16)} Tag anlernen</button></div>
      ${L.active && !F ? `<div class="tgxscan"><span class="tgxpulse">${ic("nfc", 30)}</span><b>Jetzt Karte oder Sticker an einen Leser halten …</b><span class="mut sm">Wartet noch ${L.left} Sekunden</span><button class="btn2" data-act="tgxstop">Abbrechen</button></div>` : ""}
      ${F ? `<div class="tgxscan found"><span class="tgxpulse">${ic("check", 30)}</span><b>${F.known ? "Bekannter Tag erkannt" : "Neuer Tag erkannt"}</b><span class="mut sm">${esc(F.id)} · ${esc(F.reader)}</span><button class="btn2 pri" data-act="tgxnew" data-k="${esc(F.id)}">${F.known ? "Bearbeiten" : "Einrichten"}</button></div>` : ""}
      ${ready ? `<div class="stowarn">${ic("alert", 16)}<span>${esc(ready)}</span></div>` : ""}
      ${tags.length ? `<div class="sxl tgxl">${tags.map(([id, t]) => { const l = D.last[id]; return `<div class="tgxrow"><button class="sxrow" data-act="tgxedit" data-k="${esc(id)}"><span class="sxi">${ic(this._tgxIcon(t.act), 20)}</span><span class="sxt"><b>${esc(t.name)}</b><small>${esc(this._tgxDesc(t.act))}${l ? ` · zuletzt ${esc(this._tgxWhen(l.ts))}, ${esc(l.reader)}` : " · noch nicht gescannt"}</small></span></button><button class="sw ${t.on ? "on" : ""}" data-act="tgxtog" data-k="${esc(id)}" aria-pressed="${t.on}" aria-label="${esc(t.name)} ${t.on ? "ausschalten" : "einschalten"}" ${adm ? "" : "disabled"}></button></div>`; }).join("")}</div>` : `<div class="mut sm" style="margin:10px 0">Tippe auf „Tag anlernen“ und halte eine Karte oder einen Sticker an einen Leser. Als Leser taugt das Handy mit NFC (Companion-App), ein ESPHome-Leser (PN532 oder RC522) und jeder andere Leser, der in Home Assistant Tags meldet.</div>`}
      ${D.unknown.length ? `<div class="lsec">${ic("info", 15)}Unbekannte Tags</div>${D.unknown.map((u) => `<div class="vrow tgxunk"><span><b>${esc(u.id.length > 22 ? u.id.slice(0, 20) + "…" : u.id)}</b><small class="mut" style="display:block">${esc(this._tgxWhen(u.ts))} · ${esc(u.reader)}</small></span><span style="display:flex;gap:6px"><button class="btn2" data-act="tgxnew" data-k="${esc(u.id)}" ${adm ? "" : "disabled"}>Zuordnen</button><button class="btn2" data-act="tgxforget" data-k="${esc(u.id)}" ${adm ? "" : "disabled"}>Verwerfen</button></span></div>`).join("")}` : ""}
      <div class="lsec">${ic("bell", 15)}Rückmeldung</div>
      <div class="vrow"><span>Handy, Ansage oder blinkendes Licht<small class="mut" style="display:block">${D.cfg.fb.notify.length || D.cfg.fb.tts.ent || D.cfg.fb.light ? "Eingerichtet. Pro Tag schaltest du sie ein." : "Noch nicht eingerichtet."}</small></span><button class="btn2" style="flex:none" data-act="tgxfb" ${adm ? "" : "disabled"}>Einrichten</button></div>
      ${lg.length ? `<div class="lsec">${ic("list", 15)}Protokoll</div><div class="tgxlog">${lg.map((x) => `<div><span class="mut">${esc(this._tgxWhen(x.ts))}</span><b>${esc(x.name)}</b><span class="mut">${esc(x.reader)}</span><span style="color:${rc[x.res] || "inherit"}">${esc(x.msg)}</span></div>`).join("")}</div>` : ""}
      <div class="stowarn" style="margin-top:10px">${ic("alert", 16)}<span><b>Karten und Sticker lassen sich kopieren.</b> Deshalb gibt es keine Aktionen, die einen Alarm entschärfen oder etwas aufschließen. Jeder Tag führt genau eine Aktion aus der festen Liste aus.</span></div>
      <div class="foot2" style="margin-top:12px"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }
  _tgxReady() {
    const D = this._tgxD; if (!D || !D.on) return "Das Lab „Tags & Karten“ ist ausgeschaltet. Tags werden erst nach dem Einschalten ausgeführt.";
    return "";
  }
  _mdBar() {
    const a = this._mdActive(), bad = this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn");
    return `<nav class="mbar" aria-label="Module">${this._mdList().map((m) => `<button class="mtab ${a === m.id ? "sel" : ""}" data-act="mdgo" data-k="${m.id}" aria-pressed="${a === m.id}">${ic(m.icon, 20)}<span><small>${m.n ? "Modul " + m.n : m.start ? "Übersicht" : "Eigenes Modul"}</small><b>${esc(m.short)}</b></span>${m.id === "ww" && bad ? `<i class="mdot" title="Hinweise vorhanden"></i>` : ""}${modSt(m) ? `<em class="${STG[modSt(m)].c}">${STG[modSt(m)].t}</em>` : ""}</button>`).join("")}${this._labTab()}${this._admin() && this._stoCfg().tab ? `<button class="mtab sto" data-act="igopen" aria-label="Store: Integrationen und Dienste">${ic("puzzle", 20)}<span><small>Entdecken</small><b>Store</b></span>${this._stoTodo() ? `<i class="sdot">${this._stoTodo()}</i>` : ""}</button>` : `<button class="mtab add" data-act="mdmgr" aria-label="Module verwalten">${ic("plus", 18)}<span><small>Erweitern</small><b>Module</b></span></button>`}</nav>`;
  }
  _mdRender() {
    const sr = this.shadowRoot, a = this._mdActive(), m = this._mdList().find((x) => x.id === a), adm = this._admin();
    let body = "", pills = "";
    if (a === "ww") { body = this._wwPage(); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; this._wwLoad(); }
    else if (a === "gs") { body = this._gsPage(); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else if (a === "st") { body = this._hzPage(); pills = adm ? `<button class="pillbtn" data-act="hzopen" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>${this._edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`}` : ""; }
    else if (a === "mu") { body = this._muPage(); pills = adm ? `<button class="pillbtn" data-act="muxopen" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>${this._edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`}` : ""; this._muLoad(); }
    else if (a === "li") { body = this._liPage(); pills = adm ? `<button class="pillbtn" data-act="lixopen" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else if (m.beta) { body = this._betaPage(a); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else if (a === "en") { body = this._enPage(); pills = adm ? `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else body = `<div class="card empty">${ic("puzzle", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">${esc(m.name)}</div>Dieses Modul wird aus <code>${esc(m.ext.url)}</code> geladen.<br><span class="sm">Externe Module werden in einer späteren Version geladen.</span></div>`;
    if (a !== "ww" && a !== "en" && a !== "gs" && a !== "mu" && a !== "li" && a !== "st" && !m.beta && adm) pills = `<button class="pillbtn" data-act="mdst" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><img class="blogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false"><div><em class="pn">${esc(PRODUCT)}</em><b>${m.n ? `<i class="mn">Modul ${m.n} – </i>` : ""}${esc(m.name)}</b><span>${modSt(m) ? `<em class="${STG[modSt(m)].c}">${STG[modSt(m)].h}</em>` : ""}<em class="tag">${esc(m.tag)}</em>${this._labHdr(a)}${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>${this._tmBtn()}${this._spnBtn()}${this._stoBtn()}${pills}</div>
      ${this._mdBar()}<div class="wrap">${this._tmHint()}${this._labCards(a)}${body}</div>`;
  }
  _mdAct(a, b) {
    const s = this._mdState(), m = this._modal, k = b.dataset.k;
    if (a === "mdgo") { this._stOpen = false; this._edit = false; this._mdActiveSet(k); this._render(); }
    else if (a === "mdst") { this._stOpen = true; this._render(); }
    else if (a === "mdstx") { this._stOpen = false; this._render(); }
    else if (a === "mdmgr") { this._modal = { type: "mods" }; this._renderModal(); }
    else if (a === "mdsetup") { this._modal = { type: "wwset" }; this._renderModal(); }
    else if (a === "mdevset") { this._modal = { type: "evset" }; this._renderModal(); }
    else if (a === "mdgs") { this._modal = { type: "gsset" }; this._renderModal(); }
    else if (a === "mdbeta") { this._toast("Für dieses Modul gibt es in der Beta noch keine Einstellungen"); }
    else if (a === "mdensetup") { this._modal = { type: "enset" }; this._renderModal(); }
    else if (a === "mdtog") {
      if (k === "ww") s.on.ww = !s.on.ww; else if (k === "en") { s.on.en = !this._enOn(); this._enState().on = s.on.en; } else if (k === "gs") s.on.gs = s.on.gs === false; else if (MODS.some((m) => m.beta && m.id === k)) s.on[k] = s.on[k] !== true; else { const x = s.ext.find((e) => e.id === k); if (x) x.on = !x.on; }
      if (!this._mdList().some((x) => x.id === s.active)) this._mdActiveSet("fh");
      this._mdSave(); this._renderModal(); this._render();
    }
    else if (a === "mdextadd") {
      const inp = this.shadowRoot.querySelector('[data-f="mdurl"]'), url = (inp ? inp.value : "").trim();
      if (!/^(https:\/\/|\/local\/|\/hacsfiles\/).+\.js$/i.test(url)) { m.err = "Bitte die Adresse der Moduldatei eintragen, z. B. /local/mein-modul.js oder https://…/modul.js"; m.url = url; this._renderModal(); return; }
      const base = decodeURIComponent(url.split("/").pop().replace(/\.js$/i, "")).replace(/[-_.]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      s.ext.push({ id: "x" + Date.now().toString(36), name: base || "Eigenes Modul", url, on: true }); m.err = ""; m.url = ""; this._mdSave(); this._renderModal(); this._render(); this._toast("Modul hinzugefügt");
    }
    else if (a === "mdextdel") { s.ext = s.ext.filter((x) => x.id !== k); if (s.active === k) this._mdActiveSet("fh"); this._mdSave(); this._renderModal(); this._render(); }
    else if (a === "mdhacs") { this._modal = null; this._renderModal(); this._nav("/hacs"); }
    else if (a === "mdinfo") { m.info = !m.info; this._renderModal(); }
    else if (a.startsWith("ww")) this._wwAct(a, b);
    else if (a.startsWith("en")) this._enAct(a, b);
    else if (a.startsWith("gs")) this._gsAct(a, b);
    else if (a === "evbrand" || a === "evbody" || a === "evcol") { const V = this._evState(); if (a === "evbrand") V.brand = V.brand === b.dataset.k ? "" : b.dataset.k; else if (a === "evbody") V.body = b.dataset.k; else V.color = b.dataset.k; this._mdSave(); this._renderModal(); }
    else if (a === "evdone") { this._pkId = null; this._modal = null; this._renderModal(); this._render(); }
  }
  _mdChange(t) {
    const f = t.dataset.f, m = this._modal;
    if (f === "mdurl") { if (m) m.url = t.value; return true; }
    if (f.startsWith("ww")) return this._wwChange(t);
    if (f.startsWith("en")) return this._enChange(t);
    if (f.startsWith("gs")) return this._gsChange(t);
    if (f === "evmodel") { this._evState().model = String(t.value || "").replace(/[<>"'&]/g, "").slice(0, 30); this._mdSave(); return true; }
    if (f === "event") { this._evState().ent[t.dataset.k] = t.value; this._mdSave(); return true; }
    return false;
  }
  _mdModal() {
    const m = this._modal;
    if (m.type === "wwset") return this._wwSetModal();
    if (m.type === "wwsch") return this._wwSchModal();
    if (m.type === "enset") return this._enSetModal();
    if (m.type === "gsset") return this._gsSetModal();
    if (m.type === "evset") return this._evSetModal();
    const s = this._mdState(), W = s.ww, ok = this._wwConfigured();
    const row = (id, ico, name, sub, right) => `<div class="mrow"><span class="mi">${ic(ico, 22)}</span><div class="mt"><b>${esc(name)}</b><span>${sub}</span></div>${right}</div>`;
    const tog = (id, on) => `<button class="sw ${on ? "on" : ""}" data-act="mdtog" data-k="${id}" aria-pressed="${on}" aria-label="Modul ein- oder ausschalten"></button>`;
    return `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Module</b><span>Funktionen erweitern, ohne dass sie sich stören</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("check", 15)}Installiert</div>
      ${row("fh", "windowOpen", "Modul 1 – Fenster & Heizung", "Fenster, Heizpläne, Elektroheizer, Berichte", `<span class="mbadge">Grundmodul</span>`)}
      ${row("ww", "boiler", "Modul 2 – Warmwasser & Zirkulation", ok ? "Eingerichtet" : "Noch nicht eingerichtet", `<span class="mact">${!ok && s.on.ww ? `<button class="btn2 pri" data-act="mdsetup">Einrichten</button>` : ""}${tog("ww", s.on.ww)}</span>`)}
      ${row("en", "energy", "Modul 3 – Energie-Übersicht", this._enConfigured() ? "Eingerichtet" : "Noch nicht eingerichtet", `<span class="mact">${!this._enConfigured() && this._enOn() ? `<button class="btn2 pri" data-act="mdensetup">Einrichten</button>` : ""}${tog("en", this._enOn())}</span>`)}
      ${s.ext.map((x) => row(x.id, "puzzle", x.name, `<code>${esc(x.url)}</code>`, `<span class="mact"><button class="ibtn" data-act="mdextdel" data-k="${x.id}" aria-label="Modul entfernen">${ic("trash", 17)}</button>${tog(x.id, x.on)}</span>`)).join("")}
      ${row("gs", "laundry", "Modul 4 – Gerätestrom", this._gsState().devices.length ? this._gsState().devices.length + (this._gsState().devices.length === 1 ? " Gerät" : " Geräte") : "Noch nicht eingerichtet", `<span class="mact">${tog("gs", s.on.gs !== false)}</span>`)}
      ${MODS.filter((x) => x.beta).map((x) => row(x.id, x.icon, `Modul ${x.n} – ${x.name}`, esc(x.tag) + " · " + { dev: "in Entwicklung", beta: "Beta", vorab: "Vorabversion" }[modSt(x)], `<span class="mact"><span class="mbadge ${STG[modSt(x)].c}">${STG[modSt(x)].t}</span>${tog(x.id, s.on[x.id] === true)}</span>`)).join("")}
      ${MOD_SOON.length ? `<div class="lsec">${ic("clock", 15)}Geplant</div>
      ${MOD_SOON.map(([ico, n, t]) => row("", ico, n, t, `<span class="mbadge soon">Geplant</span>`)).join("")}` : ""}
      <div class="lsec">${ic("plus", 15)}Weiteres Modul hinzufügen</div>
      <div class="mut sm" style="margin:2px 0 8px">Module sind kleine Erweiterungen. Sie nutzen deine Räume, die PV-Einstellungen und die Meldungen mit und erscheinen hier als eigene Seite.</div>
      <div class="gbtns"><button class="btn2" data-act="mdhacs">${ic("download", 16)} Über HACS suchen</button></div>
      <div class="mut sm" style="margin:4px 0 0">Oder die Adresse einer Moduldatei eintragen</div>
      <div class="murl"><input class="otxt" data-f="mdurl" placeholder="/local/mein-modul.js" value="${esc(m.url || "")}" autocomplete="off" spellcheck="false"><button class="btn2 pri" data-act="mdextadd">Hinzufügen</button></div>
      ${m.err ? `<div class="gst on">${ic("alert", 15)}${esc(m.err)}</div>` : ""}
      <button class="lnk" data-act="mdinfo">${ic("info", 15)}Wie funktionieren Module?</button>
      ${m.info ? `<div class="minfo"><b>So ist es aufgebaut</b><ul><li>Jedes Modul meldet sich mit <b>ID, Name, Symbol und einer Seite</b> (JavaScript-Datei) an.</li><li>Es bekommt Zugriff auf Räume, PV-Überschuss, Benachrichtigungen und die Gerätediagnose.</li><li>Was ein Modul speichert, bleibt in seinem eigenen Bereich. Ausschalten löscht nichts.</li><li>Module werden einzeln über HACS installiert und haben eigene Versionen.</li></ul></div>` : ""}
      <div class="foot2"><button class="btn2 pri" data-act="close">Fertig</button></div></div>`;
  }

  /* ---- Warmwasser: Daten ---- */
  _wwV(e) { const s = e && this._hass.states[e], v = s ? parseFloat(String(s.state).replace(",", ".")) : NaN; return isFinite(v) ? v : null; }
  _wwIsOn(e) { const s = e && this._hass.states[e]; return !!s && WW_ON.includes(s.state); }
  _wwConfigured() { const e = this._mdState().ww.ent; return !!(e.top || e.mid || e.bot || e.pump); }
  _wwDay() { const w = this._mdState().ww; return w.day || (new Date().getDay() % 6 === 0 ? "we" : "wd"); }
  _wwTemps() { const e = this._mdState().ww.ent; return { top: this._wwV(e.top), mid: this._wwV(e.mid), bot: this._wwV(e.bot) }; }
  _wwNowSched() {
    const W = this._mdState().ww, d = new Date(), key = d.getDay() % 6 === 0 ? "we" : "wd", mi = d.getHours() * 60 + d.getMinutes();
    const hit = (W.heat[key] || []).find((x) => mi >= wwTm(x.from) && mi < wwTm(x.to));
    return hit ? hit.temp : W.heat.low;
  }
  _wwShowers(t) {
    const W = this._mdState().ww, th = [t.top, t.mid, t.bot].filter((v) => v != null); if (!th.length) return null;
    const part = W.size / th.length; let mixed = 0;
    th.forEach((v) => { if (v > 38) mixed += part * (v - 10) / 28; });
    return Math.floor(mixed / 50);
  }
  _wwWant() { const W = this._mdState().ww; return W.info && Number.isFinite(W.info.want) ? W.info.want : W.boost ? W.leg.temp : W.away ? W.heat.low : this._wwNowSched(); }
  _wwStatus() {
    const W = this._mdState().ww, t = this._wwTemps(), want = this._wwWant();
    if (t.top != null && t.top >= 65) return ["alert", "Zu heiß", "warn"];
    if (W.info && W.info.leg) return ["shield", "Legionellenschutz läuft", "warn"];
    if (W.boost) return ["flame", "Einmal-Aufheizen läuft", "warn"];
    if (W.away) return ["suitcase", "Abwesend – Sparmodus", "mut"];
    if (this._wwIsOn(W.ent.src) || this._wwIsOn(W.ent.rod)) return ["flame", `Heizt auf ${num(want, 0)} °C`, "warn"];
    if (t.top != null && t.top >= want - 3) return ["check", "Bereit", "ok"];
    if (t.top != null) return ["alert", `Unter Soll (${num(want, 0)} °C)`, "warn"];
    return ["info", "Kein Messwert", "mut"];
  }
  _wwProblems() {
    const W = this._mdState().ww, E = W.ent, out = [];
    if (!this._hass || !this._wwConfigured()) return [["mut", "info", "Modul nicht eingerichtet", "Wähle unter „Einstellungen“ die Sensoren und Schalter für Speicher und Pumpe."]];
    const nm = (e) => this._wzName(e);
    [["top", "Speicher oben"], ["mid", "Speicher Mitte"], ["bot", "Speicher unten"], ["ret", "Rücklauf"]].forEach(([k, l]) => {
      if (!E[k]) return; const st = this._hass.states[E[k]];
      if (!st || ["unavailable", "unknown"].includes(st.state)) out.push(["bad", "alert", `${l}: nicht erreichbar`, `${nm(E[k])} liefert keinen Wert. Die Regelung ist an dieser Stelle blind.`]);
    });
    const t = this._wwTemps(), want = this._wwNowSched();
    if (t.top != null && t.top >= 65) out.push(["warn", "alert", `Speicher sehr heiß (${num(t.top, 1)} °C)`, "Ab 60 °C am Zapfhahn droht Verbrühungsgefahr. Mischer oder Begrenzung prüfen."]);
    else if (t.top != null && t.top < Math.min(want, W.heat.low) - 5 && !W.away) out.push(["warn", "alert", `Speicher kühler als Soll (${num(t.top, 1)} °C)`, `Soll ist ${num(want, 0)} °C. Heizt der Erzeuger nicht an?`]);
    const rv = this._wwV(E.ret);
    if (E.pump && this._wwIsOn(E.pump) && rv != null && rv >= W.circ.ret_max + 5) out.push(["warn", "thermo", `Rücklauf sehr warm (${num(rv, 1)} °C)`, "Pumpe läuft, obwohl der Rücklauf warm ist. Schwerkraftbremse oder Pumpenschaltung prüfen."]);
    if (W.leg.on) { const d = this._wwLegDays(); if (d != null && d > 9) out.push(["warn", "shield", `Legionellenschutz überfällig (${d} Tage)`, "Die letzte Aufheizung auf Schutztemperatur ist länger als 9 Tage her."]); }
    return out.length ? out : [["ok", "check", "Alles in Ordnung", `Sensoren erreichbar, Speicher im Soll${E.pump ? ", Pumpe unauffällig" : ""}.`]];
  }
  _wwLegDays() { const l = this._mdState().ww.leg.last; return l ? Math.floor((Date.now() - new Date(l.ts).getTime()) / 864e5) : null; }

  /* ---- Warmwasser: Verlauf (24 h) ---- */
  _wwLoad(force) {
    const W = this._mdState().ww, E = W.ent, ids = [E.top, E.mid, E.bot, E.ret, E.pump, E.src, E.rod].filter(Boolean);
    if (!this._hass || !ids.length) return;
    if (!force && this._wwH && Date.now() - this._wwH.ts < 3e5) return;
    if (this._wwBusy) return; this._wwBusy = true;
    const end = new Date(), start = new Date(+end - 864e5);
    this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false })
      .then((res) => { this._wwH = { ts: Date.now(), start: +start, end: +end, res: res || {} }; })
      .catch(() => { this._wwH = { ts: Date.now(), start: +start, end: +end, res: {}, err: true }; })
      .finally(() => { this._wwBusy = false; if (this._mdActive() === "ww" && !this._dragging) this._render(); });
  }
  _wwSeries(eid) { const H = this._wwH; if (!H || !eid) return []; return ((H.res || {})[eid] || []).map((x) => ({ t: ((x.lu ?? x.lc ?? H.start / 1000) * 1000 - H.start) / 6e4, s: x.s })); }
  _wwMinutesOn(eid) {
    const ser = this._wwSeries(eid), H = this._wwH; if (!ser.length || !H) return null;
    const total = (H.end - H.start) / 6e4; let sum = 0;
    ser.forEach((x, i) => { const t0 = Math.max(0, x.t), t1 = i + 1 < ser.length ? ser[i + 1].t : total; if (WW_ON.includes(x.s)) sum += Math.max(0, t1 - t0); });
    return Math.round(sum);
  }
  /* Sollwert des Zeitplans zu einem Zeitpunkt (Wochentag, Uhrzeit), für die gestrichelte Ziel-Linie */
  _wwSchedAt(ts) {
    const W = this._mdState().ww, d = new Date(ts), key = d.getDay() % 6 === 0 ? "we" : "wd", mi = d.getHours() * 60 + d.getMinutes();
    const hit = (W.heat[key] || []).find((x) => mi >= wwTm(x.from) && mi < wwTm(x.to));
    return hit ? hit.temp : W.heat.low;
  }
  _wwAt(ser, m) { let v = null; for (const x of ser) { if (x.t <= m) v = x; else break; } return v; }
  _wwChart() {
    const W = this._mdState().ww, E = W.ent, H = this._wwH;
    if (!H) return `<div class="mut sm" style="padding:30px 0;text-align:center">Verlauf wird geladen …</div>`;
    const lines = [["top", "oben", E.top], ["mid", "Mitte", E.mid], ["bot", "unten", E.bot]].filter((x) => x[2]).map(([k, l, e]) => ({ k, l, ser: this._wwSeries(e).map((x) => ({ t: x.t, v: parseFloat(x.s) })).filter((x) => isFinite(x.v)) })).filter((x) => x.ser.length);
    if (!lines.length) return `<div class="mut sm" style="padding:30px 0;text-align:center">Für den Verlauf fehlen Messwerte der Speicher-Sensoren.</div>`;
    const cw = this.clientWidth || 390, avail = cw >= 720 ? Math.min(780, cw * 0.94) : cw, Wd = Math.max(300, Math.min(748, Math.floor(avail - 32))), Ht = Wd < 500 ? 250 : 300, L = 34, R = 10, T = 12, B = 26, iw = Wd - L - R, ih = Ht - T - B, total = (H.end - H.start) / 6e4;
    const all = lines.flatMap((x) => x.ser.map((p) => p.v)), lo = Math.floor((Math.min(...all, W.heat.low) - 3) / 5) * 5, hi = Math.ceil((Math.max(...all, W.target) + 3) / 5) * 5;
    const X = (m) => L + (Math.max(0, Math.min(total, m)) / total) * iw, Y = (v) => T + ih - ((v - lo) / (hi - lo)) * ih;
    const cols = { top: "#f97316", mid: "#fbbf24", bot: "#38bdf8" }, top = lines.find((x) => x.k === "top") || lines[0];
    const segs = (eid) => { const ser = this._wwSeries(eid), out = []; ser.forEach((x, i) => { if (!WW_ON.includes(x.s)) return; const t0 = Math.max(0, x.t), t1 = i + 1 < ser.length ? ser[i + 1].t : total; if (t1 > t0) out.push([t0, t1]); }); return out; };
    const gen = E.src || E.rod ? segs(E.src || E.rod) : [], pump = E.pump ? segs(E.pump) : [];
    this._wwGeo = { W: Wd, L, iw, total, X, Y, lines, top, gen, pump, hasGen: !!(E.src || E.rod), hasPump: !!E.pump };
    let s = `<svg class="wwc2" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Speichertemperaturen der letzten 24 Stunden"><defs><linearGradient id="wwag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cols[top.k]}" stop-opacity=".22"/><stop offset="1" stop-color="${cols[top.k]}" stop-opacity="0"/></linearGradient></defs>`;
    for (let v = Math.ceil(lo / 10) * 10; v <= hi; v += 10) s += `<line x1="${L}" x2="${Wd - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--mut)">${v}°</text>`;
    const first = Math.ceil(H.start / 36e5) * 36e5;
    for (let i = 0; i <= 24; i++) { const ts = first + i * 36e5, d = new Date(ts); if (d.getHours() % 6 || ts > H.end) continue; const m = (ts - H.start) / 6e4; s += `<line x1="${X(m)}" x2="${X(m)}" y1="${T}" y2="${T + ih}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${X(m)}" y="${Ht - 8}" text-anchor="middle" font-size="11" fill="var(--mut)">${String(d.getHours()).padStart(2, "0")}:00</text>`; }
    for (const [a, b] of gen) s += `<rect x="${X(a)}" y="${T}" width="${Math.max(2, X(b) - X(a))}" height="${ih}" fill="#f97316" opacity=".12"/>`;
    let tp = "", py = null;
    for (let m = 0; m <= total; m += 5) { const v = this._wwSchedAt(H.start + m * 6e4); if (py === null) tp += `M${X(m).toFixed(1)} ${Y(v).toFixed(1)} `; else if (v !== py) tp += `L${X(m).toFixed(1)} ${Y(py).toFixed(1)} L${X(m).toFixed(1)} ${Y(v).toFixed(1)} `; py = v; }
    tp += `L${X(total).toFixed(1)} ${Y(py).toFixed(1)}`;
    s += `<path d="${tp}" fill="none" stroke="#7dd3fc" stroke-width="1.8" stroke-dasharray="5 4" opacity=".9"/>`;
    /* Messwerte kommen oft im Sekundentakt und rauschen: zu 12-Minuten-Mittelwerten zusammenfassen und mit einer weichen Kurve zeichnen */
    const smooth = (ser) => {
      const bk = [], B = 12; let cur = null;
      for (const q of ser) { const i = Math.floor(q.t / B); if (!cur || cur.i !== i) { cur = { i, n: 0, t: 0, v: 0 }; bk.push(cur); } cur.n++; cur.t += q.t; cur.v += q.v; }
      const pts = bk.map((b) => ({ t: b.t / b.n, v: b.v / b.n }));
      if (pts.length) { pts[0] = { t: Math.max(0, ser[0].t), v: ser[0].v }; pts.push({ t: total, v: pts[pts.length - 1].v }); }
      return pts;
    };
    const path = (ser) => {
      const p = smooth(ser).map((q) => [X(q.t), Y(q.v)]); if (p.length < 2) return p.length ? `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}` : "";
      let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c, lo = Math.min(b[1], c[1]), hi = Math.max(b[1], c[1]);
        const y1 = Math.min(hi, Math.max(lo, b[1] + (c[1] - a[1]) / 6)), y2 = Math.min(hi, Math.max(lo, c[1] - (e[1] - b[1]) / 6));
        d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${y1.toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${y2.toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
      }
      return d;
    };
    s += `<path d="${path(top.ser)} L${X(total)} ${T + ih} L${X(Math.max(0, top.ser[0].t))} ${T + ih} Z" fill="url(#wwag)"/>`;
    lines.slice().reverse().forEach((x) => { s += `<path d="${path(x.ser)}" fill="none" stroke="${cols[x.k]}" stroke-width="${x === top ? 2 : 1.7}" stroke-linejoin="round" stroke-linecap="round"/>`; });
    s += `<line id="wxl" x1="0" x2="0" y1="${T}" y2="${T + ih}" stroke="var(--mut)" opacity=".7" visibility="hidden"/><circle id="wxc" r="5.5" cx="0" cy="0" fill="var(--card)" stroke="${cols[top.k]}" stroke-width="2.4" visibility="hidden"/></svg>`;
    const bar = (segsOn, c) => { let x = 0, h = ""; segsOn.forEach(([a, b]) => { if (a > x) h += `<i style="width:${((a - x) / total * 100).toFixed(2)}%;background:transparent"></i>`; h += `<i style="width:${((b - Math.max(a, x)) / total * 100).toFixed(2)}%;background:${c}"></i>`; x = b; }); return `<div class="rbar" aria-hidden="true">${h}</div>`; };
    const leg = lines.map((x) => `<span style="--c:${cols[x.k]}"><i></i>${x.l}</span>`).join("") + `<span style="--c:#7dd3fc"><i class="d"></i>Soll (Zeitplan)</span>` + (E.src || E.rod ? `<span style="--c:#f97316"><i class="b"></i>Erzeuger an</span>` : "");
    return `<div class="rleg">${leg}</div><div class="rwrap" id="wwrap">${s}<div class="rtip" id="wtip" style="display:none"></div></div>
      ${E.pump ? `${bar(pump, "#2dd4bf")}<div class="rleg" style="margin:6px 0 0"><span style="--c:#2dd4bf"><i class="b" style="background:#2dd4bf"></i>Zirkulationspumpe an</span></div>` : ""}`;
  }
  _wwHover(m) {
    const g = this._wwGeo, sr = this.shadowRoot; if (!g) return;
    const xl = sr.getElementById("wxl"), c = sr.getElementById("wxc"), tip = sr.getElementById("wtip"), H = this._wwH; if (!tip || !H) return;
    const x = g.X(m), tv = this._wwAt(g.top.ser, m), vals = g.lines.map((l) => { const p = this._wwAt(l.ser, m); return [l, p ? p.v : null]; });
    if (xl) { xl.setAttribute("x1", x); xl.setAttribute("x2", x); xl.removeAttribute("visibility"); }
    if (c && tv) { c.setAttribute("cx", x); c.setAttribute("cy", g.Y(tv.v)); c.removeAttribute("visibility"); }
    const ts = H.start + m * 6e4, d = new Date(ts), hh = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`, nm = { top: "oben", mid: "Mitte", bot: "unten" }, sol = this._wwSchedAt(ts);
    const on = (arr) => arr.some(([a, b]) => m >= a && m < b), cc = { top: "#f97316", mid: "#fbbf24", bot: "#38bdf8" };
    tip.style.display = ""; tip.style.left = Math.min(Math.max(x / g.W * 100, 17), 83) + "%";
    tip.innerHTML = `${hh} Uhr<b>${vals[0][1] != null ? num(vals[0][1], 1) : "–"} °C</b>${vals.slice(1).map(([l, v]) => `<div class="st" style="--c:${cc[l.k]}"><i></i>${nm[l.k]} ${v != null ? num(v, 1) + " °C" : "–"}</div>`).join("")}<div class="st" style="--c:#7dd3fc"><i></i>Soll ${num(sol, 0)} °C</div>${g.hasGen ? `<div class="st" style="--c:${on(g.gen) ? "#f97316" : "var(--line)"}"><i></i>${on(g.gen) ? "Erzeuger an" : "Erzeuger aus"}</div>` : ""}${g.hasPump && on(g.pump) ? `<div class="st" style="--c:#2dd4bf"><i></i>Pumpe läuft</div>` : ""}`;
  }
  _wwTank(t) {
    const col = (v) => wwCol(v), top = t.top ?? t.mid ?? t.bot, mid = t.mid ?? top, bot = t.bot ?? mid, f = (v) => (v == null ? "–" : num(v, 1));
    return `<svg class="wwtank" viewBox="0 0 196 176" role="img" aria-label="Speicher">
      <defs><linearGradient id="wwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col(top)}"/><stop offset=".5" stop-color="${col(mid)}"/><stop offset="1" stop-color="${col(bot)}"/></linearGradient></defs>
      <path d="M62 14V5M30 154v13" stroke="rgba(255,255,255,.7)" stroke-width="5" stroke-linecap="round"/>
      <rect x="12" y="14" width="76" height="140" rx="17" fill="url(#wwg)" stroke="rgba(255,255,255,.7)" stroke-width="2.5"/>
      <rect x="21" y="24" width="8" height="120" rx="4" fill="#fff" opacity=".22"/>
      <path d="M44 120c10 0 10-10 20-10s10 10 20 10" stroke="rgba(255,255,255,.55)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0"/>
      ${(() => { const r = [[38, t.top, "oben"], [88, t.mid, "Mitte"], [138, t.bot, "unten"]].filter((x) => x[1] != null); return r.length === 1 ? [[88, r[0][1], r[0][2]]] : r; })().map(([y, v, l]) => `<circle cx="88" cy="${y}" r="4.5" fill="#fff" stroke="${col(v)}" stroke-width="2"/><path d="M93 ${y}h14" stroke="rgba(255,255,255,.5)"/><text x="112" y="${y - 1}" font-size="19" font-weight="700" fill="#fff">${f(v)}<tspan font-size="12" font-weight="500" opacity=".8"> °C</tspan></text><text x="112" y="${y + 14}" font-size="11" fill="#fff" opacity=".7">${l}</text>`).join("")}</svg>`;
  }

  /* ---- Warmwasser: Seite ---- */
  _wwBar(list, kind) {
    const W = this._mdState().ww, now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
    const seg = (list || []).map((x) => { const a = wwTm(x.from), b = wwTm(x.to); return `<i class="seg1 ${kind}" style="left:${(a / 14.4).toFixed(2)}%;width:${(Math.max(0, b - a) / 14.4).toFixed(2)}%;${kind === "heat" ? `background:${wwCol(x.temp)}` : ""}" title="${x.from}–${x.to}">${kind === "heat" && b - a >= 120 ? `<em>${x.temp}°</em>` : ""}</i>`; }).join("");
    return `<div class="wwbar ${kind}" style="${kind === "heat" ? `--low:${wwCol(W.heat.low)}` : ""}">${seg}<u style="left:${(nm / 14.4).toFixed(2)}%" title="Jetzt"></u></div><div class="wwax"><span>0</span><span>6</span><span>12</span><span>18</span><span>24 Uhr</span></div>`;
  }
  _wwList(list, kind) { return (list || []).length ? (list || []).map((x) => `<span class="wwr">${x.from}–${x.to}${kind === "heat" ? ` · <b style="color:${wwCol(x.temp)}">${x.temp} °C</b>` : ""}</span>`).join("") : `<span class="mut sm">Keine Zeiten – ${kind === "heat" ? "es gilt immer die Absenktemperatur." : "die Pumpe bleibt aus."}</span>`; }
  _wwPage() {
    const W = this._mdState().ww, E = W.ent, adm = this._admin();
    if (!this._wwConfigured()) return `<div class="card empty wwe">${ic("boiler", 40)}<div class="t1">Warmwasser & Zirkulation einrichten</div>
      <div class="sm" style="max-width:460px;margin:0 auto 14px">Wähle deinen Speicher-Sensor, den Wärmeerzeuger und die Zirkulationspumpe. Danach siehst du Temperatur, Zeitpläne und Legionellenschutz auf einen Blick.</div>
      <ul class="wwl"><li>${ic("clock", 16)}Zeitpläne für Aufheizen und Zirkulation</li><li>${ic("bolt", 16)}Überschuss aus PV im Speicher nutzen</li><li>${ic("shield", 16)}Legionellenschutz mit Nachweis</li></ul>
      ${adm ? `<button class="btn2 pri" data-act="mdsetup" style="margin-top:16px;flex:none;padding:12px 22px">${ic("tools", 16)} Modul einrichten</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    const t = this._wwTemps(), st = this._wwStatus(), sh = this._wwShowers(t), want = this._wwWant(), key = this._wwDay(), today = new Date().getDay() % 6 === 0 ? "we" : "wd";
    const pumpOn = this._wwIsOn(E.pump), rv = this._wwV(E.ret), legD = this._wwLegDays(), pvNow = this._pvNow(), srcMin = this._wwMinutesOn(E.src || E.rod), pumpMin = this._wwMinutesOn(E.pump);
    const circH = (W.circ[today] || []).reduce((a, x) => a + Math.max(0, wwTm(x.to) - wwTm(x.from)), 0) / 60;
    const probs = this._wwProblems(), hasGen = !!(E.src || E.rod), hasPump = !!E.pump;
    const hero = `<div class="card hero wwh">
      <div class="wwl1"><div class="lbl">${ic("drop", 16)}Warmwasser oben im Speicher</div>
      <div class="big">${t.top != null ? num(t.top, 1) : "–"}<small>°C</small></div><div class="sub">Soll ${num(want, 0)} °C · ${W.size} Liter</div></div>
      <div class="wwtk">${this._wwTank(t)}</div>
      <div class="chips"><span class="chip st ${st[2]}">${ic(st[0], 16)}${st[1]}</span>${sh != null ? `<span class="chip">${ic("shower", 16)}Reicht für ca. ${sh} ${sh === 1 ? "Dusche" : "Duschen"}</span>` : ""}${E.pump ? `<span class="chip">${ic("drop", 16)}Zirkulation ${pumpOn ? "läuft" : "aus"}</span>` : ""}${W.pv.on && pvNow != null ? `<span class="chip">${ic("bolt", 16)}PV-Überschuss ${wfmt(pvNow)}</span>` : ""}</div>
      ${adm ? `<div class="wwacts"><button class="wwa ${W.boost ? "on" : ""}" data-act="wwboost" ${hasGen || W.boost ? "" : "disabled"} title="${hasGen ? "" : "Kein Wärmeerzeuger gewählt"}">${ic("flame", 17)}<span>${W.boost ? "Aufheizen stoppen" : "Einmal aufheizen"}</span>${hasGen || W.boost ? "" : "<small>Kein Erzeuger gewählt</small>"}</button><button class="wwa ${W.circ5 ? "on" : ""}" data-act="wwcirc5" ${E.pump ? "" : "disabled"}>${ic("clock", 17)}<span>${W.circ5 ? "Zirkulation läuft 5 Min." : "Zirkulation 5 Min."}</span>${E.pump ? "" : "<small>Keine Pumpe gewählt</small>"}</button><button class="wwa ${W.away ? "on" : ""}" data-act="wwaway">${ic("suitcase", 17)}<span>${W.away ? "Abwesend: an" : "Abwesend"}</span></button></div>` : ""}</div>`;
    const tiles = `<div class="tiles">${[
      ["flame", "Erzeuger", srcMin == null ? "–" : srcMin, "Min.", "var(--amber)", hasGen ? "Aktive Zeit, letzte 24 Std." : "Kein Erzeuger gewählt"],
      ["drop", "Zirkulation", pumpMin == null ? "–" : pumpMin, "Min.", "var(--teal)", hasPump ? `Plan: ${num(circH, 1)} Std. pro Tag` : "Keine Pumpe gewählt"],
      ["thermo", "Rücklauf", rv == null ? "–" : num(rv, 1), "°C", "#60a5fa", E.ret ? `Pumpe stoppt ab ${W.circ.ret_max} °C` : "Kein Sensor gewählt"],
      ["shield", "Legionellenschutz", legD == null ? "–" : legD, legD === 1 ? "Tag her" : "Tage her", "#a78bfa", !hasGen ? "Kein Erzeuger gewählt" : W.leg.on ? `Nächster Lauf: ${DAYS[W.leg.day]} ${W.leg.time}` : "Ausgeschaltet"],
    ].map(([ico, lab, v, u, col, sub]) => `<div class="tile" style="--a:${col}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div></div>`).join("")}</div>`;
    const chart = `<div class="card wwc"><h2>${ic("chart", 18)}Speicher · letzte 24 Stunden<button class="ibtn gear" style="margin-left:auto" data-act="wwreload" aria-label="Aktualisieren">${ic("clock", 16)}</button></h2>${this._wwChart()}</div>`;
    const dayTabs = (w) => `<div class="seg wwseg" role="group">${[["wd", "Montag–Freitag"], ["we", "Wochenende"]].map(([k, l]) => `<button class="${key === k ? "sel" : ""}" data-act="wwday" data-k="${k}" aria-pressed="${key === k}">${l}</button>`).join("")}</div>`;
    const heatC = `<div class="card"><h2>${ic("plan", 18)}Warmwasser-Zeitplan${adm ? `<button class="lnk" style="margin-left:auto" data-act="wwsch" data-k="heat">${ic("pencil", 15)}Bearbeiten</button>` : ""}</h2>${dayTabs()}
      ${hasGen ? "" : `<div class="wwempty">${ic("flame", 22)}<div><b>Noch kein Wärmeerzeuger gewählt</b><span>Der Zeitplan wird erst wirksam, wenn ein Erzeuger oder Heizstab gewählt ist. Bis dahin dient er nur der Anzeige.</span></div>${adm ? `<button class="lnk" data-act="mdsetup">Auswählen</button>` : ""}</div>`}
      <div class="${hasGen ? "" : "wwdim"}">${this._wwBar(W.heat[key], "heat")}<div class="wwrs">${this._wwList(W.heat[key], "heat")}</div></div>
      <div class="wwnote">${ic("moon", 15)}<span>Außerhalb der Zeiten hält der Speicher <b>${W.heat.low} °C</b>. ${W.pv.on ? "Bei PV-Überschuss heizt er bis " + W.pv.max + " °C." : ""}</span></div></div>`;
    const modes = [["plan", "Zeitplan"], ["demand", "Bei Bedarf"], ["interval", "Intervall"], ["off", "Aus"]];
    const cm = W.circ.mode;
    const circC = !hasPump ? `<div class="card"><h2>${ic("drop", 18)}Zirkulation</h2>
      <div class="wwempty big">${ic("drop", 30)}<div><b>Keine Zirkulationspumpe gewählt</b><span>Wähle in den Einstellungen den Schalter der Pumpe. Danach kannst du Zeitplan, Bedarf oder Intervall einstellen und siehst, wann sie läuft.</span></div>${adm ? `<button class="btn2 pri" data-act="mdsetup" style="flex:none;padding:10px 18px">Pumpe wählen</button>` : ""}</div></div>` : `<div class="card"><h2>${ic("drop", 18)}Zirkulation${E.pump ? `<span class="wwst ${pumpOn ? "on" : ""}">${pumpOn ? "Pumpe läuft" : "Pumpe aus"}</span>` : ""}</h2>
      <div class="seg wwseg" role="group">${modes.map(([k, l]) => `<button class="${cm === k ? "sel" : ""}" data-act="wwmode" data-k="${k}" aria-pressed="${cm === k}">${l}</button>`).join("")}</div>
      ${cm === "off" ? `<div class="mut sm">Die Pumpe bleibt aus. Warmes Wasser kommt am Hahn mit Wartezeit.</div>` : `
        ${cm === "demand" ? `<div class="wwhint">${ic("info", 16)}<span>Die Pumpe startet kurz, wenn <b>${E.trig ? esc(this._wzName(E.trig)) : "ein Auslöser"}</b> meldet, und läuft ${W.circ.run} Min. nach.${E.trig ? "" : " Wähle den Auslöser in den Einstellungen."} Mit Zeiten unten gilt das nur dann, ohne Zeiten immer.</span></div>` : ""}
        ${cm === "interval" ? `<div class="wwhint">${ic("info", 16)}<span>In den Zeiten unten läuft die Pumpe alle ${W.circ.every} Min. für ${W.circ.on} Min.</span></div>` : ""}
        ${cm === "plan" ? `<div class="wwhint">${ic("info", 16)}<span>Die Pumpe läuft in diesen Zeiten, solange der Rücklauf unter ${W.circ.ret_max} °C bleibt.</span></div>` : ""}
        ${dayTabs()}${this._wwBar(W.circ[key], "circ")}<div class="wwrs">${this._wwList(W.circ[key], "circ")}${adm ? `<button class="lnk" data-act="wwsch" data-k="circ">${ic("pencil", 15)}Zeiten</button>` : ""}</div>
        ${cm === "demand" ? this._wwNum("Nachlauf", "Wie lange die Pumpe nach dem Auslöser läuft.", "circ.run", W.circ.run, 1, 15, 1, "Min.", adm) : ""}
        ${cm === "interval" ? this._wwNum("Pumpe läuft", "", "circ.on", W.circ.on, 1, 15, 1, "Min.", adm) + this._wwNum("Alle", "", "circ.every", W.circ.every, 10, 120, 5, "Min.", adm) : ""}
        ${this._wwNum("Pumpe stoppt ab Rücklauf", "Spart Energie, weil schon warmes Wasser in der Leitung ist.", "circ.ret_max", W.circ.ret_max, 30, 60, 1, "°C", adm)}`}</div>`;
    const lg = W.leg;
    const legC = !hasGen ? `<div class="card"><h2>${ic("shield", 18)}Legionellenschutz</h2>
      <div class="wwempty big">${ic("shield", 30)}<div><b>Kein Wärmeerzeuger gewählt</b><span>Der Legionellenschutz heizt den Speicher regelmäßig auf die Schutztemperatur und hält sie. Dafür braucht er einen Wärmeerzeuger oder Heizstab.</span></div>${adm ? `<button class="btn2 pri" data-act="mdsetup" style="flex:none;padding:10px 18px">Erzeuger wählen</button>` : ""}</div></div>` : `<div class="card"><h2>${ic("shield", 18)}Legionellenschutz<button class="sw ${lg.on ? "on" : ""}" style="margin-left:auto" data-act="wwleg" aria-pressed="${lg.on}" aria-label="Legionellenschutz"></button></h2>
      ${lg.on ? `<div class="mut sm" style="margin:0 0 6px">Der Speicher wird regelmäßig auf Schutztemperatur gebracht und gehalten.</div>
        <div class="dchips">${DAYS.map((d, i) => `<button class="dc ${lg.day === i ? "sel" : ""}" data-act="wwlegday" data-k="${i}">${d}</button>`).join("")}</div>
        ${this._wwNumT("Uhrzeit", "Am besten nachts, wenn niemand duscht.", "leg.time", lg.time, adm)}${this._wwNum("Schutztemperatur", "", "leg.temp", lg.temp, 55, 65, 1, "°C", adm)}${this._wwNum("Halten für", "", "leg.hold", lg.hold, 10, 60, 5, "Min.", adm)}
        <div class="dgs ${!lg.last ? "" : lg.last.ok ? (legD > 9 ? "warn" : "ok") : "warn"}">${ic(!lg.last ? "info" : lg.last.ok ? "check" : "alert", 22)}<div><b>${lg.last ? `Letzte Aufheizung: ${new Date(lg.last.ts).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" })}, ${new Date(lg.last.ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr` : "Noch keine Aufheizung aufgezeichnet"}</b><span>${lg.last ? `${num(lg.last.max, 1)} °C erreicht, ${lg.last.held} Min. gehalten` : "Der erste Lauf folgt zum eingestellten Zeitpunkt."}</span></div><span></span></div>`
      : `<div class="gst on">${ic("alert", 15)}Aus. In Speichern über 400 Liter oder mit Zirkulation wird ein regelmäßiges Aufheizen empfohlen.</div>`}</div>`;
    const pv = W.pv;
    const pvC = !E.rod ? `<div class="card"><h2>${ic("bolt", 18)}PV-Überschuss nutzen</h2>
      <div class="wwempty big">${ic("bolt", 30)}<div><b>Kein Heizstab gewählt</b><span>Bei Überschuss aus der PV-Anlage kann ein Heizstab den Speicher über das Soll hinaus laden. Wähle dafür den Schalter des Heizstabs.</span></div>${adm ? `<button class="btn2 pri" data-act="mdsetup" style="flex:none;padding:10px 18px">Heizstab wählen</button>` : ""}</div></div>` : `<div class="card"><h2>${ic("bolt", 18)}PV-Überschuss nutzen<button class="sw ${pv.on ? "on" : ""}" style="margin-left:auto" data-act="wwpv" aria-pressed="${pv.on}" aria-label="PV-Überschuss"></button></h2>
      ${pv.on ? `<div class="mut sm" style="margin:0 0 6px">Der Speicher wird bei Überschuss über das Soll hinaus geladen. Sensor, Batterie-Grenze und Vorzeichen kommen aus Modul 1 → Allgemein. Der Heizstab hat Vorrang vor den Raumheizern.</div>
        ${this._wwNum("Ab Überschuss", "", "pv.min", pv.min, 300, 6000, 100, "W", adm)}${this._wwNum("Speicher bis maximal", "", "pv.max", pv.max, 50, 65, 1, "°C", adm)}${this._wwNum("Leistung Heizstab", "Damit erkennt das Modul, wann der Überschuss reicht.", "pv.watt", pv.watt, 300, 9000, 100, "W", adm)}
        <div class="gst ${E.rod ? "" : "on"}">${ic(E.rod ? "bolt" : "info", 15)}${E.rod ? (pvNow == null ? "Kein PV-Sensor gewählt." : pvNow >= pv.min ? `Aktuell ${wfmt(pvNow)} Überschuss – der Heizstab darf laufen.` : `Aktuell ${wfmt(pvNow)} Überschuss – zu wenig, Heizstab bleibt aus.`) : "Für PV-Heizung fehlt noch der Heizstab-Schalter in den Einstellungen."}</div>` : `<div class="mut sm">Aus.</div>`}</div>`;
    const dg = `<div class="card wwc"><h2>${ic("tools", 18)}Zustand</h2>${probs.map(([lv, ico, ti, tx]) => `<div class="dgs ${lv === "mut" ? "" : lv}">${ic(ico, 22)}<div><b>${esc(ti)}</b><span>${esc(tx)}</span></div><span></span></div>`).join("")}<div class="mut sm" style="margin:0">Hinweise erscheinen auch in der Gerätediagnose und als Meldung.</div></div>`;
    const o = (n, h) => h.replace('<div class="card', `<div style="order:${n}" class="card`);
    return `${hero}${tiles}${chart}<div class="enc"><div class="enco">${o(1, heatC)}${o(3, legC)}</div><div class="enco">${o(2, circC)}${o(4, pvC)}</div></div>${dg}<div class="note">Das Modul schaltet nur die gewählten Geräte. Bei Überschuss hat der Warmwasser-Heizstab Vorrang vor den Raumheizern.</div>`;
  }
  _wwNum(label, hint, path, val, lo, hi, step, unit, adm) {
    return `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="wwnum" data-k="${path}" data-min="${lo}" data-max="${hi}" data-step="${step}" value="${val}" min="${lo}" max="${hi}" step="${step}" ${adm ? "" : "disabled"}><i>${unit}</i></span></div></div>`;
  }
  _wwNumT(label, hint, path, val, adm) {
    return `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc"><span class="onum"><input type="time" data-f="wwnum" data-k="${path}" data-t="1" value="${val}" ${adm ? "" : "disabled"}></span></div></div>`;
  }
  _wwSet(path, v) { const W = this._mdState().ww, p = path.split("."); let o = W; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; this._mdSave(); }
  _wwChange(t) {
    const f = t.dataset.f, W = this._mdState().ww;
    if (f === "wwnum") {
      let v = t.value;
      if (!t.dataset.t) { v = Number(String(v).replace(",", ".")); const lo = +t.dataset.min, hi = +t.dataset.max, st = +t.dataset.step || 1; v = isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v / st) * st)) : lo; }
      else if (!/^\d\d:\d\d$/.test(v)) v = "03:00";
      this._wwSet(t.dataset.k, v); this._render(); return true;
    }
    if (f === "wwent") { W.ent[t.dataset.k] = t.value; this._mdSave(); this._wwH = null; return true; }
    if (f === "wwsz") { const v = Number(String(t.value).replace(",", ".")); W[t.dataset.k] = isFinite(v) ? Math.min(+t.dataset.max, Math.max(+t.dataset.min, Math.round(v))) : W[t.dataset.k]; this._mdSave(); return true; }
    if (f === "wwsch") {
      const m = this._modal, list = W[m.kind][this._wwDay()], x = list[+t.dataset.i], k = t.dataset.k;
      if (k === "temp") { const v = Number(String(t.value).replace(",", ".")); x.temp = isFinite(v) ? Math.min(70, Math.max(30, Math.round(v))) : x.temp; }
      else { x[k] = /^\d\d:\d\d$/.test(t.value) ? t.value : x[k]; if (wwTm(x.to) <= wwTm(x.from)) { if (k === "from") x.to = wwFmt(Math.min(1439, wwTm(x.from) + 30)); else x.from = wwFmt(Math.max(0, wwTm(x.to) - 30)); } }
      this._mdSave(); this._renderModal(); return true;
    }
    return false;
  }
  _wwAct(a, b) {
    const W = this._mdState().ww, k = b.dataset.k, m = this._modal;
    if (a === "wwmode") { W.circ.mode = k; this._mdSave(); this._render(); }
    else if (a === "wwday") { W.day = k; this._mdSave(); this._render(); }
    else if (a === "wwboost" || a === "wwcirc5" || a === "wwaway") {
      const key = { wwboost: "boost", wwcirc5: "circ5", wwaway: "away" }[a], val = !W[key];
      this._hass.callWS({ type: "fenster_heizung/wasser_cmd", cmd: key, value: val }).then((r) => {
        this._mdT = null; this._mdApply(r); this._render();
        this._toast({ boost: val ? `Speicher wird einmal auf ${W.leg.temp} °C aufgeheizt` : "Aufheizen gestoppt", circ5: val ? "Pumpe läuft 5 Minuten" : "Pumpe gestoppt", away: val ? "Abwesend: Sparmodus an" : "Abwesend: aus" }[key]);
      }).catch(() => this._toast("Befehl konnte nicht gesendet werden"));
    }
    else if (a === "wwleg") { W.leg.on = !W.leg.on; this._mdSave(); this._render(); }
    else if (a === "wwlegday") { W.leg.day = +k; this._mdSave(); this._render(); }
    else if (a === "wwpv") { W.pv.on = !W.pv.on; this._mdSave(); this._render(); }
    else if (a === "wwreload") { this._wwH = null; this._wwLoad(true); this._mdPoll(); }
    else if (a === "wwsch") { this._modal = { type: "wwsch", kind: k }; this._renderModal(); }
    else if (a === "wwschadd") { const list = W[m.kind][this._wwDay()]; const last = list.length ? wwTm(list[list.length - 1].to) : 360; const from = Math.min(1380, last + 60); list.push({ from: wwFmt(from), to: wwFmt(Math.min(1439, from + 60)), temp: W.target }); this._mdSave(); this._renderModal(); }
    else if (a === "wwschdel") { W[m.kind][this._wwDay()].splice(+b.dataset.i, 1); this._mdSave(); this._renderModal(); }
    else if (a === "wwschcopy") { const from = this._wwDay(), to = from === "wd" ? "we" : "wd"; W[m.kind][to] = JSON.parse(JSON.stringify(W[m.kind][from])); this._mdSave(); this._toast(`Zeiten auf ${to === "wd" ? "Montag–Freitag" : "das Wochenende"} kopiert`); }
    else if (a === "wwschday") { W.day = k; this._mdSave(); this._renderModal(); }
    else if (a === "wwschdone" || a === "wwsetdone") { if (a === "wwschdone") { ["wd", "we"].forEach((d) => W[m.kind][d].sort((x, y) => wwTm(x.from) - wwTm(y.from))); } this._mdSave(); this._modal = null; this._renderModal(); this._render(); if (a === "wwsetdone") this._wwLoad(true); }
  }
  _wwSchModal() {
    const m = this._modal, W = this._mdState().ww, key = this._wwDay(), list = W[m.kind][key], heat = m.kind === "heat";
    return `<div class="ov" data-act="wwschdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>${heat ? "Warmwasser-Zeitplan" : "Zirkulationszeiten"}</b><span>${heat ? "Wann der Speicher auf Soll gehalten wird" : "Wann die Pumpe laufen darf"}</span></div><button class="ibtn" data-act="wwschdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="seg wwseg" role="group">${[["wd", "Montag–Freitag"], ["we", "Wochenende"]].map(([k, l]) => `<button class="${key === k ? "sel" : ""}" data-act="wwschday" data-k="${k}">${l}</button>`).join("")}</div>
      ${this._wwBar(list, m.kind)}
      ${list.length ? list.map((x, i) => `<div class="wsr"><input type="time" data-f="wwsch" data-i="${i}" data-k="from" value="${x.from}" aria-label="Von"><span>bis</span><input type="time" data-f="wwsch" data-i="${i}" data-k="to" value="${x.to}" aria-label="Bis">${heat ? `<span class="onum"><input type="number" inputmode="numeric" data-f="wwsch" data-i="${i}" data-k="temp" value="${x.temp}" min="30" max="70" aria-label="Temperatur"><i>°C</i></span>` : ""}<button class="ibtn" data-act="wwschdel" data-i="${i}" aria-label="Zeitfenster löschen">${ic("trash", 17)}</button></div>`).join("") : `<div class="mut sm" style="padding:10px 0">Noch keine Zeitfenster.</div>`}
      <div class="gbtns"><button class="btn2" data-act="wwschadd">${ic("plus", 16)} Zeitfenster</button><button class="btn2" data-act="wwschcopy">${ic("copy", 16)} Auf ${key === "wd" ? "Wochenende" : "Mo–Fr"} kopieren</button></div>
      ${heat ? `<div class="mut sm" style="margin:6px 0 0">Absenktemperatur außerhalb der Zeiten und Soll werden unter „Einstellungen“ festgelegt.</div>` : ""}
      <div class="foot2"><button class="btn2 pri" data-act="wwschdone">Fertig</button></div></div>`;
  }
  _wwSetModal() {
    const W = this._mdState().ww, E = W.ent, st = this._hass.states, ks = Object.keys(st);
    const temp = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "temperature" || /°C/.test(st[e].attributes.unit_of_measurement || "")));
    const gen = ks.filter((e) => /^(water_heater|switch|climate|input_boolean)\./.test(e)), sw = ks.filter((e) => /^(switch|input_boolean)\./.test(e)), trg = ks.filter((e) => /^(binary_sensor|button|input_button|event)\./.test(e));
    const sel = (k, opts) => this._wzSel(opts, E[k], "wwent", `data-k="${k}"`);
    const sz = (label, k, lo, hi, unit) => `<div class="of"><div class="ol"><b>${label}</b></div><div class="oc"><span class="onum"><input type="number" inputmode="numeric" data-f="wwsz" data-k="${k}" data-min="${lo}" data-max="${hi}" value="${W[k]}"><i>${unit}</i></span></div></div>`;
    const tz = (label, hint, path, val, lo, hi) => this._wwNum(label, hint, path, val, lo, hi, 1, "°C", true);
    return `<div class="ov" data-act="wwsetdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Warmwasser & Zirkulation</b><span>Einstellungen</span></div><button class="ibtn" data-act="wwsetdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("thermo", 15)}Speicher</div>
      ${sz("Inhalt", "size", 50, 1000, "Liter")}${tz("Soll-Temperatur", "Gilt in den Zeiten des Zeitplans.", "target", W.target, 40, 65)}${tz("Absenktemperatur", "Außerhalb der Zeiten und bei Abwesenheit.", "heat.low", W.heat.low, 30, 55)}
      <div class="mut sm" style="margin:8px 0 0">Temperatur oben</div>${sel("top", temp)}
      <div class="mut sm" style="margin:0">Temperatur Mitte (optional)</div>${sel("mid", temp)}
      <div class="mut sm" style="margin:0">Temperatur unten (optional)</div>${sel("bot", temp)}
      <div class="lsec">${ic("flame", 15)}Wärmeerzeuger</div>
      <div class="mut sm" style="margin:2px 0 0">Schalter oder Warmwasser-Gerät, das den Speicher heizt</div>${sel("src", gen)}
      <div class="mut sm" style="margin:0">Heizstab für PV-Überschuss (optional)</div>${sel("rod", sw)}
      <div class="lsec">${ic("drop", 15)}Zirkulation</div>
      <div class="mut sm" style="margin:2px 0 0">Zirkulationspumpe (Schalter)</div>${sel("pump", sw)}
      <div class="mut sm" style="margin:0">Rücklauf-Temperatur (optional)</div>${sel("ret", temp)}
      <div class="mut sm" style="margin:0">Auslöser für „Bei Bedarf“ (optional)</div>${sel("trig", trg)}
      <div class="gst">${ic("info", 15)}Das Modul schaltet nur die hier gewählten Geräte. Sensoren und Schalter bleiben in Home Assistant unverändert.</div>
      <div class="foot2"><button class="btn2 pri" data-act="wwsetdone">Fertig</button></div></div>`;
  }

  /* ================= Modul 3: Energie-Übersicht ================= */
  _enState() {
    if (!this._ens) {
      let s = {}; try { s = JSON.parse(localStorage.getItem("fh_energy") || "{}") || {}; } catch (_) { /* Speicher gesperrt */ }
      const d = JSON.parse(JSON.stringify(EN_DEF));
      this._ens = { ...d, range: ["day", "week", "month"].includes(s.range) ? s.range : "day", ent: { ...d.ent, ...(s.ent || {}) }, sign: s.sign || "", bsign: s.bsign || "charge", bmode: s.bmode === "two" ? "two" : "one", pvn: "", pv2n: "" };
    }
    return this._ens;
  }
  _enSave(cfg) { try { localStorage.setItem("fh_energy", JSON.stringify({ range: this._ens.range })); } catch (_) { /* Speicher gesperrt */ } if (cfg && this._admin()) this._mdSave(); }
  _enOn() { return this._enState().on !== false; }
  _enGrid() { const E = this._enState(), p = this._pv(); return { ent: E.ent.grid || p.sensor || "", sign: E.sign || p.sign || "export" }; }
  _enConfigured() { return !!(this._enState().ent.pv && this._enGrid().ent); }
  _enW(eid) {
    const st = eid && this._hass.states[eid]; if (!st) return null;
    let v = parseFloat(String(st.state).replace(",", ".")); if (!isFinite(v)) return null;
    if ((st.attributes || {}).unit_of_measurement === "kW") v *= 1000;
    return v;
  }
  /* Solar-Leistung: Wechselrichter melden nachts oft „nicht verfügbar“ (= 0 W); negative Kleinstwerte werden auf 0 gesetzt */
  _enPv1(id) {
    const st = id && this._hass.states[id]; if (!st) return null;
    if (["unavailable", "unknown", ""].includes(String(st.state))) return 0;
    const v = this._enW(id); return v == null ? 0 : Math.max(0, v);
  }
  /* zweite Solaranlage (zum Beispiel Balkonkraftwerk) wird addiert; fehlt sie, zählt nur die erste */
  _enPvW() { const p = this._enPvParts(); return p ? p.a + p.b : null; }
  _enPvParts() {
    const E = this._enState(), a = this._enPv1(E.ent.pv); if (a == null) return null;
    const b = E.ent.pv2 ? this._enPv1(E.ent.pv2) : null; return { a, b: b == null ? 0 : b, has2: !!E.ent.pv2 && b != null };
  }
  /* Eine Anlage liefert seit 10 Minuten nichts, obwohl die andere Strom erzeugt: Name(n) der ausgefallenen Anlage */
  _enOut(n) {
    const z = this._enZero = this._enZero || {}, lim = this._enOutMs ?? 6e5, nm = this._enPvNames(), out = [];
    [["a", n.pva, n.pvb, 0], ["b", n.pvb, n.pva, 1]].forEach(([k, me, other, i]) => {
      if (n.pvb == null || me == null || other == null || !(other >= 400 && me < 5)) { delete z[k]; return; }
      z[k] = z[k] || Date.now(); if (Date.now() - z[k] >= lim) out.push(nm[i]);
    });
    return out;
  }
  _enPvNames() { const E = this._enState(); return [E.pvn || "Solar", E.pv2n || "Balkon"]; }
  _enNow() {
    const E = this._enState(), g = this._enGrid(), pv = this._enPvW(), gr = this._enW(g.ent), b = this._enBatW();
    if (pv == null || gr == null) return null;
    const exp = g.sign === "import" ? -gr : gr, bc = b == null ? 0 : b;
    const house = E.ent.house && this._enW(E.ent.house) != null ? this._enW(E.ent.house) : Math.max(0, pv - exp - bc);
    const e = Math.max(0, exp), imp = Math.max(0, -exp), c = Math.max(0, bc), dis = Math.max(0, -bc);
    const pp = this._enPvParts(); return { pv, pva: pp ? pp.a : pv, pvb: pp && pp.has2 ? pp.b : null, exp: e, imp, house, bc: c, dis, pv2h: Math.min(house, Math.max(0, pv - e - c)), pv2b: c, b2h: dis, g2h: imp, soc: this._soc(), hasBat: b != null };
  }
  /* Batterie-Leistung, Laden positiv: ein Sensor mit Vorzeichen oder zwei Sensoren (Laden / Entladen) */
  _enBatIds() { const E = this._enState(); return E.bmode === "two" ? [E.ent.bchg, E.ent.bdis].filter(Boolean) : [E.ent.bat].filter(Boolean); }
  _enBatW() {
    const E = this._enState();
    if (E.bmode === "two") { const c = E.ent.bchg ? this._enW(E.ent.bchg) : null, d = E.ent.bdis ? this._enW(E.ent.bdis) : null; return c == null && d == null ? null : Math.max(0, c || 0) - Math.max(0, d || 0); }
    const b = this._enW(E.ent.bat); return b == null ? null : E.bsign === "discharge" ? -b : b;
  }
  _enBatAt(sb, at, m) {
    const E = this._enState(); if (E.bmode === "two") { const v = sb.map((l) => at(l, m)); if (v.every((x) => x == null)) return null; const c = E.ent.bchg ? v[0] : 0, d = E.ent.bdis ? v[E.ent.bchg ? 1 : 0] : 0; return Math.max(0, c || 0) - Math.max(0, d || 0); }
    const b = at(sb[0], m); return b == null ? null : E.bsign === "discharge" ? -b : b;
  }
  /* ---- Verlauf laden ---- */
  _enLoad(force) {
    const E = this._enState(), g = this._enGrid();
    if (!this._hass || !this._enConfigured()) return;
    const key = E.range;
    if (!force && this._enH && this._enH.range === key && Date.now() - this._enH.ts < 3e5) return;
    if (this._enBusy) return; this._enBusy = true;
    const end = new Date(), n = key === "week" ? 7 : key === "month" ? 30 : 1, start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (n - 1));
    const done = (res, err) => ({ range: key, ts: Date.now(), start: +start, end: +end, res: res || {}, err: !!err });
    let p;
    if (key === "day") {
      const ids = [E.ent.pv, E.ent.pv2, g.ent, E.ent.house, ...this._enBatIds()].filter(Boolean);
      p = this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: false, no_attributes: false });
    } else {
      const src = this._enSrc(), all = Object.values(src).filter(Boolean), q = (t, per, ty) => { const ids = [...new Set(all.filter((x) => x.t === t).map((x) => x.id))]; return ids.length ? this._hass.callWS({ type: "recorder/statistics_during_period", start_time: start.toISOString(), end_time: end.toISOString(), statistic_ids: ids, period: per, types: [ty] }) : Promise.resolve({}); };
      p = Promise.all([q("e", "day", "change"), q("p", "hour", "mean")]).then(([e, w]) => ({ e, w }));
    }
    p.then((r) => { this._enH = done(r); }).catch(() => { this._enH = done({}, true); })
      .finally(() => { this._enBusy = false; if (this._mdActive() === "en" && !this._dragging) this._render(); });
  }
  _enSer(eid, zero) {
    const H = this._enH; if (!H || !eid) return [];
    let k = 1; const raw = (H.res || {})[eid] || [];
    for (const x of raw) { if (x.a && x.a.unit_of_measurement) { if (x.a.unit_of_measurement === "kW") k = 1000; break; } }
    return raw.map((x) => ({ t: ((x.lu ?? x.lc ?? H.start / 1000) * 1000 - H.start) / 6e4, v: isFinite(parseFloat(x.s)) ? parseFloat(String(x.s).replace(",", ".")) * k : zero ? 0 : NaN })).filter((x) => isFinite(x.v));
  }
  _enSamples() {
    const H = this._enH, E = this._enState(), g = this._enGrid(); if (!H || H.range !== "day") return null;
    const sp = this._enSer(E.ent.pv, true), sp2 = E.ent.pv2 ? this._enSer(E.ent.pv2, true) : null, sg = this._enSer(g.ent), sh = E.ent.house ? this._enSer(E.ent.house) : null, sb = this._enBatIds().length ? this._enBatIds().map((x) => this._enSer(x)) : null;
    const at = (l, m) => { let v = null; for (const x of l) { if (x.t <= m) v = x.v; else break; } return v; };
    const total = Math.floor((H.end - H.start) / 6e4), out = [];
    for (let m = 0; m <= total; m += 5) {
      const pv = Math.max(0, at(sp, m) ?? 0) + (sp2 ? Math.max(0, at(sp2, m) ?? 0) : 0), gr = at(sg, m); if (gr == null && !sp.length) continue;
      const exp = gr == null ? 0 : g.sign === "import" ? -gr : gr, bb = sb ? this._enBatAt(sb, at, m) : null, bc = bb == null ? 0 : bb;
      const house = sh && at(sh, m) != null ? at(sh, m) : Math.max(0, pv - exp - bc);
      out.push({ t: m, pv: Math.max(0, pv), pvb: sp2 ? Math.max(0, at(sp2, m) ?? 0) : 0, exp: Math.max(0, exp), imp: Math.max(0, -exp), house });
    }
    return out;
  }
  _enSum() {
    const E = this._enState(), H = this._enH; if (!H || H.range !== E.range) return null;
    if (E.range === "day") {
      const s = this._enSamples(); if (!s || !s.length) return { empty: true };
      const k = (f) => s.reduce((a, x) => a + x[f], 0) * 5 / 60 / 1000;
      return { pv: k("pv"), pvb: k("pvb"), exp: k("exp"), imp: k("imp"), house: k("house") };
    }
    const days = this._enDays(); if (!days.some((d) => d.pv || d.imp || d.exp)) return { empty: true, nocnt: !Object.values(this._enSrc()).some(Boolean) };
    const pv = days.reduce((a, d) => a + d.pv, 0), imp = days.reduce((a, d) => a + d.imp, 0), exp = days.reduce((a, d) => a + d.exp, 0);
    return { pv, pvb: days.reduce((a, d) => a + (d.pvb || 0), 0), exp, imp, house: Math.max(0, pv - exp + imp) };
  }
  /* Quelle je Größe: Energiezähler (Wh/kWh/MWh) oder Leistungssensor (W/kW/MW). Leer = aus den Leistungssensoren oben. */
  _enKind(eid) {
    const u = (((this._hass.states[eid] || {}).attributes || {}).unit_of_measurement || "").trim();
    if (u in EN_UNIT_E) return { t: "e", k: EN_UNIT_E[u] };
    if (u in EN_UNIT_P) return { t: "p", k: EN_UNIT_P[u] };
    return null;
  }
  _enSrc() {
    const E = this._enState(), g = this._enGrid(), out = {}, mk = (id, part) => { const k = id && this._enKind(id); return k ? { id, ...k, part } : null; };
    out.pv = mk(E.ent.pve || E.ent.pv, "pv");
    if (E.ent.pv2) { out.pv2 = mk(E.ent.pve2 || E.ent.pv2, "pv"); if (out.pv2) out.pv2.f = "pv"; }
    out.imp = E.ent.imp ? mk(E.ent.imp, "imp") : mk(g.ent, "imp");
    out.exp = E.ent.exp ? mk(E.ent.exp, "exp") : mk(g.ent, "exp");
    if (out.imp && !E.ent.imp) out.imp.sg = g.sign;
    if (out.exp && !E.ent.exp) out.exp.sg = g.sign;
    return out;
  }
  _enNote() {
    const src = this._enSrc(), miss = !Object.values(src).some(Boolean), der = Object.values(src).some((x) => x && x.t === "p");
    if (miss) return `<div class="gst on">${ic("info", 15)}Für 7 und 30 Tage fehlt ein Sensor. Wähle in den Einstellungen Energiezähler (Wh, kWh) oder lass sie leer, dann wird aus den Leistungssensoren gerechnet.</div>`;
    if (this._enH && this._enH.err) return `<div class="gst on">${ic("alert", 15)}Der Verlauf konnte nicht geladen werden. Ist der Recorder in Home Assistant aktiv?</div>`;
    const sm = this._enSum(); if (sm && sm.empty) return `<div class="gst on">${ic("info", 15)}Für die gewählten Sensoren gibt es keine Langzeitstatistik. Zähler brauchen <code>state_class: total_increasing</code>, Leistungssensoren <code>state_class: measurement</code>.</div>`;
    return der ? `<div class="gst">${ic("info", 15)}Teilweise aus Leistungs-Mittelwerten (Stundenwerte) berechnet. Mit Energiezählern (Wh, kWh) wird es genauer.</div>` : "";
  }
  _enDays() {
    const H = this._enH, n = H.range === "week" ? 7 : 30, out = [], src = this._enSrc(), R = H.res || {};
    const d0 = new Date(H.start), di = (ts) => { const d = new Date(ts); return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - d0) / 864e5); };
    for (let i = 0; i < n; i++) out.push({ d: new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i, 12), pv: 0, pvb: 0, imp: 0, exp: 0 });
    out.derived = false;
    Object.entries(src).forEach(([f0, s]) => {
      if (!s) return; const f = s.f || f0;
      if (s.t === "e") (R.e && R.e[s.id] || []).forEach((x) => { const i = di(x.start); if (out[i] && isFinite(x.change)) { const v = Math.max(0, x.change * s.k); out[i][f] += v; if (f0 === "pv2") out[i].pvb += v; } });
      else {
        out.derived = true;
        (R.w && R.w[s.id] || []).forEach((x) => {
          const i = di(x.start); if (!out[i] || !isFinite(x.mean)) return;
          let w = x.mean * s.k; if (s.sg) w = s.part === "exp" ? (s.sg === "import" ? -w : w) : (s.sg === "import" ? w : -w);
          out[i][f] += Math.max(0, w) / 1000; if (f0 === "pv2") out[i].pvb += Math.max(0, w) / 1000;
        });
      }
    });
    return out;
  }
  /* ---- Darstellung ---- */
  _enFlow(n) {
    const E = this._enState(), kw = (w) => (w >= 1000 ? num(w / 1000, 2) + " kW" : Math.round(w) + " W");
    const ln = (d, w, col, lab, lx, ly) => `<path class="fl ${w >= 20 ? "on" : ""}" d="${d}" stroke="${col}" style="stroke-width:${(2 + Math.min(6, w / 700)).toFixed(1)}px"/>${w >= 20 ? `<text x="${lx}" y="${ly}" class="fll" fill="${col}">${lab || kw(w)}</text>` : ""}`;
    const node = (x, y, ico, col, t1, t2, side) => `<circle cx="${x}" cy="${y}" r="29" fill="color-mix(in srgb,${col} 16%,var(--card))" stroke="${col}" stroke-width="2.2"/>${ic(ico, 26).replace("<svg ", `<svg x="${x - 13}" y="${y - 13}" style="color:${col}" `)}${side ? `<text x="${x + 40}" y="${y - 2}" class="fln" style="text-anchor:start">${t1}</text><text x="${x + 40}" y="${y + 13}" class="fls" style="text-anchor:start">${t2}</text>` : `<text x="${x}" y="${y + 47}" class="fln">${t1}</text><text x="${x}" y="${y + 61}" class="fls">${t2}</text>`}`;
    const heat = this._htrTotal(), ww = this._wwIsOn(this._mdState().ww.ent.rod) ? this._mdState().ww.pv.watt : 0;
    const col = { pv: "#fbbf24", grid: "#60a5fa", exp: "#34d399", bat: "#a78bfa", house: "#2dd4bf" };
    return `<svg class="enflow" viewBox="0 0 400 312" role="img" aria-label="Energiefluss">
      ${ln("M200 70V120", n.pv2h, col.pv, "", 226, 112)}${ln("M226 62C310 72 340 92 340 118", n.pv2b, col.pv, "", 322, 86)}${ln("M174 62C90 72 60 92 60 118", n.exp, col.exp, "", 78, 86)}
      ${ln("M90 150H170", n.g2h, col.grid, "", 130, 142)}${ln("M310 150H230", n.b2h, col.bat, "", 270, 142)}
      ${ln("M192 216L150 262", Math.min(heat, n.house), col.house, "", 128, 240)}${ln("M208 216L250 262", Math.min(ww, n.house), col.house, "", 272, 240)}
      ${node(200, 38, "sun", col.pv, "Solar", kw(n.pv), true)}
      ${node(60, 150, "bolt", n.exp > 20 ? col.exp : col.grid, n.exp > 20 ? "Einspeisung" : "Netz", n.exp > 20 ? kw(n.exp) : n.imp > 20 ? "Bezug " + kw(n.imp) : "0 W")}
      ${node(200, 150, "home", col.house, "Haus", kw(n.house))}
      ${n.hasBat ? node(340, 150, "energy", col.bat, n.soc != null ? Math.round(n.soc) + " %" : "Batterie", n.bc > 20 ? "lädt " + kw(n.bc) : n.dis > 20 ? "entlädt " + kw(n.dis) : "ruht") : ""}
      <g transform="translate(150,282)"><rect x="-44" y="-18" width="88" height="34" rx="12" fill="var(--card)" stroke="var(--line)"/><text x="0" y="-3" class="fln">Heizung</text><text x="0" y="11" class="fls">${kw(heat)}</text></g>
      <g transform="translate(250,282)"><rect x="-44" y="-18" width="88" height="34" rx="12" fill="var(--card)" stroke="var(--line)"/><text x="0" y="-3" class="fln">Warmwasser</text><text x="0" y="11" class="fls">${ww ? kw(ww) : "0 W"}</text></g></svg>`;
  }
  _enChart() {
    const E = this._enState(), H = this._enH;
    if (!H || H.range !== E.range) return `<div class="mut sm" style="padding:30px 0;text-align:center">Verlauf wird geladen …</div>`;
    const Wd = 640, Ht = 214, L = 40, R = 8, T = 24, B = 28, iw = Wd - L - R, ih = Ht - T - B;
    if (E.range === "day") {
      const s = this._enSamples(); if (!s || !s.length) return `<div class="mut sm" style="padding:30px 0;text-align:center">Keine Verlaufsdaten für heute.</div>`;
      const mx = Math.max(500, ...s.map((x) => Math.max(x.pv, x.house, x.imp))), sk = Math.max(1, enStep(mx / 1000)) * 1000, top = Math.ceil(mx / sk) * sk, X = (m) => L + (m / 1440) * iw, Y = (w) => T + ih - (w / top) * ih;
      const area = (f, c) => `<path d="M${X(s[0].t)} ${Y(0)}${s.map((x) => `L${X(x.t).toFixed(1)} ${Y(x[f]).toFixed(1)}`).join("")}L${X(s[s.length - 1].t)} ${Y(0)}Z" fill="${c}" opacity=".28"/>`;
      const line = (f, c, w = 2) => `<path d="${s.map((x, i) => `${i ? "L" : "M"}${X(x.t).toFixed(1)} ${Y(x[f]).toFixed(1)}`).join("")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"/>`;
      let g = ""; for (let w = 0, c = 0; w <= top && c < 12; w += sk, c++) g += `<line x1="${L}" x2="${Wd - R}" y1="${Y(w)}" y2="${Y(w)}" stroke="currentColor" opacity=".13"/><text x="${L - 6}" y="${Y(w) + 4}" text-anchor="end" font-size="11" fill="currentColor" opacity=".6">${w / 1000}</text>`;
      for (const h of [0, 6, 12, 18, 24]) g += `<text x="${X(h * 60)}" y="${Ht - 8}" text-anchor="${h === 0 ? "start" : h === 24 ? "end" : "middle"}" font-size="11" fill="currentColor" opacity=".6">${String(h).padStart(2, "0")}:00</text>`;
      return `<svg class="wwchart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Leistung heute"><text x="${L - 6}" y="${T - 10}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">kW</text>${g}${area("pv", "#fbbf24")}${area("imp", "#f87171")}${line("pv", "#fbbf24")}${E.ent.pv2 && s.some((x) => x.pvb > 0) ? line("pvb", "#fb923c", 1.5) : ""}${line("house", "#38bdf8")}</svg>
        <div class="legend"><span><i style="background:#fbbf24"></i>${E.ent.pv2 ? "Solar gesamt" : "Solar"}</span>${E.ent.pv2 && s.some((x) => x.pvb > 0) ? `<span><i style="background:#fb923c"></i>${esc(this._enPvNames()[1])}</span>` : ""}<span><i style="background:#38bdf8"></i>Verbrauch</span><span><i style="background:#f87171"></i>Netzbezug</span></div>`;
    }
    const days = this._enDays(), mx = Math.max(1, ...days.flatMap((d) => [d.pv, d.imp, d.exp])), stp = enStep(mx), top = Math.ceil(mx / stp) * stp, gw = iw / days.length, bw = Math.max(2, Math.min(9, gw / 3.6)), Y = (v) => T + ih - (v / top) * ih;
    let s = ""; for (let v = 0, c = 0; v <= top && c < 12; v += stp, c++) s += `<line x1="${L}" x2="${Wd - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".13"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="currentColor" opacity=".6">${num(v, v % 1 ? 1 : 0)}</text>`;
    days.forEach((d, i) => {
      const x0 = L + i * gw + gw / 2 - bw * 1.5;
      [[d.pv, "#fbbf24"], [d.imp, "#f87171"], [d.exp, "#34d399"]].forEach(([v, c], k) => { s += `<rect x="${(x0 + k * (bw + 1)).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${bw}" height="${Math.max(0, Y(0) - Y(v)).toFixed(1)}" rx="1.5" fill="${c}"/>`; });
      if (days.length <= 7 || i % 5 === 0 || i === days.length - 1) s += `<text x="${L + i * gw + gw / 2}" y="${Ht - 8}" text-anchor="middle" font-size="11" fill="currentColor" opacity="${i === days.length - 1 ? 1 : .6}">${i === days.length - 1 ? "heute" : d.d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" })}</text>`;
    });
    return `<svg class="wwchart" viewBox="0 0 ${Wd} ${Ht}" role="img" aria-label="Energie pro Tag"><text x="${L - 6}" y="${T - 10}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">kWh</text>${s}</svg>
      <div class="legend"><span><i style="background:#fbbf24"></i>Solar</span><span><i style="background:#f87171"></i>Netzbezug</span><span><i style="background:#34d399"></i>Einspeisung</span></div>`;
  }
  _enPage() {
    const E = this._enState(), adm = this._admin();
    if (!this._enConfigured()) return `<div class="card empty wwe">${ic("energy", 40)}<div class="t1">Energie-Übersicht einrichten</div>
      <div class="sm" style="max-width:480px;margin:0 auto 14px">Wähle den Sensor für die Solar-Leistung. Der Netz-Sensor kommt aus den PV-Einstellungen in Modul 1, du kannst ihn hier ändern. Danach siehst du Fluss, Verlauf, Kosten und Heizung auf einer Seite.</div>
      <ul class="wwl"><li>${ic("sun", 16)}Energiefluss in Echtzeit</li><li>${ic("chart", 16)}Verlauf: heute, 7 und 30 Tage</li><li>${ic("flame", 16)}Heizung und Warmwasser im Verhältnis</li></ul>
      ${adm ? `<button class="btn2 pri" data-act="mdensetup" style="margin-top:16px;flex:none;padding:12px 22px">${ic("tools", 16)} Modul einrichten</button>` : "Ein Administrator kann das Modul einrichten."}</div>`;
    this._enLoad(); if (this._enState().ent.pv && this._mdState().ww.ent.rod) this._wwLoad();
    const n = this._enNow(), sum = this._enSum(), range = E.range, price = this._price(), feed = this._feed();
    if (!n) return `<div class="card empty">${ic("alert", 32)}<div style="margin:8px 0 4px;font-weight:700;color:var(--primary-text-color)">Keine Messwerte</div>Solar- oder Netz-Sensor liefern gerade keinen Wert.${adm ? `<br><button class="lnk" data-act="mdensetup" style="margin-top:10px">${ic("sliders", 15)}Einstellungen</button>` : ""}</div>`;
    const heat = this._htrTotal(), ww = this._wwIsOn(this._mdState().ww.ent.rod) ? this._mdState().ww.pv.watt : 0, rest = Math.max(0, n.house - heat - ww);
    const self = sum && !sum.empty ? Math.max(0, sum.pv - sum.exp) : null, autarky = sum && !sum.empty && sum.house > 0 ? Math.round(Math.min(100, Math.max(0, (1 - sum.imp / sum.house) * 100))) : null, evq = sum && !sum.empty && sum.pv > 0 ? Math.round(Math.min(100, (self / sum.pv) * 100)) : null;
    const covered = n.house > 0 ? Math.round(Math.min(100, (n.pv2h + n.b2h) / n.house * 100)) : 100;
    const hero = `<div class="card hero enh"><div class="enring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="rb"/><circle cx="60" cy="60" r="50" class="rf" stroke-dasharray="${(covered * 3.1416).toFixed(1)} 314.2" transform="rotate(-90 60 60)"/></svg><div class="rv"><b>${covered}<small>%</small></b><span>gedeckt</span></div></div><div class="lbl">${ic("home", 16)}Hausverbrauch jetzt</div><div class="big">${n.house >= 1000 ? num(n.house / 1000, 2) : Math.round(n.house)}<small>${n.house >= 1000 ? "kW" : "W"}</small></div><div class="sub">${covered} % aus Solar${n.b2h > 20 ? " und Batterie" : ""} gedeckt</div>
      <div class="chips"><span class="chip">${ic("sun", 16)}Solar ${wfmt(n.pv)}</span>${n.pvb != null && n.pvb >= 1 ? `<span class="chip">${ic("sun", 16)}davon ${esc(this._enPvNames()[1])} ${wfmt(n.pvb)}</span>` : ""}<span class="chip st ${n.exp > 20 ? "ok" : n.imp > 20 ? "warn" : ""}">${ic("bolt", 16)}${n.exp > 20 ? "Einspeisung " + wfmt(n.exp) : n.imp > 20 ? "Netzbezug " + wfmt(n.imp) : "Netz ausgeglichen"}</span>${n.hasBat ? `<span class="chip">${ic("energy", 16)}Batterie ${n.soc != null ? Math.round(n.soc) + " %" : ""}${n.bc > 20 ? " lädt" : n.dis > 20 ? " entlädt" : ""}</span>` : ""}${autarky != null && range === "day" ? `<span class="chip st ok">${ic("check", 16)}Autarkie heute ${autarky} %</span>` : ""}</div></div>`;
    const tabs = `<div class="seg wwseg enseg" role="group">${[["day", "Heute"], ["week", "7 Tage"], ["month", "30 Tage"]].map(([k, l]) => `<button class="${range === k ? "sel" : ""}" data-act="enrange" data-k="${k}" aria-pressed="${range === k}">${l}</button>`).join("")}</div>`;
    const kwh = (v) => (v == null ? "–" : num(v, v >= 100 ? 0 : v >= 10 ? 1 : 2));
    const eur = (kwhv, ct) => (kwhv == null ? null : (kwhv * ct) / 100);
    const tiles = `<div class="tiles">${[
      ["sun", "Solar", sum && !sum.empty ? kwh(sum.pv) : "–", "kWh", "#fbbf24", (sum && !sum.empty && sum.pvb > 0.005 ? `davon ${esc(this._enPvNames()[1])} ${kwh(sum.pvb)} kWh · ` : "") + (evq != null ? `${evq} % selbst genutzt` : sum && sum.nocnt ? "Sensor fehlt" : "Keine Daten")],
      ["bolt", "Netzbezug", sum && !sum.empty ? kwh(sum.imp) : "–", "kWh", "#f87171", sum && !sum.empty ? `${num(eur(sum.imp, price), 2)} € Kosten` : "Keine Daten"],
      ["upload", "Einspeisung", sum && !sum.empty ? kwh(sum.exp) : "–", "kWh", "#34d399", sum && !sum.empty ? `${num(eur(sum.exp, feed), 2)} € Vergütung` : "Keine Daten"],
      ["home", "Verbrauch", sum && !sum.empty ? kwh(sum.house) : "–", "kWh", "#2dd4bf", autarky != null ? `${autarky} % Autarkie` : "Keine Daten"],
    ].map(([ico, lab, v, u, c, sub], i) => { const pc = sum && !sum.empty ? [evq, sum.house > 0 ? sum.imp / sum.house * 100 : 0, sum.pv > 0 ? sum.exp / sum.pv * 100 : 0, autarky][i] : null; return `<div class="tile" style="--a:${c}"><div class="t"><span class="ti">${ic(ico, 16)}</span>${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div>${pc != null ? `<div class="tbar"><i style="width:${Math.max(2, Math.min(100, pc)).toFixed(0)}%"></i></div>` : ""}</div>`; }).join("")}</div>`;
    const flow = `<div class="card"><h2>${ic("sun", 18)}Energiefluss jetzt</h2>${this._enFlow(n)}</div>`;
    const chart = `<div class="card"><h2>${ic("chart", 18)}${range === "day" ? "Leistung heute" : range === "week" ? "Energie pro Tag · 7 Tage" : "Energie pro Tag · 30 Tage"}<button class="ibtn gear" style="margin-left:auto" data-act="enreload" aria-label="Aktualisieren">${ic("clock", 16)}</button></h2>${this._enChart()}${range === "day" ? "" : this._enNote()}</div>`;
    // Verteilung (nur heute)
    const rooms = this._htrRooms(), heatK = rooms.reduce((a, r) => a + (Number(r.htr.heute_kwh) || 0), 0), heatPv = rooms.reduce((a, r) => a + (Number(r.htr.heute_pv_kwh) || 0), 0);
    const ws = this._mdState().ww, wwK = ws.ent.rod ? (this._wwMinutesOn(ws.ent.rod) || 0) / 60 * ws.pv.watt / 1000 : 0;
    let dist = "";
    if (range === "day" && sum && !sum.empty) {
      const restK = Math.max(0, sum.house - heatK - wwK), tot = Math.max(0.01, heatK + wwK + restK), items = [["Heizung (Raumheizer)", heatK, "#f97316", "flame"], ["Warmwasser (Heizstab)", wwK, "#38bdf8", "drop"], ["Haushalt und Rest", restK, "#2dd4bf", "home"]];
      dist = `<div class="card"><h2>${ic("layers", 18)}Wohin der Strom heute geht</h2>
        <div class="pvbar endist">${items.map(([, v, c]) => `<i style="width:${(v / tot * 100).toFixed(1)}%;background:${c}"></i>`).join("")}</div>
        ${items.map(([l, v, c, ico]) => `<div class="endr"><span class="endot" style="background:${c}"></span><b>${l}</b><span>${num(v / tot * 100, 0)} %</span><span>${num(v, 1)} kWh</span><span>${num(eur(v, price), 2)} €</span></div>`).join("")}
        <div class="mut sm" style="margin:8px 0 0">Warmwasser ist aus der Laufzeit des Heizstabs geschätzt. Der Rest ist Verbrauch minus Heizung und Warmwasser.</div></div>`;
    }
    // Kosten
    let cost = "";
    if (sum && !sum.empty) {
      const buy = eur(sum.imp, price), sell = eur(sum.exp, feed), saved = eur(self, price), net = sell + saved - buy;
      cost = `<div class="card"><h2>${ic("total", 18)}Kosten und Vorteil · ${range === "day" ? "heute" : range === "week" ? "7 Tage" : "30 Tage"}</h2>
        <div class="enrows"><div><span>Strom aus dem Netz</span><b class="neg">−${num(buy, 2)} €</b></div><div><span>Einspeisevergütung</span><b class="pos">+${num(sell, 2)} €</b></div><div><span>Selbst genutzter Solarstrom <em>(Bezug gespart)</em></span><b class="pos">+${num(saved, 2)} €</b></div><div class="sum"><span>Vorteil durch Solar</span><b class="pos">${num(sell + saved, 2)} €</b></div><div class="sum"><span>Bilanz</span><b class="${net >= 0 ? "pos" : "neg"}">${net >= 0 ? "+" : "−"}${num(Math.abs(net), 2)} €</b></div></div>
        <div class="mut sm" style="margin:8px 0 0">Preise aus Modul 1 → Allgemein: ${num(price, 1)} ct/kWh Bezug, ${num(feed, 1)} ct/kWh Einspeisung.</div></div>`;
    }
    // Heizung
    const rm = this._collect(), dayK = rm.reduce((a, r) => a + (r.sc.day?.kwh || 0), 0), monK = rm.reduce((a, r) => a + (r.sc.month?.kwh || 0), 0);
    const heatC = `<div class="card"><h2>${ic("radiator", 18)}Heizung</h2><div class="enrows">
      <div><span>Wärme gespart durch Fensterregelung heute</span><b>${num(dayK, 1)} kWh</b></div><div><span>… in diesem Monat</span><b>${num(monK, 1)} kWh</b></div>
      ${rooms.length ? `<div><span>Elektroheizer heute</span><b>${num(heatK, 1)} kWh${heatK > 0 ? ` · ${Math.round(heatPv / heatK * 100)} % Solar` : ""}</b></div>` : ""}
      ${ws.ent.rod || ws.ent.pump ? `<div><span>Warmwasser</span><b>${this._wwTemps().top != null ? num(this._wwTemps().top, 1) + " °C oben" : "–"}</b></div>` : ""}</div>
      <div class="gbtns" style="margin-bottom:0"><button class="btn2" data-act="mdgo" data-k="fh">${ic("windowOpen", 16)} Modul 1</button>${this._mdList().some((m) => m.id === "ww") ? `<button class="btn2" data-act="mdgo" data-k="ww">${ic("boiler", 16)} Modul 2</button>` : ""}</div></div>`;
    // Hinweise
    const tips = [];
    const freeW = n.exp;
    if (freeW >= 500) tips.push(["sun", `${wfmt(freeW)} Solar-Überschuss gehen gerade ins Netz.`, rooms.length || ws.ent.rod ? "Heizer oder Warmwasser könnten mehr davon nutzen, wenn sie nicht ausgelastet oder aus sind." : "Ein Elektroheizer oder Heizstab würde den Überschuss selbst nutzen."]);
    if (n.imp >= 1500) tips.push(["alert", `Hoher Netzbezug: ${wfmt(n.imp)}.`, `Gerade laufen Heizung ${wfmt(heat)} und Warmwasser ${wfmt(ww)}. Der Rest (${wfmt(rest)}) ist Haushalt.`]);
    if (heatK > 0) tips.push(["flame", `${Math.round(heatPv / heatK * 100)} % der Heizer-Energie heute kam aus Solar.`, ""]);
    if (n.hasBat && n.soc != null && n.soc < 20 && n.pv < 200) tips.push(["energy", `Batterie nur noch bei ${Math.round(n.soc)} %.`, "Nachts und ohne Sonne kommt der Strom wieder aus dem Netz."]);
    this._enOut(n).forEach((nm) => tips.push(["alert!", `${esc(nm)} liefert nichts.`, "Die andere Anlage erzeugt Strom. Ist der Wechselrichter ausgesteckt, aus oder ohne Verbindung?"]));
    if (!tips.length) tips.push(["check", "Alles ruhig.", "Kein Überschuss, kein hoher Netzbezug."]);
    const tipC = `<div class="card"><h2>${ic("info", 18)}Hinweise</h2>${tips.map(([ico, t, s]) => `<div class="dgs ${ico.endsWith("!") ? "warn" : "ok"}" style="grid-template-columns:28px 1fr">${ic(ico.replace("!", ""), 22)}<div><b>${t}</b>${s ? `<span>${s}</span>` : ""}</div></div>`).join("")}</div>`;
    const o = (n, h) => h.replace('<div class="card', `<div style="order:${n}" class="card`);
    return `${hero}${tabs}${tiles}<div class="enc"><div class="enco">${o(1, flow)}${dist ? o(3, dist) : ""}${o(6, tipC)}</div><div class="enco">${o(2, chart)}${cost ? o(4, cost) : ""}${o(5, heatC)}</div></div>`;
  }
  _enAct(a, b) {
    const E = this._enState(), k = b.dataset.k;
    if (a === "enrange") { E.range = k; this._enSave(); this._render(); }
    else if (a === "enreload") { this._enH = null; this._enLoad(true); this._render(); }
    else if (a === "ensdone") { this._pkId = null; this._modal = null; this._renderModal(); this._enH = null; this._render(); }
    else if (a === "enssign") { E.sign = k; this._enSave(true); this._renderModal(); }
    else if (a === "ensbm") { E.bmode = k === "two" ? "two" : "one"; this._pkId = null; this._enH = null; this._enSave(true); this._renderModal(); }
    else if (a === "ensbs") { E.bsign = k; this._enSave(true); this._renderModal(); }
  }
  _enChange(t) {
    const f = t.dataset.f, E = this._enState();
    if (f === "enent") { E.ent[t.dataset.k] = t.value; this._enSave(true); return true; }
    if (f === "enname") { E[t.dataset.k] = String(t.value || "").replace(/[<>"'&]/g, "").slice(0, 20); this._enSave(true); this._render(); return true; }
    return false;
  }
  _enSetModal() {
    const E = this._enState(), st = this._hass.states, ks = Object.keys(st), p = this._pv();
    const pw = ks.filter((e) => e.startsWith("sensor.") && (st[e].attributes.device_class === "power" || /^k?W$/.test(st[e].attributes.unit_of_measurement || "")));
    const en = ks.filter((e) => e.startsWith("sensor.") && (["energy", "power"].includes(st[e].attributes.device_class) || /^[kM]?Wh?$/.test(st[e].attributes.unit_of_measurement || "")));
    const sel = (k, o, none) => this._wzSel(o, E.ent[k], "enent", `data-k="${k}"`, none || "– keiner –");
    return `<div class="ov" data-act="ensdone"></div><div class="sheet wide" role="dialog" aria-modal="true">
      <div class="sh"><div><b>Energie-Übersicht</b><span>Einstellungen</span></div><button class="ibtn" data-act="ensdone" aria-label="Schließen">${ic("close", 20)}</button></div>
      <div class="lsec">${ic("sun", 15)}Leistung (Watt)</div>
      <div class="mut sm" style="margin:2px 0 0">Solar-Leistung</div>${sel("pv", pw)}
      <div class="mut sm" style="margin:0">Zweite Solaranlage, z. B. Balkonkraftwerk (optional, wird addiert)</div>${sel("pv2", pw)}
      ${E.ent.pv2 ? `<div class="mut sm" style="margin:0">Namen der Anlagen (für die Anzeige)</div><div class="enn"><input class="otxt" type="text" maxlength="20" placeholder="Solar" value="${esc(E.pvn || "")}" data-f="enname" data-k="pvn" aria-label="Name der ersten Anlage"><input class="otxt" type="text" maxlength="20" placeholder="Balkon" value="${esc(E.pv2n || "")}" data-f="enname" data-k="pv2n" aria-label="Name der zweiten Anlage"></div>` : ""}
      <div class="mut sm" style="margin:0">Netz${p.sensor ? ` (leer = ${esc(this._wzName(p.sensor))} aus Modul 1)` : ""}</div>${sel("grid", pw, p.sensor ? "– wie Modul 1 –" : "– keiner –")}
      <div class="seg">${[["", "Wie Modul 1"], ["export", "Einspeisung positiv"], ["import", "Bezug positiv"]].map(([k, l]) => `<button class="${(E.sign || "") === k ? "sel" : ""}" data-act="enssign" data-k="${k}">${l}</button>`).join("")}</div>
      <div class="mut sm" style="margin:0">Hausverbrauch (optional, sonst berechnet)</div>${sel("house", pw)}
      <div class="mut sm" style="margin:0">Batterie-Leistung (optional)</div>
      <div class="seg">${[["one", "Ein Sensor"], ["two", "Zwei Sensoren (Laden / Entladen)"]].map(([k, l]) => `<button class="${E.bmode === k ? "sel" : ""}" data-act="ensbm" data-k="${k}">${l}</button>`).join("")}</div>
      ${E.bmode === "two" ? `<div class="mut sm" style="margin:0">Batterie lädt (Watt, positiver Wert)</div>${sel("bchg", pw)}<div class="mut sm" style="margin:0">Batterie entlädt (Watt, positiver Wert)</div>${sel("bdis", pw)}` : `${sel("bat", pw)}${E.ent.bat ? `<div class="seg">${[["charge", "Laden positiv"], ["discharge", "Entladen positiv"]].map(([k, l]) => `<button class="${E.bsign === k ? "sel" : ""}" data-act="ensbs" data-k="${k}">${l}</button>`).join("")}</div>` : ""}`}
      <div class="lsec">${ic("chart", 15)}Tagessummen für 7 und 30 Tage</div>
      <div class="mut sm" style="margin:2px 0 6px">Energiezähler (Wh, kWh, MWh) sind am genauesten. Leistungssensoren (W, kW) gehen auch. Leer lassen: es wird aus Solar und Netz oben berechnet.</div>
      <div class="mut sm" style="margin:2px 0 0">Solar-Ertrag gesamt</div>${sel("pve", en)}
      ${E.ent.pv2 ? `<div class="mut sm" style="margin:0">Ertrag ${esc(this._enPvNames()[1])} gesamt</div>${sel("pve2", en)}` : ""}
      <div class="mut sm" style="margin:0">Netzbezug gesamt</div>${sel("imp", en)}
      <div class="mut sm" style="margin:0">Einspeisung gesamt</div>${sel("exp", en)}
      <div class="gst">${ic("info", 15)}Batterie-Ladestand, Strompreis und Einspeisevergütung kommen aus Modul 1 → Allgemein. Zähler müssen als Langzeitstatistik in Home Assistant geführt werden.</div>
      ${this._labFields("en")}
      <div class="foot2"><button class="btn2 pri" data-act="ensdone">Fertig</button></div></div>`;
  }
}
customElements.define("fenster-heizung-panel", FensterHeizungPanel);
