import { Row, Select, Table } from "./deps.ts";
import { log } from "./logger.ts";
import { ItunesMusicSearch } from "./types.ts";

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
