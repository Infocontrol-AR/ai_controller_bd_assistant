import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { DatabaseService } from 'src/database.service';

@Module({
  controllers: [BotController],
  providers: [BotService, DatabaseService],
})
export class BotModule {}
