#!/usr/bin/env bash
# 在專案根目錄啟動本機靜態伺服器（Python http.server）。
# 用法：
#   ./start.sh
#   PORT=9000 ./start.sh    # 從 9000 起找第一個可用埠
#
# 若預設 8080 已被占用，會自動改用 8081、8082…（最多往後找 40 個埠）。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
PID_FILE="$ROOT/.devserver.pid"
PORT_FILE="$ROOT/.devserver.port"
LOG_FILE="$ROOT/.devserver.log"

port_in_use() {
  local p="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$p" -sTCP:LISTEN -t >/dev/null 2>&1
    return $?
  fi
  # 無 lsof 時：能連上 TCP 則視為占用
  (echo >/dev/tcp/127.0.0.1/"$p") >/dev/null 2>&1
}

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE")"
  if kill -0 "$OLD_PID" 2>/dev/null; then
    OLD_PORT="$(cat "$PORT_FILE" 2>/dev/null || echo "${PORT:-8080}")"
    echo "伺服器已在執行（PID ${OLD_PID}）。"
    echo "網址：http://127.0.0.1:${OLD_PORT}/"
    echo "若要停止：./stop.sh"
    exit 0
  fi
  rm -f "$PID_FILE" "$PORT_FILE"
fi

START_PORT="${PORT:-8080}"
MAX_TRY=40
SELECTED=""
for ((i = 0; i < MAX_TRY; i++)); do
  CANDIDATE=$((START_PORT + i))
  if ! port_in_use "$CANDIDATE"; then
    SELECTED=$CANDIDATE
    break
  fi
done

if [[ -z "$SELECTED" ]]; then
  echo "錯誤：從 ${START_PORT} 起連續 ${MAX_TRY} 個埠皆無法使用，請關閉其他程式或指定 PORT。" >&2
  exit 1
fi

if [[ "$SELECTED" != "$START_PORT" ]]; then
  echo "（埠 ${START_PORT} 已被占用，改用 ${SELECTED}）"
fi

{
  echo "----- $(date "+%Y-%m-%d %H:%M:%S %z") -----"
  echo "python3 -m http.server ${SELECTED}"
} >>"$LOG_FILE"

python3 -m http.server "$SELECTED" >>"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"
echo "$SELECTED" >"$PORT_FILE"

sleep 0.35
if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "錯誤：伺服器未能啟動，請查看 ${LOG_FILE} 最後幾行：" >&2
  tail -n 15 "$LOG_FILE" >&2 || true
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 1
fi

echo "已啟動（PID $(cat "$PID_FILE")），埠號 ${SELECTED}。"
echo "網址：http://127.0.0.1:${SELECTED}/"
echo "停止：./stop.sh"
