import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
      methods: 'GET,POST,PUT,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Authorization',
    },
  });

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servidor escuchando en el puerto: ${process.env.PORT ?? 3000}`);
}
bootstrap();
