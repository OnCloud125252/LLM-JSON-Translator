import { sampleData } from "modules/sample-data";
import { translateJson } from "modules/translate-json";
import { RedisClient } from "modules/redis";
import { TargetLanguage } from "modules/translate-json/modules/translate-batch";

(async () => {
  await new RedisClient().init(process.env.REDIS_URL);

  const translatedJson = await translateJson({
    jsonData: sampleData.a,
    batchSize: 10,
    targetLanguage: TargetLanguage.ZH_TW,
  });

  console.log(JSON.stringify(translatedJson, null, 2));
})();
