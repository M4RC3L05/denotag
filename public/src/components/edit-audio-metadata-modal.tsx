import React, { useCallback, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { jsonRpcClientCall } from "../utils.ts";
import EditAudioMetadataForm from "./edit-audio-metdata-form.tsx";
import RemoteAudioInfo from "./remote-audio-info.tsx";
import Alert, { AlertProps } from "./alert.tsx";

type EditAudioFileMetadataModalPorps = {
  file: string;
  show: boolean;
  handleClose: () => unknown;
};

const EditAudioFileMetadataModal: React.FC<EditAudioFileMetadataModalPorps> = (
  { file, show, handleClose },
) => {
  const [metadata, setMetadata] = useState<
    Record<string, string | number> | undefined
  >(
    undefined,
  );
  const [alertInfo, setAlertInfo] = useState<AlertProps>({
    show: false,
    title: "",
    handleClose: useCallback(() => {
      setAlertInfo((ps) => ({ ...ps, show: false }));
    }, []),
  });

  const fetchMetadata = () => {
    jsonRpcClientCall("getMusicFileMetadata", { path: file })
      .then(({ result }) => {
        setMetadata(result as Record<string, string | number>);
      }).catch((error) => {
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
  };

  useEffect(() => {
    if (!show || !file) return;

    fetchMetadata();
  }, [show, file]);

  const onRemoteSelect = (data: Record<string, string | number>) => {
    fetch(data.cover as string).then((r) => r.blob())
      .then((b) => {
        const reader = new FileReader();
        reader.readAsDataURL(b);
        reader.onloadend = () => {
          setMetadata({ ...data, cover: reader.result as string });
        };
      });
  };

  return (
    <>
      <Alert {...alertInfo} />
      <Modal
        show={show}
        onHide={handleClose}
        centered
        fullscreen
        onExited={() => setMetadata(undefined)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit metadata of {file}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Container fluid style={{ height: "100%" }}>
            <Row style={{ height: "100%" }}>
              <Col style={{ maxHeight: "100%", overflow: "hidden scroll" }}>
                <EditAudioMetadataForm
                  file={file}
                  metadata={metadata!}
                  onTagged={fetchMetadata}
                />
              </Col>

              <Col style={{ maxHeight: "100%", overflow: "hidden scroll" }}>
                <RemoteAudioInfo onSelect={onRemoteSelect} />
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditAudioFileMetadataModal;
