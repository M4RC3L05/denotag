import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import MusicFiles from "./components/music-files.tsx";
import { useHotkeys } from "react-hotkeys-hook";
import { debounce } from "./utils.ts";
import Alert, { AlertProps } from "./components/alert.tsx";
import { getFiles } from "./actions.ts";

const App = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>();
  const [alertInfo, setAlertInfo] = useState<AlertProps>({
    show: false,
    title: "",
    handleClose: useCallback(() => {
      setAlertInfo((ps) => ({ ...ps, show: false }));
    }, []),
  });

  useHotkeys("ctrl+f", () => {
    searchRef.current?.focus();
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    getFiles().then((result) => {
      setFiles(result as string[]);
    }).catch((error) => {
      setAlertInfo((ps) => ({
        ...ps,
        show: true,
        title: "Error",
        error,
        message: "Unable to get files",
      }));
    });
  };

  const onSearch = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    }, 250),
    [],
  );

  return (
    <Container>
      <Alert {...alertInfo} />
      <Row
        className="pt-4 pb-4 sticky-top"
        style={{ backgroundColor: "var(--bs-body-bg)" }}
      >
        <div className="col-auto">
          <Button onClick={fetchFiles} variant="primary">
            Refresh list
          </Button>
        </div>
        <div className="col">
          <Form.Control
            ref={searchRef as React.RefObject<HTMLInputElement>}
            placeholder="search"
            onChange={onSearch}
            className="w-100"
          />
        </div>
      </Row>
      <Row>
        <Col>
          <MusicFiles
            files={(files ?? []).filter((f) =>
              f.toLowerCase().includes(search)
            )}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
