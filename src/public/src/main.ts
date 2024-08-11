import htmx from "htmx.org";
globalThis.htmx = htmx;

htmx.on("htmx:beforeSwap", (evt: any) => {
  const contentType = evt.detail.xhr.getResponseHeader("content-type");
  console.log(evt);
  if (
    contentType && contentType.toLowerCase().includes("text/html".toLowerCase())
  ) {
    evt.detail.isError = false;
    evt.detail.shouldSwap = true;
  }
});
