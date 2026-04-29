#!/bin/sh
set -e

PASSWORD_FILE="/mosquitto/config/passwordfile"

MQTT_ALLOW_ANONYMOUS="${MQTT_ALLOW_ANONYMOUS:-true}"
MQTT_RESET_PASSWORD="${MQTT_RESET_PASSWORD:-false}"
MQTT_USERNAME="${MQTT_USERNAME:-}"
MQTT_PASSWORD="${MQTT_PASSWORD:-}"

has_env_credentials=false
if [ -n "$MQTT_USERNAME" ] && [ -n "$MQTT_PASSWORD" ]; then
  has_env_credentials=true
fi

has_password_file=false
if [ -f "$PASSWORD_FILE" ] && [ -s "$PASSWORD_FILE" ]; then
  has_password_file=true
fi

echo "[mosquitto] Startup configuration:"
echo "  - Anonymous allowed: $MQTT_ALLOW_ANONYMOUS"
echo "  - Env credentials:   $has_env_credentials"
echo "  - Password file:     $has_password_file"
echo "  - Reset requested:   $MQTT_RESET_PASSWORD"

# --------------------------------------------------
# HANDLE RESET (explicit state change)
# --------------------------------------------------

if [ "$MQTT_RESET_PASSWORD" = "true" ]; then
  echo "[mosquitto] Reset requested..."

  if [ "$has_env_credentials" = "true" ]; then
    echo "[mosquitto] Resetting with new credentials..."
    mosquitto_passwd -b -c "$PASSWORD_FILE" "$MQTT_USERNAME" "$MQTT_PASSWORD"
    has_password_file=true
  else
    echo "[mosquitto] Removing password file (disabling authentication)..."
    rm -f "$PASSWORD_FILE"
    has_password_file=false
  fi
fi

# --------------------------------------------------
# HANDLE PASSWORD FILE CREATION (first run)
# --------------------------------------------------

if [ "$MQTT_RESET_PASSWORD" != "true" ]; then
  if [ "$has_env_credentials" = "true" ] && [ "$has_password_file" = "false" ]; then
    echo "[mosquitto] Creating password file from env..."
    mosquitto_passwd -b -c "$PASSWORD_FILE" "$MQTT_USERNAME" "$MQTT_PASSWORD"
    has_password_file=true
  else
    echo "[mosquitto] Keeping existing password file."
  fi
fi

# --------------------------------------------------
# VALIDATION (prevent locked broker)
# --------------------------------------------------

if [ "$MQTT_ALLOW_ANONYMOUS" = "false" ]; then
  if [ "$has_password_file" = "false" ]; then
    echo "[mosquitto] ERROR: Anonymous disabled and no valid credentials available."
    exit 1
  fi
fi

# --------------------------------------------------
# PERMISSIONS
# --------------------------------------------------

if [ -f "$PASSWORD_FILE" ]; then
  chown 1883:1883 "$PASSWORD_FILE" 2>/dev/null || true
  chmod 600 "$PASSWORD_FILE"
fi

# --------------------------------------------------
# START MOSQUITTO
# --------------------------------------------------

echo "[mosquitto] Starting broker..."
exec mosquitto -c /mosquitto/config/mosquitto.conf