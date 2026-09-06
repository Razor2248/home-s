# CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Phân tích yêu cầu

### 3.1.1. Yêu cầu chức năng
Hệ thống được phân tích chức năng chi tiết cho ba vai trò người dùng chính. Các yêu cầu này được tổng hợp thành bảng dưới đây để dễ dàng theo dõi và đối chiếu trong quá trình thiết kế.

#### **a. Phân hệ dành cho Khách hàng (Customer)**
| Mã yêu cầu | Tên chức năng | Mô tả chi tiết | Độ ưu tiên |
|------------|---------------|----------------|------------|
| FC-01 | Đăng ký/Đăng nhập | Cho phép tạo tài khoản bằng email/SĐT, đăng nhập bằng mật khẩu hoặc Google (tương lai). | Cao |
| FC-02 | Tìm kiếm thợ | Tìm thợ theo kỹ năng (điện, nước, giúp việc...), khu vực (Quận/Huyện), khoảng giá, đánh giá. | Cao |
| FC-03 | Đăng công việc | Tạo yêu cầu dịch vụ với các trường: tiêu đề, mô tả, địa chỉ, thời gian mong muốn, giá dự kiến, hình ảnh đính kèm. | Cao |
| FC-04 | Xem báo giá | Nhận danh sách các báo giá từ thợ gửi đến cho công việc của mình, so sánh giá và uy tín thợ. | Cao |
| FC-05 | Chấp nhận thợ | Chọn một báo giá phù hợp, chuyển trạng thái công việc sang "Đã chấp nhận", khóa các báo giá khác. | Cao |
| FC-06 | Chat với thợ | Trò chuyện trực tiếp với thợ được chấp nhận để trao đổi chi tiết công việc. | Cao |
| FC-07 | Thanh toán | Thực hiện thanh toán qua VNPay (QR/Thẻ) hoặc chọn COD (trả tiền mặt khi hoàn thành). | Cao |
| FC-08 | Đánh giá & Xếp hạng | Sau khi hoàn thành, khách chấm điểm (1-5 sao) và viết nhận xét về chất lượng phục vụ. | Cao |
| FC-09 | Lưu thợ yêu thích | Thêm thợ vào danh sách yêu thích để dễ dàng thuê lại lần sau. | Trung bình |
| FC-10 | Quản lý lịch sử | Xem lại danh sách các công việc đã đăng, đang diễn ra và đã hoàn thành. | Trung bình |

#### **b. Phân hệ dành cho Thợ dịch vụ (Worker)**
| Mã yêu cầu | Tên chức năng | Mô tả chi tiết | Độ ưu tiên |
|------------|---------------|----------------|------------|
| FW-01 | Đăng ký hồ sơ thợ | Điền thông tin cá nhân, kỹ năng, kinh nghiệm, upload giấy tờ tùy thân, chờ Admin duyệt. | Cao |
| FW-02 | Tìm việc phù hợp | Xem danh sách công việc mới đăng phù hợp với kỹ năng và khu vực hoạt động của mình. | Cao |
| FW-03 | Gửi báo giá | Gửi đề xuất giá và lời chào cho một công việc cụ thể. Mỗi công việc chỉ được gửi 1 báo giá. | Cao |
| FW-04 | Nhận việc | Khi khách chấp nhận báo giá, thợ nhận được thông báo và quyền chat với khách. | Cao |
| FW-05 | Cập nhật trạng thái | Chuyển trạng thái công việc: "Đang thực hiện" → "Hoàn thành" → "Chờ thanh toán". | Cao |
| FW-06 | Chat với khách | Trao đổi trực tiếp với khách hàng đã chấp nhận mình. | Cao |
| FW-07 | Xem thu nhập | Thống kê số việc đã làm, tổng thu nhập theo tuần/tháng/năm. | Trung bình |
| FW-08 | Yêu cầu đổi danh mục | Gửi yêu cầu lên Admin để thêm kỹ năng mới hoặc đổi nhóm dịch vụ chính. | Thấp |

#### **c. Phân hệ dành cho Quản trị viên (Admin)**
| Mã yêu cầu | Tên chức năng | Mô tả chi tiết | Độ ưu tiên |
|------------|---------------|----------------|------------|
| FA-01 | Duyệt hồ sơ thợ | Xem xét giấy tờ, thông tin thợ đăng ký; Phê duyệt hoặc Từ chối với lý do. | Cao |
| FA-02 | Quản lý người dùng | Xem danh sách tất cả user, khóa/mở tài khoản vi phạm chính sách. | Cao |
| FA-03 | Quản lý danh mục | Thêm/Sửa/Xóa các nhóm dịch vụ (Category) và kỹ năng con (Skill). | Cao |
| FA-04 | Quản lý khu vực | Thiết lập các Quận/Huyện hoạt động trong hệ thống. | Trung bình |
| FA-05 | Xem thống kê | Dashboard hiển thị biểu đồ: Số user mới, số job hoàn thành, doanh thu (phí hoa hồng), tỷ lệ thành công. | Cao |
| FA-06 | Xử lý khiếu nại | Xem các báo cáo vi phạm từ người dùng (review giả, thợ lừa đảo...) và đưa ra hình phạt. | Trung bình |

