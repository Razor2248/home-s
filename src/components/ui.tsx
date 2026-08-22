import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ButtonHTMLAttributes, type ReactNode,
} from "react";
import { cls, uid, JOB_STATUS } from "../lib/format";
import type { JobStatus } from "../lib/types";
import { Icon, Logo, type IconName } from "./Icons";

/* ================= BUTTON ================= */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "outline" | "ghost" | "danger" | "good" | "paper";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: IconName;
  iconRight?: IconName;
};

const BTN_V: Record<string, string> = {
  primary: "bg-safety-500 text-white hover:bg-safety-600 active:translate-y-px shadow-[0_6px_16px_-6px_rgba(244,88,28,0.55)]",
  dark: "bg-ink-900 text-paper hover:bg-ink-800 active:translate-y-px",
  outline: "border-[1.5px] border-ink-900/20 bg-card text-ink-900 hover:border-safety-500 hover:text-safety-600",
  ghost: "text-ink-700 hover:bg-ink-900/5",
  danger: "bg-danger-600 text-white hover:brightness-110",
  good: "bg-good-500 text-white hover:bg-good-700",
  paper: "bg-card text-ink-900 border border-line hover:border-safety-500",
};
const BTN_S: Record<string, string> = {
  xs: "px-2.5 py-1.5 text-[12.5px] gap-1.5 rounded-md",
  sm: "px-3.5 py-2 text-[13.5px] gap-1.5 rounded-lg",
  md: "px-5 py-2.5 text-[14.5px] gap-2 rounded-lg",
  lg: "px-6 py-3 text-[15.5px] gap-2 rounded-xl",
};

export function Button({ variant = "primary", size = "md", loading, icon, iconRight, className = "", children, disabled, ...rest }: BtnProps) {
  return (
    <button
      className={cls(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 select-none",
        BTN_V[variant], BTN_S[size],
        (disabled || loading) && "opacity-55 pointer-events-none",
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        icon && <Icon name={icon} size={size === "xs" ? 14 : 16} />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={size === "xs" ? 14 : 16} />}
    </button>
  );
}

/* ================= BADGE / PILL ================= */
export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={cls("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-semibold", className)}>
      {children}
    </span>
  );
}

export function JobPill({ status, className = "" }: { status: JobStatus; className?: string }) {
  const m = JOB_STATUS[status];
  return (
    <Badge className={cls(m.cls, className)}>
      <span className={cls("h-1.5 w-1.5 rounded-full", m.dot, status === "in_progress" && "live-dot")} />
      {m.label}
    </Badge>
  );
}

/* ================= STARS ================= */
export function Stars({ value, onChange, size = 15 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) =>
        onChange ? (
          <button key={i} type="button" onMouseEnter={() => setHover(i)} onClick={() => onChange(i)} className="cursor-pointer transition-transform hover:scale-125" aria-label={`${i} sao`}>
            <Icon name="star" size={size + 6} filled={i <= shown} className={i <= shown ? "text-warn-600" : "text-line"} />
          </button>
        ) : (
          <Icon key={i} name="star" size={size} filled={i <= Math.round(shown)} className={i <= Math.round(shown) ? "text-warn-600" : "text-line"} />
        ),
      )}
    </span>
  );
}

/* ================= AVATAR ================= */
export function Avatar({ name, color, size = 40, className = "" }: { name: string; color: string; size?: number; className?: string }) {
  const ini = name.split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");
  return (
    <span
      className={cls("inline-flex shrink-0 items-center justify-center rounded-xl font-display font-bold text-white", className)}
      style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}
    >
      {ini}
    </span>
  );
}

/* ================= MODAL ================= */
export function Modal({ open, onClose, title, sub, children, w = "max-w-lg" }: { open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode; w?: string }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cls("anim-pop relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card p-6 shadow-2xl sm:rounded-2xl", w)}>
        <div className="mb-1 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-ink-900">{title}</h3>
            {sub && <p className="mt-0.5 text-[13.5px] text-mute">{sub}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-mute transition hover:bg-paper hover:text-ink-900" aria-label="Đóng">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/* ================= FIELD ================= */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-mute">{hint}</span>}
    </label>
  );
}

