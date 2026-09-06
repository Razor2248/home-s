# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT

## 2.1. Tổng quan về Service Marketplace

### 2.1.1. Định nghĩa và đặc trưng
**Service Marketplace** (Sàn giao dịch dịch vụ) là một mô hình kinh doanh kỹ thuật số đóng vai trò trung gian, kết nối người cung cấp dịch vụ (Service Providers) với người có nhu cầu sử dụng dịch vụ (Customers) trên cùng một nền tảng. Khác với các sàn thương mại điện tử truyền thống trao đổi hàng hóa vật lý, Service Marketplace tập trung vào việc trao đổi giá trị vô hình là kỹ năng, thời gian và chất lượng phục vụ.

Các đặc trưng cốt lõi của mô hình này bao gồm:
*   **Tính hai chiều (Two-sided market):** Nền tảng phải đồng thời thu hút và giữ chân cả hai nhóm đối tượng: Khách hàng và Thợ. Giá trị của nền tảng tăng lên theo số lượng người tham gia ở cả hai phía (hiệu ứng mạng lưới).
*   **Phi tập trung hóa việc cung cấp dịch vụ:** Nền tảng không trực tiếp thực hiện dịch vụ mà chỉ cung cấp hạ tầng công nghệ để các bên tự giao dịch.
*   **Cơ chế tín nhiệm (Trust Mechanism):** Yếu tố sống còn của sàn là hệ thống đánh giá, xếp hạng (Rating & Review) và xác minh danh tính để giảm thiểu rủi ro giao dịch.
*   **Định giá linh hoạt:** Giá cả có thể được cố định bởi nền tảng, thỏa thuận giữa hai bên, hoặc đấu thầu ngược (khách đăng giá, thợ chào giá).

### 2.1.2. Các mô hình Service Marketplace phổ biến
Trên thế giới và tại Việt Nam, mô hình này đã phát triển đa dạng theo từng ngành dọc:
*   **Mô hình On-demand (Theo yêu cầu tức thời):** Ví dụ: Uber, Grab (dịch vụ vận chuyển), bTaskee (dịch vụ giúp việc). Đặc điểm là tốc độ khớp lệnh nhanh, thường dựa vào vị trí địa lý (GPS).
*   **Mô hình Booking (Đặt lịch trước):** Ví dụ: Placebook, Booked.vn. Phù hợp với các dịch vụ cần chuẩn bị trước như spa, bảo trì máy lạnh, sửa chữa lớn.
*   **Mô hình Bidding (Đấu thầu báo giá):** Ví dụ: TaskRabbit, Fixr. Khách đăng mô tả công việc, nhiều thợ gửi báo giá, khách chọn phương án tốt nhất. *Đây là mô hình chính được áp dụng trong đề tài này.*

### 2.1.3. Vai trò của công nghệ trong Service Marketplace
Công nghệ thông tin đóng vai trò xương sống trong việc vận hành các sàn dịch vụ hiện đại:
*   **Kết nối và Khớp lệnh (Matching):** Thuật toán giúp tìm kiếm và gợi ý thợ phù hợp nhất dựa trên kỹ năng, khoảng cách, giá cả và uy tín.
*   **Minh bạch hóa thông tin:** Số hóa hồ sơ thợ, lịch sử làm việc, đánh giá công khai giúp khách hàng ra quyết định chính xác.
*   **Quản lý giao dịch an toàn:** Cổng thanh toán tích hợp, escrow (giữ tiền trung gian) đảm bảo quyền lợi đôi bên.
*   **Giao tiếp thời gian thực:** Chat, gọi điện, thông báo đẩy (push notification) giúp quá trình trao đổi diễn ra liên tục.

## 2.2. Công nghệ Frontend

### 2.2.1. ReactJS và Virtual DOM
**ReactJS** là một thư viện JavaScript mã nguồn mở do Facebook (nay là Meta) phát triển, chuyên dùng để xây dựng giao diện người dùng (UI), đặc biệt hiệu quả cho các ứng dụng đơn trang (Single Page Application - SPA).

