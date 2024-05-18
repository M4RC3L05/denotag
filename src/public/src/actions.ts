// deno-lint-ignore no-explicit-any
const call = <R>(callName: string, ...args: any[]) =>
  fetch(`/call/${callName}`, {
    method: "POST",
    body: args.length > 0 ? JSON.stringify(args) : undefined,
    headers: args.length > 0
      ? { "content-type": "application/json" }
      : undefined,
  }).then((x) => x.json()).then(({ data, error }) => {
    if (error) throw error;
    return data;
  }) as Promise<R>;

export const getFiles = () => call<string[]>("getFiles");

export const getMusicFileMetadata = ({ path }: { path: string }) =>
  call<{
    albumArtist?: string;
    album?: string;
    title?: string;
    year?: number;
    date?: string;
    artist?: string;
    genre?: string;
    cover?: string;
    track?: number;
    trackCount?: number;
    disc?: number;
    discCount?: number;
  }>("getMusicFileMetadata", { path });

export const setMusicFileMetadata = (
  // deno-lint-ignore no-explicit-any
  { path, metadata }: { path: string; metadata: Record<string, any> },
) => call<void>("setMusicFileMetadata", { path, metadata });
