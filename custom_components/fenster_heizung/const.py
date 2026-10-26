"""Konstanten für Fenster & Heizung."""

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
BLOCK_IDS = ("hero", "presence", "tiles", "chart", "rooms")
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
PLAN_MODES = ("keep", "heat", "auto")

# 2.6.0: Raumluft, Wetter-Anpassung, Aufheizzeit, Updates
CONF_HUMIDITY = "humidity_sensor"
CONF_AIR_HINT = "air_hint"
CONF_WEATHER_ADJ = "weather_adj"
EXTRA_KEYS = (CONF_HUMIDITY, CONF_AIR_HINT, CONF_WEATHER_ADJ)  # gehören nicht zum HA-Optionsdialog
GITHUB_REPO = "Maddog3010/ha-fenster-heizung"
UPDATE_CACHE_SECONDS = 6 * 3600
LEARN_MIN_DELTA = 1.0  # Aufheizphase ab so viel Kelvin unter dem Ziel
LEARN_MAX_SAMPLES = 80
LEARN_KEEP_DAYS = 45
BACKUP_FORMAT = 1
