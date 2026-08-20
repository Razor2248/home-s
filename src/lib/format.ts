import type { Approval, JobStatus, QuoteStatus, Urgency } from "./types";

export const uid = (p = "id") =>
  `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const cls = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

export const fmtVND = (n: number) => n.toLocaleString("vi-VN") + "₫";

export const fmtK = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "tr"
    : Math.round(n / 1000) + "k";

export const timeAgo = (ts: number) => {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(ts).toLocaleDateString("vi-VN");
};

export const dateShort = (ts: number) =>
  new Date(ts).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

export const hourShort = (ts: number) =>
  new Date(ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");

export const AVATAR_COLORS = ["#f4581c", "#12936f", "#dd9a2b", "#2e527c", "#c94444", "#38a3c0", "#7a5c3e"];
export const pickColor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export const JOB_STATUS: Record<JobStatus, { label: string; cls: string; dot: string }> = {
  open: { label: "Chờ báo giá", cls: "bg-warn-100 text-warn-600", dot: "bg-warn-600" },
  assigned: { label: "Đã nhận việc", cls: "bg-ink-800/10 text-ink-700", dot: "bg-ink-700" },
  in_progress: { label: "Đang thi công", cls: "bg-safety-100 text-safety-600", dot: "bg-safety-500" },
  done: { label: "Đã hoàn thành", cls: "bg-good-100 text-good-700", dot: "bg-good-500" },
  reviewed: { label: "Đã đánh giá", cls: "bg-good-100 text-good-700", dot: "bg-good-500" },
  cancelled: { label: "Đã hủy", cls: "bg-danger-100 text-danger-600", dot: "bg-danger-600" },
};

export const QUOTE_STATUS: Record<QuoteStatus, { label: string; cls: string }> = {
  sent: { label: "Đã gửi", cls: "bg-warn-100 text-warn-600" },
  accepted: { label: "Được chọn", cls: "bg-good-100 text-good-700" },
  declined: { label: "Không được chọn", cls: "bg-line/60 text-mute" },
};

export const URGENCY: Record<Urgency, { label: string; cls: string }> = {
  normal: { label: "Bình thường", cls: "bg-line/60 text-ink-700" },
  urgent: { label: "Khẩn cấp", cls: "bg-safety-500 text-white" },
};

export const APPROVAL: Record<Approval, { label: string; cls: string }> = {
  pending: { label: "Chờ duyệt", cls: "bg-warn-100 text-warn-600" },
  approved: { label: "Đã duyệt", cls: "bg-good-100 text-good-700" },
  rejected: { label: "Bị từ chối", cls: "bg-danger-100 text-danger-600" },
};

export const DISTRICTS = ["Quận 1", "Quận 3", "Quận 7", "Quận 10", "Bình Thạnh", "Phú Nhuận", "Tân Bình", "Thủ Đức"];

/* intent: trang landing "dặn trước" hành động sau khi đăng nhập */
export type Intent = { type: "post" | "browse"; categoryId?: string; district?: string } | null;
export const setIntent = (o: Intent) => {
  try {
    sessionStorage.setItem("hs_intent", JSON.stringify(o));
  } catch { /* ignore */ }
};
export const takeIntent = (): Intent => {
  try {
    const raw = sessionStorage.getItem("hs_intent");
    sessionStorage.removeItem("hs_intent");
    return raw ? (JSON.parse(raw) as Intent) : null;
  } catch {
    return null;
  }
};
