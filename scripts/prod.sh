#!/usr/bin/env bash
set -e

echo "Stopping development containers..."
docker compose -f docker-compose.dev.yml down || true

echo "Starting production stack..."

if [ -f docker-compose.hardware.yml ]; then
  echo "Hardware compose file detected."
  docker compose \
    -f docker-compose.yml \
    -f docker-compose.hardware.yml \
    up -d
else
  docker compose -f docker-compose.yml up -d
fi

echo "Production environment is running."