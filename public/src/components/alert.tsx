import React from "react";
import Modal from "react-bootstrap/Modal";

export type AlertProps = {
  // deno-lint-ignore no-explicit-any
  error?: any;
  message?: string;
  title: string;
  handleClose: () => unknown;
  show: boolean;
};

const Alert: React.FC<AlertProps> = (
  { error, message, title, show, handleClose },
) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {message && <p>{message}</p>}
        {error && (
          <pre>
          {JSON.stringify(
            error = error instanceof Error
              ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
                cause: error.cause instanceof Error
                  ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                    cause: error.cause,
                  }
                  : error.cause,
              }
              : error,
            undefined,
            2,
          )}
          </pre>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default Alert;
