#!/usr/bin/env -S deno run -A

import $ from "@david/dax";
import meta from "./../deno.json" with { type: "json" };

$.setPrintCommand(true);

const rootDir = $.path(import.meta.dirname!).resolve("..");
const binDir = rootDir.resolve(".bin");
const binName = "denotag" as const;

const targets = [
  "x86_64-pc-windows-msvc",
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu",
] as const;

const requiredDepsInfo = await $`deno info --json src/main.ts`.json();
const requiredDeps = new Set(
  (requiredDepsInfo.modules as {
    specifier?: string;
    kind?: string;
    dependencies?: { specifier: string }[];
  }[]).filter((item) =>
    item.kind === "esm" && item.specifier && URL.canParse(item.specifier) &&
    item.specifier.includes("denotag/src/") &&
    Array.isArray(item.dependencies) && item.dependencies.length > 0
  ).flatMap((item) =>
    item.dependencies?.filter((dep) => (dep.specifier in meta.imports)).map(
      (dep) => dep.specifier,
    )
  ),
);

const compileDenoJson = JSON.stringify(
  {
    ...meta,
    imports: Object.fromEntries(
      requiredDeps.values().map((
        v,
      ) => [v, meta.imports[v as keyof typeof meta.imports]]),
    ),
  },
  null,
  2,
);

const buildFor = async (target: typeof targets[number]) => {
  const compileDirName = `${binName}-${target}`;
  const compiledBinName = target.includes("windows")
    ? `${binName}.exe`
    : binName;
  const compiledPath = binDir
    .resolve(compileDirName)
    .resolve(compiledBinName);

  const compressedBinName = target.includes("windows")
    ? `${compileDirName}.zip`
    : `${compileDirName}.tar.gz`;
  const compressedPath = binDir.resolve(compressedBinName);
  const checksumPath = compressedPath.parentOrThrow().join(
    `${compressedBinName}.sha256`,
  );

  await $`deno compile --unstable-raw-imports --cached-only --no-check --allow-env=ENV --allow-net=127.0.0.1 --env=${
    rootDir.resolve(".env")
  } --target=${target} --output=${compiledPath} ${
    rootDir.resolve("src", "main.ts")
  }`;

  if (target.includes("windows")) {
    await $`zip -j ${compressedPath} ${compiledPath}`;
  } else {
    await $`tar -czvf ${compressedPath} -C ${compiledPath.parentOrThrow()} ${binName}`;
  }

  await $`rm -r ${compiledPath.parentOrThrow()}`;

  await $`cd ${binDir} && sha256sum ${compressedBinName} > ${checksumPath}`;
};

await binDir.emptyDir();
await $`echo "ENV=production" > ${rootDir.resolve(".env")}`;
await $`deno task build`;
await $`echo ${compileDenoJson} > deno.json`;
await $`rm -rf node_modules`;
await $`deno install`;
await Promise.all(targets.map(buildFor));
await $`echo ${JSON.stringify(meta, null, 2)} > deno.json`;
