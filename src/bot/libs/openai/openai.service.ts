import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey:'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',
    });
  }

  async useGpt4ModelV2(
    model: string = 'gpt-4o',
    temperature: number = 0.8,
    maxTokens: number = 1000,
    messages: any[] = [],
  ) {

    let response = {};

    try {
      response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });
  
      return response;
    } catch (e) {
      return {error: e.message};
    }
  }
}
