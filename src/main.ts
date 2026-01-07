import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ 들어오는 모든 요청 로그 (토스가 도착하는지 확인용)
  app.use((req, res, next) => {
    console.log([IN] ${req.method} ${req.originalUrl});
    next();
  });

  // CORS
  app.enableCors({
    origin: '*',
  });

  // class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const exportPort = process.env.PORT || 3000;
  await app.listen(exportPort, () => {
    console.log(Server is running on port ${exportPort});
  });
}
bootstrap();
