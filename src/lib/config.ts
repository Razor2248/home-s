/**
 * Cấu hình nguồn dữ liệu (Giai đoạn 3):
 *  - "mock": dữ liệu localStorage (demo không cần server)
 *  - "api" : gọi backend NestJS qua REST (mặc định khi có VITE_API_URL)
 */
import { TOKEN_KEY, REFRESH_KEY } from "./http";

export type DataMode = "mock" | "api";

const MODE_KEY = "hs_data_mode";
const URL_KEY = "hs_api_url";

const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
export const DEFAULT_API_URL = env.VITE_API_URL || "http://localhost:3001/api/v1";

export function getApiUrl(): string {
  try {
    return localStorage.getItem(URL_KEY) || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export function setApiUrl(url: string) {
  try {
    localStorage.setItem(URL_KEY, url.trim().replace(/\/+$/, ""));
  } catch {
    /* ignore */
  }
  emitStatus();
}

export function getDataMode(): DataMode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    if (m === "api" || m === "mock") return m;
  } catch {
    /* ignore */
  }
  // Nếu được build với VITE_API_URL thì mặc định ưu tiên API
  return env.VITE_API_URL ? "api" : "mock";
}

export function setDataMode(m: DataMode) {
  try {
    localStorage.setItem(MODE_KEY, m);
  } catch {
    /* ignore */
  }
  if (m === "mock") clearTokens();
  emitStatus();
}

export const isApiMode = () => getDataMode() === "api";

export function clearTokens() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

/* ---------- trạng thái kết nối (cho pill hiển thị trong app) ---------- */
export type ApiStatus = "idle" | "syncing" | "ok" | "error";
let status: ApiStatus = "idle";
let statusMsg = "";
const statusListeners = new Set<() => void>();

export function setApiStatus(s: ApiStatus, msg = "") {
  status = s;
  statusMsg = msg;
  statusListeners.forEach((l) => l());
}
export function getApiStatus(): { s: ApiStatus; msg: string } {
  return { s: status, msg: statusMsg };
}
export function subscribeApiStatus(l: () => void) {
  statusListeners.add(l);
  return () => {
    statusListeners.delete(l);
  };
}
function emitStatus() {
  statusListeners.forEach((l) => l());
}

/** Host rút gọn để hiển thị, vd: localhost:3001 */
export function shortHost(url: string): string {
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return url;
  }
}
