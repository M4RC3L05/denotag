import type { FunctionalComponent } from "preact";
import { withIsland } from "../core/island.tsx";
import { useRef } from "preact/hooks";

const TagCoverWithPreviewInput: FunctionalComponent<
  { metadata: { cover: string | undefined } }
> = ({ metadata }) => {
  const previewRef = useRef<HTMLImageElement>(null);

  return (
    <>
      <img
        ref={previewRef}
        src={metadata.cover}
        style={{
          aspectRatio: "1/1",
        }}
      />

      <div>
        <label for="cover">Cover:</label>
        <input
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.item(0);

            if (file && previewRef.current) {
              previewRef.current.src = URL.createObjectURL(file);
            }
          }}
          style={{ width: "100%" }}
          id="cover"
          name="cover"
          placeholder="Cover"
          type="file"
          accept="image/*"
        />
      </div>
    </>
  );
};

export default withIsland(TagCoverWithPreviewInput, import.meta.url);
