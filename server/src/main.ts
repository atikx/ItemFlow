import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
