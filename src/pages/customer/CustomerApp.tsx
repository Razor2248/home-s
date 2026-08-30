import { useMemo, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { DashShell, type NavItem } from "../../components/DashShell";
import AccountSettings from "../AccountSettings";
import { useDB, useSession } from "../../lib/store";
import { bookDirect, createJob, estimateForCategory, matchScore, toggleFavorite } from "../../lib/api";
import { cls, fmtK, fmtVND, timeAgo, takeIntent, DISTRICTS, URGENCY } from "../../lib/format";
import { CATEGORY_ICON, FALLBACK_ICON, Icon, type IconName } from "../../components/Icons";
import { Badge, Button, EmptyState, Field, JobPill, Modal, Stars, useToast } from "../../components/ui";
import { ChatPanel } from "../../components/Chat";
import type { Job, WorkerProfile } from "../../lib/types";
import { MyJobs, CustomerJobDetail } from "./CustomerJobs";

export default function CustomerApp() {
  const db = useDB();
  const me = useSession()!;
  const active = db.jobs.filter((j) => j.customerId === me.id && ["open", "assigned", "in_progress"].includes(j.status)).length;
  const nav: NavItem[] = [
    { to: "/app/customer", label: "Tổng quan", icon: "home", end: true },
    { to: "/app/customer/workers", label: "Tìm thợ", icon: "search" },
    { to: "/app/customer/post", label: "Đăng việc", icon: "plus" },
    { to: "/app/customer/jobs", label: "Việc của tôi", icon: "clipboard", badge: active },
    { to: "/app/customer/messages", label: "Tin nhắn", icon: "chat" },
    { to: "/app/customer/favorites", label: "Thợ yêu thích", icon: "heart" },
    { to: "/app/customer/account", label: "Tài khoản", icon: "user" },
  ];
  return (
    <DashShell role="customer" nav={nav}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="workers" element={<BrowseWorkers />} />
        <Route path="post" element={<PostJob />} />
        <Route path="jobs" element={<MyJobs />} />
        <Route path="jobs/:id" element={<CustomerJobDetail />} />
        <Route path="messages" element={<Messages />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="account" element={<AccountSettings />} />
      </Routes>
    </DashShell>
  );
}

/* ================= TỔNG QUAN ================= */
function Overview() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const myJobs = db.jobs.filter((j) => j.customerId === me.id).sort((a, b) => b.createdAt - a.createdAt);
  const open = myJobs.filter((j) => j.status === "open").length;
  const ongoing = myJobs.filter((j) => ["assigned", "in_progress"].includes(j.status)).length;
  const finished = myJobs.filter((j) => ["done", "reviewed"].includes(j.status)).length;
  const latest = myJobs[0];
  const aiPicks = useMemo(() => {
    return db.workers
      .filter((w) => w.approval === "approved" && w.available)
      .map((w) => ({ w, s: matchScore(w, { categoryId: latest?.status === "open" ? latest.categoryId : undefined, district: latest?.district }) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
  }, [db.workers, latest]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const stats: { icon: IconName; label: string; value: number; cls: string }[] = [
    { icon: "wallet", label: "Chờ báo giá", value: open, cls: "bg-warn-100 text-warn-600" },
    { icon: "wrench", label: "Đang thực hiện", value: ongoing, cls: "bg-safety-100 text-safety-600" },
    { icon: "check", label: "Đã hoàn thành", value: finished, cls: "bg-good-100 text-good-700" },
    { icon: "heart", label: "Thợ yêu thích", value: me.favorites.length, cls: "bg-danger-100 text-danger-600" },
  ];

  return (
    <div className="anim-fadeUp space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[26px] font-extrabold text-ink-900">{greet}, {me.name.split(" ").slice(-1)[0]}!</h2>
          <p className="mt-1 text-[14px] text-mute">Nhà có gì cần sửa hôm nay không? Đăng việc miễn phí, báo giá về trong vài phút.</p>
        </div>
        <Button icon="plus" onClick={() => navigate("/app/customer/post")}>Đăng việc mới</Button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="anim-fadeUp rounded-xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
            <span className={cls("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", s.cls)}><Icon name={s.icon} size={19} /></span>
            <p className="font-display text-[28px] font-extrabold leading-none text-ink-900">{s.value}</p>
            <p className="mt-1.5 text-[12.5px] font-semibold text-mute">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* việc gần đây */}
        <div className="rounded-xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[17px] font-bold text-ink-900">Việc gần đây</h3>
            <Button variant="ghost" size="xs" iconRight="arrowR" onClick={() => navigate("/app/customer/jobs")}>Xem tất cả</Button>
          </div>
          {myJobs.length === 0 ? (
            <EmptyState icon="clipboard" title="Chưa có việc nào" desc="Đăng việc đầu tiên của bạn — miễn phí và chỉ mất một phút.">
              <Button size="sm" icon="plus" onClick={() => navigate("/app/customer/post")}>Đăng việc ngay</Button>
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {myJobs.slice(0, 4).map((j) => {
                const cat = db.categories.find((c) => c.id === j.categoryId);
                const quotes = db.quotes.filter((q) => q.jobId === j.id).length;
                return (
                  <button key={j.id} onClick={() => navigate(`/app/customer/jobs/${j.id}`)} className="group flex w-full items-center gap-3.5 rounded-xl border border-line/70 bg-paper/50 p-3.5 text-left transition hover:border-safety-500 hover:bg-safety-50/40">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${cat?.color ?? "#f4581c"}1a`, color: cat?.color ?? "#f4581c" }}>
                      <Icon name={(cat && CATEGORY_ICON[cat.id]) || FALLBACK_ICON} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink-900">{j.title}</p>
                      <p className="mt-0.5 text-[12px] text-mute">
                        <span className="font-mono">{j.code}</span> · {j.district} · {quotes} báo giá · {timeAgo(j.createdAt)}
                      </p>
                    </div>
                    <JobPill status={j.status} className="hidden sm:inline-flex" />
                    <Icon name="chevR" size={16} className="text-mute transition group-hover:translate-x-0.5 group-hover:text-safety-600" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI gợi ý */}
        <div className="rounded-xl border border-line bg-ink-900 bg-blueprint-dark p-5 text-paper">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-safety-500 text-white"><Icon name="sparkle" size={16} /></span>
            <h3 className="font-display text-[16px] font-bold">Gợi ý thợ phù hợp</h3>
          </div>
          <p className="mb-4 text-[12px] text-ink-400">Chấm điểm theo nghề, khu vực, đánh giá & độ sẵn sàng — bản tiền đề cho AI ở giai đoạn 2.</p>
          <div className="space-y-2.5">
            {aiPicks.map(({ w, s }) => {
              const cat = db.categories.find((c) => c.id === w.categoryId);
              return (
                <div key={w.id} className="flex items-center gap-3 rounded-xl bg-white/[0.05] p-3 transition hover:bg-white/[0.1]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-[14px] font-bold" style={{ background: `${cat?.color}33`, color: cat?.color }}>
                    {w.name.split(" ").slice(-1)[0][0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold">{w.name}</p>
                    <p className="truncate text-[11.5px] text-ink-400">{cat?.name} · {w.district} · ★ {w.rating.toFixed(1)}</p>
                  </div>
                  <span className={cls("rounded-lg px-2 py-1 text-[11.5px] font-extrabold", s >= 75 ? "bg-good-500/20 text-good-500" : "bg-safety-500/20 text-safety-400")}>{s}%</span>
                </div>
              );
            })}
          </div>
          <Button variant="primary" size="sm" className="mt-4 w-full" iconRight="arrowR" onClick={() => navigate("/app/customer/workers")}>
            Xem danh sách thợ đầy đủ
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ================= TÌM THỢ ================= */
function BrowseWorkers() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const { push } = useToast();
  const intent = useMemo(() => takeIntent(), []);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(intent?.categoryId ?? "");
  const [district, setDistrict] = useState(intent?.district ?? "");
  const [sort, setSort] = useState<"match" | "rating" | "price">("match");
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [booking, setBooking] = useState<WorkerProfile | null>(null);

  const workers = useMemo(() => {
    let list = db.workers.filter((w) => w.approval === "approved");
    if (cat) list = list.filter((w) => w.categoryId === cat);
    if (district) list = list.filter((w) => w.district === district);
    if (q.trim()) list = list.filter((w) => w.name.toLowerCase().includes(q.trim().toLowerCase()));
    const ctx = { categoryId: cat || undefined, district: district || undefined };
    return list
      .map((w) => ({ w, s: matchScore(w, ctx) }))
      .sort((a, b) => (sort === "match" ? b.s - a.s : sort === "rating" ? b.w.rating - a.w.rating : a.w.priceFrom - b.w.priceFrom));
  }, [db.workers, cat, district, q, sort]);

  const toggleFav = async (w: WorkerProfile) => {
    const was = me.favorites.includes(w.id);
    await toggleFavorite(me.id, w.id);
    push(was ? `Đã bỏ ${w.name} khỏi yêu thích.` : `Đã lưu ${w.name} vào yêu thích.`);
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[24px] font-extrabold text-ink-900">Tìm thợ quanh bạn</h2>
          <p className="mt-0.5 text-[13.5px] text-mute">{workers.length} thợ phù hợp · đã xác minh & duyệt hồ sơ</p>
        </div>
        <Button variant="outline" size="sm" icon="plus" onClick={() => navigate("/app/customer/post")}>Đăng việc thay vì chọn thợ</Button>
      </div>

      {/* bộ lọc */}
      <div className="grid gap-2.5 rounded-xl border border-line bg-card p-3.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên thợ…" className="field-input pl-10" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="field-input">
          <option value="">Mọi dịch vụ</option>
          {db.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="field-input">
          <option value="">Mọi khu vực</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field-input">
          <option value="match">Phù hợp nhất (AI)</option>
          <option value="rating">Đánh giá cao</option>
          <option value="price">Giá thấp trước</option>
        </select>
        {(cat || district || q) && (
          <Button variant="ghost" size="sm" icon="refresh" onClick={() => { setCat(""); setDistrict(""); setQ(""); }}>Xóa lọc</Button>
        )}
      </div>

      {workers.length === 0 ? (
        <EmptyState icon="search" title="Không tìm thấy thợ nào" desc="Thử đổi dịch vụ hoặc khu vực khác — hoặc đăng việc để thợ chủ động tìm bạn." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workers.map(({ w, s }, i) => {
            const catObj = db.categories.find((c) => c.id === w.categoryId);
            const fav = me.favorites.includes(w.id);
            return (
              <div key={w.id} className="anim-fadeUp flex flex-col rounded-xl border border-line bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-ink-900 hover:shadow-[5px_5px_0_#0b1b2e]" style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-[16px] font-bold text-white" style={{ background: catObj?.color ?? "#f4581c" }}>
                    {w.name.split(" ").slice(-1)[0][0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-display text-[15.5px] font-bold text-ink-900">
                      <span className="truncate">{w.name}</span>
                      {w.verified && <Icon name="shield" size={14} className="shrink-0 text-good-500" />}
                    </p>
                    <p className="truncate text-[12.5px] text-mute">{catObj?.name} · {w.district}</p>
                  </div>
                  <button onClick={() => toggleFav(w)} className={cls("rounded-lg p-1.5 transition hover:scale-110", fav ? "text-safety-500" : "text-line hover:text-safety-500")} aria-label="Yêu thích">
                    <Icon name="heart" size={18} filled={fav} />
                  </button>
                </div>
                <p className="mt-3 line-clamp-2 min-h-[38px] text-[13px] leading-relaxed text-mute">{w.bio}</p>
                <div className="mt-3 flex items-center gap-2 text-[12.5px]">
                  <Stars value={w.rating} size={12} />
                  <b className="text-ink-900">{w.rating.toFixed(1)}</b>
                  <span className="text-mute">({w.ratingCount})</span>
                  <span className="ml-auto rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] font-bold text-ink-700">{w.jobsDone} việc</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3.5">
                  <div>
                    <p className="text-[11px] text-mute">giá từ</p>
                    <p className="font-display text-[16px] font-extrabold text-ink-900">{fmtVND(w.priceFrom)}</p>
                  </div>
                  <span className={cls("rounded-lg px-2.5 py-1.5 text-[11.5px] font-extrabold", s >= 80 ? "bg-good-100 text-good-700" : s >= 60 ? "bg-safety-100 text-safety-600" : "bg-paper text-mute")}>
                    {s}% phù hợp
                  </span>
                </div>
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setProfile(w)}>Hồ sơ</Button>
                  <Button size="sm" onClick={() => setBooking(w)}>Đặt lịch</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {profile && <ProfileModal w={profile} onClose={() => setProfile(null)} onBook={() => { setBooking(profile); setProfile(null); }} />}
      {booking && <BookModal w={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

/* ---------- hồ sơ thợ ---------- */
function ProfileModal({ w, onClose, onBook }: { w: WorkerProfile; onClose: () => void; onBook: () => void }) {
  const db = useDB();
  const cat = db.categories.find((c) => c.id === w.categoryId);
  const reviews = db.reviews.filter((r) => r.workerId === w.id && !r.hidden).slice(0, 4);
  return (
    <Modal open onClose={onClose} title={w.name} sub={`${cat?.name} · ${w.district} · ${w.yearsExp} năm kinh nghiệm`} w="max-w-2xl">
      <div className="flex flex-wrap items-center gap-2">
        {w.verified && <Badge className="bg-good-100 text-good-700"><Icon name="shield" size={12} /> Đã xác minh</Badge>}
        {w.available ? <Badge className="bg-good-100 text-good-700">Đang nhận việc</Badge> : <Badge className="bg-line/60 text-mute">Tạm nghỉ</Badge>}
        {w.badges.map((b) => <Badge key={b} className="bg-safety-50 text-safety-600">{b}</Badge>)}
      </div>
      <p className="mt-4 text-[14px] leading-relaxed text-ink-800">{w.bio}</p>
      <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
        {[
          { v: w.rating.toFixed(1), l: "Điểm đánh giá" },
          { v: String(w.jobsDone), l: "Việc đã làm" },
          { v: `~${w.responseMins}p`, l: "Phản hồi" },
        ].map((x) => (
          <div key={x.l} className="rounded-xl bg-paper p-3">
            <p className="font-display text-[20px] font-extrabold text-ink-900">{x.v}</p>
            <p className="text-[11.5px] font-semibold text-mute">{x.l}</p>
          </div>
        ))}
      </div>
      <h4 className="mt-5 mb-2 font-display text-[15px] font-bold text-ink-900">Bảng giá tham khảo</h4>
      <div className="overflow-hidden rounded-xl border border-line">
        {w.priceList.map((p, i) => (
          <div key={i} className={cls("flex items-center justify-between px-4 py-2.5 text-[13.5px]", i % 2 === 0 ? "bg-card" : "bg-paper/60")}>
            <span className="text-ink-700">{p.label}</span>
            <span className="font-bold text-ink-900">{fmtVND(p.price)}</span>
          </div>
        ))}
      </div>
      <h4 className="mt-5 mb-2 font-display text-[15px] font-bold text-ink-900">Đánh giá gần đây</h4>
      {reviews.length === 0 ? (
        <p className="rounded-xl bg-paper px-4 py-5 text-center text-[13px] text-mute">Chưa có đánh giá nào.</p>
      ) : (
        <div className="space-y-2.5">
          {reviews.map((r) => {
            const u = db.users.find((x) => x.id === r.customerId);
            return (
              <div key={r.id} className="rounded-xl border border-line/70 bg-paper/50 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-ink-900">{u?.name ?? "Khách hàng"}</p>
                  <Stars value={r.rating} size={12} />
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-mute">“{r.comment}”</p>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Đóng</Button>
        <Button icon="calendar" onClick={onBook}>Đặt lịch với thợ này</Button>
      </div>
    </Modal>
  );
}

/* ---------- đặt lịch trực tiếp ---------- */
function BookModal({ w, onClose }: { w: WorkerProfile; onClose: () => void }) {
  const me = useSession()!;
  const navigate = useNavigate();
  const { push } = useToast();
  const db = useDB();
  const [f, setF] = useState({ scheduledAt: "Hôm nay, 14:00", district: w.district, address: "", note: "", budget: w.priceFrom });
  const [busy, setBusy] = useState(false);
  const cat = db.categories.find((c) => c.id === w.categoryId);

  const submit = async () => {
    if (!f.address.trim()) { push("Nhập địa chỉ cụ thể để thợ tới nhé.", "err"); return; }
    setBusy(true);
    try {
      const job = await bookDirect({ customerId: me.id, workerId: w.id, categoryId: w.categoryId, district: f.district, address: f.address, scheduledAt: f.scheduledAt, note: f.note, budget: Number(f.budget) || w.priceFrom });
      push(`Đã đặt lịch với ${w.name}! Phiếu việc ${job.code} được tạo.`);
      onClose();
      navigate(`/app/customer/jobs/${job.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Đặt lịch với ${w.name}`} sub={`${cat?.name} · giá từ ${fmtVND(w.priceFrom)}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Thời gian mong muốn">
            <input className="field-input" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} placeholder="VD: Hôm nay, 15:00" />
          </Field>
          <Field label="Khu vực">
            <select className="field-input" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Địa chỉ cụ thể">
          <input className="field-input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Số nhà, đường, phường…" />
        </Field>
        <Field label="Ghi chú cho thợ">
          <textarea rows={3} className="field-input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Mô tả ngắn tình trạng cần xử lý…" />
        </Field>
        <Field label="Ngân sách dự kiến (₫)">
          <input type="number" min={10000} step={10000} className="field-input" value={f.budget} onChange={(e) => setF({ ...f, budget: Number(e.target.value) })} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon="check" loading={busy} onClick={submit}>Xác nhận đặt lịch</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ================= ĐĂNG VIỆC ================= */
function PostJob() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const { push } = useToast();
  const intent = useMemo(() => takeIntent(), []);
  const [f, setF] = useState({
    title: "", categoryId: intent?.categoryId ?? "dien", district: intent?.district ?? DISTRICTS[4],
    address: "", description: "", budget: 300000, urgency: "normal" as "normal" | "urgent", scheduledAt: "",
  });
  const [busy, setBusy] = useState(false);
  const est = estimateForCategory(f.categoryId);

  const submit = async () => {
    if (!f.title.trim() || !f.description.trim() || !f.address.trim()) {
      push("Điền đủ tiêu đề, mô tả và địa chỉ nhé.", "err");
      return;
    }
    setBusy(true);
    try {
      const job = await createJob({ ...f, customerId: me.id, budget: Number(f.budget) || 0, scheduledAt: f.scheduledAt || undefined });
      push(`Đã đăng việc ${job.code}! Thợ trong khu vực đã nhận được thông báo.`);
      navigate(`/app/customer/jobs/${job.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fadeUp grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-xl border border-line bg-card p-6">
        <h2 className="font-display text-[22px] font-extrabold text-ink-900">Đăng việc mới</h2>
        <p className="mt-1 text-[13.5px] text-mute">Thợ đúng nghề trong khu vực sẽ nhận thông báo và gửi báo giá cho bạn.</p>
        <div className="mt-6 space-y-4">
          <Field label="Tiêu đề công việc">
            <input className="field-input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="VD: Ổ cắm phòng khách bị chập điện" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Danh mục">
              <select className="field-input" value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
                {db.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Khu vực">
              <select className="field-input" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Địa chỉ cụ thể">
            <input className="field-input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Số nhà, đường, phường…" />
          </Field>
          <Field label="Mô tả chi tiết" hint="Tình trạng, thiết bị, ảnh hưởng… mô tả càng rõ thợ báo giá càng sát.">
            <textarea rows={4} className="field-input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="VD: Cắm quạt là aptomat nhảy, có mùi khét nhẹ…" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngân sách tối đa (₫)">
              <input type="number" min={10000} step={10000} className="field-input" value={f.budget} onChange={(e) => setF({ ...f, budget: Number(e.target.value) })} />
            </Field>
            <Field label="Thời gian mong muốn (tuỳ chọn)">
              <input className="field-input" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} placeholder="VD: Chiều nay, sau 17:00" />
            </Field>
          </div>
          <Field label="Mức độ khẩn cấp">
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "urgent"] as const).map((u) => (
                <button type="button" key={u} onClick={() => setF({ ...f, urgency: u })} className={cls("flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-[13.5px] font-bold transition", f.urgency === u ? (u === "urgent" ? "border-safety-500 bg-safety-500 text-white" : "border-ink-900 bg-ink-900 text-paper") : "border-line text-mute hover:border-ink-900/30")}>
                  <Icon name={u === "urgent" ? "alert" : "clock"} size={15} /> {URGENCY[u].label}
                </button>
              ))}
            </div>
          </Field>
          <Button size="lg" icon="send" loading={busy} onClick={submit} className="w-full">Đăng việc — nhận báo giá</Button>
        </div>
      </div>

      <div className="space-y-4 self-start">
        <div className="rounded-xl border-2 border-dashed border-safety-500/50 bg-safety-50/60 p-5">
          <p className="flex items-center gap-2 font-display text-[15px] font-bold text-ink-900"><Icon name="sparkle" size={17} className="text-safety-600" /> Ước tính chi phí</p>
          {est ? (
            <>
              <p className="mt-3 font-display text-[26px] font-extrabold text-safety-600">{fmtK(est.min)} – {fmtK(est.max)}</p>
              <p className="mt-1 text-[12.5px] text-mute">Khoảng giá phổ biến cho <b>{db.categories.find((c) => c.id === f.categoryId)?.name}</b> tại TP.HCM.</p>
            </>
          ) : (
            <p className="mt-3 text-[13px] text-mute">Chọn danh mục để xem khoảng giá.</p>
          )}
          <p className="mt-3 flex items-start gap-1.5 border-t border-safety-500/20 pt-3 text-[11.5px] leading-relaxed text-mute">
            <Icon name="sparkle" size={12} className="mt-0.5 shrink-0" /> Tính năng AI ước tính theo mô tả sẽ ra mắt ở giai đoạn 2 — hiện dùng dữ liệu thống kê.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <p className="font-display text-[15px] font-bold text-ink-900">Mẹo để có báo giá sát nhất</p>
          <ul className="mt-3 space-y-2.5 text-[13px] text-mute">
            {[
              "Mô tả rõ sự cố và thiết bị liên quan.",
              "Ghi ngân sách để thợ cân đối phương án.",
              "Việc khẩn cấp sẽ được ưu tiên hiển thị trước.",
              "Chốt giá trên app trước khi thợ tới làm.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink-900 font-mono text-[10px] font-bold text-paper">{i + 1}</span>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ================= TIN NHẮN ================= */
function Messages() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const threads = useMemo(() => {
    return db.jobs
      .filter((j) => j.customerId === me.id && j.workerId)
      .map((j) => ({ job: j, msgs: db.chats.filter((m) => m.jobId === j.id) }))
      .filter((t) => t.msgs.length > 0 || ["assigned", "in_progress", "done"].includes(t.job.status))
      .sort((a, b) => ((b.msgs.length ? b.msgs[b.msgs.length - 1].createdAt : 0) || b.job.createdAt) - ((a.msgs.length ? a.msgs[a.msgs.length - 1].createdAt : 0) || a.job.createdAt));
  }, [db, me.id]);
  const [sel, setSel] = useState<string | null>(null);
  const active = threads.find((t) => t.job.id === sel) ?? threads[0];

  return (
    <div className="anim-fadeUp">
      <h2 className="font-display text-[24px] font-extrabold text-ink-900">Tin nhắn</h2>
      <p className="mt-0.5 text-[13.5px] text-mute">Trao đổi với thợ theo từng phiếu việc.</p>
      {threads.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="chat" title="Chưa có cuộc trò chuyện" desc="Khi bạn chọn thợ hoặc đặt lịch, khung chat sẽ xuất hiện tại đây.">
            <Button size="sm" icon="search" onClick={() => navigate("/app/customer/workers")}>Tìm thợ ngay</Button>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="space-y-2 self-start">
            {threads.map(({ job, msgs }) => {
              const w = db.workers.find((x) => x.id === job.workerId);
              const last = msgs.length ? msgs[msgs.length - 1] : undefined;
              const isActive = active?.job.id === job.id;
              return (
                <button key={job.id} onClick={() => setSel(job.id)} className={cls("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition", isActive ? "border-safety-500 bg-safety-50/60" : "border-line bg-card hover:border-ink-900/30")}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 font-display text-[14px] font-bold text-paper">
                    {w?.name.split(" ").slice(-1)[0][0] ?? "?"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-ink-900">{w?.name ?? "Thợ"}</span>
                    <span className="block truncate text-[12px] text-mute">{last ? last.text : job.title}</span>
                  </span>
                  <span className="font-mono text-[10.5px] font-bold text-mute">{job.code.slice(3)}</span>
                </button>
              );
            })}
          </div>
          {active && <ChatPanel job={active.job} currentUserId={me.id} height={440} />}
        </div>
      )}
    </div>
  );
}

/* ================= YÊU THÍCH ================= */
function Favorites() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const navigateToWorkers = () => navigate("/app/customer/workers");
  const favs = db.workers.filter((w) => me.favorites.includes(w.id));
  return (
    <div className="anim-fadeUp">
      <h2 className="font-display text-[24px] font-extrabold text-ink-900">Thợ yêu thích</h2>
      <p className="mt-0.5 text-[13.5px] text-mute">{favs.length} thợ đã lưu — gọi lại lần sau khỏi cần tìm.</p>
      {favs.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="heart" title="Chưa lưu thợ nào" desc="Nhấn vào biểu tượng trái tim trên hồ sơ thợ để lưu lại cho lần sau.">
            <Button size="sm" icon="search" onClick={navigateToWorkers}>Khám phá thợ</Button>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favs.map((w) => {
            const cat = db.categories.find((c) => c.id === w.categoryId);
            return (
              <div key={w.id} className="flex items-center gap-3.5 rounded-xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-[16px] font-bold text-white" style={{ background: cat?.color }}>
                  {w.name.split(" ").slice(-1)[0][0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15px] font-bold text-ink-900">{w.name}</p>
                  <p className="truncate text-[12px] text-mute">{cat?.name} · ★ {w.rating.toFixed(1)} · {w.district}</p>
                </div>
                <Button size="xs" variant="outline" onClick={navigateToWorkers}>Đặt</Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
