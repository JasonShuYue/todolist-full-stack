#!/bin/sh
set -e

if [ -z "${JWT_SECRET:-}" ]; then
  export JWT_SECRET=dev-local-jwt-secret-12345678901234567890
fi

./node_modules/.bin/prisma migrate deploy
exec node dist/index.js
