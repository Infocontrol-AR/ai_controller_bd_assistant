import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAIChatCompletionResponse } from './openai.interface';

@Injectable()
export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: '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',
    });
  }

  async useGpt4ModelV2(
    model: string = 'gpt-4o',
    temperature: number = 0.8,
    maxTokens: number = 1000,
    messages: any[] = [],
  ): Promise<OpenAIChatCompletionResponse | { error: string }> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      return response as OpenAIChatCompletionResponse;
    } catch (e) {
      return { error: e.message };
    }
  }
}
