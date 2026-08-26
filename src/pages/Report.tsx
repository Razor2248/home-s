import { useState } from "react";
import { Link } from "react-router-dom";
import { useDB } from "../lib/store";
import { loadQA, TEST_CASES } from "../data/testcases";
import { cls, fmtK } from "../lib/format";
import { Icon, Logo } from "../components/Icons";
import { useToast } from "../components/ui";

const META_KEY = "hs_report_meta";
interface Meta { student: string; mssv: string; advisor: string }
const loadMeta = (): Meta => {
  try {
    return { student: "", mssv: "", advisor: "", ...JSON.parse(localStorage.getItem(META_KEY) || "{}") };
  } catch {
    return { student: "", mssv: "", advisor: "" };
  }
};

const CHAPTERS = [
  { n: "Chương 1", t: "Mở đầu", pts: ["Lý do chọn đề tài: nhu cầu sửa chữa – bảo trì nhà cửa tăng, thị trường thiếu minh bạch về giá và uy tín thợ", "Mục tiêu: nền tảng kết nối 3 bên minh bạch, phản hồi nhanh", "Phạm vi: 3 vai trò, 8 danh mục, chưa gồm AI (định hướng mở rộng)"] },
  { n: "Chương 2", t: "Cơ sở lý thuyết & hệ thống liên quan", pts: ["Mô hình Service Marketplace (khái niệm, các bên, cơ chế báo giá)", "Realtime với Socket.io; thanh toán trực tuyến & sandbox", "Khảo sát hệ thống tương tự: bTaskee, Thợ Ơi, JupViec — bảng so sánh tính năng"] },
  { n: "Chương 3", t: "Phân tích & thiết kế", pts: ["Use case 3 vai trò + biểu đồ tuần tự luồng: đăng việc → báo giá → chốt → thi công → đánh giá", "ERD 14 bảng PostgreSQL (xem tab Sơ đồ CSDL tại /docs)", "Thiết kế REST API 47 endpoint + sự kiện Socket.io"] },
  { n: "Chương 4", t: "Cài đặt", pts: ["Kiến trúc: React + Vite + Tailwind ↔ NestJS + Prisma + PostgreSQL + Socket.io", "Các module chính: xác thực JWT + RBAC, báo giá với transaction, chat realtime, thanh toán sandbox VNPay", "Kiến trúc 2 chế độ dữ liệu (Demo/API) — chuyển đổi không cần build lại"] },
  { n: "Chương 5", t: "Kiểm thử & đánh giá", pts: ["46 test case theo vai trò, kết quả tại /test (chụp màn hình đưa vào phụ lục)", "Kịch bản end-to-end 3 vai + kiểm tra biên/lỗi + Lighthouse", "Đánh giá phi chức năng: hiệu năng, bảo mật (bcrypt, RBAC, ownership)"] },
  { n: "Chương 6", t: "Kết luận & hướng phát triển", pts: ["Kết quả đạt được so với mục tiêu ban đầu", "Hạn chế: thanh toán sandbox, chưa định vị GPS, ảnh upload chưa có", "Hướng mở rộng: tích hợp AI — gợi ý thợ, chatbot, ước tính chi phí"] },
];

const FEATURES: Record<string, string[]> = {
  "Khách hàng": ["Đăng ký / đăng nhập", "Tìm & lọc thợ (nghề, khu vực, giá, đánh giá)", "Gợi ý thợ phù hợp theo điểm matching", "Đăng việc + ước tính chi phí tham khảo", "Nhận, so sánh & chốt báo giá", "Đặt lịch trực tiếp với thợ", "Theo dõi tiến độ 5 trạng thái", "Chat với thợ", "Thanh toán sandbox VNPay (QR/Thẻ/COD)", "Nghiệm thu & đánh giá sao", "Lưu thợ yêu thích, lịch sử việc"],
  "Thợ": ["Đăng ký hồ sơ nghề, chờ Admin duyệt", "Bật/tắt nhận việc", "Sàn việc đúng chuyên môn", "Gửi báo giá (chặn trùng, trái nghề)", "Nhận việc → thi công → hoàn thành", "Chat với khách", "Thống kê thu nhập, phân bố đánh giá", "Tự cập nhật hồ sơ & bảng giá", "Nhận thông báo việc mới"],
  "Quản trị viên": ["Dashboard KPI + biểu đồ", "Duyệt / từ chối hồ sơ thợ (kèm lý do)", "Khóa / mở khóa người dùng", "CRUD danh mục dịch vụ (chặn xóa khi còn tham chiếu)", "Kiểm duyệt đánh giá bị báo cáo", "Thống kê doanh thu & phí nền tảng 10%"],
};

