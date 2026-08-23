/**
 * Socket.io client (Giai đoạn 4) — chat thời gian thực.
 * Chỉ dùng ở chế độ "api". Kết nối namespace /chat với JWT + jobId,
 * lắng nghe message:new và phát message:send.
 */
import { io, type Socket } from "socket.io-client";
import { getApiUrl } from "./config";
import { TOKEN_KEY } from "./http";

/** http://localhost:3001/api/v1 → gốc socket http://localhost:3001 */
function socketBase(): string {
  const base = getApiUrl();
  try {
    const u = new URL(base);
    return `${u.protocol}//${u.host}`;
  } catch {
    return base;
  }
}

let active: { socket: Socket; jobId: string } | null = null;

/** Lấy (hoặc tạo) socket cho một phòng chat job:{id} */
export function chatSocket(jobId: string): Socket {
  if (active && active.jobId === jobId) return active.socket;
  if (active) {
    active.socket.removeAllListeners();
    active.socket.disconnect();
    active = null;
  }
  const token = localStorage.getItem(TOKEN_KEY) ?? "";
  const socket = io(`${socketBase()}/chat`, {
    auth: { token, jobId },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
  });
  active = { socket, jobId };
  return socket;
}

export function disconnectChat() {
  if (active) {
    active.socket.removeAllListeners();
    active.socket.disconnect();
    active = null;
  }
}

/** Gửi tin qua socket — server sẽ lưu DB rồi broadcast message:new cho cả phòng */
export function emitChat(jobId: string, text: string) {
  chatSocket(jobId).emit("message:send", { jobId, text });
}

export function onChatMessage(jobId: string, cb: (raw: unknown) => void): () => void {
  const s = chatSocket(jobId);
  s.on("message:new", cb);
  return () => s.off("message:new", cb);
}

export function socketConnected(jobId: string): boolean {
  return !!active && active.jobId === jobId && active.socket.connected;
}
