#!/usr/bin/env sh
set -eu

if [ ! -f ".env" ]; then
  echo "Missing .env file in project root."
  exit 1
fi

DB_URL="$(sed -n 's/^DATABASE_URL[[:space:]]*=[[:space:]]*//p' .env | head -n 1)"

if [ -z "${DB_URL}" ]; then
  echo "DATABASE_URL is missing in .env"
  exit 1
fi

# Use port 5432 (session mode) to avoid pgbouncer prepared-statement conflicts
DB_URL_SESSION=$(echo "$DB_URL" | sed 's/:6543\//:5432\//' | sed 's/?pgbouncer=true//')

npx --yes supabase db push --db-url "${DB_URL_SESSION}"
