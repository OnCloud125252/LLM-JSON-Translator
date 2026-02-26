interface ClientError {
  __type__: string;
  code: number;
}

export function isClientError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const clientError = error as ClientError;
  const isClientErrorType = clientError.__type__ === "CLIENT_ERROR";
  const isErrorStatusCode =
    typeof clientError.code === "number" &&
    clientError.code >= 400 &&
    clientError.code <= 599;

  return isClientErrorType && isErrorStatusCode;
}
