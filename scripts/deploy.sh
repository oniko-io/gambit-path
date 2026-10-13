#!/usr/bin/env bash
# Builds the app for GitHub Pages and publishes dist/ as the gh-pages branch.
set -euo pipefail
cd "$(dirname "$0")/.."

remote=$(git remote get-url origin)
npm run check
BASE_PATH=/gambit-path/ npm run build

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(git -C .. rev-parse --short HEAD)"
git push -f -q "$remote" gh-pages
rm -rf .git
echo "Published. Live in about a minute: https://oniko-io.github.io/gambit-path/"
