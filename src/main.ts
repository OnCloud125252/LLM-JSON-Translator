import { config as dotenvConfig } from "dotenv";

import { translateJson } from "modules/translate-json";
import { RedisClient } from "modules/redis";
import { sampleData } from "modules/sample-data";
import { Logger } from "modules/logger";

dotenvConfig();

const logger = new Logger().createChild("main");

(async () => {
  await new RedisClient().init(process.env.REDIS_URL);

  const translatedJson = await translateJson(sampleData.a, 10);

  logger.info("\nJSON Translated");

  console.log(JSON.stringify(translatedJson, null, 2));

  process.exit(0);
})();
