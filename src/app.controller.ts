import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import OpenAI from 'openai';
import { DatabaseService } from './database.service';
import { log } from 'console';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  async findAll(@Query() query: any) {
    let sql = await this.useFineTunedModel(
      'ft:gpt-4o-mini-2024-07-18:personal::ALBi0URn',
      query.promt,
    );

    sql = this.cleanSQLQuery(sql);
    this.logger.log(sql);

    const response = await this.databaseService.executeQuery(sql);

    return {
      message: 'GET',
      query,
      sql,
      response,
    };
  }

  cleanSQLQuery(query: string) {
    return query.replace(/```sql|```/g, '').trim();
  }

  async useFineTunedModel(modelName: string, prompt: string) {
    const query = prompt;
    const client = new OpenAI({
      apiKey:
        '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',
    });
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: `Please provide only SQL code for the following query: ${query}`,
          name: 'prompt',
        },
      ],
    });

    console.log(response.choices);

    return response.choices[0].message.content;
  }


  
  @Post()
  async create(@Body() query: any) {

    console.log(query);
    return;

    let sql = await this.useFineTunedModel(
      'ft:gpt-4o-mini-2024-07-18:personal::ALBi0URn',
      query.promt,
    );

    sql = this.cleanSQLQuery(sql);
    this.logger.log(sql);

    const response = await this.databaseService.executeQuery(sql);

    return {
      message: 'POST',
      query,
      sql,
      response,
    };
  }
}
