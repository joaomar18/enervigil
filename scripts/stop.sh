#!/usr/bin/env bash
docker compose down
docker compose -f docker-compose.dev.yml down || true