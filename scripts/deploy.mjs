#!/usr/bin/env zx

if ((await $`git status --porcelain`).stdout) {
  console.error(
    chalk.yellow(
      "Git repository is not clean, did you commit your latest changes?"
    )
  );
  console.error(chalk.red("Aborting deploy."));
  await $`exit 1`;
}

const version = (await $`head -n 1 RELEASE`).stdout.trim().split(".");
const nextVersion = [version[0], parseInt(version[1]) + 1].join(".");
await $`echo ${nextVersion} > RELEASE`;
await $`git add RELEASE`;
await $`git commit -m "Bump version to ${nextVersion}"`;

await $`zx scripts/clean.mjs`;
await $`docker build -t tizot/cine:${nextVersion} -t tizot/cine:latest .`;
await $`docker image push tizot/cine:${nextVersion}`;
await $`docker image push tizot/cine:latest`;
await $`ssh vps -t 'sudo bash cine-refresh.sh'`;
