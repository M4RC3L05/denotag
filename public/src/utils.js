import { htm, React } from "./deps.js";

export const html = htm.bind(React.createElement);

export class RequestError extends Error {
  constructor(error) {
    super("Request error", { cause: error });
  }
}

export const makeRequester = async (input, options = {}) => {
  return await fetch(input, options).then((response) => {
    if (response.status === 204) {
      return undefined;
    }

    if (!response.ok) {
      throw new RequestError({ status: response.status });
    }

    return response.json().then((data) => {
      if (data.error) throw new RequestError(data.error);

      return "data" in data ? data.data : data;
    });
  });
};

export const alertError = (error, msg) => {
  error = error instanceof Error
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
    : error;

  alert(
    `${msg ?? "Something went wrong"}\n\n${
      JSON.stringify(
        error,
        null,
        2,
      )
    }`,
  );
};
