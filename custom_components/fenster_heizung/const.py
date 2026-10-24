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

DEFAULT_OUTDOOR_MAX = 15.0
DEFAULT_NOTIFY_AFTER = 0

OPTIONAL_KEYS = (
    CONF_BLOCK_FROM,
    CONF_BLOCK_TO,
    CONF_OUTDOOR_SENSOR,
    CONF_NOTIFY_SERVICE,
)
