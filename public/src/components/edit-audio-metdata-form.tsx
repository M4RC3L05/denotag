import { useCallback, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Alert, { AlertProps } from "./alert.tsx";
import { setMusicFileMetadata } from "../actions.ts";

type EditAudioMetadataFormProps = {
  metadata: Record<string, string | number>;
  file: string;
  onTagged: () => unknown;
};

const EditAudioMetadataForm: React.FC<EditAudioMetadataFormProps> = (
  { metadata, file, onTagged },
) => {
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [alertInfo, setAlertInfo] = useState<AlertProps>({
    show: false,
    title: "",
    handleClose: useCallback(() => {
      setAlertInfo((ps) => ({ ...ps, show: false }));
    }, []),
  });

  useEffect(() => {
    setFormData(metadata);
  }, [metadata]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) =>
        typeof value === "string" ? value.trim() !== "" : true
      ),
    );

    setMusicFileMetadata({ path: file, metadata: data })
      .then(() => {
        setAlertInfo((ps) => ({
          ...ps,
          show: true,
          title: "Success",
          error: undefined,
          message: "Successfully tagged!",
        }));
        onTagged();
      })
      .catch((error) => {
        setAlertInfo((ps) => ({
          ...ps,
          show: true,
          title: "Error",
          error,
          message: "Unable to set file metadata",
        }));
      });
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ((e.target.files?.length ?? 0) <= 0) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        cover: reader.result as string,
      }));
    };
    reader.readAsDataURL(e.target.files![0]);
  };

  const setProp =
    (prop: string, map = (v: string): string | number => v) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [prop]: map(e.target.value) }));

  return (
    <>
      <Alert {...alertInfo} />
      <Form onSubmit={onSubmit}>
        <Image src={formData?.cover as string} fluid />
        <Form.Control
          className="mb-2"
          type="file"
          placeholder="Cover"
          accept="image/png, image/jpg, image/jpeg"
          onChange={onFileSelect}
        />
        <Form.Group className="mb-2">
          <Form.Label>Album artist</Form.Label>
          <Form.Control
            type="text"
            placeholder="Album artist name"
            value={formData?.albumArtist}
            onChange={setProp("albumArtist")}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Album</Form.Label>
          <Form.Control
            type="text"
            placeholder="Album name"
            value={formData?.album}
            onChange={setProp("album")}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Title"
            value={formData?.title}
            onChange={setProp("title")}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Artist</Form.Label>
          <Form.Control
            type="text"
            placeholder="Artist"
            value={formData?.artist}
            onChange={setProp("artist")}
          />
        </Form.Group>

        <Row className="mb-2">
          <Col>
            <Form.Group>
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Year"
                value={formData?.year}
                onChange={setProp("year", (v) => Number(v))}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                placeholder="Date"
                value={formData?.date}
                onChange={setProp("date")}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-2">
          <Form.Label>Genre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Genre"
            value={formData?.genre}
            onChange={setProp("genre")}
          />
        </Form.Group>

        <Row className="mb-2">
          <Col>
            <Form.Group>
              <Form.Label>Track</Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Track number"
                value={formData?.track}
                onChange={setProp("track", (v) => Number(v))}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group>
              <Form.Label>Track Count</Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Track count"
                value={formData?.trackCount}
                onChange={setProp("trackCount", (v) => Number(v))}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Disc</Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Disc number"
                value={formData?.disc}
                onChange={setProp("disc", (v) => Number(v))}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group>
              <Form.Label>Disc Count</Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Disc count"
                value={formData?.discCount}
                onChange={setProp("discCount", (v) => Number(v))}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-2">
          <Button type="submit" variant="success" style={{ width: "100%" }}>
            Tag!
          </Button>
        </Form.Group>
      </Form>
    </>
  );
};

export default EditAudioMetadataForm;
