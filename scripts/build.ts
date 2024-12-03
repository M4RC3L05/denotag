#!/usr/bin/env -S deno run -A --cached-only

import $ from "@david/dax";
import { basename, resolve } from "@std/path";

const rootDir = resolve(import.meta.dirname!, "../");
const binDir = resolve(rootDir, ".bin");
const binName = "denotag" as const;

const targets = [
  "x86_64-pc-windows-msvc",
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu",
] as const;

for (const file of Deno.readDirSync(binDir)) {
  if (
    file.name.match(/.*\.(zip|tar\.gz)(\.sha256)?$/) ||
    targets.some((target) => file.name.includes(target))
  ) {
    Deno.removeSync(resolve(binDir, file.name), { recursive: true });
  }
}

const buildFor = async (target: typeof targets[number]) => {
  const finalBinDir = resolve(binDir, `${binName}-${target}`);
  const finalBinName = target.includes("windows") ? `${binName}.exe` : binName;
  const finalCompressName = target.includes("windows")
    ? `${basename(finalBinDir)}.zip`
    : `${basename(finalBinDir)}.tar.gz`;
  const finalCompressPath = resolve(binDir, finalCompressName);
  const checksumName = `${finalCompressName}.sha256`;
  const checksumPath = resolve(binDir, checksumName);
  const finalBinPath = resolve(finalBinDir, finalBinName);
  const compressCmd = target.includes("windows")
    ? `zip -j ${finalCompressPath} ${finalBinPath}`
    : `tar -czvf ${finalCompressPath} -C ${finalBinDir} ${finalBinName}`;
  const scriptPath = resolve(rootDir, "src", "main.ts");

  await $`deno compile --allow-env=ENV --allow-net=127.0.0.1 --include ./data/index.html --env=${
    $.path(resolve(rootDir, ".env"))
  } --target=${target} --output ${$.path(finalBinPath)} ${$.path(scriptPath)}`;
  await $.raw`${compressCmd}`;
  await $`cd ${$.path(binDir)} && sha256sum ${finalCompressName} > ${
    $.path(checksumPath)
  }`;
  await Deno.remove(finalBinDir, { recursive: true });
};

await $`echo "ENV=production" > ${$.path(resolve(rootDir, ".env"))}`;

await Promise.all(targets.map(buildFor));
