import { parseArgs } from "@std/cli";
import { resolve } from "@std/path";
import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import {
  getFiles,
  getMusicFileMetadata,
  setMusicFileMetadata,
  type SetMusicFileMetadataPayload,
} from "./actions.ts";
import meta from "./../deno.json" with { type: "json" };
import { Index } from "./pages/Index.tsx";
import { layout } from "./pages/layout.ts";
import { renderPage } from "./core/ssr.tsx";
import { Audio } from "./pages/audio.tsx";
import { AudioError } from "./pages/audio-error.tsx";
import { TagAudio } from "./pages/tag-audio.tsx";

const help = `
Denotag

Utility to tag audio files.
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

  if (
    !(await Deno.stat(dir).catch(() => ({ isDirectory: false }))).isDirectory
  ) {
    throw new Error(`Dir "${dir}" it not a directory or is not a valid path`);
  }

  const app = new Hono();

  app.get(
    "/static/*",
    serveStatic({
      root: resolve(import.meta.dirname!, "..", "static"),
      rewriteRequestPath: (path) => path.replace("/static/", "/"),
      onFound: (p, ctx) => {
        if (p.endsWith(".js")) {
          ctx.header("Cache-Control", "public, max-age=31536000");
        }
      },
    }),
  );

  app.get("/", async (ctx) => {
    return ctx.html(
      renderPage(Index, {
        layout: layout(),
        props: {
          q: ctx.req.query("q") ?? "",
          files: await getFiles(dir, {
            where: { name: ctx.req.query("q") ?? "" },
            order: { name: "asc" },
          }),
        },
      }),
    );
  });

  app.get("/tag", (ctx) => {
    const path = decodeURIComponent(ctx.req.query("path")!);
    const metadata = (() => {
      try {
        return getMusicFileMetadata({
          path: path,
        });
      } catch (error) {
        if (error instanceof Error) {
          return error;
        }

        return new Error("Unknown error", { cause: error });
      }
    })();

    if (metadata instanceof Error) {
      return new Response(
        renderPage(AudioError, {
          layout: layout(),
          props: { file: path, error: metadata },
        }),
        { headers: { "content-type": "text/html" }, status: 400 },
      );
    }

    return new Response(
      renderPage(TagAudio, {
        layout: layout(),
        props: { file: path, metadata: metadata },
      }),
      { headers: { "content-type": "text/html" }, status: 200 },
    );
  });

  app.post("/tag", async (ctx) => {
    const data = await ctx.req.parseBody();

    const path = data["path"] as string;
    const metadata: SetMusicFileMetadataPayload = { ...data };

    if (data["cover"] && data["cover"] instanceof File) {
      metadata.cover = {
        data: await data["cover"].bytes(),
        mimetype: data["cover"].type,
      };
    } else {
      delete metadata.cover;
    }

    delete (metadata as { path?: string }).path;

    try {
      setMusicFileMetadata({ path, metadata });
    } catch (error) {
      return new Response(
        renderPage(AudioError, {
          layout: layout(),
          props: {
            file: path,
            error: error instanceof Error
              ? error
              : new Error("Something broke", { cause: error }),
          },
        }),
        { headers: { "content-type": "text/html" }, status: 400 },
      );
    }

    return ctx.redirect(`/tag?path=${encodeURIComponent(path)}`);
  });

  app.get("/audio", (ctx) => {
    const path = decodeURIComponent(ctx.req.query("path")!);
    const metadata = (() => {
      try {
        return getMusicFileMetadata({
          path: path,
        });
      } catch (error) {
        if (error instanceof Error) {
          return error;
        }

        return new Error("Unknown error", { cause: error });
      }
    })();

    if (metadata instanceof Error) {
      return new Response(
        renderPage(AudioError, {
          layout: layout(),
          props: { file: path, error: metadata },
        }),
        { headers: { "content-type": "text/html" }, status: 200 },
      );
    }

    return new Response(
      renderPage(Audio, {
        layout: layout(),
        props: { file: path, metadata: metadata },
      }),
      { headers: { "content-type": "text/html" }, status: 200 },
    );
  });

  return Deno.serve({
    hostname: "127.0.0.1",
    port: Deno.env.get("ENV") === "production" ? 0 : 8000,
  }, app.fetch);
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
          const server = await onTagCmd({ dir: resolve(directory!) });

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
