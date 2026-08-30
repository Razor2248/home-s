import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDB, useSession } from "../lib/store";
import { changePassword, resetAll, updateAccount } from "../lib/api";
import { getDataMode, getApiUrl, isApiMode, shortHost } from "../lib/config";
import { AVATAR_COLORS, cls, initials, timeAgo } from "../lib/format";
import { Icon } from "../components/Icons";
import { Badge, Button, Field, Stars, useToast } from "../components/ui";

const ROLE_LABEL: Record<string, string> = { customer: "Khách hàng", worker: "Đối tác thợ", admin: "Quản trị viên" };
const ROLE_CLS: Record<string, string> = {
  customer: "bg-safety-100 text-safety-600",
  worker: "bg-good-100 text-good-700",
  admin: "bg-ink-800/10 text-ink-700",
};

export default function AccountSettings() {
  const db = useDB();
  const me = useSession()!;
  const navigate = useNavigate();
  const { push } = useToast();

  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [color, setColor] = useState(me.avatarColor);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwErr, setPwErr] = useState("");

  const worker = me.role === "worker" ? db.workers.find((w) => w.userId === me.id) : undefined;
  const favCount = me.favorites?.length ?? 0;
  const myJobs = db.jobs.filter((j) => j.customerId === me.id).length;
  const dirty = name !== me.name || phone !== me.phone || color !== me.avatarColor;

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateAccount(me.id, { name, phone, avatarColor: color });
      push("Đã lưu thông tin tài khoản.");
    } catch (e) {
      push(e instanceof Error ? e.message : "Có lỗi khi lưu.", "err");
    } finally {
      setSaving(false);
    }
  };

  const savePw = async () => {
    setPwErr("");
    if (pw.next !== pw.confirm) {
      setPwErr("Mật khẩu nhập lại chưa khớp.");
      return;
    }
    setPwBusy(true);
    try {
      await changePassword(me.id, pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      push("Đã đổi mật khẩu thành công.");
    } catch (e) {
      setPwErr(e instanceof Error ? e.message : "Có lỗi khi đổi mật khẩu.");
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="anim-fadeUp space-y-5">
      {/* ---------- thẻ định danh ---------- */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <div className="stripes h-2" />
        <div className="flex flex-wrap items-center gap-5 p-6">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-2xl font-display text-[26px] font-bold text-white shadow-lg transition-all"
            style={{ background: color }}
          >
            {initials(name || me.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-[22px] font-extrabold text-ink-900">{name || me.name}</h2>
              <Badge className={ROLE_CLS[me.role]}>{ROLE_LABEL[me.role]}</Badge>
            </div>
            <p className="mt-0.5 text-[13.5px] text-mute">
              {me.email} · tham gia {timeAgo(me.createdAt)}
            </p>
          </div>
          <div className="flex gap-4 text-center">
            {me.role === "customer" && (
              <>
                <div><p className="font-display text-[20px] font-extrabold text-ink-900">{myJobs}</p><p className="text-[11px] font-bold text-mute">việc đã đăng</p></div>
                <div className="w-px bg-line" />
                <div><p className="font-display text-[20px] font-extrabold text-ink-900">{favCount}</p><p className="text-[11px] font-bold text-mute">thợ yêu thích</p></div>
              </>
            )}
            {me.role === "worker" && worker && (
              <>
                <div>
                  <p className="flex items-center justify-center gap-1 font-display text-[20px] font-extrabold text-ink-900">
                    {worker.rating ? worker.rating.toFixed(1) : "—"}<Icon name="star" size={14} filled className="text-warn-600" />
                  </p>
                  <p className="text-[11px] font-bold text-mute">đánh giá</p>
                </div>
                <div className="w-px bg-line" />
                <div><p className="font-display text-[20px] font-extrabold text-ink-900">{worker.jobsDone}</p><p className="text-[11px] font-bold text-mute">việc đã xong</p></div>
              </>
            )}
            {me.role === "admin" && (
              <>
                <div><p className="font-display text-[20px] font-extrabold text-ink-900">{db.users.length}</p><p className="text-[11px] font-bold text-mute">người dùng</p></div>
                <div className="w-px bg-line" />
                <div><p className="font-display text-[20px] font-extrabold text-ink-900">{db.jobs.length}</p><p className="text-[11px] font-bold text-mute">công việc</p></div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------- thông tin cá nhân ---------- */}
        <div className="rounded-xl border border-line bg-card p-6">
          <h3 className="mb-1 flex items-center gap-2 font-display text-[17px] font-bold text-ink-900">
            <Icon name="user" size={17} className="text-safety-600" /> Thông tin cá nhân
          </h3>
          <p className="mb-5 text-[12.5px] text-mute">Tên hiển thị xuất hiện trong báo giá, chat và đánh giá.</p>
          <div className="space-y-4">
            <Field label="Tên hiển thị">
              <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Số điện thoại">
              <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901 234 567" />
            </Field>
            <Field label="Màu đại diện" hint="Avatar của bạn trên toàn nền tảng — xem trước ở thẻ trên.">
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Màu ${c}`}
                    className={cls(
                      "h-9 w-9 rounded-xl transition-all hover:scale-110",
                      color === c && "scale-110 ring-2 ring-ink-900 ring-offset-2 ring-offset-card",
                    )}
                    style={{ background: c }}
                  >
                    {color === c && <Icon name="check" size={16} className="mx-auto text-white" />}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex items-center gap-3 pt-1">
              <Button icon="check" loading={saving} disabled={!dirty} onClick={saveProfile}>Lưu thay đổi</Button>
              {dirty && <span className="text-[12.5px] font-semibold text-warn-600">Có thay đổi chưa lưu</span>}
            </div>
          </div>
        </div>

        {/* ---------- bảo mật ---------- */}
        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-card p-6">
            <h3 className="mb-1 flex items-center gap-2 font-display text-[17px] font-bold text-ink-900">
              <Icon name="lock" size={16} className="text-safety-600" /> Đổi mật khẩu
            </h3>
            <p className="mb-5 text-[12.5px] text-mute">Mật khẩu mới tối thiểu 6 ký tự. Nên đổi định kỳ để bảo vệ tài khoản.</p>
            <div className="space-y-4">
              <Field label="Mật khẩu hiện tại">
                <input type="password" className="field-input" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="••••••" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mật khẩu mới">
                  <input type="password" className="field-input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="Tối thiểu 6 ký tự" />
                </Field>
                <Field label="Nhập lại mật khẩu mới">
                  <input type="password" className="field-input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="••••••" />
                </Field>
              </div>
              {pwErr && (
                <p className="anim-shake flex items-center gap-1.5 rounded-lg bg-danger-100 px-3 py-2 text-[12.5px] font-bold text-danger-600">
                  <Icon name="alert" size={14} /> {pwErr}
                </p>
              )}
              <Button variant="dark" icon="lock" loading={pwBusy} disabled={!pw.current || !pw.next} onClick={savePw}>
                Cập nhật mật khẩu
              </Button>
            </div>
          </div>

          {/* ---------- dữ liệu & phiên ---------- */}
          <div className="rounded-xl border border-line bg-ink-900 bg-blueprint-dark p-6 text-paper">
            <h3 className="mb-4 flex items-center gap-2 font-display text-[16px] font-bold">
              <Icon name="database" size={16} className="text-safety-400" /> Nguồn dữ liệu của phiên này
            </h3>
            <div className="space-y-2.5 text-[13px]">
              <p className="flex items-center justify-between gap-3">
                <span className="text-ink-400">Chế độ</span>
                <span className={cls("flex items-center gap-1.5 font-mono text-[12px] font-bold", isApiMode() ? "text-good-500" : "text-warn-600")}>
                  <span className={cls("h-2 w-2 rounded-full", isApiMode() ? "live-dot bg-good-500" : "bg-warn-600")} />
                  {isApiMode() ? "Server API (NestJS)" : "Demo (localStorage)"}
                </span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="text-ink-400">Địa chỉ API</span>
                <code className="font-mono text-[12px] text-safety-400">{shortHost(getApiUrl())}</code>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span className="text-ink-400">Phí nền tảng hiện hành</span>
                <span className="font-mono text-[12px] font-bold text-paper">{db.settings?.platformFee ?? 10}%</span>
              </p>
            </div>
            {!isApiMode() && (
              <button
                onClick={() => {
                  resetAll();
                  push("Đã khôi phục dữ liệu demo về ban đầu.");
                }}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-[12.5px] font-bold text-ink-400 transition hover:border-safety-500 hover:text-safety-400"
              >
                <Icon name="refresh" size={13} /> Khôi phục dữ liệu demo
              </button>
            )}
          </div>

          {me.role === "worker" && (
            <button
              onClick={() => navigate("/app/worker/profile")}
              className="group flex w-full items-center gap-3 rounded-xl border border-line bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-safety-500 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-good-100 text-good-700"><Icon name="wrench" size={18} /></span>
              <span className="flex-1">
                <span className="block text-[13.5px] font-bold text-ink-900">Hồ sơ nghề nghiệp của bạn</span>
                <span className="text-[12px] text-mute">Giới thiệu, bảng giá, thành tích — khách hàng nhìn thấy những gì?</span>
              </span>
              <Icon name="chevR" size={16} className="text-mute transition group-hover:translate-x-0.5 group-hover:text-safety-600" />
            </button>
          )}
          {me.role === "worker" && worker && (
            <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-[12.5px] text-mute">
              <Stars value={Math.round(worker.rating)} size={12} />
              <span><b className="text-ink-900">{worker.ratingCount}</b> khách đã đánh giá bạn</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
