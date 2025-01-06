import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MyLoggerService } from './employees/my-logger/my-logger.service.js';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.getHttpServer().setTimeout(3600000);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useLogger(app.get(MyLoggerService));
  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: ['http://localhost:3000', 'http://192.168.1.10:3000'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 6460);
}
bootstrap();
