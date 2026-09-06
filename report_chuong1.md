# CHƯƠNG 1: TỔNG QUAN

## 1.1. Đặt vấn đề

### 1.1.1. Bối cảnh thực tiễn
Trong những năm gần đây, cùng với sự phát triển mạnh mẽ của kinh tế đô thị và nhịp sống hối hả tại các thành phố lớn như Hà Nội và Thành phố Hồ Chí Minh, nhu cầu về các dịch vụ gia đình (sửa chữa điện nước, vệ sinh nhà cửa, bảo trì điều hòa, sửa khóa, giúp việc theo giờ...) ngày càng tăng cao. Theo thống kê từ các báo cáo thị trường, quy mô ngành dịch vụ hỗ trợ gia đình tại Việt Nam đang tăng trưởng với tốc độ hai con số mỗi năm, phản ánh xu hướng người dân sẵn sàng chi trả để đổi lấy thời gian và sự tiện lợi.

Tuy nhiên, thị trường này vẫn tồn tại nhiều bất cập lớn gây khó khăn cho cả người cần dịch vụ (khách hàng) và người cung cấp dịch vụ (thợ):
*   **Đối với Khách hàng:**
    *   **Khó khăn trong tìm kiếm:** Việc tìm kiếm một thợ lành nghề, uy tín thường dựa vào truyền miệng hoặc các nhóm rao vặt tự phát trên mạng xã hội, thiếu tính hệ thống và đảm bảo.
    *   **Thiếu minh bạch về giá cả:** Giá cả thường thỏa thuận miệng, dễ phát sinh chi phí "vẽ vời" sau khi hoàn thành, không có bảng giá chuẩn rõ ràng.
    *   **Rủi ro về chất lượng và an toàn:** Không có cơ chế đánh giá, giám sát chất lượng công việc; lo ngại về an ninh khi người lạ vào nhà mà không qua xác minh danh tính.
    *   **Không có bảo hành:** Khó khiếu nại hoặc yêu cầu bảo hành nếu sự cố tái diễn sau khi sửa chữa.
*   **Đối với Thợ dịch vụ:**
    *   **Bấp bênh nguồn khách:** Nguồn việc làm không ổn định, phụ thuộc vào may rủi hoặc mối quen cũ, đặc biệt khó khăn trong mùa dịch bệnh hoặc kinh tế suy thoái.
    *   **Khó xây dựng thương hiệu cá nhân:** Những thợ giỏi, tận tâm khó có kênh để quảng bá năng lực và tích lũy uy tín số hóa để được trả giá cao hơn.
    *   **Cạnh tranh không lành mạnh:** Phải cạnh tranh với các đối tượng chào giá rẻ nhưng làm việc kém chất lượng, gây mất niềm tin nơi khách hàng.

### 1.1.2. Sự cần thiết của đề tài
Trước những thực trạng trên, việc xây dựng một nền tảng trung gian kết nối minh bạch, chuyên nghiệp giữa Khách hàng và Thợ dịch vụ là một yêu cầu cấp thiết. Một hệ thống "Service Marketplace" (Chợ dịch vụ) trực tuyến sẽ giải quyết được các bài toán cốt lõi:
*   Chuẩn hóa quy trình đặt dịch vụ và báo giá.
*   Số hóa hồ sơ năng lực và lịch sử làm việc của Thợ.
*   Thiết lập cơ chế đánh giá hai chiều (Khách chấm Thợ, Thợ chấm Khách) để sàng lọc uy tín.
*   Đảm bảo an toàn giao dịch và hỗ trợ giải quyết tranh chấp.

Do đó, đề tài **"Xây dựng nền tảng web kết nối dịch vụ gia đình / tìm thợ"** được thực hiện nhằm ứng dụng các công nghệ web hiện đại để tạo ra một giải pháp công nghệ thông tin khả thi, hiệu quả, góp phần nâng cao chất lượng cuộc sống đô thị và thúc đẩy kinh tế chia sẻ trong lĩnh vực dịch vụ gia đình.

## 1.2. Mục tiêu của đề tài

### 1.2.1. Mục tiêu tổng quát
Xây dựng thành công một ứng dụng web (Web Application) hoạt động như một sàn giao dịch dịch vụ gia đình, kết nối thành công ba nhóm đối tượng chính: **Khách hàng**, **Thợ dịch vụ**, và **Quản trị viên (Admin)**. Hệ thống đảm bảo các tiêu chí: Nhanh chóng, Minh bạch, An toàn và Tiện lợi.

