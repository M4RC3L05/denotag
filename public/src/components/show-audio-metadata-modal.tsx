import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { alertError, makeRequester } from "../utils.ts";

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

  useEffect(() => {
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
  );
};

export default ShowAudioFileMetadataModal;
