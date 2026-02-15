import os
from pathlib import Path
from dotenv import load_dotenv


# Load dev environment only if explicitly present in the backend root directory
dev_env = Path(__file__).resolve().parent / ".env"

if dev_env.exists():
    load_dotenv(dev_env)

# Paths
DB_PATH = os.getenv("DB_PATH", "./data/sqlite")
APP_DATA_PATH = os.getenv("APP_DATA_PATH", "./data")

# Hostnames
HTTP_HOSTNAME = os.getenv("HTTP_HOSTNAME", "0.0.0.0")
TIMEDB_HOSTNAME = os.getenv("TIMEDB_HOSTNAME", "127.0.0.1")

# Ports
HTTP_PORT = os.getenv("HTTP_PORT", 8000)
HTTP_PORT = int(HTTP_PORT) if HTTP_PORT is not None else None
TIMEDB_PORT = os.getenv("TIMEDB_PORT", 8086)
TIMEDB_PORT = int(TIMEDB_PORT) if TIMEDB_PORT is not None else None

# Credentials
TIMEDB_USERNAME = os.getenv("TIMEDB_USERNAME")
TIMEDB_PASSWORD = os.getenv("TIMEDB_PASSWORD")
