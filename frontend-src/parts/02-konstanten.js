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
const SPN_MAIL = "00.verkauf_kompass@icloud.com";
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
const MODS = [{ id: "fh", n: 1, name: "Fenster & Heizung", short: "Fenster & Heizung", icon: "windowOpen", tag: "Smarte Fenster- und Heizungssteuerung" }, { id: "ww", n: 2, name: "Warmwasser & Zirkulation", short: "Warmwasser", icon: "boiler", tag: "Speicher, Zirkulation und Legionellenschutz" }, { id: "en", n: 3, name: "Energie-Übersicht", short: "Energie", icon: "energy", tag: "Heizung, Strom und PV im Überblick" }, { id: "gs", n: 4, name: "Gerätestrom", short: "Gerätestrom", icon: "laundry", tag: "Woher der Strom kommt und was er kostet" }, { id: "lu", n: 5, name: "Lüftung & Raumluft", short: "Lüftung", icon: "fan", tag: "KWL, CO₂ und Feuchte", beta: true }, { id: "rb", n: 6, name: "Rollläden & Beschattung", short: "Rollläden", icon: "blinds", tag: "Sonnenstand, Hitzeschutz und Heizbedarf", beta: true }, { id: "wp", n: 7, name: "Wärmepumpe", short: "Wärmepumpe", icon: "heatpump", tag: "Laufzeit, Takten und Abtauen", beta: true }, { id: "ev", n: 8, name: "Elektroauto & Wallbox", short: "E-Auto", icon: "car", tag: "Ladestand, Ladekabel, Wallbox und Kilometerstand", beta: true }, { id: "wx", n: 9, name: "Wetter & Warnungen", short: "Wetter", icon: "alert", tag: "Unwetter-, Sturm- und Frostwarnungen mit Aktionen", beta: true }, { id: "ga", n: 10, name: "Garten & Bewässerung", short: "Garten", icon: "plant", tag: "Regenprognose, Zisterne und Bewässerung bei PV-Überschuss", beta: true }, { id: "sf", n: 11, name: "Rauch- & Sicherheitsmelder", short: "Sicherheit", icon: "shield", tag: "Melder, Batteriestände und Alarme im Überblick", beta: true }, { id: "pl", n: 12, name: "Pool & Sauna", short: "Pool & Sauna", icon: "wave", tag: "Pumpe und Heizung nach PV-Überschuss und Strompreis", beta: true }, { id: "bt", n: 13, name: "Batteriespeicher-Planung", short: "Batterie", icon: "energy", tag: "Modi, Zeitplan und Ladestand-Grenzen", beta: true }, { id: "dt", n: 14, name: "Dynamischer Stromtarif", short: "Stromtarif", icon: "chart", tag: "Börsenpreis pro Stunde und günstigste Zeiten", beta: true }, { id: "wa", n: 15, name: "Wartung & Erinnerungen", short: "Wartung", icon: "tools", tag: "Schornsteinfeger, Filter, Termine und Betriebsstunden", beta: true }, { id: "sp", n: 16, name: "Solar-Prognose", short: "Prognose", icon: "sun", tag: "Ertrag heute und morgen, Prognose gegen tatsächlich", beta: true }, { id: "ef", n: 19, name: "Hausfluss", short: "Hausfluss", icon: "energy", tag: "Dein Haus als Fluss-Bild: Solar, Netz, Akku und Verbraucher", beta: true, sponsor: true }];
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
const MOD_ST = { ef: "beta", sf: "beta", sp: "vorab", ev: "beta", wx: "beta", dt: "beta" };
const modSt = (m) => (!m ? "" : m.beta ? MOD_ST[m.id] || "dev" : m.n >= 1 && m.n <= 4 ? "stabil" : "");
const STG = { dev: { t: "In Entwicklung", h: "In Entwicklung", c: "dvl" }, beta: { t: "Beta", h: "Beta-Version", c: "beta" }, vorab: { t: "Vorabversion", h: "Vorabversion", c: "vab" }, stabil: { t: "Stabil", h: "Stabil", c: "stb" } };
const MOD_SET = { ef: { act: "efxopen", txt: "Kacheln, Entitäten, Flussarten, Bilder und Kopfbereich" }, sp: { act: "spxopen", txt: "Prognose-Quelle und Ertragssensor für den Vergleich" }, wa: { act: "mdbeta", txt: "Wartungstermine, Filter und Betriebsstunden (in Entwicklung)" }, bt: { act: "mdbeta", txt: "Modi, Zeitplan und Ladestand-Grenzen (in Entwicklung)" }, dt: { act: "mdbeta", txt: "Börsenpreis, günstigste Fenster und Preisverlauf (in Entwicklung)" }, sf: { act: "sfxopen", txt: "Melderarten, Alarm-Aktionen, Batterie, Prüf-Erinnerung und Meldungen (Melder und Grundriss unter Einstellungen im Modul)" }, pl: { act: "mdbeta", txt: "Pumpe und Heizung nach Überschuss und Preis (in Entwicklung)" }, wx: { act: "wxsopen", txt: "Grenzwerte, Vorwarnung, Aktionen, Fenster-Erinnerung und Meldungen" }, ga: { act: "mdbeta", txt: "Regenprognose, Zisterne und Bewässerung (in Entwicklung)" }, ev: { act: "mdevset", txt: "Fahrzeug- und Wallbox-Sensoren (in Entwicklung)" }, gs: { act: "mdgs", txt: "Geräte, Batteriekosten, Prognose und Meldungen" }, lu: { act: "mdbeta", txt: "Raumluft-Übersicht, KWL und CO₂ (in Entwicklung)" }, rb: { act: "mdbeta", txt: "Sonnenstand, Hitzeschutz und Heizbedarf (in Entwicklung)" }, wp: { act: "mdbeta", txt: "Laufzeit, Takten und Abtauen (in Entwicklung)" }, fh: { act: "fhset", txt: "Sommermodus, Wetter-Absenkung, PV-Überschuss und Preise" }, ww: { act: "mdsetup", txt: "Speicher, Wärmeerzeuger, Zirkulation, Legionellenschutz" }, en: { act: "mdensetup", txt: "Solaranlagen, Netz, Batterie, Hausverbrauch" } };
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
/* Modul 19 Hausfluss: Bilder (Illustrationen, Emojis) und Plätze der Kacheln */
const EF_IMGS = [
  { id: 'sonne', n: 'Sonne', k: 'solar pv sonne photovoltaik erzeugung', s: '<circle cx="32" cy="32" r="11" fill="#fbbf24"/><path d="M32 6v7M32 51v7M6 32h7M51 32h7M13.6 13.6l5 5M45.4 45.4l5 5M13.6 50.4l5-5M45.4 18.6l5-5" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>' },
  { id: 'solar', n: 'Solarmodul', k: 'solar pv modul dach photovoltaik erzeugung', s: '<path d="M9 40l8-24h38l-8 24z" fill="#2563eb"/><path d="M13.5 28h39M25 16l-5 24M37 16l-3 24M49 16l-2 24" stroke="#bfdbfe" stroke-width="1.8"/><path d="M32 40v11M22 53h20" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round"/>' },
  { id: 'haus', n: 'Haus', k: 'haus gebäude zuhause verbrauch', s: '<path d="M8 31L32 11l24 20" fill="none" stroke="#f1f5f9" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><rect x="14" y="31" width="36" height="24" rx="4" fill="#7dd3fc"/><rect x="27" y="39" width="10" height="16" rx="2" fill="#0f172a"/>' },
  { id: 'akku', n: 'Akku', k: 'batterie speicher akku ladestand', s: '<rect x="7" y="19" width="45" height="27" rx="6" fill="none" stroke="#4ade80" stroke-width="4"/><rect x="53" y="28" width="5" height="10" rx="2" fill="#4ade80"/><rect x="13" y="25" width="8" height="15" rx="2" fill="#4ade80"/><rect x="24" y="25" width="8" height="15" rx="2" fill="#4ade80"/><rect x="35" y="25" width="8" height="15" rx="2" fill="#4ade80" opacity=".35"/>' },
  { id: 'auto', n: 'Auto', k: 'auto elektroauto fahrzeug laden', s: '<path d="M7 40l5-13c1-3 3-4 6-4h28c3 0 5 1 6 4l5 13v10H7z" fill="#f472b6"/><path d="M16 28h32l3 9H13z" fill="#fde7f3"/><circle cx="19" cy="50" r="6" fill="#0f172a"/><circle cx="45" cy="50" r="6" fill="#0f172a"/>' },
  { id: 'wallbox', n: 'Wallbox', k: 'wallbox ladestation auto laden', s: '<rect x="17" y="7" width="30" height="46" rx="9" fill="#e2e8f0"/><path d="M34 15l-7 11h6l-3 9 9-13h-6z" fill="#2dd4bf"/><path d="M32 53v6" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>' },
  { id: 'steckdose', n: 'Steckdose', k: 'steckdose stecker strom verbraucher', s: '<rect x="9" y="9" width="46" height="46" rx="13" fill="#f1f5f9"/><circle cx="32" cy="32" r="17" fill="#e2e8f0"/><circle cx="25.5" cy="32" r="3" fill="#0f172a"/><circle cx="38.5" cy="32" r="3" fill="#0f172a"/>' },
  { id: 'waschmaschine', n: 'Waschmaschine', k: 'waschmaschine wäsche waschen', s: '<rect x="12" y="7" width="40" height="50" rx="6" fill="#e2e8f0"/><circle cx="32" cy="36" r="14" fill="#38bdf8"/><circle cx="32" cy="36" r="8.5" fill="#bae6fd"/><circle cx="19" cy="15" r="2.5" fill="#64748b"/><rect x="26" y="13" width="20" height="4" rx="2" fill="#94a3b8"/>' },
  { id: 'trockner', n: 'Trockner', k: 'trockner wäsche trocknen', s: '<rect x="12" y="7" width="40" height="50" rx="6" fill="#e2e8f0"/><circle cx="32" cy="36" r="14" fill="#a78bfa"/><path d="M24 36a8 8 0 0 1 16 0" stroke="#ede9fe" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="19" cy="15" r="2.5" fill="#64748b"/><rect x="26" y="13" width="20" height="4" rx="2" fill="#94a3b8"/>' },
  { id: 'kuehlschrank', n: 'Kühlschrank', k: 'kühlschrank gefrierschrank kühlen', s: '<rect x="16" y="6" width="32" height="53" rx="6" fill="#e0f2fe"/><path d="M16 27h32" stroke="#7dd3fc" stroke-width="3"/><rect x="22" y="12" width="3.5" height="10" rx="1.7" fill="#64748b"/><rect x="22" y="32" width="3.5" height="15" rx="1.7" fill="#64748b"/>' },
  { id: 'wasser', n: 'Wasser', k: 'wasser tropfen wasserzähler durchfluss', s: '<path d="M32 7C22 21 16 30 16 38a16 16 0 0 0 32 0c0-8-6-17-16-31z" fill="#38bdf8"/><path d="M24 40a8 8 0 0 0 8 8" stroke="#e0f2fe" stroke-width="3" fill="none" stroke-linecap="round"/>' },
  { id: 'blitz', n: 'Blitz', k: 'blitz strom leistung energie', s: '<path d="M37 5L14 36h14l-4 23 26-33H36z" fill="#facc15"/>' },
  { id: 'heizung', n: 'Heizkörper', k: 'heizung heizkörper wärme wärmepumpe', s: '<rect x="8" y="14" width="48" height="34" rx="7" fill="#f1f5f9"/><g fill="#14b8a6"><rect x="15" y="21" width="5" height="20" rx="2.5"/><rect x="24" y="21" width="5" height="20" rx="2.5"/><rect x="33" y="21" width="5" height="20" rx="2.5"/><rect x="42" y="21" width="5" height="20" rx="2.5"/></g><circle cx="50" cy="53" r="4.5" fill="#f59e0b"/>' },
  { id: 'netz', n: 'Stromnetz', k: 'netz strommast netzbezug einspeisung zähler', s: '<path d="M32 6L20 58M32 6l12 52M25 24h14M22 38h20M12 17h40" stroke="#cbd5e1" stroke-width="3.5" stroke-linecap="round" fill="none"/>' },
  { id: 'lampe', n: 'Lampe', k: 'lampe licht beleuchtung glühbirne', s: '<path d="M32 7a17 17 0 0 0-9 31v7h18v-7a17 17 0 0 0-9-31z" fill="#fde047"/><rect x="25" y="48" width="14" height="5.5" rx="2.7" fill="#94a3b8"/>' },
];
const EF_EMO = [
  ['☀️', 'Sonne', 'solar'], ['🌤️', 'Wolkig', 'sonne wolke wetter'], ['🔌', 'Stecker', 'steckdose strom'], ['🫧', 'Seifenblasen', 'waschmaschine wäsche'], ['🌀', 'Wirbel', 'trockner'],
  ['🧊', 'Eiswürfel', 'kühlschrank kühlen'], ['🚰', 'Wasserhahn', 'wasser'], ['🚗', 'Auto', 'fahrzeug'], ['🔋', 'Batterie', 'akku speicher'], ['🏠', 'Haus', 'gebäude'],
  ['⚡', 'Blitz', 'strom energie'], ['💡', 'Glühbirne', 'lampe licht'], ['🔥', 'Feuer', 'heizung gas flamme'], ['❄️', 'Schneeflocke', 'kälte klima kühlen'], ['🌡️', 'Thermometer', 'temperatur'],
  ['💧', 'Tropfen', 'wasser'], ['🍳', 'Pfanne', 'herd kochen'], ['🍽️', 'Teller', 'spülmaschine geschirr'], ['🧺', 'Wäschekorb', 'wäsche'], ['📺', 'Fernseher', 'tv'],
  ['💻', 'Laptop', 'computer büro'], ['🖥️', 'Monitor', 'computer pc'], ['🎮', 'Spielkonsole', 'gaming'], ['🛁', 'Badewanne', 'bad'], ['🚿', 'Dusche', 'bad warmwasser'],
  ['🪟', 'Fenster', ''], ['🚪', 'Tür', ''], ['🛏️', 'Bett', 'schlafzimmer'], ['🛋️', 'Sofa', 'wohnzimmer'], ['🌱', 'Pflanze', 'garten bewässerung'],
  ['🏊', 'Schwimmbad', 'pool pumpe'], ['🚲', 'Fahrrad', 'ebike'], ['🌬️', 'Wind', 'lüftung ventilator'], ['🔆', 'Helligkeit', 'licht'], ['🏭', 'Fabrik', 'industrie werkstatt'],
];
const EF_POS = {
  top_1: [2, 1, "supply", "#facc15", "Oben 1"], top_2: [3, 1, "supply", "#fbbf24", "Oben 2"],
  left_1: [1, 2, "consume", "#f97316", "Links 1"], left_2: [1, 3, "consume", "#38bdf8", "Links 2"], left_3: [1, 4, "consume", "#a78bfa", "Links 3"],
  right_1: [4, 2, "consume", "#38bdf8", "Rechts 1"], right_2: [4, 3, "consume", "#2dd4bf", "Rechts 2"], right_3: [4, 4, "consume", "#f472b6", "Rechts 3"],
  bottom: [2, 5, "consume", "#4ade80", "Unten"],
};
const EF_SIDES = [["top", "Oben"], ["bottom", "Unten"], ["left", "Links"], ["right", "Rechts"]];
const EF_COLORS = ["#facc15", "#f97316", "#38bdf8", "#a78bfa", "#2dd4bf", "#f472b6", "#4ade80"];
const EF_FLOWS = [["consume", "Verbraucht", "Energie fließt vom Haus zur Kachel"], ["supply", "Liefert", "Energie fließt von der Kachel ins Haus, zum Beispiel Solar"], ["both", "Beides, ein Sensor", "Netz oder Akku mit Vorzeichen: positiv = zur Kachel"], ["split", "Beides, zwei Sensoren", "Zum Beispiel Bezug und Einspeisung getrennt"]];
/* Logos der Modul-Banner: Linien-Symbole, class="f" füllt halbtransparent */
const MOD_ART = {
  fh: `<rect x="8" y="8" width="34" height="32" rx="4"/><path d="M25 8v32M8 24h34"/><path d="M8 48h30M12 44v10M19 44v10M26 44v10M33 44v10"/><path d="M52 58c-5 0-8-3-8-7 0-5 5-7 5-12 4 3 11 7 11 12 0 4-4 7-8 7z" class="f"/>`,
  ww: `<rect x="18" y="6" width="28" height="46" rx="12" class="f"/><path d="M23 28c3-3 6 3 9 0s6 3 9 0M23 37c3-3 6 3 9 0s6 3 9 0"/><path d="M32 52v6M24 58h16"/><path d="M46 18h6v10"/>`,
  en: `<path d="M6 32 32 9l26 23"/><path d="M12 28v26h40V28"/><path d="M35 22 25 38h8l-3 12 11-16h-8z" class="f"/>`,
  gs: `<rect x="10" y="6" width="44" height="52" rx="7"/><path d="M10 18h44"/><circle cx="32" cy="38" r="13" class="f"/><circle cx="32" cy="38" r="6"/><circle cx="19" cy="12" r="1.6"/><circle cx="26" cy="12" r="1.6"/>`,
  ev: `<path d="M5 40l6-14c1-3 4-5 7-5h22c3 0 5 1 7 3l9 12c1 1 2 3 2 5v4H5z" class="f"/><circle cx="19" cy="46" r="6"/><circle cx="46" cy="46" r="6"/><path d="M31 8l-5 9h7l-4 9"/>`,
  wx: `<circle cx="22" cy="20" r="8" class="f"/><path d="M22 4v4M8 20H4M10 8l3 3M34 8l-3 3"/><path d="M18 54a11 11 0 0 1 1-21 15 15 0 0 1 29 5 8 8 0 0 1 0 16z" class="f"/>`,
  ga: `<path d="M20 58h24l-3-16H23z" class="f"/><path d="M32 42V22"/><path d="M32 32c-11 0-15-7-15-16 9 0 15 5 15 16z"/><path d="M32 27c9 0 13-5 13-12-8 0-13 5-13 12z"/><path d="M52 12c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8z"/>`,
  sf: `<path d="M32 5 9 14v17c0 14 9 22 23 28 14-6 23-14 23-28V14z" class="f"/><path d="M21 32l8 8 15-17"/>`,
  pl: `<circle cx="46" cy="16" r="7" class="f"/><path d="M6 36c6-6 10 6 16 0s10 6 16 0 10 6 16 0"/><path d="M6 48c6-6 10 6 16 0s10 6 16 0 10 6 16 0"/><path d="M10 30c0-9 3-14 8-14s8 5 8 14"/>`,
  bt: `<rect x="6" y="18" width="46" height="28" rx="6" class="f"/><path d="M56 28v8"/><path d="M31 23l-8 11h7l-3 9 10-12h-7z"/>`,
  dt: `<path d="M8 8v48h50"/><path d="M14 44l12-14 10 8 12-20 8 6"/><circle cx="26" cy="30" r="2.4"/><circle cx="36" cy="38" r="2.4"/><circle cx="48" cy="18" r="2.4"/>`,
  wa: `<path d="M40 8a12 12 0 0 0-10 17L8 47l9 9 22-22a12 12 0 0 0 17-11l-8 8-7-2-2-7 8-8z" class="f"/>`,
  sp: `<circle cx="22" cy="20" r="8" class="f"/><path d="M22 4v4M22 32v4M6 20h4M34 20h4M11 9l3 3M33 9l-3 3M11 31l3-3"/><path d="M34 56V42M44 56V34M54 56V24M30 58h28"/>`,
  lu: `<circle cx="32" cy="32" r="5" class="f"/><path d="M32 27c-3-9-1-18 8-19 4 5 1 15-8 19zM37 32c9-3 18-1 19 8-5 4-15 1-19-8zM32 37c3 9 1 18-8 19-4-5-1-15 8-19zM27 32c-9 3-18 1-19-8 5-4 15-1 19 8z"/>`,
  rb: `<rect x="8" y="6" width="48" height="8" rx="3" class="f"/><path d="M12 14v34M52 14v34M12 22h40M12 30h40M12 38h40"/><path d="M32 38v14"/><rect x="28" y="52" width="8" height="6" rx="2"/>`,
  wp: `<rect x="6" y="14" width="52" height="38" rx="7" class="f"/><circle cx="26" cy="33" r="10"/><path d="M26 25v16M18 33h16"/><path d="M46 24v18M52 28v10"/>`,
  mu: `<path d="M14 18h36l-3 38H17z" class="f"/><path d="M10 18h44M24 18v-6h16v6"/><path d="M25 28v20M32 28v20M39 28v20"/>`,
  li: `<path d="M20 10h24l5 24H15z" class="f"/><path d="M32 34v16M22 56h20M26 50h12"/><path d="M8 18l4 3M56 18l-4 3M32 2v4"/>`,
  ef: `<path d="M18 30 32 18l14 12v16H18z" class="f"/><path d="M26 46V36h12v10"/><path d="M4 32h8M8 28l4 4-4 4M60 32h-8M56 28l-4 4 4 4"/><circle cx="32" cy="8" r="4"/><path d="M32 12v3"/>`,
};
/* Modul 10 (Konzeptseite): Reiter, Bilder und Markierungen. Positionen in Prozent des Bildes. */
const GA_IMG = "/fenster_heizung_static/img/";
const LAB_IMG = { lx: "Zwei Räume mit „Lüften lohnt“, einer mit „Warten“", ae: "Autarkie-Anteil für heute mit Solarertrag und Verbrauch", wl: "Ampel für Wäsche-Wetter mit Luftfeuchte, Wind und Regen", lf: "Prognose und korrigierte Prognose mit Lernfaktor", vh: "Räume mit früherem Start des Heizplans", dz: "Erkannte Duschzeiten über den Tag", ld: "Lauf wandert auf den sonnigeren Tag", lk: "Ziel-Ladestand nach langem Kalendertermin", mm: "Tonnen-Ampel mit den nächsten Abholungen", sb: "Runde Kurzinfos auf der Startseite", st: "Spartipp mit Gerät und bester Sonnenzeit", li: "Lampen nach Räumen mit Szenenknöpfen", ef: "Haus in der Mitte mit Kacheln und Flusslinien", tg: "Angelernte Tags mit Aktion und Protokoll" };
const GA_TABS = [["an", "Ansicht"], ["bk", "Baukasten"], ["hy", "Handy"], ["te", "Technik"], ["fp", "Fahrplan"]];
const GA_PINS = {
  an: { img: "ga-ansicht.jpg", alt: "Gartenplan mit Karte, Zonen, Leitungen und Seitenpanel", pins: [
    [13, 21, "Zisterne mit Füllstand", "Der Füllstand steht im Tank-Symbol. Die Pumpe daneben dreht sich, solange sie läuft."],
    [23, 47, "Animierte Leitungen", "Wasser fließt blau gestrichelt in Flussrichtung, solange ein Ventil läuft. Sonst bleibt die Leitung grau und ruhig. Mit einem Durchfluss-Sensor passt sich die Geschwindigkeit an."],
    [52, 44, "Zone „braucht Wasser“", "Zonen färben sich nach der Bodenfeuchte: trocken orange, feucht blau. Fällt eine Zone unter ihr Ziel, steht dort „braucht Wasser“. Zonen mit Schloss sind gesperrt, zum Beispiel wegen Regenprognose."],
    [34, 70, "Regner mit Reichweite", "Die Reichweite ist ein Kreis. Läuft der Regner, drehen sich die Tropfen und Wellen pulsieren. Am Bodenfeuchte-Sensor zeigt ein Schild den Prozentwert."],
    [29, 7, "Karte und Ebenen", "OpenStreetMap, optional Satellit. Feuchte und Regenradar lassen sich zuschalten. Die Quellenangabe „© OpenStreetMap-Mitwirkende“ bleibt immer sichtbar."],
    [86, 30, "Seitenpanel", "Für die gewählte Zone: Feuchte gegen Ziel, Laufzeit, Wasserverbrauch, nächster Lauf sowie Stopp und +10 min."]] },
  bk: { img: "ga-baukasten.jpg", alt: "Baukasten zum Platzieren von Regnern, Ventilen, Rohren und Sensoren", pins: [
    [86, 20, "Palette", "Bewässerung: Regner, Sektor-Regner, Tropfer, Ventil, Pumpe, Zisterne. Messen und Leitung: Bodenfeuchte, Durchfluss, Hahn, Rohr, Beet oder Zone, Text. Element ziehen oder antippen, ein Punktraster hilft beim Andocken."],
    [57, 30, "Rohre ziehen", "„Rohr“ wählen und von Punkt zu Punkt ziehen, mit Knickpunkten. Die Leitungen leuchten später, wenn ein Ventil läuft."],
    [37, 45, "Griffe am Element", "Das gewählte Element hat Griffe zum Verschieben, Drehen und für die Reichweite."],
    [86, 78, "Eigenschaften", "Home-Assistant-Entität (Schalter oder Sensor), Zone oder Ventil und Reichweite. Außerdem Duplizieren und Löschen."],
    [94, 96, "Speichern", "Das Layout liegt im Speicher der Integration, auf allen Geräten gleich und mit in der Sicherung."]] },
};
const GA_TECH = [
  ["pin", "Karte", "Leaflet (ca. 40 KB), in die Integration gebündelt. Kacheln von OpenStreetMap, die Quellenangabe bleibt immer sichtbar."],
  ["info", "Kachelserver", "Der OSM-Standardserver ist nicht für Dauerbetrieb gedacht. Geplant: Kachelanbieter mit freiem Kontingent einstellbar oder Kacheln fürs Grundstück zwischenspeichern."],
  ["shield", "Datenschutz", "Beim Laden der Kacheln sieht der Anbieter deine IP-Adresse und den ungefähren Kartenausschnitt. Dazu kommt ein Hinweis in der Einrichtung."],
  ["drop", "Animation", "Eine SVG-Ebene über der Karte mit CSS-Animationen, ohne Dauer-Rendern. Flüssig auch auf dem iPad."],
  ["home", "Standort", "Die Karte zentriert auf den Home-Assistant-Standort oder eine gesuchte Adresse, einmal gespeichert."],
  ["tools", "Datenmodell", "Elemente mit Typ, Position (Breite und Länge), Entität, Zone und Parametern. Rohre sind Punktfolgen zwischen Elementen."]];
