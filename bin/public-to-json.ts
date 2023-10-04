#!/usr/bin/env -S deno run -A --unstable

import { walk } from "../src/deps.ts";

const data: Record<string, number[]> = {};
const dirWalker = walk("./public", {
  exts: ["js", "html"],
  includeDirs: false,
  includeSymlinks: false,
});

for await (const file of dirWalker) {
  const contents = await Deno.readFile(file.path);
  data[file.path] = Array.from(contents);
}

await Deno.writeTextFile("./src/public.json", JSON.stringify(data));
