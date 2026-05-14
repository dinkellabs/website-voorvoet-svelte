#!/usr/bin/env bash
# Fail if any non-server file imports from $env/*/private.
#
# Allowed paths:
#   src/lib/server/**
#   src/**/*.server.ts        (e.g. hooks.server.ts, +page.server.ts)
#   src/**/+server.ts         (SvelteKit endpoints)
#   src/**/__tests__/**
#
# Wired into pre-commit so a stray private-env import in a client-rendered
# module gets caught before commit (would otherwise leak the value into the
# client bundle).

set -e

bad=$(grep -rn --include="*.ts" --include="*.svelte" \
  'env/dynamic/private\|env/static/private' src/ \
  | grep -v '/server/' \
  | grep -v '\.server\.ts' \
  | grep -v '+server\.ts' \
  | grep -v 'hooks\.server\.ts' \
  | grep -v '/__tests__/' \
  || true)

if [ -n "$bad" ]; then
  echo "ERROR: private env imported outside server context:"
  echo "$bad"
  exit 1
fi
