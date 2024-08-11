import type { FunctionalComponent } from "preact";

const ShowMetadata = (data: Record<string, unknown>) => {
  return (
    <>
      {data.cover
        ? <img src={data.cover as string} />
        : <p>No cover to show</p>}

      {Object.entries(data).filter(([k]) => k !== "cover").map((
        [key, value],
      ) => (
        <p>
          <strong>{key.toUpperCase()}:</strong> {value as string}
        </p>
      ))}
    </>
  );
};

export const MusicInfoDialogFragment: FunctionalComponent<
  { data: Record<string, unknown>; file: string }
> = ({ data, file }) => {
  return (
    <div
      id="show-music-dialog"
      class="backdrop-dialog show"
      hx-swap-oob="true"
      onclick={"document.getElementById('show-music-dialog').classList.add('hidden');document.getElementById('show-music-dialog').classList.remove('show')"}
    >
      <dialog open onclick={"event.stopPropagation()"}>
        <h2>{file}</h2>

        <main>
          {!data || Object.entries(data).length <= 0
            ? <p>No metadata to show</p>
            : ShowMetadata(data)}
        </main>

        <button
          onclick={"event.stopPropagation();document.getElementById('show-music-dialog').classList.add('hidden');document.getElementById('show-music-dialog').classList.remove('show')"}
        >
          Close
        </button>
      </dialog>
    </div>
  );
};
