import { Command, CompletionsCommand, HelpCommand } from "cliffy";
import { bootActions } from "./actions.ts";
import { join } from "@std/path";
import {
  isMultipartRequest,
  parseMultipartRequest,
} from "@mjackson/multipart-parser";

const multipartToObj = async (request: Request) => {
  const response = new Map<string, unknown>();

  for await (const part of parseMultipartRequest(request)) {
    if (!part.name) continue;

    response.set(
      part.name,
      part.isFile
        ? { mimetype: part.mediaType, data: await part.bytes() }
        : await part.text(),
    );
  }

  return Object.fromEntries(response.entries());
};

const tag = new Command()
  .description("Tag a audio file")
  .option(
    "-d, --dir <directory:string>",
    "The directory with audio files",
    { required: true },
  )
  .action(async ({ dir }) => {
    if (!(await Deno.stat(dir)).isDirectory) {
      throw new Error(`Dir "${dir}" it not a directory`);
    }

    const [allowRead, allowWrite] = await Promise.all([
      Deno.permissions.request({ name: "read", path: dir }),
      Deno.permissions.request({ name: "write", path: dir }),
    ]);

    if (allowRead.state !== "granted" || allowWrite.state !== "granted") {
      throw new Error(`Permission to read/write to "${dir}" not granted.`);
    }

    const embed = await import("./public.json", { with: { type: "json" } })
      .then(({ default: main }) => main);

    const ui = Uint8Array.from(embed["index.html"]);
    const { invokeAction } = bootActions({ dir: join(dir) });

    Deno.serve({
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

      return new Response(ui, {
        headers: { "content-type": "text/html" },
        status: 200,
      });
    });
  });

await new Command()
  .name("denotag")
  .description("Tag audio files")
  .version("4.5.0")
  .default("help")
  .command("tag", tag).alias("t")
  .command("completions", new CompletionsCommand())
  .command("help", new HelpCommand())
  .parse(Deno.args);
