import { config as dotenvConfig } from "dotenv";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

import { ClientError } from "modules/clientError";
import { Logger } from "modules/logger";
import { redisClient } from "modules/redis";
import { globalErrorHandler } from "modules/server/global-error-handler";
import { handleTranslateJsonRequest } from "./server/controller/translateJson";

dotenvConfig();

const logger = new Logger({ prefix: "web-server" });
const DEFAULT_BATCH_SIZE = 10;

async function logRequest(request: Request, server: any): Promise<string> {
  const requestUuid = uuidv4();
  const url = new URL(request.url);
  const clientIp = server.requestIP(request);
  const contentLength = (await request.clone().bytes()).byteLength;

  logger
    .createChild("request")
    .createChild(requestUuid)
    .info(
      `${clientIp.address}:${clientIp.port} | ${request.method} ${url.pathname} | Content length: ${contentLength}`,
    );

  return requestUuid;
}

(async () => {
  const packageJson = await Bun.file("./package.json").json();

  logger.createChild("startup").info(`Version: ${packageJson.version}`);
  logger
    .createChild("startup")
    .info(`Environment: ${process.env.APP_ENVIRONMENT}`);

  await redisClient.init(process.env.REDIS_URL);

  const server = Bun.serve({
    hostname: process.env.HOST || "127.0.0.1",
    port: process.env.PORT || 3000,
    development: process.env.APP_ENVIRONMENT === "development",
    maxRequestBodySize: 1000 * 1024 * 1024,
    routes: {
      "/translate": {
        POST: async (request, server) => {
          const requestUuid = await logRequest(request, server);
          const responseLogger = logger
            .createChild("response")
            .createChild(requestUuid);
          return handleTranslateJsonRequest(
            request,
            responseLogger,
            requestUuid,
            DEFAULT_BATCH_SIZE,
          );
        },
      },
    },
    async fetch(request) {
      const url = new URL(request.url);
      throw new ClientError(
        {
          errorMessage: "Invalid request endpoint or method",
          errorObject: { endpoint: url.pathname, method: request.method },
        },
        StatusCodes.NOT_FOUND,
        uuidv4(),
      );
    },
    error: globalErrorHandler,
  });

  logger
    .createChild("startup")
    .info(`Listening on http://${server.hostname}:${server.port}`);
})();
