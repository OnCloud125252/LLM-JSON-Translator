import { StatusCodes } from "http-status-codes";

import { ClientError } from "modules/clientError";
import { handleRecursiveError } from "modules/clientError/handleRecursiveError";
import { Logger } from "modules/logger";
import { translateJson } from "modules/translate-json";

export class TranslateJson {
  static path = "/translate";
  static method = "POST";

  logger = new Logger({
    prefix: "controller",
  }).createChild("translate");

  async handler(request: Request) {
    try {
      const body = await request.json();

      const { json, disallowedTranslateKeys } = body;

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
        );
      }

      const time0 = Date.now();
      const translatedJson = await translateJson({
        jsonData: json,
        batchSize: 10,
        disallowedTranslateKeys,
      });
      const time1 = Date.now();

      this.logger.info(`Translated JSON in ${time1 - time0}ms`);

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
        );
      }

      handleRecursiveError(error);

      throw new ClientError(
        {
          errorMessage: "Failed to translate JSON",
        },
        StatusCodes.BAD_REQUEST,
      );
    }
  }
}
