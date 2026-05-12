#!/usr/bin/env bash
# 遞增專案根目錄 VERSION（語意化 MAJOR.MINOR.PATCH）。
# 用法：
#   ./bump-version.sh          # 預設：patch +1
#   ./bump-version.sh minor
#   ./bump-version.sh major

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILE="$ROOT/VERSION"

if [[ ! -f "$FILE" ]]; then
  echo "0.0.0" >"$FILE"
fi

raw="$(tr -d ' \t\r\n' <"$FILE")"
if ! [[ "$raw" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "錯誤：VERSION 必須為 MAJOR.MINOR.PATCH（目前：${raw}）" >&2
  exit 1
fi

IFS=. read -r major minor patch <<<"$raw"
kind="${1:-patch}"
case "$kind" in
  major)
    major=$((major + 1))
    minor=0
    patch=0
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  patch)
    patch=$((patch + 1))
    ;;
  *)
    echo "用法：$0 [major|minor|patch]" >&2
    exit 1
    ;;
esac

new="${major}.${minor}.${patch}"
printf '%s\n' "$new" >"$FILE"
echo "版本已更新為 ${new}（${kind}）。"
