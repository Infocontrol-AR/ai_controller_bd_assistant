import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService, DataSource],
  exports: [DatabaseService, DataSource], 
})
export class DatabaseModule {}
