import { StatusCodes } from "http-status-codes";

import { ClientError } from "modules/clientError";
import { handleRecursiveError } from "modules/clientError/handleRecursiveError";
import { Logger } from "modules/logger";
import { translateJson } from "modules/translate-json";
import { TargetLanguage } from "modules/translate-json/modules/translate-batch";

export class TranslateJson {
  static readonly path = "/translate";
  static readonly method = "POST";

  private readonly request: Request;
  private readonly requestUuid?: string;
  private readonly webServerResponseLogger: Logger;
  private readonly logger = new Logger({
    prefix: "controller",
  }).createChild("translate");
  private haveRequest() {
    if (!this.request) {
      throw new Error("Request is undefined");
    }
  }

  constructor({
    request,
    webServerResponseLogger,
    requestUuid,
  }: {
    request: Request;
    webServerResponseLogger: Logger;
    requestUuid?: string;
  }) {
    this.request = request;
    this.webServerResponseLogger = webServerResponseLogger;
    this.requestUuid = requestUuid;
  }

  middleware() {
    const request = this.request;
    this.haveRequest();

    const headers = request.headers;

    this.logger.debug("Checking Content-Type header");

    if (headers.get("Content-Type") !== "application/json") {
      this.logger.warn("Invalid Content-Type", {
        contentType: headers.get("Content-Type"),
      });
      throw new ClientError(
        {
          errorMessage: "Invalid content type, must be application/json",
          errorObject: { contentType: headers.get("Content-Type") },
        },
        StatusCodes.BAD_REQUEST,
        this.requestUuid,
      );
    }

    this.logger.debug("Content-Type validated");

    return new TranslateJson({
      request,
      webServerResponseLogger: this.webServerResponseLogger,
      requestUuid: this.requestUuid,
    });
  }

  guard() {
    const request = this.request;
    this.haveRequest();

    const headers = request.headers;

    this.logger.debug("Checking Authorization header");

    if (headers.get("Authorization") !== `Bearer ${process.env.APP_API_KEY}`) {
      this.logger.warn("Invalid API key", {
        authorization: headers.get("Authorization"),
      });
      throw new ClientError(
        {
          errorMessage: "Invalid API key",
          errorObject: { apiKey: headers.get("Authorization") },
        },
        StatusCodes.UNAUTHORIZED,
        this.requestUuid,
      );
    }

    this.logger.debug("Authorization validated");

    return new TranslateJson({
      request,
      webServerResponseLogger: this.webServerResponseLogger,
      requestUuid: this.requestUuid,
    });
  }

  async POST() {
    const request = this.request;
    this.haveRequest();

    this.logger.info("Processing translation request");

    try {
      const body = await request.json();

      const { json, targetLanguage, disallowedTranslateKeys } = body;

      this.logger.debug("Validating request body", { targetLanguage });

      if (typeof json !== "object") {
        this.logger.warn("Invalid json field type", { type: typeof json });
        throw new ClientError(
          {
            errorMessage: "Body didn't meet requirements",
            errorObject: {
              invalidField: [
                {
                  fieldName: "json",
                  validFieldValue: "object-like value",
                },
              ],
            },
          },
          StatusCodes.BAD_REQUEST,
          this.requestUuid,
        );
      }

      if (
        typeof targetLanguage !== "string" ||
        !Object.values(TargetLanguage).includes(
          targetLanguage as TargetLanguage,
        )
      ) {
        this.logger.warn("Invalid targetLanguage", { targetLanguage });
        throw new ClientError(
          {
            errorMessage: "Body didn't meet requirements",
            errorObject: {
              invalidField: [
                {
                  fieldName: "targetLanguage",
                  validFieldValue: Object.values(TargetLanguage).join(", "),
                },
              ],
            },
          },
          StatusCodes.BAD_REQUEST,
          this.requestUuid,
        );
      }

      this.logger.info("Starting JSON translation", {
        targetLanguage,
        hasDisallowedKeys: !!disallowedTranslateKeys,
      });

      const time0 = Date.now();
      const translatedJson = await translateJson({
        jsonData: json,
        batchSize: 10,
        targetLanguage: targetLanguage as TargetLanguage,
        disallowedTranslateKeys,
      });
      const time1 = Date.now();

      const duration = time1 - time0;
      const fieldCount = Object.keys(translatedJson).length;

      this.logger.info("Translation completed", {
        fieldCount,
        durationMs: duration,
        targetLanguage,
      });

      this.webServerResponseLogger.info(
        `Translated ${fieldCount} fields in ${duration}ms`,
      );

      return Response.json(translatedJson, {
        status: StatusCodes.OK,
      });
    } catch (error) {
      this.logger.error("Translation request failed", { error });

      if (
        error instanceof Error &&
        error.name === "SyntaxError" &&
        error.message === "Failed to parse JSON"
      ) {
        throw new ClientError(
          {
            errorMessage: "Request body is not valid JSON",
          },
          StatusCodes.BAD_REQUEST,
          this.requestUuid,
        );
      }

      handleRecursiveError(error);

      throw new ClientError(
        {
          errorMessage: "Failed to translate JSON",
        },
        StatusCodes.BAD_REQUEST,
        this.requestUuid,
      );
    }
  }
}
