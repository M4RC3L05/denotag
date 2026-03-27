import type { FunctionalComponent } from "preact";
import type { AudioTags } from "../actions.ts";
import SearchTags from "../islands/search-tags.tsx";
import TagCoverWithPreviewInput from "../islands/tag-cover-with-preview-input.tsx";

type TagAudioPageProps = {
  file: string;
  metadata: AudioTags;
};

export const TagAudio: FunctionalComponent<TagAudioPageProps> = (
  { file, metadata },
) => {
  return (
    <>
      <header style={{ paddingBottom: 0 }}>
        <h1>Tagging "{file}"</h1>

        <nav>
          <a href="/">Back</a>
        </nav>
      </header>
      <main
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "start",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            marginRight: "2rem",
            flex: 1,
            width: "100%",
          }}
        >
          <form
            id="tag-form"
            method="POST"
            action="/tag"
            enctype="multipart/form-data"
          >
            <input type="hidden" name="path" value={file} />

            <TagCoverWithPreviewInput metadata={{ cover: metadata.cover }} />

            <div>
              <label for="title">Title:</label>
              <input
                style={{ width: "100%" }}
                id="title"
                name="title"
                value={metadata.title}
                placeholder="Title"
              />
            </div>

            <div>
              <label for="album">Album:</label>
              <input
                style={{ width: "100%" }}
                id="album"
                name="album"
                value={metadata.album}
                placeholder="Album"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                columnGap: ".5rem",
              }}
            >
              <div>
                <label for="artist">Artist:</label>
                <input
                  style={{ width: "100%" }}
                  id="artist"
                  name="artist"
                  value={metadata.artist}
                  placeholder="Artist"
                />
              </div>

              <div>
                <label for="albumArtist">Album artist:</label>
                <input
                  style={{ width: "100%" }}
                  id="albumArtist"
                  name="albumArtist"
                  value={metadata.albumArtist}
                  placeholder="Album artist"
                />
              </div>

              <div>
                <label for="genre">Genre:</label>
                <input
                  style={{ width: "100%" }}
                  id="genre"
                  name="genre"
                  value={metadata.genre}
                  placeholder="Genre"
                />
              </div>

              <div>
                <label for="year">Year:</label>
                <input
                  style={{ width: "100%" }}
                  id="year"
                  name="year"
                  value={metadata.year}
                  placeholder="Year"
                  type="number"
                  min={0}
                />
              </div>

              <div>
                <label for="disc">Disc:</label>
                <input
                  style={{ width: "100%" }}
                  id="disc"
                  name="disc"
                  value={metadata.disc}
                  placeholder="Disc"
                  type="number"
                  min={0}
                />
              </div>

              <div>
                <label for="discCount">Disc count:</label>
                <input
                  style={{ width: "100%" }}
                  id="discCount"
                  name="discCount"
                  value={metadata.discCount}
                  placeholder="Disc count"
                  type="number"
                  min={0}
                />
              </div>

              <div>
                <label for="track">Track:</label>
                <input
                  style={{ width: "100%" }}
                  id="track"
                  name="track"
                  value={metadata.track}
                  placeholder="Track"
                  type="number"
                  min={0}
                />
              </div>

              <div>
                <label for="trackCount">Track count:</label>
                <input
                  style={{ width: "100%" }}
                  id="trackCount"
                  name="trackCount"
                  value={metadata.trackCount}
                  placeholder="Track count"
                  type="number"
                  min={0}
                />
              </div>
            </div>

            <div>
              <button type="submit" style={{ width: "100%" }}>Tag</button>
            </div>
          </form>
        </div>
        <div
          style={{
            flex: 1,
            overflow: "hidden scroll",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          <SearchTags />
        </div>
      </main>
    </>
  );
};
