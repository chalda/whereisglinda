#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
PYTHON="$VENV_DIR/bin/python"
REQUIREMENTS=("requests")
SCRIPT="dummy_client.py"
LOGFILE="dummy_client.log"

# check or create the venv
if [ ! -x "$PYTHON" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
  "$PYTHON" -m pip install --upgrade pip
  "$PYTHON" -m pip install "${REQUIREMENTS[@]}"
fi

# run as daemon
echo "Running $SCRIPT in background..."
nohup "$PYTHON" "$SCRIPT_DIR/$SCRIPT" > "$SCRIPT_DIR/$LOGFILE" 2>&1 &

echo "Dummy client started in background. Logs: $SCRIPT_DIR/$LOGFILE"
