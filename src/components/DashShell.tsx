import { useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDB, useSession } from "../lib/store";
import { logout, markAllRead } from "../lib/api";
import { cls, timeAgo } from "../lib/format";
import { Icon, Logo, type IconName } from "./Icons";
import { Avatar } from "./ui";
import type { Role } from "../lib/types";

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  badge?: number;
  end?: boolean;
}

const ROLE_META: Record<Role, { label: string; cls: string }> = {
  customer: { label: "Khách hàng", cls: "bg-safety-500/15 text-safety-400" },
  worker: { label: "Đối tác thợ", cls: "bg-good-500/20 text-good-500" },
  admin: { label: "Quản trị viên", cls: "bg-white/10 text-paper" },
};

export function DashShell({ role, nav, children }: { role: Role; nav: NavItem[]; children: ReactNode }) {
  const db = useDB();
  const user = useSession()!;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const notifs = db.notifications.filter((n) => n.userId === user.id).slice(0, 9);
  const unread = db.notifications.filter((n) => n.userId === user.id && !n.read).length;
  const active = nav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <button onClick={() => navigate("/")} className="transition hover:opacity-80">
          <Logo size={36} dark />
        </button>
        <span className={cls("mt-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider", ROLE_META[role].cls)}>
          <Icon name={role === "admin" ? "shield" : role === "worker" ? "wrench" : "home"} size={12} />
          {ROLE_META[role].label}
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cls(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-semibold transition-all",
                isActive ? "bg-white/10 text-white" : "text-ink-400 hover:bg-white/5 hover:text-paper",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cls("absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-safety-500 transition-all", isActive ? "opacity-100" : "opacity-0")} />
                <Icon name={n.icon} size={18} className={isActive ? "text-safety-400" : ""} />
                <span className="flex-1">{n.label}</span>
                {typeof n.badge === "number" && n.badge > 0 && (
                  <span className="rounded-md bg-safety-500 px-1.5 py-0.5 text-[11px] font-bold text-white">{n.badge}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} color={user.avatarColor} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold text-white">{user.name}</p>
            <p className="truncate text-[11.5px] text-ink-400">{user.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            title="Đăng xuất"
            className="rounded-lg p-2 text-ink-400 transition hover:bg-white/10 hover:text-safety-400"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] bg-ink-900 bg-blueprint-dark lg:block">{sidebar}</aside>

      {/* mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setMobileOpen(false)} />
          <aside className="anim-pop absolute inset-y-0 left-0 w-[260px] bg-ink-900">{sidebar}</aside>
        </div>
      )}

      {/* topbar */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur lg:pl-[236px]">
        <div className="mx-auto flex h-[62px] max-w-[1160px] items-center gap-3 px-4 md:px-7">
          <button className="rounded-lg p-2 text-ink-700 transition hover:bg-ink-900/5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <Icon name="menu" size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-[17px] font-bold text-ink-900">{active?.label ?? "Home Services"}</h1>
            <p className="hidden text-[11.5px] text-mute sm:block">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* bell */}
          <div className="relative">
            <button
              onClick={() => {
                setBellOpen((v) => !v);
                if (!bellOpen && unread > 0) setTimeout(() => markAllRead(user.id), 900);
              }}
              className="relative rounded-xl border border-line bg-card p-2.5 text-ink-700 transition hover:border-safety-500 hover:text-safety-600"
              aria-label="Thông báo"
            >
              <Icon name="bell" size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-safety-500 px-1 text-[10.5px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                <div className="anim-pop absolute right-0 z-50 mt-2 w-[min(88vw,340px)] overflow-hidden rounded-xl border border-line bg-card shadow-2xl">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <span className="font-display text-[14px] font-bold">Thông báo</span>
                    <span className="text-[11.5px] text-mute">{notifs.length} gần nhất</span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifs.length === 0 && <p className="px-4 py-8 text-center text-[13px] text-mute">Chưa có thông báo nào.</p>}
                    {notifs.map((n) => (
                      <div key={n.id} className={cls("flex gap-3 border-b border-line/60 px-4 py-3", !n.read && "bg-safety-50/60")}>
                        <span className={cls("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", !n.read ? "bg-safety-500/15 text-safety-600" : "bg-paper text-mute")}>
                          <Icon name={(n.icon as IconName) || "bell"} size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium leading-snug text-ink-800">{n.text}</p>
                          <p className="mt-0.5 text-[11px] text-mute">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <Avatar name={user.name} color={user.avatarColor} size={38} className="hidden sm:inline-flex" />
        </div>
      </header>

      <main className="lg:pl-[236px]">
        <div className="mx-auto max-w-[1160px] px-4 py-6 md:px-7 md:py-8">{children}</div>
      </main>
    </div>
  );
}
