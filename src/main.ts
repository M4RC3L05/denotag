import { Command, File, getImageStrings, Number } from "./deps.ts";
import { log } from "./logger.ts";
import { setMetadata } from "./cmds.ts";
import { downloadCover, searchMusicInfo } from "./requests.ts";
import {
  chooseAlbumName,
  chooseTitle,
  fillRequiredMetadata,
  getFileMetatdataTable,
  getRemoteMetdataTable,
} from "./ui.ts";

await new Command()
  .name("denotag")
  .description("Music tagger")
  .version("0.4.0")
  .option(
    "-f, --file <filePath:string>",
    "The audio file",
    { required: true },
  )
  .action(async ({ file }) => {
    const result = await Deno.stat(file)
      .catch((error) => {
        log.error(`Could not stat "${file}"`, error);
        Deno.exit(1);
      });

    if (!result.isFile) {
      log.error(`The path "${file}" is not a file`);
      Deno.exit(1);
    }

    log.info(`Getting tags from file "${file}"`);

    const audioFile = File.createFromPath(file);

    log.info("Displaying current file tags");

    (await getFileMetatdataTable(audioFile)).render();

    await fillRequiredMetadata(audioFile);

    log.info(`Getting remote tags for file "${file}"`);

    const res = await searchMusicInfo(audioFile)
      .catch((error) => {
        log.error("Something went wrong while fetching music metadata", error);
        Deno.exit(1);
      });

    if (res.resultCount <= 0) {
      log.warning("No remote metadata found");
      Deno.exit(0);
    }

    res.results = await Promise.all(
      res.results.map(async (result) => ({
        ...result,
        imgData: (await getImageStrings({
          path: result.artworkUrl100.replace("100x100bb", "1200x1200bb"),
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

    await setMetadata(audioFile, selected, cover?.destPath)
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

    log.info("Displaying final file tags");

    const finalAudioFile = File.createFromPath(file);

    (await getFileMetatdataTable(finalAudioFile)).render();

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
