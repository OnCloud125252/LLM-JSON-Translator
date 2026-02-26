export function isClientError(error: any): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const isClientErrorType = error.__type__ === "CLIENT_ERROR";
  const isErrorStatusCode =
    typeof error.code === "number" && error.code >= 400 && error.code <= 599;

  return isClientErrorType && isErrorStatusCode;
}
