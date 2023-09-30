export const isFileOgg = async (path: string) => {
  const tmp = new Uint8Array(4);

  const openFile = await Deno.open(path, { read: true, write: false });
  await openFile.read(tmp);
  const fileType = new TextDecoder().decode(tmp);

  return fileType === "OggS";
};
