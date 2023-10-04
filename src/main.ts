import {
  Command,
  CompletionsCommand,
  HelpCommand,
  path,
  Webview,
} from "./deps.ts";

const tag = new Command()
  .description("Tag a audio file")
  .option(
    "-d, --dir <directory:string>",
    "The directory with audio files",
    { required: true },
  )
  .option(
    "-p, --httpPort <httpPort:number>",
    "The port the server will listen on",
    { default: 8000 },
  )
  .action(async ({ dir, httpPort }) => {
    if (!(await Deno.stat(dir)).isDirectory) {
      throw new Error(`Dir "${dir}" it not a directory`);
    }

    dir = dir.endsWith(path.SEP) ? dir.slice(0, dir.length - 1) : dir;

    const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
      type: "module",
    });

    await new Promise<void>((resolve) => {
      worker.onmessage = (e) => {
        if (e.data === "init") {
          worker.postMessage({ dir, httpPort });
        }
        if (e.data === "ok") {
          resolve();
        }
      };
    });

    const webview = new Webview(true);

    webview.navigate(`http://127.0.0.1:${httpPort}`);
    webview.run();

    webview.destroy();
    worker.terminate();
  });

await new Command()
  .name("denotag")
  .description("Tag audio files")
  .version("2.0.0")
  .default("help")
  .command("tag", tag).alias("t")
  .command("completions", new CompletionsCommand())
  .command("help", new HelpCommand())
  .parse(Deno.args);