### 1.2.2. Mục tiêu cụ thể
Để đạt được mục tiêu tổng quát, đề tài tập trung vào các mục tiêu cụ thể sau:
1.  **Về chức năng:**
    *   Xây dựng được hệ thống đăng ký, đăng nhập và phân quyền chặt chẽ cho 3 vai trò: Khách hàng, Thợ, Admin.
    *   Triển khai đầy đủ luồng nghiệp vụ chính: Khách đăng việc → Thợ gửi báo giá → Khách chọn thợ → Thực hiện dịch vụ → Thanh toán → Đánh giá.
    *   Tích hợp tính năng Chat thời gian thực (Real-time Chat) để trao đổi chi tiết công việc giữa Khách và Thợ.
    *   Tích hợp cổng thanh toán VNPay (chế độ Sandbox) để hỗ trợ thanh toán trực tuyến bên cạnh phương thức COD (trả tiền mặt).
    *   Cung cấp trang quản trị (Admin Dashboard) để duyệt hồ sơ thợ, quản lý người dùng, xem thống kê và xử lý khiếu nại.
2.  **Về công nghệ:**
    *   Ứng dụng thành công mô hình kiến trúc Client-Server tách biệt.
    *   Frontend: Sử dụng ReactJS, TypeScript, Vite và Tailwind CSS để xây dựng giao diện hiện đại, responsivie và type-safe.
    *   Backend: Sử dụng NestJS (Node.js) để xây dựng API theo kiến trúc Module, kết hợp PostgreSQL và Prisma ORM để quản lý dữ liệu quan hệ phức tạp.
    *   Bảo mật: Áp dụng chuẩn JWT (JSON Web Token) với cơ chế Access/Refresh Token và mã hóa mật khẩu bcrypt.
    *   Real-time: Sử dụng Socket.io cho các tính năng chat và thông báo tức thời.
3.  **Về sản phẩm:**
    *   Tạo ra một sản phẩm phần mềm hoàn chỉnh, có thể chạy demo (demo-ready), mã nguồn mở và có tài liệu hướng dẫn cài đặt chi tiết.
    *   Sản phẩm có khả năng mở rộng và phát triển thêm các tính năng mới trong tương lai.

## 1.3. Phạm vi của đề tài

### 1.3.1. Phạm vi chức năng
Đề tài tập trung nghiên cứu và xây dựng các phân hệ chức năng chính sau:
*   **Phân hệ dành cho Khách hàng:**
    *   Tìm kiếm, xem danh sách thợ theo khu vực, kỹ năng, đánh giá.
    *   Đăng tải yêu cầu dịch vụ (mô tả, địa điểm, thời gian, mức giá dự kiến).
    *   Nhận và so sánh các báo giá từ các thợ.
    *   Chấp nhận báo giá, theo dõi trạng thái đơn hàng.
    *   Chat trực tiếp với thợ.
    *   Thanh toán hóa đơn (VNPay hoặc COD).
    *   Đánh giá, xếp hạng thợ sau khi hoàn thành dịch vụ.
    *   Lưu trữ thợ yêu thích.
*   **Phân hệ dành cho Thợ dịch vụ:**
    *   Tạo và quản lý hồ sơ cá nhân (kỹ năng, kinh nghiệm, khu vực hoạt động, giấy tờ tùy thân).
    *   Tìm kiếm và nhận thông báo về các công việc phù hợp.
    *   Gửi báo giá cho các yêu cầu từ khách hàng.
    *   Quản lý lịch làm việc, cập nhật trạng thái công việc.
    *   Chat trực tiếp với khách hàng.
    *   Xem thu nhập, lịch sử giao dịch.
*   **Phân hệ dành cho Quản trị viên (Admin):**
    *   Duyệt hồ sơ đăng ký làm thợ (xác minh danh tính).
    *   Quản lý người dùng (khóa/mở tài khoản vi phạm).
    *   Quản lý danh mục dịch vụ (Category).
    *   Quản lý khu vực hoạt động (Districts).
    *   Xem báo cáo thống kê (doanh thu, số lượng đơn, người dùng mới).
    *   Xử lý các báo cáo vi phạm, khiếu nại từ người dùng.

