import type { FunctionalComponent, TargetedSubmitEvent } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { withIsland } from "../core/island.tsx";

type Result = {
  wrapperType: string;
  kind: string;
  artistId: number;
  collectionId: number;
  trackId: number;
  artistName: string;
  collectionName: string;
  collectionArtistName: string;
  trackName: string;
  collectionCensoredName: string;
  trackCensoredName: string;
  artistViewUrl: string;
  collectionViewUrl: string;
  trackViewUrl: string;
  previewUrl?: string;
  artworkUrl30: string;
  artworkUrl60: string;
  artworkUrl100: string;
  collectionPrice?: number;
  trackPrice?: number;
  releaseDate?: string;
  collectionExplicitness: string;
  trackExplicitness: string;
  discCount: number;
  discNumber: number;
  trackCount: number;
  trackNumber: number;
  trackTimeMillis: number;
  country: string;
  currency: string;
  primaryGenreName: string;
  isStreamable: boolean;
};

const SearchTags: FunctionalComponent = () => {
  const [searchTags, setSearchTags] = useState<
    Array<Result>
  >(
    [],
  );
  const tagFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    tagFormRef.current = document.querySelector(
      "form#tag-form",
    ) as HTMLFormElement;
  }, []);

  const onSubmit = useCallback(
    (event: TargetedSubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      const payload = new FormData(event.target as HTMLFormElement);

      const url = new URL("https://itunes.apple.com/search");
      url.searchParams.set("media", "music");
      url.searchParams.set("entity", "song");
      url.searchParams.set("sort", "recent");
      url.searchParams.set("country", "us");
      url.searchParams.set("limit", "20");
      url.searchParams.set("term", payload.get("q")!.toString());

      fetch(url)
        .then((response) => response.json())
        .then(({ results }) => {
          setSearchTags(results);
        })
        .catch(() => {});
    },
    [setSearchTags],
  );

  return (
    <>
      <form
        onSubmit={onSubmit}
        style={{ position: "sticky", top: 0, zIndex: 1 }}
      >
        <input
          style={{ width: "100%" }}
          type="search"
          name="q"
          placeholder="Search"
        />
      </form>
      {searchTags.map((metadata) => (
        <div
          onClick={() => {
            if (!tagFormRef.current) return;

            const values = {
              albumArtist: metadata.collectionArtistName ??
                metadata.artistName,
              album:
                `${metadata.collectionName} // ${metadata.collectionCensoredName}`,
              title: `${metadata.trackName} // ${metadata.trackCensoredName}`,
              year: metadata.releaseDate
                ? String(
                  new Date(metadata.releaseDate as string).getFullYear(),
                )
                : undefined,
              artist: metadata.artistName,
              genre: metadata.primaryGenreName,
              track: String(metadata.trackNumber),
              trackCount: String(metadata.trackCount),
              disc: String(metadata.discNumber),
              discCount: String(metadata.discCount),
            };

            for (const [key, value] of Object.entries(values)) {
              const ele = tagFormRef.current.elements.namedItem(key);

              if (ele && value) {
                (ele as HTMLInputElement).value = value;
              }
            }

            const cover = metadata.artworkUrl100.replace(
              "100x100bb",
              "1200x1200bb",
            );
            const coverInput = tagFormRef.current.elements.namedItem(
              "cover",
            ) as HTMLInputElement;

            if (coverInput) {
              fetch(cover)
                .then((response) => response.blob())
                .then((blob) => {
                  const file = new File([blob], "cover.jpg", {
                    type: blob.type,
                  });
                  const dt = new DataTransfer();

                  dt.items.add(file);

                  coverInput.files = dt.files;
                  coverInput.dispatchEvent(
                    new Event("change", { bubbles: true, cancelable: true }),
                  );
                }).catch(() => {});
            }
          }}
          style={{ cursor: "pointer" }}
          key={`${metadata.artistId}@@${metadata.collectionId}@@${metadata.trackId}`}
        >
          {metadata.artworkUrl100 && (
            <img
              src={(metadata.artworkUrl100 as string).replace(
                "100x100bb",
                "256x256bb",
              )}
              style={{ aspectRatio: "1/1" }}
            />
          )}
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Title:</strong> {metadata.trackName} //{" "}
            {metadata.trackCensoredName}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Artist:</strong> {metadata.artistName}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Album:</strong> {metadata.collectionName} //{" "}
            {metadata.collectionCensoredName}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Album Artist:</strong>{" "}
            {metadata.collectionArtistName ?? metadata.artistName}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Genre:</strong> {metadata.primaryGenreName}
          </p>
          {metadata.releaseDate && (
            <p style={{ marginTop: 0, marginBottom: 0 }}>
              <strong>Year:</strong>{" "}
              {new Date(metadata.releaseDate as string).getFullYear()}
            </p>
          )}
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Disc:</strong> {metadata.discNumber}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Disc count:</strong> {metadata.discCount}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Track:</strong> {metadata.trackNumber}
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Track Count:</strong> {metadata.trackCount}
          </p>
          <hr />
        </div>
      ))}
    </>
  );
};

export default withIsland(SearchTags, import.meta.url);
