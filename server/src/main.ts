import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: config.get("CORS_ORIGIN", "http://localhost:5173"),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
  );

  const port = config.get("PORT", 3001);
  await app.listen(port);
  console.log(`🔧 Home Services API chạy tại http://localhost:${port}/api/v1`);
}
bootstrap();
