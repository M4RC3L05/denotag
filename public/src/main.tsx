import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import MusicFiles from "./components/music-files.tsx";
import { alertError, makeRequester } from "./utils.ts";

const App = () => {
  const [files, setFiles] = React.useState(undefined);

  useEffect(() => {
    makeRequester("/api/actions/getFiles").then((files) => {
      setFiles(files);
    }).catch((error) =>
      alertError(error, "Unable to get files from directory")
    );
  }, []);

  return <MusicFiles files={files ?? []} />;
};

createRoot(document.querySelector("#app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
