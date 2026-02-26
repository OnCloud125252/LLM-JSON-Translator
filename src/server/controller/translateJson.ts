import { StatusCodes } from "http-status-codes";

import { ClientError } from "modules/clientError";
import { isClientError } from "modules/clientError/isClientError";
import { Logger } from "modules/logger";
import { translateJson } from "modules/translate-json";
import { TargetLanguage } from "modules/translate-json/modules/translate-batch";

const controllerLogger = new Logger({ prefix: "controller:translate" });

function validateContentType(request: Request): void {
  const contentType = request.headers.get("Content-Type");
  if (contentType !== "application/json") {
    controllerLogger.warn("Invalid Content-Type", { contentType });
    throw new ClientError(
      {
        errorMessage: "Invalid content type, must be application/json",
        errorObject: { contentType },
      },
      StatusCodes.BAD_REQUEST,
    );
  }
}

function validateAuthorization(request: Request): void {
  const authorization = request.headers.get("Authorization");
  const expectedKey = `Bearer ${process.env.APP_API_KEY}`;
  if (authorization !== expectedKey) {
    controllerLogger.warn("Invalid API key", { authorization });
    throw new ClientError(
      {
        errorMessage: "Invalid API key",
        errorObject: { apiKey: authorization },
      },
      StatusCodes.UNAUTHORIZED,
    );
  }
}

interface RequestBody {
  json: object;
  targetLanguage: TargetLanguage;
  disallowedTranslateKeys?: string[];
}

function validateRequestBody(body: unknown): RequestBody {
  const { json, targetLanguage, disallowedTranslateKeys } = body as RequestBody;

  if (typeof json !== "object" || json === null) {
    controllerLogger.warn("Invalid json field type", { type: typeof json });
    throw new ClientError(
      {
        errorMessage: "Body didn't meet requirements",
        errorObject: {
          invalidField: [
            { fieldName: "json", validFieldValue: "object-like value" },
          ],
        },
      },
      StatusCodes.BAD_REQUEST,
    );
  }

  const validLanguages = Object.values(TargetLanguage);
  if (
    typeof targetLanguage !== "string" ||
    !validLanguages.includes(targetLanguage as TargetLanguage)
  ) {
    controllerLogger.warn("Invalid targetLanguage", { targetLanguage });
    throw new ClientError(
      {
        errorMessage: "Body didn't meet requirements",
        errorObject: {
          invalidField: [
            {
              fieldName: "targetLanguage",
              validFieldValue: validLanguages.join(", "),
            },
          ],
        },
      },
      StatusCodes.BAD_REQUEST,
    );
  }

  return {
    json,
    targetLanguage: targetLanguage as TargetLanguage,
    disallowedTranslateKeys,
  };
}

export async function handleTranslateJsonRequest(
  request: Request,
  responseLogger: Logger,
  requestUuid: string,
  batchSize: number,
): Promise<Response> {
  controllerLogger.info("Processing translation request", { requestUuid });

  validateContentType(request);
  controllerLogger.debug("Content-Type validated", { requestUuid });

  validateAuthorization(request);
  controllerLogger.debug("Authorization validated", { requestUuid });

  try {
    const body = await request.json();
    const { json, targetLanguage, disallowedTranslateKeys } =
      validateRequestBody(body);

    controllerLogger.info("Starting JSON translation", {
      requestUuid,
      targetLanguage,
      hasDisallowedKeys: !!disallowedTranslateKeys,
    });

    const startTime = Date.now();
    const translatedJson = await translateJson({
      jsonData: json,
      batchSize,
      targetLanguage,
      disallowedTranslateKeys,
    });
    const duration = Date.now() - startTime;
    const fieldCount = Object.keys(translatedJson).length;

    controllerLogger.info("Translation completed", {
      requestUuid,
      fieldCount,
      durationMs: duration,
      targetLanguage,
    });
    responseLogger.info(`Translated ${fieldCount} fields in ${duration}ms`);

    return Response.json(translatedJson, { status: StatusCodes.OK });
  } catch (error) {
    controllerLogger.error("Translation request failed", error, {
      requestUuid,
    });

    if (
      error instanceof Error &&
      error.name === "SyntaxError" &&
      error.message === "Failed to parse JSON"
    ) {
      throw new ClientError(
        { errorMessage: "Request body is not valid JSON" },
        StatusCodes.BAD_REQUEST,
        requestUuid,
      );
    }

    if (isClientError(error)) {
      throw error;
    }

    throw new ClientError(
      { errorMessage: "Failed to translate JSON" },
      StatusCodes.BAD_REQUEST,
      requestUuid,
    );
  }
}
