import {
  ByteVector,
  decodeBase64,
  File,
  join,
  OggTag,
  PictureType,
} from "./deps.ts";

export const getFiles = async (dir: string) => {
  const result = [];

  for await (const file of Deno.readDir(dir)) {
    result.push(join(dir, file.name));
  }

  return result.sort((a, b) => a.localeCompare(b));
};

export const getMusicFileMetadata = ({ path }: { path: string }) => {
  const file = File.createFromPath(path);

  const cover = file.tag.pictures.find((p) =>
    p.type === PictureType.FrontCover
  );

  const data = {
    albumArtist: file.tag.firstAlbumArtist,
    album: file.tag.album,
    title: file.tag.title,
    year: file.tag.year,
    date: file.tag instanceof OggTag
      ? file.tag.comments[0]?.getField?.("DATE")?.[0]
      : undefined,
    artist: file.tag.firstPerformer,
    genre: file.tag.firstGenre,
    cover: cover
      ? `data:${cover.mimeType};base64,${cover.data.toBase64String()}`
      : undefined,
    track: file.tag.track,
    trackCount: file.tag.trackCount,
    disc: file.tag.disc,
    discCount: file.tag.discCount,
  };

  file.dispose();

  return data;
};

export const setMusicFileMetadata = (
  // deno-lint-ignore no-explicit-any
  { path, metadata }: { path: string; metadata: Record<string, any> },
) => {
  const file = File.createFromPath(path);

  if (metadata.album) file.tag.album = metadata.album;
  if (metadata.year) file.tag.year = metadata.year;

  if (metadata.date) {
    if (file.tag instanceof OggTag) {
      file.tag.comments?.[0]?.setFieldAsStrings(
        "DATE",
        metadata.date,
      );
    }
  }

  if (metadata.albumArtist) {
    file.tag.albumArtists = [metadata.albumArtist];
  }
  if (metadata.genre) file.tag.genres = [metadata.genre];
  if (metadata.artist) file.tag.performers = [metadata.artist];
  if (metadata.title) file.tag.title = metadata.title;
  if (metadata.track) file.tag.track = metadata.track;
  if (metadata.trackCount) file.tag.trackCount = metadata.trackCount;
  if (metadata.disc) file.tag.disc = metadata.disc;
  if (metadata.discCount) file.tag.discCount = metadata.discCount;

  if (metadata.cover) {
    const mimeType = metadata.cover.slice(
      metadata.cover.indexOf(":") + 1,
      metadata.cover.indexOf(";"),
    );
    const data = decodeBase64(metadata.cover.slice(
      metadata.cover.indexOf(",") + 1,
    ));

    file.tag.pictures = [{
      data: ByteVector.fromByteArray(data),
      description: "",
      filename: "",
      mimeType: mimeType,
      type: PictureType.FrontCover,
    }];
  }

  file.save();

  return;
};
