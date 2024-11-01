import { Module } from '@nestjs/common';
import { BotController } from '../controllers/bot.controller';
import { QueryModule } from '../libs/query/query.module';
import { DatabaseModule } from '../libs/database/database.module';
import { OpenAIModule } from '../libs/openai/openai.module'; 
import { ChatService } from '../services/chat.service';

@Module({
  imports: [QueryModule, DatabaseModule, OpenAIModule], 
  controllers: [BotController],
  providers: [ChatService],
})
export class BotModule {}
