#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
runtime_dir="${VANTAGE_RUNTIME_DIR:-$project_dir/teradata/runtime/vantage-express}"
state_dir="$runtime_dir/state"
pid_file="$state_dir/vantage.pid"
monitor_socket="$state_dir/vantage-monitor.sock"

if [[ ! -s "$pid_file" ]] || ! kill -0 "$(<"$pid_file")" 2>/dev/null; then
  echo "Vantage is already stopped"
  exit 0
fi

pid="$(<"$pid_file")"
if [[ -S "$monitor_socket" ]]; then
  printf 'system_powerdown\n' | nc -U "$monitor_socket" >/dev/null 2>&1 || true
else
  kill -TERM "$pid"
fi

for _ in {1..120}; do
  if ! kill -0 "$pid" 2>/dev/null; then
    rm -f "$pid_file" "$monitor_socket"
    echo "Vantage stopped cleanly"
    exit 0
  fi
  sleep 1
done

echo "Vantage did not stop within 120 seconds; no forced shutdown was performed" >&2
exit 1

