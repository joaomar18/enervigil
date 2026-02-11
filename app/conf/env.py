import os
from dotenv import load_dotenv

load_dotenv()
# Paths
DB_PATH = os.getenv("DB_PATH", "/data/sqlite")
APP_DATA_PATH = os.getenv("APP_DATA_PATH", "/data")

# Hostnames
HTTP_HOSTNAME = os.getenv("HTTP_HOSTNAME", "0.0.0.0")
TIMEDB_HOSTNAME = os.getenv("TIMEDB_HOSTNAME")

# Ports
HTTP_PORT = os.getenv("HTTP_PORT", "0.0.0.0")
HTTP_PORT = int(HTTP_PORT) if HTTP_PORT is not None else None
TIMEDB_PORT = os.getenv("TIMEDB_PORT")
TIMEDB_PORT = int(TIMEDB_PORT) if TIMEDB_PORT is not None else None

# Credentials
TIMEDB_USERNAME = os.getenv("TIMEDB_USERNAME")
TIMEDB_PASSWORD = os.getenv("TIMEDB_PASSWORD")
