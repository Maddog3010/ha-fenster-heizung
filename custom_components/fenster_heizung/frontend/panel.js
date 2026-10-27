/* Fenster & Heizung – Dashboard-Panel 2.0 (ohne externe Abhängigkeiten) */
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
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  suitcase: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18M12 13v2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19zM14.5 6.5l3 3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
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
const LOGO_URL = "/fenster_heizung_static/logo.png";
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
const MODS = [{ id: "fh", n: 1, name: "Fenster & Heizung", short: "Fenster & Heizung", icon: "windowOpen", tag: "Smarte Fenster- und Heizungssteuerung" }, { id: "ww", n: 2, name: "Warmwasser & Zirkulation", short: "Warmwasser", icon: "boiler", tag: "Speicher, Zirkulation und Legionellenschutz" }, { id: "en", n: 3, name: "Energie-Übersicht", short: "Energie", icon: "energy", tag: "Heizung, Strom und PV im Überblick" }];
const PK_HINT = { pv: /solar|pv|photovolt|erzeug|wechselrichter|inverter/i, grid: /netz|grid|einspeis|bezug|zähler|meter/i, bchg: /lad|charge|zufuhr|input/i, bdis: /entlad|discharge|abgabe|output/i, house: /haus|house|verbrauch|load|consum/i, bat: /batter|speicher|akku/i, pve: /solar|pv|ertrag|yield|produc|erzeug/i, pv2: /balkon|plug|mikro|solar|pv|erzeug/i, pve2: /balkon|plug|mikro|ertrag|yield|produc|solar|pv/i, imp: /bezug|import|from.?grid|consum|netz/i, exp: /einspeis|export|feed|to.?grid/i,
  top: /oben|top|warmwasser|speicher|boiler/i, mid: /mitte|mid|warmwasser|speicher|boiler/i, bot: /unten|bot|warmwasser|speicher|boiler/i, ret: /rücklauf|ruecklauf|return|zirkul/i, pump: /zirkul|pumpe|pump/i, src: /heiz|kessel|wärmepumpe|puffer|ventil/i, rod: /heizstab|stab|rod|boiler/i, trig: /taster|bewegung|button|trigger|motion/i, outdoor: /außen|aussen|outdoor|outside/i, hum: /feucht|humid/i, heater: /heiz|elektro|heater/i };
