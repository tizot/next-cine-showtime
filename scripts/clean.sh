#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

cd "$(dirname "$0")"
cd ..

rm -rf node_modules

cd backend
pnpm run clean:all

cd ../frontend
pnpm run clean:all

exit 0
