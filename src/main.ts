import { Command, CompletionsCommand, HelpCommand } from "cliffy";
import { router } from "./ui/router.tsx";

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

    Deno.serve({ hostname: "127.0.0.1" }, router({ dir }));
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
