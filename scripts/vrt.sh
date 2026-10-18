#!/bin/bash
# Runs the visual regression tests in the Playwright Linux image, so baselines
# are the same on every machine. Needs Docker. The image tag must match the
# pinned @playwright/test version.
#
#   scripts/vrt.sh                 compare against the committed baselines
#   scripts/vrt.sh --update-snapshots   rewrite the baselines (review the diff!)
#   scripts/vrt.sh -g "program-badge"   run a subset
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').devDependencies['@playwright/test']")

npm run build-storybook

docker run --rm --ipc=host \
  --workdir /app \
  -v "$PWD":/app \
  -v /app/node_modules/.cache \
  "mcr.microsoft.com/playwright:v${VERSION}-noble" \
  npx playwright test "$@"
