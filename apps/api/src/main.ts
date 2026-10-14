import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ConfigService } from './common/config/config.service.js';
import { ProblemJsonFilter } from './common/filters/problem-json.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ProblemJsonFilter());
  
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Lexiscene API')
    .setDescription('Vocabulary-learning API')
    .setVersion('1.0')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
}
void bootstrap();
