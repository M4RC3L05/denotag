import {
  ByteVector,
  File,
  fileTypeFromFile,
  OggTag,
  PictureType,
} from "./deps.ts";
import { ItunesMusicSearch } from "./types.ts";

export const setMetadata = async (
  file: File,
  metadata: ItunesMusicSearch,
  coverPath?: string,
) => {
  file.tag.album = metadata.collectionName;
  file.tag.year = new Date(metadata.releaseDate).getFullYear();

  if (file.tag instanceof OggTag) {
    file.tag.comments?.[0]?.setFieldAsStrings(
      "DATE",
      `${new Date(metadata.releaseDate).getFullYear()}-${
        ("0" + (new Date(metadata.releaseDate).getMonth() + 1)).slice(-2)
      }-${("0" + new Date(metadata.releaseDate).getDate()).slice(-2)}`,
    );
  }

  file.tag.albumArtists = [
    metadata.collectionArtistName ?? metadata.artistName,
  ];
  file.tag.genres = [metadata.primaryGenreName];
  file.tag.performers = [metadata.artistName];
  file.tag.title = metadata.trackName;
  file.tag.track = metadata.trackNumber;
  file.tag.trackCount = metadata.trackCount;
  file.tag.disc = metadata.discNumber;
  file.tag.discCount = metadata.discCount;

  if (coverPath) {
    const result = await fileTypeFromFile(coverPath);

    if (!result) {
      return;
    }

    file.tag.pictures = [{
      data: ByteVector.fromByteArray(await Deno.readFile(coverPath)),
      description: "",
      filename: "",
      mimeType: result.mime,
      type: PictureType.FrontCover,
    }];
  }

  file.save();
};
