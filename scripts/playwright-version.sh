#!/usr/bin/env bash

set -euo pipefail

if [[ -d "node_modules/playwright" ]]; then
    PLAYWRIGHT_VERSION=$(node -p "require('./node_modules/playwright/package.json').version")
else
    echo "Error: node_modules/playwright doesn't exist"
    echo "Maybe you need to run installation command?"
    exit 1
fi

if [[ -z "$PLAYWRIGHT_VERSION" ]]; then
    echo "Error: Could not determine Playwright version"
    exit 1
fi

echo $PLAYWRIGHT_VERSION;