*   **Cơ chế Virtual DOM:** Thay vì thao tác trực tiếp lên DOM thật của trình duyệt (vốn chậm chạp), React tạo ra một bản sao ảo của DOM trong bộ nhớ. Khi trạng thái ứng dụng thay đổi, React so sánh bản sao mới với bản sao cũ (quá trình Diffing) và chỉ cập nhật những phần tử thực sự thay đổi lên DOM thật (Reconciliation). Điều này giúp tối ưu hóa hiệu năng render, mang lại trải nghiệm mượt mà cho người dùng.
*   **Component-Based Architecture:** React khuyến khích chia nhỏ giao diện thành các thành phần (component) độc lập, có thể tái sử dụng. Mỗi component quản lý trạng thái (state) và dữ liệu đầu vào (props) riêng, giúp việc phát triển, kiểm thử và bảo trì trở nên dễ dàng hơn.
*   **Hệ sinh thái phong phú:** React có cộng đồng hỗ trợ lớn, hàng ngàn thư viện bên thứ ba (router, state management, UI kits) giúp tăng tốc độ phát triển sản phẩm.

### 2.2.2. TypeScript – JavaScript có kiểu dữ liệu tĩnh
**TypeScript** là tập siêu ngôn ngữ (superset) của JavaScript, bổ sung thêm hệ thống kiểu dữ liệu tĩnh (Static Typing) và các tính năng hướng đối tượng nâng cao.

*   **Lợi ích trong dự án lớn:**
    *   **Phát hiện lỗi sớm:** Các lỗi về kiểu dữ liệu (ví dụ: truyền sai tham số vào hàm) được phát hiện ngay lúc viết code (compile-time) thay vì đợi chạy mới biết (runtime), giảm thiểu bug tiềm ẩn.
    *   **Hỗ trợ IDE thông minh:** Cung cấp tính năng tự động hoàn thành (autocomplete), gợi ý tham số, refactor code an toàn nhờ hiểu rõ cấu trúc kiểu dữ liệu.
    *   **Tài liệu sống:** Kiểu dữ liệu đóng vai trò như một dạng tài liệu mô tả chức năng, giúp các thành viên trong nhóm dễ hiểu code của nhau hơn.
*   **Ứng dụng trong đề tài:** Toàn bộ mã nguồn Frontend và Backend đều được viết bằng TypeScript để đảm bảo tính đồng bộ, an toàn kiểu dữ liệu từ Client đến Server.

### 2.2.3. Vite – Công cụ build thế hệ mới
**Vite** (tiếng Pháp nghĩa là "Nhanh") là công cụ xây dựng (build tool) và môi trường phát triển (dev server) hiện đại, được thiết kế để thay thế Webpack trong các dự án Vue/React.

*   **Khởi động tức thì:** Vite sử dụng cơ chế Native ES Modules của trình duyệt hiện đại. Khi chạy môi trường dev, nó không cần bundle toàn bộ ứng dụng mà chỉ load các file khi trình duyệt yêu cầu, giúp server khởi động gần như tức thời dù dự án lớn.
*   **Hot Module Replacement (HMR) siêu nhanh:** Khi lưu file code, thay đổi được phản ánh ngay lập tức trên trình duyệt mà không cần tải lại trang (reload), giữ nguyên trạng thái ứng dụng.
*   **Tối ưu hóa build production:** Sử dụng Rollup để đóng gói mã nguồn, tree-shaking (loại bỏ code không dùng đến) và nén file hiệu quả, tạo ra sản phẩm cuối cùng nhẹ và nhanh.

### 2.2.4. Tailwind CSS – Framework CSS tiện ích
**Tailwind CSS** là một framework CSS "utility-first", cung cấp các class CSS nguyên tử (atomic classes) để xây dựng giao diện trực tiếp trong HTML.

*   **Phương pháp Utility-First:** Thay vì viết tên class có ý nghĩa (ví dụ: `.btn-primary`) và định nghĩa CSS riêng, Tailwind cho phép ghép các class tiện ích có sẵn (ví dụ: `bg-blue-500 text-white px-4 py-2 rounded`) để tạo ra giao diện mong muốn.
*   **Ưu điểm vượt trội:**
    *   **Tốc độ phát triển:** Không cần chuyển qua lại giữa file HTML và CSS, không cần đặt tên class sáng tạo, giúp code giao diện nhanh hơn gấp nhiều lần.
    *   **Đồng bộ thiết kế:** Các giá trị màu sắc, kích thước, khoảng cách được quy chuẩn trong file cấu hình (`tailwind.config.js`), đảm bảo tính nhất quán toàn dự án.
    *   **Responsive dễ dàng:** Hỗ trợ các tiền tố (`sm:`, `md:`, `lg:`) để thay đổi style theo kích thước màn hình ngay trong class HTML.
    *   **Tối ưu dung lượng:** Quá trình build sẽ quét và loại bỏ các class không dùng đến (PurgeCSS), tạo ra file CSS thành phẩm rất nhỏ.

## 2.3. Công nghệ Backend

