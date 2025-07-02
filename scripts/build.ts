#!/usr/bin/env -S deno run -A

import $ from "@david/dax";

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

  await $`deno compile --cached-only --allow-env=ENV --allow-net=127.0.0.1 --env=${
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
await Promise.all(targets.map(buildFor));
