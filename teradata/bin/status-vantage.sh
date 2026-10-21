#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
runtime_dir="${VANTAGE_RUNTIME_DIR:-$project_dir/teradata/runtime/vantage-express}"
pid_file="$runtime_dir/state/vantage.pid"

if [[ ! -s "$pid_file" ]] || ! kill -0 "$(<"$pid_file")" 2>/dev/null; then
  echo "Vantage is stopped"
  exit 1
fi

pid="$(<"$pid_file")"
echo "Vantage is running (PID $pid)"

if nc -z 127.0.0.1 1025 2>/dev/null; then
  echo "Teradata port 1025 is accepting connections"
else
  echo "Teradata port 1025 is not ready"
  exit 2
fi

