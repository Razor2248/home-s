import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cls } from "../lib/format";
import { Icon, Logo, type IconName } from "../components/Icons";

/* ================= DỮ LIỆU TÀI LIỆU ================= */

type Col = { n: string; t: string; k?: "PK" | "FK" | "UK" | "IDX" };
type Table = { name: string; desc: string; cols: Col[] };

const TABLES: Table[] = [
  {
    name: "User", desc: "1 bảng cho cả 3 vai trò — phân quyền qua trường role",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "role", t: "CUSTOMER | WORKER | ADMIN", k: "IDX" },
      { n: "name", t: "text" }, { n: "email", t: "text", k: "UK" }, { n: "phone", t: "text" },
      { n: "passwordHash", t: "bcrypt(12)" }, { n: "avatarColor", t: "hex" }, { n: "blocked", t: "bool" }, { n: "createdAt", t: "datetime" },
    ],
  },
  {
    name: "Category", desc: "Danh mục dịch vụ — id là slug cố định",
    cols: [
      { n: "id", t: "slug: 'dien', 'nuoc'…", k: "PK" }, { n: "name", t: "text" }, { n: "icon", t: "text" },
      { n: "color", t: "hex" }, { n: "priceMin / priceMax", t: "int" }, { n: "unit", t: "'lần' | 'giờ'…" },
    ],
  },
  {
    name: "WorkerProfile", desc: "Hồ sơ thợ — quan hệ 1-1 với User",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "userId", t: "→ User", k: "UK" }, { n: "categoryId", t: "→ Category", k: "FK" },
      { n: "district", t: "text", k: "IDX" }, { n: "yearsExp", t: "int" }, { n: "rating", t: "float" },
      { n: "ratingCount / jobsDone", t: "int" }, { n: "priceFrom", t: "int" },
      { n: "approval", t: "PENDING | APPROVED | REJECTED", k: "IDX" }, { n: "rejectReason", t: "text?" },
      { n: "available / verified", t: "bool" }, { n: "bio", t: "text" }, { n: "responseMins", t: "int" }, { n: "badges", t: "text[]" },
    ],
  },
  {
    name: "PriceListItem", desc: "Bảng giá theo hạng mục của thợ",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "workerId", t: "→ WorkerProfile", k: "FK" },
      { n: "label", t: "text" }, { n: "price", t: "int" }, { n: "order", t: "int" },
    ],
  },
  {
    name: "Job", desc: "Công việc — trung tâm của nền tảng",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "code", t: "'HS-1001'", k: "UK" },
      { n: "customerId", t: "→ User", k: "FK" }, { n: "workerId", t: "→ WorkerProfile (null khi mở)", k: "FK" },
      { n: "categoryId", t: "→ Category", k: "FK" }, { n: "title / description", t: "text" },
      { n: "district / address", t: "text" }, { n: "budget", t: "int" },
      { n: "urgency", t: "NORMAL | URGENT" },
      { n: "status", t: "OPEN → ASSIGNED → IN_PROGRESS → DONE → REVIEWED | CANCELLED", k: "IDX" },
      { n: "scheduledAt / cancelReason", t: "text?" }, { n: "createdAt / startedAt / doneAt", t: "datetime" },
    ],
  },
  {
    name: "Quote", desc: "Báo giá — mỗi thợ 1 báo giá cho mỗi việc",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "jobId", t: "→ Job", k: "FK" }, { n: "workerId", t: "→ WorkerProfile", k: "FK" },
      { n: "(jobId, workerId)", t: "ràng buộc duy nhất", k: "UK" }, { n: "price", t: "int" }, { n: "eta", t: "text" },
      { n: "message", t: "text" }, { n: "status", t: "SENT | ACCEPTED | DECLINED" },
    ],
  },
  {
    name: "Review", desc: "Đánh giá — 1 việc tối đa 1 đánh giá",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "jobId", t: "→ Job (duy nhất)", k: "UK" },
      { n: "customerId", t: "→ User", k: "FK" }, { n: "workerId", t: "→ WorkerProfile", k: "FK" },
      { n: "rating", t: "1–5" }, { n: "comment", t: "text" }, { n: "flagged / hidden", t: "bool (kiểm duyệt)" },
    ],
  },
  {
    name: "ChatMessage", desc: "Tin nhắn theo từng việc",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "jobId", t: "→ Job", k: "FK" }, { n: "senderId", t: "→ User", k: "FK" },
      { n: "text", t: "text" }, { n: "createdAt", t: "datetime", k: "IDX" },
    ],
  },
  {
    name: "Notification", desc: "Thông báo trong app",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "userId", t: "→ User", k: "FK" }, { n: "text / icon", t: "text" },
      { n: "read", t: "bool", k: "IDX" },
    ],
  },
  {
    name: "Favorite", desc: "Khách lưu thợ yêu thích — quan hệ n-n",
    cols: [
      { n: "customerId", t: "→ User", k: "PK" }, { n: "workerId", t: "→ WorkerProfile", k: "PK" }, { n: "createdAt", t: "datetime" },
    ],
  },
  {
    name: "RefreshToken", desc: "Refresh token lưu DB — có thể thu hồi phiên",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "token", t: "hex(48)", k: "UK" }, { n: "userId", t: "→ User", k: "FK" },
      { n: "expiresAt", t: "datetime" },
    ],
  },
  {
    name: "Report", desc: "Báo cáo vi phạm (đánh giá / thợ)",
    cols: [
      { n: "id", t: "cuid", k: "PK" }, { n: "reporterId", t: "→ User", k: "FK" },
      { n: "targetType / targetId", t: "'review' | 'worker'" }, { n: "reason", t: "text" },
      { n: "status", t: "OPEN | RESOLVED", k: "IDX" },
    ],
  },
  {
    name: "Setting", desc: "Cấu hình nền tảng (phí %, hotline…)",
    cols: [{ n: "key", t: "'platform_fee'…", k: "PK" }, { n: "value", t: "text" }],
  },
];

