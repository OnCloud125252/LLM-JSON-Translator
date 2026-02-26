import { encoding_for_model, TiktokenModel } from "tiktoken";

export interface ModelConfig {
  name: string;
  maxOutputTokens: number;
  safetyRatio: number;
}

// Model configurations with their output limits
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "gpt-4.1-mini": {
    name: "gpt-4.1-mini",
    maxOutputTokens: 32768,
    safetyRatio: Number(process.env.BATCH_TOKEN_SAFETY_RATIO || 0.7),
  },
  "gpt-4.1": {
    name: "gpt-4.1",
    maxOutputTokens: 32768,
    safetyRatio: Number(process.env.BATCH_TOKEN_SAFETY_RATIO || 0.7),
  },
  "gpt-4.1-nano": {
    name: "gpt-4.1-nano",
    maxOutputTokens: 32768,
    safetyRatio: Number(process.env.BATCH_TOKEN_SAFETY_RATIO || 0.7),
  },
  "gpt-4o-mini": {
    name: "gpt-4o-mini",
    maxOutputTokens: 16384,
    safetyRatio: Number(process.env.BATCH_TOKEN_SAFETY_RATIO || 0.6),
  },
  "gpt-4o": {
    name: "gpt-4o",
    maxOutputTokens: 16384,
    safetyRatio: Number(process.env.BATCH_TOKEN_SAFETY_RATIO || 0.6),
  },
};

export interface TokenEstimate {
  textTokens: number;
  jsonOverheadTokens: number;
  systemPromptTokens: number;
  totalTokens: number;
}

export class TokenCalculator {
  private encoder;
  private modelConfig: ModelConfig;

  constructor(modelName: string) {
    // Map model name to tiktoken model name
    const tiktokenModel = this.mapToTiktokenModel(modelName);
    this.encoder = encoding_for_model(tiktokenModel);
    this.modelConfig =
      MODEL_CONFIGS[modelName] || MODEL_CONFIGS["gpt-4.1-mini"];
  }

  private mapToTiktokenModel(modelName: string): TiktokenModel {
    // tiktoken doesn't have exact mappings for all model variants
    // Use compatible encodings based on model family
    if (modelName.startsWith("gpt-4.1")) {
      return "gpt-4o" as TiktokenModel; // gpt-4.1 uses same encoding as gpt-4o
    }
    if (modelName.startsWith("gpt-4o")) {
      return "gpt-4o" as TiktokenModel;
    }
    return "gpt-4o" as TiktokenModel; // Default fallback
  }

  /**
   * Calculate tokens for a single text item
   */
  countTokens(text: string): number {
    return this.encoder.encode(text).length;
  }

  /**
   * Calculate tokens for the complete API payload.
   * Returns both token estimate and the formatted batch string to avoid double JSON.stringify.
   */
  estimateBatchTokens(
    items: Array<{ path?: string; text?: string }>,
    systemPrompt: string,
  ): TokenEstimate & { formattedBatch: string } {
    // Single JSON.stringify call - cache the result
    const formattedBatch = JSON.stringify({ needToTranslate: items });

    // Calculate text content tokens
    const textTokens = items.reduce((sum, item) => {
      const textTokenCount = item.text ? this.countTokens(item.text) : 0;
      const pathTokenCount = item.path ? this.countTokens(item.path) : 0;
      return sum + textTokenCount + pathTokenCount;
    }, 0);

    // Calculate JSON wrapper overhead from the already-stringified batch
    const jsonOverheadTokens = this.countTokens(formattedBatch);

    // Calculate system prompt tokens
    const systemPromptTokens = this.countTokens(systemPrompt);

    return {
      textTokens,
      jsonOverheadTokens,
      systemPromptTokens,
      totalTokens: jsonOverheadTokens + systemPromptTokens,
      formattedBatch,
    };
  }

  /**
   * Get the maximum safe input tokens for this model
   */
  getMaxInputTokens(): number {
    return Math.floor(
      this.modelConfig.maxOutputTokens * this.modelConfig.safetyRatio,
    );
  }

  /**
   * Check if a batch would exceed the safe token limit
   */
  wouldExceedLimit(
    items: Array<{ path?: string; text?: string }>,
    systemPrompt: string,
  ): boolean {
    const estimate = this.estimateBatchTokens(items, systemPrompt);
    return estimate.totalTokens > this.getMaxInputTokens();
  }

  free(): void {
    this.encoder.free();
  }
}
