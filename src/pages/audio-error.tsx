import type { FunctionalComponent } from "preact";

type AudioErrorPageProps = {
  file: string;
  error: Error;
};

export const AudioError: FunctionalComponent<AudioErrorPageProps> = (
  { file, error },
) => {
  return (
    <>
      <header>
        <h1>Error checking file "{file}"</h1>

        <nav>
          <a href="/">Back</a>
        </nav>
      </header>
      <main>
        <pre>{Deno.inspect(error, {breakLength: Number.POSITIVE_INFINITY, colors: true, compact: false, depth: 1000, iterableLimit: 1000, strAbbreviateSize: Number.POSITIVE_INFINITY, trailingComma: true})}</pre>
      </main>
    </>
  );
};
