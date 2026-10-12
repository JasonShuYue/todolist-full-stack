#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$HOME/todolist-full-stack"
BACKUP_DIR="$HOME/backups/todolist"
VOLUME="todolist-full-stack_todolist-data"
IMAGE="todolist-full-stack:local"
BACKUP_NAME="todolist-$(date +%Y%m%d-%H%M%S).db"

mkdir -p -m 700 "$BACKUP_DIR"
cd "$PROJECT_DIR"

docker compose stop app

cleanup() {
  docker compose start app
}
trap cleanup EXIT

docker run --rm \
  --user "$(id -u):$(id -g)" \
  -v "$VOLUME:/data:ro" \
  -v "$BACKUP_DIR:/backup" \
  "$IMAGE" \
  sh -c 'umask 077; cp /data/dev.db "/backup/$1"' \
  sh "$BACKUP_NAME"

test -s "$BACKUP_DIR/$BACKUP_NAME"

if command -v sqlite3 >/dev/null 2>&1; then
  result="$(sqlite3 "$BACKUP_DIR/$BACKUP_NAME" 'PRAGMA integrity_check;')"
  test "$result" = "ok"
fi

find "$BACKUP_DIR" \
  -type f \
  -name 'todolist-*.db' \
  -mtime +7 \
  -delete

echo "备份完成：$BACKUP_DIR/$BACKUP_NAME"
