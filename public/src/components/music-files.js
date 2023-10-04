import { Button, React, Table } from "../deps.js";
import { html } from "../utils.js";
import EditAudioFileMetadataModal from "./edit-audio-metadata-modal.js";
import ShowAudioFileMetadataModal from "./show-audio-metadata-modal.js";

const MusicFileRow = ({ file, id, onInfo, onEdit }) => {
  return html`
    <tr>
      <td>${id}</td>
      <td>${file}</td>
      <td>
        <${Button} variant="primary" onClick=${() => onInfo()}>
          Info
        <//>
      </td>
      <td>
        <${Button} variant="warning" onClick=${() => onEdit()}>
          Edit
        <//>
      </td>
    </tr>
  `;
};

const MusicFiles = ({ files }) => {
  const [file, setFile] = React.useState(undefined);
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);

  const onInfo = React.useCallback((f) => {
    setFile(f);
    setShowInfoModal(true);
    setShowEditModal(false);
  }, []);

  const onEdit = React.useCallback((f) => {
    setFile(f);
    setShowInfoModal(false);
    setShowEditModal(true);
  }, []);

  const rows = React.useMemo(
    () =>
      files.map((f, i) =>
        html`
        <${MusicFileRow}
          file=${f}
          key=${`${i}:${f}`}
          id=${i}
          onInfo=${() => onInfo(f)}
          onEdit=${() => onEdit(f)}
        />`
      ),
    [files],
  );

  return html`
    <${ShowAudioFileMetadataModal}
      file=${file}
      show=${showInfoModal}
      handleClose=${() => setShowInfoModal(false)}
    />

    <${EditAudioFileMetadataModal}
      file=${file}
      show=${showEditModal}
      handleClose=${() => setShowEditModal(false)}
    />

    <${Table}>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Info</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    <//>
  `;
};

export default MusicFiles;
