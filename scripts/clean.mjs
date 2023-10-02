#!/usr/bin/env zx

$.verbose = false;

const root = (await $`git rev-parse --show-toplevel`).stdout.trim();

cd(root);
await $`rm -rf node_modules`;
await $`pnpm run clean:all`;
