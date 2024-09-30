#!/usr/bin/env -S deno run -A --no-lock

import $ from "jsr:@david/dax@0.42.0";
import deno from "../deno.json" with { type: "json" };

const targets = Object.keys(deno.tasks)
  .filter((key) => key.includes("compile:"))
  .map((key) => key.replace("compile:", ""));

for (const file of Deno.readDirSync("./.bin")) {
  if (file.name.match(/.*\.(zip|tar\.gz)(\.sha256)?$/)) {
    Deno.removeSync(`./.bin/${file.name}`);
  }
}

await $`echo "ENV=production" > .env`;

for (const target of targets) {
  const binPath = target.includes("windows")
    ? `./.bin/denotag-${target}.zip`
    : `./.bin/denotag-${target}.tar.gz`;
  const archiveCmd = target.includes("windows")
    ? `zip -j ${binPath} ./.bin/denotag.exe`
    : `tar -czvf ${binPath} -C ./.bin denotag`;

  await $`echo "==> Generating binary for ${target}"`;
  await $`deno task compile:${target}`;
  await $.raw`${archiveCmd}`;
  await $`cd ./.bin/ && sha256sum ${$.path(binPath).basename()} > ./${
    $.path(binPath).basename()
  }.sha256`;

  await $`echo`;
}
