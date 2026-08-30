/**
 * Seed dữ liệu demo — ID cố định, khớp với dữ liệu mẫu của frontend
 * để Giai đoạn 3 có thể trỏ frontend sang API mà không đổi logic hiển thị.
 *
 * Chạy: npm run seed
 */
import { PrismaClient, Role, JobStatus, QuoteStatus, Approval, Urgency } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const now = Date.now();
const h = (n: number) => new Date(now - n * 3600_000);
const d = (n: number) => new Date(now - n * 86400_000);

async function main() {
  console.log("🌱 Bắt đầu seed...");
  const pass = await bcrypt.hash("123456", 12);

  // ---------- Danh mục ----------
  const categories = [
    { id: "dien", name: "Sửa điện dân dụng", icon: "bolt", color: "#f4581c", priceMin: 150000, priceMax: 500000, unit: "lần" },
    { id: "nuoc", name: "Sửa ống nước", icon: "droplet", color: "#2f6fd0", priceMin: 150000, priceMax: 450000, unit: "lần" },
    { id: "dieuhoa", name: "Điều hòa – điện lạnh", icon: "snow", color: "#38a3c0", priceMin: 250000, priceMax: 800000, unit: "máy" },
    { id: "giupviec", name: "Giúp việc nhà", icon: "broom", color: "#159a6c", priceMin: 60000, priceMax: 90000, unit: "giờ" },
    { id: "khoa", name: "Mở khóa – thay khóa", icon: "key", color: "#dd9a2b", priceMin: 100000, priceMax: 300000, unit: "lần" },
    { id: "son", name: "Sơn sửa – chống thấm", icon: "paint", color: "#c4504f", priceMin: 300000, priceMax: 1500000, unit: "hạng mục" },
    { id: "noithat", name: "Đồ gỗ – nội thất", icon: "hammer", color: "#7a5c3e", priceMin: 200000, priceMax: 700000, unit: "hạng mục" },
    { id: "vesinh", name: "Vệ sinh công nghiệp", icon: "sparkle", color: "#4e9b8f", priceMin: 300000, priceMax: 900000, unit: "căn" },
  ];
  for (const c of categories) await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });

  // ---------- Người dùng ----------
  const users = [
    { id: "u-khach", role: Role.CUSTOMER, name: "Minh Anh", email: "khach@demo.vn", phone: "0901 234 567", avatarColor: "#f4581c" },
    { id: "u-tho", role: Role.WORKER, name: "Nguyễn Văn Tuấn", email: "tho@demo.vn", phone: "0912 888 999", avatarColor: "#2e527c" },
    { id: "u-admin", role: Role.ADMIN, name: "Quốc Bảo", email: "admin@demo.vn", phone: "0900 000 001", avatarColor: "#0b1b2e" },
    { id: "u-lan", role: Role.CUSTOMER, name: "Chị Lan", email: "lan@demo.vn", phone: "0903 111 222", avatarColor: "#159a6c" },
    { id: "u-hai", role: Role.CUSTOMER, name: "Anh Hải", email: "hai@demo.vn", phone: "0904 333 444", avatarColor: "#dd9a2b" },
    { id: "u-ngoc", role: Role.CUSTOMER, name: "Thu Ngọc", email: "ngoc@demo.vn", phone: "0905 555 666", avatarColor: "#38a3c0" },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: { ...u, passwordHash: pass, createdAt: d(90) },
    });
  }

  // ---------- Hồ sơ thợ ----------
  const workers = [
    { id: "w-tuan", userId: "u-tho", categoryId: "dien", district: "Bình Thạnh", yearsExp: 8, rating: 4.9, ratingCount: 124, jobsDone: 260, priceFrom: 150000, approval: Approval.APPROVED, available: true, verified: true, responseMins: 15, badges: ["Bảo hành 30 ngày", "Chính chủ", "Phản hồi nhanh"], bio: "Thợ điện 8 năm kinh nghiệm, chuyên xử lý chập cháy, đi lại đường dây, lắp đặt thiết bị." },
    { id: "w-hung", userId: "u-hung", categoryId: "nuoc", district: "Quận 7", yearsExp: 6, rating: 4.8, ratingCount: 98, jobsDone: 190, priceFrom: 180000, approval: Approval.APPROVED, available: true, verified: true, responseMins: 20, badges: ["Bảo hành 14 ngày"], bio: "Chuyên sửa chữa – thay thế đường ống nước, thiết bị vệ sinh." },
    { id: "w-hoa", userId: "u-hoa", categoryId: "giupviec", district: "Phú Nhuận", yearsExp: 5, rating: 4.9, ratingCount: 210, jobsDone: 480, priceFrom: 60000, approval: Approval.APPROVED, available: true, verified: true, responseMins: 30, badges: ["Đúng giờ"], bio: "Giúp việc theo giờ, dọn dẹp nhà cửa – căn hộ, nấu ăn gia đình." },
    { id: "w-khang", userId: "u-khang", categoryId: "dieuhoa", district: "Tân Bình", yearsExp: 7, rating: 4.8, ratingCount: 143, jobsDone: 230, priceFrom: 250000, approval: Approval.APPROVED, available: true, verified: true, responseMins: 25, badges: ["Bảo hành 6 tháng"], bio: "Lắp đặt, bảo trì, sửa chữa máy lạnh – tủ lạnh – máy giặt." },
    { id: "w-duc", userId: "u-duc", categoryId: "nuoc", district: "Bình Thạnh", yearsExp: 4, priceFrom: 160000, approval: Approval.PENDING, available: true, verified: false, bio: "Thợ nước 4 năm, nhận sửa chữa thay thế thiết bị vệ sinh." },
  ];
  // Tạo user tương ứng cho thợ phụ (chưa có trong danh sách chính)
  const extraUsers = [
    { id: "u-hung", name: "Trần Mạnh Hùng", email: "hung@demo.vn", avatarColor: "#2f6fd0" },
    { id: "u-hoa", name: "Lê Thị Hoa", email: "hoa@demo.vn", avatarColor: "#159a6c" },
    { id: "u-khang", name: "Vũ Hoàng Khang", email: "khang@demo.vn", avatarColor: "#38a3c0" },
    { id: "u-duc", name: "Lê Anh Đức", email: "duc@demo.vn", avatarColor: "#dd9a2b" },
  ];
  for (const u of extraUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: { id: u.id, role: Role.WORKER, name: u.name, email: u.email, phone: "0900 000 000", passwordHash: pass, avatarColor: u.avatarColor, createdAt: d(200) },
    });
  }
  for (const w of workers) {
    await prisma.workerProfile.upsert({ where: { id: w.id }, update: w, create: { ...w, createdAt: d(200) } });
  }

  // ---------- Bảng giá ----------
  const priceLists: { workerId: string; items: [string, number][] }[] = [
    { workerId: "w-tuan", items: [["Thay ổ cắm / công tắc", 150000], ["Lắp đèn, quạt trần", 200000], ["Sửa chập điện, nhảy aptomat", 350000]] },
    { workerId: "w-hung", items: [["Thay vòi / gioăng", 180000], ["Thông tắc lavabo, bồn cầu", 300000]] },
    { workerId: "w-hoa", items: [["Dọn theo giờ", 60000], ["Tổng vệ sinh căn hộ 2PN", 450000]] },
    { workerId: "w-khang", items: [["Vệ sinh máy lạnh", 250000], ["Lắp máy lạnh trọn gói", 550000]] },
  ];
  for (const pl of priceLists) {
    await prisma.priceListItem.deleteMany({ where: { workerId: pl.workerId } });
    let order = 0;
    for (const [label, price] of pl.items) {
      await prisma.priceListItem.create({ data: { workerId: pl.workerId, label, price, order: order++ } });
    }
  }

  // ---------- Việc + báo giá ----------
  const jobs = [
    { id: "j-1001", code: "HS-1001", customerId: "u-khach", workerId: null, categoryId: "dien", title: "Ổ cắm phòng khách bị chập, nhảy aptomat liên tục", description: "Ổ cắm góc phòng khách cắm quạt là nhảy aptomat, có mùi khét nhẹ.", district: "Bình Thạnh", address: "220/15 Xô Viết Nghệ Tĩnh, P.21", budget: 400000, urgency: Urgency.URGENT, status: JobStatus.OPEN, createdAt: h(3) },
    { id: "j-1002", code: "HS-1002", customerId: "u-lan", workerId: null, categoryId: "nuoc", title: "Vòi lavabo rỉ nước, cần thay gioăng", description: "Vòi rửa mặt rỉ nước cả ngày, khóa không hết.", district: "Quận 7", address: "Chung cư Sunrise City, Block V2", budget: 250000, urgency: Urgency.NORMAL, status: JobStatus.OPEN, createdAt: h(1) },
    { id: "j-1003", code: "HS-1003", customerId: "u-khach", workerId: "w-khang", categoryId: "dieuhoa", title: "Lắp máy lạnh 1.5HP phòng ngủ", description: "Máy mới mua chưa lắp, cần thợ lắp trọn gói ống đồng + giá đỡ.", district: "Bình Thạnh", address: "220/15 Xô Viết Nghệ Tĩnh, P.21", budget: 600000, urgency: Urgency.NORMAL, status: JobStatus.ASSIGNED, createdAt: d(1), scheduledAt: "Ngày mai, 9:00 sáng" },
  ];
  for (const j of jobs) await prisma.job.upsert({ where: { id: j.id }, update: j, create: j });

  const quotes = [
    { id: "q-101", jobId: "j-1001", workerId: "w-tuan", price: 350000, eta: "Có mặt trong 30 phút", message: "Khả năng cao chập ổ cắm. Em sẽ đo tải, thay ổ nếu cần. Bảo hành 30 ngày.", status: QuoteStatus.SENT, createdAt: h(2.5) },
    { id: "q-104", jobId: "j-1003", workerId: "w-khang", price: 550000, eta: "Có mặt lúc 9:00 sáng mai", message: "Trọn gói ống đồng 3m, giá đỡ, đục âm tường.", status: QuoteStatus.ACCEPTED, createdAt: h(20) },
  ];
  for (const q of quotes) await prisma.quote.upsert({ where: { id: q.id }, update: q, create: q });

  // ---------- Chat mẫu ----------
  await prisma.chatMessage.deleteMany({ where: { jobId: "j-1003" } });
  const msgs = [
    { jobId: "j-1003", senderId: "u-khach", text: "Anh Khang ơi, mai 9h anh qua được không ạ?", createdAt: h(19) },
    { jobId: "j-1003", senderId: "u-khang", text: "Được em nhé, anh sẽ mang đủ ống đồng và giá đỡ.", createdAt: h(18.5) },
  ];
  for (const m of msgs) await prisma.chatMessage.create({ data: m });

  // ---------- Thông báo mẫu ----------
  await prisma.notification.deleteMany({ where: { userId: "u-khach" } });
  await prisma.notification.create({ data: { userId: "u-khach", text: "Nguyễn Văn Tuấn vừa gửi báo giá 350.000₫ cho việc HS-1001", icon: "wallet", createdAt: h(2.5) } });
  await prisma.notification.create({ data: { userId: "u-admin", text: "1 hồ sơ thợ mới đang chờ duyệt", icon: "shield", createdAt: h(6) } });

  await prisma.setting.upsert({ where: { key: "platform_fee" }, update: { value: "10" }, create: { key: "platform_fee", value: "10" } });

  // ---------- Yêu cầu đổi danh mục mẫu (chờ admin duyệt) ----------
  await prisma.categoryChangeRequest.upsert({
    where: { id: "ccr-01" },
    update: {},
    create: {
      id: "ccr-01", workerId: "w-duc", fromCategoryId: "nuoc", toCategoryId: "dien",
      note: "Em muốn mở rộng nhận thêm việc điện dân dụng, đã có chứng chỉ an toàn điện.",
      createdAt: h(5),
    },
  });

  console.log("✅ Seed hoàn tất: 8 danh mục · 10 người dùng · 5 thợ · 3 việc · 2 báo giá · 1 yêu cầu đổi danh mục");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
