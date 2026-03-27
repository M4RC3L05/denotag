import { ByteVector, File, PictureType } from "node-taglib-sharp";
import { allExtensions } from "@std/media-types";
import { walk } from "@std/fs";

// deno-lint-ignore ban-ts-comment
// @ts-expect-error
const supportedMimeTypes = File._fileTypes as { [mimeType: string]: boolean };
const supportedFileExtensions = Array.from(
  new Set(
    Object.keys(supportedMimeTypes)
      .flatMap((x) => allExtensions(x))
      .filter((x) => typeof x === "string"),
  ),
);

async function* filesGen(
  dir: string,
  options?: { where?: { name?: string } },
) {
  for await (
    const file of walk(dir, {
      includeDirs: false,
      includeFiles: true,
      includeSymlinks: false,
      followSymlinks: false,
      exts: supportedFileExtensions,
    })
  ) {
    if (!file.isFile) continue;

    if (options?.where) {
      if (options.where.name) {
        const matchName = file.path.toLowerCase().includes(
          options.where.name.toLowerCase(),
        );

        if (!matchName) continue;
      }
    }

    yield file.path;
  }
}

export const getFiles = async (
  dir: string,
  options?: { where?: { name?: string }; order?: { name?: "asc" | "desc" } },
) => {
  const files = await Array.fromAsync(filesGen(dir, options));

  if (options?.order) {
    if (options.order.name) {
      const { name } = options.order;

      return files.sort((a, b) =>
        name === "asc" ? a.localeCompare(b) : b.localeCompare(a)
      );
    }
  }

  return files;
};

export type AudioTags = {
  albumArtist: string | undefined;
  album: string | undefined;
  title: string | undefined;
  year: number | undefined;
  artist: string | undefined;
  genre: string | undefined;
  cover: string | undefined;
  track: number | undefined;
  trackCount: number | undefined;
  disc: number | undefined;
  discCount: number | undefined;
};

export const getMusicFileMetadata = ({ path }: { path: string }) => {
  const file = File.createFromPath(path);

  const cover = file.tag.pictures.find((p) =>
    p.type === PictureType.FrontCover
  );

  const data: AudioTags = {
    albumArtist: file.tag.firstAlbumArtist,
    album: file.tag.album,
    title: file.tag.title,
    year: file.tag.year,
    artist: file.tag.firstPerformer,
    genre: file.tag.firstGenre,
    cover: cover && cover.data.length > 0
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

export type SetMusicFileMetadataPayload = Omit<Partial<AudioTags>, "cover"> & {
  cover?: { data: Uint8Array; mimetype: string };
};

export const setMusicFileMetadata = (
  { path, metadata }: {
    path: string;
    metadata: SetMusicFileMetadataPayload;
  },
) => {
  const file = File.createFromPath(path);

  if (metadata.album) file.tag.album = metadata.album;
  if (metadata.year) file.tag.year = Number(metadata.year);

  if (metadata.albumArtist) {
    file.tag.albumArtists = [metadata.albumArtist];
  }
  if (metadata.genre) file.tag.genres = [metadata.genre];
  if (metadata.artist) file.tag.performers = [metadata.artist];
  if (metadata.title) file.tag.title = metadata.title;
  if (metadata.track) file.tag.track = Number(metadata.track);
  if (metadata.trackCount) file.tag.trackCount = Number(metadata.trackCount);
  if (metadata.disc) file.tag.disc = Number(metadata.disc);
  if (metadata.discCount) file.tag.discCount = Number(metadata.discCount);

  if (metadata.cover && metadata.cover.data.length > 0) {
    file.tag.pictures = [{
      data: ByteVector.fromByteArray(metadata.cover.data),
      description: "",
      filename: "",
      mimeType: metadata.cover.mimetype,
      type: PictureType.FrontCover,
    }];
  }

  file.save();
  file.dispose();
};
