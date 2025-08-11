import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

app.enableCors({
  origin: ['https://item-flow.vercel.app', "http://localhost:3000"],
  credentials: true,
});

  app.use(cookieParser());
  const port = process.env.PORT || 8000;


  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
