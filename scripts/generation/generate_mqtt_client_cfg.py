import os
import sys
from pathlib import Path
import json
from cryptography.fernet import Fernet

# ==================================================
# Environment variables
# ==================================================

APP_DATA_PATH = os.getenv("APP_DATA_PATH", None)
HOSTNAME = os.getenv("HOSTNAME", "127.0.0.1")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTTS_PORT = int(os.getenv("MQTTS_PORT", 8883))
MQTT_ALLOW_ANONYMOUS = os.getenv("MQTT_ALLOW_ANONYMOUS", "false").lower() == "true"
MQTT_ENABLE_TLS = os.getenv("MQTT_ENABLE_TLS", "true").lower() == "true"
MQTT_ENABLE_PLAIN = os.getenv("MQTT_ENABLE_PLAIN", "false").lower() == "true"
MQTT_RESET_PASSWORD = os.getenv("MQTT_RESET_PASSWORD", "false").lower() == "true"
MQTT_USERNAME = os.getenv("MQTT_USERNAME", None)
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", None)

# ==================================================
# Paths
# ==================================================

APP_DATA_PATH = Path("/var/lib/enervigil-backend")
MQTT_CONFIG_FILE = APP_DATA_PATH / "mqtt.json"
PASSWORD_FILE = Path("/conf/mosquitto/passwordfile")


def generate():
    if not APP_DATA_PATH:
        raise ValueError(f"Backend data path was not provided.")

    # Load existing config (if exists)
    existing_config = {}
    if MQTT_CONFIG_FILE.exists():
        with open(MQTT_CONFIG_FILE, "r") as f:
            existing_config = json.load(f)

    # Decide which port the client should use
    if MQTT_ENABLE_TLS:
        port = MQTTS_PORT
        cert_path = "/cert/ca/enervigil-ca.crt"
    elif MQTT_ENABLE_PLAIN:
        port = MQTT_PORT
        cert_path = None
    else:
        port = None
        cert_path = None

    enabled = port is not None

    old_authentication = (
        PASSWORD_FILE.exists()
        and PASSWORD_FILE.stat().st_size > 0
        and not MQTT_RESET_PASSWORD
    )
    new_authentication = bool(MQTT_USERNAME) and bool(MQTT_PASSWORD)
    authentication = old_authentication or new_authentication

    # Handle existing credentials
    username = existing_config.get("username")
    password = existing_config.get("password")
    pass_key = existing_config.get("pass_key")

    if new_authentication and bool(MQTT_USERNAME) and bool(MQTT_PASSWORD):
        key = Fernet.generate_key()
        fernet = Fernet(key)

        username = MQTT_USERNAME
        password = fernet.encrypt(MQTT_PASSWORD.encode()).decode()
        pass_key = key.decode()

    # Final configuration
    config = {
        "enabled": enabled,
        "cert_path": cert_path,
        "hostname": HOSTNAME,
        "port": port,
        "id": "enervigil-client",
        "authentication": authentication,
        "username": username if authentication else None,
        "password": password if authentication else None,
        "pass_key": pass_key if authentication else None,
    }

    # Write file
    with open(MQTT_CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

    print(f"MQTT client config written to {MQTT_CONFIG_FILE}")
