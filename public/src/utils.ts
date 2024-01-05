export class RequestError extends Error {
  constructor(error: unknown) {
    super("Request error", { cause: error });
  }
}

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
