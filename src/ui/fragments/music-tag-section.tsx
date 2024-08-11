import type { FunctionalComponent } from "preact";

export const MusicTagSectionFragment: FunctionalComponent<
  {
    data: Record<string, string | number | undefined>;
    file: string;
    success?: boolean;
  }
> = ({ data, file, success }) => {
  return (
    <>
      {success ? <p className="notice">Music tagged with success</p> : null}
      <form
        hx-post={`/musics/${encodeURIComponent(file)}/tag`}
        hx-encoding="multipart/form-data"
        hx-target="#music-tag-section-fragment-target"
        hx-swap="innerHTML"
      >
        <div>
          <label>Cover</label>
          {typeof data.cover === "string" ? <img src={data.cover} /> : null}
          <input
            name="cover"
            type="file"
            placeholder="Cover"
            accept="image/png, image/jpg, image/jpeg"
          />
        </div>

        <div>
          <label>Album artist</label>
          <input
            name="albumArtist"
            type="text"
            placeholder="Album artist name"
            value={data.albumArtist}
          />
        </div>

        <div>
          <label>Album</label>
          <input
            name="album"
            type="text"
            placeholder="Album name"
            value={data.album}
          />
        </div>

        <div>
          <label>Title</label>
          <input
            name="title"
            type="text"
            placeholder="Title"
            value={data.title}
          />
        </div>

        <div>
          <label>Artist</label>
          <input
            name="artist"
            type="text"
            placeholder="Artist"
            value={data.artist}
          />
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ flex: "1", width: "50%", marginRight: "8px" }}>
            <label>Year</label>
            <input
              name="year"
              type="number"
              placeholder="Year"
              value={data.year}
              min={0}
            />
          </div>

          <div style={{ flex: "1", width: "50%", marginRight: "8px" }}>
            <label>Date</label>
            <input
              name="date"
              type="date"
              placeholder="Date"
              value={data.date}
              min={0}
            />
          </div>
        </div>

        <div>
          <label>Genre</label>
          <input
            name="genre"
            type="text"
            placeholder="Genre"
            value={data.genre}
          />
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ flex: "1", width: "50%", marginRight: "8px" }}>
            <label>Track</label>
            <input
              name="track"
              type="number"
              placeholder="Track number"
              value={data.track}
              min={0}
            />
          </div>

          <div style={{ flex: "1", width: "50%", marginRight: "8px" }}>
            <label>Track Count</label>
            <input
              name="trackCount"
              type="number"
              placeholder="Track count"
              value={data.trackCount}
              min={0}
            />
          </div>
        </div>

        <div style={{ display: "flex" }}>
          <div style={{ flex: "1", width: "50%", marginRight: "8px" }}>
            <label>Disc</label>
            <input
              name="disc"
              type="number"
              placeholder="Disc number"
              value={data.disc}
              min={0}
            />
          </div>

          <div style={{ flex: "1", width: "50%", marginRight: "8px" }}>
            <label>Disc Count</label>
            <input
              name="discCount"
              type="number"
              placeholder="Disc Count"
              value={data.discCount}
              min={0}
            />
          </div>
        </div>

        <input type="submit" value="Tag!" />
      </form>
    </>
  );
};
