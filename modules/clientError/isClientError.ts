import { StatusCodes } from "http-status-codes";

export function isClientError(error: any) {
  return (
    "__type__" in error &&
    error.__type__ === "CLIENT_ERROR" &&
    "code" in error &&
    Object.values(StatusCodes).includes(error.code)
  );
}
