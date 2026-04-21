import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './ config/envs';

async function bootstrap() {

  const logger = new Logger('AuthMS-Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      // Objeto de configuración del microservicio
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      }
    }
  )

  // Configuración global de pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  })
  );

  await app.listen();
  logger.log(`Auth Microservice running on port ${envs.port}`);
}
bootstrap();
