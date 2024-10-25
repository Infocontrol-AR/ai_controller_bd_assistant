import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { DatabaseService } from 'src/database.service';

@Module({
  providers: [QueryService, DatabaseService],
  exports: [QueryService],
})
export class QueryModule {}
