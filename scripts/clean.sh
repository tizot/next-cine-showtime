#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail
set -o xtrace

cd "$(git rev-parse --show-toplevel)/backend"

rm -rf node_modules

cd "$(git rev-parse --show-toplevel)/backend"
pnpm run clean:all

cd "$(git rev-parse --show-toplevel)/frontend"
pnpm run clean:all

exit 0
