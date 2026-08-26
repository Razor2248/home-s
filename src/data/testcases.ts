/**
 * GIAI ĐOẠN 6 — BỘ TEST CASE NGHIỆM THU
 * Dành cho người không biết code: đọc từng bước, làm theo, đối chiếu kết quả.
 */

export type Priority = "P0" | "P1" | "P2";
export type GroupId = "auth" | "customer" | "worker" | "admin" | "edge";

export interface TestCase {
  id: string;
  group: GroupId;
  priority: Priority;
  feature: string;
  steps: string[];
  expected: string;
}

export const GROUPS: { id: GroupId; label: string; short: string }[] = [
  { id: "auth", label: "Chung & Xác thực", short: "Chung" },
  { id: "customer", label: "Khách hàng", short: "Khách" },
  { id: "worker", label: "Thợ", short: "Thợ" },
  { id: "admin", label: "Quản trị viên", short: "Admin" },
  { id: "edge", label: "Biên & Lỗi", short: "Biên" },
];

export const TEST_CASES: TestCase[] = [
  /* ---------- CHUNG & XÁC THỰC ---------- */
  {
    id: "TC-A01", group: "auth", priority: "P1", feature: "Trang chủ tải đầy đủ",
    steps: ["Mở ứng dụng tại trang chủ", "Cuộn hết trang, quan sát bảng việc trực tiếp và các khối nội dung"],
    expected: "Bảng việc hiển thị dữ liệu thật (mã HS-…), marquee danh mục chạy, không lỗi console (F12 → Console).",
  },
  {
    id: "TC-A02", group: "auth", priority: "P0", feature: "Đăng ký khách hàng mới",
    steps: ["Vào Đăng nhập → tab Đăng ký", "Chọn vai trò Khách hàng, điền họ tên, email mới, SĐT, mật khẩu", "Bấm Đăng ký"],
    expected: "Tạo tài khoản thành công, tự đăng nhập và đưa vào khu vực Khách hàng.",
  },
  {
    id: "TC-A03", group: "auth", priority: "P0", feature: "Đăng ký trùng email",
    steps: ["Đăng ký với email đã tồn tại: khach@demo.vn"],
    expected: "Báo lỗi inline “Email đã được sử dụng”, không tạo tài khoản.",
  },
  {
    id: "TC-A04", group: "auth", priority: "P0", feature: "Đăng nhập 3 tài khoản demo",
    steps: ["Đăng nhập khach@demo.vn / 123456", "Đăng xuất, đăng nhập tho@demo.vn / 123456", "Đăng xuất, đăng nhập admin@demo.vn / 123456"],
    expected: "Mỗi tài khoản vào đúng khu vực của vai trò (Khách / Thợ / Admin).",
  },
  {
    id: "TC-A05", group: "auth", priority: "P1", feature: "Sai mật khẩu",
    steps: ["Đăng nhập khach@demo.vn với mật khẩu sai"],
    expected: "Báo lỗi “Mật khẩu không đúng”, form rung nhẹ, không đăng nhập được.",
  },
  {
    id: "TC-A06", group: "auth", priority: "P1", feature: "Đăng xuất & chặn truy cập",
    steps: ["Đăng nhập khách, bấm Đăng xuất", "Dán thẳng địa chỉ /app/customer lên thanh URL"],
    expected: "Về trang chủ; truy cập trực tiếp bị chặn và chuyển hướng về Đăng nhập.",
  },
  {
    id: "TC-A07", group: "auth", priority: "P2", feature: "Khôi phục dữ liệu demo",
    steps: ["Thao tác tùy ý làm thay đổi dữ liệu", "Đăng xuất, bấm “Khôi phục dữ liệu demo” ở trang đăng nhập", "Đăng nhập lại"],
    expected: "Dữ liệu về trạng thái gốc: HS-1001 có 2 báo giá, có hồ sơ thợ chờ duyệt.",
  },
  {
    id: "TC-A08", group: "auth", priority: "P2", feature: "Chọn nguồn dữ liệu (Demo / Server API)",
    steps: ["Ở trang đăng nhập, chọn Server API", "Giữ địa chỉ mặc định khi chưa chạy backend, bấm Kiểm tra", "Chọn lại Demo và đăng nhập"],
    expected: "Báo lỗi kết nối rõ ràng khi không có server; quay về Demo vẫn đăng nhập bình thường.",
  },

  /* ---------- KHÁCH HÀNG ---------- */
  {
    id: "TC-C01", group: "customer", priority: "P0", feature: "Tìm & lọc thợ",
    steps: ["Đăng nhập khách, vào Tìm thợ", "Chọn danh mục “Sửa điện dân dụng”, khu vực “Bình Thạnh”"],
    expected: "Chỉ hiện thợ điện tại Bình Thạnh (Nguyễn Văn Tuấn), bộ đếm kết quả cập nhật đúng.",
  },
  {
    id: "TC-C02", group: "customer", priority: "P1", feature: "Sắp xếp thợ",
    steps: ["Trong Tìm thợ, lần lượt chọn sắp xếp: Đánh giá cao, Giá thấp"],
    expected: "Thứ tự thẻ thợ thay đổi đúng tiêu chí; thợ có điểm “phù hợp” cao nằm đầu khi lọc đúng nghề.",
  },
  {
    id: "TC-C03", group: "customer", priority: "P0", feature: "Xem hồ sơ thợ",
    steps: ["Bấm vào thẻ thợ bất kỳ"],
    expected: "Hiện đầy đủ: bảng giá, đánh giá gần đây, huy hiệu, năm kinh nghiệm, nút Đặt lịch & Yêu thích.",
  },
  {
    id: "TC-C04", group: "customer", priority: "P0", feature: "Đặt lịch trực tiếp",
    steps: ["Trong hồ sơ thợ, bấm Đặt lịch", "Chọn thời gian, điền địa chỉ, ghi chú", "Xác nhận"],
    expected: "Tạo phiếu việc trạng thái “Đã nhận việc”, có trong Việc của tôi, thợ nhận thông báo.",
  },
  {
    id: "TC-C05", group: "customer", priority: "P1", feature: "Lưu thợ yêu thích",
    steps: ["Bấm biểu tượng trái tim ở thẻ thợ", "Mở tab Yêu thích", "Tải lại trang (F5)"],
    expected: "Thợ xuất hiện trong Yêu thích và vẫn còn sau khi tải lại.",
  },
  {
    id: "TC-C06", group: "customer", priority: "P0", feature: "Đăng việc thành công",
    steps: ["Vào Đăng việc, điền đầy đủ: tiêu đề, danh mục, mô tả, khu vực, địa chỉ, ngân sách", "Bấm Đăng việc"],
    expected: "Tạo phiếu HS-10xx, trạng thái “Chờ báo giá”, hiển thị trong Việc của tôi và bảng việc trang chủ.",
  },
  {
    id: "TC-C07", group: "customer", priority: "P1", feature: "Ràng buộc khi đăng việc",
    steps: ["Để trống tiêu đề hoặc mô tả, bấm Đăng việc"],
    expected: "Báo lỗi inline tại trường thiếu, không tạo phiếu việc.",
  },
  {
    id: "TC-C08", group: "customer", priority: "P1", feature: "Ước tính chi phí",
    steps: ["Trong form đăng việc, chọn từng danh mục"],
    expected: "Hiện khoảng giá tham khảo tương ứng (VD: sửa điện 150.000–500.000₫).",
  },
  {
    id: "TC-C09", group: "customer", priority: "P0", feature: "Nhận & so sánh báo giá",
    steps: ["Mở phiếu HS-1001 (Ổ cắm bị chập)"],
    expected: "Có 2 báo giá với giá, thời gian có mặt, lời nhắn; hiển thị mức tiết kiệm so với ngân sách.",
  },
  {
    id: "TC-C10", group: "customer", priority: "P0", feature: "Chốt thợ từ báo giá",
    steps: ["Trong HS-1001, bấm “Chọn thợ này” ở báo giá của Tuấn"],
    expected: "Phiếu chuyển “Đã nhận việc”, báo giá còn lại gắn nhãn “Không được chọn”, khung chat mở ra.",
  },
  {
    id: "TC-C11", group: "customer", priority: "P0", feature: "Theo dõi tiến độ",
    steps: ["Mở một phiếu đang thi công (HS-1004 — Sơn nhà)"],
    expected: "Timeline 5 bước tô đúng trạng thái hiện tại; trạng thái cập nhật khi thợ thao tác.",
  },
  {
    id: "TC-C12", group: "customer", priority: "P0", feature: "Chat với thợ",
    steps: ["Mở phiếu đã chốt thợ, gõ tin nhắn, Enter"],
    expected: "Tin hiển thị trong hội thoại kèm giờ gửi; đăng nhập vai trò thợ sẽ thấy cùng hội thoại.",
  },
  {
    id: "TC-C13", group: "customer", priority: "P0", feature: "Nghiệm thu & đánh giá",
    steps: ["Mở phiếu HS-1005 (đã hoàn thành)", "Chọn số sao, viết nhận xét ≥ 5 ký tự, gửi"],
    expected: "Phiếu chuyển “Đã đánh giá”, điểm thợ tăng (xem trong hồ sơ thợ), thợ nhận thông báo.",
  },
  {
    id: "TC-C14", group: "customer", priority: "P1", feature: "Ràng buộc đánh giá",
    steps: ["Nhận xét dưới 5 ký tự, bấm Gửi"],
    expected: "Báo lỗi, không gửi được đánh giá.",
  },
  {
    id: "TC-C15", group: "customer", priority: "P1", feature: "Hủy phiếu việc",
    steps: ["Mở phiếu đang chờ báo giá, bấm Hủy phiếu việc, nhập lý do, xác nhận"],
    expected: "Phiếu chuyển “Đã hủy” kèm lý do; nếu đã có thợ nhận, thợ được thông báo.",
  },
  {
    id: "TC-C16", group: "customer", priority: "P1", feature: "Thanh toán (sandbox VNPay)",
    steps: ["Mở phiếu đã chốt thợ, bấm “Thanh toán ngay”", "Chọn VNPay — Quét QR, bấm Thanh toán", "Chờ màn hình xử lý"],
    expected: "Hiện “Thanh toán thành công” với mã giao dịch; phiếu gắn trạng thái “Đã thanh toán”.",
  },

  /* ---------- THỢ ---------- */
  {
    id: "TC-W01", group: "worker", priority: "P0", feature: "Sàn việc đúng nghề",
    steps: ["Đăng nhập tho@demo.vn, vào Việc phù hợp"],
    expected: "Chỉ hiện việc danh mục Sửa điện đang mở (HS-1001), không hiện việc khác nghề.",
  },
  {
    id: "TC-W02", group: "worker", priority: "P0", feature: "Gửi báo giá",
    steps: ["Bấm Gửi báo giá ở HS-1001", "Nhập giá, thời gian có mặt, lời nhắn, gửi"],
    expected: "Thẻ việc gắn “Đã báo giá”; đăng nhập khách thấy báo giá mới trong HS-1001.",
  },
  {
    id: "TC-W03", group: "worker", priority: "P1", feature: "Chặn báo giá trùng",
    steps: ["Cố gửi báo giá lần 2 cho cùng một việc"],
    expected: "Bị chặn với thông báo đã gửi trước đó.",
  },
  {
    id: "TC-W04", group: "worker", priority: "P0", feature: "Nhận việc sau khi khách chốt",
    steps: ["Dùng tài khoản khách chốt báo giá của Tuấn", "Đăng nhập thợ, mở Việc của tôi"],
    expected: "Việc HS-1001 xuất hiện ở tab “Đang xử lý” với trạng thái “Đã nhận việc”.",
  },
  {
    id: "TC-W05", group: "worker", priority: "P0", feature: "Thi công & hoàn thành",
    steps: ["Mở việc đã nhận, bấm “Bắt đầu thi công”", "Bấm “Hoàn thành việc”"],
    expected: "Trạng thái chuyển đúng trình tự; khách nhận thông báo ở mỗi bước.",
  },
  {
    id: "TC-W06", group: "worker", priority: "P1", feature: "Bật/tắt nhận việc",
    steps: ["Ở Tổng quan, gạt công tắc sang Tạm nghỉ", "Đăng nhập khách, tìm thợ điện"],
    expected: "Thợ không còn xuất hiện trong kết quả tìm kiếm của khách.",
  },
  {
    id: "TC-W07", group: "worker", priority: "P1", feature: "Hồ sơ chờ duyệt",
    steps: ["Đăng ký tài khoản Thợ mới", "Đăng nhập, vào Việc phù hợp và thử gửi báo giá"],
    expected: "Hiện banner “Hồ sơ đang chờ Admin duyệt”; nút gửi báo giá bị vô hiệu.",
  },
  {
    id: "TC-W08", group: "worker", priority: "P1", feature: "Thống kê thu nhập",
    steps: ["Vào Thống kê"],
    expected: "Biểu đồ doanh thu 14 ngày, bình quân/việc, phân bố sao và nhận xét gần đây hiển thị đúng số liệu.",
  },
  {
    id: "TC-W09", group: "worker", priority: "P1", feature: "Cập nhật hồ sơ & bảng giá",
    steps: ["Vào Hồ sơ của tôi, sửa giới thiệu, thêm 1 hạng mục bảng giá, Lưu", "Đăng nhập khách mở hồ sơ thợ này"],
    expected: "Khách thấy nội dung mới ngay sau khi lưu.",
  },
  {
    id: "TC-W10", group: "worker", priority: "P2", feature: "Thông báo việc mới",
    steps: ["Đăng nhập khách, đăng việc “Sửa điện” mới", "Đăng nhập thợ, mở chuông thông báo"],
    expected: "Có thông báo việc mới phù hợp kèm mã phiếu.",
  },

  /* ---------- ADMIN ---------- */
  {
    id: "TC-D01", group: "admin", priority: "P0", feature: "Dashboard số liệu",
    steps: ["Đăng nhập admin@demo.vn"],
    expected: "KPI (người dùng, thợ hoạt động, việc mở, phí 10%), biểu đồ 14 ngày, phân bố danh mục hiển thị đủ.",
  },
  {
    id: "TC-D02", group: "admin", priority: "P0", feature: "Duyệt hồ sơ thợ",
    steps: ["Vào Duyệt thợ → tab Chờ duyệt (Lê Anh Đức)", "Bấm Duyệt hồ sơ"],
    expected: "Chuyển sang Đã duyệt; đăng nhập thợ tương ứng thấy có thể gửi báo giá.",
  },
  {
    id: "TC-D03", group: "admin", priority: "P0", feature: "Từ chối kèm lý do",
    steps: ["Bấm Từ chối một hồ sơ, để trống lý do → gửi", "Nhập lý do hợp lệ → gửi"],
    expected: "Lần 1 bị chặn; lần 2 hồ sơ sang tab Đã từ chối với lý do hiển thị, thợ nhận thông báo.",
  },
  {
    id: "TC-D04", group: "admin", priority: "P1", feature: "Khóa / mở khóa tài khoản",
    steps: ["Khóa một khách hàng", "Đăng xuất, đăng nhập bằng tài khoản vừa khóa"],
    expected: "Đăng nhập thất bại với thông báo tài khoản bị khóa; mở khóa lại thì đăng nhập được.",
  },
  {
    id: "TC-D05", group: "admin", priority: "P1", feature: "Tìm kiếm người dùng",
    steps: ["Gõ “lan” vào ô tìm, hoặc lọc vai trò “Thợ”"],
    expected: "Kết quả lọc đúng, bảng cập nhật tức thì.",
  },
  {
    id: "TC-D06", group: "admin", priority: "P0", feature: "Thêm danh mục mới",
    steps: ["Vào Danh mục → Thêm, nhập “Sửa máy giặt”, khoảng giá, màu", "Lưu, mở trang chủ"],
    expected: "Danh mục mới xuất hiện ngay ở trang chủ và bộ lọc của khách.",
  },
  {
    id: "TC-D07", group: "admin", priority: "P1", feature: "Chặn xóa danh mục đang dùng",
    steps: ["Thử xóa danh mục “Sửa điện dân dụng”"],
    expected: "Bị chặn với thông báo còn thợ/công việc tham chiếu.",
  },
  {
    id: "TC-D08", group: "admin", priority: "P1", feature: "Xử lý đánh giá vi phạm",
    steps: ["Vào Báo cáo vi phạm → tab Bị báo cáo", "Bấm “Ẩn đánh giá”"],
    expected: "Đánh giá chuyển sang tab Đã ẩn và biến mất khỏi hồ sơ thợ.",
  },
  {
    id: "TC-D09", group: "admin", priority: "P2", feature: "Chuông thông báo",
    steps: ["Quan sát badge chưa đọc trên chuông", "Mở bảng thông báo, chờ ~1 giây"],
    expected: "Badge biến mất sau khi đã đọc; thông báo mới nhất nằm đầu danh sách.",
  },

  /* ---------- BIÊN & LỖI ---------- */
  {
    id: "TC-E01", group: "edge", priority: "P1", feature: "Đường dẫn không tồn tại",
    steps: ["Truy cập /app/customer/jobs/khong-ton-tai"],
    expected: "Hiện màn hình “Không tìm thấy phiếu việc” với nút quay về, không crash.",
  },
  {
    id: "TC-E02", group: "edge", priority: "P1", feature: "Truy cập sai vai trò",
    steps: ["Đăng nhập khách, dán địa chỉ /app/admin"],
    expected: "Bị chuyển hướng về đúng khu vực của khách.",
  },
  {
    id: "TC-E03", group: "edge", priority: "P2", feature: "Tải lại giữa chừng",
    steps: ["Đang ở chi tiết việc hoặc form đăng việc, bấm F5"],
    expected: "Phiên đăng nhập và dữ liệu được giữ nguyên (lưu localStorage).",
  },
  {
    id: "TC-E04", group: "edge", priority: "P2", feature: "An toàn đầu vào",
    steps: ["Đăng việc với tiêu đề chứa <script>alert(1)</script>"],
    expected: "Nội dung hiển thị dạng chữ thuần, không có hộp thoại nào bật lên.",
  },
  {
    id: "TC-E05", group: "edge", priority: "P1", feature: "Responsive mobile",
    steps: ["Mở DevTools (F12), giả lập iPhone/375px, duyệt các trang chính"],
    expected: "Sidebar thành ngăn kéo, bảng cuộn ngang, nút bấm không chồng lấn.",
  },
  {
    id: "TC-E06", group: "edge", priority: "P2", feature: "Hiệu năng trang chủ",
    steps: ["Chạy Lighthouse (DevTools) cho trang chủ"],
    expected: "Điểm Performance ≥ 80, không lỗi Best Practices nghiêm trọng.",
  },
];

