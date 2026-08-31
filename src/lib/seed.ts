import type { DB } from "./types";

const now = Date.now();
const h = (n: number) => now - n * 3600_000;
const d = (n: number) => now - n * 86400_000;

/** Khu vực mặc định — trùng khớp seed backend, admin có thể quản lý thêm */
export const BASE_DISTRICTS = [
  { id: "q1", name: "Quận 1", active: true },
  { id: "q3", name: "Quận 3", active: true },
  { id: "q7", name: "Quận 7", active: true },
  { id: "q10", name: "Quận 10", active: true },
  { id: "bt", name: "Bình Thạnh", active: true },
  { id: "pn", name: "Phú Nhuận", active: true },
  { id: "tb", name: "Tân Bình", active: true },
  { id: "td", name: "Thủ Đức", active: true },
];

export function seedDB(): DB {
  return {
    seq: 1009,
    settings: { platformFee: 10 },
    payments: [],
    districts: BASE_DISTRICTS,
    categoryChanges: [
      {
        id: "ccr-01", workerId: "w-minh", workerName: "Hoàng Nhật Minh", fromCategoryId: "dien", toCategoryId: "dieuhoa",
        note: "Em mới học xong khóa lắp đặt – bảo trì máy lạnh, muốn mở rộng nhận thêm việc điện lạnh.",
        status: "pending", createdAt: now - 5 * 3600_000,
      },
    ],
    passwordResets: [],
    categories: [
      { id: "dien", name: "Sửa điện dân dụng", icon: "bolt", color: "#f4581c", priceMin: 150000, priceMax: 500000, unit: "lần" },
      { id: "nuoc", name: "Sửa ống nước", icon: "droplet", color: "#2f6fd0", priceMin: 150000, priceMax: 450000, unit: "lần" },
      { id: "dieuhoa", name: "Điều hòa – điện lạnh", icon: "snow", color: "#38a3c0", priceMin: 250000, priceMax: 800000, unit: "máy" },
      { id: "giupviec", name: "Giúp việc nhà", icon: "broom", color: "#159a6c", priceMin: 60000, priceMax: 90000, unit: "giờ" },
      { id: "khoa", name: "Mở khóa – thay khóa", icon: "key", color: "#dd9a2b", priceMin: 100000, priceMax: 300000, unit: "lần" },
      { id: "son", name: "Sơn sửa – chống thấm", icon: "paint", color: "#c4504f", priceMin: 300000, priceMax: 1500000, unit: "hạng mục" },
      { id: "noithat", name: "Đồ gỗ – nội thất", icon: "hammer", color: "#7a5c3e", priceMin: 200000, priceMax: 700000, unit: "hạng mục" },
      { id: "vesinh", name: "Vệ sinh công nghiệp", icon: "sparkle", color: "#4e9b8f", priceMin: 300000, priceMax: 900000, unit: "căn" },
    ],
    users: [
      { id: "u-khach", role: "customer", name: "Minh Anh", email: "khach@demo.vn", phone: "0901 234 567", password: "123456", avatarColor: "#f4581c", createdAt: d(120), favorites: ["w-tuan", "w-hoa"] },
      { id: "u-tho", role: "worker", name: "Nguyễn Văn Tuấn", email: "tho@demo.vn", phone: "0912 888 999", password: "123456", avatarColor: "#2e527c", createdAt: d(300), favorites: [] },
      { id: "u-admin", role: "admin", name: "Quốc Bảo", email: "admin@demo.vn", phone: "0900 000 001", password: "123456", avatarColor: "#0b1b2e", createdAt: d(400), favorites: [] },
      { id: "u-lan", role: "customer", name: "Chị Lan", email: "lan@demo.vn", phone: "0903 111 222", password: "123456", avatarColor: "#159a6c", createdAt: d(90), favorites: [] },
      { id: "u-hai", role: "customer", name: "Anh Hải", email: "hai@demo.vn", phone: "0904 333 444", password: "123456", avatarColor: "#dd9a2b", createdAt: d(60), favorites: [] },
      { id: "u-ngoc", role: "customer", name: "Thu Ngọc", email: "ngoc@demo.vn", phone: "0905 555 666", password: "123456", avatarColor: "#38a3c0", createdAt: d(45), favorites: [] },
    ],
    workers: [
      {
        id: "w-tuan", userId: "u-tho", name: "Nguyễn Văn Tuấn", categoryId: "dien", district: "Bình Thạnh", yearsExp: 8,
        rating: 4.9, ratingCount: 124, jobsDone: 260, priceFrom: 150000, approval: "approved", available: true, verified: true,
        bio: "Thợ điện 8 năm kinh nghiệm, chuyên xử lý chập cháy, đi lại đường dây, lắp đặt thiết bị. Làm việc gọn gàng, có phiếu bảo hành sau mỗi hạng mục.",
        badges: ["Bảo hành 30 ngày", "Chính chủ", "Phản hồi nhanh"], responseMins: 15,
        priceList: [
          { label: "Thay ổ cắm / công tắc", price: 150000 },
          { label: "Lắp đèn, quạt trần", price: 200000 },
          { label: "Sửa chập điện, nhảy aptomat", price: 350000 },
          { label: "Đi lại đường dây (phòng)", price: 500000 },
        ],
      },
      {
        id: "w-hung", userId: "u-hung", name: "Trần Mạnh Hùng", categoryId: "nuoc", district: "Quận 7", yearsExp: 6,
        rating: 4.8, ratingCount: 98, jobsDone: 190, priceFrom: 180000, approval: "approved", available: true, verified: true,
        bio: "Chuyên sửa chữa – thay thế đường ống nước, thiết bị vệ sinh. Báo giá trước khi làm, không phát sinh.",
        badges: ["Bảo hành 14 ngày"], responseMins: 20,
        priceList: [
          { label: "Thay vòi / gioăng", price: 180000 },
          { label: "Thông tắc lavabo, bồn cầu", price: 300000 },
          { label: "Sửa rò rỉ đường ống âm", price: 450000 },
        ],
      },
      {
        id: "w-hoa", userId: "u-hoa", name: "Lê Thị Hoa", categoryId: "giupviec", district: "Phú Nhuận", yearsExp: 5,
        rating: 4.9, ratingCount: 210, jobsDone: 480, priceFrom: 60000, approval: "approved", available: true, verified: true,
        bio: "Giúp việc theo giờ, dọn dẹp nhà cửa – căn hộ, nấu ăn gia đình. Đúng giờ, cẩn thận, tự mang dụng cụ.",
        badges: ["Đúng giờ", "Dọn chuyên sâu"], responseMins: 30,
        priceList: [
          { label: "Dọn theo giờ", price: 60000 },
          { label: "Tổng vệ sinh căn hộ 2PN", price: 450000 },
        ],
      },
      {
        id: "w-long", userId: "u-long", name: "Phạm Hải Long", categoryId: "khoa", district: "Quận 1", yearsExp: 10,
        rating: 4.7, ratingCount: 76, jobsDone: 320, priceFrom: 120000, approval: "approved", available: true, verified: true,
        bio: "Mở khóa cửa, khóa xe, két sắt – thay khóa chống trộm. Phục vụ 24/7 kể cả lễ Tết.",
        badges: ["Phục vụ 24/7", "Không phá khóa"], responseMins: 10,
        priceList: [
          { label: "Mở khóa cửa nhà", price: 120000 },
          { label: "Thay khóa tay gạt", price: 250000 },
          { label: "Lắp khóa điện tử", price: 300000 },
        ],
      },
      {
        id: "w-khang", userId: "u-khang", name: "Vũ Hoàng Khang", categoryId: "dieuhoa", district: "Tân Bình", yearsExp: 7,
        rating: 4.8, ratingCount: 143, jobsDone: 230, priceFrom: 250000, approval: "approved", available: true, verified: true,
        bio: "Lắp đặt, bảo trì, sửa chữa máy lạnh – tủ lạnh – máy giặt. Nạp gas chính hãng, bảo hành dài hạn.",
        badges: ["Bảo hành 6 tháng", "Chính hãng"], responseMins: 25,
        priceList: [
          { label: "Vệ sinh máy lạnh", price: 250000 },
          { label: "Lắp máy lạnh trọn gói", price: 550000 },
          { label: "Nạp gas R32", price: 400000 },
        ],
      },
      {
        id: "w-son", userId: "u-son", name: "Bùi Văn Sơn", categoryId: "son", district: "Thủ Đức", yearsExp: 9,
        rating: 4.6, ratingCount: 61, jobsDone: 120, priceFrom: 300000, approval: "approved", available: false, verified: true,
        bio: "Nhận sơn lại nhà, chống thấm sân thượng – nhà vệ sinh. Hợp đồng rõ ràng, che chắn sạch sẽ.",
        badges: ["Chống thấm triệt để"], responseMins: 40,
        priceList: [
          { label: "Sơn phòng (16m²)", price: 1200000 },
          { label: "Chống thấm sân thượng", price: 1500000 },
        ],
      },
      {
        id: "w-duy", userId: "u-duy", name: "Đỗ Trọng Duy", categoryId: "noithat", district: "Quận 3", yearsExp: 6,
        rating: 4.8, ratingCount: 87, jobsDone: 150, priceFrom: 200000, approval: "approved", available: true, verified: true,
        bio: "Thợ mộc chính chủ: sửa chữa, lắp ráp nội thất, đóng mới tủ kệ theo yêu cầu.",
        badges: ["Mộc chính chủ"], responseMins: 30,
        priceList: [
          { label: "Lắp ráp nội thất (món)", price: 200000 },
          { label: "Sửa bản lề, ray trượt", price: 250000 },
        ],
      },
      {
        id: "w-sach", userId: "u-sach", name: "Đội vệ sinh Sạch+", categoryId: "vesinh", district: "Quận 10", yearsExp: 4,
        rating: 4.7, ratingCount: 132, jobsDone: 300, priceFrom: 350000, approval: "approved", available: true, verified: true,
        bio: "Đội 3 người, đầy đủ máy hút bụi công nghiệp, máy chà sàn. Nhận vệ sinh sau xây dựng.",
        badges: ["Đủ máy móc", "Đội 3 người"], responseMins: 35,
        priceList: [
          { label: "Vệ sinh căn hộ 2PN", price: 550000 },
          { label: "Vệ sinh sau xây dựng (m²)", price: 15000 },
        ],
      },
      {
        id: "w-minh", userId: "u-minh", name: "Hoàng Nhật Minh", categoryId: "dien", district: "Quận 7", yearsExp: 3,
        rating: 4.5, ratingCount: 22, jobsDone: 40, priceFrom: 140000, approval: "approved", available: true, verified: false,
        bio: "Thợ điện trẻ, nhiệt tình, chuyên lắp đặt thiết bị chiếu sáng và sửa chữa dân dụng nhỏ.",
        badges: [], responseMins: 20,
        priceList: [{ label: "Sửa điện dân dụng", price: 140000 }],
      },
      {
        id: "w-tam", userId: "u-tam", name: "Nguyễn Thị Tâm", categoryId: "giupviec", district: "Quận 3", yearsExp: 2,
        rating: 4.6, ratingCount: 15, jobsDone: 35, priceFrom: 55000, approval: "approved", available: true, verified: false,
        bio: "Nhận dọn nhà theo giờ khu vực Quận 3 – Quận 1, có thể nấu ăn cơ bản.",
        badges: [], responseMins: 45,
        priceList: [{ label: "Dọn theo giờ", price: 55000 }],
      },
      {
        id: "w-nam", userId: "u-nam", name: "Trần Quốc Nam", categoryId: "dieuhoa", district: "Quận 1", yearsExp: 5,
        rating: 4.4, ratingCount: 38, jobsDone: 90, priceFrom: 280000, approval: "approved", available: false, verified: true,
        bio: "Nhận sửa chữa điện lạnh các loại, khu vực trung tâm Quận 1.",
        badges: [], responseMins: 30,
        priceList: [{ label: "Vệ sinh máy lạnh", price: 280000 }],
      },
      {
        id: "w-duc", userId: "u-duc", name: "Lê Anh Đức", categoryId: "nuoc", district: "Bình Thạnh", yearsExp: 4,
        rating: 0, ratingCount: 0, jobsDone: 0, priceFrom: 160000, approval: "pending", available: true, verified: false,
        bio: "Thợ nước 4 năm, nhận sửa chữa thay thế thiết bị vệ sinh, đường ống nước gia đình.",
        badges: [], responseMins: 25,
        priceList: [{ label: "Sửa ống nước", price: 160000 }],
      },
      {
        id: "w-hiep", userId: "u-hiep", name: "Đinh Văn Hiệp", categoryId: "son", district: "Quận 10", yearsExp: 1,
        rating: 0, ratingCount: 0, jobsDone: 0, priceFrom: 250000, approval: "rejected", rejectReason: "Chưa bổ sung chứng chỉ hành nghề và ảnh CCCD.",
        available: false, verified: false, bio: "Nhận sơn nước công trình nhỏ.",
        badges: [], responseMins: 60,
        priceList: [{ label: "Sơn tường", price: 250000 }],
      },
    ],
    jobs: [
      {
        id: "j-1001", code: "HS-1001", customerId: "u-khach", title: "Ổ cắm phòng khách bị chập, nhảy aptomat liên tục",
        categoryId: "dien", description: "Ổ cắm góc phòng khách cắm quạt là nhảy aptomat, có mùi khét nhẹ. Cần thợ kiểm tra sớm trong hôm nay, nhà có người già nên ưu tiên an toàn.",
        district: "Bình Thạnh", address: "220/15 Xô Viết Nghệ Tĩnh, P.21", budget: 400000, urgency: "urgent",
        status: "open", createdAt: h(3),
      },
      {
        id: "j-1002", code: "HS-1002", customerId: "u-lan", title: "Vòi lavabo rỉ nước, cần thay gioăng",
        categoryId: "nuoc", description: "Vòi rửa mặt rỉ nước cả ngày, khóa không hết. Muốn thay gioăng hoặc thay vòi mới nếu cần.",
        district: "Quận 7", address: "Chung cư Sunrise City, Block V2", budget: 250000, urgency: "normal",
        status: "open", createdAt: h(1),
      },
      {
        id: "j-1003", code: "HS-1003", customerId: "u-khach", workerId: "w-khang", title: "Lắp máy lạnh 1.5HP phòng ngủ",
        categoryId: "dieuhoa", description: "Máy mới mua chưa lắp, cần thợ lắp trọn gói ống đồng + giá đỡ, đục tường đi ống âm.",
        district: "Bình Thạnh", address: "220/15 Xô Viết Nghệ Tĩnh, P.21", budget: 600000, urgency: "normal",
        status: "assigned", createdAt: d(1), scheduledAt: "Ngày mai, 9:00 sáng",
      },
      {
        id: "j-1004", code: "HS-1004", customerId: "u-hai", workerId: "w-son", title: "Sơn lại phòng ngủ 16m², chống ẩm mốc",
        categoryId: "son", description: "Phòng ngủ bị ẩm mốc mảng tường hướng Tây, cần cạo sơn cũ, xử lý chống thấm rồi sơn lại 2 lớp.",
        district: "Thủ Đức", address: "12 Đường số 9, P. Hiệp Bình Chánh", budget: 3000000, urgency: "normal",
        status: "in_progress", createdAt: d(2), scheduledAt: "Hôm nay, 8:00 sáng", startedAt: h(5),
      },
      {
        id: "j-1005", code: "HS-1005", customerId: "u-khach", workerId: "w-sach", title: "Dọn vệ sinh căn hộ 70m² sau sửa chữa",
        categoryId: "vesinh", description: "Căn hộ vừa sửa xong nhiều bụi sơn, cần đội vệ sinh tổng: sàn, kính, nhà vệ sinh, bếp.",
        district: "Bình Thạnh", address: "Chung cư The Manor, 91 Nguyễn Hữu Cảnh", budget: 800000, urgency: "normal",
        status: "done", createdAt: d(3), scheduledAt: "Hôm qua, 14:00", doneAt: d(1),
      },
      {
        id: "j-1006", code: "HS-1006", customerId: "u-ngoc", workerId: "w-long", title: "Kẹt khóa cửa chính lúc 11h đêm",
        categoryId: "khoa", description: "Khóa cửa chính bị kẹt không mở được, cả nhà đang đứng ngoài. Gấp!",
        district: "Quận 1", address: "45 Mạc Đĩnh Chi, P. Đa Kao", budget: 200000, urgency: "urgent",
        status: "reviewed", createdAt: d(2), doneAt: d(2),
      },
      {
        id: "j-1007", code: "HS-1007", customerId: "u-lan", workerId: "w-duy", title: "Thay bản lề + chỉnh cánh tủ bếp",
        categoryId: "noithat", description: "Tủ bếp xệ cánh, 3 bản lề rỉ cần thay, chỉnh lại ray ngăn kéo.",
        district: "Quận 7", address: "Khu Him Lam, P. Tân Hưng", budget: 350000, urgency: "normal",
        status: "reviewed", createdAt: d(7), doneAt: d(6),
      },
      {
        id: "j-1008", code: "HS-1008", customerId: "u-hai", title: "Thông bồn cầu nghẹt",
        categoryId: "nuoc", description: "Bồn cầu xả nước rút chậm, nghi nghẹt giấy.",
        district: "Quận 3", address: "88 Lý Chính Thắng", budget: 300000, urgency: "normal",
        status: "cancelled", createdAt: d(5), cancelReason: "Khách tự xử lý được",
      },
    ],
    quotes: [
      { id: "q-101", jobId: "j-1001", workerId: "w-tuan", price: 350000, eta: "Có mặt trong 30 phút", message: "Khả năng cao chập ổ cắm hoặc hở mối nối. Em sẽ đo tải, thay ổ nếu cần. Bảo hành 30 ngày.", status: "sent", createdAt: h(2.5) },
      { id: "q-102", jobId: "j-1001", workerId: "w-minh", price: 300000, eta: "Có mặt trong 1 giờ", message: "Em ở Quận 7, qua Bình Thạnh khoảng 40 phút. Giá đã gồm công kiểm tra toàn bộ tủ điện.", status: "sent", createdAt: h(2) },
      { id: "q-103", jobId: "j-1002", workerId: "w-hung", price: 220000, eta: "Có mặt trong 45 phút", message: "Em mang sẵn 3 loại gioăng + vòi dự phòng, anh/chị chọn tại chỗ.", status: "sent", createdAt: h(0.5) },
      { id: "q-104", jobId: "j-1003", workerId: "w-khang", price: 550000, eta: "Có mặt lúc 9:00 sáng mai", message: "Trọn gói ống đồng 3m, giá đỡ, đục âm tường. Máy 1.5HP em lắp khoảng 90 phút.", status: "accepted", createdAt: h(20) },
    ],
    reviews: [
      { id: "r-01", jobId: "HS-0912", customerId: "u-lan", workerId: "w-tuan", rating: 5, comment: "Anh Tuấn đến đúng hẹn, làm kỹ, có phiếu bảo hành. Nhà mình toàn gọi anh.", createdAt: d(12) },
      { id: "r-02", jobId: "HS-0876", customerId: "u-hai", workerId: "w-tuan", rating: 4, comment: "Tay nghề tốt, giá hợp lý. Hơi bận nên đến trễ 15 phút.", createdAt: d(20) },
      { id: "r-03", jobId: "HS-0954", customerId: "u-ngoc", workerId: "w-hoa", rating: 5, comment: "Chị Hoa dọn cực kỳ sạch và đúng giờ, tự mang đủ dụng cụ.", createdAt: d(9) },
      { id: "r-04", jobId: "HS-0930", customerId: "u-lan", workerId: "w-khang", rating: 4, comment: "Lắp máy lạnh nhanh, gọn, che chắn cẩn thận.", createdAt: d(15) },
      { id: "r-05", jobId: "HS-0988", customerId: "u-hai", workerId: "w-long", rating: 5, comment: "11h đêm gọi mà 15 phút sau có mặt, mở khóa không hề trầy cửa.", createdAt: d(5) },
      { id: "r-06", jobId: "HS-0990", customerId: "u-ngoc", workerId: "w-duy", rating: 5, comment: "Chỉnh tủ bếp hết xệ, còn siết lại ốc cả bàn ăn miễn phí.", createdAt: d(4) },
      { id: "r-07", jobId: "HS-0995", customerId: "u-lan", workerId: "w-nam", rating: 2, comment: "Thợ tới trễ gần 1 tiếng, báo giá cao hơn trong app. Nên cân nhắc.", createdAt: d(2), flagged: true },
    ],
    chats: [
      { id: "m-01", jobId: "j-1003", senderId: "u-khach", text: "Anh Khang ơi, mai 9h anh qua được không ạ?", createdAt: h(19) },
      { id: "m-02", jobId: "j-1003", senderId: "w-khang", text: "Được em nhé, anh sẽ mang đủ ống đồng và giá đỡ. Nhà em ở tầng mấy?", createdAt: h(18.5) },
      { id: "m-03", jobId: "j-1003", senderId: "u-khach", text: "Dạ tầng 3, có thang máy. Anh đi cổng Nguyễn Hữu Cảnh nhé.", createdAt: h(18) },
    ],
    notifications: [
      { id: "n-01", userId: "u-khach", text: "Nguyễn Văn Tuấn vừa gửi báo giá 350.000₫ cho việc HS-1001", icon: "wallet", read: false, createdAt: h(2.5) },
      { id: "n-02", userId: "u-khach", text: "Hoàng Nhật Minh vừa gửi báo giá 300.000₫ cho việc HS-1001", icon: "wallet", read: false, createdAt: h(2) },
      { id: "n-03", userId: "u-khach", text: "Việc HS-1005 đã hoàn thành — đừng quên đánh giá đội Sạch+ nhé!", icon: "star", read: false, createdAt: d(1) },
      { id: "n-04", userId: "u-tho", text: "Có việc mới phù hợp: Ổ cắm phòng khách bị chập (HS-1001) tại Bình Thạnh", icon: "bell", read: false, createdAt: h(3) },
      { id: "n-05", userId: "u-tho", text: "Chị Lan vừa đánh giá 5★ cho bạn", icon: "star", read: true, createdAt: d(12) },
      { id: "n-06", userId: "u-admin", text: "1 hồ sơ thợ mới đang chờ duyệt", icon: "shield", read: false, createdAt: h(6) },
    ],
  };
}
