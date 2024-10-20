import { Button, Col, Container, Form, Row } from "react-bootstrap";
import MusicFiles from "./components/music-files.tsx";
import { debounce } from "./utils.ts";
import Alert, { type AlertProps } from "./components/alert.tsx";
import { getFiles } from "./actions.ts";
import { type ChangeEvent, useCallback, useEffect, useState } from "./deps.ts";

const App = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [alertInfo, setAlertInfo] = useState<AlertProps>({
    show: false,
    title: "",
    handleClose: useCallback(() => {
      setAlertInfo((ps) => ({ ...ps, show: false }));
    }, []),
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