const GA_STEPS = [
  ["1", "Karte und Baukasten", "Karte, Elemente platzieren, Rohre ziehen, animierte Leitungen und Bodenfeuchte."],
  ["2", "Zonen und Automatik", "Zonen zeichnen, Zeitpläne und Automatik nach Feuchte, Regen und PV-Überschuss."],
  ["3", "Radar und Verbrauch", "Regenradar, Heatmap der Feuchte und Wasserverbrauch."]];
const GA_IDEAS = ["Regenradar als Ebene", "Wasserverbrauch pro Zone und Tag am Symbol", "Weitere Ebenen: Gartenbeleuchtung, Mähroboter, Pool (Modul 12)", "Frost- und Regenschutz mit Sperrsymbol", "Editor als Sponsor-Lab, Basiskarte frei"];
const GA_OPEN = ["Kachelanbieter: OSM-Standard mit Zwischenspeicher oder Anbieter mit Kontingent", "Editor als Sponsor-Lab oder frei für alle", "Umfang von Stufe 1"];
const WA_TABS = [["a", "Liste"], ["b", "Jahresband"], ["c", "Anlagen"], ["d", "Heft"], ["e", "Modul 11"], ["fp", "Fahrplan"]];
const WA_PINS = {
  a: { img: "wa-a.jpg", t: "Fälligkeitsliste", alt: "Überfällige und bald fällige Termine links, spätere rechts, mit Ampelfarben", pins: [
    [50, 12, "Zähler oben", "Überfällig, in 30 Tagen fällig, später und was dieses Jahr erledigt wurde. Die Zahlen sind der schnelle Blick, ohne zu scrollen."],
    [44, 41, "Termin mit Ampel", "Rot ist überfällig, Orange in den nächsten 30 Tagen, Grün später. Unter dem Namen stehen Abstand und letztes Datum."],
    [54, 41, "Erledigt-Knopf", "Ein Tipp setzt das Datum auf heute. Der nächste Termin rechnet sich aus dem Abstand, zum Beispiel alle 3 Monate."],
    [25, 80, "Aufdruck „Aus Modul 11“", "Termine, die aus einem anderen Modul kommen, tragen den Aufdruck. Sie lassen sich dort und hier abhaken."],
    [79, 33, "Später", "Alles, was nicht drängt, steht in einer eigenen Spalte. Auch Zähler wie die Wärmepumpe nach Betriebsstunden."],
    [79, 84, "Hinweis", "Der Erledigt-Knopf ist der einzige Handgriff im Alltag."]] },
  b: { img: "wa-b.jpg", t: "Jahresband", alt: "Alle Termine der nächsten 12 Monate als Zeitstrahl mit einem Punkt pro Termin", pins: [
    [50, 36, "Zeitstrahl", "Die nächsten 12 Monate auf einen Blick. Die senkrechte Linie ist heute. So siehst du, wann viel auf einmal ansteht."],
    [8, 34, "Punkt pro Termin", "Farbe nach Dringlichkeit. Ein Tipp öffnet den Termin mit Erledigt und Notiz."],
    [50, 50, "Legende", "Rot für überfällig oder Sicherheit, Orange in 30 Tagen, Grün später, Türkis für Termine nach Betriebsstunden."],
    [86, 9, "Kosten", "Zeigt, was die Wartung dieses Jahr gekostet hat. Die Zahl kommt aus dem Wartungsheft."],
    [79, 60, "Erinnerung", "Aufs Handy und als Ansage: 7 Tage vorher, am Tag selbst und wöchentlich, solange etwas überfällig ist."]] },
  c: { img: "wa-c.jpg", t: "Nach Anlage", alt: "Pro Anlage eine Karte mit Terminen, Zählern und Verlauf", pins: [
    [18, 7, "Anlagenkarte", "Heizung, Lüftung und mehr. Jede Karte bündelt Termine, letzte Wartung und Betrieb an einem Ort."],
    [82, 21, "Betriebsstunden", "Ein Balken zeigt, wie weit die Wärmepumpe bis zum Service ist. Bei 90 % wird er orange."],
    [50, 48, "Melder", "Die Karte kommt aus Modul 11 und zeigt Prüfung, Batterie und Jahresprotokoll."],
    [85, 8, "Herkunft", "Der Aufdruck sagt, aus welchem Modul die Daten kommen."],
    [82, 48, "Eigene Anlage", "Name, Abstand und nächstes Datum, mehr braucht es nicht. Zum Beispiel Rasenmäher oder Regenrinne."],
    [50, 90, "Aufbau", "Jede Karte hat eigene Termine, Zähler und Verlauf. Nur Karten mit Aufdruck holen Daten aus anderen Modulen."]] },
  d: { img: "wa-d.jpg", t: "Wartungsheft", alt: "Jede erledigte Wartung wird ein Eintrag mit Datum, Kosten und Notiz", pins: [
    [25, 38, "Verlauf", "Die Einträge stehen in Reihenfolge. Selbst Erledigtes und Fachbetriebe sind getrennt vermerkt."],
    [11, 49, "Eintrag aus Modul 11", "Die Rauchmelder-Prüfung landet auch hier, ohne Kosten, mit Hinweis auf die Herkunft."],
    [79, 7, "Kosten", "Summe des Jahres und Anteile nach Bereichen. Hilft bei der Nebenkostenabrechnung."],
    [67, 58, "PDF oder Drucken", "Eine Seite zum Abheften, für Vermieter, Versicherung oder Verkauf. Auch als Datei zum Speichern."],
    [79, 72, "Als Nächstes", "Der nächste Termin steht immer daneben, damit du nicht erst wechseln musst."]] },
  e: { img: "wa-e.jpg", t: "Mit Modul 11", alt: "Wartungsdaten anderer Module auf Wunsch übernehmen", pins: [
    [53, 26, "Quelle einschalten", "Standardmäßig ist alles aus. Du schaltest pro Modul ein, ob Modul 15 seine Wartungsdaten mitzeigt. Gepflegt werden sie weiter dort, nichts wird doppelt eingetragen."],
    [53, 53, "Aus gelassen", "Lüftung und Garten bleiben aus, bis du sie brauchst. Garten kommt erst, wenn Modul 10 fertig ist."],
    [79, 8, "Was aus Modul 11 kommt", "Offene Prüfungen, Batterie- und Tauschtermine und das Jahresprotokoll. „Geprüft“ gilt in beiden Modulen."],
    [79, 46, "Einstellungen bleiben", "Melder, Räume und Grundriss bearbeitest du weiter nur in Modul 11."],
    [50, 88, "Wieder abschalten", "Beim Ausschalten verschwinden nur die Einträge „Aus Modul 11“. Eigene Termine und das Heft bleiben."]] },
};
const WA_STEPS = [
  ["1", "Liste und Erledigt", "Eigene Termine anlegen, mit Abstand, Erledigt-Knopf und Ampel."],
  ["2", "Erinnerung und Zähler", "Erinnerung aufs Handy, Betriebsstunden aus Sensoren, Wartung bei einer Stundenzahl."],
  ["3", "Modul 11 und Heft", "Wartungsdaten aus Modul 11 auf Wunsch übernehmen, Wartungsheft mit Kosten und PDF."]];
