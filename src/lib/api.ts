import { getDB, mutate, resetDemo, setSession } from "./store";
import { uid, pickColor } from "./format";
import type {
  BookInput, Category, CreateJobInput, Job, Quote, User, WorkerProfile, WorkerRegisterInput,
} from "./types";

const delay = (ms = 380) => new Promise((r) => setTimeout(r, ms));

function pushNotif(d: { users: User[]; notifications: import("./types").Notification[] }, userId: string, text: string, icon: string) {
  d.notifications = [
    { id: uid("n"), userId, text, icon, read: false, createdAt: Date.now() },
    ...d.notifications,
  ];
}

/* ================= AUTH ================= */
export async function login(email: string, password: string): Promise<User> {
  await delay();
  const u = getDB().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) throw new Error("Email không tồn tại trong hệ thống.");
  if (u.password !== password) throw new Error("Mật khẩu không đúng. Thử lại nhé.");
  if (u.blocked) throw new Error("Tài khoản đã bị khóa. Liên hệ quản trị viên.");
  setSession(u.id);
  return u;
}

export function logout() {
  setSession(null);
}

export async function registerCustomer(d: { name: string; email: string; phone: string; password: string }): Promise<User> {
  await delay();
  if (getDB().users.some((u) => u.email.toLowerCase() === d.email.trim().toLowerCase()))
    throw new Error("Email đã được sử dụng.");
  const user: User = {
    id: uid("u"), role: "customer", name: d.name.trim(), email: d.email.trim(), phone: d.phone,
    password: d.password, avatarColor: pickColor(d.name + d.email), createdAt: Date.now(), favorites: [],
  };
  mutate((db) => {
    db.users = [...db.users, user];
  });
  setSession(user.id);
  return user;
}

export async function registerWorker(d: WorkerRegisterInput): Promise<User> {
  await delay();
  if (getDB().users.some((u) => u.email.toLowerCase() === d.email.trim().toLowerCase()))
    throw new Error("Email đã được sử dụng.");
  const user: User = {
    id: uid("u"), role: "worker", name: d.name.trim(), email: d.email.trim(), phone: d.phone,
    password: d.password, avatarColor: pickColor(d.name + d.email), createdAt: Date.now(), favorites: [],
  };
  const worker: WorkerProfile = {
    id: uid("w"), userId: user.id, name: user.name, categoryId: d.categoryId, district: d.district,
    yearsExp: d.yearsExp, rating: 0, ratingCount: 0, jobsDone: 0, priceFrom: d.priceFrom,
    approval: "pending", available: true, verified: false, bio: d.bio || "Thợ mới trên Home Services.",
    badges: [], responseMins: 30,
    priceList: [{ label: "Khảo sát & báo giá", price: d.priceFrom }],
  };
  mutate((db) => {
    db.users = [...db.users, user];
    db.workers = [...db.workers, worker];
    pushNotif(db, "u-admin", `Hồ sơ thợ mới: ${user.name} đang chờ duyệt`, "shield");
  });
  setSession(user.id);
  return user;
}

/* ================= WORKERS ================= */
export async function toggleAvailable(workerId: string) {
  await delay(250);
  mutate((db) => {
    db.workers = db.workers.map((w) => (w.id === workerId ? { ...w, available: !w.available } : w));
  });
}

export async function updateWorkerProfile(workerId: string, patch: Partial<WorkerProfile>) {
  await delay(300);
  mutate((db) => {
    db.workers = db.workers.map((w) => (w.id === workerId ? { ...w, ...patch } : w));
  });
}

export async function toggleFavorite(userId: string, workerId: string) {
  await delay(200);
  mutate((db) => {
    db.users = db.users.map((u) => {
      if (u.id !== userId) return u;
      const has = u.favorites.includes(workerId);
      return { ...u, favorites: has ? u.favorites.filter((f) => f !== workerId) : [...u.favorites, workerId] };
    });
  });
}

export async function approveWorker(workerId: string) {
  await delay(300);
  mutate((db) => {
    const w = db.workers.find((x) => x.id === workerId);
    db.workers = db.workers.map((x) => (x.id === workerId ? { ...x, approval: "approved", rejectReason: undefined } : x));
    if (w) pushNotif(db, w.userId, "Hồ sơ của bạn đã được duyệt. Bắt đầu nhận việc ngay!", "check");
  });
}

export async function rejectWorker(workerId: string, reason: string) {
  await delay(300);
  mutate((db) => {
    const w = db.workers.find((x) => x.id === workerId);
    db.workers = db.workers.map((x) => (x.id === workerId ? { ...x, approval: "rejected", rejectReason: reason } : x));
    if (w) pushNotif(db, w.userId, `Hồ sơ bị từ chối: ${reason}`, "x");
  });
}

