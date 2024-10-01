#!/usr/bin/env -S deno run -A --unstable-ffi --no-lock

import { build, type Plugin, stop } from "npm:esbuild@0.23.1";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.10.3";
import { resolve } from "@std/path";

const rootDir = resolve(import.meta.dirname!, "../");
const dataDir = resolve(rootDir, "data");
const bundleFilePath = resolve(dataDir, "index.html");

const [jsCode, cssCode] = await Promise.all([
  build({
    bundle: true,
    tsconfigRaw: {
      compilerOptions: {
        jsx: "react-jsx",
      },
    },
    entryPoints: [
      resolve(rootDir, "src/public/src/main.tsx"),
    ],
    plugins: denoPlugins({
      configPath: resolve(rootDir, "deno.json"),
      lockPath: resolve(rootDir, "deno.lock"),
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
      resolve(rootDir, "src/public/css/main.css"),
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
    treeShaking: true,
    outdir: "out",
  }),
]);

let htmlFile = Deno.readTextFileSync(resolve(rootDir, "src/public/index.html"));

htmlFile = htmlFile.replace(
  "{{ CssItems }}",
  cssCode.outputFiles.filter(({ path }) => path.endsWith(".css")).map((
    { contents },
  ) => `<style>\n${new TextDecoder().decode(contents)}\n</style>`).join("\n"),
);

htmlFile = htmlFile.replace(
  "{{ JsItems }}",
  jsCode.outputFiles.filter(({ path }) => path.endsWith(".js")).map((
    { contents },
  ) =>
    `<script type="module">\n${new TextDecoder().decode(contents)}\n</script>`
  ).join("\n"),
);

try {
  Deno.mkdirSync(dataDir);
  // deno-lint-ignore no-empty
} catch {}

try {
  Deno.statSync(bundleFilePath);
  Deno.removeSync(bundleFilePath);
  // deno-lint-ignore no-empty
} catch {}

Deno.writeTextFileSync(bundleFilePath, htmlFile);

await stop();
