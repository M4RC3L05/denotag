import { useCallback, useState } from "preact/hooks";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { makeRequester } from "../utils.ts";
import Alert, { type AlertProps } from "./alert.tsx";

type DisplayMetadataProps = {
  metadata: Record<string, string | number>;
};

const DisplayMetadata = ({ metadata }: DisplayMetadataProps) => {
  const albumArtist = metadata.collectionArtistName ?? metadata.artistName;
  const year = new Date(metadata.releaseDate!).getFullYear();
  const date = `${new Date(metadata.releaseDate!).getFullYear()}-${
    ("0" + (new Date(metadata.releaseDate!).getMonth() + 1)).slice(-2)
  }-${("0" + new Date(metadata.releaseDate!).getDate()).slice(-2)}`;

  return (
    <>
      <p>
        <strong>ALBUMARTIST:</strong> {albumArtist}
      </p>
      <p>
        <strong>ALBUM:</strong>{" "}
        {`${metadata.collectionName} // ${metadata.collectionCensoredName}`}
      </p>
      <p>
        <strong>TITLE:</strong>{" "}
        {`${metadata.trackName} // ${metadata.trackCensoredName}`}
      </p>
      <p>
        <strong>YEAR:</strong> {year}
      </p>
      <p>
        <strong>DATE:</strong> {date}
      </p>
      <p>
        <strong>ARTIST:</strong> {metadata.artistName}
      </p>
      <p>
        <strong>GENRE:</strong> {metadata.primaryGenreName}
      </p>
      <p>
        <strong>TRACK:</strong> {metadata.trackNumber}
      </p>
      <p>
        <strong>TRACKCOUNT:</strong> {metadata.trackCount}
      </p>
      <p>
        <strong>DISC:</strong> {metadata.discNumber}
      </p>
      <p>
        <strong>DISCCOUNT:</strong> {metadata.discCount}
      </p>
    </>
  );
};

type RemoteAudioInfoProps = {
  onSelect: (metadata: Record<string, string | number>) => unknown;
};

const RemoteAudioInfo = ({ onSelect }: RemoteAudioInfoProps) => {
  const [formData, setFormData] = useState({ q: "", nResults: 5 });
  const [results, setResults] = useState([]);
  const [alertInfo, setAlertInfo] = useState<AlertProps>({
    show: false,
    title: "",
    handleClose: useCallback(() => {
      setAlertInfo((ps) => ({ ...ps, show: false }));
    }, []),
  });

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("media", "music");
    url.searchParams.set("entity", "song");
    url.searchParams.set("sort", "recent");
    url.searchParams.set("country", "us");
    url.searchParams.set("limit", String(formData.nResults));
    url.searchParams.set("term", formData.q);

    makeRequester(url.toString())
      .then((data) => setResults(data.results ?? []))
      .catch((error) => {
        setAlertInfo((ps) => ({
          ...ps,
          show: true,
          title: "Error",
          error,
          message: "Unable to get remote metadata",
        }));
      });
  };

  const setProp =
    (prop: string, map = (v: unknown) => v) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [prop]: map(e.target.value) }));

  const onUse = (data: Record<string, string | number>) => () => {
    onSelect({
      albumArtist: data.collectionArtistName ?? data.artistName!,
      album: `${data.collectionName} // ${data.collectionCensoredName}`,
      title: `${data.trackName} // ${data.trackCensoredName}`,
      year: new Date(data.releaseDate!).getFullYear(),
      date: `${new Date(data.releaseDate!).getFullYear()}-${
        ("0" + (new Date(data.releaseDate!).getMonth() + 1)).slice(-2)
      }-${("0" + new Date(data.releaseDate!).getDate()).slice(-2)}`,
      artist: data.artistName!,
      genre: data.primaryGenreName!,
      cover: (data.artworkUrl100 as string).replace("100x100bb", "1200x1200bb"),
      track: data.trackNumber!,
      trackCount: data.trackCount!,
      disc: data.discNumber!,
      discCount: data.discCount!,
    });
  };

  const displayResult = (result: Record<string, string | number>) => (
    <Col key={result.trackId}>
      <Card>
        <Card.Img
          variant="top"
          src={result.artworkUrl100 as string}
          style={{ aspectRatio: "1 / 1" }}
        />
        <Card.Body>
          <Card.Text>
            <DisplayMetadata metadata={result} />
          </Card.Text>
          <Button onClick={onUse(result)}>
            Use
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <>
      <Alert {...alertInfo} />
      <Row className="mb-4">
        <Col>
          <Form onSubmit={onSearch}>
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                placeholder="Search for metadata"
                value={formData.q}
                onChange={setProp("q")}
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group>
                  <Form.Control
                    type="number"
                    placeholder="Nº Results"
                    value={formData.nResults}
                    onChange={setProp("nResults", (v) => Number(v))}
                  />
                </Form.Group>
              </Col>

              <Col>
                <Button type="submit" variant="success" className="w-100">
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <Row xxl={2} md={1} className="g-4 mb-4">
        {results.map((result) => displayResult(result))}
      </Row>
    </>
  );
};

export default RemoteAudioInfo;