const RELATIONS = [
  { a: "User", rel: "1 – 1", b: "WorkerProfile", note: "mỗi tài khoản thợ có đúng 1 hồ sơ" },
  { a: "User", rel: "1 – n", b: "Job", note: "khách đăng nhiều việc" },
  { a: "WorkerProfile", rel: "1 – n", b: "Job", note: "thợ nhận nhiều việc" },
  { a: "Category", rel: "1 – n", b: "WorkerProfile · Job", note: "gom nhóm theo nghề" },
  { a: "Job", rel: "1 – n", b: "Quote · ChatMessage", note: "nhiều báo giá, nhiều tin nhắn" },
  { a: "Job", rel: "1 – 1", b: "Review", note: "đánh giá duy nhất sau nghiệm thu" },
  { a: "User", rel: "n – n", b: "WorkerProfile", note: "qua bảng trung gian Favorite" },
  { a: "User", rel: "1 – n", b: "Notification · RefreshToken · Report", note: "dữ liệu phụ trợ" },
];

type Endpoint = { m: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; p: string; role: string; d: string };
type ApiGroup = { name: string; icon: IconName; items: Endpoint[] };

const API_GROUPS: ApiGroup[] = [
  {
    name: "Xác thực", icon: "lock",
    items: [
      { m: "POST", p: "/auth/login", role: "Public", d: "Đăng nhập → access token (15p) + refresh token (7 ngày)" },
      { m: "POST", p: "/auth/register/customer", role: "Public", d: "Khách đăng ký tài khoản" },
      { m: "POST", p: "/auth/register/worker", role: "Public", d: "Thợ đăng ký — tự sinh hồ sơ PENDING chờ duyệt" },
      { m: "POST", p: "/auth/refresh", role: "Public", d: "Đổi access token mới bằng refresh token" },
      { m: "GET", p: "/auth/me", role: "Mọi vai trò", d: "Thông tin phiên hiện tại + hồ sơ thợ (nếu có)" },
    ],
  },
  {
    name: "Danh mục", icon: "tag",
    items: [
      { m: "GET", p: "/categories", role: "Public", d: "Danh sách 8 danh mục + khoảng giá tham khảo" },
      { m: "POST", p: "/admin/categories", role: "Admin", d: "Thêm danh mục (tự sinh slug tiếng Việt)" },
      { m: "PUT", p: "/admin/categories/:id", role: "Admin", d: "Sửa tên, khoảng giá, màu" },
      { m: "DELETE", p: "/admin/categories/:id", role: "Admin", d: "Xóa — chặn nếu còn thợ/việc tham chiếu" },
    ],
  },
  {
    name: "Thợ & tìm kiếm", icon: "wrench",
    items: [
      { m: "GET", p: "/workers?category&district&sort&q", role: "Public", d: "Tìm thợ + trả kèm matchScore khi có ngữ cảnh" },
      { m: "GET", p: "/workers/:id", role: "Public", d: "Hồ sơ thợ: bảng giá + 10 đánh giá mới nhất" },
      { m: "GET", p: "/workers/me/profile", role: "Thợ", d: "Hồ sơ của chính mình" },
      { m: "PATCH", p: "/workers/me", role: "Thợ", d: "Sửa giới thiệu, giá khởi điểm, đồng bộ bảng giá" },
      { m: "PATCH", p: "/workers/me/available", role: "Thợ", d: "Bật / tắt nhận việc" },
      { m: "PUT", p: "/workers/:id/favorite", role: "Khách", d: "Lưu thợ yêu thích" },
      { m: "DELETE", p: "/workers/:id/favorite", role: "Khách", d: "Bỏ yêu thích" },
      { m: "GET", p: "/workers/favorites/list", role: "Khách", d: "Danh sách thợ đã lưu" },
    ],
  },
  {
    name: "Công việc", icon: "briefcase",
    items: [
      { m: "POST", p: "/jobs", role: "Khách", d: "Đăng việc → thông báo toàn bộ thợ đúng nghề đang bật" },
      { m: "GET", p: "/jobs/my", role: "Khách", d: "Việc của tôi kèm báo giá, thợ, đánh giá" },
      { m: "GET", p: "/jobs/feed", role: "Thợ", d: "Sàn việc OPEN đúng danh mục (?all=1 để xem hết)" },
      { m: "GET", p: "/jobs/mine", role: "Thợ", d: "Việc thợ đã nhận" },
      { m: "GET", p: "/jobs/:id", role: "Người liên quan", d: "Chi tiết — kiểm tra ownership: khách / thợ được gán / admin" },
      { m: "POST", p: "/jobs/book", role: "Khách", d: "Đặt lịch trực tiếp (tạo job ASSIGNED + quote ACCEPTED)" },
      { m: "POST", p: "/jobs/:id/start", role: "Thợ", d: "ASSIGNED → IN_PROGRESS, báo khách" },
      { m: "POST", p: "/jobs/:id/complete", role: "Thợ", d: "IN_PROGRESS → DONE, nhắc khách nghiệm thu" },
      { m: "POST", p: "/jobs/:id/cancel", role: "Khách", d: "Hủy khi OPEN/ASSIGNED kèm lý do" },
    ],
  },
  {
    name: "Báo giá", icon: "wallet",
    items: [
      { m: "POST", p: "/jobs/:id/quotes", role: "Thợ", d: "Gửi báo giá — chặn trùng, chặn trái danh mục, chặn việc đã chốt" },
      { m: "GET", p: "/jobs/:id/quotes", role: "Khách sở hữu", d: "So sánh báo giá (sắp xếp theo giá)" },
      { m: "POST", p: "/quotes/:id/accept", role: "Khách", d: "Chốt: transaction nhận 1 / từ chối còn lại / gán thợ / thông báo 2 bên" },
    ],
  },
  {
    name: "Đánh giá", icon: "star",
    items: [
      { m: "POST", p: "/jobs/:id/review", role: "Khách", d: "Chấm 1–5★ — cập nhật rating thợ + jobsDone trong transaction" },
      { m: "GET", p: "/workers/:id/reviews", role: "Public", d: "Đánh giá công khai (ẩn đánh giá bị kiểm duyệt)" },
    ],
  },
  {
    name: "Chat & thông báo", icon: "chat",
    items: [
      { m: "GET", p: "/jobs/:id/messages", role: "Người liên quan", d: "Lịch sử tin nhắn của việc" },
      { m: "POST", p: "/jobs/:id/messages", role: "Người liên quan", d: "Gửi tin (fallback khi không dùng socket)" },
      { m: "GET", p: "/chat (Socket.io)", role: "Người liên quan", d: "Namespace /chat — join room job:{id}, event message:send / message:new" },
      { m: "GET", p: "/notifications", role: "Mọi vai trò", d: "Thông báo của tôi (?limit=)" },
      { m: "POST", p: "/notifications/read-all", role: "Mọi vai trò", d: "Đánh dấu đã đọc tất cả" },
    ],
  },
  {
    name: "Quản trị", icon: "shield",
    items: [
      { m: "GET", p: "/admin/stats", role: "Admin", d: "KPI + doanh thu + chuỗi việc 14 ngày" },
      { m: "GET", p: "/admin/workers?approval=", role: "Admin", d: "Danh sách hồ sơ thợ theo trạng thái duyệt" },
      { m: "POST", p: "/admin/workers/:id/approve", role: "Admin", d: "Duyệt + thông báo thợ" },
      { m: "POST", p: "/admin/workers/:id/reject", role: "Admin", d: "Từ chối kèm lý do bắt buộc" },
      { m: "GET", p: "/admin/users?role&q", role: "Admin", d: "Tìm kiếm người dùng" },
      { m: "PATCH", p: "/admin/users/:id/block", role: "Admin", d: "Khóa / mở khóa (chặn đăng nhập)" },
      { m: "GET", p: "/admin/reviews?flagged=true", role: "Admin", d: "Đánh giá bị báo cáo" },
      { m: "POST", p: "/admin/reviews/:id/resolve", role: "Admin", d: "Giữ hoặc ẩn đánh giá vi phạm" },
    ],
  },
];

