import { useEffect, useRef, useState } from "react";
import { getDB, mutate, useDB } from "../lib/store";
import { sendChat } from "../lib/api";
import { cls, hourShort, uid } from "../lib/format";
import { isApiMode } from "../lib/config";
import { emitChat, onChatMessage, socketConnected } from "../lib/socket";
import { mapMessage } from "../lib/remote";
import { Icon } from "./Icons";
import type { ChatMessage, Job } from "../lib/types";

export function ChatPanel({ job, currentUserId, height = 380 }: { job: Job; currentUserId: string; height?: number }) {
  const db = useDB();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const apiMode = isApiMode();

  // Chế độ API: lắng nghe tin nhắn thời gian thực qua Socket.io
  useEffect(() => {
    if (!apiMode) return;
    const push = (raw: unknown) => {
      const m = mapMessage(raw as never);
      mutate((d) => {
        const dup = d.chats.some((c) => c.id === m.id);
        // khử trùng bản echo của chính tin vừa gửi lạc quan (cùng người gửi + nội dung, trong 6s)
        const softDup = d.chats.some(
          (c) => c.senderId === m.senderId && c.text === m.text && Math.abs(c.createdAt - m.createdAt) < 6000,
        );
        if (dup || softDup) return;
        d.chats = [...d.chats, m];
      });
    };
    const off = onChatMessage(job.id, push);
    const t = setInterval(() => setLive(socketConnected(job.id)), 1200);
    setLive(socketConnected(job.id));
    return () => {
      off();
      clearInterval(t);
    };
  }, [apiMode, job.id]);

  const msgs = db.chats.filter((m) => m.jobId === job.id).sort((a, b) => a.createdAt - b.createdAt);

  const isCustomer = currentUserId === job.customerId;
  const myWorkerProfile = db.workers.find((w) => w.userId === currentUserId);
  // thợ có thể xuất hiện bằng id user hoặc id hồ sơ thợ (dữ liệu seed)
  const myIds = [currentUserId, myWorkerProfile?.id].filter(Boolean) as string[];
  const senderAs = myWorkerProfile && !isCustomer ? myWorkerProfile.id : currentUserId;
  const counterpart = isCustomer
    ? db.workers.find((w) => w.id === job.workerId)
    : db.users.find((u) => u.id === job.customerId);
  const name = counterpart?.name ?? "Đối phương";

  useEffect(() => {
    boxRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setText("");

    if (apiMode) {
      if (socketConnected(job.id)) {
        // gửi qua socket: hiển thị lạc quan, server echo sẽ bị khử trùng
        mutate((d) => {
          d.chats = [...d.chats, { id: uid("tmp"), jobId: job.id, senderId: senderAs, text: t, createdAt: Date.now() }];
        });
        emitChat(job.id, t);
      } else {
        // socket chưa nối kịp: gửi REST rồi tự thêm vào store
        setSending(true);
        await sendChat(job.id, senderAs, t);
        mutate((d) => {
          d.chats = [...d.chats, { id: uid("m"), jobId: job.id, senderId: senderAs, text: t, createdAt: Date.now() }];
        });
        setSending(false);
      }
      return;
    }

    setSending(true);
    await sendChat(job.id, senderAs, t);
    setSending(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center gap-2.5 border-b border-line bg-paper/60 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-paper"><Icon name="chat" size={15} /></span>
        <div className="flex-1">
          <p className="text-[13.5px] font-bold text-ink-900">Trao đổi với {name}</p>
          <p className="text-[11px] text-mute">Phiếu việc {job.code} · tin nhắn được lưu trên nền tảng</p>
        </div>
        {apiMode ? (
          <span
            className={cls(
              "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold",
              live ? "bg-good-100 text-good-700" : "bg-warn-100 text-warn-600",
            )}
            title={live ? "Đang kết nối Socket.io — tin nhắn cập nhật tức thì" : "Chưa nối được Socket.io — đang dùng REST"}
          >
            <span className={cls("h-1.5 w-1.5 rounded-full", live ? "live-dot bg-good-500" : "bg-warn-600")} />
            {live ? "realtime" : "REST"}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-good-100 px-2 py-0.5 text-[10.5px] font-bold text-good-700">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-good-500" /> trực tuyến
          </span>
        )}
      </div>

      <div ref={boxRef} className="space-y-2.5 overflow-y-auto bg-[#fafaf6] px-4 py-4" style={{ height }}>
        {msgs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Icon name="chat" size={30} className="text-line" />
            <p className="mt-2 max-w-[240px] text-[12.5px] text-mute">Chưa có tin nhắn. Gửi lời chào để trao đổi về địa chỉ, thời gian và hạng mục nhé!</p>
          </div>
        )}
        {msgs.map((m) => {
          const mine = myIds.includes(m.senderId);
          return (
            <div key={m.id} className={cls("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cls("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm", mine ? "rounded-br-md bg-safety-500 text-white" : "rounded-bl-md border border-line bg-card text-ink-800")}>
                <p>{m.text}</p>
                <p className={cls("mt-1 text-right text-[10px]", mine ? "text-white/70" : "text-mute")}>{hourShort(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Nhắn cho ${name}…`}
          className="field-input flex-1"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-paper transition hover:bg-safety-500 disabled:opacity-40"
          aria-label="Gửi tin nhắn"
        >
          <Icon name="send" size={17} />
        </button>
      </div>
    </div>
  );
}