### 3.1.2. Yêu cầu phi chức năng
Bên cạnh các chức năng nghiệp vụ, hệ thống cần đáp ứng các yêu cầu về chất lượng sau:

*   **Hiệu năng (Performance):**
    *   Thời gian phản hồi API trung bình dưới 200ms cho các thao tác thông thường.
    *   Hỗ trợ đồng thời ít nhất 500 người dùng trực tuyến mà không bị suy giảm hiệu năng đáng kể.
    *   Tải trang lần đầu (First Contentful Paint) dưới 2 giây trên mạng 4G.
*   **Bảo mật (Security):**
    *   Tất cả các kết nối phải qua giao thức HTTPS (trong môi trường production).
    *   Mật khẩu người dùng phải được mã hóa một chiều bằng bcrypt với cost factor >= 10.
    *   Chống lại các lỗ hổng phổ biến OWASP Top 10: SQL Injection, XSS, CSRF.
    *   Dữ liệu nhạy cảm (như số điện thoại, địa chỉ) chỉ hiển thị với người có quyền.
*   **Khả năng mở rộng (Scalability):**
    *   Kiến trúc Backend dạng Module cho phép tách riêng các service khi cần thiết (ví dụ: tách module Chat ra server riêng).
    *   Cơ sở dữ liệu hỗ trợ Read Replicas để tăng khả năng đọc khi lượng truy cập tăng.
*   **Tính sẵn sàng (Availability):**
    *   Hệ thống đảm bảo hoạt động 99% thời gian trong khung giờ cao điểm (8:00 - 20:00).
    *   Có cơ chế tự động khởi động lại service nếu bị crash (sử dụng PM2 hoặc Docker restart policy).
*   **Giao diện & Trải nghiệm (UI/UX):**
    *   Giao diện Responsive, tương thích tốt trên Desktop, Tablet và Mobile.
    *   Màu sắc hài hòa, font chữ dễ đọc, thao tác intuitivie (dễ hiểu ngay lần đầu dùng).
    *   Hỗ trợ thông báo lỗi rõ ràng, hướng dẫn người dùng sửa lỗi cụ thể.

### 3.1.3. Biểu đồ Use Case
*(Lưu ý: Sơ đồ Mermaid tương ứng nằm trong file `diagrams.md`. Dưới đây là mô tả văn bản)*

Hệ thống có 3 tác nhân chính: **Khách hàng**, **Thợ**, và **Admin**.
*   **Khách hàng** tương tác với các use case: Đăng nhập, Tìm kiếm thợ, Đăng việc, Chọn báo giá, Thanh toán, Đánh giá.
*   **Thợ** tương tác với: Đăng ký hồ sơ, Tìm việc, Gửi báo giá, Nhận việc, Cập nhật trạng thái.
*   **Admin** tương tác với: Duyệt thợ, Quản lý User, Xem thống kê, Xử lý vi phạm.
*   Các use case chung: Đăng xuất, Đổi mật khẩu, Xem thông tin cá nhân, Chat (dùng chung khi đã khớp lệnh).

Mối quan hệ `<<include>>`: Use case "Thực hiện giao dịch" bao gồm "Đăng nhập".
Mối quan hệ `<<extend>>`: Use case "Đăng việc" có thể mở rộng bằng "Đính kèm ảnh".

## 3.2. Thiết kế kiến trúc hệ thống

### 3.2.1. Kiến trúc tổng thể (System Architecture)
Dự án áp dụng mô hình kiến trúc **Client-Server** tách biệt hoàn toàn giữa Frontend và Backend, giao tiếp thông qua REST API và WebSocket.

*   **Client Layer (Frontend):**
    *   Được xây dựng bằng ReactJS + TypeScript.
    *   Chạy hoàn toàn trên trình duyệt người dùng (Browser).
    *   Chịu trách nhiệm hiển thị giao diện, thu thập input, gọi API đến Backend và lắng nghe sự kiện từ Socket Server.
    *   Quản lý trạng thái cục bộ (local state) và lưu trữ token xác thực (trong memory hoặc HttpOnly cookie).
