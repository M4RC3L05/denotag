#!/usr/bin/env -S deno run -A --unstable

import { build, esbuildPluginCache, Plugin } from "../src/deps.ts";
import json from "../deno.json" with { type: "json" };

let htmlFile = Deno.readTextFileSync(
  new URL("../public/index.html", import.meta.url),
);

const code = await build({
  bundle: true,
  entryPoints: [
    "./public/src/main.tsx",
    "./public/css/main.css",
  ],
  tsconfigRaw: { compilerOptions: { jsx: "react-jsx" } },
  plugins: [
    {
      name: "css-http-import",
      setup(build) {
        build.onResolve(
          { filter: /^https?:\/\/.*\.css$/ },
          (args) => ({ path: args.path, namespace: "css-http-url" }),
        );

        build.onLoad(
          { filter: /.*/, namespace: "css-http-url" },
          async (args) => ({
            contents: await fetch(args.path + "?target=es2022").then((x) =>
              x.text()
            ),
            loader: "css",
          }),
        );
      },
    } as Plugin,
    esbuildPluginCache({
      importmap: {
        imports: Object.fromEntries(
          Object.entries(json.imports).map((
            [key, value],
          ) => [key, value + "?target=es2022"]),
        ),
      },
      directory: "./.cache",
    }),
  ],
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  keepNames: true,
  treeShaking: true,
  format: "esm",
  target: ["es2022"],
  write: false,
  outdir: "foo",
});

htmlFile = htmlFile.replace(
  "{{ CssItems }}",
  code.outputFiles.filter(({ path }) => path.endsWith(".css")).map((
    { contents },
  ) => `<style>\n${new TextDecoder().decode(contents)}\n</style>`).join("\n"),
);

htmlFile = htmlFile.replace(
  "{{ JsItems }}",
  code.outputFiles.filter(({ path }) => path.endsWith(".js")).map((
    { contents },
  ) =>
    `<script type="module">\n${new TextDecoder().decode(contents)}\n</script>`
  ).join("\n"),
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

Deno.exit(0);
