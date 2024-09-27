#!/usr/bin/env -S deno run -A --no-lock

import $ from "jsr:@david/dax@0.42.0";
import deno from "./../deno.json" with { type: "json" };

const targets = Object.keys(deno.tasks).filter((key) =>
  key.includes("compile:")
)
  .map((key) => key.replace("compile:", ""));

await $`echo "ENV=production" > .env`;

for (const target of targets) {
  await $`echo "==> Generating binary for ${target}"`;
  await $`deno task compile:${target} && tar -czvf ./.bin/denotag-${target}.tar.gz -C ./.bin denotag${
    target.includes("windows") ? ".exe" : ""
  }`;

  await $`echo`;
}
