#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "工作区有未提交改动，停止部署" >&2
  exit 1
fi

if [ "$(git branch --show-current)" != "main" ]; then
  echo "只能从 main 分支部署" >&2
  exit 1
fi

git pull --ff-only origin main

docker compose build app

docker compose up -d --no-deps --no-build --force-recreate app

for attempt in {1..12}; do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/health/ready >/dev/null; then
    echo "部署成功：$(git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 5
done

echo "部署后健康检查失败，请检查应用日志" >&2
docker compose logs --tail=80 app >&2
exit 1
