#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."

    if [ -f ".env.local" ]; then
        set -a
        # shellcheck disable=SC1091
        source ".env.local"
        set +a
    fi
    
    # Find the standalone server.js (may be nested due to monorepo structure)
    if [ -f ".next/standalone/workspace/projects/server.js" ]; then
        cd ".next/standalone/workspace/projects"
        mkdir -p .next/static
        cp -r ../../static .next/ 2>/dev/null || true
        PORT=${DEPLOY_RUN_PORT} node server.js
    elif [ -f ".next/standalone/server.js" ]; then
        cd ".next/standalone"
        mkdir -p .next/static
        cp -r ../static .next/ 2>/dev/null || true
        PORT=${DEPLOY_RUN_PORT} node server.js
    else
        echo "Error: server.js not found"
        exit 1
    fi
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
