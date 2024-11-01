import { Module } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [],
  providers: [DatabaseService], 
  exports: [DatabaseService], // Para que otros módulos lo usen
})
export class QueryModule {}
