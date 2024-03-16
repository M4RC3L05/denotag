export const getFiles = () =>
  // deno-lint-ignore no-explicit-any
  (globalThis as any).getFiles() as Promise<string[]>;

export const getMusicFileMetadata = ({ path }: { path: string }) =>
  // deno-lint-ignore no-explicit-any
  (globalThis as any).getMusicFileMetadata({ path }) as Promise<{
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
  }>;

export const setMusicFileMetadata = (
  // deno-lint-ignore no-explicit-any
  { path, metadata }: { path: string; metadata: Record<string, any> },
) =>
  // deno-lint-ignore no-explicit-any
  (globalThis as any).setMusicFileMetadata({ path, metadata }) as Promise<void>;
