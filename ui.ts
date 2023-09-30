import { Row, Table } from "./deps.ts";
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
          collectionName,
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
          trackName,
          collectionName,
          collectionArtistName ?? artistName,
          imgData ?? "",
          releaseDate,
          primaryGenreName,
          `${trackNumber}/${trackCount}`,
        ]).border()
      ),
    );
};
