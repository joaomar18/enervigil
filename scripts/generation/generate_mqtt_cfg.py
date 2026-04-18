import os
from pathlib import Path
from textwrap import dedent

# ==================================================
# Environment variables
# ==================================================

MQTT_ALLOW_ANONYMOUS = os.getenv("MQTT_ALLOW_ANONYMOUS", "false").lower() == "true"
MQTT_ENABLE_TLS = os.getenv("MQTT_ENABLE_TLS", "true").lower() == "true"
MQTT_ENABLE_PLAIN = os.getenv("MQTT_ENABLE_PLAIN", "false").lower() == "true"
MQTT_RESET_PASSWORD = os.getenv("MQTT_RESET_PASSWORD", "false").lower() == "true"
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")


# ==================================================
# Paths
# ==================================================

CONFIG_DIR = Path("/conf/mosquitto")
CONF_D_DIR = CONFIG_DIR / "conf.d"

ENV_CONFIG_FILE = CONF_D_DIR / "99-env.conf"
LISTENER_CONFIG_FILE = CONF_D_DIR / "10-listeners.conf"
PASSWORD_FILE = CONFIG_DIR / "passwordfile"


def generate():

    CONF_D_DIR.mkdir(parents=True, exist_ok=True)

    # Listeners
    with open(LISTENER_CONFIG_FILE, "w") as f:
        f.write("# Auto-generated listeners configuration\n")

        if MQTT_ENABLE_TLS:
            f.write(
                dedent(
                    """\
        # Secure MQTT (TLS)
        listener 8883 0.0.0.0
        protocol mqtt

        cafile /cert/ca/enervigil-ca.crt
        certfile /cert/enervigil.crt
        keyfile /cert/enervigil.key
        """
                )
            )

        if MQTT_ENABLE_PLAIN:
            f.write(
                dedent(
                    """\

        # Insecure MQTT (non-TLS)
        listener 1883 0.0.0.0
        protocol mqtt
        """
                )
            )

    # Authentication
    old_authentication = PASSWORD_FILE.exists() and PASSWORD_FILE.stat().st_size > 0 and not MQTT_RESET_PASSWORD
    new_authentication = bool(MQTT_USERNAME) and bool(MQTT_PASSWORD)
    authentication = old_authentication or new_authentication

    with open(ENV_CONFIG_FILE, "w") as f:
        f.write("# Auto-generated authentication configuration\n")

        if MQTT_ALLOW_ANONYMOUS:
            f.write("allow_anonymous true\n")
        else:
            f.write("allow_anonymous false\n")

        if authentication:
            f.write(f"password_file /mosquitto/config/passwordfile\n")

    # Safety checks
    if not MQTT_ENABLE_TLS and not MQTT_ENABLE_PLAIN:
        raise RuntimeError("No MQTT listeners enabled (TLS or plain).")

    if not MQTT_ALLOW_ANONYMOUS and not authentication:
        raise RuntimeError("Anonymous disabled but no valid credentials provided.")

    # Warnings
    if MQTT_ENABLE_PLAIN and MQTT_ALLOW_ANONYMOUS:
        print("WARNING: Plain MQTT (1883) with anonymous access is enabled (INSECURE)")

    if MQTT_ENABLE_TLS and MQTT_ALLOW_ANONYMOUS:
        print("WARNING: TLS enabled but anonymous access is allowed")

    if not MQTT_ENABLE_TLS:
        print("INFO: TLS listener disabled (port 8883 will refuse connections)")

    if not MQTT_ENABLE_PLAIN:
        print("INFO: Plain MQTT listener disabled (port 1883 will refuse connections)")

    # Startup
    print("Starting Mosquitto with configuration:")
    print(f"  - TLS Enabled:      {MQTT_ENABLE_TLS}")
    print(f"  - Plain Enabled:    {MQTT_ENABLE_PLAIN}")
    print(f"  - Anonymous:        {MQTT_ALLOW_ANONYMOUS}")