const FLOWS = [
  {
    name: "Đăng việc → chốt thợ", icon: "briefcase" as IconName, tone: "#f4581c",
    steps: ["Khách đăng việc (POST /jobs)", "Server thông báo thợ đúng nghề", "Thợ gửi báo giá (POST /jobs/:id/quotes)", "Khách so sánh & chốt (POST /quotes/:id/accept)", "Job → ASSIGNED, hai bên mở chat"],
  },
  {
    name: "Duyệt thợ", icon: "shield" as IconName, tone: "#12936f",
    steps: ["Thợ đăng ký (register/worker)", "Hồ sơ PENDING + thông báo Admin", "Admin duyệt / từ chối có lý do", "Thợ nhận thông báo, bật nhận việc"],
  },
  {
    name: "Thi công & nghiệm thu", icon: "wrench" as IconName, tone: "#2e527c",
    steps: ["Thợ: start → IN_PROGRESS", "Thợ: complete → DONE", "Khách đánh giá 1–5★", "Cập nhật rating thợ, Job → REVIEWED"],
  },
  {
    name: "Chat thời gian thực", icon: "chat" as IconName, tone: "#dd9a2b",
    steps: ["Client nối Socket.io /chat kèm JWT", "Xác thực + join room job:{id}", "message:send → lưu DB → message:new", "Hai bên nhận tin tức thì"],
  },
];

