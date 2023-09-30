export const resolveItunesSearchUrl = (artist: string, title: string) => {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", "song");
  url.searchParams.set("sort", "recent");
  url.searchParams.set("country", "us");
  url.searchParams.set("limit", "5");
  url.searchParams.set("term", `${artist} ${title}`);

  return url.toString();
};