*   **Server Layer (Backend):**
    *   Được xây dựng bằng NestJS (Node.js).
    *   Tiếp nhận HTTP Requests từ Client, xử lý logic nghiệp vụ (Business Logic), xác thực (Authentication) và phân quyền (Authorization).
    *   Đóng vai trò là WebSocket Server, quản lý các kết nối socket, broadcast tin nhắn chat và thông báo.
    *   Giao tiếp với Database và các dịch vụ bên thứ 3 (VNPay).
*   **Data Layer (Database):**
    *   Sử dụng PostgreSQL để lưu trữ dữ liệu có cấu trúc.
    *   Prisma ORM đóng vai trò trung gian, chuyển đổi các thao tác code TypeScript thành câu lệnh SQL tối ưu.
*   **Third-party Services:**
    *   **VNPay Gateway:** Xử lý thanh toán online.
    *   **(Tương lai) Firebase/Email Service:** Gửi thông báo đẩy hoặc email xác nhận.

**Luồng dữ liệu điển hình:**
1.  Người dùng thao tác trên Frontend (ví dụ: bấm "Gửi báo giá").
2.  Frontend gửi HTTP POST request kèm JWT Token tới API `/quotes/create`.
3.  Backend nhận request, JWT Guard kiểm tra tính hợp lệ của token.
4.  QuotesService kiểm tra logic nghiệp vụ (user này chưa gửi quote cho job này chưa?).
5.  Prisma ghi dữ liệu vào bảng `Quote` trong PostgreSQL.
6.  Backend trả về kết quả JSON thành công cho Frontend.
7.  Frontend cập nhật giao diện, hiển thị thông báo "Gửi báo giá thành công".

### 3.2.2. Sơ đồ khối các thành phần (Component Diagram)
Hệ thống Backend được chia thành các Module độc lập theo tính năng, mỗi module bao gồm: Controller, Service, Repository (Prisma), và DTO (Data Transfer Object).

*   **Auth Module:** Xử lý đăng ký, đăng nhập, cấp phát token, làm mới token, khôi phục mật khẩu.
*   **User Module:** Quản lý thông tin cá nhân, avatar, số điện thoại.
*   **Worker Module:** Quản lý hồ sơ thợ, kỹ năng, kinh nghiệm, trạng thái duyệt.
*   **Job Module:** CRUD công việc, lọc danh sách việc, quản lý trạng thái đơn hàng.
*   **Quote Module:** Gửi báo giá, chấp nhận báo giá, hủy báo giá.
*   **Review Module:** Tạo đánh giá, tính điểm trung bình.
*   **Chat Module:** WebSocket Gateway, lưu trữ tin nhắn, quản lý phòng chat.
*   **Payment Module:** Tạo link thanh toán VNPay, xử lý callback IPN.
*   **Admin Module:** Các API đặc quyền cho admin, thống kê dashboard.

Các module giao tiếp với nhau thông qua Dependency Injection. Ví dụ: `JobController` gọi `JobService`, `JobService` có thể gọi `NotificationService` để gửi thông báo khi có việc mới.

## 3.3. Thiết kế Cơ sở dữ liệu

### 3.3.1. Mô hình thực thể liên kết (ERD)
*(Lưu ý: Code Mermaid chi tiết nằm trong file `diagrams.md`. Phần này mô tả các quan hệ chính)*

Cơ sở dữ liệu gồm 17 bảng chính và 6 kiểu liệt kê (Enum), được thiết kế đảm bảo chuẩn hóa dạng 3 (3NF) để tránh dư thừa dữ liệu.

**Các thực thể cốt lõi:**
*   **User:** Lưu thông tin đăng nhập và hồ sơ cơ bản. Một User có thể đóng vai trò Customer hoặc Worker (hoặc cả hai trong tương lai, nhưng hiện tại tách biệt qua trường `role`).
*   **WorkerProfile:** Mở rộng thông tin cho User nếu là thợ (năm kinh nghiệm, bio, verified). Quan hệ 1-1 với User.
*   **Category & Skill:** Danh mục dịch vụ (Điện, Nước) và các kỹ năng con (Sửa ống nước, Lắp điều hòa). Quan hệ 1-N (Category - Skill).
*   **Job:** Bảng lưu yêu cầu công việc. Chứa khóa ngoại trỏ tới `User` (người đăng - Customer), `District` (quận huyện), `Category`.
*   **Quote:** Bảng lưu báo giá. Khóa ngoại trỏ tới `Job` và `User` (thợ gửi). Ràng buộc duy nhất (Unique Constraint): Một thợ chỉ gửi 1 quote cho 1 job.
*   **Review:** Đánh giá. Trỏ tới `Job` (để biết ngữ cảnh), `User` (người chấm), `WorkerProfile` (người bị chấm).
*   **ChatMessage:** Tin nhắn. Trỏ tới `Job` (để nhóm chat theo công việc), `User` (người gửi).
*   **Payment:** Lịch sử thanh toán. Trỏ tới `Job`, lưu mã giao dịch VNPay, số tiền, trạng thái.
*   **District:** Danh sách quận huyện. Dùng để lọc khu vực hoạt động.
*   **Favorite:** Bảng trung gian lưu quan hệ N-N giữa Customer và Worker (lưu thợ yêu thích).
*   **Report:** Báo cáo vi phạm. Trỏ tới người bị báo cáo và người báo cáo.
*   **PasswordResetToken:** Lưu mã OTP khôi phục mật khẩu, có thời gian hết hạn.
*   **WorkerCategoryChangeRequest:** Yêu cầu đổi nhóm nghề, chờ Admin duyệt.