export default function Report() {
  const db = useDB();
  const { push } = useToast();
  const [qa] = useState(() => loadQA());
  const [meta, setMeta] = useState<Meta>(loadMeta);
  const saveMeta = (patch: Partial<Meta>) => {
    setMeta((m) => {
      const next = { ...m, ...patch };
      try { localStorage.setItem(META_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const marked = TEST_CASES.filter((t) => qa[t.id]).length;
  const passed = TEST_CASES.filter((t) => qa[t.id]?.s === "pass").length;
  const failed = TEST_CASES.filter((t) => qa[t.id]?.s === "fail").length;
  const jobs = db.jobs;
  const paid = db.payments?.filter((p) => p.status === "success") ?? [];

  const stats: { l: string; v: string; s: string }[] = [
    { l: "Người dùng", v: String(db.users.length), s: `${db.users.filter((u) => u.role === "customer").length} khách · ${db.users.filter((u) => u.role === "worker").length} thợ · ${db.users.filter((u) => u.role === "admin").length} admin` },
    { l: "Thợ trên nền tảng", v: String(db.workers.length), s: `${db.workers.filter((w) => w.approval === "approved").length} duyệt · ${db.workers.filter((w) => w.approval === "pending").length} chờ` },
    { l: "Phiếu việc", v: String(jobs.length), s: `${jobs.filter((j) => j.status === "open").length} mở · ${jobs.filter((j) => ["assigned", "in_progress"].includes(j.status)).length} đang xử lý · ${jobs.filter((j) => ["done", "reviewed"].includes(j.status)).length} xong` },
    { l: "Báo giá đã gửi", v: String(db.quotes.length), s: `${db.quotes.filter((q) => q.status === "accepted").length} được chốt` },
    { l: "Đánh giá", v: String(db.reviews.length), s: `${db.reviews.filter((r) => r.flagged).length} bị báo cáo · ${db.reviews.filter((r) => r.hidden).length} đã ẩn` },
    { l: "Danh mục dịch vụ", v: String(db.categories.length), s: "quản lý bởi Admin" },
    { l: "Giao dịch thanh toán", v: String(paid.length), s: paid.length ? `tổng ${fmtK(paid.reduce((s, p) => s + p.amount, 0))} · phí 10% = ${fmtK(Math.round(paid.reduce((s, p) => s + p.amount, 0) * 0.1))}` : "sandbox VNPay" },
    { l: "Kết quả kiểm thử", v: `${passed}/${marked || 0}`, s: `${failed} FAIL · ${TEST_CASES.length - marked} chưa test (chi tiết tại /test)` },
  ];

  const copySummary = async () => {
    const lines = [
      "# BÁO CÁO TÓM TẮT — NỀN TẢNG KẾT NỐI DỊCH VỤ GIA ĐÌNH (HOME SERVICES)",
      `Sinh viên: ${meta.student || "…"} · MSSV: ${meta.mssv || "…"} · GVHD: ${meta.advisor || "…"}`,
      "",
      "## 1. Mục tiêu",
      "Xây dựng nền tảng web (Service Marketplace) kết nối khách hàng có nhu cầu sửa chữa, bảo trì, vệ sinh nhà cửa với thợ dịch vụ trong khu vực; minh bạch giá qua cơ chế báo giá, quản lý chất lượng qua đánh giá và kiểm duyệt của Admin.",
      "",
      "## 2. Công nghệ",
      "- Frontend: React 18 + Vite + TypeScript + Tailwind CSS v4, React Router 6",
      "- Backend: NestJS 10 + Prisma 5 + PostgreSQL 16 + Socket.io 4",
      "- Bảo mật: bcrypt, JWT (access 15p + refresh lưu DB), RBAC 3 vai trò",
      "- Thanh toán: sandbox mô phỏng VNPay (QR / Thẻ / COD)",
      "",
      "## 3. Kết quả chính",
      `- CSDL: 14 bảng, 6 enum · API: 47 endpoint REST + 1 namespace Socket.io`,
      `- Tính năng: ${Object.values(FEATURES).reduce((s, f) => s + f.length, 0)} tính năng across 3 vai trò`,
      `- Dữ liệu hiện tại: ${db.users.length} người dùng, ${db.workers.length} thợ, ${jobs.length} phiếu việc, ${db.quotes.length} báo giá, ${db.reviews.length} đánh giá`,
      `- Kiểm thử: ${marked}/${TEST_CASES.length} test case đã chạy — ${passed} PASS, ${failed} FAIL`,
      "",
      "## 4. Điểm nổi bật",
      "- Kiến trúc 2 chế độ dữ liệu: chạy demo không cần server, hoặc nối API thật — chuyển đổi ngay trên màn hình đăng nhập",
      "- Chat thời gian thực Socket.io theo từng phiếu việc, xác thực JWT khi bắt tay",
      "- Toàn bộ nghiệp vụ nhiều bảng (chốt báo giá, đánh giá, thanh toán) chạy trong transaction",
      "",
      "## 5. Hướng phát triển (sau bảo vệ)",
      "Tích hợp AI: (1) gợi ý thợ phù hợp bằng mô hình ML thay cho chấm điểm luật, (2) chatbot tư vấn chọn dịch vụ, (3) ước tính chi phí từ mô tả sự cố.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      push("Đã copy báo cáo tóm tắt (Markdown) vào clipboard.");
    } catch {
      push("Trình duyệt chặn clipboard.", "err");
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* bìa tài liệu */}
      <header className="relative overflow-hidden bg-ink-900 bg-blueprint-dark text-paper">
        <div className="stripes absolute inset-x-0 top-0 h-1.5" />
        <div className="mx-auto max-w-[1060px] px-5 py-10 md:px-8 md:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <Logo size={40} dark />
                <span className="rounded-md border border-white/15 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">Đồ án tốt nghiệp · 2026</span>
              </div>
              <h1 className="font-display text-[clamp(1.7rem,4vw,2.7rem)] font-extrabold leading-[1.1] text-white">
                Báo cáo tổng kết<br />
                <span className="text-safety-400">Nền tảng kết nối dịch vụ gia đình</span>
              </h1>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-400">
                Toàn bộ số liệu bên dưới được đọc <b className="text-paper">trực tiếp từ ứng dụng đang chạy</b> — số liệu thật, cập nhật theo dữ liệu hiện hành.
              </p>
            </div>
            <button onClick={copySummary} className="flex items-center gap-2 rounded-xl bg-safety-500 px-5 py-3 text-[14px] font-extrabold text-white shadow-[0_8px_20px_-6px_rgba(244,88,28,0.6)] transition hover:-translate-y-0.5 hover:bg-safety-600">
              <Icon name="clipboard" size={17} /> Copy báo cáo tóm tắt
            </button>
          </div>
          {/* thông tin sv */}
          <div className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-3">
            {([
              ["student", "Sinh viên thực hiện", "Nguyễn Văn A"],
              ["mssv", "MSSV", "21110xxx"],
              ["advisor", "Giảng viên hướng dẫn", "TS. Trần Thị B"],
            ] as const).map(([k, label, ph]) => (
              <label key={k} className="block">
                <span className="mb-1 block font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">{label}</span>
                <input
                  value={meta[k]}
                  onChange={(e) => saveMeta({ [k]: e.target.value })}
                  placeholder={ph}
                  className="w-full rounded-lg border border-white/15 bg-ink-950/60 px-3.5 py-2.5 text-[14px] font-semibold text-paper outline-none transition placeholder:text-ink-400/50 focus:border-safety-500"
                />
              </label>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1060px] px-5 py-10 md:px-8">
        {/* 1 — số liệu sống */}
        <section className="anim-fadeUp">
          <h2 className="mb-5 flex items-center gap-3 font-display text-[22px] font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-safety-500 font-mono text-[15px] text-white">1</span>
            Số liệu hệ thống (trực tiếp)
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.l} className="anim-fadeUp rounded-xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${i * 40}ms` }}>
                <p className="font-display text-[24px] font-extrabold leading-none text-ink-900">{s.v}</p>
                <p className="mt-1.5 text-[12.5px] font-bold text-ink-800">{s.l}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-mute">{s.s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2 — checklist tính năng */}
        <section className="anim-fadeUp mt-12">
          <h2 className="mb-5 flex items-center gap-3 font-display text-[22px] font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-safety-500 font-mono text-[15px] text-white">2</span>
            Danh sách tính năng đã hoàn thành
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(FEATURES).map(([role, items]) => (
              <div key={role} className="rounded-xl border border-line bg-card p-5">
                <p className="mb-3 flex items-center gap-2 font-display text-[16px] font-bold text-ink-900">
                  <Icon name={role === "Khách hàng" ? "user" : role === "Thợ" ? "wrench" : "shield"} size={17} className="text-safety-600" /> {role}
                  <span className="ml-auto rounded-md bg-good-100 px-2 py-0.5 font-mono text-[11px] font-bold text-good-700">{items.length} ✓</span>
                </p>
                <ul className="space-y-1.5">
                  {items.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-ink-700">
                      <Icon name="check" size={13} className="mt-0.5 shrink-0 text-good-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 3 — đề cương */}
        <section className="anim-fadeUp mt-12">
          <h2 className="mb-5 flex items-center gap-3 font-display text-[22px] font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-safety-500 font-mono text-[15px] text-white">3</span>
            Đề cương báo cáo đồ án (6 chương)
          </h2>
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            {CHAPTERS.map((c, i) => (
              <div key={c.n} className={cls("flex gap-4 px-5 py-4 transition hover:bg-paper/60", i > 0 && "border-t border-line/70")}>
                <span className="shrink-0 font-mono text-[11.5px] font-bold uppercase tracking-wide text-safety-600">{c.n}</span>
                <div>
                  <p className="text-[15px] font-extrabold text-ink-900">{c.t}</p>
                  <ul className="mt-1.5 space-y-1">
                    {c.pts.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[13px] leading-relaxed text-mute">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-safety-500" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 — kiểm thử + 5 — triển khai */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section className="anim-fadeUp rounded-xl border border-line bg-card p-6">
            <h2 className="mb-3 flex items-center gap-3 font-display text-[19px] font-extrabold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 font-mono text-[13px] text-paper">4</span>
              Kiểm thử & nghiệm thu
            </h2>
            <p className="text-[13.5px] leading-relaxed text-mute">
              Bộ <b className="text-ink-900">{TEST_CASES.length} test case</b> chia theo 3 vai trò + nhóm biên/lỗi, thiết kế cho người không biết code.
              Hiện tại: <b className="text-good-700">{passed} PASS</b> · <b className={failed ? "text-danger-600" : "text-mute"}>{failed} FAIL</b> · {TEST_CASES.length - marked} chưa chạy.
            </p>
            <Link to="/test" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-[13.5px] font-bold text-paper transition hover:bg-safety-600">
              Mở Trung tâm QA <Icon name="arrowR" size={15} />
            </Link>
            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-mute">
              Công cụ bổ trợ: <b className="text-ink-800">Playwright Codegen</b> (ghi thao tác thành test tự động), <b className="text-ink-800">Lighthouse</b> (hiệu năng),
              kiểm tra đa trình duyệt Chrome/Edge/Firefox và giả lập mobile.
            </p>
          </section>

          <section className="anim-fadeUp rounded-xl border border-line bg-card p-6">
            <h2 className="mb-3 flex items-center gap-3 font-display text-[19px] font-extrabold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 font-mono text-[13px] text-paper">5</span>
              Triển khai (deploy)
            </h2>
            <ol className="space-y-2.5 text-[13px] leading-relaxed text-ink-700">
              <li className="flex gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-safety-100 font-mono text-[11px] font-bold text-safety-600">1</span><span><b>Backend → Render/Railway:</b> tạo PostgreSQL, đặt <code className="rounded bg-paper px-1 font-mono text-[12px]">DATABASE_URL</code> + <code className="rounded bg-paper px-1 font-mono text-[12px]">JWT_SECRET</code>, chạy <code className="rounded bg-paper px-1 font-mono text-[12px]">prisma migrate deploy</code> rồi <code className="rounded bg-paper px-1 font-mono text-[12px]">npm run seed</code>.</span></li>
              <li className="flex gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-safety-100 font-mono text-[11px] font-bold text-safety-600">2</span><span><b>Frontend → Vercel:</b> đặt biến <code className="rounded bg-paper px-1 font-mono text-[12px]">VITE_API_URL</code> trỏ tới backend, build & deploy.</span></li>
              <li className="flex gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-safety-100 font-mono text-[11px] font-bold text-safety-600">3</span><span><b>Nghiệm thu:</b> mở app → chọn “Server API” → dán địa chỉ → Kiểm tra → đăng nhập 3 vai.</span></li>
              <li className="flex gap-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-safety-100 font-mono text-[11px] font-bold text-safety-600">4</span><span><b>Dự phòng:</b> mọi kịch bản demo đều chạy được ở chế độ Demo (không cần mạng) — an toàn khi bảo vệ.</span></li>
            </ol>
            <p className="mt-4 border-t border-line pt-3 font-mono text-[11.5px] text-mute">
              Tài liệu đầy đủ: <Link to="/docs" className="font-bold text-safety-600 hover:underline">/docs</Link> · mã nguồn backend: <code>server/README.md</code>
            </p>
          </section>
        </div>

        {/* 6 — định hướng AI */}
        <section className="anim-fadeUp mt-10 overflow-hidden rounded-xl border-2 border-dashed border-safety-500/50 bg-safety-50/70">
          <div className="flex flex-wrap items-center gap-3 border-b border-safety-500/25 px-6 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-safety-500 text-white"><Icon name="sparkle" size={18} /></span>
            <h2 className="font-display text-[19px] font-extrabold text-ink-900">6 · Định hướng mở rộng — Tích hợp AI</h2>
            <span className="ml-auto rounded-md bg-safety-500 px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-white">Sau bảo vệ</span>
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-3">
            {[
              { t: "Gợi ý thợ thông minh", d: "Nâng cấp hàm matchScore() (hiện chấm điểm theo luật) thành mô hình ML học từ lịch sử chốt thợ." },
              { t: "Chatbot tư vấn", d: "Điều hướng khách chọn đúng dịch vụ, giải đáp 24/7 qua LLM API, tự tạo phiếu việc từ hội thoại." },
              { t: "Ước tính chi phí nâng cao", d: "Dự đoán khoảng giá từ mô tả sự cố + ảnh hiện trạng, thay cho khoảng giá tĩnh theo danh mục." },
            ].map((x) => (
              <div key={x.t} className="rounded-xl bg-card p-4">
                <p className="font-display text-[14.5px] font-bold text-ink-900">{x.t}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-mute">{x.d}</p>
              </div>
            ))}
          </div>
          <p className="px-6 pb-5 text-[12px] font-semibold text-safety-700">
            Kiến trúc hiện tại đã chừa sẵn điểm tích hợp: <code className="rounded bg-white/70 px-1.5 font-mono">matchScore()</code> trong workers.ts và <code className="rounded bg-white/70 px-1.5 font-mono">estimateForCategory()</code> trong api.ts.
          </p>
        </section>

        <footer className="mt-12 border-t border-line pt-5 text-center">
          <p className="font-mono text-[11.5px] text-mute">
            Home Services © 2026 — hoàn thành 6/6 giai đoạn · <Link to="/" className="font-bold text-safety-600 hover:underline">Demo ứng dụng</Link> · <Link to="/docs" className="font-bold text-safety-600 hover:underline">Tài liệu kỹ thuật</Link> · <Link to="/test" className="font-bold text-safety-600 hover:underline">Trung tâm QA</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
