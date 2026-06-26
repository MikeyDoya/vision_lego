#!/usr/bin/env bash
#
# diagnose_hero.sh — read-only diagnostics for the Vision Lego hero/background issue.
# Does NOT modify the repo (no add/commit/restore). It only reads and writes .txt reports.
#
# Usage:
#   cd ~/Git_Repos/vision_lego
#   bash diagnose_hero.sh
#
# Then upload the files inside ./diagnostics/ here.

set -uo pipefail

# Make sure we're at the repo root (where package.json + .git live)
if [ ! -d .git ] || [ ! -f package.json ]; then
  echo "ERROR: run this from the repo root (~/Git_Repos/vision_lego)." >&2
  exit 1
fi

OUT="diagnostics"
mkdir -p "$OUT"

PAGE="src/routes/(store)/+page.svelte"

echo "Writing reports to ./$OUT/ ..."

# 1) Overview: what changed, and do the hero assets exist
{
  echo "===== git status ====="
  git status
  echo
  echo "===== git diff --stat ====="
  git diff --stat
  echo
  echo "===== static/images/hero/ contents ====="
  ls -la static/images/hero/ 2>&1
  echo
  echo "===== source PNG still in root? ====="
  ls -la portada_Mesa_de_trabajo_1.png 2>&1
} > "$OUT/01_overview.txt" 2>&1

# 2) The hero page diff (most important) + its full current content
{
  echo "===== git diff: $PAGE ====="
  git diff -- "$PAGE"
  echo
  echo "===== FULL CURRENT FILE: $PAGE ====="
  cat "$PAGE" 2>&1
} > "$OUT/02_home_page.txt" 2>&1

# 3) layout.css diff (scrim tokens / overlay colors may live here)
{
  echo "===== git diff: src/routes/layout.css ====="
  git diff -- src/routes/layout.css
} > "$OUT/03_layout_css.txt" 2>&1

# 4) The 16 unexpected files: show every diff so we can judge if it's a stray sweep
{
  echo "This dumps the diff of every changed .svelte/.ts/.css/.md file EXCEPT the hero page,"
  echo "so we can see what the unrequested changes actually are."
  echo
  # List changed files, drop the hero page, dump each diff
  git diff --name-only | grep -v -F "$PAGE" | while IFS= read -r f; do
    echo "############################################################"
    echo "## $f"
    echo "############################################################"
    git diff -- "$f"
    echo
  done
} > "$OUT/04_other_changed_files.txt" 2>&1

echo "Done. Upload these files here:"
ls -1 "$OUT"/*.txt
