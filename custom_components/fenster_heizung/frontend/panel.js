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
const BLOCKS = { hero: "Kopfkarte", presence: "Anwesenheit", tiles: "Kennzahlen", chart: "Diagramm", rooms: "Räume" };
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAYS_LONG = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
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
const vgt = (a, b) => { const x = vnum(a), y = vnum(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
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
.air{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 0}
.air .ac{background:color-mix(in srgb,var(--c) 9%,transparent);border:1px solid color-mix(in srgb,var(--c) 28%,transparent);border-radius:12px;padding:8px 10px;min-width:0}
.air .ac .t{font-size:.7rem;color:var(--mut);display:flex;gap:5px;align-items:center;white-space:nowrap}
.air .ac .v{font-weight:700;font-size:1.02rem;margin-top:2px;white-space:nowrap}
.air .ac .s{font-size:.7rem;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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
@media(max-width:520px){.air{grid-template-columns:1fr 1fr}.air .ac:last-child{grid-column:1/-1}.upd{flex-wrap:wrap}}
.pnote.wxa{margin-top:8px;color:var(--teal);background:color-mix(in srgb,var(--teal) 11%,transparent)}.pnote.wxa.fr{color:var(--slate);background:color-mix(in srgb,var(--slate) 12%,transparent)}
.learn{border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:0 0 12px;background:color-mix(in srgb,var(--teal) 6%,transparent)}
.learn .lt{display:flex;gap:7px;align-items:center;font-weight:700;font-size:.9rem}.learn .lt em{font-style:normal;font-weight:500;font-size:.74rem;color:var(--mut);margin-left:auto}
.learn .lbig{margin:8px 0 10px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}.learn .lbig b{font-size:1.7rem;letter-spacing:-.3px}.learn .lbig span{font-size:.8rem;color:var(--mut)}
.lrow{display:grid;grid-template-columns:104px 1fr 78px 30px;gap:8px;align-items:center;font-size:.78rem;margin:5px 0}.lrow span{color:var(--mut)}.lrow b{text-align:right;font-size:.78rem}.lrow small{color:var(--mut);text-align:right}
.lbar{height:8px;border-radius:4px;background:color-mix(in srgb,var(--mut) 22%,transparent);overflow:hidden}.lbar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,var(--slate),var(--amber))}
.lhint{display:flex;gap:7px;align-items:flex-start;font-size:.78rem;color:var(--mut);margin-top:9px}.lhint .ic{flex:none;margin-top:1px}
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
.rchart{display:block;width:100%;height:auto;cursor:crosshair}
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
`;

class FensterHeizungPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._narrow = false; this._edit = false; this._modal = null; this._dragging = false;
    this._cfg = { layout: { blocks: [], rooms: [], icons: {}, groups: [] }, plans: {}, presence: { mode: "home" } };
    this._gen = { updates: true, summer: { mode: "auto", temp: 18, days: 3 }, wxadj: { on: false, mild: 12, down: 1, frost: 0, up: 1 } };
    this._learn = {}; this._st = null; this._pollN = 0;
  }
  connectedCallback() {
    this._ro = new ResizeObserver(() => { if (this._hass && !this._dragging && Math.abs(this.clientWidth - (this._w || 0)) > 24) this._render(); });
    this._ro.observe(this);
    this._ti = setInterval(() => this._tick(), 1000);
  }
  disconnectedCallback() { this._ro && this._ro.disconnect(); clearInterval(this._ti); }
  _tick() {
    if (this._hass && ++this._pollN % 60 === 0) this._pollGen();
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
      if (eid.startsWith("switch.")) { if (a.funktion === "heizplan") { r.planOn = st.state === "on"; } else { r.sw = eid; r.on = st.state === "on"; } }
      else if (a.zeitraum) {
        r.fuel = FUELS[a.brennstoff] ? a.brennstoff : "erdgas";
        r.sc[a.zeitraum] = { min: Number(st.state) || 0, gas: Number(a.gespart_menge ?? a.gespartes_gas_m3) || 0, kwh: a.gespartes_gas_kwh || 0 };
        r.apk = Number(a.menge_pro_kwh) || r.apk || 0.1;
        if (a.zeitraum === "day") { r.pauses = a.pausen_heute || 0; r.kw = a.aktuelle_leistung_kw || 0; r.hist = a.verlauf || {}; }
      } else if ("thermostate" in a) {
        r.modeEid = eid; r.mode = st.state; r.why = a.grund || []; r.windows = a.fenster || []; r.thermos = Object.keys(a.thermostate || {}); if (a.entry_id) r.id = a.entry_id; r.humEid = a.luftfeuchte_sensor || ""; r.wxOff = a.wetter_anpassung === "aus"; r.airOff = a.lueftungshinweise === "aus";
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
    const all = [...o, ...known.filter((b) => !o.includes(b))];
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
      <div class="rn"><b>${esc(r.name)}</b><span class="pill ${m.c}">${m.t}</span>${this._airChip(r)}</div>
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
    const a = this._airData(r); if (!a) return "";
    const [ml, mc] = MOLD[a.lvl], hc = a.rh >= 70 ? "red" : a.rh >= 60 ? "amber" : "green";
    return `<div class="air"><div class="ac ${hc}"><div class="t">${ic("drop", 13)}Luftfeuchte</div><div class="v">${num(a.rh)} %</div><div class="gauge"><i style="width:${Math.min(100, a.rh)}%"></i></div></div>
      <div class="ac slate"><div class="t">${ic("thermo", 13)}Taupunkt</div><div class="v">${num(a.td, 1)} °C</div><div class="s">Wand ${num(a.ts, 1)} °C</div></div>
      <div class="ac ${mc}"><div class="t">${ic("alert", 13)}Schimmel</div><div class="v">${ml}</div><div class="s">${num(a.rs)} % Wand</div></div></div>${this._airMsg(a)}`;
  }
  _airChip(r) {
    const a = this._airData(r); if (!a) return "";
    if (a.open) { const c = cdown(a.since, a.need); return `<span class="achip green" data-since="${a.since}" data-need="${a.need}">${ic("windy", 12)}<span data-cd>${c.txt}</span></span>`; }
    const [ml, mc] = MOLD[a.lvl]; return `<span class="achip ${mc}">${ic("drop", 12)}${num(a.rh)} % · Schimmel ${ml}</span>`;
  }
  _acc() { const a = this._cfg.layout.accent; return HEX.test(a || "") ? a : DEF_ACC; }
  _applyLook() { const a = this._acc(); this.style.setProperty("--teal", a); this.style.setProperty("--on-acc", onColor(a)); }
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
    const data = { app: "fenster_heizung", format: 1, version: this._ver, created: new Date().toISOString(), layout: this._cfg.layout, plans: this._cfg.plans, presence: this._cfg.presence, general: this._gen, rooms };
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
      <div class="rn"><b>${esc(r.name)}</b><div class="pl"><span class="pill ${m.c}">${m.t}</span><button class="why" data-act="why" data-id="${esc(r.id)}" aria-label="Warum?">${ic("info", 13)}Warum?</button><button class="why" data-act="rep" data-id="${esc(r.id)}" aria-label="Bericht">${ic("chart", 13)}Bericht</button></div></div>
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
      ${this._airBox(r)}
      <div class="foot"><div class="a"><b>${num(d.min)} Min. pausiert</b><span>${r.pauses || 0}× heute · ~${num(d.gas, 2)} ${FUELS[r.fuel || "erdgas"].label} · ${num(r.kw, 2)} kW</span></div>${this._spark(r)}</div></div>`;
  }

  _render() {
    if (!this._hass || this._dragging) return;
    const sr = this.shadowRoot;
    if (!this._built) { this._build(); }
    const bg = getComputedStyle(this).backgroundColor.match(/\d+/g) || [15, 20, 25];
    this.style.colorScheme = (0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2]) < 140 ? "dark" : "light";
    this._applyLook();
    const rooms = this._collect(), edit = this._edit, adm = this._admin();
    const sum = (sc, k) => rooms.reduce((a, r) => a + (r.sc[sc]?.[k] || 0), 0);
    const paused = rooms.filter((r) => r.mode === "heizung_pausiert").length;
    const fset = new Set(rooms.map((r) => r.fuel || "erdgas")), F = fset.size === 1 ? FUELS[[...fset][0]] : MIXED, mixed = fset.size > 1;
    const amt = (sc) => (mixed ? sum(sc, "kwh") : sum(sc, "gas"));
    const dateStr = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const tiles = [["day", "today", "Heute", "var(--teal)"], ["month", "month", "Monat", "#60a5fa"], ["year", "year", "Jahr", "#a78bfa"], ["total", "total", "Gesamt", "#f472b6"]];
    const content = {
      hero: () => `<div class="card hero">${this._art()}<img class="hlogo" src="${LOGO_URL}" alt="MADDOG3010" draggable="false">
        <div class="lbl">${ic("flame", 16)}Heute ${F.short} gespart (geschätzt)</div>
        <div class="big">${num(amt("day"), 2)}<small>${F.label}</small></div><div class="sub">${esc(dateStr)}</div>${this._wx()}
        <div class="chips">${this._sum().active ? `<span class="chip sum">${ic("sun", 16)}Sommermodus${this._sum().out != null ? ` · ${num(this._sum().out, 1)} °C draußen` : ""}</span>` : ""}${(() => { const a = this._wxAdj(); return a && a.d ? `<span class="chip">${ic(a.fr ? "snow" : "partly", 16)}Wetter-Anpassung ${a.d > 0 ? "+" : "−"}${num(Math.abs(a.d), 1)} °C</span>` : ""; })()}<span class="chip">${ic("clock", 16)}${num(sum("day", "min"))} Min. pausiert</span>
          <span class="chip">${ic("radiator", 16)}${paused} von ${rooms.length} ${rooms.length === 1 ? "Raum" : "Räumen"} pausiert</span>
          <span class="chip">${ic("thermo", 16)}${num(sum("day", "kwh"), 1)} kWh Wärme</span></div></div>`,
      presence: () => this._presenceCard(),
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
    const blocks = rooms.length ? this._blockOrder().map((id) => `<section class="blk ${edit ? "editing" : ""}" data-sort="block" data-id="${id}">
        ${edit ? `<div class="etag"><span class="grip" data-handle title="Verschieben">${ic("grip", 18)}</span>${BLOCKS[id]}</div>` : ""}${content[id]()}</section>`).join("")
      : `<div class="card empty">Noch keine Räume eingerichtet.<br>Füge unter Einstellungen › Geräte &amp; Dienste die Integration „Fenster &amp; Heizung“ hinzu.</div>`;
    sr.getElementById("main").innerHTML = `
      <div class="bar${this._narrow ? " nar" : ""}">${this._narrow ? `<button class="ib0" data-act="menu" aria-label="Menü">${ic("menu", 24)}</button>` : ""}
        <div class="brand"><span class="logo">${ic("windowOpen", 22)}</span><div><b>Modul 1 – Fenster &amp; Heizung</b><span><em class="tag">Smarte Fenster- und Heizungssteuerung</em>${this._ver ? `<em class="ver">Version ${esc(this._ver)}</em>` : ""}</span></div></div>
        ${adm ? `<button class="pillbtn" data-act="gen" aria-label="Allgemein">${ic("sliders", 16)}<span class="bl">Allgemein</span></button>` : ""}${adm && edit ? `<button class="pillbtn" data-act="look">${ic("palette", 16)}<span class="bl">Darstellung</span></button>` : ""}${adm ? (edit ? `<button class="pillbtn pri" data-act="done">${ic("check", 16)}<span class="bl">Fertig</span></button>` : `<button class="pillbtn" data-act="edit">${ic("pencil", 16)}<span class="bl">Anpassen</span></button>`) : ""}</div>
      <div class="wrap">${edit ? `<div class="banner">${ic("grip", 18)}<div>Ziehe Karten und Bereiche an den Griffen, um sie zu verschieben. Tippe auf ein Raumsymbol, um Symbol, Farbe und Foto zu ändern. Unter „Darstellung“ stellst du Akzentfarbe und Wetter ein.</div></div>` : ""}
        ${!edit ? this._updBanner() : ""}${blocks}${rooms.length ? `<div class="note">${mixed ? "Bei gemischten Brennstoffen wird die Ersparnis als Heizenergie in kWh gezeigt. Sie ist eine grobe Schätzung." : "Die " + F.noun + " ist eine grobe Schätzung. Die echte Ersparnis liegt etwas darunter."}</div>` : ""}</div>`;
  }

  _build() {
    const sr = this.shadowRoot;
    sr.innerHTML = `<style>${CSS}</style><div id="main"></div><div id="modal"></div><div id="toast"></div>`;
    this._built = true;
    sr.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (b) this._act(b.dataset.act, b); });
    const hov = (e) => { const c = e.target.closest && e.target.closest(".rchart"); if (!c || !this._repGeo) return; const bb = c.getBoundingClientRect(), g = this._repGeo; this._repHover(Math.min(1439, Math.max(0, ((e.clientX - bb.left) / bb.width * g.W - g.L) / g.iw * 1440))); };
    sr.addEventListener("pointermove", hov); sr.addEventListener("pointerdown", hov);
    sr.addEventListener("input", (e) => { const t = e.target; if (t.dataset && t.dataset.f === "oadd" && this._modal && this._modal.type === "opt") { if (t.value) { this._modal.draft[t.dataset.k].push(t.value); this._renderModal(); } return; } if (t.dataset && t.dataset.f === "oval" && this._modal && this._modal.type === "opt") { const D = this._modal.draft; D[t.dataset.k] = t.dataset.num ? (t.value === "" ? "" : Number(t.value)) : t.value; if (t.tagName === "SELECT" || t.dataset.k === "room_area") this._renderModal(); return; } if (t.dataset && t.dataset.f === "gname" && this._modal) this._modal.draft.name = t.value; });
    sr.addEventListener("pointerdown", (e) => { const g = e.target.closest("[data-handle]"); if (g) this._dragStart(e, g); });
    sr.addEventListener("change", (e) => {
      const t = e.target;
      if (this._lookChange(t)) return;
      if (t.dataset && t.dataset.f && t.dataset.f.startsWith("v") && this._modal && this._modal.type === "vac") { const k = { vfrom: "from", vto: "to", vtime: "preheat_time" }[t.dataset.f]; this._modal.draft[k] = t.value; if (k === "from" && t.value > this._modal.draft.to) this._modal.draft.to = t.value; this._renderModal(); }
      else if (t.dataset && t.dataset.f === "gname" && this._modal) { this._modal.draft.name = t.value; }
      else if (t.dataset && t.dataset.f === "time" && this._modal) { this._modal.draft.entries[+t.dataset.i].time = t.value || "00:00"; this._renderModal(); }
    });
  }

  /* ---------------- Aktionen ---------------- */
  _act(a, b) {
    const m = this._modal, i = +b.dataset.i, id = b.dataset.id;
    if (a === "menu") this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
    else if (["gtog", "gsw", "gmv", "gedit", "gadd", "gpick", "gicon", "gsave", "gdel"].includes(a)) this._gActions(a, b);
    else if (a === "opt") this._optOpen(id);
    else if (a === "oadd") this._nav(HA_PAGE);
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
    else if (a === "gen") { this._modal = { type: "gen", restore: null }; this._renderModal(); }
    else if (a === "news") { this._modal = { type: "news" }; this._renderModal(); }
    else if (a === "updx") { try { localStorage.setItem("fh_upd_skip", this._upd.latest); } catch (_) { /* egal */ } this._render(); this._toast("Hinweis ausgeblendet bis zur nächsten Version"); }
    else if (a === "skipv") { try { localStorage.setItem("fh_upd_skip", this._upd.latest); } catch (_) { /* egal */ } this._modal = null; this._renderModal(); this._render(); }
    else if (a === "hacs") { this._modal = null; this._renderModal(); this._nav("/hacs"); }
    else if (a === "chk") { this._toast(vgt(this._upd?.latest, this._ver) ? `Version ${this._upd.latest} ist verfügbar` : "Du hast die neueste Version"); }
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
    const d = { window_sensors: [], thermostats: [], open_delay: 60, close_delay: 30, action: "off", setback_temp: 12, heating_entity: "", heating_off_states: "off", outdoor_sensor: "", outdoor_max_temp: 15, block_from: "", block_to: "", notify_service: [], notify_after: 0, notify_title: "", notify_message: "", fuel: "erdgas", energy_per_unit: "", cop: 3.5, room_area: 0, heat_load_w_m2: 60, design_temp: -12, heat_power_kw: 1 };
    for (const k of Object.keys(d)) if (o[k] !== undefined && o[k] !== null) d[k] = Array.isArray(o[k]) ? [...o[k]] : o[k];
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
    const row = (label, hint, ctl) => `<div class="of"><div class="ol"><b>${label}</b>${hint ? `<span>${hint}</span>` : ""}</div><div class="oc">${ctl}</div></div>`;
    const num = (k, unit, o = {}) => row(o.l, o.h, `<span class="onum"><input type="number" inputmode="decimal" data-f="oval" data-k="${k}" data-num="1" value="${d[k]}" min="${o.min ?? ""}" max="${o.max ?? ""}" step="${o.step ?? 1}" ${o.ph ? `placeholder="${o.ph}"` : ""}><i>${unit}</i></span>`);
    const txt = (k, o = {}) => row(o.l, o.h, `<input class="otxt" data-f="oval" data-k="${k}" value="${esc(d[k])}">`);
    const time = (k, o) => row(o.l, o.h, `<span class="onum"><input type="time" data-f="oval" data-k="${k}" value="${d[k] || ""}">${d[k] ? `<button class="oclr" data-act="oclr" data-k="${k}" aria-label="Zurücksetzen">${ic("close", 14)}</button>` : ""}</span>`);
    const seg = (k, opts) => `<div class="seg oseg">${opts.map(([v, l]) => `<button class="${d[k] === v ? "sel" : ""}" data-act="oset" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const multi = (k, cand, l, h) => row(l, h, `<div class="ochips">${d[k].map((e) => `<span class="och">${fn(e)}<button data-act="orm" data-k="${k}" data-e="${esc(e)}" aria-label="Entfernen">${ic("close", 12)}</button></span>`).join("")}<select class="oadd" data-f="oadd" data-k="${k}"><option value="">＋ hinzufügen</option>${cand.filter((e) => !d[k].includes(e)).map((e) => `<option value="${esc(e)}">${fn(e)}</option>`).join("")}</select></div>`);
    const one = (k, cand, l, h) => { const c = d[k] && !cand.includes(d[k]) ? [d[k], ...cand] : cand; return row(l, h, `<select class="osel" data-f="oval" data-k="${k}"><option value="">– keine –</option>${c.map((e) => `<option value="${esc(e)}" ${d[k] === e ? "selected" : ""}>${fn(e)}</option>`).join("")}</select>`); };
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
      sec("air", "drop", "Raumluft", d.humidity_sensor ? fn(d.humidity_sensor) : "kein Luftfeuchte-Sensor",
        one("humidity_sensor", ent("sensor", "humidity"), "Luftfeuchte-Sensor", "Dann zeigt die Karte Taupunkt, Schimmelrisiko und Lüftungsempfehlung.") +
        row("Lüftungshinweise und Schimmelwarnung", "Auf der Karte und als Erinnerung nach dem Lüften.", seg("air_hint", [["on", "An"], ["off", "Aus"]]))),
      sec("wxa", "partly", "Wetter-Anpassung", d.weather_adj === "off" ? "ausgenommen" : "folgt der allgemeinen Einstellung",
        row("Zieltemperatur nach Wetter anpassen", "Die Grenzwerte stellst du unter „Allgemein“ ein.", seg("weather_adj", [["on", "Ja"], ["off", "Ausnehmen"]]))),
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

  _renderModal() {
    const box = this.shadowRoot.getElementById("modal"), m = this._modal;
    const old = box.querySelector(".sheet"), top = old ? old.scrollTop : 0;
    if (!m) { box.innerHTML = ""; return; }
    const r = this._collect().find((x) => x.id === m.id) || { name: "" };
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
      const g = this._gen, sm = g.summer, S = this._sum(), rs = m.restore, u = this._upd, wa = g.wxadj, wadj = this._wxAdj();
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
    } else if (m.type === "look") {
      const S = this._hass.states, a = this._acc(), w = this._wxCfg(), nm = (k) => S[k].attributes.friendly_name || k;
      const wl = Object.keys(S).filter((k) => k.startsWith("weather.")), sl = Object.keys(S).filter((k) => k.startsWith("sensor.") && (S[k].attributes.device_class === "temperature" || /°[CF]/.test(S[k].attributes.unit_of_measurement || "")));
      box.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">
        <div class="sh"><div><b>Darstellung</b><span>gilt für alle Nutzer</span></div><button class="ibtn" data-act="close" aria-label="Schließen">${ic("close", 20)}</button></div>
        <div class="lsec">${ic("palette", 15)}Akzentfarbe</div>
        <div class="swatches">${ACCENTS.map((c) => `<button class="sw2 ${a === c ? "sel" : ""}" style="background:${c}" data-act="lacc" data-k="${c}" aria-label="${c}"></button>`).join("")}<label class="cpick"><input type="color" data-f="lacc" value="${a}">Eigene</label></div>
        <div class="lsec">${ic("sun", 15)}Wetter in der Kopfkarte</div>
        <div class="ltog"><span>Außentemperatur und Wetter anzeigen</span><button class="sw ${w.on ? "on" : ""}" data-act="lwx" aria-pressed="${w.on}" aria-label="Wetter anzeigen"></button></div>
        ${w.on ? `<div class="mut sm" style="margin:0">Wetter-Entität</div><select class="lsel" data-f="lwxe"><option value="">Automatisch${wl[0] ? ` (${esc(nm(wl[0]))})` : ""}</option>${wl.map((k) => `<option value="${esc(k)}" ${w.entity === k ? "selected" : ""}>${esc(nm(k))}</option>`).join("")}</select>
        <div class="mut sm" style="margin:0">Außentemperatur-Sensor</div><select class="lsel" data-f="lwxo"><option value="">Vom Wetterdienst übernehmen</option>${sl.map((k) => `<option value="${esc(k)}" ${w.outdoor === k ? "selected" : ""}>${esc(nm(k))}</option>`).join("")}</select>` : ""}
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
}
customElements.define("fenster-heizung-panel", FensterHeizungPanel);
