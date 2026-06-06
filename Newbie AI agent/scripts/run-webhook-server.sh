#!/usr/bin/env bash

# Run the Newbie AI Agent webhook server locally.
# Make sure .env is present and configured.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Starting webhook server on port ${PORT:-3000}..."
node dist/server.js
