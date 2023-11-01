export class RequestError extends Error {
  constructor(error: unknown) {
    super("Request error", { cause: error });
  }
}

export const jsonRpcClientCall = async (
  method: string,
  args?: unknown[] | Record<string, unknown>,
  id = 1,
) => {
  const body = { jsonrpc: "2.0", method, id };

  if (args) {
    (body as Record<string, unknown>).params = args;
  }

  const response = await makeRequester("/api/actions", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as { result?: unknown; error?: Record<string, unknown> };

  if (response.error) {
    throw new Error("JSON RPC error", { cause: response.error });
  }

  return response;
};

export const makeRequester = async (input: RequestInfo | URL, options = {}) => {
  return await fetch(input, options).then((response) => {
    if (response.status === 204) {
      return undefined;
    }

    if (!response.ok) {
      throw new RequestError({ status: response.status });
    }

    return response.json();
  });
};

export const debounce = <T extends unknown[], R extends unknown>(
  fn: (...args: T) => R,
  time: number,
) => {
  let timeout: number;

  return (...args: T) => {
    if (timeout) clearTimeout(timeout);

    // deno-lint-ignore no-explicit-any
    timeout = setTimeout((fn as any).bind(null, ...args), time);
  };
};
