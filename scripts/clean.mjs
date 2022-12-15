#!/usr/bin/env zx

$.verbose = false;

const root = (await $`git rev-parse --show-toplevel`).stdout.trim();

cd(root);
await $`rm -rf node_modules`;

cd(`${root}/backend`);
await $`pnpm run clean:all`;

cd(`${root}/frontend`);
await $`pnpm run clean:all`;