const WA_IDEAS = ["Jahresband und Anlagenkarten als zusätzliche Ansichten", "Weitere Quellen: Wärmepumpe (Modul 7), Lüftung (Modul 5), Garten (Modul 10)", "Beleg als Foto zum Eintrag", "Termine in den Kalender von Home Assistant schreiben", "Erinnerung auch als Ansage"];
const WA_OPEN = ["Welche Ansicht kommt als Startseite: Liste, Jahresband oder Anlagen", "Wartungsheft als Sponsor-Lab oder frei für alle", "Welche Quellen aus anderen Modulen in Stufe 1"];
const LU_TABS = [["j", "Jetzt"], ["a", "Räume"], ["b", "Verlauf"], ["c", "Anlage"], ["d", "Grundriss"], ["e", "Verknüpfung"], ["fp", "Fahrplan"]];
const LU_PINS = {
  a: { img: "lu-a.jpg", t: "Räume mit Ampel", alt: "Jeder Raum mit CO₂, Luftfeuchte, Temperatur, Taupunkt und Lüftungsempfehlung", pins: [
    [50, 10, "Zähler oben", "Wie viele Räume einen Sensor haben, wo jetzt oder bald gelüftet werden sollte und wie das Schimmelrisiko aussieht."],
    [50, 22, "Ampel am Rand", "Grün ist gut, Orange bald lüften, Rot jetzt lüften. Der Streifen links und der Knopf oben rechts zeigen es auf einen Blick."],
    [50, 47, "Empfehlung", "Ein Satz pro Raum, zum Beispiel „Fenster 10 Minuten kippen“. Er kommt aus CO₂, Luftfeuchte und Taupunkt."],
    [50, 80, "Feuchte im Bad", "Bei hoher Feuchte schaltet die Anlage auf Stufe 3, wenn du das möchtest. Sonst bleibt es bei der Empfehlung."],
    [50, 90, "Ohne CO₂-Sensor", "Räume ohne CO₂-Sensor zeigen nur Luftfeuchte und Schimmelrisiko, so wie die Übersicht im ersten Reiter heute."]] },
  b: { img: "lu-b.jpg", t: "Verlauf", alt: "CO₂ und Luftfeuchte über 24 Stunden, mit Lüftungs-Ereignissen", pins: [
    [50, 8, "Zähler oben", "Aktueller und höchster Wert, wie oft heute gelüftet wurde und wie lange die Luft über der Grenze lag."],
    [22, 26, "Raum wählen", "Ein Raum nach dem anderen. Der Verlauf kommt aus dem Verlauf von Home Assistant, es wird nichts extra gespeichert."],
    [22, 46, "Lüftung im Verlauf", "Die grünen Streifen zeigen, wann gelüftet wurde, per Fenster oder Anlage. So siehst du, wie schnell die Luft wieder gut wird."],
    [87, 46, "Grenze", "Die rote Linie ist deine Grenze, standardmäßig 1.200 ppm. Sie lässt sich ändern."],
    [79, 73, "Auswertung", "Wie lange die Luft gut war und wie oft gelüftet wurde, pro Woche und Monat. Daraus kann ein Wohnklima-Zeugnis werden."]] },
  c: { img: "lu-c.jpg", t: "Lüftungsanlage", alt: "Stufen, Temperaturen, Filter und Automatik der KWL", pins: [
    [25, 40, "Stufe wählen", "Abwesend, Stufe 1 bis 3 oder Boost für 30 Minuten. Mit Automatik regelt die Anlage nach deinen Regeln."],
    [30, 55, "Temperaturen", "Zuluft, Abluft, Fortluft und Außenluft. Daraus rechnet sich die Wärmerückgewinnung."],
    [30, 75, "Filterwechsel", "Der Termin steht auch in Modul 15, wenn du das möchtest. Erledigt wird er dort oder hier."],
    [79, 28, "Automatik", "Regeln wie „CO₂ über 1.000 ppm, dann Stufe 3“ oder „Fenster offen, dann Anlage aus“. Jede Regel ist einzeln an oder aus."],
    [50, 88, "Geräte", "Gesteuert wird über eine Entität in Home Assistant. Welche Geräte gehen, hängt davon ab, was bei dir als Entität erscheint."]] },
  d: { img: "lu-d.jpg", t: "Grundriss", alt: "Räume nach Luftqualität eingefärbt", pins: [
    [19, 15, "Messwert wählen", "CO₂, Feuchte, Temperatur oder Taupunkt. Die Räume färben sich danach."],
    [21, 54, "Raum antippen", "Öffnet Verlauf, Empfehlung und die Schalter für Fenster und Anlage."],
    [78, 54, "Flur mit Anlage", "Die Lüftungsanlage steht als eigener Eintrag im Grundriss, mit Stufe und Zulufttemperatur."],
    [30, 85, "Grundriss teilen", "Der Grundriss kommt aus dem Baukasten von Modul 11, wenn du ihn dort gezeichnet hast. Sonst zeichnest du ihn einmal für beide."],
    [79, 85, "Bedienung", "Auf dem Handy steht der Grundriss oben, die Details darunter."]] },
  e: { img: "lu-e.jpg", t: "Verknüpfungen", alt: "Mit anderen Modulen und Labs verbinden", pins: [
    [53, 28, "Wartung (Modul 15)", "Filterwechsel und Betriebsstunden der Anlage erscheinen in Modul 15 als Termine. Gepflegt wird nichts doppelt."],
    [53, 42, "Fenster & Heizung (Modul 1)", "Ist ein Fenster offen, schaltet die Anlage aus, damit sie nicht gegen die offene Luft arbeitet."],
    [53, 56, "Wetter (Modul 9)", "Bei Frost oder Sturm wird nicht Kippen empfohlen, bei Regen bleibt das Fenster zu. Standardmäßig aus."],
    [79, 5, "Hinweis aufs Handy", "Nur wenn jemand zu Hause ist und nicht nachts. Eine Meldung pro Raum und Stunde."],
    [79, 30, "Schutz", "Die Anlage schaltet nur Stufen. Frostschutz und Fenster-Vorrang des Herstellers bleiben bestehen."]] },
};
const LU_STEPS = [
  ["1", "Räume mit Ampel", "CO₂-Sensoren auswerten, Empfehlung pro Raum, Hinweis aufs Handy."],
  ["2", "Anlage steuern", "Stufen, Temperaturen und Automatik der Lüftungsanlage."],
  ["3", "Verlauf und Grundriss", "Verlauf mit Lüftungs-Ereignissen, Grundriss und Verknüpfung mit Modul 1, 9 und 15."]];
