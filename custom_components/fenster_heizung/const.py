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
CONF_GAS_KWH_PER_M3 = "gas_kwh_per_m3"
DEFAULT_HEAT_POWER = 1.0
DEFAULT_GAS_KWH_PER_M3 = 10.0

CONF_ROOM_AREA = "room_area"
CONF_HEAT_LOAD = "heat_load_w_m2"
CONF_DESIGN_TEMP = "design_temp"
DEFAULT_HEAT_LOAD = 60.0
DEFAULT_DESIGN_TEMP = -12.0

PANEL_URL = "fenster-heizung"
STATIC_URL = "/fenster_heizung_static"