### 2.3.1. Node.js và Môi trường thực thi phi đồng bộ
**Node.js** là môi trường thực thi JavaScript phía máy chủ (server-side), được xây dựng trên nhân xử lý V8 của Google Chrome.

*   **Non-blocking I/O (Nhập/Xuất không chặn):** Node.js hoạt động dựa trên cơ chế Event Loop, cho phép xử lý hàng ngàn kết nối đồng thời mà không bị chặn chờ các tác vụ nặng (như đọc database, gọi API bên thứ 3). Điều này làm cho Node.js cực kỳ phù hợp cho các ứng dụng Real-time và Data-intensive.
*   **Ngôn ngữ duy nhất (Full-stack JavaScript):** Việc sử dụng JavaScript/TypeScript cho cả Frontend và Backend giúp giảm ngữ cảnh chuyển đổi (context switching) cho lập trình viên, dễ dàng chia sẻ code (types, utils) và thống nhất quy trình phát triển.

### 2.3.2. NestJS – Framework cấu trúc модуль
**NestJS** là một framework xây dựng ứng dụng phía máy chủ (server-side) hiệu quả, có khả năng mở rộng cao, được xây dựng trên nền tảng Node.js và sử dụng TypeScript làm ngôn ngữ chính.

*   **Kiến trúc Modular:** NestJS tổ chức code thành các Module độc lập, mỗi module đóng gói một nghiệp vụ cụ thể (ví dụ: AuthModule, JobsModule, ChatModule). Cách tổ chức này giúp dự án dễ bảo trì, kiểm thử và mở rộng khi quy mô tăng lên.
*   **Dependency Injection (DI):** NestJS tích hợp sẵn container DI, giúp quản lý các phụ thuộc giữa các class một cách tự động. Điều này thúc đẩy việc viết code lỏng lẻo (loose coupling), dễ dàng thay thế các thành phần (ví dụ: thay đổi database hay service gửi email) mà không ảnh hưởng đến toàn hệ thống.
*   **Hỗ trợ đa giao thức:** Ngoài REST API mặc định, NestJS dễ dàng tích hợp GraphQL, WebSocket (qua @nestjs/websockets) và Microservices.
*   **Decorator và Metadata:** Tận dụng sức mạnh của TypeScript Decorators để định nghĩa routes, guards, pipes... giúp code ngắn gọn, dễ đọc và tường minh.

### 2.3.3. PostgreSQL – Hệ quản trị cơ sở dữ liệu quan hệ
**PostgreSQL** là một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở mạnh mẽ, nổi tiếng với độ tin cậy, ổn định và khả năng mở rộng.

*   **Tuân thủ chuẩn ACID:** Đảm bảo các tính chất Nguyên tử (Atomicity), Nhất quán (Consistency), Cô lập (Isolation) và Bền vững (Durability) trong mọi giao dịch, cực kỳ quan trọng cho các ứng dụng tài chính, đặt hàng như đề tài này.
*   **Hỗ trợ dữ liệu phức tạp:** Ngoài dữ liệu quan hệ truyền thống, PostgreSQL还支持 JSONB (lưu trữ và truy vấn dữ liệu NoSQL hiệu quả), Full-text search, và các kiểu dữ liệu hình học không gian (PostGIS).
*   **Hiệu năng cao:** Hỗ trợ lập chỉ mục (indexing) đa dạng (B-tree, Hash, GIN, GiST), khóa hàng (row-level locking) và khả năng tùy chỉnh câu truy vấn tối ưu.

### 2.3.4. Prisma ORM – Cầu nối dữ liệu an toàn kiểu
**Prisma** là một ORM (Object-Relational Mapping) thế hệ mới, hoạt động như một lớp trừu tượng giữa ứng dụng Node.js/TypeScript và cơ sở dữ liệu.

*   **Schema-driven Development:** Prisma cho phép định nghĩa cấu trúc dữ liệu trong file `schema.prisma` với cú pháp dễ đọc. Từ đó, Prisma tự động sinh ra các file migration để tạo bảng trong database và sinh ra TypeScript Client type-safe.
*   **Type Safety:** Prisma Client tự động sinh ra các kiểu TypeScript dựa trên schema, giúp IDE gợi ý chính xác tên bảng, tên cột và kiểu dữ liệu. Lỗi sai tên trường hay kiểu dữ liệu sẽ bị báo lỗi ngay khi viết code.
*   **Query Builder mạnh mẽ:** Cung cấp API truy vấn dữ liệu trực quan, hỗ trợ các quan hệ phức tạp (nested writes, filtering, sorting) mà không cần viết SQL thô, giảm thiểu rủi ro lỗ hổng SQL Injection.
*   **Migration Management:** Công cụ `prisma migrate` giúp quản lý phiên bản cơ sở dữ liệu dễ dàng, đồng bộ hóa cấu trúc DB với code một cách an toàn.

