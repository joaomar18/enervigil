#!/usr/bin/env bash
set -e

echo "Stopping production containers (if running)..."
docker compose down || true

echo "Starting development infrastructure..."
docker compose -f docker-compose.dev.yml up -d

echo "Done."
echo ""
echo "Run backend with: scripts/backend.sh"
echo "Run frontend with: scripts/frontend.sh"