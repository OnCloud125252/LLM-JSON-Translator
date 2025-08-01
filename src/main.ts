import { config as dotenvConfig } from "dotenv";
import { StatusCodes } from "http-status-codes";

import { RedisClient } from "modules/redis";
import { Logger } from "modules/logger";
import { ClientError } from "modules/clientError";
import { globalErrorHandler } from "modules/server/global-error-handler";
import { TranslateJson } from "./server/controller/translateJson";

dotenvConfig();

const webServerLogger = new Logger({
  prefix: "web-server",
}).createChild("startup");

(async () => {
  await new RedisClient().init(process.env.REDIS_URL);

  const server = Bun.serve({
    hostname: process.env.HOST || "127.0.0.1",
    port: process.env.PORT || 3000,
    async fetch(request) {
      const url = new URL(request.url);
      switch (url.pathname) {
        case TranslateJson.path: {
          switch (request.method) {
            case TranslateJson.method: {
              return new TranslateJson().handler(request);
            }
          }
          break;
        }
      }

      throw new ClientError(
        {
          errorMessage: "Invalid endpoint",
          errorObject: { endpoint: url.pathname, method: request.method },
        },
        StatusCodes.NOT_FOUND,
      );
    },
    error: globalErrorHandler,
  });

  webServerLogger.info(
    `Listening on http://${server.hostname}:${server.port} ...`,
  );
})();
