/**
 * Lớp dịch vụ (Giai đoạn 3) — mỗi hàm tự định tuyến:
 *   chế độ "api"  → gọi backend NestJS (src/lib/remote.ts) rồi đồng bộ store
 *   chế độ "mock" → thao tác trực tiếp localStorage (demo không cần server)
 * UI gọi đúng các hàm này, KHÔNG cần biết dữ liệu đến từ đâu.
 */
import { getDB, getSessionId, hydrateDB, mutate, resetDemo, setSession } from "./store";
import { uid, pickColor } from "./format";
import { isApiMode, setApiStatus } from "./config";
import {
  fetchSnapshot, login as remoteLogin, logoutRemote, mapJob, remote,
  registerCustomer as remoteRegisterCustomer, registerWorker as remoteRegisterWorker,
} from "./remote";
import type {
  BookInput, Category, CategoryChange, CreateJobInput, DB, Job, Payment, PaymentMethod, Quote, Role, User, WorkerProfile, WorkerRegisterInput,
} from "./types";

const delay = (ms = 380) => new Promise((r) => setTimeout(r, ms));

function pushNotif(d: { users: User[]; notifications: import("./types").Notification[] }, userId: string, text: string, icon: string) {
  d.notifications = [
    { id: uid("n"), userId, text, icon, read: false, createdAt: Date.now() },
    ...d.notifications,
  ];
}

/* ================= ĐỒNG BỘ SERVER → STORE ================= */
export async function syncFromServer(silent = true): Promise<void> {
  if (!isApiMode() || !getSessionId()) return;
  setApiStatus("syncing");
  try {
    const local = getDB().users.find((u) => u.id === getSessionId());
    let role: Role | undefined = local?.role;
    if (!role) role = (await remote.me()).role;
    const snap = await fetchSnapshot(role);
    hydrateDB(snap);
    setApiStatus("ok");
  } catch (e) {
    setApiStatus("error", e instanceof Error ? e.message : "Không đồng bộ được với máy chủ.");
    if (!silent) throw e;
  }
}

const after = () => syncFromServer(true);

/* ================= AUTH ================= */
export async function login(email: string, password: string): Promise<User> {
  if (isApiMode()) {
    const u = await remoteLogin(email, password);
    setSession(u.id);
    await syncFromServer(false);
    return u;
  }
  await delay();
  const u = getDB().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) throw new Error("Email không tồn tại trong hệ thống.");
  if (u.password !== password) throw new Error("Mật khẩu không đúng. Thử lại nhé.");
  if (u.blocked) throw new Error("Tài khoản đã bị khóa. Liên hệ quản trị viên.");
  setSession(u.id);
  return u;
}

export function logout() {
  if (isApiMode()) logoutRemote();
  setSession(null);
}

export async function registerCustomer(d: { name: string; email: string; phone: string; password: string }): Promise<User> {
  if (isApiMode()) {
    const u = await remoteRegisterCustomer(d);
    setSession(u.id);
    await syncFromServer(false);
    return u;
  }
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
  if (isApiMode()) {
    const u = await remoteRegisterWorker(d);
    setSession(u.id);
    await syncFromServer(false);
    return u;
  }
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
  if (isApiMode()) {
    await remote.toggleAvailable();
    return after();
  }
  await delay(250);
  mutate((db) => {
    db.workers = db.workers.map((w) => (w.id === workerId ? { ...w, available: !w.available } : w));
  });
}

export async function updateWorkerProfile(workerId: string, patch: Partial<WorkerProfile>) {
  if (isApiMode()) {
    await remote.updateMyProfile(patch);
    return after();
  }
  await delay(300);
  mutate((db) => {
    db.workers = db.workers.map((w) => (w.id === workerId ? { ...w, ...patch } : w));
  });
}

export async function toggleFavorite(userId: string, workerId: string) {
  if (isApiMode()) {
    const has = getDB().users.find((u) => u.id === userId)?.favorites.includes(workerId) ?? false;
    await remote.setFavorite(workerId, !has);
    return after();
  }
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
  if (isApiMode()) {
    await remote.approveWorker(workerId);
    return after();
  }
  await delay(300);
  mutate((db) => {
    const w = db.workers.find((x) => x.id === workerId);
    db.workers = db.workers.map((x) => (x.id === workerId ? { ...x, approval: "approved", rejectReason: undefined } : x));
    if (w) pushNotif(db, w.userId, "Hồ sơ của bạn đã được duyệt. Bắt đầu nhận việc ngay!", "check");
  });
}

