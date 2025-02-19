import { parseArgs } from "@std/cli";
import { join } from "@std/path";
import {
  isMultipartRequest,
  parseMultipartRequest,
} from "@mjackson/multipart-parser";
import { bootActions } from "./actions.ts";
import meta from "./../deno.json" with { type: "json" };

const indexFile = new URL("./../data/index.html", import.meta.url);
const indexFileContents = Deno.readTextFileSync(indexFile);

const multipartToObj = async (request: Request) => {
  const response = new Map<string, unknown>();
  await parseMultipartRequest(request, async (part) => {
    if (!part.name) return;

    response.set(
      part.name,
      part.isFile
        ? { mimetype: part.mediaType, data: await part.bytes() }
        : await part.text(),
    );
  });

  return Object.fromEntries(response.entries());
};

const help = `
Denotag

Utility to that audio files.
It spawns a local web server that can accessed via a web browser,
to be able to show the audio files to be tagged.

Usage: denotag [OPTIONS] [COMMAND]

Options:
  --help, -h      Display this help menu
  --version, -V   Display version

Commands:
  tag, t          Tag an audio file
`.trim();

const helpTagCmd = `
Denotag

Tag music files

Usage: denotag tag [OPTIONS]

Options:
  --help, -h              Display this help menu
  --dir, -d <directory>   Directory where the audio files resides
                            - You will be prompted for read/write permissions on the specified directoy.
`.trim();

const printHelp = () => {
  console.log(help);
};

const printHelpTagCmd = () => {
  console.log(helpTagCmd);
};

const printVersion = () => {
  console.log(`v${meta.version}`);
};

const onTagCmd = async ({ dir }: { dir: string }) => {
  const [allowRead, allowWrite] = await Promise.all([
    Deno.permissions.request({ name: "read", path: dir }),
    Deno.permissions.request({ name: "write", path: dir }),
  ]);

  if (allowRead.state !== "granted" || allowWrite.state !== "granted") {
    throw new Error(`Permission to read/write to "${dir}" not granted.`);
  }

  if (!(await Deno.stat(dir)).isDirectory) {
    throw new Error(`Dir "${dir}" it not a directory`);
  }

  const { invokeAction } = bootActions({ dir: join(dir) });

  return Deno.serve({
    hostname: "127.0.0.1",
    port: Deno.env.get("ENV") === "production" ? 0 : 8000,
  }, async (request) => {
    const { pathname } = new URL(request.url);

    if (request.method === "POST" && pathname.startsWith("/call")) {
      const [_, callName] = pathname.slice(1).split("/");

      const hasContent = (request.headers.has("content-length") &&
        request.headers.get("content-length") !== "0") ||
        (request.headers.has("content-type") &&
          (request.headers.get("content-type")?.includes(
            "application/json",
          ) ||
            isMultipartRequest(request)));

      const args = hasContent
        ? isMultipartRequest(request)
          ? [await multipartToObj(request)]
          : await request.json()
        : [];

      // deno-lint-ignore no-explicit-any
      return Response.json(await invokeAction(callName as any, ...args));
    }

    return new Response(indexFileContents, {
      headers: { "content-type": "text/html" },
      status: 200,
    });
  });
};

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    alias: { help: "h", version: "V", dir: "d" },
    boolean: ["help", "version"],
    string: ["dir"],
    default: { help: true },
  });

  switch (args._[0]) {
    case "tag":
    case "t": {
      if (args.dir || args.d) {
        const directory = args.dir ?? args.d;

        try {
          const server = await onTagCmd({ dir: directory! });

          Deno.addSignalListener("SIGINT", () => server.shutdown());

          if (Deno.build.os === "windows") {
            Deno.addSignalListener("SIGBREAK", () => server.shutdown());
          }

          await server.finished;
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);

          Deno.exit(1);
        }

        Deno.exit(0);
      }

      if (args.help || args.h) {
        printHelpTagCmd();
        Deno.exit(0);
      }

      break;
    }

    default: {
      if (args.version || args.V) {
        printVersion();
        Deno.exit(0);
      }

      if (args.help || args.h) {
        printHelp();
        Deno.exit(0);
      }
    }
  }
}
