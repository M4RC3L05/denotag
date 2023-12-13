#!/usr/bin/env -S deno run -A --unstable

import { extname, resolve, toFileUrl, transpile, walk } from "../src/deps.ts";
import json from "../deno.json" assert { type: "json" };

const data: Record<string, number[]> = {};
const dirWalker = walk("./public", {
  exts: ["ts", "tsx", ".css", "html"],
  includeDirs: false,
  includeSymlinks: false,
});

for await (const file of dirWalker) {
  if ([".ts", ".tsx"].includes(extname(file.path))) {
    const compiled = await transpile(file.path, {
      importMap: { imports: json.imports },
    });

    for (const [k, v] of compiled.entries()) {
      if (!(k in data)) data[k] = Array.from(new TextEncoder().encode(v));
    }

    continue;
  }

  data[toFileUrl(resolve(file.path)).href] = Array.from(
    await Deno.readFile(file.path),
  );
}

await Deno.writeTextFile("./src/public.json", JSON.stringify(data));