/* ================= JOBS ================= */
function nextCode(db: { seq: number }) {
  const code = `HS-${db.seq}`;
  db.seq = db.seq + 1;
  return code;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  await delay();
  const job: Job = {
    id: uid("j"), code: nextCode(getDB()), customerId: input.customerId, title: input.title.trim(),
    categoryId: input.categoryId, description: input.description.trim(), district: input.district,
    address: input.address.trim(), budget: input.budget, urgency: input.urgency, status: "open",
    createdAt: Date.now(), scheduledAt: input.scheduledAt,
  };
  mutate((db) => {
    db.jobs = [job, ...db.jobs];
    db.workers
      .filter((w) => w.categoryId === job.categoryId && w.approval === "approved" && w.available)
      .forEach((w) => pushNotif(db, w.userId, `Việc mới phù hợp: ${job.title} (${job.code}) tại ${job.district}`, "briefcase"));
  });
  return job;
}

export async function bookDirect(input: BookInput): Promise<Job> {
  await delay();
  const w = getDB().workers.find((x) => x.id === input.workerId);
  const job: Job = {
    id: uid("j"), code: nextCode(getDB()), customerId: input.customerId, workerId: input.workerId,
    title: w ? `Đặt lịch với ${w.name}` : "Đặt lịch thợ", categoryId: input.categoryId,
    description: input.note.trim() || "Khách đặt lịch trực tiếp từ hồ sơ thợ.", district: input.district,
    address: input.address.trim(), budget: input.budget, urgency: "normal", status: "assigned",
    createdAt: Date.now(), scheduledAt: input.scheduledAt,
  };
  const quote: Quote = {
    id: uid("q"), jobId: job.id, workerId: input.workerId, price: input.budget, eta: input.scheduledAt,
    message: "Đặt lịch trực tiếp từ hồ sơ.", status: "accepted", createdAt: Date.now(),
  };
  mutate((db) => {
    db.jobs = [job, ...db.jobs];
    db.quotes = [quote, ...db.quotes];
    if (w) pushNotif(db, w.userId, `Khách vừa đặt lịch với bạn (${job.code}) — ${input.scheduledAt}`, "calendar");
  });
  return job;
}

export async function sendQuote(jobId: string, workerId: string, d: { price: number; eta: string; message: string }): Promise<Quote> {
  await delay();
  if (getDB().quotes.some((q) => q.jobId === jobId && q.workerId === workerId && q.status !== "declined"))
    throw new Error("Bạn đã gửi báo giá cho việc này rồi.");
  const quote: Quote = { id: uid("q"), jobId, workerId, ...d, status: "sent", createdAt: Date.now() };
  mutate((db) => {
    db.quotes = [quote, ...db.quotes];
    const job = db.jobs.find((j) => j.id === jobId);
    const w = db.workers.find((x) => x.id === workerId);
    if (job) pushNotif(db, job.customerId, `${w?.name ?? "Thợ"} vừa gửi báo giá ${d.price.toLocaleString("vi-VN")}₫ cho ${job.code}`, "wallet");
  });
  return quote;
}

export async function acceptQuote(quoteId: string) {
  await delay();
  mutate((db) => {
    const q = db.quotes.find((x) => x.id === quoteId);
    if (!q) return;
    db.quotes = db.quotes.map((x) => {
      if (x.id === quoteId) return { ...x, status: "accepted" };
      if (x.jobId === q.jobId && x.status === "sent") return { ...x, status: "declined" };
      return x;
    });
    db.jobs = db.jobs.map((j) => (j.id === q.jobId ? { ...j, workerId: q.workerId, status: "assigned" } : j));
    const job = db.jobs.find((j) => j.id === q.jobId);
    const w = db.workers.find((x) => x.id === q.workerId);
    if (job) pushNotif(db, q.workerId, `Chúc mừng! Bạn được chọn cho việc ${job.code}. Hãy liên hệ khách hàng nhé.`, "check");
    if (job && w) pushNotif(db, job.customerId, `Đã chốt ${w.name} cho ${job.code} với giá ${q.price.toLocaleString("vi-VN")}₫`, "check");
  });
}

export async function startJob(jobId: string) {
  await delay(300);
  mutate((db) => {
    db.jobs = db.jobs.map((j) => (j.id === jobId ? { ...j, status: "in_progress", startedAt: Date.now() } : j));
    const job = db.jobs.find((j) => j.id === jobId);
    if (job) pushNotif(db, job.customerId, `Thợ đã bắt đầu thi công việc ${job.code}`, "wrench");
  });
}