### 1.3.2. Phạm vi dữ liệu và đối tượng áp dụng
*   **Dữ liệu:** Hệ thống quản lý dữ liệu người dùng, dữ liệu công việc, giao dịch, tin nhắn và đánh giá trong phạm vi cơ sở dữ liệu của dự án. Dữ liệu mẫu (seed data) được xây dựng để mô phỏng môi trường thực tế tại các quận nội thành của TP.HCM và Hà Nội.
*   **Đối tượng áp dụng:** Đề tài hướng tới người dùng cuối là các hộ gia đình, cá nhân có nhu cầu sửa chữa nhỏ lẻ và các thợ thủ công, kỹ thuật viên tự do.

### 1.3.3. Giới hạn của đề tài
Do giới hạn về thời gian và nguồn lực thực hiện đồ án, đề tài còn một số hạn chế:
*   Chưa xây dựng ứng dụng di động (Mobile App) riêng biệt, chỉ phát triển trên nền tảng Web (có thể truy cập bằng trình duyệt điện thoại).
*   Tính năng thanh toán đang ở chế độ thử nghiệm (Sandbox) của VNPay, chưa kết nối với giao dịch tiền thật.
*   Chưa tích hợp bản đồ số (Google Maps API) để ghim tọa độ chính xác, mới chỉ dừng lại ở việc chọn Quận/Huyện.
*   Chưa có các thuật toán AI để gợi ý ghép nối (matching) tối ưu giữa Khách và Thợ, mới chỉ dựa trên lọc cơ bản.

## 1.4. Ý nghĩa thực tiễn của đề tài

### 1.4.1. Đối với xã hội và cộng đồng
*   **Nâng cao chất lượng sống:** Giúp người dân tiết kiệm thời gian tìm kiếm, yên tâm hơn về chất lượng dịch vụ và an ninh khi sử dụng dịch vụ sửa chữa tại nhà.
*   **Tạo việc làm bền vững:** Mở ra kênh tìm việc làm ổn định, minh bạch cho đội ngũ thợ thủ công, giúp họ chủ động thu nhập và xây dựng thương hiệu cá nhân dựa trên uy tín.
*   **Thúc đẩy kinh tế số:** Góp phần chuyển đổi số trong lĩnh vực dịch vụ truyền thống, đưa các giao dịch offline lên môi trường online có kiểm soát.

### 1.4.2. Đối với sinh viên/nhóm thực hiện
*   **Củng cố kiến thức:** Hệ thống hóa và áp dụng thực tế các kiến thức đã học về Công nghệ phần mềm, Cơ sở dữ liệu, Lập trình Web, An toàn thông tin.
*   **Rèn luyện kỹ năng:** Nâng cao kỹ năng phân tích yêu cầu, thiết kế hệ thống, làm việc nhóm, giải quyết vấn đề và quản lý dự án phần mềm theo quy trình chuẩn.
*   **Sản phẩm portfolio:** Tạo ra một sản phẩm thực tế, có độ phức tạp cao để đưa vào hồ sơ năng lực (portfolio) xin việc sau khi tốt nghiệp.

## 1.5. Cấu trúc của báo cáo
Báo cáo đồ án được trình bày gồm 5 chương chính, bố cục như sau:

*   **Chương 1: Tổng quan.** Trình bày bối cảnh, lý do chọn đề tài, mục tiêu, phạm vi và ý nghĩa thực tiễn của dự án.
*   **Chương 2: Cơ sở lý thuyết.** Tổng hợp các kiến thức nền tảng, công nghệ sử dụng (React, NestJS, PostgreSQL, Socket.io...), và các nghiên cứu liên quan đến mô hình Service Marketplace.
*   **Chương 3: Phân tích và thiết kế hệ thống.** Đi sâu vào phân tích yêu cầu, thiết kế kiến trúc, thiết kế cơ sở dữ liệu, thiết kế API và các biểu đồ luồng xử lý nghiệp vụ chính.
*   **Chương 4: Triển khai và cài đặt ứng dụng.** Mô tả quá trình hiện thực hóa mã nguồn, cấu trúc dự án, các module chức năng chính, kết quả giao diện và quy trình kiểm thử.
*   **Chương 5: Kết luận.** Tổng kết các kết quả đạt được, nêu rõ những hạn chế còn tồn tại và đề xuất các hướng phát triển trong tương lai.

Ngoài ra, báo cáo còn có phần Tài liệu tham khảo liệt kê các nguồn thông tin uy tín được trích dẫn trong quá trình nghiên cứu.
