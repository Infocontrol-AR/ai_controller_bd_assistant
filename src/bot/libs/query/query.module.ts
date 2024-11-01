import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { DatabaseModule } from '../database/database.module'; // Asegúrate de importar DatabaseModule

@Module({
  imports: [DatabaseModule], // Importa DatabaseModule para tener acceso a DatabaseService
  providers: [QueryService],
  exports: [QueryService],
})
export class QueryModule {}
