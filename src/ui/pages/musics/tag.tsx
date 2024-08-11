import type { FunctionalComponent } from "preact";
import { MusicTagSectionFragment } from "../../fragments/music-tag-section.tsx";

export const MusicsTagPage: FunctionalComponent<
  { file: string; data: Record<string, string | number | undefined> }
> = (
  { file, data },
) => {
  return (
    <>
      <header>
        <h2>Tag {file}</h2>
      </header>

      <main style={{ display: "flex" }}>
        <div
          style={{ flex: "1", width: "50%", marginRight: "12px" }}
          id="music-tag-section-fragment-target"
        >
          <MusicTagSectionFragment data={data} file={file} />
        </div>
        <div style={{ flex: "1", width: "50%" }}>
          <p>search</p>
        </div>
      </main>
    </>
  );
};
