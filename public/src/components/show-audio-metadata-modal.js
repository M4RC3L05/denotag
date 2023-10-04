import { Image, Modal, React } from "../deps.js";
import { alertError, html, makeRequester } from "../utils.js";

const ShowAudioFileMetadataModal = ({ file, show, handleClose }) => {
  const [metadata, setMetadata] = React.useState(undefined);

  React.useEffect(() => {
    if (!show || !file || typeof metadata === "object") return;

    makeRequester("/api/actions/getMusicFileMetadata", {
      body: JSON.stringify({ path: file }),
      method: "POST",
      headers: { "content-type": "application/json" },
    })
      .then((x) => {
        if (metadata) return;

        setMetadata(x);
      })
      .catch((error) => {
        alertError(error, "Could not get metadata");

        if (metadata) return;

        setMetadata({});
      });
  }, [show, metadata, file]);

  const info = React.useMemo(
    () =>
      Object.entries(metadata ?? {}).filter(([k]) => k !== "cover").map((
        [key, value],
        i,
      ) =>
        html`<p key=${i}><strong>${key.toUpperCase()}:</strong> ${value}</p>`
      ),
    [metadata],
  );

  return html`
    <${Modal}
      show=${show}
      onHide=${handleClose}
      centered
      scrollable
      onExited=${() => setMetadata(undefined)}
    >
      <${Modal.Header} closeButton>
        <${Modal.Title}>${file}<//>
      <//>
      <${Modal.Body}>
        ${
    metadata?.cover
      ? html`<${Image} src=${metadata.cover} fluid />`
      : html`<p>No cover to show</p>`
  }
        <br /> <br />
        ${(info?.length ?? 0) > 0 ? info : html`<p>No metdata to show</p>`}
      <//>
    <//>
  `;
};

export default ShowAudioFileMetadataModal;