const LU_IDEAS = ["Wohnklima-Zeugnis pro Monat", "Wetter berücksichtigen (Frost, Sturm, Pollen)", "Strompreis für Boost nutzen (Modul 14)", "Fenstersensoren als Lüftungs-Ereignis", "Hinweis auch als Ansage"];
const LU_OPEN = ["Welche Anlagen gehen: nur über eine Home-Assistant-Entität oder auch direkt", "Welche Ansicht wird Startseite: Räume, Verlauf oder Grundriss", "Automatik als Sponsor-Lab oder frei für alle"];
/* Versionen und Builds der Module. Version: 0.1 bis 0.4 In Entwicklung, 0.5 bis 0.8 Beta, 0.9 Vorabversion, ab 1.0 Stabil. Build: zählt Änderungen innerhalb einer Version und beginnt bei jeder neuen Version wieder bei 1. Beim Aufstieg springt die Version auf den Start der nächsten Stufe. p = Paketversion der letzten Änderung. log = [Version, Build, Paket, Text], neueste zuerst. */
const MV_STG = [
  ["dev", "0.1 – 0.4", "Beispielseite oder Konzept, noch ohne echte Funktion.", "Es kann sich jederzeit alles ändern.", "Weiter zur Beta, sobald die Grundfunktion mit echten Daten läuft."],
  ["beta", "0.5 – 0.8", "Funktioniert mit echten Daten, zum Testen.", "Fehler sind möglich, Einstellungen können sich ändern.", "Weiter zur Vorabversion, wenn alle geplanten Funktionen da sind und Sichern und Wiederherstellen geprüft ist."],
  ["vorab", "0.9", "Fertig bis auf Feinschliff.", "Einstellungen bleiben erhalten, nur Aussehen und Kleinigkeiten ändern sich noch.", "Weiter zu Stabil nach mindestens zwei Updates ohne gemeldeten Datenverlust oder schweren Fehler."],
  ["stabil", "ab 1.0", "Geprüft und für den Alltag gedacht.", "Einstellungen bleiben bei Updates erhalten, neue Funktionen kommen nur dazu.", "Neue Funktionen heben die Version an (1.1, 1.2). Ein großer Umbau macht daraus 2.0."]];
