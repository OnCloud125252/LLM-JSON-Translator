import { StatusCodes } from "http-status-codes";

/**
 * @description Define a error which will be sent to client
 * @class ClientError
 * @extends {Error}
 */
export class ClientError extends Error {
  __type__ = "CLIENT_ERROR";
  payload?: {
    errorObject?: object;
    errorMessage?: string;
  };
  code: StatusCodes;
  requestUuid?: string;

  constructor(
    payload?: {
      errorObject?: object;
      errorMessage?: string;
    },
    code?: StatusCodes,
    requestUuid?: string,
  ) {
    super();
    this.payload = { ...payload };
    this.code = code || StatusCodes.INTERNAL_SERVER_ERROR;
    this.requestUuid = requestUuid;
  }
}
