import { Button, Card, Col, Form, React, Row } from "../deps.js";
import { alertError, html, makeRequester } from "../utils.js";

const DisplayMetadata = ({ metadata }) => {
  const albumArtist = metadata.collectionArtistName ?? metadata.artistName;
  const year = new Date(metadata.releaseDate).getFullYear();
  const date = `${new Date(metadata.releaseDate).getFullYear()}-${
    ("0" + (new Date(metadata.releaseDate).getMonth() + 1)).slice(-2)
  }-${("0" + new Date(metadata.releaseDate).getDate()).slice(-2)}`;

  return html`
    <p><strong>ALBUMARTIST:</strong> ${albumArtist}</p>
    <p><strong>ALBUM:</strong> ${`${metadata.collectionName} // ${metadata.collectionCensoredName}`}</p>
    <p><strong>TITLE:</strong> ${`${metadata.trackName} // ${metadata.trackCensoredName}`}</p>
    <p><strong>YEAR:</strong> ${year}</p>
    <p><strong>DATE:</strong> ${date}</p>
    <p><strong>ARTIST:</strong> ${metadata.artistName}</p>
    <p><strong>GENRE:</strong> ${metadata.primaryGenreName}</p>
    <p><strong>TRACK:</strong> ${metadata.trackNumber}</p>
    <p><strong>TRACKCOUNT:</strong> ${metadata.trackCount}</p>
    <p><strong>DISC:</strong> ${metadata.discNumber}</p>
    <p><strong>DISCCOUNT:</strong> ${metadata.discCount}</p>
  `;
};

const RemoteAudioInfo = ({ onSelect }) => {
  const [formData, setFormData] = React.useState({ q: "", nResults: 5 });
  const [results, setResults] = React.useState([]);

  const imgStyles = React.useRef({ aspectRatio: "1 / 1" });

  const onSearch = (e) => {
    e.preventDefault();

    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("media", "music");
    url.searchParams.set("entity", "song");
    url.searchParams.set("sort", "recent");
    url.searchParams.set("country", "us");
    url.searchParams.set("limit", formData.nResults);
    url.searchParams.set("term", formData.q);

    makeRequester(url.toString())
      .then((data) => setResults(data.results ?? []))
      .catch((error) => {
        alertError(
          error,
          "Could not get remote metadata",
        );
      });
  };

  const setProp = (prop, map = (v) => v) => (e) =>
    setFormData((prev) => ({ ...prev, [prop]: map(e.target.value) }));

  const onUse = (data) => () => {
    onSelect({
      albumArtist: data.collectionArtistName ?? data.artistName,
      album: `${data.collectionName} // ${data.collectionCensoredName}`,
      title: `${data.trackName} // ${data.trackCensoredName}`,
      year: new Date(data.releaseDate).getFullYear(),
      date: `${new Date(data.releaseDate).getFullYear()}-${
        ("0" + (new Date(data.releaseDate).getMonth() + 1)).slice(-2)
      }-${("0" + new Date(data.releaseDate).getDate()).slice(-2)}`,
      artist: data.artistName,
      genre: data.primaryGenreName,
      cover: data.artworkUrl100.replace("100x100bb", "1200x1200bb"),
      track: data.trackNumber,
      trackCount: data.trackCount,
      disc: data.discNumber,
      discCount: data.discCount,
    });
  };

  const displayResult = (result) =>
    html`
    <${Col} key=${result.trackId}>
      <${Card}>
        <${Card.Img} variant="top" src=${result.artworkUrl100} style=${imgStyles} />
        <${Card.Body}>
          <${Card.Text}>
            <${DisplayMetadata} metadata=${result} />
          <//>
          <${Button} onClick=${onUse(result)}>
            Use
          <//>
        <//>
      <//>
    <//>
  `;

  return html`
    <${Row} className="mb-4">
      <${Col}>
        <${Form} onSubmit=${onSearch}>
          <${Form.Group} className="mb-4">
            <${Form.Control}
              type="text"
              placeholder="Search for metadata"
              value=${formData.q}
              onInput=${setProp("q")}
            />
          <//>

          <${Row}>
            <${Col}>
              <${Form.Group}>
                <${Form.Control}
                  type="number"
                  placeholder="Nº Results"
                  value=${formData.nResults}
                  onInput=${setProp("nResults", (v) => Number(v))}
                />
              <//>
            <//>

            <${Col}>
              <${Button} type="submit" variant="success" className="w-100">
                Search
              <//>
            <//>
          <//>
        <//>
      <//>
    <//>
    <${Row} xxl=${2} md=${1} className="g-4 mb-4">
      ${results.map((result) => displayResult(result))}
    <//>
  `;
};

export default RemoteAudioInfo;
