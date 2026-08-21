# Home Services — Backend API (Giai đoạn 2)

NestJS + Prisma (PostgreSQL) + Socket.io. Toàn bộ endpoint nằm dưới `/api/v1`.

## 1. Chạy PostgreSQL (chọn 1 trong 2)

```bash
# Cách A — Docker (khuyến nghị)
docker run --name hs-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=home_services -p 5432:5432 -d postgres:16

# Cách B — máy đã cài PostgreSQL
createdb home_services
```

## 2. Cài đặt & khởi tạo

```bash
cp .env.example .env          # chỉnh lại nếu khác cấu hình
npm install
npx prisma migrate dev        # tạo 13 bảng theo schema.prisma
npm run seed                  # nạp dữ liệu demo (khớp ID với frontend)
npm run dev                   # chạy tại http://localhost:3001
```

Kiểm tra nhanh: `GET http://localhost:3001/api/v1/categories`

## 3. Tài khoản demo (mật khẩu: 123456)

| Vai trò | Email |
|---|---|
| Khách hàng | khach@demo.vn |
| Thợ | tho@demo.vn |
| Admin | admin@demo.vn |

## 4. Kết nối frontend (đầu Giai đoạn 3)

Trong thư mục gốc của frontend, tạo `.env`:

```
VITE_API_URL=http://localhost:3001/api/v1
```

Sau đó thay ruột các hàm trong `src/lib/api.ts` bằng `src/lib/http.ts` (đã chuẩn bị sẵn) — giao diện giữ nguyên.

## 5. Cấu trúc

```
server/
├── prisma/
│   ├── schema.prisma     # ERD: 14 bảng + enum + quan hệ + index
│   └── seed.ts           # Dữ liệu demo (ID khớp frontend)
└── src/
    ├── main.ts           # Bootstrap, CORS, /api/v1
    ├── app.module.ts
    ├── prisma.service.ts # PrismaClient toàn cục
    ├── common.ts         # JWT guard, RBAC (@Roles), @CurrentUser, decorator @Public
    ├── auth/             # login, register customer/worker, refresh token, /me
    ├── users/            # hồ sơ người dùng
    ├── workers/          # tìm thợ, hồ sơ thợ, match score, yêu thích
    ├── jobs/             # đăng việc, feed việc, start/complete/cancel
    ├── quotes/           # gửi báo giá, chấp nhận báo giá (transaction)
    ├── reviews/          # đánh giá + cập nhật điểm thợ
    ├── chat/             # REST messages + Socket.io gateway
    ├── notifications/    # thông báo trong app
    └── admin/            # stats, duyệt thợ, khóa user, CRUD danh mục, xử lý báo cáo
```

## 6. Bảo mật

- Mật khẩu băm bcrypt (12 rounds), không lưu plaintext.
- Access token JWT 15 phút + Refresh token lưu DB (có thu hồi).
- RBAC bằng `@Roles('customer' | 'worker' | 'admin')` trên từng controller.
- Thợ chỉ thấy việc đúng danh mục; khách chỉ sửa/xem việc của mình (kiểm tra ownership ở service).