export async function rejectWorker(workerId: string, reason: string) {
  if (isApiMode()) {
    await remote.rejectWorker(workerId, reason);
    return after();
  }
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
  if (isApiMode()) {
    const raw = await remote.createJob({ ...input, urgency: input.urgency.toUpperCase() });
    const job = mapJob(raw, { quotes: [], reviews: [], users: [] });
    await after();
    return job;
  }
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
  if (isApiMode()) {
    const raw = await remote.bookDirect({
      workerId: input.workerId, categoryId: input.categoryId, district: input.district,
      address: input.address, scheduledAt: input.scheduledAt, note: input.note, budget: input.budget,
    });
    const job = mapJob(raw, { quotes: [], reviews: [], users: [] });
    await after();
    return job;
  }
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
  if (isApiMode()) {
    await remote.sendQuote(jobId, d);
    await after();
    return { id: "server", jobId, workerId, ...d, status: "sent", createdAt: Date.now() };
  }
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
  if (isApiMode()) {
    await remote.acceptQuote(quoteId);
    return after();
  }
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
  if (isApiMode()) {
    await remote.startJob(jobId);
    return after();
  }
  await delay(300);
  mutate((db) => {
    db.jobs = db.jobs.map((j) => (j.id === jobId ? { ...j, status: "in_progress", startedAt: Date.now() } : j));
    const job = db.jobs.find((j) => j.id === jobId);
    if (job) pushNotif(db, job.customerId, `Thợ đã bắt đầu thi công việc ${job.code}`, "wrench");
  });
}

export async function completeJob(jobId: string) {
  if (isApiMode()) {
    await remote.completeJob(jobId);
    return after();
  }
  await delay(300);
  mutate((db) => {
    db.jobs = db.jobs.map((j) => (j.id === jobId ? { ...j, status: "done", doneAt: Date.now() } : j));
    const job = db.jobs.find((j) => j.id === jobId);
    if (job) pushNotif(db, job.customerId, `Việc ${job.code} đã hoàn thành — hãy nghiệm thu và đánh giá nhé!`, "star");
  });
}

export async function cancelJob(jobId: string, reason: string) {
  if (isApiMode()) {
    await remote.cancelJob(jobId, reason);
    return after();
  }
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
  if (isApiMode()) {
    await remote.reviewJob(jobId, rating, comment);
    return after();
  }
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
  if (isApiMode()) {
    await remote.sendMessage(jobId, text);
    return after();
  }
  await delay(180);
  mutate((db) => {
    db.chats = [...db.chats, { id: uid("m"), jobId, senderId, text: text.trim(), createdAt: Date.now() }];
  });
}

export function markAllRead(userId: string) {
  if (isApiMode()) {
    // optimistic: cập nhật ngay trên store, rồi đẩy lên server
    mutate((db) => {
      db.notifications = db.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    });
    remote.markAllRead().then(() => syncFromServer(true)).catch(() => {});
    return;
  }
  mutate((db) => {
    db.notifications = db.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  });
}

/* ================= ADMIN ================= */
export async function blockUser(userId: string, blocked: boolean) {
  if (isApiMode()) {
    await remote.blockUser(userId, blocked);
    return after();
  }
  await delay(300);
  mutate((db) => {
    db.users = db.users.map((u) => (u.id === userId ? { ...u, blocked } : u));
  });
}

export async function addCategory(d: { name: string; icon: string; color: string; priceMin: number; priceMax: number; unit: string }) {
  if (isApiMode()) {
    await remote.addCategory(d);
    return after();
  }
  await delay(300);
  mutate((db) => {
    db.categories = [...db.categories, { id: uid("c"), ...d } as Category];
  });
}

export async function updateCategory(id: string, patch: Partial<Category>) {
  if (isApiMode()) {
    await remote.updateCategory(id, patch);
    return after();
  }
  await delay(250);
  mutate((db) => {
    db.categories = db.categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
  });
}

export async function deleteCategory(id: string) {
  if (isApiMode()) {
    await remote.deleteCategory(id);
    return after();
  }
  await delay(250);
  const db = getDB();
  const used = db.workers.some((w) => w.categoryId === id) || db.jobs.some((j) => j.categoryId === id);
  if (used) throw new Error("Danh mục đang có thợ hoặc công việc — không thể xóa.");
  mutate((d) => {
    d.categories = d.categories.filter((c) => c.id !== id);
  });
}

export async function resolveReview(reviewId: string, action: "keep" | "hide") {
  if (isApiMode()) {
    await remote.resolveReview(reviewId, action);
    return after();
  }
  await delay(250);
  mutate((db) => {
    db.reviews = db.reviews.map((r) => (r.id === reviewId ? { ...r, flagged: false, hidden: action === "hide" } : r));
  });
}

/* ================= THANH TOÁN SANDBOX (Giai đoạn 4) ================= */

