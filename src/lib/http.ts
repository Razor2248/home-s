/**
 * HTTP client — tầng thấp nhất, bọc fetch để nói chuyện với backend NestJS.
 *
 * Luồng dữ liệu đã ĐƯỢC nối hoàn chỉnh (không cần làm thêm gì ở đây):
 *
 *   Component (UI)
 *     → src/lib/api.ts        mỗi hàm tự kiểm tra chế độ (demo localStorage hay server)
 *     → src/lib/remote.ts     các hàm REST gọi đúng endpoint backend (DÙNG http ở file này)
 *     → src/lib/http.ts       fetch + JWT + xử lý lỗi tiếng Việt  ← BẠN ĐANG Ở ĐÂY
 *     → Backend NestJS        http://localhost:3001/api/v1
 *
 * Token JWT lấy từ localStorage; lỗi trả về message tiếng Việt từ server.
 * Chi tiết xem trang /docs → tab "Tích hợp GĐ3".
 */
import { getApiUrl } from "./config";

const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};
export const API_BASE = env.VITE_API_URL ?? "http://localhost:3001/api/v1";
const base = () => getApiUrl() || API_BASE;

export const TOKEN_KEY = "hs_access_token";
export const REFRESH_KEY = "hs_refresh_token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth !== false) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${base()}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.", 0);
  }
  if (!res.ok) {
    let msg = "Có lỗi xảy ra, thử lại nhé.";
    try {
      const j = await res.json();
      msg = Array.isArray(j.message) ? j.message[0] : (j.message ?? msg);
    } catch {
      /* giữ msg mặc định */
    }
    throw new ApiError(msg, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