const MV = {
  fh: { v: "1.0", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["1.0", 1, "3.0.6.5", "Start der Zählung"]] },
  ww: { v: "1.0", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["1.0", 1, "3.0.6.5", "Start der Zählung"]] },
  en: { v: "1.0", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["1.0", 1, "3.0.6.5", "Start der Zählung"]] },
  gs: { v: "1.0", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["1.0", 1, "3.0.6.5", "Start der Zählung"]] },
  lu: { v: "0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  rb: { v: "0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  wp: { v: "0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  ev: { v: "0.5", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.5", 1, "3.0.6.5", "Start der Zählung"]] },
  wx: { v: "0.5", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.5", 1, "3.0.6.5", "Start der Zählung"]] },
  ga: { v: "0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  sf: { v: "0.5", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.5", 1, "3.0.6.5", "Start der Zählung"]] },
  pl: { v: "0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  bt: { v: "0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  dt: { v: "0.5", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.5", 1, "3.0.6.5", "Start der Zählung"]] },
  wa: { v: "0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  sp: { v: "0.9", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.9", 1, "3.0.6.5", "Start der Zählung"]] },
  ef: { v: "0.5", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.5", 1, "3.0.6.5", "Start der Zählung"]] },
  mu: { v: "0.0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.0.1", 1, "3.0.6.5", "Start der Zählung"]] },
  li: { v: "0.0.1", b: 1, d: "2026-10-29", p: "3.0.6.5", log: [["0.0.1", 1, "3.0.6.5", "Start der Zählung"]] } };
