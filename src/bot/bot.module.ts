import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { DatabaseService } from 'src/database.service';
import { QueryModule } from './query.module'; 

@Module({
  imports: [QueryModule], 
  controllers: [BotController],
  providers: [BotService, DatabaseService],
})
export class BotModule {}
