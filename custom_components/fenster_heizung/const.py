"""Konstanten für Strom & Wärme."""

DOMAIN = "fenster_heizung"

CONF_WINDOWS = "window_sensors"
CONF_THERMOSTATS = "thermostats"
CONF_OPEN_DELAY = "open_delay"
CONF_CLOSE_DELAY = "close_delay"
CONF_ACTION = "action"
CONF_SETBACK_TEMP = "setback_temp"

ACTION_OFF = "off"
ACTION_SETBACK = "setback"

DEFAULT_OPEN_DELAY = 60
DEFAULT_CLOSE_DELAY = 30
DEFAULT_SETBACK_TEMP = 12.0

CONF_BLOCK_FROM = "block_from"
CONF_BLOCK_TO = "block_to"
CONF_OUTDOOR_SENSOR = "outdoor_sensor"
CONF_OUTDOOR_MAX = "outdoor_max_temp"
CONF_NOTIFY_SERVICE = "notify_service"
CONF_NOTIFY_AFTER = "notify_after"
CONF_NOTIFY_TITLE = "notify_title"
CONF_NOTIFY_MESSAGE = "notify_message"
DEFAULT_NOTIFY_MESSAGE = "Fenster in {raum} ist seit {minuten} Minuten offen."
CONF_HEATING_ENTITY = "heating_entity"
CONF_HEATING_OFF_STATES = "heating_off_states"
DEFAULT_HEATING_OFF_STATES = "off"

DEFAULT_OUTDOOR_MAX = 15.0
DEFAULT_NOTIFY_AFTER = 0

OPTIONAL_KEYS = (
    "energy_per_unit",
    CONF_BLOCK_FROM,
    CONF_BLOCK_TO,
    CONF_OUTDOOR_SENSOR,
    CONF_NOTIFY_SERVICE,
    CONF_HEATING_ENTITY,
    CONF_NOTIFY_TITLE,
)

SIGNAL_UPDATE = "fenster_heizung_update_{}"

HEATING_MODES = ("heat", "auto")

MODE_ACTIVE = "regelung_aktiv"
MODE_PAUSED = "heizung_pausiert"
MODE_WINDOW_ONLY = "nur_fenstermeldung"
MODE_DISABLED = "regelung_aus"
MODES = [MODE_ACTIVE, MODE_PAUSED, MODE_WINDOW_ONLY, MODE_DISABLED]

CONF_HEAT_POWER = "heat_power_kw"
CONF_GAS_KWH_PER_M3 = "gas_kwh_per_m3"  # alt (bis 2.3), nur noch als Rückfall für Erdgas
CONF_FUEL = "fuel"
CONF_ENERGY_PER_UNIT = "energy_per_unit"
CONF_COP = "cop"
DEFAULT_FUEL = "erdgas"
DEFAULT_COP = 3.5
# Brennstoff -> (Einheit, Standard kWh pro Einheit)
FUELS: dict[str, tuple[str, float]] = {
    "erdgas": ("m³", 10.0),
    "heizoel": ("l", 10.0),
    "fluessiggas": ("l", 6.6),
    "pellets": ("kg", 4.8),
    "strom": ("kWh", 1.0),
}
DEFAULT_HEAT_POWER = 1.0
DEFAULT_GAS_KWH_PER_M3 = 10.0

CONF_ROOM_AREA = "room_area"
CONF_HEAT_LOAD = "heat_load_w_m2"
CONF_DESIGN_TEMP = "design_temp"
DEFAULT_HEAT_LOAD = 60.0
DEFAULT_DESIGN_TEMP = -12.0

PANEL_URL = "fenster-heizung"
STATIC_URL = "/fenster_heizung_static"

PLAN_MIN_TEMP = 5.0
PLAN_MAX_TEMP = 30.0
BLOCK_IDS = ("hero", "presence", "tiles", "chart", "pv", "rooms")
GROUP_ICON_IDS = ("layers", "home", "bed", "sofa", "desk")
MAX_GROUPS = 12
ROOM_ICON_IDS = (
    "sofa", "tv", "dining", "pot", "bed", "baby", "desk", "book",
    "drop", "laundry", "door", "stairs", "sun", "tree", "car", "tools",
    "bath", "shower", "toilet", "wardrobe", "hanger", "plant", "lamp", "fireplace",
    "gamepad", "music", "dumbbell", "bike", "fridge", "wine", "paw", "blocks",
    "roof", "crate", "wave", "balcony", "radiator", "window", "suitcase",
)
# Grenzen für Darstellung (Farben, Raumfotos)
MAX_PHOTOS = 12
MAX_PHOTO_CHARS = 150_000
MAX_HERO_PHOTOS = 12
MAX_HERO_CHARS = 300_000
HERO_MODES = ("standard", "time", "season", "weather")
HERO_SLOTS = (
    "time:night", "time:sunrise", "time:day", "time:sunset",
    "season:spring", "season:summer", "season:autumn", "season:winter",
    "weather:sunny", "weather:clear-night", "weather:partlycloudy", "weather:cloudy", "weather:rainy",
    "weather:pouring", "weather:snowy", "weather:fog", "weather:lightning",
)
PLAN_MODES = ("keep", "heat", "auto")

# 2.6.0: Raumluft, Wetter-Anpassung, Aufheizzeit, Updates
CONF_HUMIDITY = "humidity_sensor"
CONF_ROOM_TEMP = "room_temp_sensor"  # optionaler Raumtemperatur-Sensor
RT_USES = ("rt_show", "rt_learn", "rt_dew", "rt_heater")  # Verwenden für (je "on"/"off")
RT_CTRL = ("rt_comp", "rt_off")  # Regelung mit Raumsensor: Offset-Ausgleich, Abschalten bei Ziel (Standard aus)
CONF_AIR_HINT = "air_hint"
CONF_WEATHER_ADJ = "weather_adj"
CONF_AIR_EVERY = "air_every"  # Erinnerung (Std.), wenn lange nicht gelüftet; 0 = aus
DEFAULT_AIR_EVERY = 8
# 2.7.0: Elektroheizer mit PV-Überschuss (pro Raum)
HTR_KEYS = (
    "htr_on", "htr_entity", "htr_steps", "htr_watt", "htr_target", "htr_prio", "htr_from", "htr_to",
    "htr_presets", "htr_devtemp", "htr_auto", "htr_thermo",
)
PV_TICK_SECONDS = 30
HEATER_KEEP_DAYS = 14
EXTRA_KEYS = (CONF_HUMIDITY, CONF_ROOM_TEMP, *RT_USES, *RT_CTRL, CONF_AIR_HINT, CONF_WEATHER_ADJ, CONF_AIR_EVERY) + HTR_KEYS  # gehören nicht zum HA-Optionsdialog
GITHUB_REPO = "Maddog3010/ha-fenster-heizung"
UPDATE_CACHE_SECONDS = 3600
LEARN_MIN_DELTA = 1.0  # Aufheizphase ab so viel Kelvin unter dem Ziel
LEARN_MAX_SAMPLES = 80
LEARN_KEEP_DAYS = 45
BACKUP_FORMAT = 1