**Các quan hệ chính:**
*   User (1) --- (N) Job: Một khách hàng đăng nhiều việc.
*   User (1) --- (N) Quote: Một thợ gửi nhiều báo giá.
*   Job (1) --- (N) Quote: Một việc nhận nhiều báo giá.
*   Job (1) --- (1) Payment: Một việc có một lần thanh toán chính (có thể mở rộng trả góp).
*   Job (1) --- (N) ChatMessage: Một việc có nhiều tin nhắn trao đổi.
*   User (N) --- (N) Skill (qua WorkerSkills): Một thợ có nhiều kỹ năng, một kỹ năng thuộc nhiều thợ.

### 3.3.2. Từ điển dữ liệu (Chi tiết các bảng chính)

Dưới đây là mô tả chi tiết cấu trúc các bảng quan trọng nhất, trích xuất từ schema Prisma:

#### **Bảng `User`**
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | String (UUID) | PK | Định danh duy nhất người dùng. |
| email | String | Unique, Not Null | Email đăng nhập. |
| password | String | Not Null | Mật khẩu đã mã hóa bcrypt. |
| fullName | String | Not Null | Họ tên đầy đủ. |
| phone | String | Nullable | Số điện thoại liên hệ. |
| role | Enum (UserRole) | Not Null | Vai trò: CUSTOMER, WORKER, ADMIN. |
| avatarUrl | String | Nullable | Link ảnh đại diện. |
| createdAt | DateTime | Default(now) | Thời gian tạo tài khoản. |
| updatedAt | DateTime | Not Null | Thời gian cập nhật cuối. |

#### **Bảng `Job`**
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | String (UUID) | PK | Định danh công việc. |
| customerId | String (UUID) | FK -> User.id | Người đăng việc. |
| title | String | Not Null | Tiêu đề công việc. |
| description | Text | Not Null | Mô tả chi tiết. |
| categoryId | String (UUID) | FK -> Category.id | Nhóm dịch vụ. |
| districtId | String (UUID) | FK -> District.id | Quận/Huyện thực hiện. |
| address | String | Not Null | Địa chỉ cụ thể. |
| status | Enum (JobStatus) | Default(OPEN) | Trạng thái: OPEN, IN_PROGRESS, COMPLETED... |
| estimatedPrice | Int | Nullable | Giá dự kiến (VNĐ). |
| scheduledAt | DateTime | Nullable | Thời gian hẹn làm việc. |
| createdAt | DateTime | Default(now) | Thời gian đăng. |

#### **Bảng `Quote`**
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | String (UUID) | PK | Định danh báo giá. |
| jobId | String (UUID) | FK -> Job.id | Công việc được báo giá. |
| workerId | String (UUID) | FK -> User.id | Thợ gửi báo giá. |
| price | Int | Not Null | Số tiền báo giá (VNĐ). |
| message | Text | Nullable | Lời nhắn gửi kèm. |
| status | Enum (QuoteStatus) | Default(PENDING) | PENDING, ACCEPTED, REJECTED. |
| createdAt | DateTime | Default(now) | Thời gian gửi. |
| *Unique* | (jobId, workerId) | Composite Unique | Đảm bảo 1 thợ chỉ gửi 1 giá cho 1 việc. |

#### **Bảng `Payment`**
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---------|--------------|-----------|-------|
| id | String (UUID) | PK | Định danh giao dịch. |
| jobId | String (UUID) | FK -> Job.id | Công việc được thanh toán. |
| amount | Int | Not Null | Số tiền thanh toán. |
| method | Enum (PaymentMethod) | Not Null | VNPAY hoặc COD. |
| vnpTxnRef | String | Nullable | Mã giao dịch VNPay trả về. |
| status | Enum (PaymentStatus) | Default(PENDING) | PENDING, PAID, FAILED. |
| paidAt | DateTime | Nullable | Thời điểm thanh toán thành công. |

