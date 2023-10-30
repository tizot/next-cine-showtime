#!/usr/bin/env zx

try {
  await $`docker ps`.quiet();
} catch (err) {
  console.error(chalk.yellow("Docker appears not to be running."));
  console.error(chalk.red("Aborting deploy."));
  await $`exit 1`;
}

// Just to remember 1Password password / TouchID
await $`op item list`.quiet();

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
await $`docker build --platform=linux/amd64 -t tizot/cine:${nextVersion} -t tizot/cine:latest .`;
await $`docker image push tizot/cine:${nextVersion}`;
await $`docker image push tizot/cine:latest`;

// From now on, sensitive information can be displayed in commands
const initialLog = $.log;
$.log = (entry) => {
  if (entry.kind === "cmd") return;
  initialLog(entry);
};

const pwd = JSON.parse(
  (
    await $`op item get 3asebhcozze6vnpdd65aopt4wy --fields label=password --format json`.quiet()
  ).stdout
).value;
$.log("Deploying to VPS");
await $`echo ${pwd} | ssh vps -t 'sudo -S bash cine-refresh.sh'`;
