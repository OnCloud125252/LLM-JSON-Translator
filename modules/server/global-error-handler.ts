import { StatusCodes } from "http-status-codes";

import { ClientError } from "modules/clientError";
import { isClientError } from "modules/clientError/isClientError";
import { Logger } from "modules/logger";

const globalErrorHandlerLogger = new Logger({
  prefix: "web-server",
}).createChild("global-error-handler");

export function globalErrorHandler(error: any | ClientError | Error) {
  if (isClientError(error)) {
    const clientError = error as ClientError;

    if (
      clientError.payload?.errorMessage === "Invalid request endpoint or method"
    ) {
      const errorObject = clientError.payload?.errorObject as any;
      globalErrorHandlerLogger
        .createChild(clientError.requestUuid)
        .error(
          `Invalid request endpoint or method: ${errorObject.method} ${errorObject.endpoint}`,
        );
    } else {
      globalErrorHandlerLogger
        .createChild(clientError.requestUuid)
        .error("Client error:", error);
    }

    return new Response(
      JSON.stringify({
        errorMessage: clientError.payload?.errorMessage,
        errorObject: clientError.payload?.errorObject,
      }),
      {
        status: clientError.code,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  globalErrorHandlerLogger
    .createChild("unknown-error")
    .error("Unexpected error:", error);
  return new Response(
    JSON.stringify({
      errorMessage: "Unexpected error occurred. Please try again.",
    }),
    {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { "Content-Type": "application/json" },
    },
  );
}
