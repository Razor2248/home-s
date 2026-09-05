# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP
## NỀN TẢNG WEB KẾT NỐI DỊCH VỤ GIA ĐÌNH / TÌM THỢ

---

# MỤC LỤC

- [LỜI CAM ĐOAN](#lời-cam-đoan)
- [LỜI CẢM ƠN](#lời-cảm-ơn)
- [NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN](#nhận-xét-của-giảng-viên-hướng-dẫn)
- [NHẬN XÉT CỦA PHẢN BIỆN](#nhận-xét-của-phản-biện)
- [MỤC LỤC](#mục-lục)
- [DANH MỤC HÌNH ẢNH](#danh-mục-hình-ảnh)
- [DANH MỤC BẢNG BIỂU](#danh-mục-bảng-biểu)
- [DANH MỤC TỪ VIẾT TẮT](#danh-mục-từ-viết-tắt)

---

## CHƯƠNG 1: TỔNG QUAN {#chapter-1}

### 1.1. Đặt vấn đề {#section-1-1}
- 1.1.1. Thực trạng thị trường dịch vụ gia đình tại Việt Nam
- 1.1.2. Những khó khăn của khách hàng khi tìm thợ dịch vụ
- 1.1.3. Những thách thức của thợ dịch vụ trong việc tìm khách hàng
- 1.1.4. Sự cần thiết của nền tảng kết nối trung gian

### 1.2. Mục tiêu đề tài {#section-1-2}
- 1.2.1. Mục tiêu tổng quát
- 1.2.2. Mục tiêu cụ thể
  - Xây dựng nền tảng web kết nối Khách hàng - Thợ - Admin
  - Minh bạch hóa thông tin giá cả và đánh giá chất lượng
  - Hỗ trợ tìm kiếm theo khu vực địa lý
  - Tích hợp thanh toán trực tuyến và chat real-time

### 1.3. Phạm vi nghiên cứu {#section-1-3}
- 1.3.1. Phạm vi chức năng
  - Đối với Khách hàng: Đăng việc, xem báo giá, chọn thợ, thanh toán, đánh giá
  - Đối với Thợ: Nhận việc, gửi báo giá, cập nhật trạng thái, quản lý lịch làm
  - Đối với Admin: Quản lý người dùng, duyệt hồ sơ thợ, thống kê, xử lý khiếu nại
- 1.3.2. Phạm vi không gian
  - Ứng dụng web (Web Application)
  - Khu vực áp dụng: Các quận/huyện tại TP.HCM và Hà Nội (giai đoạn đầu)
- 1.3.3. Phạm vi đối tượng sử dụng
  - Khách hàng có nhu cầu sửa chữa, bảo trì, vệ sinh nhà cửa
  - Thợ dịch vụ gia đình (thợ điện, nước, khóa, giúp việc...)
  - Quản trị viên hệ thống

### 1.4. Ý nghĩa thực tiễn {#section-1-4}
- 1.4.1. Đối với khách hàng
- 1.4.2. Đối với thợ dịch vụ
- 1.4.3. Đối với xã hội và nền kinh tế chia sẻ

### 1.5. Cấu trúc báo cáo {#section-1-5}

---

## CHƯƠNG 2: CƠ SỞ LÝ THUYẾT {#chapter-2}

### 2.1. Tổng quan về Service Marketplace {#section-2-1}
- 2.1.1. Định nghĩa và đặc trưng
- 2.1.2. Mô hình kinh tế chia sẻ (Sharing Economy)
- 2.1.3. Các nền tảng tương tự trên thế giới và Việt Nam
  - TaskRabbit (Mỹ)
  - Fixr (Châu Âu)
  - bTaskee, Rada.vn (Việt Nam)
- 2.1.4. Bài học kinh nghiệm từ các nền tảng hiện có

### 2.2. Công nghệ Frontend {#section-2-2}
- 2.2.1. ReactJS và Virtual DOM
  - Kiến trúc component-based
  - Cơ chế render và tối ưu hiệu năng
- 2.2.2. TypeScript
  - Lợi ích của Static Typing
  - Interfaces và Types trong dự án lớn
- 2.2.3. Tailwind CSS
  - Phương pháp Utility-First CSS
  - Ưu điểm so với CSS truyền thống
- 2.2.4. Vite Build Tool
  - Tốc độ phát triển với HMR (Hot Module Replacement)
  - Tối ưu bundle size

### 2.3. Công nghệ Backend {#section-2-3}
- 2.3.1. Node.js và JavaScript Runtime
  - Event-driven architecture
  - Non-blocking I/O
- 2.3.2. NestJS Framework
  - Kiến trúc Module-based
  - Dependency Injection
  - Decorators và Metadata
  - Guards, Interceptors, Pipes
- 2.3.3. PostgreSQL Database
  - Ưu điểm của cơ sở dữ liệu quan hệ
  - ACID properties
  - Indexing và Query optimization
- 2.3.4. Prisma ORM
  - Type-safe database access
  - Migration management
  - Relation loading strategies

### 2.4. Bảo mật và Xác thực {#section-2-4}
- 2.4.1. JSON Web Token (JWT)
  - Cấu trúc JWT (Header, Payload, Signature)
  - Access Token vs Refresh Token
  - Token expiration và rotation
- 2.4.2. Mã hóa mật khẩu với bcrypt
  - Salt và Hash
  - Độ an toàn của bcrypt
- 2.4.3. Role-Based Access Control (RBAC)
  - Phân quyền theo vai trò
  - Implementation trong NestJS

### 2.5. Giao tiếp thời gian thực {#section-2-5}
- 2.5.1. WebSocket Protocol
  - So sánh với HTTP polling
  - Handshake process
- 2.5.2. Socket.io Library
  - Rooms và Namespaces
  - Event emission và listening
  - Fallback mechanisms

### 2.6. Cổng thanh toán VNPay {#section-2-6}
- 2.6.1. Tổng quan về VNPay Gateway
- 2.6.2. Quy trình thanh toán QR Code và thẻ
- 2.6.3. Secure Hash Algorithm (HMAC)
- 2.6.4. IPN (Instant Payment Notification)

### 2.7. Tổng kết chương 2 {#section-2-7}

---

## CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG {#chapter-3}

### 3.1. Phân tích yêu cầu {#section-3-1}
#### 3.1.1. Yêu cầu chức năng
- **Đối với Khách hàng:**
  - Đăng ký, đăng nhập, quản lý tài khoản
  - Đăng bài công việc (mô tả, địa điểm, ngân sách, thời gian)
  - Xem danh sách báo giá từ các thợ
  - Chọn thợ và chấp nhận báo giá
  - Theo dõi tiến độ công việc
  - Thanh toán online hoặc COD
  - Đánh giá và xếp hạng thợ
  - Chat với thợ
  - Lưu thợ yêu thích
  - Xem lịch sử đặt dịch vụ

- **Đối với Thợ:**
  - Đăng ký, đăng nhập, quản lý tài khoản
  - Tạo và cập nhật hồ sơ cá nhân (kỹ năng, kinh nghiệm, khu vực)
  - Chờ admin duyệt hồ sơ
  - Xem danh sách công việc phù hợp
  - Gửi báo giá cho khách hàng
  - Chấp nhận/từ chối công việc
  - Cập nhật trạng thái công việc
  - Chat với khách hàng
  - Xem lịch làm việc
  - Quản lý thu nhập

- **Đối với Admin:**
  - Đăng nhập hệ thống quản trị
  - Xem thống kê tổng quan (dashboard)
  - Quản lý người dùng (khóa/mở khóa)
  - Duyệt hồ sơ thợ
  - Quản lý danh mục dịch vụ
  - Quản lý khu vực phục vụ
  - Xem báo cáo, khiếu nại
  - Xử lý tranh chấp

#### 3.1.2. Yêu cầu phi chức năng
- **Hiệu năng:**
  - Thời gian phản hồi API < 500ms
  - Hỗ trợ đồng thời 1000+ users
  - Real-time chat độ trễ < 100ms
- **Bảo mật:**
  - Mã hóa mật khẩu
  - Chống SQL Injection, XSS
  - HTTPS cho tất cả giao tiếp
  - Rate limiting cho API
- **Khả năng mở rộng:**
  - Kiến trúc module dễ bổ sung tính năng
  - Database có thể sharding theo khu vực
- **Giao diện:**
  - Responsive design (mobile-first)
  - Thời gian tải trang < 3 giây
  - Accessibility chuẩn WCAG

#### 3.1.3. Biểu đồ Use Case
- Use Case tổng thể hệ thống
- Use Case chi tiết cho Khách hàng
- Use Case chi tiết cho Thợ
- Use Case chi tiết cho Admin

### 3.2. Thiết kế kiến trúc hệ thống {#section-3-2}
#### 3.2.1. Kiến trúc tổng thể
- Mô hình Client-Server
- Separation of Concerns (Frontend/Backend/Database)
- Third-party integrations (VNPay, Socket.io)

#### 3.2.2. Sơ đồ triển khai (Deployment Diagram)
- Web Server (Node.js/NestJS)
- Database Server (PostgreSQL)
- Frontend Hosting (Vercel/Netlify/CDN)
- External Services (VNPay Gateway)

#### 3.2.3. Luồng dữ liệu chính
- Luồng đăng ký/đăng nhập
- Luồng đăng việc và nhận báo giá
- Luồng thanh toán
- Luồng chat real-time

### 3.3. Thiết kế cơ sở dữ liệu {#section-3-3}
#### 3.3.1. Mô hình thực thể liên kết (ERD)
- 17 bảng chính
- 6 enum types
- Quan hệ giữa các实体

#### 3.3.2. Từ điển dữ liệu
- **Bảng User:** id, email, password, fullName, phone, role, avatar, createdAt, updatedAt
- **Bảng WorkerProfile:** id, userId, bio, yearsOfExperience, serviceCategories, districts, rating, ratingCount, jobsDone, isVerified, verifiedAt
- **Bảng Job:** id, customerId, title, description, category, address, districtId, status, budget, urgency, scheduledAt, createdAt
- **Bảng Quote:** id, jobId, workerId, price, message, status, createdAt
- **Bảng Review:** id, jobId, customerId, workerId, rating, comment, createdAt
- **Bảng ChatMessage:** id, jobId, senderId, content, messageType, createdAt, readAt
- **Bảng Payment:** id, jobId, amount, method, status, transactionId, paidAt
- **Bảng Notification:** id, userId, title, content, type, isRead, createdAt
- **Bảng Favorite:** id, customerId, workerId, createdAt
- **Bảng Report:** id, reporterId, targetUserId, reason, description, status, createdAt
- **Bảng Category:** id, name, description, icon
- **Bảng District:** id, name, city, isActive
- **Bảng CategoryChangeRequest:** id, workerId, newCategoryId, reason, status, reviewedBy, reviewedAt
- **Bảng PasswordReset:** id, userId, otp, expiresAt, isUsed, createdAt
- ... (chi tiết từng field, kiểu dữ liệu, constraints)

#### 3.3.3. Chuẩn hóa dữ liệu
- Phân tích dạng chuẩn 1NF, 2NF, 3NF
- Giải thích việc loại bỏ redundant data

### 3.4. Thiết kế API {#section-3-4}
#### 3.4.1. Danh sách API endpoints
- **Auth Module:** POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/forgot-password, POST /auth/reset-password
- **Users Module:** GET /users/profile, PATCH /users/profile, PUT /users/avatar
- **Workers Module:** GET /workers, GET /workers/:id, PATCH /workers/profile, POST /workers/verify-request
- **Jobs Module:** GET /jobs, POST /jobs, GET /jobs/:id, PATCH /jobs/:id, DELETE /jobs/:id
- **Quotes Module:** GET /quotes?jobId=, POST /quotes, PATCH /quotes/:id/status, POST /quotes/:id/accept
- **Reviews Module:** POST /reviews, GET /reviews?workerId=
- **Chat Module:** REST: GET /chat/history/:jobId, WebSocket: sendMessage, typing, read
- **Payments Module:** POST /payments/create-url, POST /payments/ipn
- **Notifications Module:** GET /notifications, PATCH /notifications/:id/read
- **Admin Module:** GET /admin/stats, PATCH /admin/users/:id/status, PATCH /admin/workers/:id/verify

#### 3.4.2. Request/Response Examples
- Ví dụ chi tiết cho 5 API quan trọng nhất

### 3.5. Thiết kế luồng xử lý (Sequence Diagrams) {#section-3-5}
#### 3.5.1. Luồng đăng ký và đăng nhập
- Sequence Diagram: Register với email/password
- Sequence Diagram: Login với JWT issuance
- Sequence Diagram: Refresh Token flow

#### 3.5.2. Luồng đăng việc và chọn thợ
- Customer posts a job
- Workers view job feed
- Worker sends quote
- Customer reviews quotes
- Customer accepts a quote
- Job status transitions

#### 3.5.3. Luồng thanh toán VNPay
- Create payment URL
- Redirect to VNPay
- User completes payment
- IPN callback handling
- Update payment status

#### 3.5.4. Luồng chat real-time
- Join chat room
- Send message
- Broadcast to room
- Mark as read

### 3.6. Thiết kế giao diện {#section-3-6}
#### 3.6.1. Nguyên tắc thiết kế UI/UX
- Màu sắc chủ đạo và ý nghĩa
- Typography và hierarchy
- Consistency across pages

#### 3.6.2. Wireframes và mô tả màn hình
- **Landing Page:** Hero section, features, how it works, testimonials
- **Login/Register Page:** Form design, social login options
- **Customer Dashboard:** Job posting form, active jobs list, quotes view
- **Worker Dashboard:** Job feed, profile editor, earnings summary
- **Admin Dashboard:** Statistics charts, user management tables, verification queue
- **Chat Interface:** Message bubbles, input area, online status

#### 3.6.3. Component Hierarchy
- Tree structure của React components
- Reusable components library

### 3.7. Tổng kết chương 3 {#section-3-7}

---

## CHƯƠNG 4: TRIỂN KHAI VÀ CÀI ĐẶT ỨNG DỤNG {#chapter-4}

### 4.1. Môi trường phát triển {#section-4-1}
#### 4.1.1. Cấu hình phần cứng và phần mềm
- CPU, RAM, Storage requirements
- Operating System (Windows/macOS/Linux)

#### 4.1.2. Bảng phiên bản công nghệ
| Công nghệ | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| Node.js | v18.x LTS | JavaScript runtime |
| npm | v9.x | Package manager |
| PostgreSQL | v15.x | Database |
| Prisma | v5.x | ORM |
| NestJS | v10.x | Backend framework |
| React | v18.x | Frontend library |
| TypeScript | v5.x | Type safety |
| Vite | v5.x | Build tool |
| Tailwind CSS | v3.x | Styling |
| Socket.io | v4.x | Real-time communication |

#### 4.1.3. Cài đặt môi trường
- Hướng dẫn cài đặt Node.js và npm
- Cài đặt PostgreSQL (native hoặc Docker)
- Cài đặt các dependencies

### 4.2. Cấu trúc thư mục dự án {#section-4-2}
#### 4.2.1. Frontend structure
```
src/
├── pages/          # Page components (routes)
├── components/     # Reusable UI components
├── lib/            # Utilities, API client, socket client
├── data/           # Mock data, test cases
└── App.tsx         # Root component
```

#### 4.2.2. Backend structure
```
server/src/
├── auth/           # Authentication module
├── users/          # User management
├── workers/        # Worker profiles and matching
├── jobs/           # Job postings
├── quotes/         # Quotation system
├── reviews/        # Reviews and ratings
├── chat/           # Chat gateway and service
├── notifications/  # Push notifications
├── payments/       # VNPay integration
├── admin/          # Admin dashboard APIs
├── districts/      # Location management
├── common/         # Shared utilities, decorators, guards
└── main.ts         # Application entry point
```

### 4.3. Cài đặt các module chức năng chính {#section-4-3}
#### 4.3.1. Module Authentication
- Implementation của JWT Strategy
- @Roles() Decorator cho RBAC
- Refresh Token mechanism
- Password hashing với bcrypt
- Code snippets minh họa

#### 4.3.2. Module Job và Quotation
- Job status machine (PENDING → OPEN → IN_PROGRESS → COMPLETED)
- Transaction handling cho việc accept quote
- Unique constraint: 1 worker = 1 quote per job
- Matching algorithm dựa trên category và district
- Code snippets minh họa

#### 4.3.3. Module Chat Real-time
- Socket.io Gateway configuration
- Room management theo jobId
- Event handlers: sendMessage, typing, readReceipt
- Persistence vào database
- Code snippets minh họa

#### 4.3.4. Module Payment VNPay
- Tạo URL thanh toán với tham số mã hóa
- HMAC SHA516 signature
- Xử lý IPN callback
- Bảo mật checkSum
- Code snippets minh họa

#### 4.3.5. Module Notifications
- In-app notifications system
- Trigger points (new quote, job accepted, new message)
- Mark as read functionality

### 4.4. Kết quả chạy chương trình {#section-4-4}
#### 4.4.1. Giao diện Landing Page
- Mô tả các section chính
- Call-to-action buttons
- Responsive behavior

#### 4.4.2. Giao diện Authentication
- Login form với validation
- Register form cho 3 roles
- Forgot password flow

#### 4.4.3. Dashboard Khách hàng
- Form đăng việc chi tiết
- Danh sách việc đã đăng
- Xem và so sánh các báo giá
- Lịch sử đặt dịch vụ

#### 4.4.4. Dashboard Thợ
- Feed việc phù hợp
- Hồ sơ cá nhân và chỉnh sửa
- Danh sách việc đang làm
- Thống kê thu nhập

#### 4.4.5. Admin Panel
- Statistics dashboard (charts)
- User management table
- Worker verification queue
- Reports handling

#### 4.4.6. Tính năng Chat
- Giao diện chat theo job
- Real-time message delivery
- Online status indicators

#### 4.4.7. Thanh toán VNPay
- QR Code hiển thị
- Form nhập thông tin thẻ
- Kết quả thanh toán

### 4.5. Kiểm thử {#section-4-5}
#### 4.5.1. Chiến lược kiểm thử
- Manual Testing approach
- Test environment setup

#### 4.5.2. Kịch bản kiểm thử (Test Cases)
| STT | Chức năng | Test Case | Kết quả mong đợi | Trạng thái |
|-----|-----------|-----------|------------------|------------|
| 1 | Đăng ký | Đăng ký với email hợp lệ | Tài khoản được tạo, email xác nhận | Pass |
| 2 | Đăng nhập | Đăng nhập với thông tin đúng | JWT token được trả về | Pass |
| 3 | Đăng việc | Khách đăng việc đầy đủ thông tin | Việc xuất hiện trong feed của thợ | Pass |
| 4 | Gửi báo giá | Thợ gửi báo giá cho job | Báo giá hiển thị cho khách | Pass |
| 5 | Chấp nhận báo giá | Khách chọn 1 báo giá | Job status chuyển sang IN_PROGRESS | Pass |
| 6 | Thanh toán | Thanh toán qua VNPay sandbox | Payment status = SUCCESS | Pass |
| 7 | Chat | Gửi tin nhắn trong chat room | Tin nhắn hiển thị real-time cho cả 2 | Pass |
| 8 | Đánh giá | Khách đánh giá thợ sau khi hoàn thành | Rating của thợ được cập nhật | Pass |
| ... | ... | ... | ... | ... |

#### 4.5.3. Đánh giá kết quả kiểm thử
- Tỷ lệ pass/fail
- Các lỗi phát hiện và cách khắc phục
- Nhận xét về chất lượng hệ thống

### 4.6. Hướng dẫn vận hành {#section-4-6}
#### 4.6.1. Cài đặt Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env với cấu hình database
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### 4.6.2. Cài đặt Frontend
```bash
cd client
npm install
cp .env.example .env
# Edit .env với API endpoint
npm run dev
```

#### 4.6.3. Tài khoản demo
| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@demo.com | Admin@123 |
| Khách hàng | customer@demo.com | Customer@123 |
| Thợ điện | worker.electric@demo.com | Worker@123 |
| Thợ nước | worker.plumber@demo.com | Worker@123 |

### 4.7. Tổng kết chương 4 {#section-4-7}

---

## CHƯƠNG 5: KẾT LUẬN {#chapter-5}

### 5.1. Kết quả đạt được {#section-5-1}
#### 5.1.1. Về chức năng
- Hoàn thành 100% các chức năng cốt lõi cho 3 vai trò
- Tích hợp thành công VNPay sandbox
- Real-time chat hoạt động ổn định
- Hệ thống phân quyền RBAC chặt chẽ

#### 5.1.2. Về kỹ thuật
- Áp dụng thành công NestJS modular architecture
- Type-safety với TypeScript end-to-end
- Efficient database queries với Prisma
- Scalable WebSocket implementation

#### 5.1.3. Về giao diện
- UI/UX thân thiện, responsive
- Component reusability cao
- Loading states và error handling tốt

### 5.2. Hạn chế {#section-5-2}
#### 5.2.1. Hạn chế về chức năng
- Chưa có mobile application (chỉ web)
- Chưa tích hợp Google Maps để lấy tọa độ chính xác
- Chưa có AI recommendation cho matching
- Payment chỉ ở chế độ sandbox

#### 5.2.2. Hạn chế về kỹ thuật
- Chưa có unit tests và integration tests tự động
- Chưa implement caching (Redis)
- Chưa có rate limiting nâng cao
- Single server deployment (chưa scale ngang)

#### 5.2.3. Hạn chế về phạm vi
- Chỉ hỗ trợ tiếng Việt
- Khu vực phục vụ còn hạn chế
- Số lượng ngành nghề chưa đa dạng

### 5.3. Hướng phát triển {#section-5-3}
#### 5.3.1. Tính năng mới
- **Mobile App:** Phát triển React Native/Flutter app
- **GPS Integration:** Google Maps API để match khoảng cách chính xác
- **AI Matching:** Machine Learning để gợi ý thợ phù hợp nhất
- **Subscription Model:** Gói hội viên cho thợ (featured listing)
- **Multi-language:** Hỗ trợ tiếng Anh cho người nước ngoài
- **Video Call:** Tích hợp WebRTC để tư vấn từ xa
- **Insurance:** Bảo hiểm cho các công việc có rủi ro

#### 5.3.2. Cải thiện kỹ thuật
- **Testing:** Implement Jest/E2E tests
- **Caching:** Redis cho frequently accessed data
- **Microservices:** Tách các module thành services độc lập
- **CI/CD:** Automated testing và deployment pipeline
- **Monitoring:** Sentry, LogRocket cho error tracking
- **Analytics:** Google Analytics, Mixpanel cho user behavior

#### 5.3.3. Mở rộng kinh doanh
- Partnership với các cửa hàng vật liệu xây dựng
- Training và certification cho thợ
- Expansion ra các tỉnh thành khác
- B2B services cho văn phòng, tòa nhà

### 5.4. Bài học kinh nghiệm {#section-5-4}
- Quản lý state phức tạp trong React
- Xử lý concurrent requests trong database
- Balance giữa development speed và code quality
- Importance của documentation từ đầu dự án
- Challenges của real-time communication

### 5.5. Lời kết {#section-5-5}

---

## TÀI LIỆU THAM KHẢO {#references}

### Tài liệu Tiếng Việt
1. Nguyễn Văn A (2023). *Phát triển ứng dụng web với ReactJS*. NXB Giáo dục, Hà Nội.
2. Trần Văn B (2022). *Cơ sở dữ liệu quan hệ và PostgreSQL*. NXB Kỹ Thuật, TP.HCM.
3. Lê Thị C (2023). *Xây dựng API RESTful với Node.js*. Tạp chí Khoa học Công nghệ, Số 45.
...

### Tài liệu Tiếng Anh
1. Banks, J. & Collier, K. (2023). *React Design Patterns and Best Practices*. Packt Publishing, Birmingham.
2. Freeman, A. (2023). *Pro NestJS: Build Scalable Server-Side Applications with TypeScript*. Apress, New York.
3. Microsoft Corporation (2024). *TypeScript Documentation*. Available: https://www.typescriptlang.org/docs/
4. Meta (2024). *React Official Documentation*. Available: https://react.dev/
5. NestJS Team (2024). *NestJS Documentation*. Available: https://docs.nestjs.com/
6. Prisma Team (2024). *Prisma ORM Documentation*. Available: https://www.prisma.io/docs/
7. PostgreSQL Global Development Group (2024). *PostgreSQL Documentation*. Available: https://www.postgresql.org/docs/
8. Socket.io Team (2024). *Socket.io Documentation*. Available: https://socket.io/docs/
9. VNPay (2023). *VNPay Gateway API Documentation*. Vietnam Payment Solutions JSC, Hà Nội.
10. Fielding, R. T. (2000). "Architectural Styles and the Design of Network-based Software Architectures". *Doctoral dissertation*, University of California, Irvine.
...

*(Tổng cộng 25-35 tài liệu tham khảo)*

---

## PHỤ LỤC {#appendix}

### Phụ lục A: Mã nguồn ERD (Mermaid)
### Phụ lục B: Danh sách API đầy đủ
### Phụ lục C: Test Cases chi tiết
### Phụ lục D: Hướng dẫn deploy production

---

**Số trang dự kiến:** 50-60 trang (không kể phụ lục)

**Định dạng:** 
- Font: Times New Roman 13pt
- Line spacing: 1.5
- Margins: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm
- Giấy: A4
