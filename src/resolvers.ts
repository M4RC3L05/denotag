import { base64, Buffer } from "./deps.ts";

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

export const resolveCoverFromMetadata = (metadata: Record<string, string>) => {
  const cover = metadata["METADATA_BLOCK_PICTURE"] ??
    metadata["metadata_block_picture"];

  if (!cover) return;

  const decoded = Buffer.from(base64.decodeBase64(cover));
  let offset = 0;
  // get type
  offset += 4;
  // get mime length
  const mimeLength = decoded.readUInt32BE(offset);
  offset += 4 + mimeLength; // get mime
  // get desc length
  const descLength = decoded.readUInt32BE(offset);
  offset += 4 + descLength; // get desc
  // get width
  offset += 4;
  // get height
  offset += 4;
  // get color depth
  offset += 4;
  // get n color used
  offset += 4;
  // get picture length
  const pictureLength = decoded.readUInt32BE(offset);
  offset += 4;
  // get picture data

  return base64.decodeBase64(cover).slice(offset, offset + pictureLength);
};
