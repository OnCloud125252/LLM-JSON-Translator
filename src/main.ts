import { config as dotenvConfig } from "dotenv";

import { info } from "modules/info";
import { translateJson } from "modules/translate-json";
import { RedisClient } from "modules/translate-json/modules/redis";
import { sampleData } from "modules/sample-data";

dotenvConfig();

(async () => {
  await new RedisClient().init(process.env.REDIS_URL);

  const translatedJson = await translateJson(sampleData.a, 10);

  info("\nJSON Translated");

  console.log(JSON.stringify(translatedJson, null, 2));
})();
