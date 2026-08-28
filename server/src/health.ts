import { Controller, Get } from "@nestjs/common";
import { Public } from "./common";

/**
 * Health check — gõ http://localhost:3001/api/v1 trên trình duyệt
 * để xác nhận server đang sống (không còn 404 ở đường dẫn gốc).
 */
@Public()
@Controller()
export class HealthController {
  @Get()
  health() {
    return {
      name: "Home Services API",
      status: "ok",
      version: "0.3.0",
      time: new Date().toISOString(),
      thuNgay: [
        "GET  /api/v1/categories        → 8 danh mục dịch vụ (không cần đăng nhập)",
        "POST /api/v1/auth/login         → { email: 'khach@demo.vn', password: '123456' }",
        "GET  /api/v1/workers            → danh sách thợ kèm matchScore",
      ],
      docs: "Mở frontend → trang /docs để xem đầy đủ 50+ endpoint",
    };
  }
}
