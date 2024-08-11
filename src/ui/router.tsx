import { renderToString } from "preact-render-to-string";
import { Layout } from "./layout.tsx";
import { MainPage } from "./pages/main.tsx";
import { route } from "@std/http";
import { NotFoundPage } from "./pages/404.tsx";
import { join, resolve } from "@std/path";
import type { VNode } from "preact";
import { ActionError, bootActions } from "../actions.ts";
import { FilesTableListFragment } from "./fragments/files-table-list.tsx";
import { MusicInfoDialogFragment } from "./fragments/music-info-dialog.tsx";
import { MusicsTagPage } from "./pages/musics/tag.tsx";
import { parseMultipartRequest } from "@mjackson/multipart-parser";
import { MusicTagSectionFragment } from "./fragments/music-tag-section.tsx";
import { ErrorDialogFragment } from "./fragments/error-dialog.tsx";
import { ServerErrorPage } from "./pages/500.tsx";

const embed = await import(
  resolve(import.meta.dirname!, "../public.json"),
  { with: { type: "json" } }
)
  .then(({ default: main }) => main);
const jss = embed.js
  .map((js: Iterable<number>) => new TextDecoder().decode(Uint8Array.from(js)))
  .join("\n");
const csss = embed.css
  .map((css: Iterable<number>) =>
    new TextDecoder().decode(Uint8Array.from(css))
  )
  .join("\n");

const renderPage = (
  vnode: VNode,
  { statusCode } = { statusCode: 200 },
) => {
  return new Response(
    `<!DOCTYPE html>
    ${
      renderToString(<Layout>{vnode}</Layout>)
        .replace("@@css@@", csss)
        .replace("@@js@@", jss)
    }`,
    { headers: { "content-type": "text/html" }, status: statusCode },
  );
};

const renderFragment = (vnode: VNode, { statusCode } = { statusCode: 200 }) => {
  return new Response(
    renderToString(vnode),
    { headers: { "content-type": "text/html" }, status: statusCode },
  );
};

export const router = (state: { dir: string }) => {
  const { invokeAction } = bootActions({ dir: join(state.dir) });

  return route([{
    handler: async () => {
      const response = await invokeAction("getFiles");

      if (response instanceof ActionError) {
        return renderFragment(<ErrorDialogFragment error={response} />, {
          statusCode: 500,
        });
      }

      return renderPage(<MainPage files={response} />);
    },
    pattern: new URLPattern({ pathname: "/" }),
    method: "GET",
  }, {
    handler: async (req, _, params) => {
      const file = decodeURIComponent(params!.pathname.groups.file as string);
      const fileData = await invokeAction("getMusicFileMetadata", {
        path: file,
      });

      if (req.method === "POST") {
        const data = new Map<string, unknown>();

        for await (const part of parseMultipartRequest(req)) {
          data.set(
            part.name!,
            part.isFile
              ? {
                data: new Uint8Array(await part.arrayBuffer()),
                mimeType: part.mediaType,
              }
              : await part.text(),
          );
        }

        const response = await invokeAction("setMusicFileMetadata", {
          path: file,
          metadata: Object.fromEntries(data.entries()),
        });

        if (response instanceof ActionError) {
          return renderFragment(
            <>
              <MusicTagSectionFragment
                data={fileData as Record<string, string | number | undefined>}
                file={file}
              />
              <ErrorDialogFragment error={response} />
            </>,
            {
              statusCode: 500,
            },
          );
        }

        const response2 = await invokeAction("getMusicFileMetadata", {
          path: file,
        });

        if (response2 instanceof ActionError) {
          return renderFragment(
            <>
              <MusicTagSectionFragment
                data={fileData as Record<string, string | number | undefined>}
                file={file}
              />
              <ErrorDialogFragment error={response2} />
            </>,
            {
              statusCode: 500,
            },
          );
        }

        return renderFragment(
          <MusicTagSectionFragment data={response2} file={file} success />,
        );
      }

      const response = await invokeAction("getMusicFileMetadata", {
        path: file,
      });

      if (response instanceof ActionError) {
        return renderPage(<ServerErrorPage error={response} />, {
          statusCode: 500,
        });
      }

      return renderPage(<MusicsTagPage data={response} file={file} />);
    },
    pattern: new URLPattern({ pathname: "/musics/:file/tag" }),
    method: "GET",
  }, {
    handler: async (req) => {
      const { searchParams } = new URL(req.url);
      const file = decodeURIComponent(searchParams.get("file")!);
      const response = await invokeAction("getMusicFileMetadata", {
        path: file,
      });

      if (response instanceof ActionError) {
        return renderFragment(<ErrorDialogFragment error={response} />, {
          statusCode: 500,
        });
      }

      return renderPage(
        <MusicInfoDialogFragment data={response} file={file} />,
      );
    },
    pattern: new URLPattern({ pathname: "/fragments/music-info-dialog" }),
    method: "GET",
  }, {
    pattern: new URLPattern({
      pathname: "/fragments/music-files-table-list",
    }),
    handler: async (req) => {
      const { searchParams } = new URL(req.url);
      const response = await invokeAction("getFiles");
      const search = searchParams.get("search");

      if (response instanceof ActionError) {
        return renderFragment(<ErrorDialogFragment error={response} />, {
          statusCode: 500,
        });
      }

      return renderFragment(
        <FilesTableListFragment
          files={search
            ? response.filter((files) =>
              files.toLowerCase().includes(search.toLowerCase())
            )
            : response}
        />,
      );
    },
    method: "GET",
  }], () => renderPage(<NotFoundPage />, { statusCode: 404 }));
};
