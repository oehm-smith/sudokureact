#!/usr/bin/env bash
set -euo pipefail

LOCAL_DEPLOY_DIR=~/Sites/tintuna.com/projects/sudokureact

echo npm run build
npm run build

if [ -d "$LOCAL_DEPLOY_DIR" ]; then
	rm -r "$LOCAL_DEPLOY_DIR"
fi

# Vite builds to dist/ - the build/ directory is the Create React App convention this
# project no longer uses.
echo cp -r dist "$LOCAL_DEPLOY_DIR"
cp -r dist "$LOCAL_DEPLOY_DIR"
