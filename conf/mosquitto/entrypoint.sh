#!/bin/sh
set -eu

# ==================================================
# Environment variables (with defaults)
# ==================================================

# Allow anonymous MQTT clients (true/false)
MQTT_ALLOW_ANONYMOUS="${MQTT_ALLOW_ANONYMOUS:-false}"

# Enable listeners
MQTT_ENABLE_TLS="${MQTT_ENABLE_TLS:-true}"
MQTT_ENABLE_PLAIN="${MQTT_ENABLE_PLAIN:-false}"

# ==================================================
# Paths and configuration files
# ==================================================

CONFIG_DIR="/mosquitto/config"
CONF_D_DIR="$CONFIG_DIR/conf.d"

ENV_CONFIG_FILE="$CONF_D_DIR/99-env.conf"
LISTENER_CONFIG_FILE="$CONF_D_DIR/10-listeners.conf"

PASSWORD_FILE="$CONFIG_DIR/passwordfile"

mkdir -p "$CONF_D_DIR"

# ==================================================
# Generate listeners configuration
# ==================================================

echo "# Auto-generated listeners configuration" > "$LISTENER_CONFIG_FILE"

# --- TLS listener ---
if [ "$MQTT_ENABLE_TLS" = "true" ]; then
  cat >> "$LISTENER_CONFIG_FILE" <<EOF
# Secure MQTT (TLS)
listener 8883 0.0.0.0
protocol mqtt

cafile /cert/ca/enervigil-ca.crt
certfile /cert/enervigil.crt
keyfile /cert/enervigil.key
EOF
fi

# --- Plain listener ---
if [ "$MQTT_ENABLE_PLAIN" = "true" ]; then
  cat >> "$LISTENER_CONFIG_FILE" <<EOF

# Insecure MQTT (non-TLS)
listener 1883 0.0.0.0
protocol mqtt
EOF
fi

# ==================================================
# Generate authentication / security configuration
# ==================================================

echo "# Auto-generated authentication configuration" > "$ENV_CONFIG_FILE"

# --- Anonymous access ---
if [ "$MQTT_ALLOW_ANONYMOUS" = "true" ]; then
  echo "allow_anonymous true" >> "$ENV_CONFIG_FILE"
else
  echo "allow_anonymous false" >> "$ENV_CONFIG_FILE"
fi

# --- Username/password authentication (optional) ---
if [ -n "${MQTT_USERNAME:-}" ] && [ -n "${MQTT_PASSWORD:-}" ]; then

  if [ ! -f "$PASSWORD_FILE" ] || [ ! -s "$PASSWORD_FILE" ]; then
    mosquitto_passwd -b -c "$PASSWORD_FILE" "$MQTT_USERNAME" "$MQTT_PASSWORD"
  else
    mosquitto_passwd -b "$PASSWORD_FILE" "$MQTT_USERNAME" "$MQTT_PASSWORD"
  fi

  chown 1883:1883 "$PASSWORD_FILE" || true
  chmod 600 "$PASSWORD_FILE"

  echo "password_file $PASSWORD_FILE" >> "$ENV_CONFIG_FILE"
fi

# ==================================================
# Safety validation
# ==================================================

# At least one listener must be enabled
if [ "$MQTT_ENABLE_TLS" != "true" ] && [ "$MQTT_ENABLE_PLAIN" != "true" ]; then
  echo "ERROR: No MQTT listeners enabled (TLS or plain)." >&2
  exit 1
fi

# Prevent locked broker (no auth + no anonymous)
if [ "$MQTT_ALLOW_ANONYMOUS" = "false" ] && [ ! -s "$PASSWORD_FILE" ]; then
  echo "ERROR: Anonymous disabled but no valid credentials provided." >&2
  exit 1
fi

# ==================================================
# Warnings (important for open-source UX)
# ==================================================

if [ "$MQTT_ENABLE_PLAIN" = "true" ] && [ "$MQTT_ALLOW_ANONYMOUS" = "true" ]; then
  echo "WARNING: Plain MQTT (1883) with anonymous access is enabled (INSECURE)." >&2
fi

if [ "$MQTT_ENABLE_TLS" = "true" ] && [ "$MQTT_ALLOW_ANONYMOUS" = "true" ]; then
  echo "WARNING: TLS enabled but anonymous access is allowed." >&2
fi

if [ "$MQTT_ENABLE_TLS" != "true" ]; then
  echo "INFO: TLS listener disabled (port 8883 will refuse connections)." >&2
fi

if [ "$MQTT_ENABLE_PLAIN" != "true" ]; then
  echo "INFO: Plain MQTT listener disabled (port 1883 will refuse connections)." >&2
fi

# ==================================================
# Startup info
# ==================================================

echo "Starting Mosquitto with configuration:"
echo "  - TLS Enabled:        $MQTT_ENABLE_TLS"
echo "  - Plain Enabled:      $MQTT_ENABLE_PLAIN"
echo "  - Anonymous Access:   $MQTT_ALLOW_ANONYMOUS"

# ==================================================
# Start Mosquitto
# ==================================================

exec /usr/sbin/mosquitto -c /mosquitto/config/mosquitto.conf