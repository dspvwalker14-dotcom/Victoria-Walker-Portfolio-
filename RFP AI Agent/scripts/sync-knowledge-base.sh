#!/usr/bin/env bash

# Sync and index all knowledge sources (SharePoint and Confluence).
# Make sure .env is present and configured.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Syncing all knowledge sources..."
node dist/src/scripts/sync-knowledge-base.js
