import { SAMPLE_DATA_A } from "examples/sample-data/data/a.js";
import { redisClient } from "modules/redis";
import { translateJson } from "modules/translate-json";
import { TargetLanguage } from "modules/translate-json/modules/translate-batch";

async function runExample(): Promise<void> {
  await redisClient.init(process.env.REDIS_URL);

  const translatedJson = await translateJson({
    jsonData: SAMPLE_DATA_A,
    batchSize: 10,
    targetLanguage: TargetLanguage.ZH_TW,
  });

  console.log(JSON.stringify(translatedJson, null, 2));

  process.exit(0);
}

runExample();
