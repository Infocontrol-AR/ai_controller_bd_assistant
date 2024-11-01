import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', 
      host: '181.119.169.180',
      port: 3306,
      username: 'admin_remoto',
      password: 'Y$47sdy70',
      database: 'bd_infocontrol_desarrollo',
      synchronize: true,
    }),
    TypeOrmModule.forFeature([]), 
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
