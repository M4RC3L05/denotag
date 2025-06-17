// deno-lint-ignore no-explicit-any
const call = <R>(callName: string, ...args: any[]) => {
  const init: RequestInit = {
    method: "POST",
    body: args.length > 0
      ? args[0] instanceof FormData ? args[0] : JSON.stringify(args)
      : null,
  };

  if (args.length > 0 && !(args[0] instanceof FormData)) {
    init.headers = { "content-type": "application/json" };
  }

  return fetch(`/call/${callName}`, init).then((x) => x.json()).then(
    ({ data, error }) => {
      if (error) throw error;
      return data;
    },
  ) as Promise<R>;
};

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
  data: FormData,
) => call<void>("setMusicFileMetadata", data);
