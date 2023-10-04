import { createRoot, React } from "./deps.js";
import MusicFiles from "./components/music-files.js";
import { alertError, html, makeRequester } from "./utils.js";

const App = () => {
  const [files, setFiles] = React.useState(undefined);

  React.useEffect(() => {
    makeRequester("/api/actions/getFiles").then((files) => {
      setFiles(files);
    }).catch((error) =>
      alertError(error, "Unable to get files from directory")
    );
  }, []);

  return html`
    <${MusicFiles} files=${files ?? []} />
  `;
};

createRoot(document.querySelector("#app")).render(
  html`
    <${React.StrictMode}>
      <${App} />
    </${React.StrictMode}>
  `,
);
