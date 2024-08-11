import { Command, CompletionsCommand, HelpCommand } from "cliffy";
import { bootActions } from "./actions.ts";
import { join } from "@std/path";

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

    const embed = await import("./public.json", { with: { type: "json" } })
      .then(({ default: main }) => main);

    const ui = Uint8Array.from(embed["index.html"]);
    const { invokeAction } = bootActions({ dir: join(dir) });

    Deno.serve(async (request) => {
      const { pathname } = new URL(request.url);

      if (request.method === "POST" && pathname.startsWith("/call")) {
        const [_, callName] = pathname.slice(1).split("/");

        const hasContent = (request.headers.has("content-length") &&
          request.headers.get("content-length") !== "0") ||
          (request.headers.has("content-type") &&
            request.headers.get("content-type")?.includes("application/json"));

        const args = hasContent ? await request.json() : [];

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
  .version("4.1.0")
  .default("help")
  .command("tag", tag).alias("t")
  .command("completions", new CompletionsCommand())
  .command("help", new HelpCommand())
  .parse(Deno.args);
