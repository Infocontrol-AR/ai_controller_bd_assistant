import { NestFactory } from '@nestjs/core';
import { BotModule } from './bot/modules/chat.module';

async function bootstrap() {
  const app = await NestFactory.create(BotModule, {
    cors: {
      origin: true,
      credentials: true,
      methods: 'GET,POST,PUT,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Authorization',
    },
  });

  app.enableCors();
  await app.listen(5000);
  console.log(`Servidor escuchando en el puerto: 5000`);
}
bootstrap();
