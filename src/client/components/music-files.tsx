import { useCallback, useState } from "preact/hooks";
import { Button, Table } from "react-bootstrap";
import EditAudioFileMetadataModal from "./edit-audio-metadata-modal.tsx";
import ShowAudioFileMetadataModal from "./show-audio-metadata-modal.tsx";

type MusicFileRowProps = {
  file: string;
  id: number;
  onInfo: () => unknown;
  onEdit: () => unknown;
};

const MusicFileRow = ({ file, id, onInfo, onEdit }: MusicFileRowProps) => {
  return (
    <tr>
      <td>{id}</td>
      <td>{file}</td>
      <td>
        <Button variant="primary" onClick={() => onInfo()}>
          Info
        </Button>
      </td>
      <td>
        <Button variant="warning" onClick={() => onEdit()}>
          Edit
        </Button>
      </td>
    </tr>
  );
};

type MusicFilesProps = {
  files: string[];
};

const MusicFiles = ({ files }: MusicFilesProps) => {
  const [file, setFile] = useState<string | undefined>(undefined);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const onInfo = useCallback((f: string) => {
    setFile(f);
    setShowInfoModal(true);
    setShowEditModal(false);
  }, []);

  const onEdit = useCallback((f: string) => {
    setFile(f);
    setShowInfoModal(false);
    setShowEditModal(true);
  }, []);

  return (
    <>
      <ShowAudioFileMetadataModal
        file={file!}
        show={showInfoModal}
        handleClose={() => setShowInfoModal(false)}
      />

      <EditAudioFileMetadataModal
        file={file!}
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
      />

      <Table striped>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Info</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f, i) => (
            <MusicFileRow
              file={f}
              key={`${i}:${f}`}
              id={i}
              onInfo={() => onInfo(f)}
              onEdit={() => onEdit(f)}
            />
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default MusicFiles;
