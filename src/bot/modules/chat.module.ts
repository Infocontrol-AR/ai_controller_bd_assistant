import { Module } from '@nestjs/common';
import { BotController } from '../controllers/bot.controller';
import { QueryModule } from '../libs/query/query.module';
import { OpenAIModule } from '../libs/openai/openai.module'; 
import { ChatService } from '../services/chat.service';
import { DatabaseModule } from '../libs/database/database.module'; // Asegúrate de importar el módulo

@Module({
  imports: [QueryModule, OpenAIModule, DatabaseModule], // Agrega DatabaseModule aquí
  controllers: [BotController],
  providers: [ChatService],
})
export class ChatModule {}
