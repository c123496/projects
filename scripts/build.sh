#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Checking TypeScript..."
node ./node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit

echo "Building the Next.js project..."
NEXT_BUILD_WORKER_THREADS=true pnpm exec next build --experimental-build-mode compile

echo "Build completed successfully!"
