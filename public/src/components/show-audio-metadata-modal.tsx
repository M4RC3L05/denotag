import React, { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { jsonRpcClientCall } from "../utils.ts";
import Alert, { AlertProps } from "./alert.tsx";

type ShowAudioFileMetadataModalProps = {
  file: string;
  show: boolean;
  handleClose: () => unknown;
};

const ShowAudioFileMetadataModal: React.FC<ShowAudioFileMetadataModalProps> = (
  { file, show, handleClose },
) => {
  const [metadata, setMetadata] = useState<
    Record<string, unknown> | undefined
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

    jsonRpcClientCall("getMusicFileMetadata", { path: file })
      .then(({ result }) => {
        if (metadata) return;

        setMetadata(result as Record<string, unknown>);
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