/* ---------- KỊCH BẢN DEMO BẢO VỆ (~8 phút) ---------- */
export const DEMO_SCRIPT: { role: string; time: string; action: string }[] = [
  { role: "Khách", time: "0:00", action: "Mở trang chủ — giới thiệu bảng việc trực tiếp & 8 danh mục (15 giây)." },
  { role: "Khách", time: "0:30", action: "Đăng nhập khach@demo.vn — giới thiệu tổng quan + panel gợi ý thợ phù hợp." },
  { role: "Khách", time: "1:30", action: "Mở HS-1001: so sánh 2 báo giá → chốt thợ Nguyễn Văn Tuấn." },
  { role: "2 vai", time: "2:30", action: "Mở 2 cửa sổ: khách chat — thợ trả lời, tin nhắn hiện tức thì." },
  { role: "Thợ", time: "3:30", action: "Đăng nhập tho@demo.vn — Bắt đầu thi công → Hoàn thành việc." },
  { role: "Khách", time: "4:30", action: "Quay lại khách: thanh toán sandbox VNPay → nghiệm thu, đánh giá 5★." },
  { role: "Khách", time: "5:30", action: "Đăng việc mới trực tiếp: xem ước tính chi phí → đăng; chuông thợ nổ thông báo." },
  { role: "Admin", time: "6:30", action: "Đăng nhập admin@demo.vn — dashboard, duyệt hồ sơ Lê Anh Đức, ẩn 1 đánh giá vi phạm." },
  { role: "—", time: "7:30", action: "Mở /docs: sơ đồ CSDL 14 bảng + 47 endpoint REST + luồng Socket.io để trả lời câu hỏi." },
];

/* ---------- Lưu trữ kết quả test ---------- */
export type TestStatus = "pass" | "fail";
export interface TestResult {
  s: TestStatus;
  note: string;
  at: number;
}

const QA_KEY = "hs_qa_v1";

export function loadQA(): Record<string, TestResult> {
  try {
    return JSON.parse(localStorage.getItem(QA_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveQA(r: Record<string, TestResult>) {
  try {
    localStorage.setItem(QA_KEY, JSON.stringify(r));
  } catch {
    /* ignore */
  }
}

export function clearQA() {
  try {
    localStorage.removeItem(QA_KEY);
  } catch {
    /* ignore */
  }
}
