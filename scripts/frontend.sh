#!/usr/bin/env bash
set -e

cd ui

echo "Installing frontend dependencies..."
npm install

echo "Starting SvelteKit dev server..."
npm run dev