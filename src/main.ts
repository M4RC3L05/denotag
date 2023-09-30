import { Command, dirname, getImageStrings, Input, Number } from "./deps.ts";
import { log } from "./logger.ts";
import { isFileOgg } from "./utils.ts";
import { getFileMetadata, setMetadata } from "./cmds.ts";
import { downloadCover, searchMusicInfo } from "./requests.ts";
import { chooseAlbumName, chooseTitle, getRemoteMetdataTable } from "./ui.ts";

await new Command()
  .name("denotag")
  .description("OGG Opus music tagger")
  .version("0.2.0")
  .option(
    "-f, --file <filePath:string>",
    "The ogg file",
    { required: true },
  )
  .option(
    "-p, --plugin-dir <pluginDir:string>",
    "The directory with metdata editor binaries",
    { default: dirname(Deno.execPath()) },
  )
  .action(async ({ file, pluginDir }) => {
    const result = await Deno.stat(file)
      .catch((error) => {
        log.error(`Could not stat "${file}"`, error);
        Deno.exit(1);
      });

    if (!result.isFile) {
      log.error(`The path "${file}" is not a file`);
      Deno.exit(1);
    }

    const isOgg = await isFileOgg(file)
      .catch((error) => {
        log.error(`Could not check if file is ogg "${file}"`, error);
        Deno.exit(1);
      });

    if (!isOgg) {
      log.error("File is not a valid ogg file");
      Deno.exit(1);
    }

    log.info(`Getting tags from file "${file}"`);

    const tags = await getFileMetadata(pluginDir, file)
      .catch((error) => {
        log.error("Something went wrong while getting file metadata", error);
        Deno.exit(1);
      });

    if (!tags["ARTIST"] || !tags["TITLE"]) {
      log.warning("No artist and/or title found on file.");

      tags["ARTIST"] = await Input.prompt({
        message: "Artist",
        transform: (s) => s.trim(),
        default: tags["ARTIST"] ?? undefined,
      });
      tags["TITLE"] = await Input.prompt({
        message: "Title",
        transform: (s) => s.trim(),
        validate: (s) => s.trim().length > 0,
        default: tags["TITLE"] ?? undefined,
      });
    }

    log.info(`Getting remote tags for file "${file}"`);

    const res = await searchMusicInfo(tags)
      .catch((error) => {
        log.error("Something went wrong while fetching music metadata", error);
        Deno.exit(1);
      });

    if (res.resultCount <= 0) {
      log.warning("No remote metadata found");
      Deno.exit(0);
    }

    res.results = await Promise.all(
      res.results.map(async (r) => ({
        ...r,
        imgData: (await getImageStrings({
          path: r.artworkUrl100.replace("100x100bb", "1200x1200bb"),
          width: 35,
        }))[0],
      })),
    );

    getRemoteMetdataTable(res.results).render();

    const selectedId = await Number.prompt({
      message: "Choose id:",
      min: 0,
      max: Math.max(0, res.results.length - 1),
    });
    const selected = res.results[selectedId]!;

    const choosedTrackTitle = await chooseTitle(selected);

    if (choosedTrackTitle) {
      selected.trackName = choosedTrackTitle;
      selected.trackCensoredName = choosedTrackTitle;
    }

    const choosedAlbumName = await chooseAlbumName(selected);

    if (choosedAlbumName) {
      selected.collectionName = choosedAlbumName;
      selected.collectionCensoredName = choosedAlbumName;
    }

    const cover = await downloadCover(
      selected.artworkUrl100.replace("100x100bb", "1200x1200bb"),
    ).catch((error) => {
      if (error?.message === "Could not fetch cover") {
        log.warning(
          "Something went wrong while fetching cover, no cover will be used",
          error,
        );
      } else {
        log.error("Something went wrong while fetching cover", error);
        Deno.exit(1);
      }
    });

    log.info(`Setting metadata on file "${file}"`);

    await setMetadata(pluginDir, file, selected, cover?.destPath)
      .catch(async (error) => {
        log.error("Could not set file metadata", error);

        if (cover) {
          await cover.cleanup().catch((error) => {
            log.warning(
              `Could not remove tmp cover image at "${cover.destPath}"`,
              error,
            );
          });
        }

        Deno.exit(1);
      });

    if (cover) {
      await cover.cleanup().catch((error) => {
        log.warning(
          `Could not remove tmp cover image at "${cover.destPath}"`,
          error,
        );
      });
    }

    log.info(`Successfully updated tags on "${file}"`);
  })
  .parse();
