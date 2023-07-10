import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://pdf-keeper.netlify.app',
    credentials: true,
  });

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
