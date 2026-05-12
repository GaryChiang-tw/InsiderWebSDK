#!/usr/bin/env bash
# 停止由 ./start.sh 啟動的本機靜態伺服器。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT/.devserver.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "找不到 ${PID_FILE}，可能尚未啟動或已停止。"
  exit 0
fi

PID="$(cat "$PID_FILE")"

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "已停止本機伺服器（PID ${PID}）。"
else
  echo "程序 ${PID} 已不存在，清除過期的 PID 檔。"
fi

rm -f "$PID_FILE" "$ROOT/.devserver.port"
