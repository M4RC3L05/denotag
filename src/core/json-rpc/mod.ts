import { zod } from "../../deps.ts";

const jsonRpcRequestSchema = zod.object({
  jsonrpc: zod.literal("2.0"),
  method: zod.string(),
  params: zod.array(zod.any()).or(zod.object({}).passthrough()).optional(),
  id: zod.string().or(zod.number()).optional(),
}).strict();

export type JsonRpcRequest = zod.infer<typeof jsonRpcRequestSchema>;

type JsonRpcResponseError = {
  code: number;
  message: string;
  data?: unknown;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  result?: unknown;
  error?: JsonRpcResponseError;
  id: string | number | null;
};

export type JsonRpcMethod<A extends unknown[], R extends unknown> = {
  (...args: A): R;
  schema?: zod.Schema;
};

export class JsonRpcServer<
  // deno-lint-ignore no-explicit-any
  M extends Record<string, JsonRpcMethod<any[], any>> = any,
> {
  #methods = new Map<keyof M, M[keyof M]>();

  method<K extends keyof M>(name: K, handler: M[K]) {
    this.#methods.set(name, handler);
  }

  async call(request: unknown): Promise<JsonRpcResponse | undefined> {
    const requestParse = jsonRpcRequestSchema.safeParse(request);

    if (!requestParse.success) {
      return {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Invalid Request",
          data: requestParse.error.issues,
        },
      };
    }

    const method = this.#methods.get(
      requestParse.data.method as keyof M,
    );

    if (!method) {
      return requestParse.data.id
        ? {
          id: requestParse.data?.id,
          jsonrpc: "2.0",
          error: { code: -32601, message: "Method not found" },
        }
        : undefined;
    }

    const paramsResult = method?.schema?.safeParse(
      requestParse.data.params,
    );

    if (paramsResult && !paramsResult.success) {
      return requestParse.data.id
        ? {
          id: requestParse.data?.id,
          jsonrpc: "2.0",
          error: {
            code: -32602,
            message: "Invalid params",
            data: paramsResult.error.issues,
          },
        }
        : undefined;
    }

    try {
      const data = await method(
        ...(requestParse.data.params
          ? (Array.isArray(requestParse.data.params)
            ? requestParse.data.params
            : [requestParse.data.params])
          : []),
      );

      return requestParse.data.id
        ? {
          jsonrpc: "2.0",
          id: requestParse.data.id!,
          result: data,
        }
        : undefined;
    } catch (error) {
      return requestParse.data.id
        ? {
          id: requestParse.data.id!,
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Server error",
            data: {
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
        }
        : undefined;
    }
  }
}

export const httpAdapter = (
  jsonRpcServer: JsonRpcServer,
) =>
async (request: Request): Promise<Response> => {
  let data: unknown;

  try {
    data = await request.json();
  } catch (error) {
    return Response.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
          data: {
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
      } as JsonRpcResponse,
    );
  }

  const response = await jsonRpcServer.call(data);

  if (!response) return Response.json(undefined, { status: 200 });

  return Response.json(response);
};
