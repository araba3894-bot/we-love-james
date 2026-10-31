#!/bin/bash
# Double-click: sign in to GitHub (browser) once, then push the mobile Pages deploy.
set -e
cd "$(dirname "$0")"
ROOT="$PWD"
TOOLS="$ROOT/.tools"
ZIP="$TOOLS/gh.zip"

mkdir -p "$TOOLS"

GH=""
for candidate in "$TOOLS"/gh*/bin/gh "$TOOLS/gh/bin/gh"; do
  if [ -x "$candidate" ]; then GH="$candidate"; break; fi
done

if [ -z "$GH" ]; then
  echo "One-time setup: downloading GitHub CLI…"
  curl -fsSL -o "$ZIP" "https://github.com/cli/cli/releases/download/v2.103.3/gh_2.103.3_macOS_arm64.zip"
  unzip -qo "$ZIP" -d "$TOOLS"
  rm -f "$ZIP"
  for candidate in "$TOOLS"/gh*/bin/gh; do
    if [ -x "$candidate" ]; then GH="$candidate"; break; fi
  done
fi

if [ -z "$GH" ]; then
  echo "Could not install GitHub CLI."
  exit 1
fi

echo ""
echo "Neo Velvet — push to GitHub Pages"
echo "================================"
echo ""

if ! "$GH" auth status -h github.com >/dev/null 2>&1; then
  echo "A browser window will open. Sign in to GitHub and approve access."
  echo ""
  "$GH" auth login -h github.com -p https -w
fi

"$GH" auth setup-git
git push origin main

echo ""
echo "Triggering GitHub Pages rebuild…"
"$GH" api -X POST repos/araba3894-bot/we-love-james/pages/builds >/dev/null 2>&1 || true

echo ""
echo "Push OK. Wait ~1–2 min for Actions, then on iPhone Safari open:"
echo "  https://araba3894-bot.github.io/we-love-james/index.html"
echo ""
echo "Share → Add to Home Screen."
echo ""
read -r -p "Press Enter to close this window…" _
