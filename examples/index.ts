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

  // biome-ignore lint/suspicious/noConsole: This is an example file, so it's fine to use console.log here.
  console.log(JSON.stringify(translatedJson, null, 2));

  process.exit(0);
}

runExample();
