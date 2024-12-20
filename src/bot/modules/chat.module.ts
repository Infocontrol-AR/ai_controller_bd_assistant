import { Module } from '@nestjs/common';
import { CrudService } from '../services/crud.service';
import { HistoryService  } from '../services/history.service';
import { BotController } from '../controllers/bot.controller';
import { QueryModule } from '../libs/query/query.module';
import { OpenAIModule } from '../libs/openai/openai.module'; 
import { ChatService } from '../services/chat.service';
import { DatabaseModule } from '../libs/database/database.module'; 
import { ComputerVisionModule } from '../libs/computer-vision/computer-vision.module'; 
import { ComputerVisionService } from '../libs/computer-vision/computer-vision.service'; 

@Module({
  imports: [QueryModule, OpenAIModule, DatabaseModule, ComputerVisionModule],
  controllers: [BotController],
  providers: [ChatService, CrudService, HistoryService, ComputerVisionService],
  exports: [CrudService, HistoryService],
})
export class ChatModule {}
