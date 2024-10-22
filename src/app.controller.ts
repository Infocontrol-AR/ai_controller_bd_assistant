import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import OpenAI from 'openai';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async findAll(@Query() query: any) {

    await this.useFineTunedModel('ft:gpt-4o-mini-2024-07-18:personal::AL9JxT2W', query.promt);

    
  }

  async useFineTunedModel(modelName: string, prompt: string) {
    const client = new OpenAI({
      apiKey:
        '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',
    });
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
    });

    console.log(response?.choices[0]?.message?.content);
  }
}
