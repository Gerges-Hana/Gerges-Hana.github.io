#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist-deploy"
LITE="${LITE:-1}"

rm -rf "$OUT"
mkdir -p "$OUT"

copy_mail_config() {
  local mail_out="$OUT/assets/js/mail.config.js"
  mkdir -p "$(dirname "$mail_out")"

  if [[ -n "${WEB3FORMS_ACCESS_KEY:-}" ]]; then
    printf 'window.WEB3FORMS_ACCESS_KEY = "%s";\n' "$WEB3FORMS_ACCESS_KEY" > "$mail_out"
  elif [[ -f "$ROOT/assets/js/mail.config.js" ]]; then
    cp "$ROOT/assets/js/mail.config.js" "$mail_out"
  else
    cp "$ROOT/assets/js/mail.config.example.js" "$mail_out"
    echo "Warning: using mail.config.example.js — set WEB3FORMS_ACCESS_KEY secret."
  fi
}

if [[ "$LITE" == "1" ]]; then
  cp "$ROOT/index.html" "$ROOT/project.html" "$OUT/"
  [[ -f "$ROOT/_redirects" ]] && cp "$ROOT/_redirects" "$OUT/"
  [[ -f "$ROOT/Full Stack PHP Laravel Developer.pdf" ]] && cp "$ROOT/Full Stack PHP Laravel Developer.pdf" "$OUT/"

  mkdir -p "$OUT/assets"
  rsync -a \
    --exclude '*.map' \
    --max-size=25m \
    "$ROOT/assets/css" \
    "$ROOT/assets/js" \
    "$ROOT/assets/vendor" \
    "$OUT/assets/"
  [[ -f "$ROOT/assets/style.css" ]] && cp "$ROOT/assets/style.css" "$OUT/assets/"

  mkdir -p "$OUT/assets/img"
  for img in favicon.png favicon2.png apple-touch-icon.png gerges.png "g logo.png"; do
    [[ -f "$ROOT/assets/img/$img" ]] && cp "$ROOT/assets/img/$img" "$OUT/assets/img/"
  done

  if [[ -d "$ROOT/assets/img/assets/img" ]]; then
    mkdir -p "$OUT/assets/img/assets/img"
    rsync -a --max-size=25m "$ROOT/assets/img/assets/img/" "$OUT/assets/img/assets/img/"
  fi

  mkdir -p "$OUT/projects"
  shopt -s nullglob
  for project_dir in "$ROOT/projects"/*/; do
    name="$(basename "$project_dir")"
    mkdir -p "$OUT/projects/$name"
    [[ -d "${project_dir}thumbs" ]] && rsync -a --max-size=25m "${project_dir}thumbs/" "$OUT/projects/$name/thumbs/"
    [[ -d "${project_dir}medium" ]] && rsync -a --max-size=25m "${project_dir}medium/" "$OUT/projects/$name/medium/"
  done
  shopt -u nullglob
else
  rsync -a \
    --exclude '.git' \
    --exclude 'dist-deploy' \
    --exclude 'vendor' \
    --exclude 'scripts' \
    --exclude 'node_modules' \
    --exclude '.gitignore' \
    --exclude 'composer.json' \
    --exclude 'composer.lock' \
    --exclude 'config' \
    --exclude 'gerges.png' \
    --exclude 'gerges-site.zip' \
    --exclude 'gerges-portfolio-deploy.zip' \
    --max-size=25m \
    "$ROOT/" "$OUT/"
fi

copy_mail_config

echo "Deploy folder ready: $OUT ($(find "$OUT" -type f | wc -l | tr -d ' ') files)"
