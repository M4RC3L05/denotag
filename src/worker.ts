import * as actions from "./actions.ts";
import { path } from "./deps.ts";
import embed from "./public.json" assert { type: "json" };

type InitData = {
  dir: string;
  httpPort: number;
};

let server = undefined;

const isKey = (seg: string): seg is keyof typeof embed => {
  return seg in embed;
};

const handleActions = async (initData: Pick<InitData, "dir">, req: Request) => {
  try {
    const url = new URL(req.url);
    const action = url.pathname.replace("/api/actions/", "")
      .trim() as keyof typeof actions;

    if (!(action in actions)) {
      return Response.json(
        { error: { message: "Not found", type: "not_found" } },
        { status: 404 },
      );
    }

    const input = action === "getFiles"
      ? initData.dir
      : await req.json().catch(() => ({}));
    const data = await actions[action](input);

    return Response.json({ data });
  } catch (error) {
    return Response.json(
      {
        error: {
          message: "Something went wrong",
          type: "internal_server_error",
          original: error instanceof Error
            ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
              cause: error.cause instanceof Error
                ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                  cause: error.cause,
                }
                : error.cause,
            }
            : error,
        },
      },
      { status: 500 },
    );
  }
};

const handleStatic = (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/") {
    return new Response(
      Uint8Array.from(
        embed[`public${path.SEP}index.html` as keyof typeof embed],
      ),
      {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }

  const key = `public${url.pathname.replaceAll("/", path.SEP)}`;

  if (isKey(key)) {
    return new Response(
      Uint8Array.from(embed[key]),
      {
        status: 200,
        headers: {
          "content-type": url.pathname.endsWith(".html")
            ? "text/html; charset=utf-8"
            : "text/javascript",
        },
      },
    );
  }

  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

const handle = (initData: Pick<InitData, "dir">) => async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/actions/")) {
    return await handleActions(initData, req);
  }

  return handleStatic(req);
};

const boot = (initData: InitData) => {
  server = Deno.serve({ port: initData.httpPort }, handle(initData));
};

self.postMessage("init");

self.onmessage = (e) => {
  boot(e.data);

  self.postMessage("ok");
};