### 3.3.3. Phân tích chuẩn hóa dữ liệu
Thiết kế CSDL của dự án tuân thủ nghiêm ngặt các dạng chuẩn để đảm bảo tính nhất quán và hiệu quả lưu trữ:

*   **Dạng chuẩn 1 (1NF):** Tất cả các cột đều chứa giá trị nguyên tử (atomic). Ví dụ: Không lưu nhiều số điện thoại trong một cột, mà tách ra hoặc lưu ở bảng con. Các trường `skills` không lưu dạng mảng chuỗi trong một cột mà tách thành bảng quan hệ `WorkerSkills`.
*   **Dạng chuẩn 2 (2NF):** Mọi cột không khóa đều phụ thuộc hoàn toàn vào khóa chính. Ví dụ: Trong bảng `Job`, các trường `title`, `description` chỉ phụ thuộc vào `id` của Job, không phụ thuộc vào `customerId` (thông tin khách đã nằm ở bảng `User` riêng).
*   **Dạng chuẩn 3 (3NF):** Không có phụ thuộc bắc cầu. Ví dụ: Thông tin về Quận (tên quận, thành phố) được tách riêng vào bảng `District`. Bảng `Job` chỉ lưu `districtId`. Nếu sửa tên quận, chỉ cần sửa 1 chỗ trong bảng `District` mà không cần update hàng loạt bản ghi trong bảng `Job`.

Việc chuẩn hóa này giúp:
*   Giảm thiểu dư thừa dữ liệu (Data Redundancy).
*   Tránh dị thường khi cập nhật (Update Anomalies).
*   Dễ dàng bảo trì và mở rộng cấu trúc dữ liệu.

## 3.4. Thiết kế API

### 3.4.1. Cấu trúc API Endpoint
API được thiết kế theo phong cách RESTful, sử dụng các động từ HTTP chuẩn (GET, POST, PUT, DELETE) để thao tác với tài nguyên. Tất cả các endpoint (trừ đăng ký, đăng nhập) đều yêu cầu header `Authorization: Bearer <token>`.

Cấu trúc đường dẫn (URL Pattern): `/api/v1/<resource>`

**Các nhóm API chính:**

1.  **Auth:** `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/forgot-password`.
2.  **Users:** `/users/profile`, `/users/update-profile`, `/users/change-password`.
3.  **Jobs:**
    *   `GET /jobs`: Lấy danh sách việc (có filter, sort, pagination).
    *   `POST /jobs`: Tạo việc mới.
    *   `GET /jobs/:id`: Lấy chi tiết việc.
    *   `PATCH /jobs/:id/status`: Cập nhật trạng thái việc.
4.  **Quotes:**
    *   `POST /quotes`: Gửi báo giá.
    *   `POST /quotes/:id/accept`: Chấp nhận báo giá (khách hàng).
    *   `GET /jobs/:id/quotes`: Lấy danh sách báo giá của một việc.
5.  **Reviews:** `POST /reviews` (tạo đánh giá), `GET /workers/:id/reviews` (xem review của thợ).
6.  **Chat:** (Sử dụng WebSocket events thay vì REST).
7.  **Payments:** `POST /payments/create-url` (tạo link VNPay), `POST /payments/ipn` (VNPay callback).
8.  **Admin:** `/admin/stats`, `/admin/workers/pending`, `/admin/users`.

### 3.4.2. Ví dụ Request/Response chi tiết

Dưới đây là ví dụ minh họa cho hai chức năng quan trọng nhất: **Đăng việc** và **Chấp nhận báo giá**.

