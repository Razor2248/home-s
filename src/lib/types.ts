export type Role = "customer" | "worker" | "admin";
export type JobStatus = "open" | "assigned" | "in_progress" | "done" | "reviewed" | "cancelled";
export type QuoteStatus = "sent" | "accepted" | "declined";
export type Approval = "pending" | "approved" | "rejected";
export type Urgency = "normal" | "urgent";
export type PaymentStatus = "pending" | "success" | "failed";
export type PaymentMethod = "vnpay_qr" | "vnpay_card" | "cod";

export interface Payment {
  id: string;
  jobId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  txnRef: string;
  status: PaymentStatus;
  createdAt: number;
  paidAt?: number;
}

/** Yêu cầu đổi danh mục nghề của thợ — cần admin phê duyệt */
export interface CategoryChange {
  id: string;
  workerId: string;
  workerName: string;
  fromCategoryId: string;
  toCategoryId: string;
  note: string;
  status: Approval;
  rejectReason?: string;
  createdAt: number;
}

/** Mã đặt lại mật khẩu (OTP sandbox) */
export interface PasswordReset {
  id: string;
  email: string;
  code: string;
  expiresAt: number;
  used: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // icon key
  color: string; // hex accent
  priceMin: number;
  priceMax: number;
  unit: string;
  active?: boolean; // admin tắt → ẩn khỏi đăng ký thợ / đăng việc (mặc định bật)
}

export interface District {
  id: string;
  name: string; // tên hiển thị — được lưu vào job.district / worker.district
  active: boolean;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatarColor: string;
  blocked?: boolean;
  createdAt: number;
  favorites: string[]; // worker ids
}

export interface PriceItem {
  label: string;
  price: number;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  name: string;
  categoryId: string;
  district: string;
  yearsExp: number;
  rating: number;
  ratingCount: number;
  jobsDone: number;
  priceFrom: number;
  approval: Approval;
  rejectReason?: string;
  available: boolean;
  verified: boolean;
  bio: string;
  badges: string[];
  responseMins: number;
  priceList: PriceItem[];
}

export interface Job {
  id: string;
  code: string;
  customerId: string;
  workerId?: string;
  title: string;
  categoryId: string;
  description: string;
  district: string;
  address: string;
  budget: number;
  urgency: Urgency;
  status: JobStatus;
  createdAt: number;
  scheduledAt?: string;
  startedAt?: number;
  doneAt?: number;
  cancelReason?: string;
}

export interface Quote {
  id: string;
  jobId: string;
  workerId: string;
  price: number;
  eta: string;
  message: string;
  status: QuoteStatus;
  createdAt: number;
}

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: number;
  flagged?: boolean;
  hidden?: boolean;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  icon: string;
  read: boolean;
  createdAt: number;
}

export interface DB {
  seq: number;
  users: User[];
  workers: WorkerProfile[];
  categories: Category[];
  jobs: Job[];
  quotes: Quote[];
  reviews: Review[];
  chats: ChatMessage[];
  notifications: Notification[];
  payments: Payment[];
  settings: { platformFee: number };
  categoryChanges: CategoryChange[];
  passwordResets: PasswordReset[];
  districts: District[];
}

export interface CreateJobInput {
  customerId: string;
  title: string;
  categoryId: string;
  description: string;
  district: string;
  address: string;
  budget: number;
  urgency: Urgency;
  scheduledAt?: string;
}

export interface BookInput {
  customerId: string;
  workerId: string;
  categoryId: string;
  district: string;
  address: string;
  scheduledAt: string;
  note: string;
  budget: number;
}

export interface WorkerRegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  categoryId: string;
  district: string;
  yearsExp: number;
  priceFrom: number;
  bio: string;
}
