import type { FunctionalComponent } from "preact";

type IndexPageProps = {
  files: string[];
  q: string;
};

export const Index: FunctionalComponent<IndexPageProps> = ({ files, q }) => {
  return (
    <>
      <header>
        <div
          style={{
            display: "flex",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <form
            method="get"
            action="/"
            style={{ width: "100%", marginLeft: "2rem" }}
          >
            <input
              style={{ width: "100%", margin: 0 }}
              type="search"
              placeholder="Search"
              name="q"
              value={q}
            />
          </form>
        </div>
      </header>
      <main>
        <table style={{ minWidth: "100%" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>View</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr>
                <td>
                  {file}
                </td>
                <td style={{ textAlign: "center" }}>
                  <a
                    href={`/audio?path=${encodeURIComponent(file)}`}
                    class="button"
                    style={{ margin: 0 }}
                  >
                    View
                  </a>
                </td>
                <td style={{ textAlign: "center" }}>
                  <a
                    href={`/tag?path=${encodeURIComponent(file)}`}
                    class="button"
                    style={{ margin: 0 }}
                  >
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
};