export async function completeJob(jobId: string) {
  await delay(300);
  mutate((db) => {
    db.jobs = db.jobs.map((j) => (j.id === jobId ? { ...j, status: "done", doneAt: Date.now() } : j));
    const job = db.jobs.find((j) => j.id === jobId);
    if (job) pushNotif(db, job.customerId, `Việc ${job.code} đã hoàn thành — hãy nghiệm thu và đánh giá nhé!`, "star");
  });
}

export async function cancelJob(jobId: string, reason: string) {
  await delay(300);
  mutate((db) => {
    db.jobs = db.jobs.map((j) => (j.id === jobId ? { ...j, status: "cancelled", cancelReason: reason || "Khách hàng chủ động hủy" } : j));
    const job = db.jobs.find((j) => j.id === jobId);
    if (job?.workerId) {
      const w = db.workers.find((x) => x.id === job.workerId);
      if (w) pushNotif(db, w.userId, `Việc ${job.code} đã bị khách hủy: ${reason}`, "x");
    }
  });
}

export async function reviewJob(jobId: string, customerId: string, rating: number, comment: string) {
  await delay();
  mutate((db) => {
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job?.workerId) return;
    db.reviews = [
      { id: uid("r"), jobId: job.code, customerId, workerId: job.workerId, rating, comment: comment.trim(), createdAt: Date.now() },
      ...db.reviews,
    ];
    db.jobs = db.jobs.map((j) => (j.id === jobId ? { ...j, status: "reviewed" } : j));
    db.workers = db.workers.map((w) => {
      if (w.id !== job.workerId) return w;
      const newCount = w.ratingCount + 1;
      const newRating = Math.round(((w.rating * w.ratingCount + rating) / newCount) * 10) / 10;
      return { ...w, rating: newRating, ratingCount: newCount, jobsDone: w.jobsDone + 1 };
    });
    pushNotif(db, job.workerId, `Bạn vừa nhận đánh giá ${rating}★ cho việc ${job.code}`, "star");
  });
}

/* ================= CHAT & NOTIFICATIONS ================= */
export async function sendChat(jobId: string, senderId: string, text: string) {
  await delay(180);
  mutate((db) => {
    db.chats = [...db.chats, { id: uid("m"), jobId, senderId, text: text.trim(), createdAt: Date.now() }];
  });
}

export function markAllRead(userId: string) {
  mutate((db) => {
    db.notifications = db.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  });
}

/* ================= ADMIN ================= */
export async function blockUser(userId: string, blocked: boolean) {
  await delay(300);
  mutate((db) => {
    db.users = db.users.map((u) => (u.id === userId ? { ...u, blocked } : u));
  });
}

export async function addCategory(d: { name: string; icon: string; color: string; priceMin: number; priceMax: number; unit: string }) {
  await delay(300);
  mutate((db) => {
    db.categories = [...db.categories, { id: uid("c"), ...d } as Category];
  });
}

export async function updateCategory(id: string, patch: Partial<Category>) {
  await delay(250);
  mutate((db) => {
    db.categories = db.categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
  });
}

export async function deleteCategory(id: string) {
  await delay(250);
  const db = getDB();
  const used = db.workers.some((w) => w.categoryId === id) || db.jobs.some((j) => j.categoryId === id);
  if (used) throw new Error("Danh mục đang có thợ hoặc công việc — không thể xóa.");
  mutate((d) => {
    d.categories = d.categories.filter((c) => c.id !== id);
  });
}

export async function resolveReview(reviewId: string, action: "keep" | "hide") {
  await delay(250);
  mutate((db) => {
    db.reviews = db.reviews.map((r) => (r.id === reviewId ? { ...r, flagged: false, hidden: action === "hide" } : r));
  });
}

/* ================= "AI" HELPERS (rule-based, sẵn sàng nâng cấp LLM) ================= */
export function matchScore(w: WorkerProfile, ctx: { categoryId?: string; district?: string } = {}): number {
  let s = 50;
  if (ctx.categoryId) s += w.categoryId === ctx.categoryId ? 26 : -32;
  if (ctx.district) s += w.district === ctx.district ? 14 : 0;
  s += Math.min(Math.round(w.rating * 4), 20);
  s += Math.min(Math.round(w.jobsDone / 25), 8);
  if (w.available) s += 4;
  return Math.max(5, Math.min(98, s));
}

export function estimateForCategory(categoryId: string): { min: number; max: number } | null {
  const c = getDB().categories.find((x) => x.id === categoryId);
  if (!c) return null;
  return { min: c.priceMin, max: c.priceMax };
}

export function resetAll() {
  resetDemo();
}