## 2.4. Bảo mật và Xác thực

### 2.4.1. JWT (JSON Web Token)
**JWT** là một chuẩn mở (RFC 7519) định nghĩa phương pháp an toàn để truyền tải thông tin dưới dạng đối tượng JSON giữa các bên. Trong kiến trúc xác thực không trạng thái (Stateless Authentication), JWT đóng vai trò là "chìa khóa số" chứng minh danh tính người dùng.

*   **Cấu trúc:** Một JWT gồm 3 phần ngăn cách bởi dấu chấm:
    1.  **Header:** Thuật toán mã hóa và loại token.
    2.  **Payload:** Chứa các claims (khẳng định) như ID người dùng, vai trò (role), thời gian hết hạn.
    3.  **Signature:** Chữ ký số được tạo ra bằng cách mã hóa Header và Payload với một bí mật (secret key) để đảm bảo tính toàn vẹn.
*   **Cơ chế Access Token và Refresh Token:**
    *   **Access Token:** Có thời gian sống ngắn (ví dụ: 15 phút), dùng để truy cập các tài nguyên API. Nếu bị đánh cắp, rủi ro bị giới hạn trong thời gian ngắn.
    *   **Refresh Token:** Có thời gian sống dài (ví dụ: 7 ngày), được lưu trữ an toàn (thường là HttpOnly Cookie) và dùng để xin cấp lại Access Token mới khi Access Token hết hạn. Cơ chế này cân bằng giữa trải nghiệm người dùng (không phải đăng nhập lại liên tục) và bảo mật.

### 2.4.2. Bcrypt – Mã hóa mật khẩu
**Bcrypt** là một hàm băm (hashing function) được thiết kế đặc biệt để lưu trữ mật khẩu an toàn.

*   **Salting:** Bcrypt tự động thêm một chuỗi ngẫu nhiên (salt) vào mật khẩu trước khi băm, ngăn chặn các cuộc tấn công bằng bảng cầu vồng (Rainbow Table Attack).
*   **Cost Factor:** Bcrypt cho phép điều chỉnh độ phức tạp của việc băm (số vòng lặp). Khi phần cứng máy tính mạnh lên, ta có thể tăng cost factor để duy trì khả năng chống lại các cuộc tấn công brute-force.
*   **Ứng dụng:** Mật khẩu người dùng không bao giờ được lưu dưới dạng văn bản thuần (plain text). Khi đăng ký, mật khẩu được băm bằng bcrypt và lưu vào DB. Khi đăng nhập, hệ thống băm mật khẩu nhập vào và so sánh với hash đã lưu.

### 2.4.3. RBAC (Role-Based Access Control)
**RBAC** là mô hình kiểm soát truy cập dựa trên vai trò của người dùng trong hệ thống.

*   **Nguyên lý hoạt động:** Thay vì gán quyền trực tiếp cho từng người dùng, hệ thống định nghĩa các Vai trò (Role) như `ADMIN`, `CUSTOMER`, `WORKER`. Mỗi vai trò được gán một tập hợp các Quyền (Permission) cụ thể (ví dụ: `CREATE_JOB`, `APPROVE_WORKER`). Người dùng được gán vào một vai trò sẽ thừa hưởng các quyền của vai trò đó.
*   **Triển khai trong NestJS:** Sử dụng **Guards** để chặn các request tới API. Guard sẽ kiểm tra JWT payload để lấy role của user, sau đó so sánh với quyền yêu cầu của route (thông qua Decorator `@Roles()`). Nếu không khớp, request sẽ bị từ chối với lỗi 403 Forbidden.

## 2.5. Giao tiếp thời gian thực với WebSocket và Socket.io

### 2.5.1. Giao thức WebSocket
**WebSocket** là một giao thức truyền thông trên một kênh kết nối TCP duy nhất, cung cấp khả năng giao tiếp hai chiều (full-duplex) giữa trình duyệt (Client) và máy chủ (Server).

*   **Khắc phục hạn chế của HTTP:** HTTP là giao thức không trạng thái và chỉ hoạt động theo mô hình Request-Response (Client hỏi, Server trả lời). Để cập nhật dữ liệu thời gian thực (như chat, thông báo), HTTP buộc phải dùng kỹ thuật Polling (gửi yêu cầu liên tục) gây lãng phí tài nguyên và độ trễ cao.
*   **Cơ chế hoạt động:** Sau khi bắt tay (handshake) qua HTTP, kết nối được nâng cấp lên WebSocket. Lúc này, Server có thể chủ động đẩy dữ liệu (Push) xuống Client bất cứ lúc nào mà không cần Client yêu cầu trước.

