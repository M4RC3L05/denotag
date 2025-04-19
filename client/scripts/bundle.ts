#!/usr/bin/env -S deno run -A --cached-only

import { build, type Plugin, stop } from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { resolve } from "@std/path";
import denoConf from "../deno.json" with { type: "json" };

const rootDir = resolve(import.meta.dirname!, "../");
const dataDir = resolve(rootDir, "..", "data");
const bundleFilePath = resolve(dataDir, "index.html");

const [jsCode, cssCode] = await Promise.all([
  build({
    bundle: true,
    entryPoints: [
      resolve(rootDir, "src/main.tsx"),
    ],
    plugins: denoPlugins({
      configPath: resolve(rootDir, "deno.json"),
      lockPath: resolve(rootDir, "deno.lock"),
    }),
    define: {
      NODE_ENV: "production",
    },
    minify: true,
    keepNames: false,
    treeShaking: true,
    format: "esm",
    write: false,
    outdir: "out",
    jsx: "automatic",
    jsxImportSource: denoConf.compilerOptions.jsxImportSource,
  }),
  build({
    bundle: true,
    entryPoints: [
      resolve(rootDir, "css/main.css"),
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

const cssContent = cssCode.outputFiles.filter(({ path }) =>
  path.endsWith(".css")
).map((
  { contents },
) => `<style>\n${new TextDecoder().decode(contents)}\n</style>`).join("\n");

const jsContent = jsCode.outputFiles.filter(({ path }) => path.endsWith(".js"))
  .map((
    { contents },
  ) =>
    `<script type="module">\n${new TextDecoder().decode(contents)}\n</script>`
  ).join("\n");

const htmlFile = Deno.readTextFileSync(
  resolve(rootDir, "index.html"),
).split(/{{ | }}/gm).map((segment) => {
  if (segment === "CssItems") {
    return cssContent;
  }

  if (segment === "JsItems") {
    return jsContent;
  }

  return segment;
}).join("\n");

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
