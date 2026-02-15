#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

if [ "${EUID}" -ne 0 ]; then
  echo "This uninstall script must be run with elevated permissions."
  echo "Please run: sudo bash scripts/uninstall.sh"
  exit 1
fi

ask_keep() {
  local question="$1"
  while true; do
    read -r -p "$question [Y/n]: " answer
    answer="${answer:-Y}"
    case "$answer" in
      Y|y|YES|Yes|yes)
        return 0
        ;;
      N|n|NO|No|no)
        return 1
        ;;
      *)
        echo "Please answer with y or n."
        ;;
    esac
  done
}

declare -a TO_DELETE=()

if ! ask_keep "Keep SQLite configuration data (data/sqlite)?"; then
  TO_DELETE+=("data/sqlite")
fi

if ! ask_keep "Keep backend app data (data/app)?"; then
  TO_DELETE+=("data/app")
fi

if ! ask_keep "Keep InfluxDB measurements (data/influxdb)?"; then
  TO_DELETE+=("data/influxdb")
fi

if ! ask_keep "Keep logs (logs)?"; then
  TO_DELETE+=("logs")
fi

if ! ask_keep "Keep TLS certificates (cert)?"; then
  TO_DELETE+=("cert")
fi

echo ""
echo "Uninstall summary:"
echo "  - Containers/images: WILL BE REMOVED"
if [ ${#TO_DELETE[@]} -eq 0 ]; then
  echo "  - Local data: KEEP ALL"
else
  echo "  - Local data paths to remove:"
  for path in "${TO_DELETE[@]}"; do
    echo "      - $path"
  done
fi

echo ""
read -r -p "Type DELETE to continue uninstall: " confirm
if [ "$confirm" != "DELETE" ]; then
  echo "Canceled. No containers or data were changed."
  exit 0
fi

echo "Stopping Enervigil containers..."
docker compose down --remove-orphans --rmi local || true
docker compose -f docker-compose.dev.yml down --remove-orphans --rmi local || true

if [ ${#TO_DELETE[@]} -eq 0 ]; then
  echo "No local data selected for deletion. Uninstall complete."
  exit 0
fi

for path in "${TO_DELETE[@]}"; do
  if [ -e "$path" ]; then
    rm -rf "$path"
    echo "Removed: $path"
  else
    echo "Skipped (not found): $path"
  fi
done

if [ -d "data" ] && [ -z "$(ls -A data 2>/dev/null)" ]; then
  rmdir data
  echo "Removed empty directory: data"
fi

echo "Uninstall complete."
