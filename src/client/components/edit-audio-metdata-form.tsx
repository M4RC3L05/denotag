import type { RefObject } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Button, Col, Form, Image, Row } from "react-bootstrap";
import Alert, { type AlertProps } from "./alert.tsx";
import { setMusicFileMetadata } from "../actions.ts";

type EditAudioMetadataFormProps = {
  metadata: Record<string, string | number>;
  file: string;
  onTagged: () => unknown;
};

const EditAudioMetadataForm = (
  { metadata, file, onTagged }: EditAudioMetadataFormProps,
) => {
  const [alertInfo, setAlertInfo] = useState<AlertProps>({
    show: false,
    title: "",
    handleClose: useCallback(() => {
      setAlertInfo((ps) => ({ ...ps, show: false }));
    }, []),
  });
  const imgRef = useRef<HTMLImageElement>();
  const coverInputRef = useRef<HTMLInputElement>();
  const [coverSelectedFromAbove, setCoverSelectedFromAbove] = useState(
    !!metadata?.cover,
  );

  useEffect(() => {
    setCoverSelectedFromAbove(!!metadata?.cover);
  }, [metadata?.cover]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.target as HTMLFormElement);

    if (coverSelectedFromAbove && metadata?.cover) {
      await fetch(metadata.cover as string).then(async (response) => {
        fd.set("cover", await response.blob());
      });
    }

    setMusicFileMetadata(fd)
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

    setCoverSelectedFromAbove(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      imgRef.current!.src = reader.result as string;
    };
    reader.readAsDataURL(e.target.files![0]!);
  };

  return (
    <>
      <Alert {...alertInfo} />
      <Form onSubmit={onSubmit} encType="multipart/form-data">
        <input type="hidden" name="path" value={file} />
        <Image
          ref={imgRef as RefObject<HTMLImageElement>}
          src={metadata?.cover as string}
          fluid
        />
        <Form.Control
          ref={coverInputRef as RefObject<HTMLInputElement>}
          name="cover"
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
            name="albumArtist"
            placeholder="Album artist name"
            defaultValue={metadata?.albumArtist}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Album</Form.Label>
          <Form.Control
            type="text"
            name="album"
            placeholder="Album name"
            defaultValue={metadata?.album}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            placeholder="Title"
            defaultValue={metadata?.title}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Artist</Form.Label>
          <Form.Control
            type="text"
            name="artist"
            placeholder="Artist"
            defaultValue={metadata?.artist}
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
                name="year"
                defaultValue={metadata?.year}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                placeholder="Date"
                name="date"
                defaultValue={metadata?.date}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-2">
          <Form.Label>Genre</Form.Label>
          <Form.Control
            type="text"
            placeholder="Genre"
            name="genre"
            defaultValue={metadata?.genre}
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
                defaultValue={metadata?.track}
                name="track"
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
                defaultValue={metadata?.trackCount}
                name="trackCount"
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
                defaultValue={metadata?.disc}
                name="disc"
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
                defaultValue={metadata?.discCount}
                name="discCount"
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
