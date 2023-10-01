export const resolveItunesSearchUrl = (
  artist: string,
  title: string,
  limit: number,
) => {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("sort", "recent");
  url.searchParams.set("country", "us");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("term", `${artist} ${title}`);

  return url.toString();
};
