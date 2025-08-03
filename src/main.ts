import { config as dotenvConfig } from "dotenv";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

import { RedisClient } from "modules/redis";
import { Logger } from "modules/logger";
import { ClientError } from "modules/clientError";
import { globalErrorHandler } from "modules/server/global-error-handler";
import { TranslateJson } from "./server/controller/translateJson";

dotenvConfig();

const webServerStartupLogger = new Logger({
  prefix: "web-server",
}).createChild("startup");
const webServerRequestLogger = new Logger({
  prefix: "web-server",
}).createChild("request");
const webServerResponseLogger = new Logger({
  prefix: "web-server",
}).createChild("response");

async function requestLogger(request: Request, server: any) {
  const url = new URL(request.url);

  const requestUuid = uuidv4();
  webServerRequestLogger
    .createChild(requestUuid)
    .info(
      `${server.requestIP(request).address}:${server.requestIP(request).port} | ${request.method} ${url.pathname} | Content length: ${(await request.clone().bytes()).byteLength}`,
    );

  return { requestUuid };
}

(async () => {
  const packageJsonFile = Bun.file("./package.json");
  const packageJson = await packageJsonFile.json();

  webServerStartupLogger.info(`Version: ${packageJson.version}`);
  webServerStartupLogger.info(`Environment: ${process.env.APP_ENVIRONMENT}`);

  await new RedisClient().init(process.env.REDIS_URL);

  const server = Bun.serve({
    hostname: process.env.HOST || "127.0.0.1",
    port: process.env.PORT || 3000,
    development: process.env.APP_ENVIRONMENT === "development",
    maxRequestBodySize: 1000 * 1024 * 1024,
    routes: {
      [TranslateJson.path]: {
        POST: async (request, server) => {
          const { requestUuid } = await requestLogger(request, server);

          return await new TranslateJson({
            request,
            webServerResponseLogger:
              webServerResponseLogger.createChild(requestUuid),
            requestUuid,
          })
            .middleware()
            .guard()
            .POST();
        },
      },
    },
    async fetch(request) {
      const url = new URL(request.url);
      const requestUuid = uuidv4();

      throw new ClientError(
        {
          errorMessage: "Invalid request endpoint or method",
          errorObject: { endpoint: url.pathname, method: request.method },
        },
        StatusCodes.NOT_FOUND,
        requestUuid,
      );
    },
    error: globalErrorHandler,
  });

  webServerStartupLogger.info(
    `Listening on http://${server.hostname}:${server.port}`,
  );
})();
