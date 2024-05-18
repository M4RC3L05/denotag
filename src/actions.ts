import { ByteVector, File, OggTag, PictureType } from "node-taglib-sharp";
import { join } from "@std/path";
import { decodeBase64 } from "@std/encoding/base64";

class ActionError extends Error {
  toJSON() {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack?.split("\n"),
      cause: this.cause instanceof Error
        ? {
          message: this.cause.message,
          name: this.cause.name,
          stack: this.cause.stack?.split("\n"),
        }
        : this.cause,
    };
  }
}

const actionErrorMapper =
  // deno-lint-ignore no-explicit-any
  <F extends (...args: any[]) => any>(fn: F) =>
  async (
    ...args: Parameters<typeof fn>
  ): Promise<{ data: ReturnType<typeof fn> } | { error: unknown }> => {
    try {
      return { data: await fn(...args) };
    } catch (error) {
      return {
        error: new ActionError(`Error running action "${fn.name}"`, {
          cause: error,
        }),
      };
    }
  };

const getFiles = (dir: string) => () => {
  const result = [];

  for (const file of Deno.readDirSync(dir)) {
    result.push(join(dir, file.name));
  }

  return result.sort((a, b) => a.localeCompare(b));
};

const getMusicFileMetadata = ({ path }: { path: string }) => {
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

const setMusicFileMetadata = (
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
};

export const bootActions = (data: { dir: string }) => {
  const callMap = {
    getFiles: actionErrorMapper(getFiles(data.dir)),
    getMusicFileMetadata: actionErrorMapper(
      getMusicFileMetadata,
    ),
    setMusicFileMetadata: actionErrorMapper(
      setMusicFileMetadata,
    ),
  };

  type CallMap = typeof callMap;

  const invokeAction = async <K extends keyof CallMap>(
    callName: K,
    ...args: Parameters<CallMap[K]>
  ): Promise<{ data: ReturnType<CallMap[K]> } | { error: ActionError }> => {
    if (!(callName in callMap)) {
      return { error: new ActionError(`Call "${callName}" does not exists`) };
    }

    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    // deno-lint-ignore no-explicit-any
    return await callMap[callName](...args) as any as Promise<
      { data: ReturnType<CallMap[K]> } | { error: ActionError }
    >;
  };

  return { invokeAction };
};
