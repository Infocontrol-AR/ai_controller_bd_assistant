import { Module } from '@nestjs/common';
import { CrudService } from '../services/crud.service';
import { HistoryService  } from '../services/history.service';
import { BotController } from '../controllers/bot.controller';
import { QueryModule } from '../libs/query/query.module';
import { OpenAIModule } from '../libs/openai/openai.module'; 
import { ChatService } from '../services/chat.service';
import { DatabaseModule } from '../libs/database/database.module'; 

@Module({
  imports: [QueryModule, OpenAIModule, DatabaseModule],
  controllers: [BotController],
  providers: [ChatService, CrudService, HistoryService],
  exports: [CrudService, HistoryService],
})
export class ChatModule {}
