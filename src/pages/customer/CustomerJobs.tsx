import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDB, useSession } from "../../lib/store";
import { acceptQuote, cancelJob, reviewJob } from "../../lib/api";
import { cls, fmtVND, timeAgo, URGENCY } from "../../lib/format";
import { CATEGORY_ICON, FALLBACK_ICON, Icon, type IconName } from "../../components/Icons";
import { Badge, Button, EmptyState, Field, JobPill, Modal, Stars, Tabs, useToast } from "../../components/ui";
import { ChatPanel } from "../../components/Chat";
import type { Job } from "../../lib/types";

/* ================= DANH SÁCH VIỆC ================= */
export function MyJobs() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const myJobs = db.jobs.filter((j) => j.customerId === me.id).sort((a, b) => b.createdAt - a.createdAt);
  const filtered = myJobs.filter((j) =>
    tab === "all" ? true
      : tab === "open" ? j.status === "open"
        : tab === "active" ? ["assigned", "in_progress"].includes(j.status)
          : tab === "done" ? ["done", "reviewed"].includes(j.status)
            : j.status === "cancelled",
  );

  return (
    <div className="anim-fadeUp space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[24px] font-extrabold text-ink-900">Việc của tôi</h2>
          <p className="mt-0.5 text-[13.5px] text-mute">{myJobs.length} phiếu việc đã tạo</p>
        </div>
        <Button size="sm" icon="plus" onClick={() => navigate("/app/customer/post")}>Đăng việc mới</Button>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "all", label: "Tất cả", count: myJobs.length },
          { id: "open", label: "Chờ báo giá", count: myJobs.filter((j) => j.status === "open").length },
          { id: "active", label: "Đang thực hiện", count: myJobs.filter((j) => ["assigned", "in_progress"].includes(j.status)).length },
          { id: "done", label: "Hoàn thành", count: myJobs.filter((j) => ["done", "reviewed"].includes(j.status)).length },
          { id: "cancelled", label: "Đã hủy", count: myJobs.filter((j) => j.status === "cancelled").length },
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState icon="clipboard" title="Không có phiếu việc nào" desc="Đăng việc để nhận báo giá từ các thợ trong khu vực.">
          <Button size="sm" icon="plus" onClick={() => navigate("/app/customer/post")}>Đăng việc</Button>
        </EmptyState>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((j, i) => {
            const cat = db.categories.find((c) => c.id === j.categoryId);
            const quotes = db.quotes.filter((q) => q.jobId === j.id).length;
            const w = db.workers.find((x) => x.id === j.workerId);
            return (
              <button key={j.id} onClick={() => navigate(`/app/customer/jobs/${j.id}`)} className="anim-fadeUp group flex w-full items-center gap-4 rounded-xl border border-line bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-[4px_4px_0_#0b1b2e]" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${cat?.color ?? "#f4581c"}1a`, color: cat?.color ?? "#f4581c" }}>
                  <Icon name={(cat && CATEGORY_ICON[cat.id]) || FALLBACK_ICON} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-bold text-ink-900">{j.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-mute">
                    <span className="font-mono font-bold text-ink-700">{j.code}</span>
                    <span>· {j.district}</span>
                    <span>· {fmtVND(j.budget)}</span>
                    <span>· {quotes} báo giá</span>
                    {w && <span>· Thợ: {w.name}</span>}
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

/* ================= CHI TIẾT VIỆC ================= */
export function CustomerJobDetail() {
  const db = useDB();
  const me = useSession()!;
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const job = db.jobs.find((j) => j.id === id && j.customerId === me.id);
  const [busyQuote, setBusyQuote] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  if (!job) {
    return (
      <EmptyState icon="search" title="Không tìm thấy phiếu việc" desc="Việc có thể đã bị xóa hoặc không thuộc tài khoản này.">
        <Button size="sm" onClick={() => navigate("/app/customer/jobs")}>Về danh sách việc</Button>
      </EmptyState>
    );
  }

  const cat = db.categories.find((c) => c.id === job.categoryId);
  const quotes = db.quotes.filter((q) => q.jobId === job.id).sort((a, b) => (a.status === "accepted" ? -1 : 1) - (b.status === "accepted" ? -1 : 1) || a.price - b.price);
  const worker = db.workers.find((w) => w.id === job.workerId);
  const workerUser = worker ? db.users.find((u) => u.id === worker.userId) : undefined;
  const myReview = db.reviews.find((r) => r.jobId === job.code && r.customerId === me.id);
  const cancellable = ["open", "assigned"].includes(job.status);

  const doAccept = async (quoteId: string) => {
    setBusyQuote(quoteId);
    try {
      await acceptQuote(quoteId);
      push("Đã chốt thợ! Hai bên có thể nhắn tin trao đổi ngay.");
    } finally {
      setBusyQuote(null);
    }
  };
  const doCancel = async () => {
    setBusy(true);
    await cancelJob(job.id, cancelReason.trim());
    setBusy(false);
    setCancelOpen(false);
    push("Đã hủy phiếu việc.");
  };
  const doReview = async () => {
    if (comment.trim().length < 5) { push("Viết vài dòng nhận xét nhé (tối thiểu 5 ký tự).", "err"); return; }
    setBusy(true);
    await reviewJob(job.id, me.id, rating, comment);
    setBusy(false);
    setReviewOpen(false);
    push("Cảm ơn bạn! Đánh giá đã được ghi nhận.");
  };

  return (
    <div className="anim-fadeUp space-y-5">
      <button onClick={() => navigate("/app/customer/jobs")} className="flex items-center gap-1.5 text-[13.5px] font-bold text-mute transition hover:text-safety-600">
        <Icon name="chevR" size={15} className="rotate-180" /> Về danh sách việc
      </button>

      {/* header */}
      <div className="rounded-xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-ink-900 px-2.5 py-1 font-mono text-[12px] font-bold text-paper">{job.code}</span>
          <JobPill status={job.status} />
          <Badge className={URGENCY[job.urgency].cls}>{URGENCY[job.urgency].label}</Badge>
          <span className="ml-auto text-[12.5px] text-mute">Đăng {timeAgo(job.createdAt)}</span>
        </div>
        <h2 className="mt-3 font-display text-[22px] font-extrabold leading-tight text-ink-900">{job.title}</h2>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13.5px] text-mute">
          <span className="flex items-center gap-1.5"><Icon name={(cat && CATEGORY_ICON[cat.id]) || FALLBACK_ICON} size={15} className="text-safety-600" /> {cat?.name}</span>
          <span className="flex items-center gap-1.5"><Icon name="pin" size={15} /> {job.district} — {job.address}</span>
          <span className="flex items-center gap-1.5"><Icon name="wallet" size={15} /> Ngân sách {fmtVND(job.budget)}</span>
          {job.scheduledAt && <span className="flex items-center gap-1.5"><Icon name="calendar" size={15} /> {job.scheduledAt}</span>}
        </div>
        {cancellable && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" icon="x" onClick={() => setCancelOpen(true)} className="text-danger-600 hover:bg-danger-100">Hủy phiếu việc</Button>
          </div>
        )}
      </div>

      {job.status === "cancelled" && (
        <div className="flex items-center gap-3 rounded-xl border border-danger-600/30 bg-danger-100/60 px-5 py-4 text-[13.5px] font-semibold text-danger-600">
          <Icon name="alert" size={18} /> Phiếu việc đã hủy{job.cancelReason ? ` — lý do: ${job.cancelReason}` : ""}.
        </div>
      )}

      {/* tiến độ */}
      {job.status !== "cancelled" && <Timeline job={job} />}

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          {/* mô tả */}
          <div className="rounded-xl border border-line bg-card p-5">
            <h3 className="mb-2 font-display text-[16px] font-bold text-ink-900">Mô tả công việc</h3>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{job.description}</p>
          </div>

          {/* báo giá */}
          <div className="rounded-xl border border-line bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[16px] font-bold text-ink-900">Báo giá nhận được</h3>
              <span className="rounded-md bg-paper px-2 py-1 font-mono text-[12px] font-bold text-ink-700">{quotes.length}</span>
            </div>
            {quotes.length === 0 ? (
              <div className="dashed-frame rounded-xl px-5 py-8 text-center">
                {job.status === "open" ? (
                  <>
                    <span className="live-dot mx-auto mb-3 block h-2.5 w-2.5 rounded-full bg-safety-500" />
                    <p className="text-[14px] font-bold text-ink-900">Đang chờ thợ gửi báo giá…</p>
                    <p className="mt-1 text-[12.5px] text-mute">Thợ {cat?.name?.toLowerCase()} gần bạn đã nhận được thông báo.</p>
                  </>
                ) : (
                  <p className="text-[13px] text-mute">Không có báo giá cho phiếu này.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((q) => {
                  const w = db.workers.find((x) => x.id === q.workerId);
                  const wCat = w && db.categories.find((c) => c.id === w.categoryId);
                  return (
                    <div key={q.id} className={cls("rounded-xl border p-4 transition", q.status === "accepted" ? "border-good-500 bg-good-100/40" : "border-line bg-paper/40 hover:border-ink-900/25")}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-[15px] font-bold text-white" style={{ background: wCat?.color ?? "#f4581c" }}>
                          {w?.name.split(" ").slice(-1)[0][0] ?? "?"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-[14.5px] font-bold text-ink-900">
                            {w?.name}
                            {w?.verified && <Icon name="shield" size={14} className="text-good-500" />}
                          </p>
                          <p className="text-[12px] text-mute">★ {w?.rating.toFixed(1)} ({w?.ratingCount}) · {w?.district} · phản hồi ~{w?.responseMins}p</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-[19px] font-extrabold text-ink-900">{fmtVND(q.price)}</p>
                          <p className="text-[11px] text-mute">{timeAgo(q.createdAt)}</p>
                        </div>
                      </div>
                      <p className="mt-3 rounded-lg bg-card px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-700">
                        <span className="mr-1.5 font-bold text-safety-600">“{q.eta}”</span>{q.message}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        {q.status === "accepted" ? (
                          <Badge className="bg-good-500 text-white"><Icon name="check" size={12} /> Bạn đã chọn thợ này</Badge>
                        ) : q.status === "declined" ? (
                          <Badge className="bg-line/70 text-mute">Không được chọn</Badge>
                        ) : (
                          <Button size="sm" loading={busyQuote === q.id} icon="check" disabled={job.status !== "open"} onClick={() => doAccept(q.id)}>
                            Chọn thợ này
                          </Button>
                        )}
                        {q.status === "sent" && job.status === "open" && <span className="text-[12px] font-semibold text-mute">Tiết kiệm {fmtVND(Math.max(0, job.budget - q.price))} so với ngân sách</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* đánh giá sau hoàn thành */}
          {job.status === "done" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-good-500/60 bg-good-100/40 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-good-500 text-white"><Icon name="star" size={20} /></span>
                <div>
                  <p className="text-[14.5px] font-bold text-ink-900">Việc đã hoàn thành — nghiệm thu thôi!</p>
                  <p className="text-[12.5px] text-mute">Đánh giá của bạn giúp thợ uy tín hơn và cộng đồng chọn đúng người.</p>
                </div>
              </div>
              <Button variant="good" icon="star" onClick={() => setReviewOpen(true)}>Nghiệm thu & đánh giá</Button>
            </div>
          )}
          {myReview && (
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Đánh giá của bạn</h3>
              <div className="flex items-center gap-3"><Stars value={myReview.rating} size={16} /><span className="text-[13px] font-bold text-ink-900">{myReview.rating}/5</span></div>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-700">“{myReview.comment}”</p>
            </div>
          )}
        </div>

        {/* cột phải */}
        <div className="space-y-5 self-start">
          {worker ? (
            <div className="rounded-xl border border-line bg-card p-5">
              <h3 className="mb-3 font-display text-[16px] font-bold text-ink-900">Thợ thực hiện</h3>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-[16px] font-bold text-white" style={{ background: cat?.color }}>
                  {worker.name.split(" ").slice(-1)[0][0]}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink-900">{worker.name}{worker.verified && <Icon name="shield" size={14} className="text-good-500" />}</p>
                  <p className="text-[12px] text-mute">{cat?.name} · {worker.yearsExp} năm kinh nghiệm</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[{ v: worker.rating.toFixed(1), l: "Điểm", i: "star" as IconName }, { v: String(worker.jobsDone), l: "Việc", i: "briefcase" as IconName }, { v: `~${worker.responseMins}p`, l: "Phản hồi", i: "clock" as IconName }].map((x) => (
                  <div key={x.l} className="rounded-lg bg-paper px-1 py-2.5">
                    <p className="flex items-center justify-center gap-1 font-display text-[15px] font-extrabold text-ink-900"><Icon name={x.i} size={12} className="text-safety-600" />{x.v}</p>
                    <p className="text-[10.5px] font-semibold text-mute">{x.l}</p>
                  </div>
                ))}
              </div>
              {workerUser?.phone && (
                <p className="mt-4 flex items-center gap-2 rounded-lg bg-paper px-3.5 py-2.5 text-[13.5px] font-bold text-ink-900">
                  <Icon name="phone" size={15} className="text-good-500" /> {workerUser.phone}
                </p>
              )}
              <p className="mt-3 flex items-center gap-2 text-[12.5px] text-mute"><Icon name="wallet" size={14} /> Giá chốt: <b className="text-ink-900">{fmtVND(quotes.find((q) => q.status === "accepted")?.price ?? job.budget)}</b></p>
            </div>
          ) : (
            job.status === "open" && (
              <div className="rounded-xl border border-line bg-ink-900 bg-blueprint-dark p-5 text-paper">
                <p className="flex items-center gap-2 font-display text-[15px] font-bold"><Icon name="sparkle" size={16} className="text-safety-400" /> Mẹo nhận báo giá nhanh</p>
                <ul className="mt-3 space-y-2 text-[12.5px] text-ink-400">
                  <li>• Việc khẩn cấp được ưu tiên hiển thị.</li>
                  <li>• Ngân sách rõ ràng giúp thợ chốt nhanh.</li>
                  <li>• Trung bình 15–45 phút có báo giá đầu tiên.</li>
                </ul>
              </div>
            )
          )}

          {worker && job.status !== "cancelled" && (
            <ChatPanel job={job} currentUserId={me.id} height={340} />
          )}
        </div>
      </div>

      {/* modal hủy */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Hủy phiếu việc?" sub="Thợ đã báo giá hoặc nhận việc sẽ nhận được thông báo hủy.">
        <Field label="Lý do hủy (không bắt buộc)">
          <textarea rows={3} className="field-input" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="VD: Đã tự xử lý được…" />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCancelOpen(false)}>Giữ lại</Button>
          <Button variant="danger" loading={busy} onClick={doCancel}>Xác nhận hủy</Button>
        </div>
      </Modal>

      {/* modal đánh giá */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Nghiệm thu & đánh giá" sub={`${worker?.name} · ${job.code}`}>
        <div className="flex flex-col items-center rounded-xl bg-paper py-6">
          <p className="mb-2 text-[13.5px] font-semibold text-mute">Bạn chấm thợ mấy sao?</p>
          <Stars value={rating} onChange={setRating} size={22} />
          <p className="mt-2 font-display text-[15px] font-bold text-ink-900">{["", "Tệ", "Chưa ổn", "Ổn", "Tốt", "Tuyệt vời!"][rating]}</p>
        </div>
        <div className="mt-4">
          <Field label="Nhận xét">
            <textarea rows={4} className="field-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Thái độ, tay nghề, đúng hẹn… giúp khách hàng khác chọn đúng thợ." />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setReviewOpen(false)}>Để sau</Button>
          <Button variant="good" icon="star" loading={busy} onClick={doReview}>Gửi đánh giá</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ================= TIMELINE ================= */
const ORDER = ["open", "assigned", "in_progress", "done", "reviewed"] as const;
const STEP_LABELS = ["Đăng việc", "Thợ nhận việc", "Đang thi công", "Hoàn thành", "Đánh giá"];
const STEP_ICONS: IconName[] = ["clipboard", "check", "wrench", "home", "star"];

function Timeline({ job }: { job: Job }) {
  const idx = ORDER.indexOf(job.status as (typeof ORDER)[number]);
  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <h3 className="mb-5 font-display text-[16px] font-bold text-ink-900">Tiến độ công việc</h3>
      <div className="flex items-start">
        {STEP_LABELS.map((label, i) => {
          const done = i <= idx;
          const current = i === idx;
          return (
            <div key={label} className="relative flex flex-1 flex-col items-center">
              {i > 0 && (
                <span className={cls("absolute right-1/2 top-[19px] h-[3px] w-full rounded-full", i <= idx ? "bg-safety-500" : "bg-line")} style={{ transform: "translateY(-50%)" }} />
              )}
              <span className={cls("relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all", done ? "border-safety-500 bg-safety-500 text-white" : "border-line bg-card text-mute", current && "live-dot")}>
                <Icon name={done ? STEP_ICONS[i] : "clock"} size={17} />
              </span>
              <p className={cls("mt-2 px-1 text-center text-[11px] font-bold leading-tight", done ? "text-ink-900" : "text-mute")}>{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
