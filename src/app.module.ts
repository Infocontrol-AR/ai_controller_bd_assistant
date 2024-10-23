import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { BotModule } from './bot/bot.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql', // Cambia esto según tu base de datos
      host: '181.119.169.180',
      port: 3306,
      username: 'admin_remoto',
      password: 'Y$47sdy70',
      database: 'bd_infocontrol_desarrollo',
      synchronize: true, // No usar en producción
    }),
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService,DatabaseService],
  
})
export class AppModule {}

// todo
// ! pasa esto a un .env
// ? respertar estuctura de cartpetas y archivos
