import { Module } from '@nestjs/common';
import { QueryService } from '../services/query.service';
import { DatabaseService } from 'src/bot/services/database.service';

@Module({
  providers: [QueryService, DatabaseService],
  exports: [QueryService],
})
export class QueryModule {}
