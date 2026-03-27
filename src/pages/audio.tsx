import type { FunctionalComponent } from "preact";
import type { AudioTags } from "../actions.ts";

type AudioPageProps = {
  file: string;
  metadata: AudioTags;
};

export const Audio: FunctionalComponent<AudioPageProps> = (
  { file, metadata },
) => {
  return (
    <>
      <header>
        <h1>Viewing "{file}"</h1>

        <nav>
          <a href="/">Back</a>
        </nav>
      </header>
      <main
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "center",
        }}
      >
        <img
          src={metadata.cover}
          style={{
            aspectRatio: "1/1",
            maxWidth: "20rem",
            marginRight: "2rem",
            position: "sticky",
            top: "2rem",
          }}
        />
        <div style={{ width: "100%", height: "100%" }}>
          {metadata.title && (
            <p style={{ marginTop: 0 }}>Title: {metadata.title}</p>
          )}
          {metadata.artist && (
            <p style={{ marginTop: 0 }}>Artist: {metadata.artist}</p>
          )}
          {metadata.album && (
            <p style={{ marginTop: 0 }}>Album: {metadata.album}</p>
          )}
          {metadata.albumArtist && (
            <p style={{ marginTop: 0 }}>Album Artist: {metadata.albumArtist}</p>
          )}

          {metadata.genre && (
            <p style={{ marginTop: 0 }}>Genre: {metadata.genre}</p>
          )}
          {metadata.year && (
            <p style={{ marginTop: 0 }}>Year: {metadata.year}</p>
          )}

          {metadata.disc && (
            <p style={{ marginTop: 0 }}>Disc: {metadata.disc}</p>
          )}
          {metadata.discCount && (
            <p style={{ marginTop: 0 }}>Disc count: {metadata.discCount}</p>
          )}
          {metadata.track && (
            <p style={{ marginTop: 0 }}>Track: {metadata.track}</p>
          )}
          {metadata.trackCount && (
            <p style={{ marginTop: 0 }}>Track Count: {metadata.trackCount}</p>
          )}
        </div>
      </main>
    </>
  );
};
