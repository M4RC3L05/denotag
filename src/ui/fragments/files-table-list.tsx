import type { FunctionalComponent } from "preact";

const MusicFileRow: FunctionalComponent<{ file: string; id: number }> = (
  { file, id },
) => {
  return (
    <tr>
      <td>{id}</td>
      <td>{file}</td>
      <td>
        <button
          hx-swap="none"
          hx-get={`/fragments/music-info-dialog?file=${
            encodeURIComponent(file)
          }`}
          style={{ marginRight: "8px" }}
        >
          Info
        </button>
        <a href={`/musics/${encodeURIComponent(file)}/tag`}>Tag</a>
      </td>
    </tr>
  );
};

export const FilesTableListFragment: FunctionalComponent<{ files: string[] }> =
  ({ files }) => {
    return (
      <>
        {files.map((f, i) => <MusicFileRow file={f} id={i} />)}
      </>
    );
  };