#### **Ví dụ 1: Khách hàng đăng công việc mới**
*   **Endpoint:** `POST /api/v1/jobs`
*   **Headers:** `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
*   **Request Body:**
    ```json
    {
      "title": "Sửa vòi nước bị rò rỉ tại bếp",
      "description": "Vòi nước dưới bồn rửa bị rỉ nước chân ren, cần thợ đến xử lý gấp.",
      "categoryId": "cat_water_001",
      "districtId": "dist_hcm_001",
      "address": "123 Đường ABC, Phường X, Quận 1, TP.HCM",
      "estimatedPrice": 300000,
      "scheduledAt": "2024-06-20T14:00:00Z"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "statusCode": 201,
      "message": "Job created successfully",
      "data": {
        "id": "job_uuid_12345",
        "title": "Sửa vòi nước bị rò rỉ tại bếp",
        "status": "OPEN",
        "customerId": "user_uuid_customer",
        "createdAt": "2024-06-19T10:00:00Z"
        // ... các trường khác
      }
    }
    ```

#### **Ví dụ 2: Khách hàng chấp nhận một báo giá**
*   **Endpoint:** `POST /api/v1/quotes/:id/accept`
*   **Headers:** `Authorization: Bearer <token_khach_hang>`
*   **Path Variable:** `id` = `quote_uuid_67890`
*   **Request Body:** (Không cần body)
*   **Response (200 OK):**
    ```json
    {
      "statusCode": 200,
      "message": "Quote accepted successfully. Job status updated.",
      "data": {
        "quoteId": "quote_uuid_67890",
        "jobId": "job_uuid_12345",
        "workerId": "user_uuid_tho",
        "price": 250000,
        "jobStatus": "ACCEPTED", // Job đã chuyển trạng thái
        "matchedAt": "2024-06-19T15:30:00Z"
      }
    }
    ```
*   **Xử lý phía Server (Transaction):**
    1.  Kiểm tra `quote` tồn tại và thuộc về `job` này.
    2.  Kiểm tra `job` chưa được chấp nhận quote nào khác.
    3.  Bắt đầu Transaction Database.
    4.  Cập nhật `Quote.status` = `ACCEPTED`.
    5.  Cập nhật `Job.status` = `ACCEPTED` và lưu `workerId` vào Job.
    6.  Commit Transaction.
    7.  Gửi notification qua Socket.io cho Thợ biết đã được nhận việc.

## 3.5. Thiết kế luồng xử lý (Sequence Diagrams)

Phần này mô tả chi tiết tương tác giữa các thành phần (Client, Server, DB, Third-party) trong các tình huống nghiệp vụ phức tạp. *(Sơ đồ Mermaid tương ứng có trong file `diagrams.md`)*.

### 3.5.1. Luồng Đăng nhập và Phân quyền
1.  **User** nhập email/mật khẩu trên **Frontend**.
2.  **Frontend** gửi request `POST /auth/login` tới **Backend Auth Controller**.
3.  **Auth Service** tìm user theo email trong **Database**.
    *   Nếu không tìm thấy → Trả về lỗi 404.
    *   Nếu tìm thấy → Dùng `bcrypt.compare` kiểm tra mật khẩu.
4.  Nếu mật khẩu đúng:
    *   Sinh **Access Token** (thời gian sống ngắn) chứa `userId` và `role`.
    *   Sinh **Refresh Token** (thời gian sống dài), lưu hash của refresh token vào DB (cột `refreshToken` của User).
    *   Trả Access Token trong body response, Refresh Token trong HttpOnly Cookie.
5.  **Frontend** lưu Access Token (vào biến nhớ hoặc localStorage) và chuyển hướng user về Dashboard tương ứng với `role` (Admin/Customer/Worker).
6.  Các request sau đó, Frontend gắn Access Token vào header `Authorization`. **JWT Guard** của NestJS sẽ tự động giải mã, kiểm tra hạn và trích xuất thông tin user cho Controller sử dụng.

### 3.5.2. Luồng Đăng việc → Nhận báo giá → Chấp nhận thợ
Đây là luồng nghiệp vụ cốt lõi (Core Business Flow) của hệ thống:
1.  **Customer** tạo Job → **Backend** lưu vào DB trạng thái `OPEN`.
2.  **Backend** (qua Socket.io) broadcast sự kiện `new_job` tới tất cả **Workers** đang online (hoặc chỉ那些 trong cùng district nếu có logic lọc).
3.  **Worker A** xem việc, thấy phù hợp → Gửi `Quote` (giá 300k).
4.  **Backend** kiểm tra ràng buộc (Worker A chưa gửi quote này chưa?) → Lưu vào DB trạng thái `PENDING`.
5.  **Worker B** cũng gửi `Quote` (giá 280k) → Lưu vào DB.
6.  **Customer** nhận thông báo có báo giá mới → Vào xem danh sách.
7.  **Customer** chọn Quote của Worker B → Gọi API `accept`.
8.  **Backend** thực hiện Transaction:
    *   Update Quote của B thành `ACCEPTED`.
    *   Update các Quote khác của Job này thành `REJECTED` (tự động loại).
    *   Update Job thành `ACCEPTED`, gán `workerId` = B.
9.  **Backend** gửi Socket event `quote_accepted` tới **Worker B** (thông báo trúng thầu) và `job_updated` tới **Customer**.

### 3.5.3. Luồng Thanh toán qua VNPay
1.  **Customer** chọn "Thanh toán Online" trên đơn hàng đã hoàn thành.
2.  **Frontend** gọi `POST /payments/create-url` kèm `jobId`.
3.  **Payment Service** (Backend):
    *   Lấy thông tin Job (số tiền, mã đơn).
    *   Tạo chuỗi dữ liệu theo quy tắc VNPay.
    *   Tính mã checksum HMAC-SHA512 dùng `Secret Key`.
    *   Gọi API sang VNPay Gateway (hoặc construct URL trực tiếp).
    *   Nhận lại `paymentUrl`.
4.  **Backend** trả `paymentUrl` cho Frontend.
5.  **Frontend** chuyển hướng trình duyệt người dùng sang `paymentUrl` (trang web của VNPay).
6.  **Customer** đăng nhập Internet Banking và xác nhận thanh toán.
7.  **VNPay** xử lý giao dịch → Điều hướng trình duyệt khách quay lại website ta (Return URL) kèm tham số trạng thái.
8.  Đồng thời, VNPay gọi ngầm (IPN) tới `POST /payments/ipn` của **Backend** với đầy đủ tham số và checksum.
9.  **Backend** (tại endpoint IPN):
    *   Tính lại checksum từ tham số nhận được và `Secret Key`.
    *   So sánh với checksum VNPay gửi sang → Nếu khác nhau: Trả về `ERROR`.
    *   Nếu giống nhau và `vnp_ResponseCode == 00`:
        *   Tìm Job/Payment trong DB theo mã giao dịch.
        *   Update trạng thái Payment thành `PAID`, Job thành `COMPLETED`.
        *   Trả về chuỗi `OK` cho VNPay.
10. **Frontend** (tại Return URL) hiển thị thông báo "Thanh toán thành công" dựa trên tham số URL.

### 3.5.4. Luồng Chat Real-time
1.  **Customer** và **Worker** đã được khớp (Job status = ACCEPTED).
2.  **Customer** mở trang chat trên **Frontend**.
3.  **Frontend** khởi tạo kết nối Socket.io (nếu chưa kết nối), gửi sự kiện `join_room` với payload `{ roomId: 'job_<id>' }`.
4.  **Socket Gateway** (Backend) xác thực user, kiểm tra user này có thuộc Job này không → Nếu có, add socket vào room `job_<id>`.
5.  **Customer** soạn tin nhắn "Anh đến nơi chưa ạ?" → Gửi sự kiện `send_message`.
6.  **Socket Gateway** nhận tin nhắn:
    *   Lưu nội dung tin nhắn vào bảng `ChatMessage` trong DB (để lưu lịch sử).
    *   Phát (emit) sự kiện `receive_message` tới tất cả socket trong room `job_<id>` (bao gồm cả Worker).
7.  **Worker** (đang online) nhận sự kiện `receive_message` → Frontend Worker hiển thị tin nhắn mới ngay lập tức không cần reload.
8.  Nếu **Worker** offline:
    *   Backend vẫn lưu tin nhắn vào DB.
    *   Backend tạo một bản ghi trong bảng `Notification` cho Worker.
    *   Khi Worker online lại và load trang chat, Frontend gọi API lấy lịch sử tin nhắn từ DB để hiển thị.

## 3.6. Thiết kế giao diện (UI/UX)

### 3.6.1. Nguyên tắc thiết kế
Giao diện dự án được thiết kế dựa trên các nguyên tắc UI/UX hiện đại, tập trung vào sự đơn giản và hiệu quả:
*   **Nhất quán (Consistency):** Sử dụng cùng một bộ màu chủ đạo (Primary Color: Xanh dương đậm - tượng trưng cho sự tin cậy; Secondary Color: Cam - tượng trưng cho sự năng động), cùng một hệ thống font chữ (Inter hoặc Roboto), và cùng một style cho các nút bấm, ô input trên toàn hệ thống.
*   **Phân cấp thị giác (Visual Hierarchy):** Các phần tử quan trọng (nút "Đăng việc", "Chấp nhận thợ") được làm nổi bật bằng kích thước lớn hơn, màu sắc tương phản. Các thông tin phụ (ngày giờ, lượt xem) dùng màu xám nhạt và font nhỏ hơn.
*   **Khoảng trắng (White space):** Sử dụng khoảng trống hợp lý để tách biệt các khối nội dung, giúp mắt người dùng dễ chịu, không bị rối mắt bởi quá nhiều thông tin chen chúc.
*   **Responsive Design:** Layout tự động chuyển đổi từ 3 cột (Desktop) xuống 2 cột (Tablet) và 1 cột (Mobile). Menu ngang trên Desktop chuyển thành menu hamburger trên Mobile.

### 3.6.2. Cấu trúc Component (Frontend Architecture)
Mã nguồn Frontend được tổ chức theo mô hình component cây (Component Tree), tái sử dụng tối đa:

*   **Layout Components:** Khung sườn cố định.
    *   `DashShell`: Khung dashboard chung, chứa Sidebar (menu trái) và Header (thông tin user).
    *   `PublicLayout`: Khung cho trang Landing và Login (không có sidebar).
*   **Page Components:** Tương ứng với mỗi route (trang).
    *   `LandingPage`: Trang giới thiệu chung.
    *   `LoginPage`: Form đăng nhập chung cho 3 vai trò.
    *   `CustomerApp`: Trang chủ của khách (Feed việc, danh sách thợ).
    *   `WorkerApp`: Trang chủ của thợ (Danh sách việc có thể nhận).
    *   `AdminApp`: Dashboard quản trị.
*   **Feature Components:** Các khối chức năng cụ thể.
    *   `JobCard`: Thẻ hiển thị tóm tắt một công việc (tiêu đề, giá, địa điểm).
    *   `QuoteList`: Danh sách các báo giá kèm nút chấp nhận.
    *   `ChatBox`: Khung chat, danh sách tin nhắn và ô nhập liệu.
    *   `PaymentModal`: Popup chứa mã QR VNPay hoặc form thẻ.
*   **UI Components (Atomic):** Các thành phần cơ bản nhất, không chứa logic nghiệp vụ.
    *   `Button`, `Input`, `Select`, `Modal`, `Badge`, `Avatar`, `Spinner`.

### 3.6.3. Mô tả các màn hình chính

#### **a. Màn hình Đăng nhập (Login Page)**
*   **Bố cục:** Chia đôi màn hình. Bên trái là hình ảnh minh họa dịch vụ gia đình ấm cúng. Bên phải là form đăng nhập.
*   **Thành phần:**
    *   Logo dự án ở góc trên.
    *   Tab chuyển đổi giữa "Đăng nhập" và "Đăng ký".
    *   Input: Email, Mật khẩu.
    *   Link "Quên mật khẩu?".
    *   Nút "Đăng nhập" lớn, full-width.
    *   Gợi ý đăng nhập nhanh (Demo accounts) ở dưới cùng cho người kiểm thử.

#### **b. Dashboard Khách hàng (Customer Dashboard)**
*   **Header:** Chào user, nút thông báo (chuông), Avatar menu.
*   **Sidebar:** Menu chức năng (Trang chủ, Việc của tôi, Thợ yêu thích, Cài đặt).
*   **Khu vực chính (Main Content):**
    *   Nút nổi bật "Đăng công việc mới" (Floating Action Button hoặc Button lớn đầu trang).
    *   Bộ lọc: Tìm việc đã đăng theo trạng thái (Mới, Đang làm, Hoàn thành).
    *   Danh sách thẻ Job: Mỗi thẻ hiển thị tiêu đề, số lượng báo giá nhận được, trạng thái. Bấm vào thẻ để xem chi tiết và chọn thợ.
    *   Tab "Thợ yêu thích": Danh sách thợ đã lưu, có nút "Thuê lại" nhanh.

#### **c. Dashboard Thợ (Worker Dashboard)**
*   **Bố cục:** Tương tự Dashboard khách nhưng nội dung tập trung vào tìm việc.
*   **Khu vực chính:**
    *   Thống kê nhanh: Số việc đã làm, Thu nhập tháng này, Điểm đánh giá trung bình (hiển thị dạng Card số liệu).
    *   Feed công việc: Danh sách việc mới đăng phù hợp kỹ năng. Hiển thị rõ: Khoảng cách (giả lập), Giá dự kiến, Mô tả ngắn.
    *   Nút "Gửi báo giá" trên mỗi thẻ việc → Mở Modal nhập số tiền và lời nhắn.
    *   Tab "Việc của tôi": Danh sách việc đã nhận báo giá hoặc đang làm.

#### **d. Trang quản trị (Admin Panel)**
*   **Dashboard Overview:** Biểu đồ thống kê (dùng thư viện như Recharts hoặc Chart.js) thể hiện số lượng user tăng trưởng, số job hoàn thành theo ngày.
*   **Quản lý thợ chờ duyệt:** Bảng danh sách thợ mới đăng ký. Cột hành động có nút "Duyệt" (xanh) và "Từ chối" (đỏ). Khi bấm Duyệt, tài khoản thợ được kích hoạt ngay.
*   **Quản lý người dùng:** Bảng list tất cả user, có switch để Khóa/Mở tài khoản.
*   **Quản lý Danh mục:** Form CRUD đơn giản để thêm/sửa tên các nhóm dịch vụ.

Thiết kế giao diện đảm bảo người dùng có thể thực hiện các thao tác chính trong vòng 3 cú click chuột, giảm thiểu độ phức tạp và rào cản công nghệ cho những người dùng ít rành về máy tính.
