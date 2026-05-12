#!/usr/bin/env bash
# 將專案變更提交並推送到 origin（預設目前分支）。
# 用法：
#   ./git-push.sh
#   ./git-push.sh "你的 commit 訊息"
#   ./git-push.sh --bump              # 先遞增 patch 版號，再 commit／push（預設訊息含新版號）
#   ./git-push.sh --bump "你的訊息"
#
# 僅更新版號、不推送：./bump-version.sh [major|minor|patch]
#
# 首次使用請先設定遠端（若尚未設定）：
#   git remote add origin https://github.com/USER/REPO.git

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "錯誤：目前目錄不是 Git 工作區。" >&2
  exit 1
fi

REMOTE="${GIT_REMOTE:-origin}"
if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "錯誤：找不到遠端「${REMOTE}」。請先執行：" >&2
  echo "  git remote add ${REMOTE} https://github.com/USER/REPO.git" >&2
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  echo "錯誤：不在任何分支上（例如處於 detached HEAD）。" >&2
  exit 1
fi

DO_BUMP=false
if [[ "${1:-}" == "--bump" ]]; then
  DO_BUMP=true
  shift
fi

if [[ "$DO_BUMP" == true ]]; then
  "$ROOT/bump-version.sh"
  VER="$(tr -d ' \t\r\n' <"$ROOT/VERSION")"
fi

MSG="${1:-}"
if [[ "$DO_BUMP" == true && -z "$MSG" ]]; then
  MSG="chore: bump version to ${VER}"
fi
if [[ -z "$MSG" ]]; then
  MSG="chore: update Insider Web SDK test site"
fi

git add -A

if git diff --cached --quiet; then
  echo "沒有要提交的變更（工作區與索引皆無新內容）。"
else
  git commit -m "$MSG"
fi

echo "推送到 ${REMOTE} / ${BRANCH} …"
git push -u "$REMOTE" "$BRANCH"
echo "完成。"
