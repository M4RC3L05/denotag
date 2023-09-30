import {
  File,
  getImageStrings,
  Input,
  OggTag,
  Row,
  Select,
  Table,
} from "./deps.ts";
import { log } from "./logger.ts";
import { ItunesMusicSearch } from "./types.ts";

export const getFileMetatdataTable = async (
  file: File,
) => {
  let cover = "";

  if (file.tag.pictures.length > 0) {
    cover = (await getImageStrings({
      rawFile: file.tag.pictures[0]?.data.toByteArray(),
      width: 35,
    }))?.[0];
  }

  return new Table().header(
    Row.from([
      "Album artists",
      "Album",
      "Title",
      "Year",
      "Date",
      "Artist",
      "Genre",
      "Cover",
      "Track number",
      "Track count",
      "Disc number",
      "Disc count",
    ]).border(),
  ).body([
    Row.from([
      file.tag.firstAlbumArtist,
      file.tag.album,
      file.tag.title,
      file.tag.year,
      file.tag instanceof OggTag
        ? file.tag.comments[0]?.getField?.("DATE")?.[0]
        : "",
      file.tag.firstPerformer,
      file.tag.firstGenre,
      cover,
      file.tag.track,
      file.tag.trackCount,
      file.tag.disc,
      file.tag.discCount,
    ]).border(),
  ]);
};

export const getRemoteMetdataTable = (metadata: ItunesMusicSearch[]) => {
  return new Table()
    .header(
      Row.from([
        "id",
        "artist",
        "title",
        "album",
        "albumArtist",
        "cover",
        "date",
        "genre",
        "tracknumber",
      ]).border(),
    )
    .body(
      (metadata as (ItunesMusicSearch & { imgData?: string })[]).map((
        {
          artistName,
          trackName,
          trackCensoredName,
          collectionName,
          collectionCensoredName,
          collectionArtistName,
          imgData,
          releaseDate,
          primaryGenreName,
          trackCount,
          trackNumber,
        },
        i,
      ) =>
        Row.from([
          i,
          artistName,
          `${trackName}\n${trackCensoredName}`,
          `${collectionName}\n${collectionCensoredName}`,
          collectionArtistName ?? artistName,
          imgData ?? "",
          releaseDate,
          primaryGenreName,
          `${trackNumber}/${trackCount}`,
        ]).border()
      ),
    );
};

export const chooseTitle = async (metadata: ItunesMusicSearch) => {
  if (metadata.trackName === metadata.trackCensoredName) {
    return;
  }

  log.info("Censored and uncensored track names differ");

  const selectedTitle = await Select.prompt({
    message: "Pick a track tile",
    options: [
      { name: metadata.trackName, value: metadata.trackName },
      {
        name: metadata.trackCensoredName,
        value: metadata.trackCensoredName,
      },
    ],
  });

  return selectedTitle;
};

export const chooseAlbumName = async (metadata: ItunesMusicSearch) => {
  if (metadata.collectionName === metadata.collectionCensoredName) {
    return;
  }

  log.info("Censored and uncensored track album names differ");

  const selectedTitle = await Select.prompt({
    message: "Pick a track album tile",
    options: [
      { name: metadata.collectionName, value: metadata.collectionName },
      {
        name: metadata.collectionCensoredName,
        value: metadata.collectionCensoredName,
      },
    ],
  });

  return selectedTitle;
};

export const fillRequiredMetadata = async (file: File) => {
  if (file.tag.firstPerformer && file.tag.title) {
    return;
  }

  log.warning("No artist and/or title found on file.");

  const artist = await Input.prompt({
    message: "Artist",
    transform: (s) => s.trim(),
    default: file.tag.firstPerformer ?? undefined,
  });
  const title = await Input.prompt({
    message: "Title",
    transform: (s) => s.trim(),
    validate: (s) => s.trim().length > 0,
    default: file.tag.title ?? undefined,
  });

  if (artist) file.tag.performers = [artist];
  file.tag.title = title;
};
