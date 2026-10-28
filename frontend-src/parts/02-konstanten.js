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
const MOD_MU = { id: "mu", n: 17, name: "Müllabfuhr", short: "Müllabfuhr", icon: "trash", tag: "Abholtermine, Tonnen-Ampel und Erinnerung", lab: true };
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

