#!/bin/sh
set -e

echo "Starting services service..."
exec node dist/main.js
