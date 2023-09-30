import { ItunesMusicSearch } from "./types.ts";

export const getFileMetadata = async (pluginDir: string, path: string) => {
  const cmd = new Deno.Command(`${pluginDir}/opustags`, {
    args: [path],
    cwd: Deno.cwd(),
  });

  const { code, stderr, stdout, success } = await cmd.output();

  const decodedStdout = new TextDecoder().decode(stdout);
  const decodedStderr = new TextDecoder().decode(stderr);

  if (!success) {
    throw new Error("Could not get file metadata", {
      cause: { code, stdout: decodedStdout, stderr: decodedStderr },
    });
  }

  const tags = Object.fromEntries(
    decodedStdout.split("\n").map((line) =>
      line.split("=").map((v, i) => i === 0 ? v.toUpperCase() : v)
    ),
  ) as Record<string, string>;

  return tags;
};

export const setMetadata = async (
  pluginDir: string,
  filePath: string,
  metadata: ItunesMusicSearch,
  coverPath?: string,
) => {
  const cmd = new Deno.Command(`${pluginDir}/opustags`, {
    args: [
      "-s",
      `ALBUM=${metadata.collectionName}`,
      "-s",
      `YEAR=${new Date(metadata.releaseDate).getFullYear()}`,
      "-s",
      `DATE=${new Date(metadata.releaseDate).getFullYear()}-${
        ("0" + (new Date(metadata.releaseDate).getMonth() + 1)).slice(-2)
      }-${("0" + new Date(metadata.releaseDate).getDate()).slice(-2)}`,
      "-s",
      `ARTIST=${metadata.artistName}`,
      "-s",
      `TITLE=${metadata.trackName}`,
      "-s",
      `TRACKNUMBER=${metadata.trackNumber}/${metadata.trackCount}`,
      "-s",
      `GENRE=${metadata.primaryGenreName}`,
      "-s",
      `ALBUMARTIST=${metadata.collectionArtistName ?? metadata.artistName}`,
      ...(coverPath ? ["--set-cover", coverPath] : []),
      "-i",
      filePath,
    ],
    cwd: Deno.cwd(),
  });

  const { code, stderr, stdout, success } = await cmd.output();

  const decodedStdout = new TextDecoder().decode(stdout);
  const decodedStderr = new TextDecoder().decode(stderr);

  if (!success) {
    throw new Error("Could not set file metadata", {
      cause: { code, stdout: decodedStdout, stderr: decodedStderr },
    });
  }
};
