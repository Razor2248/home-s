/**
 * REST client (Giai đoạn 3) — nói chuyện với backend NestJS.
 * Mỗi hàm trả về ĐÚNG kiểu dữ liệu mà UI đang dùng (src/lib/types.ts),
 * kèm fetchSnapshot() lấy "ảnh chụp" dữ liệu theo vai trò để nạp vào store.
 */
import { http, TOKEN_KEY, REFRESH_KEY } from "./http";
import { pickColor } from "./format";
import type {
  Category, ChatMessage, DB, Job, Notification, Payment, Quote, Review, Role, User, WorkerProfile, WorkerRegisterInput,
} from "./types";

/* ================= mapper: server → UI ================= */
const ts = (v: string | number | null | undefined) => (v ? new Date(v).getTime() : undefined);
const low = <T extends string>(v: string) => v.toLowerCase() as T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function mapCategory(c: Any): Category {
  return { id: c.id, name: c.name, icon: c.icon ?? "wrench", color: c.color ?? "#f4581c", priceMin: c.priceMin, priceMax: c.priceMax, unit: c.unit ?? "lần" };
}

export function mapWorker(w: Any): WorkerProfile {
  return {
    id: w.id, userId: w.userId, name: w.user?.name ?? w.name ?? "Thợ",
    categoryId: w.categoryId, district: w.district, yearsExp: w.yearsExp ?? 0,
    rating: w.rating ?? 0, ratingCount: w.ratingCount ?? 0, jobsDone: w.jobsDone ?? 0,
    priceFrom: w.priceFrom ?? 0, approval: low(w.approval ?? "PENDING"), rejectReason: w.rejectReason ?? undefined,
    available: w.available ?? true, verified: w.verified ?? false, bio: w.bio ?? "",
    badges: w.badges ?? [], responseMins: w.responseMins ?? 30,
    priceList: (w.priceList ?? []).map((p: Any) => ({ label: p.label, price: p.price })),
  };
}

export function mapUser(u: Any): User {
  return {
    id: u.id, role: low<Role>(u.role), name: u.name, email: u.email, phone: u.phone ?? "",
    password: "", avatarColor: u.avatarColor ?? pickColor(u.email ?? u.id),
    blocked: u.blocked ?? false, createdAt: ts(u.createdAt) ?? Date.now(),
    favorites: (u.favorites ?? []).map((f: Any) => (typeof f === "string" ? f : f.workerId)),
  };
}

export function mapQuote(q: Any): Quote {
  return {
    id: q.id, jobId: q.jobId, workerId: q.workerId, price: q.price ?? 0, eta: q.eta ?? "",
    message: q.message ?? "", status: low(q.status ?? "SENT"), createdAt: ts(q.createdAt) ?? Date.now(),
  };
}

export function mapReview(r: Any, codeMap?: Map<string, string>): Review {
  return {
    id: r.id, jobId: codeMap?.get(r.jobId) ?? r.jobId, customerId: r.customerId, workerId: r.workerId,
    rating: r.rating, comment: r.comment, createdAt: ts(r.createdAt) ?? Date.now(),
    flagged: r.flagged ?? false, hidden: r.hidden ?? false,
  };
}

export function mapJob(j: Any, out: { quotes: Quote[]; reviews: Review[]; users: User[] }, codeMap?: Map<string, string>): Job {
  for (const q of j.quotes ?? []) out.quotes.push(mapQuote(q));
  if (j.review) out.reviews.push(mapReview(j.review, codeMap));
  if (j.customer?.id)
    out.users.push({
      id: j.customer.id, role: "customer", name: j.customer.name, email: "", phone: j.customer.phone ?? "",
      password: "", avatarColor: j.customer.avatarColor ?? pickColor(j.customer.id), createdAt: Date.now(), favorites: [],
    });
  // user của thợ — để chat & màn hình việc hiển thị đúng tên người gửi
  const wu = j.worker?.user;
  if (j.worker?.userId)
    out.users.push({
      id: j.worker.userId, role: "worker", name: wu?.name ?? j.worker.name ?? "Thợ", email: "", phone: wu?.phone ?? "",
      password: "", avatarColor: wu?.avatarColor ?? pickColor(j.worker.userId), createdAt: Date.now(), favorites: [],
    });
  return {
    id: j.id, code: j.code, customerId: j.customerId, workerId: j.workerId ?? undefined,
    title: j.title, categoryId: j.categoryId, description: j.description, district: j.district,
    address: j.address, budget: j.budget, urgency: low(j.urgency ?? "NORMAL"), status: low(j.status ?? "OPEN"),
    createdAt: ts(j.createdAt) ?? Date.now(), scheduledAt: j.scheduledAt ?? undefined,
    startedAt: ts(j.startedAt), doneAt: ts(j.doneAt), cancelReason: j.cancelReason ?? undefined,
  };
}

export function mapMessage(m: Any): ChatMessage {
  return { id: m.id, jobId: m.jobId, senderId: m.senderId, text: m.text, createdAt: ts(m.createdAt) ?? Date.now() };
}