### 2.5.2. Socket.io – Thư viện WebSocket toàn diện
**Socket.io** là một thư viện JavaScript cho phép giao tiếp thời gian thực, hai chiều và dựa trên sự kiện (event-based) giữa client và server. Nó bao bọc WebSocket và cung cấp các tính năng nâng cao:

*   **Fallback tự động:** Nếu trình duyệt hoặc mạng không hỗ trợ WebSocket, Socket.io tự động chuyển sang các phương thức khác như HTTP Long-polling để đảm bảo kết nối luôn được duy trì.
*   **Rooms và Namespaces:** Cho phép phân nhóm các kết nối socket. Ví dụ: Mỗi cuộc trò chuyện (Chat) giữa Khách và Thợ sẽ là một "Room" riêng biệt, đảm bảo tin nhắn chỉ được gửi đúng người nhận.
*   **Ackowledgements:** Cơ chế xác nhận tin nhắn. Khi Client gửi một sự kiện, Server có thể gửi lại một hàm callback để báo đã nhận thành công, giúp đồng bộ trạng thái chính xác.
*   **Tích hợp với NestJS:** Module `@nestjs/websockets` cung cấp các Decorator (`@WebSocketGateway`, `@SubscribeMessage`) để xây dựng WebSocket Server một cách cấu trúc, dễ quản lý như các Controller thông thường.

## 2.6. Tích hợp cổng thanh toán VNPay

### 2.6.1. Tổng quan về VNPay
**VNPay** là một trong những cổng thanh toán điện tử hàng đầu tại Việt Nam, hỗ trợ kết nối với hầu hết các ngân hàng nội địa. Đối với các dự án sinh viên hoặc thử nghiệm, VNPay cung cấp môi trường **Sandbox** (môi trường giả lập) cho phép tích hợp và kiểm tra luồng thanh toán mà không cần tiền thật.

### 2.6.2. Quy trình thanh toán tiêu chuẩn
Quy trình tích hợp VNPay trong đề tài tuân theo chuẩn bảo mật của nhà cung cấp:

1.  **Tạo URL thanh toán (Backend):**
    *   Khi người dùng chọn thanh toán online, Backend sẽ thu thập thông tin đơn hàng (Mã đơn, Số tiền, Mô tả, IP khách hàng...).
    *   Sắp xếp dữ liệu theo quy tắc và tạo chuỗi mã hóa (Secure Hash) sử dụng thuật toán HMAC-SHA512 với **Secret Key** (bí mật giữa Merchant và VNPay).
    *   Gửi yêu cầu đến VNPay Gateway để nhận lại URL thanh toán.
2.  **Chuyển hướng người dùng:** Frontend chuyển hướng người dùng sang URL thanh toán của VNPay. Tại đây, người dùng đăng nhập Internet Banking và xác nhận giao dịch.
3.  **Xử lý kết quả (IPN - Instant Payment Notification):**
    *   Sau khi thanh toán xong, VNPay sẽ gọi ngược lại (callback) một API trên Backend của dự án (gọi là URL trả kết quả - Return URL).
    *   Kèm theo các tham số trạng thái giao dịch và chữ ký số (checksum).
4.  **Xác minh và Cập nhật:**
    *   Backend nhận dữ liệu, tính toán lại checksum dựa trên Secret Key để xác minh tính toàn vẹn của dữ liệu (tránh giả mạo).
    *   Nếu chữ ký đúng và trạng thái thành công (`vnp_ResponseCode = 00`), hệ thống cập nhật trạng thái đơn hàng thành "Đã thanh toán".

### 2.6.3. Bảo mật trong thanh toán
*   **Bảo mật Secret Key:** Khóa bí mật này chỉ lưu trữ ở phía Server (Backend), tuyệt đối không đưa xuống Frontend.
*   **Kiểm traChecksum:** Luôn phải verify chữ ký số của VNPay gửi về trước khi cập nhật trạng thái đơn hàng để tránh các cuộc tấn công giả mạo request (Forged Request Attack).
*   **Idempotency:** Xử lý logic cập nhật đơn hàng sao cho dù VNPay gọi callback nhiều lần (do lỗi mạng), đơn hàng chỉ được cập nhật trạng thái thành công một lần duy nhất.
