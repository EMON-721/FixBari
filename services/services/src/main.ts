import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/services");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost",
      "http://localhost:3000",
      "http://localhost:3010",
      "http://localhost:3020",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Health check endpoint for Railway
  app.getHttpAdapter().getInstance().get('/api/services/health', (_req: unknown, res: { json: (data: unknown) => void }) => {
    res.json({ status: 'healthy', service: 'services', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 3005;
  await app.listen(port);

  console.log(`Services microservice running on port ${port}`);
}

bootstrap();
