import { Modal } from "react-bootstrap";

export type AlertProps = {
  // deno-lint-ignore no-explicit-any
  error?: any;
  message?: string;
  title: string;
  handleClose: () => unknown;
  show: boolean;
};

const Alert = ({ error, message, title, show, handleClose }: AlertProps) => {
  return (
    <Modal
      show={show}
      size="lg"
      centered
      fullscreen="lg-down"
      onHide={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {message && <p>{message}</p>}
        {error && (
          <pre>
          {JSON.stringify(error, undefined, 2)}
          </pre>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default Alert;