export function mapNotif(n: Any): Notification {
  return { id: n.id, userId: n.userId, text: n.text, icon: n.icon ?? "bell", read: n.read ?? false, createdAt: ts(n.createdAt) ?? Date.now() };
}

export function mapPayment(p: Any): Payment {
  return {
    id: p.id, jobId: p.jobId, customerId: p.customerId, amount: p.amount,
    method: low(p.method ?? "vnpay_qr"), txnRef: p.txnRef ?? "", status: low(p.status ?? "PENDING"),
    createdAt: ts(p.createdAt) ?? Date.now(), paidAt: ts(p.paidAt),
  };
}

/* ================= auth ================= */
export async function login(email: string, password: string): Promise<User> {
  const r = await http.post<{ accessToken: string; refreshToken: string }>("/auth/login", { email, password });
  localStorage.setItem(TOKEN_KEY, r.accessToken);
  localStorage.setItem(REFRESH_KEY, r.refreshToken);
  const me = await http.get<Any>("/users/me");
  return mapUser(me);
}

export function logoutRemote() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function registerCustomer(d: { name: string; email: string; phone: string; password: string }): Promise<User> {
  await http.post("/auth/register/customer", d);
  return login(d.email, d.password);
}

export async function registerWorker(d: WorkerRegisterInput): Promise<User> {
  await http.post("/auth/register/worker", d);
  return login(d.email, d.password);
}

/* ================= thao tác nghiệp vụ ================= */
export const remote = {
  ping: () => http.get<Any[]>("/categories"),
  categories: () => http.get<Any[]>("/categories").then((cs) => cs.map(mapCategory)),
  notifications: () => http.get<Any[]>("/notifications?limit=30").then((ns) => ns.map(mapNotif)),
  me: () => http.get<Any>("/users/me").then(mapUser),

  workers: () => http.get<Any[]>("/workers").then((ws) => ws.map(mapWorker)),
  workerDetail: (id: string) => http.get<Any>(`/workers/${id}`).then(mapWorker),
  myWorkerProfile: () => http.get<Any>("/workers/me/profile").then(mapWorker),
  updateMyProfile: (patch: Partial<WorkerProfile>) => http.patch("/workers/me", patch),
  toggleAvailable: () => http.patch("/workers/me/available", {}),
  setFavorite: (workerId: string, fav: boolean) =>
    fav ? http.put(`/workers/${workerId}/favorite`, {}) : http.delete(`/workers/${workerId}/favorite`),
  workerReviews: (id: string) => http.get<Any[]>(`/workers/${id}/reviews`),

  createJob: (d: Any) => http.post<Any>("/jobs", d),
  myJobs: () => http.get<Any[]>("/jobs/my"),
  jobFeed: () => http.get<Any[]>("/jobs/feed?all=1"),
  myWorkerJobs: () => http.get<Any[]>("/jobs/mine"),
  adminJobs: () => http.get<Any[]>("/admin/jobs?limit=80"),
  bookDirect: (d: Any) => http.post("/jobs/book", d),
  startJob: (id: string) => http.post(`/jobs/${id}/start`, {}),
  completeJob: (id: string) => http.post(`/jobs/${id}/complete`, {}),
  cancelJob: (id: string, reason: string) => http.post(`/jobs/${id}/cancel`, { reason }),

  sendQuote: (jobId: string, d: { price: number; eta: string; message: string }) =>
    http.post(`/jobs/${jobId}/quotes`, d),
  acceptQuote: (quoteId: string) => http.post(`/quotes/${quoteId}/accept`, {}),

  reviewJob: (jobId: string, rating: number, comment: string) => http.post(`/jobs/${jobId}/review`, { rating, comment }),
  jobMessages: (jobId: string) => http.get<Any[]>(`/jobs/${jobId}/messages`).then((ms) => ms.map(mapMessage)),
  sendMessage: (jobId: string, text: string) => http.post(`/jobs/${jobId}/messages`, { text }),
  markAllRead: () => http.post("/notifications/read-all", {}),

  /* ---- thanh toán sandbox (Giai đoạn 4) ---- */
  createPayment: (jobId: string, method: string) => http.post<Any>("/payments/create", { jobId, method }).then(mapPayment),
  paymentCallback: (id: string, success: boolean) => http.post<Any>(`/payments/${id}/simulate-callback`, { success }).then(mapPayment),
  myPayments: () => http.get<Any[]>("/payments/my").then((ps) => ps.map(mapPayment)),
  workerPayments: () => http.get<Any[]>("/payments/worker").then((ps) => ps.map(mapPayment)),
  paymentByJob: (jobId: string) => http.get<Any | null>(`/payments/job/${jobId}`).then((p) => (p ? mapPayment(p) : null)),

  /* ---- tài khoản & cài đặt nền tảng ---- */
  updateAccount: (patch: { name?: string; phone?: string; avatarColor?: string }) => http.patch("/users/me", patch),
  changePassword: (current: string, next: string) => http.post("/users/me/change-password", { current, next }),
  platformFee: () => http.get<Any>("/settings/platform-fee").then((r) => Number(r?.fee ?? 10)),
  setPlatformFee: (fee: number) => http.patch("/admin/settings", { platformFee: fee }),

  approveWorker: (id: string) => http.post(`/admin/workers/${id}/approve`, {}),
  rejectWorker: (id: string, reason: string) => http.post(`/admin/workers/${id}/reject`, { reason }),
  adminWorkers: () => http.get<Any[]>("/admin/workers"),
  adminUsers: () => http.get<Any[]>("/admin/users"),
  blockUser: (id: string, blocked: boolean) => http.patch(`/admin/users/${id}/block`, { blocked }),
  addCategory: (d: Any) => http.post("/admin/categories", d),
  updateCategory: (id: string, d: Any) => http.put(`/admin/categories/${id}`, d),
  deleteCategory: (id: string) => http.delete(`/admin/categories/${id}`),
  adminReviews: () => http.get<Any[]>("/admin/reviews"),
  resolveReview: (id: string, action: "keep" | "hide") => http.post(`/admin/reviews/${id}/resolve`, { action }),
  adminPaymentStats: () => http.get<{ count: number; gross: number; platformFee: number; workerPayout: number }>("/admin/payments/stats"),
};

