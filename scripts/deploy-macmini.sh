#!/bin/bash
set -euo pipefail

REPO_ROOT="/Users/geoseanlee/orca/georges-personal-website"
STATE_DIR="/Users/geoseanlee/Library/Application Support/PersonalWeb"
STATE_FILE="$STATE_DIR/last-deployed-commit"
LOCK_DIR="/Users/geoseanlee/Library/Caches/personalweb-git-sync.lock"
LOG_FILE="/Users/geoseanlee/Library/Logs/personalweb-git-sync.log"
ACCEPT_REVIEWED_CHANGES=0

if [[ "${1:-}" == "--accept-reviewed-changes" ]]; then
  ACCEPT_REVIEWED_CHANGES=1
elif [[ $# -gt 0 ]]; then
  printf 'Usage: %s [--accept-reviewed-changes]\n' "$0" >&2
  exit 2
fi

log() {
  printf '%s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >> "$LOG_FILE"
}

mkdir -p "$STATE_DIR" "$(dirname "$LOCK_DIR")" "$(dirname "$LOG_FILE")"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "Another deployment check is already running; skipping."
  exit 0
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT

cd "$REPO_ROOT"

if [[ "$(git branch --show-current)" != "main" ]]; then
  log "Expected branch main; refusing to deploy."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  log "Working tree is not clean; refusing to fetch or deploy."
  exit 1
fi

if [[ ! -f "$STATE_FILE" ]]; then
  log "Deployment state is missing; initialize it to the currently deployed commit before enabling this agent."
  exit 1
fi

DEPLOYED_SHA="$(cat "$STATE_FILE")"
if ! git cat-file -e "${DEPLOYED_SHA}^{commit}" 2>/dev/null; then
  log "Recorded deployment commit is unavailable; refusing to deploy."
  exit 1
fi

git fetch --quiet origin main
TARGET_SHA="$(git rev-parse origin/main)"
CURRENT_SHA="$(git rev-parse HEAD)"

if ! git merge-base --is-ancestor "$DEPLOYED_SHA" "$TARGET_SHA"; then
  log "origin/main is not a fast-forward from the last deployed commit; manual intervention required."
  exit 1
fi

if [[ "$TARGET_SHA" == "$DEPLOYED_SHA" && "$CURRENT_SHA" == "$TARGET_SHA" ]]; then
  exit 0
fi

if [[ "$CURRENT_SHA" != "$DEPLOYED_SHA" && "$CURRENT_SHA" != "$TARGET_SHA" ]]; then
  if ! git merge-base --is-ancestor "$CURRENT_SHA" "$TARGET_SHA"; then
    log "Local main differs from the deployment state and is not behind origin/main; refusing to overwrite it."
    exit 1
  fi
fi

CHANGED_FILES="$(git diff --name-only "$DEPLOYED_SHA" "$TARGET_SHA")"
if grep -Eq '^backend/(alembic/|requirements(-dev)?\.txt$)' <<< "$CHANGED_FILES"; then
  if (( ! ACCEPT_REVIEWED_CHANGES )); then
    log "Database migrations or backend dependencies changed; review and apply them manually before deploying."
    exit 1
  fi
  if [[ "$CURRENT_SHA" != "$TARGET_SHA" ]]; then
    log "Reviewed migration/dependency changes require main at origin/main before confirmation."
    exit 1
  fi
  log "Proceeding with reviewed migration/dependency changes; verify manual migration and dependency steps are complete."
fi

if [[ "$CURRENT_SHA" != "$TARGET_SHA" ]]; then
  git pull --quiet --ff-only origin main
fi

FRONTEND_CHANGED=0
BACKEND_CHANGED=0
if grep -q '^frontend/' <<< "$CHANGED_FILES"; then FRONTEND_CHANGED=1; fi
if grep -q '^backend/' <<< "$CHANGED_FILES"; then BACKEND_CHANGED=1; fi

if (( FRONTEND_CHANGED )); then
  if grep -q '^frontend/package-lock\.json$' <<< "$CHANGED_FILES"; then
    npm ci --prefix frontend
  fi
  npm run test --prefix frontend
  npm run lint --prefix frontend
  npm run test:e2e --prefix frontend
  npm run build --prefix frontend
fi

if (( BACKEND_CHANGED )); then
  (
    cd "$REPO_ROOT/backend"
    .venv/bin/python -m pytest
    .venv/bin/python -m compileall -q app tests
  )
  launchctl kickstart -k "gui/$(id -u)/com.geoseanlee.personalweb-api"

  for attempt in {1..20}; do
    if curl --silent --show-error --fail http://127.0.0.1:5050/api/v1/health >/dev/null; then
      break
    fi
    if (( attempt == 20 )); then
      log "API health check failed after restart; deployment state was not advanced."
      exit 1
    fi
    sleep 2
  done
fi

printf '%s\n' "$TARGET_SHA" > "$STATE_FILE"
chmod 600 "$STATE_FILE"
log "Deployed $TARGET_SHA (frontend_changed=$FRONTEND_CHANGED backend_changed=$BACKEND_CHANGED)."
