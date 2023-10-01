import { File } from "./deps.ts";
import { resolveItunesSearchUrl } from "./resolvers.ts";
import { ItunesMusicSearch, ItunesSearchResponse } from "./types.ts";

export const searchMusicInfo = async (file: File, limit: number) => {
  return await fetch(
    resolveItunesSearchUrl(file.tag.firstPerformer, file.tag.title, limit),
  )
    .then(
      (r) => {
        if (!r.ok) {
          throw new Error("Unable to fetch remote metdata", {
            cause: r.status,
          });
        }

        return r.json();
      },
    ) as ItunesSearchResponse<ItunesMusicSearch>;
};

export const downloadCover = async (url: string) => {
  const randId = crypto.randomUUID();
  const destPath = `/tmp/cover_${randId}`;
  const cover = await fetch(url).then((r) => {
    if (!r.ok) {
      throw new Error("Could not fetch cover", { cause: r.status });
    }

    return r.arrayBuffer();
  });

  await Deno.writeFile(destPath, new Uint8Array(cover));

  return { destPath, cleanup: async () => await Deno.remove(destPath) };
};
