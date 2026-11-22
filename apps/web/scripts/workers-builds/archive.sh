#!/usr/bin/env bash
# Runs from the repository root, after tests, OpenNext and bundle checks.
set -euo pipefail
app=apps/web
sha=$(git rev-parse HEAD)
test "$sha" = "$RELEASE_SHA"
test -s "$app/.open-next/.build/open-next.config.edge.mjs"
test -s "$app/.open-next/worker.js"
test -s "$app/.next/BUILD_ID"
archive=$(mktemp)
trap 'rm -f "$archive"' EXIT
shopt -s nullglob
# Wrangler bundles the custom entry point, which also imports workspace packages.
files=("$app/.open-next" "$app/.next/BUILD_ID" "$app/.next/required-server-files.json" packages/*/dist)
tar --dereference --hard-dereference -czf "$archive" "${files[@]}"
digest=$(sha256sum "$archive" | cut -d' ' -f1)
curl --fail --silent --show-error --retry 2 -T "$archive" "$RELEASE_UPLOAD_URL"
echo "WEB_RELEASE_ARCHIVE $sha $digest"
