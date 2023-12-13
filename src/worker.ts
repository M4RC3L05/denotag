import * as actions from "./actions.ts";
import {
  httpAdapter,
  JsonRpcMethod,
  JsonRpcServer,
} from "./core/json-rpc/mod.ts";
import embed from "./public.json" assert { type: "json" };

type InitData = { dir: string; httpPort: number };

let _server = undefined;

const handleDeps = (req: Request) => {
  const url = new URL(req.url);

  for (const k in embed) {
    const ku = new URL(k);

    if (url.pathname === "/" && ku.pathname.endsWith("public/index.html")) {
      return new Response(
        Uint8Array.from((embed as Record<string, number[]>)[k]),
        {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      );
    }

    if (ku.pathname.endsWith(url.pathname)) {
      return new Response(
        Uint8Array.from((embed as Record<string, number[]>)[k]),
        {
          status: 200,
          headers: {
            "content-type": url.pathname.endsWith(".html")
              ? "text/html; charset=utf-8"
              : url.pathname.endsWith(".css")
              ? "text/css"
              : "text/javascript",
          },
        },
      );
    }
  }

  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};

type Methods = {
  getFiles: JsonRpcMethod<[], Promise<string[]>>;
  getMusicFileMetadata: JsonRpcMethod<
    [{ path: string }],
    Record<string, unknown>
  >;
  setMusicFileMetadata: JsonRpcMethod<
    [{ path: string; metadata: Record<string, unknown> }],
    void
  >;
};

const handle = (initData: Pick<InitData, "dir">) => {
  const jsonRpcServer = new JsonRpcServer<Methods>();

  jsonRpcServer.method("getFiles", () => actions.getFiles(initData.dir));
  jsonRpcServer.method(
    "getMusicFileMetadata",
    (args) => actions.getMusicFileMetadata(args),
  );
  jsonRpcServer.method(
    "setMusicFileMetadata",
    (args) => actions.setMusicFileMetadata(args),
  );

  const handler = httpAdapter(jsonRpcServer);

  return async (req: Request) => {
    const url = new URL(req.url);

    if (url.pathname === "/api/actions" && req.method === "POST") {
      return await handler(req);
    }

    return handleDeps(req);
  };
};

const boot = (initData: InitData) => {
  _server = Deno.serve({ port: initData.httpPort }, handle(initData));
};

self.postMessage("init");

self.onmessage = (e) => {
  boot(e.data);
  self.postMessage("ok");
};
