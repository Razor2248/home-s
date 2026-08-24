import { useMemo, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { DashShell, type NavItem } from "../../components/DashShell";
import { useDB, useSession } from "../../lib/store";
import { completeJob, sendQuote, startJob, toggleAvailable, updateWorkerProfile } from "../../lib/api";
import { APPROVAL, cls, fmtK, fmtVND, timeAgo } from "../../lib/format";
import { CATEGORY_ICON, FALLBACK_ICON, Icon, type IconName } from "../../components/Icons";
import { Badge, Bars, Button, EmptyState, Field, JobPill, Modal, Stars, Tabs, useToast } from "../../components/ui";
import { ChatPanel } from "../../components/Chat";
import type { Job, WorkerProfile } from "../../lib/types";

const useMyWorker = (): WorkerProfile | undefined => {
  const db = useDB();
  const me = useSession()!;
  return db.workers.find((w) => w.userId === me.id);
};

const workerEarnings = (db: ReturnType<typeof useDB>, workerId: string) => {
  const jobs = db.jobs.filter((j) => j.workerId === workerId && ["done", "reviewed", "in_progress"].includes(j.status));
  const sum = (list: Job[]) =>
    list.reduce((s, j) => s + (db.quotes.find((q) => q.jobId === j.id && q.status === "accepted")?.price ?? j.budget), 0);
  return { total: sum(jobs), done14: jobs.filter((j) => j.doneAt && j.doneAt > Date.now() - 14 * 86400_000) };
};

export default function WorkerApp() {
  const db = useDB();
  const me = useSession()!;
  const w = useMyWorker();
  const newJobs = w ? db.jobs.filter((j) => j.categoryId === w.categoryId && j.status === "open").length : 0;
  const activeJobs = w ? db.jobs.filter((j) => j.workerId === w.id && ["assigned", "in_progress"].includes(j.status)).length : 0;
  const nav: NavItem[] = [
    { to: "/app/worker", label: "Tổng quan", icon: "home", end: true },
    { to: "/app/worker/board", label: "Việc phù hợp", icon: "briefcase", badge: newJobs },
    { to: "/app/worker/jobs", label: "Việc của tôi", icon: "clipboard", badge: activeJobs },
    { to: "/app/worker/stats", label: "Thống kê", icon: "chart" },
    { to: "/app/worker/profile", label: "Hồ sơ của tôi", icon: "user" },
  ];
  return (
    <DashShell role="worker" nav={nav}>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="board" element={<JobBoard />} />
        <Route path="jobs" element={<MyWorkerJobs />} />
        <Route path="jobs/:id" element={<WorkerJobDetail />} />
        <Route path="stats" element={<Stats />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </DashShell>
  );
}

function PendingBanner({ w }: { w: WorkerProfile }) {
  return (
    <div className={cls("flex items-start gap-3 rounded-xl border p-4 text-[13.5px]", w.approval === "pending" ? "border-warn-600/30 bg-warn-100/60 text-warn-600" : "border-danger-600/30 bg-danger-100/60 text-danger-600")}>
      <Icon name={w.approval === "pending" ? "clock" : "alert"} size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-bold">{w.approval === "pending" ? "Hồ sơ đang chờ Admin duyệt" : "Hồ sơ bị từ chối"}</p>
        <p className="mt-0.5 opacity-90">
          {w.approval === "pending"
            ? "Bạn đã có thể xem việc trên sàn, nhưng cần được duyệt để gửi báo giá. Thường mất dưới 24 giờ."
            : `Lý do: ${w.rejectReason ?? "Không nêu rõ"}. Hãy cập nhật hồ sơ và liên hệ hotro@homeservices.vn để được duyệt lại.`}
        </p>
      </div>
    </div>
  );
}

/* ================= TỔNG QUAN ================= */
function Overview() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const w = useMyWorker();
  const { push } = useToast();
  if (!w) return <EmptyState icon="user" title="Chưa có hồ sơ thợ" desc="Liên hệ quản trị viên để được cấp hồ sơ." />;

  const myJobs = db.jobs.filter((j) => j.workerId === w.id);
  const active = myJobs.filter((j) => ["assigned", "in_progress"].includes(j.status));
  const { total, done14 } = workerEarnings(db, w.id);
  const newJobs = db.jobs.filter((j) => j.categoryId === w.categoryId && j.status === "open").slice(0, 3);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const from = new Date(d).setHours(0, 0, 0, 0);
    const to = from + 86400_000;
    const val = myJobs.filter((j) => j.doneAt && j.doneAt >= from && j.doneAt < to).length;
    return { label: `T${(d.getDay() + 1) % 7 || 7}`.replace("T0", "CN"), value: val };
  });

  const flip = async () => {
    await toggleAvailable(w.id);
    push(w.available ? "Đã chuyển sang TẠM NGHỈ — khách sẽ không thấy bạn." : "Đã bật nhận việc — chúc bạn một ngày nhiều đơn!");
  };

  return (
    <div className="anim-fadeUp space-y-5">
      {w.approval !== "approved" && <PendingBanner w={w} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-[24px] font-extrabold text-ink-900">Chào thợ {me.name.split(" ").slice(-1)[0]}!</h2>
          <p className="mt-0.5 text-[13.5px] text-mute">{db.categories.find((c) => c.id === w.categoryId)?.name} · khu vực {w.district}</p>
        </div>
        {/* công tắc nhận việc */}
        <button onClick={flip} className={cls("group flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 transition-all", w.available ? "border-good-500 bg-good-100/60" : "border-line bg-card")}>
          <span className="text-left">
            <span className={cls("block text-[13.5px] font-extrabold", w.available ? "text-good-700" : "text-mute")}>{w.available ? "Đang nhận việc" : "Tạm nghỉ"}</span>
            <span className="block text-[11px] text-mute">Nhấn để chuyển trạng thái</span>
          </span>
          <span className={cls("relative h-7 w-12 rounded-full transition-colors", w.available ? "bg-good-500" : "bg-line")}>
            <span className={cls("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", w.available ? "left-6" : "left-1")} />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { icon: "briefcase" as IconName, label: "Việc đang làm", value: String(active.length), cls: "bg-safety-100 text-safety-600" },
          { icon: "wallet" as IconName, label: "Thu nhập tích lũy", value: fmtK(total), cls: "bg-good-100 text-good-700" },
          { icon: "star" as IconName, label: "Đánh giá", value: w.rating ? w.rating.toFixed(1) : "—", cls: "bg-warn-100 text-warn-600" },
          { icon: "check" as IconName, label: "Việc hoàn thành", value: String(w.jobsDone), cls: "bg-ink-800/10 text-ink-700" },
        ].map((s, i) => (
          <div key={s.label} className="anim-fadeUp rounded-xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
            <span className={cls("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", s.cls)}><Icon name={s.icon} size={19} /></span>
            <p className="font-display text-[26px] font-extrabold leading-none text-ink-900">{s.value}</p>
            <p className="mt-1.5 text-[12.5px] font-semibold text-mute">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-line bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[17px] font-bold text-ink-900">Việc mới trong khu vực</h3>
            <Button variant="ghost" size="xs" iconRight="arrowR" onClick={() => navigate("/app/worker/board")}>Xem sàn việc</Button>
          </div>
          {newJobs.length === 0 ? (
            <EmptyState icon="briefcase" title="Tạm hết việc mới" desc="Bật nhận việc và chờ thông báo — việc mới sẽ đến ngay khi khách đăng." />
          ) : (
            <div className="space-y-2">
              {newJobs.map((j) => (
                <button key={j.id} onClick={() => navigate("/app/worker/board")} className="group flex w-full items-center gap-3.5 rounded-xl border border-line/70 bg-paper/50 p-3.5 text-left transition hover:border-safety-500 hover:bg-safety-50/40">
                  <span className="rounded-lg bg-safety-500/15 px-2 py-1 font-mono text-[11px] font-bold text-safety-600">{j.code}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-ink-900">{j.title}</span>
                    <span className="text-[12px] text-mute">{j.district} · ngân sách {fmtVND(j.budget)} · {timeAgo(j.createdAt)}</span>
                  </span>
                  <Icon name="chevR" size={16} className="text-mute transition group-hover:translate-x-0.5 group-hover:text-safety-600" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-3 text-[12.5px] font-bold text-mute">Việc hoàn thành 7 ngày qua</p>
            <Bars data={days} height={90} tone="#12936f" />
          </div>
        </div>

        <div className="space-y-4 self-start">
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Việc đang xử lý</h3>
            {active.length === 0 ? (
              <p className="rounded-xl bg-paper px-4 py-5 text-center text-[13px] text-mute">Không có việc nào đang chạy.</p>
            ) : (
              <div className="space-y-2">
                {active.map((j) => (
                  <button key={j.id} onClick={() => navigate(`/app/worker/jobs/${j.id}`)} className="flex w-full items-center gap-3 rounded-xl border border-line/70 p-3 text-left transition hover:border-safety-500">
                    <span className={cls("h-2 w-2 shrink-0 rounded-full", j.status === "in_progress" ? "live-dot bg-safety-500" : "bg-ink-700")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-ink-900">{j.title}</span>
                      <span className="text-[11.5px] text-mute">{j.code} · {j.district}</span>
                    </span>
                    <JobPill status={j.status} className="hidden md:inline-flex" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-line bg-ink-900 bg-blueprint-dark p-5 text-paper">
            <p className="flex items-center gap-2 font-display text-[15px] font-bold"><Icon name="sparkle" size={16} className="text-safety-400" /> Mẹo tăng thu nhập</p>
            <ul className="mt-3 space-y-2 text-[12.5px] text-ink-400">
              <li>• Phản hồi báo giá trong 15 phút đầu tăng 2× tỷ lệ được chọn.</li>
              <li>• Cập nhật bảng giá đầy đủ giúp khách chốt nhanh hơn.</li>
              <li>• Đánh giá 5★ là “quảng cáo” miễn phí tốt nhất.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SÀN VIỆC ================= */
function JobBoard() {
  const db = useDB();
  const w = useMyWorker();
  const { push } = useToast();
  const [quoteFor, setQuoteFor] = useState<Job | null>(null);
  if (!w) return null;
  const jobs = db.jobs.filter((j) => j.categoryId === w.categoryId && j.status === "open").sort((a, b) => b.createdAt - a.createdAt);
  const myQuoteIds = db.quotes.filter((q) => q.workerId === w.id).map((q) => q.jobId);

  return (
    <div className="anim-fadeUp space-y-5">
      {w.approval !== "approved" && <PendingBanner w={w} />}
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Sàn việc {db.categories.find((c) => c.id === w.categoryId)?.name}</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">{jobs.length} việc đang chờ báo giá · gửi giá sớm để được khách chú ý</p>
      </div>
      {jobs.length === 0 ? (
        <EmptyState icon="briefcase" title="Chưa có việc mới" desc="Khách chưa đăng việc nào trong danh mục của bạn hôm nay. Quay lại sau nhé!" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((j, i) => {
            const customer = db.users.find((u) => u.id === j.customerId);
            const quoted = myQuoteIds.includes(j.id);
            const nQuotes = db.quotes.filter((q) => q.jobId === j.id).length;
            return (
              <div key={j.id} className={cls("anim-fadeUp flex flex-col rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5", quoted ? "border-good-500/50" : "border-line hover:border-ink-900 hover:shadow-[4px_4px_0_#0b1b2e]")} style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-ink-900 px-2 py-0.5 font-mono text-[11px] font-bold text-paper">{j.code}</span>
                  <Badge className={j.urgency === "urgent" ? "bg-safety-500 text-white" : "bg-line/60 text-ink-700"}>
                    <Icon name={j.urgency === "urgent" ? "alert" : "clock"} size={11} /> {j.urgency === "urgent" ? "Khẩn cấp" : "Bình thường"}
                  </Badge>
                  <span className="ml-auto text-[11.5px] text-mute">{timeAgo(j.createdAt)}</span>
                </div>
                <h3 className="mt-3 font-display text-[16.5px] font-bold leading-snug text-ink-900">{j.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-mute">{j.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-mute">
                  <span className="flex items-center gap-1"><Icon name="pin" size={13} /> {j.district}</span>
                  <span className="flex items-center gap-1"><Icon name="user" size={13} /> {customer?.name ?? "Khách"}</span>
                  <span className="flex items-center gap-1"><Icon name="chat" size={13} /> {nQuotes} báo giá</span>
                  {j.scheduledAt && <span className="flex items-center gap-1"><Icon name="calendar" size={13} /> {j.scheduledAt}</span>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
                  <p className="text-[12px] text-mute">Ngân sách<br /><b className="font-display text-[17px] text-ink-900">{fmtVND(j.budget)}</b></p>
                  {quoted ? (
                    <Badge className="bg-good-100 text-good-700"><Icon name="check" size={12} /> Đã báo giá</Badge>
                  ) : (
                    <Button size="sm" icon="wallet" disabled={w.approval !== "approved"} onClick={() => setQuoteFor(j)}>Gửi báo giá</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {quoteFor && w && <QuoteModal job={quoteFor} worker={w} onClose={() => setQuoteFor(null)} onDone={() => push("Đã gửi báo giá! Chờ khách lựa chọn nhé.")} />}
    </div>
  );
}

function QuoteModal({ job, worker, onClose, onDone }: { job: Job; worker: WorkerProfile; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ price: Math.min(job.budget, worker.priceFrom + 50000), eta: "Có mặt trong 30 phút", message: "" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!f.message.trim()) return;
    setBusy(true);
    try {
      await sendQuote(job.id, worker.id, { price: Number(f.price) || job.budget, eta: f.eta, message: f.message });
      onDone();
      onClose();
    } catch (e) {
      onDone();
      onClose();
    }
  };
  return (
    <Modal open onClose={onClose} title={`Báo giá cho ${job.code}`} sub={job.title}>
      <div className="space-y-4">
        <Field label="Giá đề xuất (₫)" hint={`Khách đặt ngân sách ${fmtVND(job.budget)} — báo sát ngân sách dễ được chọn hơn.`}>
          <input type="number" step={10000} min={10000} className="field-input" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
        </Field>
        <Field label="Thời gian có mặt">
          <select className="field-input" value={f.eta} onChange={(e) => setF({ ...f, eta: e.target.value })}>
            {["Có mặt trong 30 phút", "Có mặt trong 1 giờ", "Có mặt trong hôm nay", "Có mặt ngày mai"].map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="Lời nhắn cho khách">
          <textarea rows={3} className="field-input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Kinh nghiệm xử lý, vật tư đi kèm, cam kết bảo hành…" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button icon="send" loading={busy} onClick={submit}>Gửi báo giá</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ================= VIỆC CỦA TÔI (thợ) ================= */
function MyWorkerJobs() {
  const db = useDB();
  const w = useMyWorker();
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  if (!w) return null;
  const mine = db.jobs.filter((j) => j.workerId === w.id).sort((a, b) => b.createdAt - a.createdAt);
  const filtered = mine.filter((j) =>
    tab === "all" ? true
      : tab === "active" ? ["assigned", "in_progress"].includes(j.status)
        : tab === "done" ? ["done", "reviewed"].includes(j.status)
          : j.status === "cancelled",
  );
  return (
    <div className="anim-fadeUp space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Việc của tôi</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">{mine.length} việc đã nhận · cập nhật trạng thái để khách yên tâm</p>
      </div>
      <Tabs value={tab} onChange={setTab} items={[
        { id: "active", label: "Đang xử lý", count: mine.filter((j) => ["assigned", "in_progress"].includes(j.status)).length },
        { id: "done", label: "Đã xong", count: mine.filter((j) => ["done", "reviewed"].includes(j.status)).length },
        { id: "cancelled", label: "Bị hủy", count: mine.filter((j) => j.status === "cancelled").length },
        { id: "all", label: "Tất cả", count: mine.length },
      ]} />
      {filtered.length === 0 ? (
        <EmptyState icon="clipboard" title="Trống mục này" desc="Nhận việc từ sàn việc để bắt đầu kiếm thu nhập." >
          <Button size="sm" icon="briefcase" onClick={() => navigate("/app/worker/board")}>Ra sàn việc</Button>
        </EmptyState>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((j) => {
            const customer = db.users.find((u) => u.id === j.customerId);
            const price = db.quotes.find((q) => q.jobId === j.id && q.status === "accepted")?.price ?? j.budget;
            return (
              <button key={j.id} onClick={() => navigate(`/app/worker/jobs/${j.id}`)} className="group flex w-full items-center gap-4 rounded-xl border border-line bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[4px_4px_0_#0b1b2e]">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-bold text-ink-900">{j.title}</p>
                  <p className="mt-0.5 text-[12px] text-mute">
                    <span className="font-mono font-bold text-ink-700">{j.code}</span> · {customer?.name} · {j.district} · <b className="text-ink-900">{fmtVND(price)}</b>
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <JobPill status={j.status} />
                  <p className="mt-1 text-[11px] text-mute">{timeAgo(j.createdAt)}</p>
                </div>
                <Icon name="chevR" size={17} className="shrink-0 text-mute transition group-hover:translate-x-0.5 group-hover:text-safety-600" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WorkerJobDetail() {
  const db = useDB();
  const me = useSession()!;
  const w = useMyWorker();
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const job = db.jobs.find((j) => j.id === id && j.workerId === w?.id);
  if (!job || !w) {
    return (
      <EmptyState icon="search" title="Không tìm thấy việc" desc="Việc không tồn tại hoặc không thuộc về bạn.">
        <Button size="sm" onClick={() => navigate("/app/worker/jobs")}>Về danh sách</Button>
      </EmptyState>
    );
  }
  const cat = db.categories.find((c) => c.id === job.categoryId);
  const customer = db.users.find((u) => u.id === job.customerId);
  const price = db.quotes.find((q) => q.jobId === job.id && q.status === "accepted")?.price ?? job.budget;
  const review = db.reviews.find((r) => r.jobId === job.code);
  // Trạng thái thanh toán của việc (Giai đoạn 4)
  const payment = db.payments.find((p) => p.jobId === job.id);
  const paid = payment?.status === "success";

  const act = async (fn: () => Promise<void>, msg: string) => {
    setBusy(true);
    await fn();
    setBusy(false);
    push(msg);
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <button onClick={() => navigate("/app/worker/jobs")} className="flex items-center gap-1.5 text-[13.5px] font-bold text-mute transition hover:text-safety-600">
        <Icon name="chevR" size={15} className="rotate-180" /> Về danh sách việc
      </button>
      <div className="rounded-xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-ink-900 px-2.5 py-1 font-mono text-[12px] font-bold text-paper">{job.code}</span>
          <JobPill status={job.status} />
          {job.urgency === "urgent" && <Badge className="bg-safety-500 text-white">Khẩn cấp</Badge>}
          {paid && (
            <Badge className="bg-good-100 text-good-700">
              <Icon name="check" size={12} /> Khách đã thanh toán {fmtVND(payment!.amount)}
            </Badge>
          )}
          {payment && payment.status === "pending" && <Badge className="bg-warn-100 text-warn-600">Đang chờ khách thanh toán</Badge>}
        </div>
        <h2 className="mt-3 font-display text-[22px] font-extrabold text-ink-900">{job.title}</h2>
        <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{job.description}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: "pin" as IconName, l: "Địa chỉ", v: `${job.district} — ${job.address}` },
            { i: "user" as IconName, l: "Khách hàng", v: `${customer?.name ?? ""} · ${customer?.phone ?? ""}` },
            { i: "wallet" as IconName, l: "Giá chốt", v: fmtVND(price) },
            { i: "calendar" as IconName, l: "Lịch hẹn", v: job.scheduledAt ?? "Sẽ trao đổi" },
          ].map((x) => (
            <div key={x.l} className="rounded-xl bg-paper p-3.5">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-mute"><Icon name={x.i} size={13} /> {x.l}</p>
              <p className="mt-1 text-[13.5px] font-bold text-ink-900">{x.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {job.status === "assigned" && (
            <Button icon="wrench" loading={busy} onClick={() => act(() => startJob(job.id), "Đã bắt đầu — khách đã được thông báo.")}>Bắt đầu thi công</Button>
          )}
          {job.status === "in_progress" && (
            <Button variant="good" icon="check" loading={busy} onClick={() => act(() => completeJob(job.id), "Tuyệt vời! Đã báo hoàn thành cho khách.")}>Hoàn thành việc</Button>
          )}
          {job.status === "done" && <p className="flex items-center gap-2 text-[13px] font-semibold text-mute"><Icon name="clock" size={15} /> Chờ khách nghiệm thu & đánh giá…</p>}
          {job.status === "cancelled" && <p className="flex items-center gap-2 text-[13px] font-semibold text-danger-600"><Icon name="alert" size={15} /> Khách đã hủy: {job.cancelReason}</p>}
          {review && (
            <span className="ml-auto flex items-center gap-2 rounded-lg bg-warn-100 px-3 py-1.5 text-[13px] font-bold text-warn-600">
              <Stars value={review.rating} size={12} /> {review.rating}/5 — “{review.comment.length > 60 ? review.comment.slice(0, 60) + "…" : review.comment}”
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="self-start rounded-xl border border-line bg-card p-5">
          <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Quy trình 3 bước</h3>
          {[
            { t: "Đến đúng hẹn", d: "Khách nhận thông báo khi bạn bắt đầu.", done: job.status !== "assigned" },
            { t: "Làm gọn, báo giá đã chốt", d: "Không thu thêm ngoài giá trên app.", done: ["done", "reviewed"].includes(job.status) },
            { t: "Khách nghiệm thu", d: "Đánh giá tốt = thêm nhiều việc mới.", done: job.status === "reviewed" },
          ].map((s, i) => (
            <div key={s.t} className="flex gap-3 pb-4 last:pb-0">
              <span className={cls("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-extrabold", s.done ? "bg-good-500 text-white" : "bg-paper text-mute")}>{s.done ? <Icon name="check" size={13} /> : i + 1}</span>
              <div><p className="text-[13.5px] font-bold text-ink-900">{s.t}</p><p className="text-[12px] text-mute">{s.d}</p></div>
            </div>
          ))}
        </div>
        <ChatPanel job={job} currentUserId={me.id} height={330} />
      </div>
    </div>
  );
}

/* ================= THỐNG KÊ ================= */
function Stats() {
  const db = useDB();
  const w = useMyWorker();
  if (!w) return null;
  const myJobs = db.jobs.filter((j) => j.workerId === w.id && j.doneAt);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const from = new Date(d).setHours(0, 0, 0, 0);
    const to = from + 86400_000;
    const list = myJobs.filter((j) => j.doneAt! >= from && j.doneAt! < to);
    const val = list.reduce((s, j) => s + (db.quotes.find((q) => q.jobId === j.id && q.status === "accepted")?.price ?? j.budget), 0);
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: val };
  });
  const { total } = workerEarnings(db, w.id);
  const reviews = db.reviews.filter((r) => r.workerId === w.id);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => Math.round(r.rating) === s).length }));
  const maxDist = Math.max(1, ...dist.map((x) => x.n));
  // Tổng tiền khách đã thanh toán online cho các việc của thợ (Giai đoạn 4)
  const collected = db.payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="anim-fadeUp space-y-5">
      <div>
        <h2 className="font-display text-[24px] font-extrabold text-ink-900">Thống kê thu nhập</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">Doanh thu 14 ngày gần nhất từ các việc đã hoàn thành</p>
      </div>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { l: "Tổng doanh thu", v: fmtVND(total), i: "wallet" as IconName },
          { l: "Việc hoàn thành", v: String(myJobs.length), i: "check" as IconName },
          { l: "Bình quân / việc", v: myJobs.length ? fmtK(total / myJobs.length) : "—", i: "chart" as IconName },
          { l: "Đánh giá trung bình", v: w.rating ? w.rating.toFixed(1) + "★" : "—", i: "star" as IconName },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-line bg-card p-4">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-safety-100 text-safety-600"><Icon name={s.i} size={17} /></span>
            <p className="font-display text-[21px] font-extrabold text-ink-900">{s.v}</p>
            <p className="text-[12px] font-semibold text-mute">{s.l}</p>
            {s.l === "Tổng doanh thu" && collected > 0 && (
              <p className="mt-1.5 flex items-center gap-1 rounded-md bg-good-100 px-2 py-1 text-[11px] font-bold text-good-700">
                <Icon name="check" size={11} /> Đã thu online {fmtK(collected)}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-line bg-card p-5">
          <h3 className="mb-4 font-display text-[16px] font-bold text-ink-900">Doanh thu theo ngày</h3>
          <Bars data={days} height={170} tone="#f4581c" formatValue={(v) => fmtK(v)} />
        </div>
        <div className="space-y-5 self-start">
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="mb-4 font-display text-[16px] font-bold text-ink-900">Phân bố đánh giá</h3>
            {reviews.length === 0 ? (
              <p className="text-[13px] text-mute">Chưa có đánh giá nào.</p>
            ) : (
              <div className="space-y-2.5">
                {dist.map((x) => (
                  <div key={x.s} className="flex items-center gap-3 text-[12.5px] font-bold text-ink-700">
                    <span className="flex w-8 items-center gap-0.5">{x.s}<Icon name="star" size={11} filled className="text-warn-600" /></span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper">
                      <div className="h-full rounded-full bg-warn-600 transition-all duration-500" style={{ width: `${(x.n / maxDist) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-mute">{x.n}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Nhận xét gần đây</h3>
            {reviews.length === 0 ? (
              <p className="text-[13px] text-mute">Hoàn thành việc để nhận đánh giá đầu tiên.</p>
            ) : (
              <div className="space-y-2.5">
                {reviews.slice(0, 4).map((r) => {
                  const u = db.users.find((x) => x.id === r.customerId);
                  return (
                    <div key={r.id} className="rounded-xl bg-paper/70 p-3.5">
                      <div className="flex items-center justify-between"><p className="text-[12.5px] font-bold text-ink-900">{u?.name ?? "Khách"} · {r.jobId}</p><Stars value={r.rating} size={11} /></div>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-mute">“{r.comment}”</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HỒ SƠ ================= */
function Profile() {
  const db = useDB();
  const w = useMyWorker();
  const { push } = useToast();
  const [bio, setBio] = useState(w?.bio ?? "");
  const [priceFrom, setPriceFrom] = useState(w?.priceFrom ?? 0);
  const [priceList, setPriceList] = useState(w?.priceList ?? []);
  const [busy, setBusy] = useState(false);
  if (!w) return null;
  const cat = db.categories.find((c) => c.id === w.categoryId);
  const meta = APPROVAL[w.approval];

  const save = async () => {
    setBusy(true);
    await updateWorkerProfile(w.id, { bio, priceFrom: Number(priceFrom) || w.priceFrom, priceList: priceList.filter((p) => p.label.trim()) });
    setBusy(false);
    push("Đã lưu hồ sơ. Khách hàng sẽ thấy thông tin mới ngay.");
  };

  return (
    <div className="anim-fadeUp grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        {w.approval !== "approved" && <PendingBanner w={w} />}
        <div className="rounded-xl border border-line bg-card p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl font-display text-[24px] font-bold text-white" style={{ background: cat?.color }}>
              {w.name.split(" ").slice(-1)[0][0]}
            </span>
            <div>
              <h2 className="flex items-center gap-2 font-display text-[20px] font-extrabold text-ink-900">{w.name}{w.verified && <Icon name="shield" size={18} className="text-good-500" />}</h2>
              <p className="text-[13px] text-mute">{cat?.name} · {w.district} · {w.yearsExp} năm kinh nghiệm</p>
              <Badge className={cls("mt-1.5", meta.cls)}>{meta.label}{w.approval === "rejected" && w.rejectReason ? ` — ${w.rejectReason}` : ""}</Badge>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <Field label="Giới thiệu bản thân">
              <textarea rows={4} className="field-input" value={bio} onChange={(e) => setBio(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Giá khởi điểm (₫)">
                <input type="number" step={10000} className="field-input" value={priceFrom} onChange={(e) => setPriceFrom(Number(e.target.value))} />
              </Field>
              <Field label="Phản hồi trung bình">
                <div className="field-input flex items-center gap-2 bg-paper text-mute"><Icon name="clock" size={15} /> ~{w.responseMins} phút (hệ thống tự đo)</div>
              </Field>
            </div>
            <Field label="Bảng giá dịch vụ">
              <div className="space-y-2">
                {priceList.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="field-input flex-1" value={p.label} placeholder="Hạng mục" onChange={(e) => setPriceList(priceList.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)))} />
                    <input type="number" step={10000} className="field-input w-[150px]" value={p.price} onChange={(e) => setPriceList(priceList.map((x, xi) => (xi === i ? { ...x, price: Number(e.target.value) } : x)))} />
                    <button onClick={() => setPriceList(priceList.filter((_, xi) => xi !== i))} className="rounded-lg border border-line px-3 text-danger-600 transition hover:bg-danger-100" aria-label="Xóa dòng">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                ))}
                <Button variant="outline" size="sm" icon="plus" onClick={() => setPriceList([...priceList, { label: "", price: 100000 }])}>Thêm hạng mục</Button>
              </div>
            </Field>
            <Button icon="check" loading={busy} onClick={save}>Lưu thay đổi</Button>
          </div>
        </div>
      </div>
      <div className="space-y-4 self-start">
        <div className="rounded-xl border border-line bg-card p-5">
          <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Thành tích</h3>
          {[
            { i: "star" as IconName, l: "Điểm đánh giá", v: w.rating ? `${w.rating.toFixed(1)} (${w.ratingCount})` : "Chưa có" },
            { i: "briefcase" as IconName, l: "Việc đã hoàn thành", v: String(w.jobsDone) },
            { i: "shield" as IconName, l: "Xác minh danh tính", v: w.verified ? "Đã xác minh" : "Chưa" },
            { i: "tag" as IconName, l: "Danh hiệu", v: w.badges.length ? w.badges.join(", ") : "Chưa có" },
          ].map((x) => (
            <div key={x.l} className="flex items-center gap-3 border-b border-line/60 py-2.5 last:border-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-safety-600"><Icon name={x.i} size={16} /></span>
              <span className="flex-1 text-[13px] font-semibold text-mute">{x.l}</span>
              <span className="text-[13px] font-bold text-ink-900">{x.v}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-line bg-paper p-5">
          <p className="flex items-center gap-2 font-display text-[14.5px] font-bold text-ink-900"><Icon name="sparkle" size={16} className="text-safety-600" /> Hồ sơ mạnh = nhiều việc hơn</p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-mute">Thuật toán gợi ý (và AI ở giai đoạn 2) ưu tiên thợ có bảng giá đầy đủ, đánh giá cao và bật nhận việc. Giữ hồ sơ cập nhật nhé!</p>
        </div>
      </div>
    </div>
  );
}
