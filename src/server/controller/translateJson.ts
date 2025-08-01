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

    if (headers.get("Content-Type") !== "application/json") {
      throw new ClientError(
        {
          errorMessage: "Invalid content type, must be application/json",
          errorObject: { contentType: headers.get("Content-Type") },
        },
        StatusCodes.BAD_REQUEST,
        this.requestUuid,
      );
    }

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

    if (headers.get("Authorization") !== `Bearer ${process.env.API_KEY}`) {
      throw new ClientError(
        {
          errorMessage: "Invalid API key",
          errorObject: { apiKey: headers.get("Authorization") },
        },
        StatusCodes.UNAUTHORIZED,
        this.requestUuid,
      );
    }

    return new TranslateJson({
      request,
      webServerResponseLogger: this.webServerResponseLogger,
      requestUuid: this.requestUuid,
    });
  }

  async handler() {
    const request = this.request;
    this.haveRequest();

    try {
      const body = await request.json();

      const { json, targetLanguage, disallowedTranslateKeys } = body;

      if (typeof json !== "object") {
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

      const time0 = Date.now();
      const translatedJson = await translateJson({
        jsonData: json,
        batchSize: 10,
        targetLanguage: targetLanguage as TargetLanguage,
        disallowedTranslateKeys,
      });
      const time1 = Date.now();

      this.logger.debug(`Translated JSON in ${time1 - time0}ms`);
      this.webServerResponseLogger.info(
        `Translated JSON in ${time1 - time0}ms`,
      );

      return new Response(JSON.stringify(translatedJson), {
        status: StatusCodes.OK,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
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
