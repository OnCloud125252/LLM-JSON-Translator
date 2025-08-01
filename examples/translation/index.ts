import { sampleData } from "modules/sample-data";
import { translateJson } from "modules/translate-json";
import { RedisClient } from "modules/redis";

(async () => {
  await new RedisClient().init(process.env.REDIS_URL);

  const translatedJson = await translateJson(sampleData.a, 10);

  console.log(JSON.stringify(translatedJson, null, 2));
})();
