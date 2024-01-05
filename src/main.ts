import {
  Command,
  CompletionsCommand,
  HelpCommand,
  join,
  SizeHint,
  Webview,
} from "./deps.ts";
import * as actions from "./actions.ts";
import embed from "./public.json" assert { type: "json" };

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

    const webview = new Webview(true);

    webview.bind("getFiles", actions.getFiles.bind(null, join(dir)));
    webview.bind("getMusicFileMetadata", actions.getMusicFileMetadata);
    webview.bind("setMusicFileMetadata", actions.setMusicFileMetadata);

    webview.navigate(
      `data:text/html,${
        encodeURIComponent(
          new TextDecoder().decode(Uint8Array.from(embed["index.html"])),
        )
      }`,
    );

    webview.title = "DenoTag";
    webview.size = {
      width: 1280,
      height: 920,
      hint: SizeHint.NONE,
    };

    webview.run();
    webview.destroy();
  });

await new Command()
  .name("denotag")
  .description("Tag audio files")
  .version("2.5.3")
  .default("help")
  .command("tag", tag).alias("t")
  .command("completions", new CompletionsCommand())
  .command("help", new HelpCommand())
  .parse(Deno.args);
