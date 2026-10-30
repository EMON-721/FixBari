#!/bin/sh
set -e

echo "Starting orders service..."
exec node dist/index.js
