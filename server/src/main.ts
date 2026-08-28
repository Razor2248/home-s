import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api/v1");

  // CORS: nhận danh sách origin ngăn cách bởi dấu phẩy (env CORS_ORIGIN).
  // Mặc định cho phép cả 5173 lẫn 3000 (và 127.0.0.1) để chạy local không cần cấu hình.
  const rawOrigins = config.get<string>(
    "CORS_ORIGIN",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
  );
  const allowed = rawOrigins.split(",").map((s) => s.trim()).filter(Boolean);
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) cb(null, true);
      else cb(new Error(`CORS bị chặn cho origin: ${origin}`));
    },
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
