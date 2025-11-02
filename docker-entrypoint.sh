#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Simple wait loop (TypeORM will retry connection)
sleep 3

# Migrations will run automatically via TypeORM if RUN_MIGRATIONS=true
echo "Starting application..."
echo "Migrations will run automatically if RUN_MIGRATIONS=true"
exec node dist/main.js
