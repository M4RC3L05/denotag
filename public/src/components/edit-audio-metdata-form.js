import { Button, Col, Form, Image, React, Row } from "../deps.js";
import { alertError, html, makeRequester } from "../utils.js";

const EditAudioMetadataForm = (
  { metadata, file, onTagged },
) => {
  const [formData, setFormData] = React.useState({});

  React.useEffect(() => {
    setFormData(metadata);
  }, [metadata]);

  const onSubmit = (e) => {
    e.preventDefault();

    const data = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) =>
        typeof value === "string" ? value.trim() !== "" : true
      ),
    );

    makeRequester("/api/actions/setMusicFileMetadata", {
      body: JSON.stringify({ path: file, metadata: data }),
      method: "POST",
      headers: { "content-type": "application/json" },
    })
      .then(() => {
        alert("Successfully tagged!");
        onTagged();
      })
      .catch((error) => {
        alertError(error, "Could not set metadata");
      });
  };

  const onFileSelect = (e) => {
    if (e.target.files.length <= 0) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        cover: reader.result,
      }));
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const setProp = (prop, map = (v) => v) => (e) =>
    setFormData((prev) => ({ ...prev, [prop]: map(e.target.value) }));

  return html`
    <${Form} onSubmit=${onSubmit}>
      <${Image} src=${formData?.cover} fluid />
      <${Form.Control}
        className="mb-2"
        type="file"
        placeholder="Cover"
        accept="image/png, image/jpg, image/jpeg"
        onInput=${onFileSelect}
      />
      <${Form.Group} className="mb-2">
        <${Form.Label}>Album artist<//>
        <${Form.Control}
          type="text"
          placeholder="Album artist name"
          value=${formData?.albumArtist}
          onInput=${setProp("albumArtist")}
        />
      <//>

      <${Form.Group} className="mb-2">
        <${Form.Label}>Album<//>
        <${Form.Control}
          type="text"
          placeholder="Album name"
          value=${formData?.album}
          onInput=${setProp("album")}
        />
      <//>

      <${Form.Group} className="mb-2">
        <${Form.Label}>Title<//>
        <${Form.Control}
          type="text"
          placeholder="Title"
          value=${formData?.title}
          onInput=${setProp("title")}
        />
      <//>

      <${Form.Group} className="mb-2">
        <${Form.Label}>Artist<//>
        <${Form.Control}
          type="text"
          placeholder="Artist"
          value=${formData?.artist}
          onInput=${setProp("artist")}
        />
      <//>

      <${Row} className="mb-2">
        <${Col}>
          <${Form.Group}>
            <${Form.Label}>Year<//>
            <${Form.Control}
              type="number"
              min={0}
              placeholder="Year"
              value=${formData?.year}
              onInput=${setProp("year", (v) => Number(v))}
            />
          <//>
        <//>

        <${Col}>
          <${Form.Group}>
            <${Form.Label}>Date<//>
            <${Form.Control}
              type="date"
              placeholder="Date"
              value=${formData?.date}
              onInput=${setProp("date")}
            />
          <//>
        <//>
      <//>

      <${Form.Group} className="mb-2">
        <${Form.Label}>Genre<//>
        <${Form.Control}
          type="text"
          placeholder="Genre"
          value=${formData?.genre}
          onInput=${setProp("genre")}
        />
      <//>

      <${Row} className="mb-2">
        <${Col}>
          <${Form.Group}>
            <${Form.Label}>Track<//>
            <${Form.Control}
              type="number"
              min={0}
              placeholder="Track number"
              value=${formData?.track}
              onInput=${setProp("track", (v) => Number(v))}
            />
          <//>
        <//>

        <${Col}>
          <${Form.Group}>
            <${Form.Label}>Track Count<//>
            <${Form.Control}
              type="number"
              min={0}
              placeholder="Track count"
              value=${formData?.trackCount}
              onInput=${setProp("trackCount", (v) => Number(v))}
            />
          <//>
        <//>
      <//>

      <${Row} className="mb-4">
        <${Col}>
          <${Form.Group}>
            <${Form.Label}>Disc<//>
            <${Form.Control}
              type="number"
              min={0}
              placeholder="Disc number"
              value=${formData?.disc}
              onInput=${setProp("disc", (v) => Number(v))}
            />
          <//>
        <//>

        <${Col}>
          <${Form.Group}>
            <${Form.Label}>Disc Count<//>
            <${Form.Control}
              type="number"
              min={0}
              placeholder="Disc count"
              value=${formData?.discCount}
              onInput=${setProp("discCount", (v) => Number(v))}
            />
          <//>
        <//>
      <//>

      <${Form.Group} className="mb-2">
        <${Button} type="submit" variant="success" style=${{ width: "100%" }}>
          Tag!
        <//>
      <//>
    <//>
  `;
};

export default EditAudioMetadataForm;