/**
 * Thanh toán cho một việc (mô phỏng VNPay).
 *  - api : tạo giao dịch PENDING → giả lập callback thành công → đồng bộ store
 *  - mock: tạo giao dịch local, báo thông báo cho khách & thợ
 */
export async function payForJob(jobId: string, method: PaymentMethod): Promise<Payment> {
  if (isApiMode()) {
    const created = await remote.createPayment(jobId, method);
    // Sandbox: giả lập người dùng đã trả tiền ở cổng VNPay → bắn IPN callback
    const done = await remote.paymentCallback(created.id, true);
    await after();
    return done;
  }
  await delay(1100);
  const job = getDB().jobs.find((j) => j.id === jobId);
  if (!job) throw new Error("Không tìm thấy công việc.");
  const amount = getDB().quotes.find((q) => q.jobId === jobId && q.status === "accepted")?.price ?? job.budget;
  const payment: Payment = {
    id: uid("pay"), jobId, customerId: job.customerId, amount, method,
    txnRef: `${job.code}-${Date.now().toString().slice(-7)}`, status: "success",
    createdAt: Date.now(), paidAt: Date.now(),
  };
  mutate((db) => {
    db.payments = [payment, ...db.payments.filter((p) => p.jobId !== jobId)];
    pushNotif(db, job.customerId, `Thanh toán ${amount.toLocaleString("vi-VN")}₫ cho ${job.code} thành công (mã ${payment.txnRef})`, "wallet");
    if (job.workerId) {
      const w = db.workers.find((x) => x.id === job.workerId);
      if (w) pushNotif(db, w.userId, `Khách đã thanh toán ${amount.toLocaleString("vi-VN")}₫ cho việc ${job.code}`, "wallet");
    }
  });
  return payment;
}

/** Trạng thái thanh toán của một việc — dùng chung cả 2 chế độ */
export async function paymentForJob(jobId: string): Promise<Payment | null> {
  if (isApiMode()) return remote.paymentByJob(jobId).catch(() => null);
  const list = getDB().payments.filter((p) => p.jobId === jobId);
  return list.find((p) => p.status === "success") ?? list[0] ?? null;
}

/* ================= TÀI KHOẢN & CÀI ĐẶT NỀN TẢNG ================= */

/** Phí nền tảng (%) — đọc đồng bộ từ store (cả 2 chế độ) */
/** Tách một khoản tiền thành: phí nền tảng + phần thực nhận của thợ */
export function getFeeBreakdown(amount: number): { rate: number; fee: number; net: number } {
  const rate = getPlatformFee();
  const fee = Math.round((amount * rate) / 100);
  return { rate, fee, net: amount - fee };
}

export function getPlatformFee(): number {
  const f = getDB().settings?.platformFee;
  return typeof f === "number" && f >= 0 ? f : 10;
}

/** Admin cập nhật phí nền tảng */
export async function setPlatformFee(fee: number) {
  if (fee < 0 || fee > 50) throw new Error("Phí phải nằm trong khoảng 0–50%.");
  if (isApiMode()) {
    await remote.setPlatformFee(fee);
    return after();
  }
  await delay(300);
  mutate((db) => {
    db.settings = { platformFee: fee };
  });
}

/** Cập nhật thông tin tài khoản (tên, SĐT, màu avatar) */
export async function updateAccount(userId: string, patch: { name?: string; phone?: string; avatarColor?: string }) {
  if (patch.name !== undefined && patch.name.trim().length < 2) throw new Error("Tên hiển thị tối thiểu 2 ký tự.");
  if (isApiMode()) {
    await remote.updateAccount({
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.avatarColor !== undefined ? { avatarColor: patch.avatarColor } : {}),
    });
    return after();
  }
  await delay(320);
  const newName = patch.name !== undefined ? patch.name.trim() : undefined;
  mutate((db) => {
    db.users = db.users.map((u) =>
      u.id === userId
        ? {
            ...u,
            ...(newName !== undefined ? { name: newName } : {}),
            ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
            ...(patch.avatarColor !== undefined ? { avatarColor: patch.avatarColor } : {}),
          }
        : u,
    );
    // đồng bộ tên hiển thị trên hồ sơ thợ (chế độ demo)
    if (newName !== undefined) {
      db.workers = db.workers.map((w) => (w.userId === userId ? { ...w, name: newName } : w));
    }
  });
}

