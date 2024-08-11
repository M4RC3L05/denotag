import type { FunctionalComponent } from "preact";
import { FilesTableListFragment } from "../fragments/files-table-list.tsx";

export const MainPage: FunctionalComponent<{ files: string[] }> = (
  { files },
) => {
  return (
    <>
      <div
        id="show-music-dialog"
        class="backdrop-dialog hidden"
      >
        <dialog>
        </dialog>
      </div>
      <header style={{ paddingTop: "32px" }}>
        <button
          style={{ marginRight: "8px" }}
          hx-get="/fragments/music-files-table-list?action=refresh"
          hx-target="#fragments-music-files-table-list-target"
        >
          Refresh
        </button>
        <input
          name="search"
          placeholder="Search..."
          hx-get="/fragments/music-files-table-list?action=search"
          hx-trigger="input changed delay:250ms, search"
          hx-target="#fragments-music-files-table-list-target"
        />
      </header>
      <hr />
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="fragments-music-files-table-list-target">
          <FilesTableListFragment files={files} />
        </tbody>
      </table>
    </>
  );
};