/* ================= snapshot theo vai trò ================= */
const dedupe = <T extends { id: string }>(xs: T[]) => {
  const m = new Map<string, T>();
  xs.forEach((x) => x && m.set(x.id, x));
  return [...m.values()];
};

/**
 * Lấy toàn bộ dữ liệu UI cần theo vai trò, trả về Partial<DB>
 * để hydrate vào store — UI giữ nguyên, chỉ đổi nguồn dữ liệu.
 */
export async function fetchSnapshot(role: Role): Promise<Partial<DB>> {
  const out = { quotes: [] as Quote[], reviews: [] as Review[], users: [] as User[], payments: [] as Payment[] };
  const [categories, notifications, me, fee] = await Promise.all([
    remote.categories(),
    remote.notifications(),
    remote.me(),
    remote.platformFee().catch(() => 10),
  ]);
  out.users.push(me);

  let workers: WorkerProfile[] = [];
  let jobs: Job[] = [];
  let chats: ChatMessage[] = [];

  if (role === "customer") {
    const [rawJobs, rawWorkers] = await Promise.all([remote.myJobs(), remote.workers()]);
    workers = rawWorkers.map(mapWorker);
    jobs = rawJobs.map((j) => mapJob(j, out));
    // đánh giá cho các thợ liên quan (yêu thích + thợ trong việc)
    const wids = [...new Set([...me.favorites, ...jobs.map((j) => j.workerId).filter(Boolean)])] as string[];
    const codeMap = new Map(jobs.map((j) => [j.id, j.code]));
    const reviewLists = await Promise.all(wids.slice(0, 10).map((id) => remote.workerReviews(id).catch(() => [])));
    reviewLists.flat().forEach((r) => out.reviews.push(mapReview(r, codeMap)));
    // chat của các việc đã có thợ
    const chatJobs = jobs.filter((j) => j.workerId);
    const msgLists = await Promise.all(chatJobs.map((j) => remote.jobMessages(j.id).catch(() => [])));
    chats = msgLists.flat();
    // thanh toán của khách (Giai đoạn 4)
    out.payments = await remote.myPayments().catch(() => []);
  } else if (role === "worker") {
    const [profile, feed, mine] = await Promise.all([
      remote.myWorkerProfile().catch(() => null),
      remote.jobFeed(),
      remote.myWorkerJobs(),
    ]);
    if (profile) workers = [profile];
    const codeMap = new Map(mine.map((j) => [j.id as string, j.code as string]));
    jobs = dedupe([...feed, ...mine].map((j) => mapJob(j, out)));
    mine.forEach((j) => j.review && out.reviews.push(mapReview(j.review, codeMap)));
    const chatJobs = mine.filter((j: Any) => j.status !== "OPEN" && j.status !== "CANCELLED");
    const msgLists = await Promise.all(chatJobs.map((j: Any) => remote.jobMessages(j.id).catch(() => [])));
    chats = msgLists.flat();
    // thanh toán cho các việc thợ được gán (Giai đoạn 4)
    out.payments = await remote.workerPayments().catch(() => []);
  } else {
    const [rawJobs, rawWorkers, rawUsers, rawReviews] = await Promise.all([
      remote.adminJobs(), remote.adminWorkers(), remote.adminUsers(), remote.adminReviews(),
    ]);
    jobs = rawJobs.map((j) => mapJob(j, out));
    workers = rawWorkers.map(mapWorker);
    const codeMap = new Map(jobs.map((j) => [j.id, j.code]));
    out.users.push(...rawUsers.map(mapUser));
    rawReviews.forEach((r) => out.reviews.push(mapReview(r, codeMap)));
  }

  return {
    categories,
    notifications,
    users: dedupe(out.users),
    workers: dedupe(workers),
    jobs: dedupe(jobs).sort((a, b) => b.createdAt - a.createdAt),
    quotes: dedupe(out.quotes),
    reviews: dedupe(out.reviews),
    chats: dedupe(chats).sort((a, b) => a.createdAt - b.createdAt),
    payments: dedupe(out.payments),
    settings: { platformFee: fee },
  };
}
