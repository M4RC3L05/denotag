import { useCallback, useEffect, useMemo, useState } from "./../deps.ts";
import { Image, Modal } from "react-bootstrap";
import Alert, { type AlertProps } from "./alert.tsx";
import { getMusicFileMetadata } from "../actions.ts";

type ShowAudioFileMetadataModalProps = {
  file: string;
  show: boolean;
  handleClose: () => unknown;
};

const ShowAudioFileMetadataModal: React.FC<ShowAudioFileMetadataModalProps> = (
  { file, show, handleClose },
) => {
  const [metadata, setMetadata] = useState<
    Awaited<ReturnType<typeof getMusicFileMetadata>> | undefined
  >(undefined);
  const [alertInfo, setAlertInfo] = useState<AlertProps>({
    show: false,
    title: "",
    handleClose: useCallback(() => {
      setAlertInfo((ps) => ({ ...ps, show: false }));
    }, []),
  });

  useEffect(() => {
    if (!show || !file || typeof metadata === "object") return;

    getMusicFileMetadata({ path: file })
      .then((result) => {
        if (metadata) return;

        setMetadata(result);
      })
      .catch((error) => {
        setAlertInfo((ps) => ({
          ...ps,
          show: true,
          title: "Error",
          error,
          message: "Unable to get file metadata",
        }));

        if (metadata) return;

        setMetadata(undefined);
        handleClose();
      });
  }, [show, metadata, file]);

  const info = useMemo(
    () =>
      Object.entries(metadata ?? {}).filter(([k]) => k !== "cover").map((
        [key, value],
        i,
      ) => (
        <p key={i}>
          <strong>{key.toUpperCase()}:</strong> {value as string}
        </p>
      )),
    [metadata],
  );

  return (
    <>
      <Alert {...alertInfo} />
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        centered
        scrollable
        onExited={() => setMetadata(undefined)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{file}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {metadata?.cover
            ? <Image src={metadata.cover as string} fluid />
            : <p>No cover to show</p>}
          <br /> <br />
          {(info?.length ?? 0) > 0 ? info : <p>No metdata to show</p>}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShowAudioFileMetadataModal;
