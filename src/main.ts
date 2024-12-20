import { NestFactory } from '@nestjs/core';
import { ChatModule } from './bot/modules/chat.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule, {
    cors: {
      origin: true,  
      credentials: true,  
      methods: 'GET,POST,PUT,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Authorization',
    },
  });

  app.use(bodyParser.json({ limit: '50mb' }));  
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(5000);
  console.log(`Servidor escuchando en el puerto: 5000`);
}
bootstrap();
