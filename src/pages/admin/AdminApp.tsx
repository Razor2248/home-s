import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { DashShell, type NavItem } from "../../components/DashShell";
import AccountSettings from "../AccountSettings";
import { useDB, useSession } from "../../lib/store";
import { addCategory, approveWorker, blockUser, deleteCategory, getPlatformFee, rejectWorker, resolveReview, setPlatformFee, updateCategory } from "../../lib/api";
import { remote } from "../../lib/remote";
import { isApiMode } from "../../lib/config";
import { APPROVAL, cls, fmtK, fmtVND, timeAgo } from "../../lib/format";
import { CATEGORY_ICON, FALLBACK_ICON, Icon, type IconName } from "../../components/Icons";
import { Badge, Bars, Button, EmptyState, Field, JobPill, Modal, Stars, Tabs, useToast } from "../../components/ui";
import type { Category, WorkerProfile } from "../../lib/types";

export default function AdminApp() {
  const db = useDB();
  const pending = db.workers.filter((w) => w.approval === "pending").length;
  const flagged = db.reviews.filter((r) => r.flagged).length;
  const nav: NavItem[] = [
    { to: "/app/admin", label: "Dashboard", icon: "chart", end: true },
    { to: "/app/admin/approvals", label: "Duyệt thợ", icon: "shield", badge: pending },
    { to: "/app/admin/users", label: "Người dùng", icon: "users" },
    { to: "/app/admin/categories", label: "Danh mục", icon: "tag" },
    { to: "/app/admin/reports", label: "Báo cáo vi phạm", icon: "flag", badge: flagged },
    { to: "/app/admin/settings", label: "Cài đặt phí", icon: "sliders" },
    { to: "/app/admin/account", label: "Tài khoản", icon: "user" },
  ];
  return (
    <DashShell role="admin" nav={nav}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="users" element={<Users />} />
        <Route path="categories" element={<Categories />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="account" element={<AccountSettings />} />
      </Routes>
    </DashShell>
  );
}

/* ================= DASHBOARD ================= */
function Dashboard() {
  const db = useDB();
  const navigate = useNavigate();
  const pendingWorkers = db.workers.filter((w) => w.approval === "pending");
  const doneJobs = db.jobs.filter((j) => ["done", "reviewed"].includes(j.status));
  const revenue = doneJobs.reduce((s, j) => s + (db.quotes.find((q) => q.jobId === j.id && q.status === "accepted")?.price ?? j.budget), 0);
  const openJobs = db.jobs.filter((j) => j.status === "open").length;
  const feeRate = getPlatformFee();

  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        const from = new Date(d).setHours(0, 0, 0, 0);
        const to = from + 86400_000;
        return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: db.jobs.filter((j) => j.createdAt >= from && j.createdAt < to).length };
      }),
    [db.jobs],
  );

  const catDist = db.categories
    .map((c) => ({ c, n: db.jobs.filter((j) => j.categoryId === c.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const maxCat = Math.max(1, ...catDist.map((x) => x.n));
  const recent = [...db.jobs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  const kpis = [
    { i: "users" as IconName, l: "Người dùng", v: String(db.users.length), s: `${db.users.filter((u) => u.role === "customer").length} khách · ${db.users.filter((u) => u.role === "worker").length} thợ`, cls: "bg-ink-800/10 text-ink-700" },
    { i: "wrench" as IconName, l: "Thợ đang hoạt động", v: String(db.workers.filter((w) => w.approval === "approved" && w.available).length), s: `${pendingWorkers.length} hồ sơ chờ duyệt`, cls: "bg-safety-100 text-safety-600" },
    { i: "briefcase" as IconName, l: "Việc đang mở", v: String(openJobs), s: `${db.jobs.length} việc tổng cộng`, cls: "bg-warn-100 text-warn-600" },
    { i: "wallet" as IconName, l: `Phí nền tảng (${feeRate}%)`, v: fmtK(Math.round((revenue * feeRate) / 100)), s: `từ ${fmtK(revenue)} giá trị hoàn thành`, cls: "bg-good-100 text-good-700" },
  ];

  // Thống kê thanh toán qua cổng (Giai đoạn 4) — chỉ có ở chế độ API
  const [pay, setPay] = useState<{ count: number; gross: number; platformFee: number; workerPayout: number } | null>(null);
  useEffect(() => {
    if (!isApiMode()) return;
    remote.adminPaymentStats().then(setPay).catch(() => {});
  }, []);

  return (
    <div className="anim-fadeUp space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[24px] font-extrabold text-ink-900">Trung tâm điều hành</h2>
          <p className="mt-0.5 text-[13.5px] text-mute">Toàn cảnh nền tảng theo thời gian thực</p>
        </div>
        {pendingWorkers.length > 0 && (
          <Button size="sm" icon="shield" onClick={() => navigate("/app/admin/approvals")}>{pendingWorkers.length} hồ sơ chờ duyệt</Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.l} className="anim-fadeUp rounded-xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
            <span className={cls("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", k.cls)}><Icon name={k.i} size={19} /></span>
            <p className="font-display text-[25px] font-extrabold leading-none text-ink-900">{k.v}</p>
            <p className="mt-1.5 text-[12.5px] font-bold text-ink-800">{k.l}</p>
            <p className="text-[11.5px] text-mute">{k.s}</p>
          </div>
        ))}
      </div>

      {/* Doanh thu qua cổng thanh toán (Giai đoạn 4) */}
      {pay && (
        <div className="anim-fadeUp grid gap-3.5 rounded-xl border border-good-500/30 bg-good-100/40 p-4 sm:grid-cols-4">
          {[
            { l: "Giao dịch thành công", v: String(pay.count) },
            { l: "Tổng giá trị", v: fmtVND(pay.gross) },
            { l: "Phí nền tảng (10%)", v: fmtVND(pay.platformFee) },
            { l: "Chi trả cho thợ", v: fmtVND(pay.workerPayout) },
          ].map((x) => (
            <div key={x.l}>
              <p className="font-display text-[19px] font-extrabold text-good-700">{x.v}</p>
              <p className="text-[11.5px] font-semibold text-good-700/80">{x.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-line bg-card p-5">
          <h3 className="mb-4 font-display text-[16px] font-bold text-ink-900">Việc đăng mới — 14 ngày</h3>
          <Bars data={days} height={150} tone="#2e527c" />
        </div>
        <div className="rounded-xl border border-line bg-card p-5">
          <h3 className="mb-4 font-display text-[16px] font-bold text-ink-900">Việc theo danh mục</h3>
          <div className="space-y-3">
            {catDist.map(({ c, n }) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-[12.5px] font-bold">
                  <span className="flex items-center gap-1.5 text-ink-800">
                    <span style={{ color: c.color }}><Icon name={(CATEGORY_ICON[c.id] || FALLBACK_ICON) as IconName} size={14} /></span>{c.name}
                  </span>
                  <span className="font-mono text-mute">{n}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-paper">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(n / maxCat) * 100}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-line bg-card p-5">
          <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Việc mới nhất</h3>
          <div className="space-y-2">
            {recent.map((j) => {
              const cat = db.categories.find((c) => c.id === j.categoryId);
              return (
                <div key={j.id} className="flex items-center gap-3 rounded-xl border border-line/70 bg-paper/50 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${cat?.color ?? "#f4581c"}1a`, color: cat?.color ?? "#f4581c" }}>
                    <Icon name={(cat && CATEGORY_ICON[cat.id]) || FALLBACK_ICON} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink-900">{j.title}</p>
                    <p className="text-[11.5px] text-mute"><span className="font-mono font-bold">{j.code}</span> · {j.district} · {timeAgo(j.createdAt)}</p>
                  </div>
                  <JobPill status={j.status} className="hidden sm:inline-flex" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-ink-900 bg-blueprint-dark p-5 text-paper">
          <h3 className="mb-3 flex items-center gap-2 font-display text-[16px] font-bold"><Icon name="sparkle" size={16} className="text-safety-400" /> Lộ trình AI — giai đoạn 2</h3>
          <ul className="space-y-3 text-[13px]">
            {[
              { t: "Gợi ý thợ thông minh", d: "Đang chạy chấm điểm theo luật; sẽ nâng cấp mô hình ML." },
              { t: "Chatbot tư vấn", d: "Điều hướng chọn dịch vụ, giải đáp 24/7." },
              { t: "Ước tính chi phí", d: "Dự đoán giá từ mô tả sự cố." },
            ].map((x, i) => (
              <li key={x.t} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-safety-500 font-mono text-[11px] font-bold text-white">{i + 1}</span>
                <span><b>{x.t}.</b> <span className="text-ink-400">{x.d}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ================= DUYỆT THỢ ================= */
function Approvals() {
  const db = useDB();
  const { push } = useToast();
  const [rejecting, setRejecting] = useState<WorkerProfile | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("pending");
  const pending = db.workers.filter((w) => w.approval === "pending");
  const rejected = db.workers.filter((w) => w.approval === "rejected");
  const approved = db.workers.filter((w) => w.approval === "approved");
  const list = tab === "pending" ? pending : tab === "rejected" ? rejected : approved;

  const doApprove = async (w: WorkerProfile) => {
    setBusy(true);
    await approveWorker(w.id);
    setBusy(false);
    push(`Đã duyệt ${w.name}. Thợ có thể nhận việc ngay.`);
  };
  const doReject = async () => {
    if (!rejecting) return;
    if (reason.trim().length < 5) { push("Ghi lý do từ chối rõ ràng một chút nhé.", "err"); return; }
    setBusy(true);
    await rejectWorker(rejecting.id, reason.trim());
    setBusy(false);
    push(`Đã từ chối hồ sơ ${rejecting.name}.`);
    setRejecting(null);
    setReason("");
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Duyệt hồ sơ thợ</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">Kiểm tra kỹ nghề, khu vực và giới thiệu trước khi duyệt — uy tín nền tảng nằm ở đây.</p>
      </div>
      <Tabs value={tab} onChange={setTab} items={[
        { id: "pending", label: "Chờ duyệt", count: pending.length },
        { id: "rejected", label: "Đã từ chối", count: rejected.length },
        { id: "approved", label: "Đã duyệt", count: approved.length },
      ]} />
      {list.length === 0 ? (
        <EmptyState icon="shield" title={tab === "pending" ? "Không còn hồ sơ chờ duyệt" : "Trống"} desc={tab === "pending" ? "Tuyệt! Mọi hồ sơ đã được xử lý." : undefined} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((w) => {
            const cat = db.categories.find((c) => c.id === w.categoryId);
            const user = db.users.find((u) => u.id === w.userId);
            return (
              <div key={w.id} className="rounded-xl border border-line bg-card p-5 transition hover:border-ink-900/40">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-[16px] font-bold text-white" style={{ background: cat?.color ?? "#666" }}>
                    {w.name.split(" ").slice(-1)[0][0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-ink-900">{w.name}</p>
                    <p className="text-[12.5px] text-mute">{cat?.name} · {w.district} · {w.yearsExp} năm · giá từ {fmtVND(w.priceFrom)}</p>
                  </div>
                  <Badge className={APPROVAL[w.approval].cls}>{APPROVAL[w.approval].label}</Badge>
                </div>
                <p className="mt-3 rounded-lg bg-paper/70 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-700">{w.bio}</p>
                <p className="mt-2 text-[12px] text-mute">Liên hệ: {user?.phone ?? "—"} · {user?.email}</p>
                {w.approval === "rejected" && w.rejectReason && (
                  <p className="mt-2 rounded-lg bg-danger-100/70 px-3.5 py-2 text-[12.5px] font-semibold text-danger-600">Lý do từ chối: {w.rejectReason}</p>
                )}
                {w.approval === "pending" && (
                  <div className="mt-4 flex gap-2 border-t border-line pt-3.5">
                    <Button variant="good" size="sm" icon="check" loading={busy} onClick={() => doApprove(w)}>Duyệt hồ sơ</Button>
                    <Button variant="outline" size="sm" icon="x" onClick={() => { setRejecting(w); setReason(""); }}>Từ chối</Button>
                  </div>
                )}
                {w.approval === "rejected" && (
                  <div className="mt-4 border-t border-line pt-3.5">
                    <Button variant="good" size="sm" icon="refresh" loading={busy} onClick={() => doApprove(w)}>Duyệt lại</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title={`Từ chối hồ sơ ${rejecting?.name ?? ""}`} sub="Lý do sẽ được gửi tới thợ để họ bổ sung.">
        <Field label="Lý do từ chối">
          <textarea rows={3} className="field-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Thiếu chứng chỉ hành nghề, ảnh CCCD chưa rõ…" />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejecting(null)}>Hủy</Button>
          <Button variant="danger" loading={busy} onClick={doReject}>Xác nhận từ chối</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ================= NGƯỜI DÙNG ================= */
function Users() {
  const db = useDB();
  const me = useSession()!;
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const users = db.users.filter(
    (u) => (!role || u.role === role) && (!q.trim() || u.name.toLowerCase().includes(q.trim().toLowerCase()) || u.email.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const ROLE_BADGE: Record<string, string> = {
    customer: "bg-safety-100 text-safety-600",
    worker: "bg-good-100 text-good-700",
    admin: "bg-ink-800/10 text-ink-700",
  };
  const ROLE_LABEL: Record<string, string> = { customer: "Khách hàng", worker: "Thợ", admin: "Admin" };

  const toggleBlock = async (id: string, blocked: boolean) => {
    setBusyId(id);
    await blockUser(id, blocked);
    setBusyId(null);
    push(blocked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Quản lý người dùng</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">{db.users.length} tài khoản · khóa tài khoản khi có vi phạm</p>
      </div>
      <div className="grid gap-2.5 rounded-xl border border-line bg-card p-3.5 sm:grid-cols-[1.5fr_200px]">
        <div className="relative">
          <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên hoặc email…" className="field-input pl-10" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="field-input">
          <option value="">Mọi vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="worker">Thợ</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <table className="w-full text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-paper/70 text-[11.5px] uppercase tracking-wide text-mute">
              <th className="px-4 py-3 font-bold">Người dùng</th>
              <th className="hidden px-4 py-3 font-bold md:table-cell">Vai trò</th>
              <th className="hidden px-4 py-3 font-bold lg:table-cell">Liên hệ</th>
              <th className="hidden px-4 py-3 font-bold sm:table-cell">Tham gia</th>
              <th className="px-4 py-3 text-right font-bold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line/60 transition last:border-0 hover:bg-paper/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold text-white" style={{ background: u.avatarColor }}>
                      {u.name.split(" ").slice(-1)[0][0]}
                    </span>
                    <div><p className="font-bold text-ink-900">{u.name}{u.id === me.id && <span className="ml-1 text-[10.5px] text-mute">(bạn)</span>}</p><p className="text-[11.5px] text-mute md:hidden">{ROLE_LABEL[u.role]}</p></div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 md:table-cell"><Badge className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge></td>
                <td className="hidden px-4 py-3 text-mute lg:table-cell">{u.email}<br />{u.phone}</td>
                <td className="hidden px-4 py-3 font-mono text-[12px] text-mute sm:table-cell">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3 text-right">
                  {u.role === "admin" ? (
                    <Badge className="bg-ink-800/10 text-ink-700">Quản trị</Badge>
                  ) : u.blocked ? (
                    <Button size="xs" variant="good" loading={busyId === u.id} onClick={() => toggleBlock(u.id, false)}>Mở khóa</Button>
                  ) : (
                    <Button size="xs" variant="outline" loading={busyId === u.id} onClick={() => toggleBlock(u.id, true)} className="text-danger-600 hover:border-danger-600">Khóa</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= DANH MỤC ================= */
const PALETTE = ["#f4581c", "#2f6fd0", "#38a3c0", "#159a6c", "#dd9a2b", "#c4504f", "#7a5c3e", "#4e9b8f"];

function Categories() {
  const db = useDB();
  const { push } = useToast();
  const [modal, setModal] = useState<"new" | Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", icon: "wrench", color: PALETTE[0], priceMin: 100000, priceMax: 500000, unit: "lần" });

  const openNew = () => { setF({ name: "", icon: "wrench", color: PALETTE[0], priceMin: 100000, priceMax: 500000, unit: "lần" }); setModal("new"); };
  const openEdit = (c: Category) => { setF({ name: c.name, icon: c.icon, color: c.color, priceMin: c.priceMin, priceMax: c.priceMax, unit: c.unit }); setModal(c); };

  const save = async () => {
    if (f.name.trim().length < 2) { push("Tên danh mục quá ngắn.", "err"); return; }
    setBusy(true);
    try {
      if (modal === "new") {
        await addCategory({ ...f, priceMin: Number(f.priceMin), priceMax: Number(f.priceMax) });
        push("Đã thêm danh mục mới.");
      } else if (modal) {
        await updateCategory(modal.id, { ...f, priceMin: Number(f.priceMin), priceMax: Number(f.priceMax) });
        push("Đã cập nhật danh mục.");
      }
      setModal(null);
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi.", "err");
    } finally {
      setBusy(false);
    }
  };

  const del = async (c: Category) => {
    setBusy(true);
    try {
      await deleteCategory(c.id);
      push(`Đã xóa danh mục "${c.name}".`);
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi.", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[24px] font-extrabold text-ink-900">Danh mục dịch vụ</h2>
          <p className="mt-0.5 text-[13.5px] text-mute">{db.categories.length} danh mục · hiển thị trên toàn nền tảng</p>
        </div>
        <Button size="sm" icon="plus" onClick={openNew}>Thêm danh mục</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        {db.categories.map((c, i) => {
          const nW = db.workers.filter((w) => w.categoryId === c.id).length;
          const nJ = db.jobs.filter((j) => j.categoryId === c.id).length;
          return (
            <div key={c.id} className={cls("flex flex-wrap items-center gap-3 px-4 py-3.5 transition hover:bg-paper/50", i > 0 && "border-t border-line/60")}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${c.color}1a`, color: c.color }}>
                <Icon name={(CATEGORY_ICON[c.id] || FALLBACK_ICON) as IconName} size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-ink-900">{c.name}</p>
                <p className="text-[12px] text-mute">{fmtK(c.priceMin)} – {fmtK(c.priceMax)} / {c.unit}</p>
              </div>
              <span className="rounded-md bg-paper px-2.5 py-1 font-mono text-[11.5px] font-bold text-ink-700">{nW} thợ</span>
              <span className="rounded-md bg-paper px-2.5 py-1 font-mono text-[11.5px] font-bold text-ink-700">{nJ} việc</span>
              <div className="flex gap-1.5">
                <Button size="xs" variant="ghost" icon="edit" onClick={() => openEdit(c)}>Sửa</Button>
                <Button size="xs" variant="ghost" icon="trash" loading={busy} onClick={() => del(c)} className="text-danger-600 hover:bg-danger-100">Xóa</Button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Thêm danh mục" : "Chỉnh sửa danh mục"} sub="Danh mục mới sẽ xuất hiện ngay ở trang chủ và bộ lọc.">
        <div className="space-y-4">
          <Field label="Tên danh mục">
            <input className="field-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="VD: Sửa máy giặt" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Giá tối thiểu (₫)">
              <input type="number" step={10000} className="field-input" value={f.priceMin} onChange={(e) => setF({ ...f, priceMin: Number(e.target.value) })} />
            </Field>
            <Field label="Giá tối đa (₫)">
              <input type="number" step={10000} className="field-input" value={f.priceMax} onChange={(e) => setF({ ...f, priceMax: Number(e.target.value) })} />
            </Field>
            <Field label="Đơn vị">
              <select className="field-input" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
                {["lần", "giờ", "máy", "m²", "căn", "hạng mục"].map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Màu nhận diện">
            <div className="flex gap-2">
              {PALETTE.map((p) => (
                <button key={p} type="button" onClick={() => setF({ ...f, color: p })} className={cls("h-8 w-8 rounded-lg transition hover:scale-110", f.color === p && "ring-2 ring-ink-900 ring-offset-2")} style={{ background: p }} aria-label={p} />
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModal(null)}>Hủy</Button>
            <Button icon="check" loading={busy} onClick={save}>Lưu danh mục</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= BÁO CÁO ================= */
function Reports() {
  const db = useDB();
  const { push } = useToast();
  const [tab, setTab] = useState("flagged");
  const [busyId, setBusyId] = useState<string | null>(null);
  const flagged = db.reviews.filter((r) => r.flagged);
  const hidden = db.reviews.filter((r) => r.hidden);
  const all = db.reviews.filter((r) => !r.hidden);
  const list = tab === "flagged" ? flagged : tab === "hidden" ? hidden : all;

  const act = async (id: string, action: "keep" | "hide", msg: string) => {
    setBusyId(id);
    await resolveReview(id, action);
    setBusyId(null);
    push(msg);
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Đánh giá & báo cáo vi phạm</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">Đánh giá bị khách/thợ báo cáo sẽ nằm ở mục chờ xử lý.</p>
      </div>
      <Tabs value={tab} onChange={setTab} items={[
        { id: "flagged", label: "Bị báo cáo", count: flagged.length },
        { id: "all", label: "Tất cả", count: all.length },
        { id: "hidden", label: "Đã ẩn", count: hidden.length },
      ]} />
      {list.length === 0 ? (
        <EmptyState icon="flag" title={tab === "flagged" ? "Không có báo cáo nào" : "Trống"} desc={tab === "flagged" ? "Cộng đồng đang rất văn minh. Tuyệt vời!" : undefined} />
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const w = db.workers.find((x) => x.id === r.workerId);
            const u = db.users.find((x) => x.id === r.customerId);
            return (
              <div key={r.id} className={cls("rounded-xl border bg-card p-4", r.flagged ? "border-danger-600/40" : "border-line")}>
                <div className="flex flex-wrap items-center gap-2">
                  {r.flagged && <Badge className="bg-danger-100 text-danger-600"><Icon name="flag" size={11} /> Bị báo cáo</Badge>}
                  {r.hidden && <Badge className="bg-line/70 text-mute">Đã ẩn khỏi hồ sơ thợ</Badge>}
                  <span className="text-[13px] font-bold text-ink-900">{u?.name ?? "Khách"} <span className="font-medium text-mute">đánh giá</span> {w?.name ?? "Thợ"}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <Stars value={r.rating} size={12} />
                    <span className="font-mono text-[11px] text-mute">{r.jobId} · {timeAgo(r.createdAt)}</span>
                  </span>
                </div>
                <p className="mt-2 rounded-lg bg-paper/70 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink-700">“{r.comment}”</p>
                {!r.hidden && (
                  <div className="mt-3 flex gap-2">
                    {r.flagged && (
                      <Button size="xs" variant="good" icon="check" loading={busyId === r.id} onClick={() => act(r.id, "keep", "Đã giữ đánh giá và bỏ cờ báo cáo.")}>Giữ đánh giá</Button>
                    )}
                    <Button size="xs" variant="outline" icon="eye" loading={busyId === r.id} onClick={() => act(r.id, "hide", "Đã ẩn đánh giá khỏi hồ sơ thợ.")} className="text-danger-600 hover:border-danger-600">Ẩn đánh giá</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================= CÀI ĐẶT PHÍ NỀN TẢNG ================= */
function AdminSettings() {
  const { push } = useToast();
  const current = getPlatformFee();
  const [input, setInput] = useState(String(current));
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const parsed = Number(input);
  const valid = Number.isFinite(parsed) && parsed >= 0 && parsed <= 50;
  const example = 500000;
  const exampleFee = valid ? Math.round((example * parsed) / 100) : 0;

  const save = async () => {
    if (!valid) {
      push("Phí phải là số từ 0 đến 50.", "err");
      return;
    }
    if (parsed < 5 || parsed > 20) {
      if (!confirming) {
        setConfirming(true);
        return;
      }
    }
    setBusy(true);
    try {
      await setPlatformFee(parsed);
      push(`Đã cập nhật phí nền tảng: ${parsed}%. Áp dụng ngay cho mọi giao dịch.`);
      setConfirming(false);
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi khi lưu.", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Cài đặt nền tảng</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">Phí nền tảng là nguồn doanh thu của Home Services — thay đổi có hiệu lực ngay.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* ---------- thiết lập phí ---------- */}
        <div className="rounded-xl border border-line bg-card p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-safety-100 text-safety-600"><Icon name="wallet" size={24} /></span>
            <div>
              <h3 className="font-display text-[18px] font-bold text-ink-900">Phí nền tảng</h3>
              <p className="text-[12.5px] text-mute">Thu trên mỗi giao dịch thanh toán qua cổng (VNPay sandbox)</p>
            </div>
            <span className="ml-auto font-display text-[38px] font-extrabold leading-none text-ink-900">
              {current}<span className="text-[20px] text-safety-600">%</span>
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[5, 8, 10, 12, 15].map((p) => (
              <button
                key={p}
                onClick={() => { setInput(String(p)); setConfirming(false); }}
                className={cls(
                  "rounded-lg border-[1.5px] px-4 py-2 font-mono text-[13.5px] font-bold transition-all hover:-translate-y-0.5",
                  Number(input) === p ? "border-safety-500 bg-safety-50 text-safety-600" : "border-line bg-card text-ink-700 hover:border-ink-900",
                )}
              >
                {p}%
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="number" min={0} max={50} value={input}
                onChange={(e) => { setInput(e.target.value); setConfirming(false); }}
                className={cls("field-input pr-9 font-mono text-[16px] font-bold", !valid && "border-danger-600")}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[14px] font-bold text-mute">%</span>
            </div>
            <Button icon="check" loading={busy} disabled={!valid || Number(input) === current} onClick={save}>
              Áp dụng
            </Button>
          </div>
          {!valid && <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-danger-600"><Icon name="alert" size={13} /> Nhập giá trị từ 0 đến 50.</p>}
          {confirming && (
            <div className="anim-pop mt-3 flex items-center justify-between gap-3 rounded-lg bg-warn-100 px-4 py-3">
              <p className="text-[12.5px] font-bold text-warn-600">Mức {parsed}% khá {parsed < 5 ? "thấp" : "cao"} so với thị trường (8–12%). Vẫn áp dụng?</p>
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" onClick={() => setConfirming(false)}>Hủy</Button>
                <Button size="xs" loading={busy} onClick={save}>Xác nhận</Button>
              </div>
            </div>
          )}

          {/* ví dụ trực quan */}
          <div className="mt-6 rounded-xl bg-paper/70 p-4">
            <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-mute">Ví dụ với giao dịch {fmtVND(example)}</p>
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-mute">Nền tảng thu ({valid ? parsed : current}%)</span>
              <span className="font-mono font-bold text-safety-600">{fmtVND(valid ? exampleFee : Math.round((example * current) / 100))}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[13.5px]">
              <span className="text-mute">Thợ thực nhận</span>
              <span className="font-mono font-bold text-good-700">{fmtVND(example - (valid ? exampleFee : Math.round((example * current) / 100)))}</span>
            </div>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full">
              <div className="bg-safety-500 transition-all duration-500" style={{ width: `${valid ? parsed : current}%` }} />
              <div className="flex-1 bg-good-500 transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* ---------- phạm vi & lưu ý ---------- */}
        <div className="space-y-4 self-start">
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Phạm vi áp dụng</h3>
            {[
              { i: "check" as IconName, t: "Giao dịch VNPay (QR & thẻ)", d: "Hiển thị ở màn hình thanh toán của khách và thống kê doanh thu." },
              { i: "x" as IconName, t: "Thanh toán khi hoàn thành (COD)", d: "Khách trả trực tiếp cho thợ — nền tảng không thu." },
              { i: "clock" as IconName, t: "Hiệu lực ngay lập tức", d: "Không ảnh hưởng giao dịch đã thanh toán trước đó." },
            ].map((x) => (
              <div key={x.t} className="flex gap-3 border-b border-line/60 py-2.5 last:border-0">
                <span className={cls("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", x.i === "check" ? "bg-good-100 text-good-700" : x.i === "x" ? "bg-danger-100 text-danger-600" : "bg-warn-100 text-warn-600")}>
                  <Icon name={x.i} size={14} />
                </span>
                <div><p className="text-[13px] font-bold text-ink-900">{x.t}</p><p className="text-[12px] leading-relaxed text-mute">{x.d}</p></div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-ink-900 bg-blueprint-dark p-5 text-paper">
            <p className="flex items-center gap-2 font-display text-[14.5px] font-bold"><Icon name="sparkle" size={15} className="text-safety-400" /> Gợi ý định giá</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-400">
              Các marketplace dịch vụ gia đình thường thu <b className="text-paper">8–15%</b>. Mức thấp giúp hút thợ mới, mức cao phù hợp khi nền tảng đã có thương hiệu và lượng việc ổn định.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
