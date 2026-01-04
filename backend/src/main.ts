import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,

      // ✅ Validation hatalarını "field -> [messages]" formatında üretir
      exceptionFactory: (errors) => {
        const details: Record<string, string[]> = {};

        for (const err of errors) {
          if (err.constraints) {
            details[err.property] = Object.values(err.constraints);
          }
        }

        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Validation error',
          details,
        });
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());

  // Frontend domain'e göre sonra sıkılaştıracağız
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
