#!/usr/bin/env -S deno run -A --unstable-ffi --cached-only

import { build, type Plugin, stop } from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { resolve } from "@std/path";

const [jsCode, cssCode] = await Promise.all([
  build({
    bundle: true,
    tsconfigRaw: {
      compilerOptions: {
        jsx: "react-jsx",
      },
    },
    entryPoints: [
      resolve(import.meta.dirname!, "../src/public/src/main.ts"),
    ],
    plugins: denoPlugins({
      configPath: resolve(import.meta.dirname!, "../deno.json"),
      lockPath: resolve(import.meta.dirname!, "../deno.lock"),
    }),
    define: {
      NODE_ENV: "production",
    },
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: false,
    treeShaking: true,
    format: "esm",
    write: false,
    outdir: "out",
  }),
  build({
    bundle: true,
    entryPoints: [
      resolve(import.meta.dirname!, "../src/public/css/main.css"),
    ],
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
    ],
    minify: true,
    write: false,
    outdir: "out",
  }),
]);

const contents = {
  css: cssCode.outputFiles
    .filter(({ path }) => path.endsWith(".css"))
    .map(({ contents }) =>
      `<style>\n${new TextDecoder().decode(contents)}\n</style>`
    )
    .map((data) => Array.from(new TextEncoder().encode(data))),
  js: jsCode.outputFiles
    .filter(({ path }) => path.endsWith(".js"))
    .map(({ contents }) =>
      `<script type="module">\n${new TextDecoder().decode(contents)}\n</script>`
    )
    .map((data) => Array.from(new TextEncoder().encode(data))),
};

try {
  Deno.statSync("./src/public.json");
  Deno.removeSync("./src/public.json");
  // deno-lint-ignore no-empty
} catch {}

Deno.writeTextFileSync(
  "./src/public.json",
  JSON.stringify(contents),
);

await stop();
