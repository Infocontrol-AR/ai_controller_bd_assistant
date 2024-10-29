import { Module } from '@nestjs/common';
import { BotService } from '../services/bot.service';
import { BotController } from '../controllers/bot.controller';
import { DatabaseService } from '../services/database.service';
import { QueryModule } from './query.module'; 

@Module({
  imports: [QueryModule], 
  controllers: [BotController],
  providers: [BotService, DatabaseService],
})
export class BotModule {}