/* Schrittweite der Achse: 1, 2, 5 × 10^n, höchstens 5 Linien (auch bei sehr großen Werten) */
const enStep = (mx) => { const raw = Math.max(mx, 1) / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const WW_ON = ["on", "heat", "heating", "performance", "eco", "electric", "gas", "heat_pump", "high_demand"];
const EN_UNIT_E = { Wh: 0.001, kWh: 1, MWh: 1000 }, EN_UNIT_P = { W: 1, kW: 1000, MW: 1e6 };
const EN_DEF = { on: true, range: "day", sign: "", bsign: "charge", bmode: "one", pvn: "", pv2n: "", ent: { pv: "", grid: "", house: "", bat: "", bchg: "", bdis: "", pve: "", pv2: "", pve2: "", imp: "", exp: "" } };
const MOD_SOON = [["blinds", "Rollläden & Beschattung", "Sonnenstand, Hitzeschutz und Heizbedarf"], ["fan", "Lüftung & Raumluft", "KWL, CO₂ und Feuchte"], ["heatpump", "Wärmepumpe", "Laufzeit, Takten und Abtauen"]];
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
.brand>div{min-width:0}.brand b{display:block;font-size:1.12rem;font-weight:700;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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
@media(max-width:520px){.pillbtn .bl{display:none}.pillbtn{padding:8px}.brand .tag{display:none}.brand b{font-size:.94rem}.brand{gap:8px}.hero .hlogo{width:42px;height:42px;right:12px;bottom:12px}.hero .chips{padding-right:50px}.brand .ver::before{content:""!important}.brand .logo{width:34px;height:34px}}
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
.rchart,.wwc2{display:block;width:100%;height:auto;cursor:crosshair}
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
.mbar{display:flex;gap:8px;overflow-x:auto;max-width:1180px;margin:0 auto;padding:12px 14px 0;scrollbar-width:none}
.mbar::-webkit-scrollbar{display:none}
.mtab{position:relative;flex:none;display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:var(--card);border-radius:16px;padding:8px 14px 8px 11px;cursor:pointer;text-align:left;color:var(--mut)}
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
`;

class FensterHeizungPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._narrow = false; this._edit = false; this._modal = null; this._dragging = false;
    this._cfg = { layout: { blocks: [], rooms: [], icons: {}, groups: [] }, plans: {}, presence: { mode: "home" } };
    this._gen = { updates: true, summer: { mode: "auto", temp: 18, days: 3 }, wxadj: { on: false, mild: 12, down: 1, frost: 0, up: 1 }, pv: { ...PVDEF } };
    this._learn = {}; this._st = null; this._pollN = 0;
  }
  connectedCallback() {
    this._ro = new ResizeObserver(() => { if (this._hass && !this._dragging && Math.abs(this.clientWidth - (this._w || 0)) > 24) this._render(); });
    this._ro.observe(this);
    this._ti = setInterval(() => this._tick(), 1000);
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); clearInterval(this._ti); }
  _tick() {
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
    return `<div class="upd">${ic("bell", 22)}<div><b>Neue Version ${esc(u.latest)} verfügbar</b><span>Installiert ist ${esc(this._ver)}${u.date ? " · veröffentlicht am " + esc(new Date(u.date + "T12:00:00").toLocaleDateString("de-DE")) : ""}</span></div><button class="lnk" data-act="news">Das ist neu</button><button class="ibtn" data-act="updx" aria-label="Ausblenden">${ic("close", 18)}</button></div>`;
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
    const persons = (p.persons.length ? p.persons : Object.keys(h.states).filter((e) => e.startsWith("person."))).map((e) => h.states[e]).filter(Boolean);
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
      ${persons.length ? `<div class="pers">${persons.map((s) => `<span class="per ${s.state === "home" ? "home" : ""}"><i></i>${esc(s.attributes.friendly_name || s.entity_id)} · ${s.state === "home" ? "zu Hause" : "unterwegs"}</span>`).join("")}</div>` : ""}
      ${adm ? `<div class="plnk"><button class="lnk" data-act="vac">${ic("suitcase", 16)}Urlaub planen</button><button class="lnk" data-act="pset">${ic("sliders", 16)}Einstellungen</button></div>` : ""}</div>`;
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
      if (r && r.general) { this._gen = { ...this._gen, ...r.general }; this._st = r.status || null; this._render(); if (this._modal && this._modal.type === "gen") this._renderModal(); }
    }).catch(() => this._toast("Einstellung konnte nicht gespeichert werden"));
  }
  _pollGen() {
    this._hass.callWS({ type: "fenster_heizung/get_general" }).then((r) => {
      if (!r || this._dragging || (this._modal && this._modal.type === "gen")) return;
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
    return `<div class="card room${this._ph(r).c}"${this._ph(r).s} data-sort="room" data-id="${esc(r.id)}"><div class="rh">
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

  _render() {
    if (!this._hass || this._dragging) return;
    const sr = this.shadowRoot;
    if (!this._built) { this._build(); }
    const bg = getComputedStyle(this).backgroundColor.match(/\d+/g) || [15, 20, 25];
    this.style.colorScheme = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) < 140 ? "dark" : "light";
    this._applyLook();
    if (this._mdActive() !== "fh") { this._mdRender(); return; }
    const rooms = this._collect(), edit = this._edit, adm = this._admin();
    const sum = (sc, k) => rooms.reduce((a, r) => a + (r.sc[sc]?.[k] || 0), 0);
    const paused = rooms.filter((r) => r.mode === "heizung_pausiert").length;
    const fset = new Set(rooms.map((r) => r.fuel || "erdgas")), F = fset.size === 1 ? FUELS[[...fset][0]] : MIXED, mixed = fset.size > 1;
    const amt = (sc) => (mixed ? sum(sc, "kwh") : sum(sc, "gas"));
    const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const tiles = [["day", "today", "Heute", "var(--teal)"], ["month", "month", "Monat", "#60a5fa"], ["year", "year", "Jahr", "#a78bfa"], ["total", "total", "Gesamt", "#f472b6"]];
    const content = {
      hero: () => `<div class="card hero${this._heroCfg().mode !== "standard" ? " hs" : ""}">${this._heroBg()}${this._art()}<img class="hlogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false">
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
        <div class="brand"><span class="logo">${ic("windowOpen", 22)}</span><div><b>Modul 1 – Fenster &amp; Heizung</b><span><em class="tag">Smarte Fenster- und Heizungssteuerung</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        ${adm ? `<button class="pillbtn" data-act="gen" aria-label="Allgemein">${ic("sliders", 16)}<span class="bl">Allgemein</span></button>` : ""}${adm && edit ? `<button class="pillbtn" data-act="look">${ic("palette", 16)}<span class="bl">Darstellung</span></button>` : ""}${adm ? (edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`) : ""}</div>
      ${this._mdBar()}<div class="wrap">${edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe Karten und Bereiche an den Griffen, um sie zu verschieben. Tippe auf ein Raumsymbol, um Symbol, Farbe und Foto zu ändern. Unter „Darstellung“ stellst du Akzentfarbe und Wetter ein.</div></div>` : ""}
        ${!edit ? this._updBanner() : ""}${blocks}${rooms.length ? `<div class="note">${mixed ? "Bei gemischten Brennstoffen wird die Ersparnis als Heizenergie in kWh gezeigt. Sie ist eine grobe Schätzung." : "Die " + F.noun + " ist eine grobe Schätzung. Die echte Ersparnis liegt etwas darunter."}</div>` : ""}</div>`;
  }

  _build() {
    const sr = this.shadowRoot;
    sr.innerHTML = `<style>${CSS}</style><div id="main"></div><div id="modal"></div><div id="toast"></div>`;
    this._built = true;
    sr.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (b) this._act(b.dataset.act, b); });
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
      if (t.dataset && t.dataset.f && (t.dataset.f.startsWith("md") || t.dataset.f.startsWith("ww") || t.dataset.f.startsWith("en")) && this._mdChange(t)) return;
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
    else if (a.startsWith("md") || a.startsWith("ww") || a.startsWith("en")) this._mdAct(a, b);
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
        multi("window_sensors", ent("binary_sensor"), "Fenstersensoren") + multi("thermostats", ent("climate"), "Heizungsthermostate")),
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
    if (m.type === "mods" || m.type === "wwset" || m.type === "wwsch" || m.type === "enset") { box.innerHTML = this._mdModal(); const sh = box.querySelector(".sheet"); if (sh) sh.scrollTop = top; return; }
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
    } else if (m.type === "gen") {
      const g = this._gen, sm = g.summer, S = this._sum(), rs = m.restore, u = this._upd, wa = g.wxadj, wadj = this._wxAdj(), pv = this._pv();
      const sumInfo = S.active ? `Aktiv${S.out != null ? `: ${num(S.out, 1)} °C draußen` : ""}. Der Heizplan ruht, die Fenstermeldung bleibt.` : sm.mode === "off" ? "Aus. Der Heizplan läuft wie gewohnt." : `Inaktiv${S.out != null ? `: ${num(S.out, 1)} °C draußen, Schwelle ${num(sm.temp, 1)} °C` : ""}.`;
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet wide" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Allgemein</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="lsec">${ic("sun", 15)}Sommermodus</div>
        <div class="mut sm" style="margin:2px 0 8px">Wenn es draußen warm genug ist, ruhen die Heizpläne. Die Fenstermeldung und alle Erinnerungen bleiben aktiv.</div>
        <div class="seg">${[["off", "Aus"], ["auto", "Automatisch"], ["on", "Immer an"]].map(([k, l]) => `<button class="${sm.mode === k ? "sel" : ""}" data-act="gsum" data-k="${k}">${l}</button>`).join("")}</div>
        ${sm.mode === "auto" ? `<div class="of"><div class="ol"><b>Ab einer Außentemperatur von</b><span>Mittel der letzten Tage, Sensor siehe Darstellung.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gth" value="${sm.temp}" min="5" max="35" step="0.5"><i>°C</i></span></div></div>
        <div class="of"><div class="ol"><b>Gemittelt über</b></div><div class="oc"><div class="seg oseg">${[1, 3, 7].map((d) => `<button class="${sm.days === d ? "sel" : ""}" data-act="gdays" data-k="${d}">${d === 1 ? "1 Tag" : d + " Tage"}</button>`).join("")}</div></div></div>` : ""}
        <div class="gst ${S.active ? "on" : ""}">${ic(S.active ? "sun" : "info", 15)}${sumInfo}</div>
        <div class="lsec">${ic("partly", 15)}Wetterabhängige Absenkung</div>
        <div class="mut sm" style="margin:2px 0 4px">Bei Sonne oder milder Luft sinkt die Zieltemperatur, bei Frost steigt sie. Gilt für alle Räume, die du nicht ausnimmst.</div>
        <div class="ltog"><span>Zieltemperatur nach Wetter anpassen</span><button class="sw ${wa.on ? "on" : ""}" data-act="gwx" aria-pressed="${wa.on}" aria-label="Wetter-Anpassung"></button></div>
        ${wa.on ? [["mild", "Mild ab", "°C", "Bei Sonne schon ab 5 °C weniger."], ["down", "Dann absenken um", "K", ""], ["frost", "Frost bis", "°C", ""], ["up", "Dann anheben um", "K", ""]].map(([k, l, u, h]) => `<div class="of"><div class="ol"><b>${l}</b>${h ? `<span>${h}</span>` : ""}</div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gwxn" data-k="${k}" value="${wa[k]}" min="${k === "mild" || k === "frost" ? -20 : 0}" max="${k === "mild" || k === "frost" ? 40 : 5}" step="0.5"><i>${u}</i></span></div></div>`).join("") : ""}
        <div class="gst ${wadj && wadj.d ? "on" : ""}">${ic(wadj && wadj.d ? (wadj.fr ? "snow" : "sun") : "info", 15)}${!wa.on ? "Aus." : wadj && wadj.d ? `Aktiv: ${wadj.d > 0 ? "+" : "−"}${num(Math.abs(wadj.d), 1)} °C (${wadj.why}).` : "Gerade keine Anpassung nötig."}</div>
        <div class="lsec">${ic("bolt", 15)}PV-Überschuss für Elektroheizer</div>
        <div class="mut sm" style="margin:2px 0 4px">Elektroheizer in den Räumen heizen nur bei genug Überschuss. Sie schaltest du in den Raumeinstellungen ein.</div>
        <div class="mut sm" style="margin:0">Sensor für die Einspeisung ins Netz</div>${this._wzSel(Object.keys(this._hass.states).filter((k) => k.startsWith("sensor.") && (this._hass.states[k].attributes.device_class === "power" || /^k?W$/.test(this._hass.states[k].attributes.unit_of_measurement || ""))), pv.sensor, "gpvs", "", "– keiner –", PK_HINT.grid)}
        <div class="seg">${[["export", "Einspeisung positiv"], ["import", "Netzbezug positiv"]].map(([k, l]) => `<button class="${pv.sign === k ? "sel" : ""}" data-act="gpvsign" data-k="${k}">${l}</button>`).join("")}</div>
        ${[["reserve", "Reserve", "W", "Bleibt zusätzlich zur Heizerleistung übrig.", 0, 2000, 50], ["delay", "Einschalten nach", "Min.", "So lange muss der Überschuss anliegen.", 0, 30, 1], ["minrun", "Mindestlaufzeit", "Min.", "Kürzer läuft ein Heizer nicht an einem Stück.", 0, 120, 5]].map(([k, l, u, h, lo, hi, st]) => `<div class="of"><div class="ol"><b>${l}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="${lo}" max="${hi}" step="${st}"><i>${u}</i></span></div></div>`).join("")}
        <div class="mut sm" style="margin:6px 0 0">Batterie-Ladestand (optional)</div>${this._wzSel(Object.keys(this._hass.states).filter((k) => k.startsWith("sensor.") && (this._hass.states[k].attributes.device_class === "battery" || this._hass.states[k].attributes.unit_of_measurement === "%")), pv.soc_sensor, "gpvb", "", "– keiner –", PK_HINT.bat)}
        ${pv.soc_sensor ? `<div class="of"><div class="ol"><b>Heizer erst ab</b><span>Die Batterie wird zuerst geladen.</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="soc_min" value="${pv.soc_min}" min="0" max="100" step="5"><i>%</i></span></div></div>` : ""}
        ${[["price", "Strompreis (Netzbezug)", "Festpreis", "Preis pro kWh aus dem Netz."], ["feed", "Einspeisevergütung", "Festvergütung", "Vergütung pro eingespeister kWh."]].map(([k, l, fl, h]) => { const ent = pv[k + "_mode"] === "entity", sn = pv[k + "_sensor"]; return `<div class="mut sm" style="margin:6px 0 0">${l}${k === "price" ? " für den Vorteil im Bericht" : ""}</div>
        <div class="seg">${[["fix", "Festwert"], ["entity", "Entität"]].map(([m, t]) => `<button class="${(ent ? "entity" : "fix") === m ? "sel" : ""}" data-act="gpvpm" data-p="${k}" data-k="${m}">${t}</button>`).join("")}</div>
        ${ent ? `${this._wzSel(Object.keys(this._hass.states).filter((e) => e.startsWith("sensor.") && (this._hass.states[e].attributes.device_class === "monetary" || (/(kwh|wh)$/i.test(this._hass.states[e].attributes.unit_of_measurement || "") && /€|eur|ct|cent/i.test(this._hass.states[e].attributes.unit_of_measurement || "")) || e === sn)), sn, "gpvp", `data-p="${k}"`, "– keiner –", /preis|price|tarif|tibber|awattar|strom/i)}
        <div class="mut sm" style="margin:2px 0 0">${sn ? `Aktuell ${num(this._rate(k), 2)} ct/kWh${Number(pv[k]) ? ` (${fl} ${num(pv[k], 2)} ct/kWh, falls der Sensor ausfällt)` : ""}` : `Ohne Sensor gilt der ${fl}.`}</div>` : `<div class="of"><div class="ol"><b>${fl}</b><span>${h}</span></div><div class="oc"><span class="onum"><input type="number" inputmode="decimal" data-f="gpvn" data-k="${k}" value="${pv[k]}" min="0" max="100" step="0.01"><i>ct/kWh</i></span></div></div>`}`; }).join("")}
        <div class="gst ${this._pvNow() != null ? "on" : ""}">${ic(this._pvNow() != null ? "bolt" : "info", 15)}${this._pvNow() != null ? `Aktuell ${wfmt(this._pvNow())} Überschuss, ${wfmt(this._htrTotal())} an Heizer verteilt.` : "Noch kein Sensor gewählt."}</div>
        <div class="lsec">${ic("thermo", 15)}Gerätediagnose</div>
        <div class="mut sm" style="margin:2px 0 4px">Welche Sensoren zuletzt gemeldet haben, Statusprüfung aller Geräte und das Fehlerprotokoll.</div>
        <button class="btn2" data-act="diag" style="width:100%;flex:none">${ic("tools", 16)} Diagnose öffnen</button>
        <div class="lsec">${ic("tools", 15)}Einrichtungsassistent</div>
        <div class="mut sm" style="margin:2px 0 4px">Räume, Fenstermeldung, Heizung, Luftfeuchte, PV-Heizer und Meldungen Schritt für Schritt einrichten.</div>
        <button class="btn2" data-act="wz" style="width:100%;flex:none">${ic("tools", 16)} Assistent starten</button>
        <div class="lsec">${ic("copy", 15)}Sichern &amp; Wiederherstellen</div>
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
    d.after = d.group === "room" && cols > 1 && sameRow ? d.x > r.left + r.width / 2 : d.y > r.top + r.height / 2;
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
      } else this._cfg.layout.blocks = ids;
      this._saveLayout();
    }
    this._drag = null; this._dragging = false; this._render();
  }

  /* ================= Module (Modul 2: Warmwasser & Zirkulation, weitere Module) ================= */
  _mdState() {
    if (!this._mds) {
      let act = "fh"; try { act = localStorage.getItem("fh_mod_active") || "fh"; } catch (_) { /* Speicher gesperrt */ }
      this._mds = { active: act, on: { ww: true, en: true }, ext: [], ww: JSON.parse(JSON.stringify(WW_DEF)), loaded: false };
    }
    return this._mds;
  }
  _mdApply(r) {
    const s = this._mdState();
    if (r && r.modules) {
      s.on = { ww: true, en: true, ...(r.modules.on || {}) }; s.ext = Array.isArray(r.modules.ext) ? r.modules.ext : [];
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
  _mdBackup() { const W = this._mdState().ww, ww = JSON.parse(JSON.stringify(W)); ["boost", "circ5", "away", "day", "info"].forEach((k) => delete ww[k]); delete ww.leg.last; const E = this._enState(); return { modules: { on: this._mdState().on, ext: this._mdState().ext, energy: { ent: E.ent, sign: E.sign || "", bsign: E.bsign, bmode: E.bmode === "two" ? "two" : "one", pvn: E.pvn || "", pv2n: E.pv2n || "" } }, ww }; }
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
    const apply = (x) => { if (!x || this._dragging || (this._modal && ["wwset", "wwsch", "mods", "enset"].includes(this._modal.type)) || this._mdT) return; this._mdApply(x); this._render(); };
    if (r) { apply(r); return; }
    this._hass.callWS({ type: "fenster_heizung/get_modules" }).then(apply).catch(() => {});
  }
  _mdActiveSet(id) { const s = this._mdState(); s.active = id; try { localStorage.setItem("fh_mod_active", id); } catch (_) { /* Speicher gesperrt */ } }
  _mdList() { const s = this._mdState(); return [MODS[0], ...(s.on.ww ? [MODS[1]] : []), ...(this._enOn() ? [MODS[2]] : []), ...s.ext.filter((x) => x.on).map((x) => ({ id: x.id, n: 0, name: x.name, short: x.name, icon: "puzzle", tag: "Externes Modul", ext: x }))]; }
  _mdActive() { const s = this._mdState(); return this._mdList().some((m) => m.id === s.active) ? s.active : "fh"; }
  _mdBar() {
    const a = this._mdActive(), bad = this._wwProblems().some((p) => p[0] === "bad" || p[0] === "warn");
    return `<nav class="mbar" aria-label="Module">${this._mdList().map((m) => `<button class="mtab ${a === m.id ? "sel" : ""}" data-act="mdgo" data-k="${m.id}" aria-pressed="${a === m.id}">${ic(m.icon, 20)}<span><small>${m.n ? "Modul " + m.n : "Eigenes Modul"}</small><b>${esc(m.short)}</b></span>${m.id === "ww" && bad ? `<i class="mdot" title="Hinweise vorhanden"></i>` : ""}</button>`).join("")}<button class="mtab add" data-act="mdmgr" aria-label="Module verwalten">${ic("plus", 18)}<span><small>Erweitern</small><b>Module</b></span></button></nav>`;
  }
  _mdRender() {
    const sr = this.shadowRoot, a = this._mdActive(), m = this._mdList().find((x) => x.id === a), adm = this._admin();
    let body = "", pills = "";
    if (a === "ww") { body = this._wwPage(); pills = adm ? `<button class="pillbtn" data-act="mdsetup" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; this._wwLoad(); }
    else if (a === "en") { body = this._enPage(); pills = adm ? `<button class="pillbtn" data-act="mdensetup" aria-label="Einstellungen">${ic("sliders", 16)}<span class="bl">Einstellungen</span></button>` : ""; }
    else body = `<div class="card empty">${ic("puzzle", 36)}<div style="margin:10px 0 4px;font-weight:700;color:var(--primary-text-color)">${esc(m.name)}</div>Dieses Modul wird aus <code>${esc(m.ext.url)}</code> geladen.<br><span class="sm">Externe Module werden in einer späteren Version geladen.</span></div>`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><span class="logo ${a === "ww" ? "ww" : ""}">${ic(m.icon, 22)}</span><div><b>${m.n ? "Modul " + m.n + " – " : ""}${esc(m.name)}</b><span><em class="tag">${esc(m.tag)}</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>${pills}</div>
      ${this._mdBar()}<div class="wrap">${body}</div>`;
  }
  _mdAct(a, b) {
    const s = this._mdState(), m = this._modal, k = b.dataset.k;
    if (a === "mdgo") { this._mdActiveSet(k); this._render(); }
    else if (a === "mdmgr") { this._modal = { type: "mods" }; this._renderModal(); }
    else if (a === "mdsetup") { this._modal = { type: "wwset" }; this._renderModal(); }
    else if (a === "mdensetup") { this._modal = { type: "enset" }; this._renderModal(); }
    else if (a === "mdtog") {
      if (k === "ww") s.on.ww = !s.on.ww; else if (k === "en") { s.on.en = !this._enOn(); this._enState().on = s.on.en; } else { const x = s.ext.find((e) => e.id === k); if (x) x.on = !x.on; }
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
  }
  _mdChange(t) {
    const f = t.dataset.f, m = this._modal;
    if (f === "mdurl") { if (m) m.url = t.value; return true; }
    if (f.startsWith("ww")) return this._wwChange(t);
    if (f.startsWith("en")) return this._enChange(t);
    return false;
  }
  _mdModal() {
    const m = this._modal;
    if (m.type === "wwset") return this._wwSetModal();
    if (m.type === "wwsch") return this._wwSchModal();
    if (m.type === "enset") return this._enSetModal();
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
      <div class="lsec">${ic("clock", 15)}Geplant</div>
      ${MOD_SOON.map(([ico, n, t]) => row("", ico, n, t, `<span class="mbadge soon">Geplant</span>`)).join("")}
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
    return out.length ? out : [["ok", "check", "Alles in Ordnung", "Sensoren erreichbar, Speicher im Soll, Pumpe unauffällig."]];
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
    const path = (ser) => ser.map((p, i) => `${i ? "L" : "M"}${X(p.t).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(" ") + ` L${X(total).toFixed(1)} ${Y(ser[ser.length - 1].v).toFixed(1)}`;
    s += `<path d="${path(top.ser)} L${X(total)} ${T + ih} L${X(top.ser[0].t)} ${T + ih} Z" fill="url(#wwag)"/>`;
    lines.slice().reverse().forEach((x) => { s += `<path d="${path(x.ser)}" fill="none" stroke="${cols[x.k]}" stroke-width="${x === top ? 2.4 : 2}" stroke-linejoin="round" stroke-linecap="round"/>`; });
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
    const probs = this._wwProblems();
    const hero = `<div class="card hero wwh">
      <div class="wwl1"><div class="lbl">${ic("drop", 16)}Warmwasser oben im Speicher</div>
      <div class="big">${t.top != null ? num(t.top, 1) : "–"}<small>°C</small></div><div class="sub">Soll ${num(want, 0)} °C · ${W.size} Liter</div></div>
      <div class="wwtk">${this._wwTank(t)}</div>
      <div class="chips"><span class="chip st ${st[2]}">${ic(st[0], 16)}${st[1]}</span>${sh != null ? `<span class="chip">${ic("shower", 16)}Reicht für ca. ${sh} ${sh === 1 ? "Dusche" : "Duschen"}</span>` : ""}${E.pump ? `<span class="chip">${ic("drop", 16)}Zirkulation ${pumpOn ? "läuft" : "aus"}</span>` : ""}${W.pv.on && pvNow != null ? `<span class="chip">${ic("bolt", 16)}PV-Überschuss ${wfmt(pvNow)}</span>` : ""}</div>
      ${adm ? `<div class="wwacts"><button class="wwa ${W.boost ? "on" : ""}" data-act="wwboost">${ic("flame", 17)}<span>${W.boost ? "Aufheizen stoppen" : "Einmal aufheizen"}</span></button><button class="wwa ${W.circ5 ? "on" : ""}" data-act="wwcirc5" ${E.pump ? "" : "disabled"}>${ic("clock", 17)}<span>${W.circ5 ? "Zirkulation läuft 5 Min." : "Zirkulation 5 Min."}</span></button><button class="wwa ${W.away ? "on" : ""}" data-act="wwaway">${ic("suitcase", 17)}<span>${W.away ? "Abwesend: an" : "Abwesend"}</span></button></div>` : ""}</div>`;
    const tiles = `<div class="tiles">${[
      ["flame", "Erzeuger", srcMin == null ? "–" : srcMin, "Min.", "var(--amber)", "Aktive Zeit, letzte 24 Std."],
      ["drop", "Zirkulation", pumpMin == null ? "–" : pumpMin, "Min.", "var(--teal)", `Plan: ${num(circH, 1)} Std. pro Tag`],
      ["thermo", "Rücklauf", rv == null ? "–" : num(rv, 1), "°C", "#60a5fa", `Pumpe stoppt ab ${W.circ.ret_max} °C`],
      ["shield", "Legionellenschutz", legD == null ? "–" : legD, legD === 1 ? "Tag her" : "Tage her", "#a78bfa", W.leg.on ? `Nächster Lauf: ${DAYS[W.leg.day]} ${W.leg.time}` : "Ausgeschaltet"],
    ].map(([ico, lab, v, u, col, sub]) => `<div class="tile" style="--a:${col}"><div class="t">${ic(ico, 17)}${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div></div>`).join("")}</div>`;
    const chart = `<div class="card"><h2>${ic("chart", 18)}Speicher · letzte 24 Stunden<button class="ibtn gear" style="margin-left:auto" data-act="wwreload" aria-label="Aktualisieren">${ic("clock", 16)}</button></h2>${this._wwChart()}</div>`;
    const dayTabs = (w) => `<div class="seg wwseg" role="group">${[["wd", "Montag–Freitag"], ["we", "Wochenende"]].map(([k, l]) => `<button class="${key === k ? "sel" : ""}" data-act="wwday" data-k="${k}" aria-pressed="${key === k}">${l}</button>`).join("")}</div>`;
    const heatC = `<div class="card"><h2>${ic("plan", 18)}Warmwasser-Zeitplan${adm ? `<button class="lnk" style="margin-left:auto" data-act="wwsch" data-k="heat">${ic("pencil", 15)}Bearbeiten</button>` : ""}</h2>${dayTabs()}
      ${this._wwBar(W.heat[key], "heat")}<div class="wwrs">${this._wwList(W.heat[key], "heat")}</div>
      <div class="wwnote">${ic("moon", 15)}<span>Außerhalb der Zeiten hält der Speicher <b>${W.heat.low} °C</b>. ${W.pv.on ? "Bei PV-Überschuss heizt er bis " + W.pv.max + " °C." : ""}</span></div></div>`;
    const modes = [["plan", "Zeitplan"], ["demand", "Bei Bedarf"], ["interval", "Intervall"], ["off", "Aus"]];
    const cm = W.circ.mode;
    const circC = `<div class="card"><h2>${ic("drop", 18)}Zirkulation${E.pump ? `<span class="wwst ${pumpOn ? "on" : ""}">${pumpOn ? "Pumpe läuft" : "Pumpe aus"}</span>` : ""}</h2>
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
    const legC = `<div class="card"><h2>${ic("shield", 18)}Legionellenschutz<button class="sw ${lg.on ? "on" : ""}" style="margin-left:auto" data-act="wwleg" aria-pressed="${lg.on}" aria-label="Legionellenschutz"></button></h2>
      ${lg.on ? `<div class="mut sm" style="margin:0 0 6px">Der Speicher wird regelmäßig auf Schutztemperatur gebracht und gehalten.</div>
        <div class="dchips">${DAYS.map((d, i) => `<button class="dc ${lg.day === i ? "sel" : ""}" data-act="wwlegday" data-k="${i}">${d}</button>`).join("")}</div>
        ${this._wwNumT("Uhrzeit", "Am besten nachts, wenn niemand duscht.", "leg.time", lg.time, adm)}${this._wwNum("Schutztemperatur", "", "leg.temp", lg.temp, 55, 65, 1, "°C", adm)}${this._wwNum("Halten für", "", "leg.hold", lg.hold, 10, 60, 5, "Min.", adm)}
        <div class="dgs ${!lg.last ? "" : lg.last.ok ? (legD > 9 ? "warn" : "ok") : "warn"}">${ic(!lg.last ? "info" : lg.last.ok ? "check" : "alert", 22)}<div><b>${lg.last ? `Letzte Aufheizung: ${new Date(lg.last.ts).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "numeric" })}, ${new Date(lg.last.ts).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr` : "Noch keine Aufheizung aufgezeichnet"}</b><span>${lg.last ? `${num(lg.last.max, 1)} °C erreicht, ${lg.last.held} Min. gehalten` : "Der erste Lauf folgt zum eingestellten Zeitpunkt."}</span></div><span></span></div>`
      : `<div class="gst on">${ic("alert", 15)}Aus. In Speichern über 400 Liter oder mit Zirkulation wird ein regelmäßiges Aufheizen empfohlen.</div>`}</div>`;
    const pv = W.pv;
    const pvC = `<div class="card"><h2>${ic("bolt", 18)}PV-Überschuss nutzen<button class="sw ${pv.on ? "on" : ""}" style="margin-left:auto" data-act="wwpv" aria-pressed="${pv.on}" aria-label="PV-Überschuss"></button></h2>
      ${pv.on ? `<div class="mut sm" style="margin:0 0 6px">Der Speicher wird bei Überschuss über das Soll hinaus geladen. Sensor, Batterie-Grenze und Vorzeichen kommen aus Modul 1 → Allgemein. Der Heizstab hat Vorrang vor den Raumheizern.</div>
        ${this._wwNum("Ab Überschuss", "", "pv.min", pv.min, 300, 6000, 100, "W", adm)}${this._wwNum("Speicher bis maximal", "", "pv.max", pv.max, 50, 65, 1, "°C", adm)}${this._wwNum("Leistung Heizstab", "Damit erkennt das Modul, wann der Überschuss reicht.", "pv.watt", pv.watt, 300, 9000, 100, "W", adm)}
        <div class="gst ${E.rod ? "" : "on"}">${ic(E.rod ? "bolt" : "info", 15)}${E.rod ? (pvNow == null ? "Kein PV-Sensor gewählt." : pvNow >= pv.min ? `Aktuell ${wfmt(pvNow)} Überschuss – der Heizstab darf laufen.` : `Aktuell ${wfmt(pvNow)} Überschuss – zu wenig, Heizstab bleibt aus.`) : "Für PV-Heizung fehlt noch der Heizstab-Schalter in den Einstellungen."}</div>` : `<div class="mut sm">Aus.</div>`}</div>`;
    const dg = `<div class="card"><h2>${ic("tools", 18)}Zustand</h2>${probs.map(([lv, ico, ti, tx]) => `<div class="dgs ${lv === "mut" ? "" : lv}">${ic(ico, 22)}<div><b>${esc(ti)}</b><span>${esc(tx)}</span></div><span></span></div>`).join("")}<div class="mut sm" style="margin:0">Hinweise erscheinen auch in der Gerätediagnose und als Meldung.</div></div>`;
    return `${hero}${tiles}${chart}<div class="wwg2">${heatC}${circC}</div><div class="wwg2">${legC}${pvC}</div>${dg}<div class="note">Das Modul schaltet nur die gewählten Geräte. Bei Überschuss hat der Warmwasser-Heizstab Vorrang vor den Raumheizern.</div>`;
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
    const hero = `<div class="card hero enh"><div class="lbl">${ic("home", 16)}Hausverbrauch jetzt</div><div class="big">${n.house >= 1000 ? num(n.house / 1000, 2) : Math.round(n.house)}<small>${n.house >= 1000 ? "kW" : "W"}</small></div><div class="sub">${covered} % aus Solar${n.b2h > 20 ? " und Batterie" : ""} gedeckt</div>
      <div class="chips"><span class="chip">${ic("sun", 16)}Solar ${wfmt(n.pv)}</span>${n.pvb != null && n.pvb >= 1 ? `<span class="chip">${ic("sun", 16)}davon ${esc(this._enPvNames()[1])} ${wfmt(n.pvb)}</span>` : ""}<span class="chip st ${n.exp > 20 ? "ok" : n.imp > 20 ? "warn" : ""}">${ic("bolt", 16)}${n.exp > 20 ? "Einspeisung " + wfmt(n.exp) : n.imp > 20 ? "Netzbezug " + wfmt(n.imp) : "Netz ausgeglichen"}</span>${n.hasBat ? `<span class="chip">${ic("energy", 16)}Batterie ${n.soc != null ? Math.round(n.soc) + " %" : ""}${n.bc > 20 ? " lädt" : n.dis > 20 ? " entlädt" : ""}</span>` : ""}${autarky != null && range === "day" ? `<span class="chip st ok">${ic("check", 16)}Autarkie heute ${autarky} %</span>` : ""}</div></div>`;
    const tabs = `<div class="seg wwseg enseg" role="group">${[["day", "Heute"], ["week", "7 Tage"], ["month", "30 Tage"]].map(([k, l]) => `<button class="${range === k ? "sel" : ""}" data-act="enrange" data-k="${k}" aria-pressed="${range === k}">${l}</button>`).join("")}</div>`;
    const kwh = (v) => (v == null ? "–" : num(v, v >= 100 ? 0 : v >= 10 ? 1 : 2));
    const eur = (kwhv, ct) => (kwhv == null ? null : (kwhv * ct) / 100);
    const tiles = `<div class="tiles">${[
      ["sun", "Solar", sum && !sum.empty ? kwh(sum.pv) : "–", "kWh", "#fbbf24", (sum && !sum.empty && sum.pvb > 0.005 ? `davon ${esc(this._enPvNames()[1])} ${kwh(sum.pvb)} kWh · ` : "") + (evq != null ? `${evq} % selbst genutzt` : sum && sum.nocnt ? "Sensor fehlt" : "Keine Daten")],
      ["bolt", "Netzbezug", sum && !sum.empty ? kwh(sum.imp) : "–", "kWh", "#f87171", sum && !sum.empty ? `${num(eur(sum.imp, price), 2)} € Kosten` : "Keine Daten"],
      ["upload", "Einspeisung", sum && !sum.empty ? kwh(sum.exp) : "–", "kWh", "#34d399", sum && !sum.empty ? `${num(eur(sum.exp, feed), 2)} € Vergütung` : "Keine Daten"],
      ["home", "Verbrauch", sum && !sum.empty ? kwh(sum.house) : "–", "kWh", "#2dd4bf", autarky != null ? `${autarky} % Autarkie` : "Keine Daten"],
    ].map(([ico, lab, v, u, c, sub]) => `<div class="tile" style="--a:${c}"><div class="t">${ic(ico, 17)}${lab}</div><div class="v">${v}<small>${u}</small></div><div class="g">${sub}</div></div>`).join("")}</div>`;
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
    return `${hero}${tabs}${tiles}<div class="wwg2">${flow}${chart}</div><div class="wwg2">${dist}${cost}</div><div class="wwg2">${heatC}${tipC}</div>`;
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
      <div class="foot2"><button class="btn2 pri" data-act="ensdone">Fertig</button></div></div>`;
  }
}
customElements.define("fenster-heizung-panel", FensterHeizungPanel);