/** Đổi mật khẩu — yêu cầu mật khẩu hiện tại đúng */
export async function changePassword(userId: string, current: string, next: string) {
  if (!current) throw new Error("Nhập mật khẩu hiện tại.");
  if (next.length < 6) throw new Error("Mật khẩu mới tối thiểu 6 ký tự.");
  if (isApiMode()) {
    await remote.changePassword(current, next);
    return;
  }
  await delay(380);
  const u = getDB().users.find((x) => x.id === userId);
  if (!u) throw new Error("Không tìm thấy người dùng.");
  if (u.password !== current) throw new Error("Mật khẩu hiện tại không đúng.");
  mutate((db) => {
    db.users = db.users.map((x) => (x.id === userId ? { ...x, password: next } : x));
  });
}

/* ================= ĐỔI DANH MỤC NGHỀ (cần admin duyệt) ================= */
export async function requestCategoryChange(workerId: string, toCategoryId: string, note: string) {
  if (isApiMode()) {
    await remote.requestCategoryChange(toCategoryId, note);
    return after();
  }
  await delay(300);
  if (getDB().categoryChanges.some((c) => c.workerId === workerId && c.status === "pending"))
    throw new Error("Bạn đã có một yêu cầu đang chờ duyệt.");
  const w = getDB().workers.find((x) => x.id === workerId);
  if (!w) throw new Error("Không tìm thấy hồ sơ thợ.");
  const req: CategoryChange = {
    id: uid("ccr"), workerId, workerName: w.name, fromCategoryId: w.categoryId,
    toCategoryId, note: note.trim(), status: "pending", createdAt: Date.now(),
  };
  mutate((db) => {
    db.categoryChanges = [req, ...db.categoryChanges];
    pushNotif(db, "u-admin", `${w.name} yêu cầu đổi danh mục nghề`, "tag");
  });
}

export async function approveCategoryChange(id: string) {
  if (isApiMode()) {
    await remote.approveCategoryChange(id);
    return after();
  }
  await delay(300);
  mutate((db) => {
    const r = db.categoryChanges.find((c) => c.id === id);
    if (!r) return;
    db.categoryChanges = db.categoryChanges.map((c) => (c.id === id ? { ...c, status: "approved", rejectReason: undefined } : c));
    db.workers = db.workers.map((w) => (w.id === r.workerId ? { ...w, categoryId: r.toCategoryId } : w));
    const w = db.workers.find((x) => x.id === r.workerId);
    if (w) pushNotif(db, w.userId, "Yêu cầu đổi danh mục đã được duyệt — sàn việc của bạn đã cập nhật!", "check");
  });
}

export async function rejectCategoryChange(id: string, reason: string) {
  if (isApiMode()) {
    await remote.rejectCategoryChange(id, reason);
    return after();
  }
  await delay(300);
  mutate((db) => {
    const r = db.categoryChanges.find((c) => c.id === id);
    db.categoryChanges = db.categoryChanges.map((c) => (c.id === id ? { ...c, status: "rejected", rejectReason: reason } : c));
    if (r) {
      const w = db.workers.find((x) => x.id === r.workerId);
      if (w) pushNotif(db, w.userId, `Yêu cầu đổi danh mục bị từ chối: ${reason}`, "x");
    }
  });
}

/* ================= QUÊN MẬT KHẨU (OTP sandbox) ================= */
export async function requestPasswordReset(email: string): Promise<{ code: string }> {
  if (isApiMode()) return remote.requestPasswordReset(email);
  await delay(500);
  const u = getDB().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) throw new Error("Email không tồn tại trong hệ thống.");
  if (u.blocked) throw new Error("Tài khoản đã bị khóa. Liên hệ quản trị viên.");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  mutate((db) => {
    db.passwordResets = [
      { id: uid("pr"), email: u.email, code, expiresAt: Date.now() + 10 * 60_000, used: false },
      ...db.passwordResets,
    ];
  });
  return { code };
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  if (isApiMode()) {
    await remote.resetPassword(email, code, newPassword);
    return;
  }
  await delay(500);
  const db = getDB();
  const norm = email.trim().toLowerCase();
  const u = db.users.find((x) => x.email.toLowerCase() === norm);
  if (!u) throw new Error("Email không tồn tại trong hệ thống.");
  const r = db.passwordResets.find((x) => x.email.toLowerCase() === norm && !x.used && x.expiresAt > Date.now());
  if (!r) throw new Error("Mã chưa được gửi hoặc đã hết hạn (10 phút). Hãy yêu cầu mã mới.");
  if (r.code !== code.trim()) throw new Error("Mã xác thực không đúng.");
  mutate((d) => {
    d.passwordResets = d.passwordResets.map((x) => (x.id === r.id ? { ...x, used: true } : x));
    d.users = d.users.map((x) => (x.id === u.id ? { ...x, password: newPassword } : x));
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

/* tái xuất để nơi khác dùng khi cần kiểu DB */
export type { DB };
