import { ClientError } from "@core/clientError";
import { isClientError } from "@core/clientError/isClientError";
import { Logger } from "@core/logger";
import { StatusCodes } from "http-status-codes";

const logger = new Logger({
  prefix: "web-server",
}).createChild("global-error-handler");

export function globalErrorHandler(error: unknown): Response {
  if (isClientError(error)) {
    const clientError = error as ClientError;
    const requestLogger = logger.createChild(clientError.requestUuid);

    if (
      clientError.payload?.errorMessage === "Invalid request endpoint or method"
    ) {
      const errorObject = clientError.payload.errorObject as Record<
        string,
        string
      >;
      requestLogger.error(
        `Invalid request endpoint or method: ${errorObject.method} ${errorObject.endpoint}`,
      );
    } else {
      requestLogger.error("Client error:", error);
    }

    return Response.json(
      {
        errorMessage: clientError.payload?.errorMessage,
        errorObject: clientError.payload?.errorObject,
      },
      { status: clientError.code },
    );
  }

  logger.createChild("unknown-error").error("Unexpected error:", error);

  return Response.json(
    { errorMessage: "Unexpected error occurred. Please try again." },
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  );
}
