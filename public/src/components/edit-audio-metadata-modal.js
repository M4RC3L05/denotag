import { Col, Container, Modal, React, Row } from "../deps.js";
import { alertError, html, makeRequester } from "../utils.js";
import EditAudioMetadataForm from "./edit-audio-metdata-form.js";
import RemoteAudioInfo from "./remote-audio-info.js";

const EditAudioFileMetadataModal = ({ file, show, handleClose }) => {
  const [metadata, setMetadata] = React.useState(undefined);

  const fetchMetadata = () => {
    makeRequester("/api/actions/getMusicFileMetadata", {
      body: JSON.stringify({ path: file }),
      method: "POST",
      headers: { "content-type": "application/json" },
    })
      .then((x) => {
        if (metadata) return;

        setMetadata(x);
      }).catch((error) => {
        alertError(error, "Could not get metadata");

        if (metadata) return;

        setMetadata({});
      });
  };

  React.useEffect(() => {
    if (!show || !file) return;

    fetchMetadata();
  }, [show, metadata, file]);

  const onRemoteSelect = (data) => {
    fetch(data.cover).then((r) => r.blob())
      .then((b) => {
        const reader = new FileReader();
        reader.readAsDataURL(b);
        reader.onloadend = () => {
          setMetadata({ ...data, cover: reader.result });
        };
      });
  };

  return html`
    <${Modal}
      show=${show}
      onHide=${handleClose}
      centered
      fullscreen
      onExited=${() => setMetadata(undefined)}
    >
      <${Modal.Header} closeButton>
        <${Modal.Title}>Edit metadata of ${file}<//>
      <//>

      <${Modal.Body}>
        <${Container} fluid style=${{ height: "100%" }}>
          <${Row} style=${{ height: "100%" }}>
            <${Col} style=${{ maxHeight: "100%", overflow: "hidden scroll" }}>
              <${EditAudioMetadataForm}
                file=${file}
                metadata=${metadata}
                onTagged=${fetchMetadata}
              />
            <//>

            <${Col} style=${{ maxHeight: "100%", overflow: "hidden scroll" }}>
              <${RemoteAudioInfo} onSelect=${onRemoteSelect} />
            <//>
          <//>
        <//>
      <//>
    <//>
  `;
};

export default EditAudioFileMetadataModal;