/* ================= EMPTY STATE ================= */
export function EmptyState({ icon, title, desc, children }: { icon: IconName; title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="dashed-frame flex flex-col items-center rounded-2xl bg-card/60 px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-safety-50 text-safety-500">
        <Icon name={icon} size={26} />
      </span>
      <h4 className="font-display text-lg font-bold text-ink-900">{title}</h4>
      {desc && <p className="mt-1 max-w-sm text-[13.5px] text-mute">{desc}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/* ================= TOAST ================= */
type ToastItem = { id: string; text: string; kind: "ok" | "err" };
const ToastCtx = createContext<{ push: (text: string, kind?: "ok" | "err") => void }>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, kind: "ok" | "err" = "ok") => {
    const id = uid("t");
    setItems((s) => [...s.slice(-3), { id, text, kind }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className={cls("anim-toast pointer-events-auto flex items-start gap-2.5 rounded-xl border-l-4 bg-ink-900 px-4 py-3 text-[13.5px] font-medium text-paper shadow-xl", t.kind === "ok" ? "border-good-500" : "border-danger-600")}>
            <span className={cls("mt-0.5", t.kind === "ok" ? "text-good-500" : "text-danger-600")}>
              <Icon name={t.kind === "ok" ? "check" : "alert"} size={16} />
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================= SYNC SPLASH (chế độ API, chờ tải dữ liệu) ================= */
export function SyncSplash() {
  return (
    <div className="bg-blueprint-dark flex min-h-screen flex-col items-center justify-center gap-5 bg-ink-950 px-6 text-center">
      <Logo size={46} dark />
      <div className="flex items-center gap-2.5 font-mono text-[13px] font-bold text-paper">
        <svg width="17" height="17" viewBox="0 0 24 24" className="animate-spin text-safety-400" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        Đang đồng bộ dữ liệu từ server…
      </div>
      <p className="max-w-sm text-[12px] leading-relaxed text-ink-400">
        Nếu chờ quá lâu, kiểm tra backend đã chạy chưa — hoặc chuyển sang chế độ Demo ở trang đăng nhập.
      </p>
      <div className="stripes h-1.5 w-40 rounded-full opacity-70" />
    </div>
  );
}

/* ================= REVEAL (scroll) ================= */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cls("reveal", inView && "in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ================= BARS (biểu đồ cột tự vẽ) ================= */
export function Bars({ data, tone = "#f4581c", height = 130, formatValue }: { data: { label: string; value: number }[]; tone?: string; height?: number; formatValue?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex items-end gap-[6px]" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className="w-full rounded-t-[5px] transition-all duration-300 group-hover:opacity-80"
              style={{ height: Math.max(4, (d.value / max) * (height - 24)), background: d.value === 0 ? "var(--color-line)" : tone }}
              title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-1.5 py-0.5 text-[10.5px] font-semibold text-paper opacity-0 transition group-hover:opacity-100">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[6px]">
        {data.map((d, i) => (
          <span key={i} className="flex-1 truncate text-center text-[10px] font-medium text-mute">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================= TABS ================= */
export function Tabs({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: { id: string; label: string; count?: number }[] }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cls(
            "rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-all",
            value === t.id ? "bg-ink-900 text-paper shadow" : "text-mute hover:bg-paper hover:text-ink-900",
          )}
        >
          {t.label}
          {typeof t.count === "number" && <span className={cls("ml-1.5 rounded-md px-1.5 text-[11px]", value === t.id ? "bg-white/15" : "bg-paper")}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ================= SECTION TITLE (landing) ================= */
export function SectionTitle({ kicker, title, desc, dark = false, right }: { kicker: string; title: ReactNode; desc?: string; dark?: boolean; right?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className={cls("mb-2 inline-flex items-center gap-2 font-mono text-[11.5px] font-bold uppercase tracking-[0.18em]", dark ? "text-safety-400" : "text-safety-600")}>
          <span className="inline-block h-[3px] w-6 rounded-full bg-safety-500" />
          {kicker}
        </p>
        <h2 className={cls("font-display text-[clamp(1.6rem,3.4vw,2.5rem)] font-bold leading-[1.12] tracking-tight", dark ? "text-white" : "text-ink-900")}>{title}</h2>
        {desc && <p className={cls("mt-2 max-w-xl text-[15px]", dark ? "text-ink-400" : "text-mute")}>{desc}</p>}
      </div>
      {right}
    </div>
  );
}
