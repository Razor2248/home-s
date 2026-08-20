import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login, registerCustomer, registerWorker, resetAll } from "../lib/api";
import { useSession } from "../lib/store";
import { cls, DISTRICTS, takeIntent } from "../lib/format";
import { Icon, Logo, type IconName } from "../components/Icons";
import { Button, Field, useToast } from "../components/ui";
import type { Role } from "../lib/types";

const DEMOS: { role: Role; label: string; email: string; icon: IconName; cls: string }[] = [
  { role: "customer", label: "Khách hàng demo", email: "khach@demo.vn", icon: "home", cls: "hover:border-safety-500 hover:text-safety-600" },
  { role: "worker", label: "Thợ demo", email: "tho@demo.vn", icon: "wrench", cls: "hover:border-good-500 hover:text-good-700" },
  { role: "admin", label: "Admin demo", email: "admin@demo.vn", icon: "shield", cls: "hover:border-ink-900 hover:text-ink-900" },
];

const HOME: Record<Role, string> = { customer: "/app/customer", worker: "/app/worker", admin: "/app/admin" };

export default function Login() {
  const navigate = useNavigate();
  const { push } = useToast();
  const session = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [regRole, setRegRole] = useState<"customer" | "worker">("customer");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(0);
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", categoryId: "dien", district: DISTRICTS[4], yearsExp: 3, priceFrom: 150000, bio: "" });

  if (session) {
    // đã đăng nhập thì đưa về đúng vai trò
    setTimeout(() => navigate(HOME[session.role]), 0);
  }

  const fail = (msg: string) => {
    setErr(msg);
    setShake((s) => s + 1);
  };

  const afterAuth = (role: Role) => {
    const intent = takeIntent();
    if (role === "customer" && intent?.type === "post") navigate("/app/customer/post");
    else if (role === "customer" && intent?.type === "browse") navigate("/app/customer/workers");
    else navigate(HOME[role]);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        const u = await login(f.email, f.password);
        push(`Chào mừng trở lại, ${u.name}!`);
        afterAuth(u.role);
      } else if (regRole === "customer") {
        const u = await registerCustomer(f);
        push("Đăng ký thành công! Bắt đầu đăng việc thôi.");
        afterAuth(u.role);
      } else {
        const u = await registerWorker({ ...f, yearsExp: Number(f.yearsExp), priceFrom: Number(f.priceFrom) });
        push("Đã gửi hồ sơ! Chờ Admin duyệt để bắt đầu nhận việc.");
        afterAuth(u.role);
      }
    } catch (ex) {
      fail(ex instanceof Error ? ex.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    setErr("");
    setLoading(true);
    try {
      const u = await login(email, "123456");
      push(`Đang xem với vai trò ${DEMOS.find((d) => d.email === email)?.label}.`);
      afterAuth(u.role);
    } catch (ex) {
      fail(ex instanceof Error ? ex.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      {/* trái: thương hiệu */}
      <div className="bg-blueprint-dark relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 text-paper lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-safety-500/10 blur-3xl" />
        <button onClick={() => navigate("/")} className="w-fit transition hover:opacity-80"><Logo size={40} dark /></button>
        <div className="relative max-w-md">
          <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.2em] text-safety-400">Bản demo giai đoạn 1</p>
          <h1 className="mt-4 font-display text-[2.6rem] font-extrabold leading-[1.08] tracking-tight">
            Một tài khoản,<br />cả đội thợ <span className="text-safety-400">tin cậy.</span>
          </h1>
          <div className="mt-8 space-y-4">
            {[
              { icon: "bolt" as IconName, text: "Đăng việc – nhận báo giá chỉ trong vài phút" },
              { icon: "shield" as IconName, text: "Thợ được duyệt hồ sơ trước khi hoạt động" },
              { icon: "star" as IconName, text: "Đánh giá thật sau mỗi công việc hoàn thành" },
            ].map((x) => (
              <p key={x.text} className="flex items-center gap-3 text-[14.5px] text-ink-400">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.07] text-safety-400"><Icon name={x.icon} size={17} /></span>
                {x.text}
              </p>
            ))}
          </div>
        </div>
        <div className="relative">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">Tài khoản demo — mật khẩu 123456</p>
          <div className="space-y-1.5 font-mono text-[12.5px] text-ink-400">
            {DEMOS.map((d) => (
              <p key={d.email}><span className="text-safety-400">▸</span> {d.email}</p>
            ))}
          </div>
        </div>
        <div className="stripes absolute inset-x-0 bottom-0 h-2.5" />
      </div>

      {/* phải: form */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">
          <button onClick={() => navigate("/")} className="mb-8 transition hover:opacity-75 lg:hidden"><Logo size={36} /></button>

          <div className="rounded-2xl border border-line bg-card p-7 shadow-sm md:p-8">
            <div className="mb-6 flex rounded-xl bg-paper p-1">
              {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setErr(""); }} className={cls("flex-1 rounded-lg py-2 text-[14px] font-bold transition-all", mode === m ? "bg-ink-900 text-paper shadow" : "text-mute hover:text-ink-900")}>
                  {m === "login" ? "Đăng nhập" : "Đăng ký"}
                </button>
              ))}
            </div>

            {err && (
              <p key={shake} className="anim-shake mb-4 flex items-center gap-2 rounded-lg bg-danger-100 px-3.5 py-2.5 text-[13px] font-semibold text-danger-600">
                <Icon name="alert" size={15} /> {err}
              </p>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {(["customer", "worker"] as const).map((r) => (
                      <button type="button" key={r} onClick={() => setRegRole(r)} className={cls("flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-[13.5px] font-bold transition", regRole === r ? "border-safety-500 bg-safety-50 text-safety-600" : "border-line text-mute hover:border-ink-900/30")}>
                        <Icon name={r === "customer" ? "home" : "wrench"} size={15} />
                        {r === "customer" ? "Tôi cần thuê thợ" : "Tôi là thợ"}
                      </button>
                    ))}
                  </div>
                  <Field label="Họ và tên">
                    <input required className="field-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nguyễn Văn A" />
                  </Field>
                </>
              )}
              <Field label="Email">
                <input required type="email" className="field-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="ban@email.vn" />
              </Field>
              {mode === "register" && (
                <Field label="Số điện thoại">
                  <input required className="field-input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="0901 234 567" />
                </Field>
              )}
              <Field label="Mật khẩu" hint={mode === "login" ? undefined : "Tối thiểu 6 ký tự"}>
                <input required type="password" minLength={6} className="field-input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••" />
              </Field>

              {mode === "register" && regRole === "worker" && (
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-paper p-3.5">
                  <Field label="Nghề chính">
                    <select className="field-input" value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
                      {["dien", "nuoc", "dieuhoa", "giupviec", "khoa", "son", "noithat", "vesinh"].map((c) => (
                        <option key={c} value={c}>{c === "dien" ? "Sửa điện" : c === "nuoc" ? "Ống nước" : c === "dieuhoa" ? "Điều hòa" : c === "giupviec" ? "Giúp việc" : c === "khoa" ? "Sửa khóa" : c === "son" ? "Sơn sửa" : c === "noithat" ? "Nội thất" : "Vệ sinh"}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Khu vực">
                    <select className="field-input" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })}>
                      {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Kinh nghiệm (năm)">
                    <input type="number" min={0} max={40} className="field-input" value={f.yearsExp} onChange={(e) => setF({ ...f, yearsExp: Number(e.target.value) })} />
                  </Field>
                  <Field label="Giá từ (₫)">
                    <input type="number" min={10000} step={10000} className="field-input" value={f.priceFrom} onChange={(e) => setF({ ...f, priceFrom: Number(e.target.value) })} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Giới thiệu ngắn">
                      <textarea rows={2} className="field-input" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="Vài dòng về tay nghề của bạn…" />
                    </Field>
                  </div>
                  <p className="col-span-2 flex items-center gap-1.5 text-[12px] text-mute"><Icon name="clock" size={13} /> Hồ sơ sẽ chờ Admin duyệt trước khi bạn nhận được việc.</p>
                </div>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full" iconRight={loading ? undefined : "arrowR"}>
                {mode === "login" ? "Đăng nhập" : regRole === "customer" ? "Tạo tài khoản khách hàng" : "Gửi hồ sơ thợ"}
              </Button>
            </form>
          </div>

          {/* demo nhanh */}
          <div className="mt-5">
            <p className="mb-2.5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-mute">Thử nhanh 3 vai trò</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMOS.map((d) => (
                <button key={d.email} onClick={() => quickLogin(d.email)} disabled={loading} className={cls("group rounded-xl border-[1.5px] border-line bg-card px-2 py-3.5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50", d.cls)}>
                  <span className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-paper transition group-hover:scale-110"><Icon name={d.icon} size={16} /></span>
                  <span className="text-[12px] font-bold leading-tight">{d.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => { resetAll(); push("Đã khôi phục dữ liệu demo về ban đầu."); }} className="mt-4 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-semibold text-mute transition hover:text-safety-600">
              <Icon name="refresh" size={13} /> Khôi phục dữ liệu demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
