#!/usr/bin/env -S deno run -A --unstable

import { bundle, walkSync } from "../src/deps.ts";
import json from "../deno.json" assert { type: "json" };

let htmlFile = Deno.readTextFileSync(
  new URL("../public/index.html", import.meta.url),
);

const { code: js } = await bundle(
  new URL("../public/src/main.tsx", import.meta.url),
  { importMap: { imports: json.imports }, minify: false },
);

const css = [];

for (
  const x of walkSync(new URL("../public/css", import.meta.url), {
    exts: [".css"],
    includeDirs: false,
    includeSymlinks: false,
  })
) css.push(`<style>\n${Deno.readTextFileSync(x.path)}\n</style>`);

htmlFile = htmlFile.replace("{{ CssItems }}", css.join("\n"));
htmlFile = htmlFile.replace(
  "{{ JsItems }}",
  `<script type="module">\n${js}\n</script>`,
);

try {
  Deno.statSync("./src/public.json");
  Deno.removeSync("./src/public.json");
  // deno-lint-ignore no-empty
} catch {}

Deno.writeTextFileSync(
  "./src/public.json",
  JSON.stringify({
    "index.html": Array.from(new TextEncoder().encode(htmlFile)),
  }),
);
