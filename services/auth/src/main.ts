import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/auth");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3010",
      "http://localhost:3020",
    ],
    credentials: true,
  });

  // Health check endpoint for Railway
  app.getHttpAdapter().getInstance().get('/api/auth/health', (_req: unknown, res: { json: (data: unknown) => void }) => {
    res.json({ status: 'healthy', service: 'auth', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Auth service running on port ${port}`);
}

bootstrap();
