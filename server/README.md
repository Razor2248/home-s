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

Kiểm tra nhanh (mở bằng trình duyệt):

| URL | Kết quả mong đợi |
|---|---|
| `http://localhost:3001/api/v1` | `{"name":"Home Services API","status":"ok",...}` — server đang sống |
| `http://localhost:3001/api/v1/categories` | Mảng JSON 8 danh mục dịch vụ |
| `http://localhost:3001/api/v1/workers` | Mảng JSON danh sách thợ (kèm matchScore) |

Các endpoint cần đăng nhập (jobs, quotes, admin...) phải gửi kèm `Authorization: Bearer <token>` — lấy token bằng cách đăng nhập qua frontend hoặc:

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"khach@demo.vn","password":"123456"}'
```

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

Việc kết nối đã hoàn tất ở Giai đoạn 3: `src/lib/api.ts` tự định tuyến — chế độ **Server API** (chọn ở màn hình đăng nhập) sẽ gọi `remote.ts` → `http.ts` → backend, chế độ **Demo** dùng localStorage. Giao diện giữ nguyên 100%, không cần sửa gì thêm.

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

## 6. Lỗi thường gặp

| Triệu chứng | Nguyên nhân & cách xử lý |
|---|---|
| `Cannot find name 'process'` khi chạy seed | Chạy lại `npm install` rồi `npm run seed` — cần `@types/node` + `tsconfig.json` (đã có sẵn). |
| `Could not find TypeScript configuration file "tsconfig.json"` | Thiếu `tsconfig.json` ở thư mục `server/` — file này đã được bổ sung, pull code mới hoặc copy 3 file: `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`. |
| `Cannot find module '@prisma/client'` hoặc thiếu enum | Prisma client chưa generate — chạy `npx prisma generate` (hoặc `npx prisma migrate dev` sẽ tự generate). |
| `P1001: Can't reach database server` | PostgreSQL chưa chạy — kiểm tra Docker: `docker ps`, hoặc `docker start hs-postgres`. |
| `P2021: The table does not exist` | Chưa migrate — chạy `npx prisma migrate dev` trước khi seed. |
| Frontend báo "Không kết nối được máy chủ" dù backend đang chạy | **CORS**: frontend chạy port 3000 (hoặc 127.0.0.1) mà `CORS_ORIGIN` trong `.env` chỉ liệt kê 5173. Sửa thành danh sách: `CORS_ORIGIN="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"` rồi **khởi động lại backend** (file `.env` chỉ đọc khi khởi động). |
| Cổng 3001 đã được dùng | Đổi `PORT` trong `.env`, nhớ cập nhật địa chỉ API ở màn hình đăng nhập frontend. |

## 7. Bảo mật

- Mật khẩu băm bcrypt (12 rounds), không lưu plaintext.
- Access token JWT 15 phút + Refresh token lưu DB (có thu hồi).
- RBAC bằng `@Roles('customer' | 'worker' | 'admin')` trên từng controller.
- Thợ chỉ thấy việc đúng danh mục; khách chỉ sửa/xem việc của mình (kiểm tra ownership ở service).