const METHOD_CLS: Record<string, string> = {
  GET: "bg-good-100 text-good-700",
  POST: "bg-safety-100 text-safety-600",
  PATCH: "bg-warn-100 text-warn-600",
  PUT: "bg-ink-800/10 text-ink-700",
  DELETE: "bg-danger-100 text-danger-600",
};
const KEY_CLS: Record<string, string> = {
  PK: "bg-safety-500 text-white",
  FK: "bg-ink-800 text-paper",
  UK: "bg-good-500 text-white",
  IDX: "bg-warn-100 text-warn-600",
};

/* ================= TRANG ================= */
export default function Docs() {
  const [tab, setTab] = useState<"arch" | "erd" | "api" | "flow">("erd");
  const [q, setQ] = useState("");

  const apiFiltered = useMemo(
    () =>
      API_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((e) => !q.trim() || (e.p + e.d + e.role).toLowerCase().includes(q.trim().toLowerCase())),
      })).filter((g) => g.items.length > 0),
    [q],
  );
  const endpointCount = API_GROUPS.reduce((s, g) => s + g.items.length, 0);

  const tabs = [
    { id: "erd" as const, label: "Sơ đồ CSDL", icon: "database" as IconName },
    { id: "api" as const, label: "REST API", icon: "code" as IconName },
    { id: "arch" as const, label: "Kiến trúc", icon: "layers" as IconName },
    { id: "flow" as const, label: "Luồng nghiệp vụ", icon: "refresh" as IconName },
  ];

  return (
    <div className="min-h-screen bg-ink-950 bg-blueprint-dark text-paper">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-[1180px] items-center gap-4 px-4 md:px-7">
          <Link to="/" className="transition hover:opacity-80"><Logo size={36} dark /></Link>
          <div className="hidden sm:block">
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-safety-400">Tài liệu kỹ thuật</p>
            <p className="text-[13px] font-bold text-white">Giai đoạn 2 — CSDL & Backend API</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11.5px] text-ink-400 md:flex">
              <span className="live-dot h-2 w-2 rounded-full bg-good-500" /> NestJS + Prisma + Socket.io
            </span>
            <Link to="/" className="flex items-center gap-1.5 rounded-lg bg-safety-500 px-3.5 py-2 text-[13px] font-bold text-white transition hover:bg-safety-600">
              <Icon name="home" size={15} /> Về trang chủ
            </Link>
          </div>
        </div>
        {/* tabs */}
        <div className="mx-auto max-w-[1180px] px-4 md:px-7">
          <div className="no-scrollbar flex gap-1 overflow-x-auto pb-2.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cls(
                  "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold transition-all",
                  tab === t.id ? "bg-safety-500 text-white shadow-[0_4px_14px_-4px_rgba(244,88,28,0.7)]" : "text-ink-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon name={t.icon} size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-8 md:px-7">
        {/* ================= ERD ================= */}
        {tab === "erd" && (
          <div className="anim-fadeUp">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold text-white">Lược đồ cơ sở dữ liệu</h1>
                <p className="mt-1 text-[14px] text-ink-400">
                  <b className="text-paper">{TABLES.length} bảng</b> · PostgreSQL · định nghĩa trong <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12.5px] text-safety-400">server/prisma/schema.prisma</code>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11.5px] font-bold">
                {Object.entries(KEY_CLS).map(([k, c]) => (
                  <span key={k} className={cls("rounded-md px-2 py-1", c)}>{k === "PK" ? "PK — khóa chính" : k === "FK" ? "FK — khóa ngoại" : k === "UK" ? "UK — duy nhất" : "IDX — đánh chỉ mục"}</span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {TABLES.map((t, i) => (
                <div key={t.name} className="anim-fadeUp group overflow-hidden rounded-xl border border-white/10 bg-ink-900/80 transition-all hover:-translate-y-1 hover:border-safety-500/60 hover:shadow-[0_12px_30px_-12px_rgba(244,88,28,0.4)]" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                  <div className="flex items-center gap-2.5 border-b border-white/10 bg-white/[0.04] px-4 py-3">
                    <Icon name="database" size={15} className="text-safety-400" />
                    <span className="font-mono text-[14.5px] font-bold text-white">{t.name}</span>
                  </div>
                  <p className="px-4 pt-2.5 text-[11.5px] italic text-ink-400">{t.desc}</p>
                  <div className="space-y-1 px-4 py-3">
                    {t.cols.map((c) => (
                      <div key={c.n} className="flex items-center justify-between gap-2 border-b border-white/[0.05] py-[5px] text-[12.5px] last:border-0">
                        <span className="font-mono font-semibold text-paper">{c.n}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-[11.5px] text-ink-400">{c.t}</span>
                          {c.k && <span className={cls("rounded px-1.5 py-px font-mono text-[9.5px] font-bold", KEY_CLS[c.k])}>{c.k}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h2 className="mb-4 flex items-center gap-2 font-display text-[19px] font-bold text-white">
                <span className="h-[3px] w-6 rounded-full bg-safety-500" /> Quan hệ giữa các bảng
              </h2>
              <div className="grid gap-2.5 md:grid-cols-2">
                {RELATIONS.map((r) => (
                  <div key={r.a + r.b} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 transition hover:border-white/25">
                    <span className="font-mono text-[13px] font-bold text-paper">{r.a}</span>
                    <span className="shrink-0 rounded-md bg-safety-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-safety-400">{r.rel}</span>
                    <span className="font-mono text-[13px] font-bold text-paper">{r.b}</span>
                    <span className="ml-auto hidden text-[11.5px] text-ink-400 lg:block">{r.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= API ================= */}
        {tab === "api" && (
          <div className="anim-fadeUp">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold text-white">REST API Reference</h1>
                <p className="mt-1 text-[14px] text-ink-400">
                  <b className="text-paper">{endpointCount} endpoint</b> · tiền tố <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12.5px] text-safety-400">/api/v1</code> · xác thực JWT <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12.5px] text-safety-400">Authorization: Bearer …</code>
                </p>
              </div>
              <div className="relative w-full sm:w-[280px]">
                <Icon name="search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lọc endpoint…" className="w-full rounded-lg border border-white/15 bg-ink-900 py-2.5 pl-9 pr-3 text-[13.5px] text-paper outline-none transition placeholder:text-ink-400/70 focus:border-safety-500" />
              </div>
            </div>
            <div className="space-y-7">
              {apiFiltered.map((g) => (
                <section key={g.name}>
                  <h2 className="mb-3 flex items-center gap-2.5 font-display text-[17px] font-bold text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-safety-500/15 text-safety-400"><Icon name={g.icon} size={16} /></span>
                    {g.name}
                    <span className="font-mono text-[11.5px] font-bold text-ink-400">({g.items.length})</span>
                  </h2>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    {g.items.map((e, i) => (
                      <div key={e.p + e.m} className={cls("flex flex-wrap items-center gap-x-3 gap-y-1 bg-ink-900/70 px-4 py-3 transition hover:bg-ink-900", i > 0 && "border-t border-white/[0.06]")}>
                        <span className={cls("w-[62px] shrink-0 rounded-md px-2 py-1 text-center font-mono text-[11px] font-bold", METHOD_CLS[e.m])}>{e.m}</span>
                        <code className="font-mono text-[13.5px] font-semibold text-paper">{e.p}</code>
                        <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-400">{e.role}</span>
                        <span className="w-full text-[12.5px] text-ink-400 sm:ml-auto sm:w-auto sm:max-w-[46%] sm:text-right">{e.d}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              {apiFiltered.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/20 py-14 text-center text-[14px] text-ink-400">Không có endpoint khớp “{q}”.</p>
              )}
            </div>
          </div>
        )}

        {/* ================= KIẾN TRÚC ================= */}
        {tab === "arch" && (
          <div className="anim-fadeUp">
            <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold text-white">Kiến trúc hệ thống</h1>
            <p className="mt-1 mb-8 text-[14px] text-ink-400">Client → API NestJS → Prisma → PostgreSQL, kèm luồng realtime Socket.io và lớp AI tách riêng ở giai đoạn sau.</p>

            <div className="space-y-3">
              {[
                { t: "Client — React + Vite + Tailwind", d: "SPA 3 vai trò · Zustand-free store (useSyncExternalStore) · lớp services tách rời để đổi sang API thật không sửa UI", icon: "home" as IconName, tone: "#f4581c" },
                { t: "API Gateway — NestJS (TypeScript)", d: "Global prefix /api/v1 · ValidationPipe (class-validator) · CORS · JWT Guard + RBAC (@Roles) gắn toàn cục qua APP_GUARD", icon: "layers" as IconName, tone: "#dd9a2b" },
                { t: "Realtime — Socket.io namespace /chat", d: "Xác thực JWT ở handshake · kiểm tra quyền tham gia · room theo từng việc job:{id}", icon: "chat" as IconName, tone: "#38a3c0" },
                { t: "ORM — Prisma Client", d: "Schema-first · transaction cho các thao tác nhiều bảng (chốt báo giá, đánh giá, đặt lịch)", icon: "code" as IconName, tone: "#12936f" },
                { t: "PostgreSQL 16", d: "13 bảng + enum + index theo đường truy vấn nóng (feed việc, thông báo chưa đọc, báo giá)", icon: "database" as IconName, tone: "#2e527c" },
              ].map((l, i) => (
                <div key={l.t} className="anim-fadeUp relative flex items-start gap-4 rounded-xl border border-white/10 bg-ink-900/70 p-5 transition hover:border-white/25" style={{ animationDelay: `${i * 70}ms` }}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${l.tone}26`, color: l.tone }}><Icon name={l.icon} size={20} /></span>
                  <div>
                    <p className="font-display text-[15.5px] font-bold text-white">{l.t}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-400">{l.d}</p>
                  </div>
                  <span className="absolute right-4 top-4 font-mono text-[11px] font-bold text-ink-400/60">L{i + 1}</span>
                  {i < 4 && <span className="absolute -bottom-3 left-9 h-3 w-[2px] bg-safety-500/50" />}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { t: "Bảo mật", d: "bcrypt 12 rounds · access token 15 phút · refresh token lưu DB, thu hồi được · RBAC 3 vai trò · kiểm tra ownership ở service", i: "lock" as IconName },
                { t: "Toàn vẹn dữ liệu", d: "Transaction: chốt báo giá, đánh giá, đặt lịch trực tiếp · ràng buộc duy nhất (jobId, workerId) · khóa ngoại onDelete Cascade", i: "shield" as IconName },
                { t: "Chân cắm AI (GĐ sau)", d: "matchScore() trong workers.ts — thay bằng mô hình ML · endpoint ước tính chi phí · chatbot tư vấn qua LLM", i: "sparkle" as IconName },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-safety-500/25 bg-safety-500/[0.06] p-5">
                  <p className="flex items-center gap-2 font-display text-[15px] font-bold text-safety-400"><Icon name={c.i} size={17} /> {c.t}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-400">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= LUỒNG ================= */}
        {tab === "flow" && (
          <div className="anim-fadeUp">
            <h1 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold text-white">Luồng nghiệp vụ chính</h1>
            <p className="mt-1 mb-8 text-[14px] text-ink-400">4 luồng xuyên suốt nền tảng — trùng khớp với kịch bản test end-to-end ở Giai đoạn 6.</p>
            <div className="grid gap-5 md:grid-cols-2">
              {FLOWS.map((f, fi) => (
                <div key={f.name} className="anim-fadeUp rounded-xl border border-white/10 bg-ink-900/70 p-6 transition hover:border-white/25" style={{ animationDelay: `${fi * 70}ms` }}>
                  <p className="flex items-center gap-2.5 font-display text-[16.5px] font-bold text-white">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${f.tone}26`, color: f.tone }}><Icon name={f.icon} size={17} /></span>
                    {f.name}
                  </p>
                  <div className="mt-5 space-y-0">
                    {f.steps.map((s, i) => (
                      <div key={s} className="flex gap-3.5">
                        <div className="flex flex-col items-center">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white" style={{ background: f.tone }}>{i + 1}</span>
                          {i < f.steps.length - 1 && <span className="w-[2px] flex-1 bg-white/10" />}
                        </div>
                        <p className="pb-5 pt-0.5 text-[13.5px] leading-snug text-paper">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900/70 px-5 py-4">
              <p className="text-[13.5px] text-ink-400"><b className="text-paper">Trạng thái việc:</b> <code className="font-mono text-[12.5px] text-safety-400">OPEN → ASSIGNED → IN_PROGRESS → DONE → REVIEWED</code> (hoặc <code className="font-mono text-[12.5px] text-danger-600">CANCELLED</code>)</p>
              <Link to="/" className="flex items-center gap-1.5 text-[13.5px] font-bold text-safety-400 transition hover:text-safety-500">Xem bản demo hoạt động <Icon name="arrowR" size={15} /></Link>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 py-6">
        <p className="text-center font-mono text-[11.5px] text-ink-400">Home Services · Đồ án tốt nghiệp · Giai đoạn 2/6 — chạy backend: <code className="text-safety-400">cd server && npm install && npm run db:reset && npm run dev</code></p>
      </footer>
    </div>
  );
}
