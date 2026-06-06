#!/usr/bin/env bash

# Start the RFP AI Agent webhook server.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Starting webhook server on port ${PORT:-3000}..."
node dist/server.js
