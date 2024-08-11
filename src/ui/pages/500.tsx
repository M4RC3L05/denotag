import type { FunctionalComponent } from "preact";

export const ServerErrorPage: FunctionalComponent<{ error?: Error }> = (
  { error },
) => {
  return (
    <>
      <h2>Server error</h2>
      <pre>{JSON.stringify(error ?? {}, null, 2)}</pre>
    </>
  );
};
