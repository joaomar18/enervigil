#!/usr/bin/env bash
set -e

cd app

if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi

echo "Activating venv..."
source .venv/bin/activate

echo "Installing backend package..."
pip install -e .

echo "Starting backend..."
python main.py