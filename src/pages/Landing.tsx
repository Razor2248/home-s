import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDB, useSession } from "../lib/store";
import { cls, fmtK, fmtVND, setIntent, timeAgo, DISTRICTS, JOB_STATUS } from "../lib/format";
import { CATEGORY_ICON, FALLBACK_ICON, Icon, Logo, type IconName } from "../components/Icons";
import { Button, Reveal, SectionTitle, Stars } from "../components/ui";
import type { WorkerProfile } from "../lib/types";

/* ---------- dữ liệu tĩnh cho landing ---------- */
const QUOTES = [
  { text: "Đăng việc lúc 9h sáng, 9h20 đã có 3 báo giá. Chọn anh Tuấn, trưa là nhà có điện lại. Quá đã!", name: "Minh Anh", where: "Bình Thạnh", cat: "Sửa điện" },
  { text: "Giá chốt trên app sao thợ làm đúng vậy, không phát sinh một đồng. Có phiếu bảo hành hẳn hoi.", name: "Chị Lan", where: "Quận 7", cat: "Ống nước" },
  { text: "11 giờ đêm kẹt khóa ngoài đường, 15 phút sau chú Long có mặt. Cảm ơn nền tảng rất nhiều!", name: "Thu Ngọc", where: "Quận 1", cat: "Sửa khóa" },
  { text: "Từ ngày chạy trên Home Services, lịch làm của tôi kín tuần, thu nhập tăng gần gấp đôi.", name: "Thợ điện Văn Tuấn", where: "Đối tác 2 năm", cat: "Đối tác thợ" },
  { text: "Đội vệ sinh đến đúng hẹn, máy móc chuyên nghiệp, căn hộ sau sửa sạch bong như mới.", name: "Anh Hải", where: "Thủ Đức", cat: "Vệ sinh" },
];

const STEPS = [
  { n: "01", icon: "clipboard" as IconName, title: "Đăng việc trong 60 giây", desc: "Mô tả sự cố, ngân sách mong muốn và thời gian phù hợp. Hoàn toàn miễn phí." },
  { n: "02", icon: "wallet" as IconName, title: "Nhận báo giá công khai", desc: "Thợ trong khu vực gửi giá và thời gian có mặt. Mọi thứ minh bạch, không mặc cả mù mờ." },
  { n: "03", icon: "users" as IconName, title: "So sánh & chọn thợ", desc: "Xem đánh giá thật, số việc đã làm, chứng nhận — rồi chọn người bạn tin." },
  { n: "04", icon: "shield" as IconName, title: "Nghiệm thu & đánh giá", desc: "Xong việc mới thanh toán. Đánh giá của bạn giúp cộng đồng chọn thợ tốt hơn." },
];

export default function Landing() {
  const db = useDB();
  const session = useSession();
  const navigate = useNavigate();
  const [cat, setCat] = useState<string | null>(null);
  const [district, setDistrict] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const approved = db.workers.filter((w) => w.approval === "approved");
  const avgRating = approved.length
    ? (approved.reduce((s, w) => s + w.rating, 0) / approved.filter((w) => w.ratingCount > 0).length || 4.8).toFixed(1)
    : "4.8";

  const feed = useMemo(() => {
    return db.jobs
      .filter((j) => j.status !== "cancelled")
      .slice(0, 6)
      .map((j) => {
        const c = db.categories.find((x) => x.id === j.categoryId);
        const u = db.users.find((x) => x.id === j.customerId);
        return { id: j.id, code: j.code, title: j.title, district: j.district, status: j.status, icon: (c && CATEGORY_ICON[c.id]) || FALLBACK_ICON, color: c?.color ?? "#f4581c", who: u?.name ?? "Khách", ago: j.createdAt };
      });
  }, [db]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 3000);
    return () => clearInterval(t);
  }, []);
  const feedLen = Math.max(1, feed.length);
  const shownFeed = Array.from({ length: Math.min(4, feed.length) }, (_, i) => feed[(tick + i) % feedLen]);

  const goPost = () => {
    setIntent({ type: "post", categoryId: cat ?? undefined, district: district || undefined });
    if (session?.role === "customer") navigate("/app/customer/post");
    else navigate("/login");
  };
  const goBrowse = (categoryId?: string) => {
    setIntent(categoryId ? { type: "browse", categoryId } : null);
    if (session?.role === "customer") navigate("/app/customer/workers");
    else navigate("/login");
  };

  const topWorkers = [...approved].filter((w) => w.verified).sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <div className="min-h-screen bg-paper">
      {/* ================= TOP NAV ================= */}
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center gap-6 px-4 md:px-6">
          <a href="#top" className="transition hover:opacity-80"><Logo size={38} /></a>
          <nav className="ml-6 hidden items-center gap-6 text-[14px] font-semibold text-ink-700 lg:flex">
            <a href="#dich-vu" className="transition hover:text-safety-600">Dịch vụ</a>
            <a href="#cach-hoat-dong" className="transition hover:text-safety-600">Cách hoạt động</a>
            <a href="#tho" className="transition hover:text-safety-600">Thợ nổi bật</a>
            <a href="#cam-ket" className="transition hover:text-safety-600">Cam kết</a>
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            {session ? (
              <Button size="sm" onClick={() => navigate(`/app/${session.role === "admin" ? "admin" : session.role}`)} iconRight="arrowR">
                Vào trang quản lý
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Đăng nhập</Button>
                <Button size="sm" icon="wrench" onClick={goPost} className="hidden sm:inline-flex">Đăng việc ngay</Button>
              </>
            )}
            <button className="rounded-lg p-2 text-ink-800 lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              <Icon name={menuOpen ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-line bg-paper px-4 py-3 lg:hidden">
            {["dich-vu", "cach-hoat-dong", "tho", "cam-ket"].map((id, i) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-[14.5px] font-semibold text-ink-800 hover:bg-ink-900/5">
                {["Dịch vụ", "Cách hoạt động", "Thợ nổi bật", "Cam kết"][i]}
              </a>
            ))}
            <Button className="mt-2 w-full" onClick={() => { setMenuOpen(false); goPost(); }}>Đăng việc ngay</Button>
          </div>
        )}
      </header>

      {/* ================= HERO: BẢNG VIỆC TRỰC TIẾP ================= */}
      <section id="top" className="bg-blueprint relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-safety-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-8 hidden rotate-12 text-ink-900/[0.045] xl:block">
          <Icon name="wrench" size={330} strokeWidth={1.1} />
        </div>

        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-20 pt-12 md:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:pt-16">
          <div className="anim-fadeUp">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-700">
              <span className="live-dot h-2 w-2 rounded-full bg-good-500" />
              {approved.length} thợ đã xác minh đang chờ việc tại TP.HCM
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,5.6vw,4.3rem)] font-extrabold leading-[1.03] tracking-tight text-ink-900">
              Hỏng gì trong nhà?
              <br />
              Có{" "}
              <span className="relative inline-block text-safety-600">
                thợ giỏi
                <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 220 12" fill="none" aria-hidden>
                  <path d="M3 9c40-6 140-6 214-3" stroke="#f4581c" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>{" "}
              lo ngay.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-mute">
              Điện chập, ống nước rò, khóa kẹt lúc nửa đêm — đăng việc một lần, nhận nhiều báo giá minh bạch từ thợ đã xác minh trong khu vực của bạn.
            </p>

            {/* phiếu đăng việc nhanh */}
            <div className="mt-8 max-w-xl rounded-2xl border-2 border-ink-900 bg-card p-4 shadow-[7px_7px_0_#0b1b2e]">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-mute">PHIẾU YÊU CẦU — MIỄN PHÍ</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {db.categories.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCat(cat === c.id ? null : c.id)}
                    className={cls(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-[12px] font-semibold transition-all",
                      cat === c.id ? "border-safety-500 bg-safety-50 text-safety-600" : "border-line text-ink-700 hover:border-ink-900/40",
                    )}
                  >
                    <span style={{ color: c.color }}><Icon name={(CATEGORY_ICON[c.id] || FALLBACK_ICON) as IconName} size={15} /></span>
                    <span className="truncate">{c.name.split(" ")[0] === "Sửa" ? c.name.split(" ").slice(1, 2).join(" ") : c.name.split(" ").slice(0, 1).join(" ")}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="field-input sm:max-w-[200px]">
                  <option value="">Tất cả khu vực</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <Button size="md" iconRight="arrowR" onClick={goPost} className="flex-1">
                  {cat ? "Đăng việc & nhận báo giá" : "Tìm thợ phù hợp"}
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] text-mute">
              <span className="flex items-center gap-2 font-semibold text-ink-800">
                <Stars value={5} size={13} /> {avgRating}/5
              </span>
              <span>từ {db.reviews.length * 270}+ đánh giá thật</span>
              <span className="flex items-center gap-1.5"><Icon name="shield" size={15} className="text-good-500" /> Thợ xác minh danh tính</span>
            </div>
          </div>

          {/* bảng việc trực tiếp */}
          <div className="anim-fadeUp relative" style={{ animationDelay: "0.12s" }}>
            <div className="rounded-2xl bg-ink-900 bg-blueprint-dark p-5 text-paper shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-400">Bảng việc trực tiếp</p>
                <span className="flex items-center gap-1.5 rounded-full bg-good-500/15 px-2.5 py-1 text-[11px] font-bold text-good-500">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-good-500" /> LIVE
                </span>
              </div>
              <div className="space-y-2.5">
                {shownFeed.map((f, i) => (
                  <div key={`${f.id}-${tick}-${i}`} className="anim-feed flex items-center gap-3 rounded-xl bg-white/[0.05] p-3 transition hover:bg-white/[0.09]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${f.color}26`, color: f.color }}>
                      <Icon name={f.icon as IconName} size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold">{f.title}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-400">{f.who} · {f.district} · {timeAgo(f.ago)}</p>
                    </div>
                    <span className={cls("shrink-0 rounded-md px-2 py-1 text-[10.5px] font-bold", JOB_STATUS[f.status].cls)}>{JOB_STATUS[f.status].label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5 text-[12px] text-ink-400">
                <span className="font-mono">{db.jobs.length} việc đang mở hôm nay</span>
                <button onClick={goPost} className="flex items-center gap-1 font-bold text-safety-400 transition hover:text-safety-500">
                  Đăng việc của bạn <Icon name="arrowR" size={13} />
                </button>
              </div>
            </div>

            <div className="anim-float absolute -left-3 -top-5 rotate-[-4deg] rounded-xl border-2 border-ink-900 bg-card px-3.5 py-2.5 shadow-[4px_4px_0_#0b1b2e] sm:-left-8">
              <p className="flex items-center gap-2 text-[12.5px] font-bold text-ink-900"><Icon name="clock" size={15} className="text-safety-600" /> Phản hồi ~15 phút</p>
            </div>
            <div className="anim-float absolute -bottom-5 right-4 rotate-[3deg] rounded-xl border-2 border-ink-900 bg-safety-500 px-3.5 py-2.5 shadow-[4px_4px_0_#0b1b2e]" style={{ animationDelay: "1.2s" }}>
              <p className="flex items-center gap-2 text-[12.5px] font-bold text-white"><Icon name="shield" size={15} /> Bảo hành tới 30 ngày</p>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="marquee overflow-hidden border-y-2 border-ink-900 bg-safety-500 py-3">
          <div className="marquee-track flex w-max items-center gap-8">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-8">
                {db.categories.map((c) => (
                  <span key={c.id + dup} className="flex items-center gap-2.5 font-display text-[15px] font-bold uppercase tracking-wide text-ink-900">
                    <Icon name={(CATEGORY_ICON[c.id] || FALLBACK_ICON) as IconName} size={17} /> {c.name}
                    <span className="ml-5 inline-block h-2 w-2 rotate-45 bg-ink-900" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DỊCH VỤ ================= */}
      <section id="dich-vu" className="mx-auto max-w-[1200px] px-4 py-20 md:px-6">
        <Reveal>
          <SectionTitle
            kicker="Dịch vụ"
            title={<>Đủ mọi nghề cho ngôi nhà của bạn</>}
            desc="Từ bóng đèn hỏng đến tổng vệ sinh cả căn hộ — mỗi danh mục đều có nhiều thợ cạnh tranh báo giá để bạn chọn."
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {db.categories.map((c, i) => {
            const count = approved.filter((w) => w.categoryId === c.id).length;
            return (
              <Reveal key={c.id} delay={i * 60}>
                <button
                  onClick={() => goBrowse(c.id)}
                  className="group w-full rounded-xl border border-line bg-card p-5 text-left transition-all duration-200 hover:-translate-y-1.5 hover:border-ink-900 hover:shadow-[5px_5px_0_#0b1b2e]"
                >
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-hover:-rotate-6" style={{ background: `${c.color}1c`, color: c.color }}>
                    <Icon name={(CATEGORY_ICON[c.id] || FALLBACK_ICON) as IconName} size={24} />
                  </span>
                  <p className="font-display text-[15.5px] font-bold text-ink-900">{c.name}</p>
                  <p className="mt-1 text-[12.5px] text-mute">
                    {count} thợ · từ {fmtK(c.priceMin)}/{c.unit}
                  </p>
                  <p className="mt-3 flex items-center gap-1 text-[12.5px] font-bold text-safety-600 opacity-0 transition group-hover:opacity-100">
                    Xem thợ <Icon name="arrowR" size={13} />
                  </p>
                </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================= CÁCH HOẠT ĐỘNG ================= */}
      <section id="cach-hoat-dong" className="bg-ink-900 bg-blueprint-dark text-paper">
        <div className="stripes h-2.5" />
        <div className="mx-auto max-w-[1200px] px-4 py-20 md:px-6">
          <Reveal>
            <SectionTitle dark kicker="Cách hoạt động" title={<>4 bước, xong trong một buổi</>} desc="Không gọi điện lòng vòng, không lo giá trên trời. Mọi thứ diễn ra ngay trên nền tảng." />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="group h-full border-l-2 border-dashed border-ink-700 py-1 pl-6 transition-all hover:border-safety-500 hover:pl-8">
                  <span className="font-mono text-[13px] font-bold text-safety-400">{s.n}</span>
                  <span className="mt-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-safety-400 transition group-hover:bg-safety-500 group-hover:text-white">
                    <Icon name={s.icon} size={22} />
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-bold">{s.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-400">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="stripes h-2.5" />
      </section>

      {/* ================= THỢ NỔI BẬT ================= */}
      <section id="tho" className="mx-auto max-w-[1200px] px-4 py-20 md:px-6">
        <Reveal>
          <SectionTitle
            kicker="Đối tác thợ"
            title={<>Những đôi tay vàng trong làng</>}
            desc="Hồ sơ thật, đánh giá thật, việc đã làm thật. Bạn chọn — không phải chúng tôi chọn hộ."
            right={<Button variant="outline" size="sm" iconRight="arrowR" onClick={() => goBrowse()}>Xem tất cả thợ</Button>}
          />
        </Reveal>
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {topWorkers.map((w, i) => (
            <Reveal key={w.id} delay={i * 70} className="w-[292px] shrink-0 snap-start">
              <WorkerCard w={w} db={db} onBook={() => goBrowse(w.categoryId)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= CAM KẾT ================= */}
      <section id="cam-ket" className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 md:grid-cols-3 md:px-6">
          {[
            { icon: "shield" as IconName, title: "Thợ xác minh danh tính", desc: "Mỗi đối tác thợ nộp CCCD và chứng chỉ nghề, được Admin duyệt từng hồ sơ trước khi nhận việc." },
            { icon: "wallet" as IconName, title: "Giá chốt trước khi làm", desc: "Báo giá hiển thị công khai trên phiếu việc. Thợ chỉ được thanh toán đúng mức giá bạn đã chấp nhận." },
            { icon: "wrench" as IconName, title: "Bảo hành sau dịch vụ", desc: "Hỗ trợ xử lý lại miễn phí trong thời gian bảo hành nếu sự cố tái diễn. Không hài lòng — hoàn tiền." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 rotate-[-4deg] items-center justify-center rounded-xl bg-safety-500 text-white shadow-[3px_3px_0_#0b1b2e]">
                  <Icon name={c.icon} size={22} />
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-bold text-ink-900">{c.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-mute">{c.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= ĐÁNH GIÁ ================= */}
      <section className="overflow-hidden py-20">
        <Reveal>
          <SectionTitle kicker="Người dùng nói gì" title={<>Hàng xóm của bạn đã thử — và khen</>} />
        </Reveal>
        <div className="marquee">
          <div className="marquee-track flex w-max gap-5">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex gap-5">
                {QUOTES.map((q, i) => (
                  <figure key={i} className="w-[330px] shrink-0 rounded-xl border border-line bg-card p-6">
                    <Stars value={5} size={13} />
                    <blockquote className="mt-3 text-[14.5px] leading-relaxed text-ink-800">“{q.text}”</blockquote>
                    <figcaption className="mt-4 flex items-center justify-between">
                      <span className="text-[13.5px] font-bold text-ink-900">{q.name} <span className="font-medium text-mute">· {q.where}</span></span>
                      <span className="rounded-md bg-safety-50 px-2 py-0.5 text-[11px] font-bold text-safety-600">{q.cat}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA KÉP ================= */}
      <section className="mx-auto max-w-[1200px] px-4 pb-24 md:px-6">
        <div className="grid gap-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="bg-blueprint-dark relative h-full overflow-hidden rounded-2xl bg-ink-900 p-8 text-paper md:p-12">
              <Icon name="home" size={210} className="pointer-events-none absolute -bottom-10 -right-8 text-white/[0.05]" />
              <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.2em] text-safety-400">Dành cho khách hàng</p>
              <h3 className="mt-3 font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight">Cần thợ gấp?<br />Đăng việc — 60 giây là xong.</h3>
              <p className="mt-3 max-w-md text-[14.5px] text-ink-400">Miễn phí đăng việc, không cần thẻ. Báo giá đến từ nhiều thợ để bạn thoải mái so sánh.</p>
              <Button size="lg" iconRight="arrowR" className="mt-7" onClick={goPost}>Đăng việc miễn phí</Button>
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-2">
            <div className="flex h-full flex-col rounded-2xl bg-safety-500 p-8 text-ink-900 md:p-10">
              <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-900/70">Dành cho thợ</p>
              <h3 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight">Tay nghề giỏi?<br />Để việc tự tìm đến bạn.</h3>
              <p className="mt-3 flex-1 text-[14.5px] text-ink-900/75">Nhận việc đúng nghề, đúng khu vực. 0đ phí tháng đầu tiên.</p>
              <Button variant="dark" size="lg" className="mt-7" onClick={() => navigate("/login")} iconRight="arrowR">Đăng ký đối tác</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-ink-950 py-14 text-ink-400">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 md:grid-cols-[1.3fr_1fr_1fr_1.2fr] md:px-6">
          <div>
            <Logo size={34} dark />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed">Nền tảng kết nối dịch vụ gia đình — thợ điện, thợ nước, giúp việc, sửa khóa… minh bạch và nhanh chóng.</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-mono text-[12.5px] text-paper">
              <Icon name="phone" size={14} className="text-safety-400" /> 1900 6868
            </p>
          </div>
          <div>
            <p className="mb-3 font-display text-[14px] font-bold text-paper">Dịch vụ</p>
            <ul className="space-y-2 text-[13.5px]">
              {db.categories.slice(0, 5).map((c) => (
                <li key={c.id}><button className="transition hover:text-safety-400" onClick={() => goBrowse(c.id)}>{c.name}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-display text-[14px] font-bold text-paper">Nền tảng</p>
            <ul className="space-y-2 text-[13.5px]">
              <li><a href="#cach-hoat-dong" className="transition hover:text-safety-400">Cách hoạt động</a></li>
              <li><a href="#cam-ket" className="transition hover:text-safety-400">Cam kết bảo hành</a></li>
              <li><button className="transition hover:text-safety-400" onClick={() => navigate("/login")}>Trở thành đối tác</button></li>
              <li><button className="transition hover:text-safety-400" onClick={() => navigate("/login")}>Đăng nhập</button></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-display text-[14px] font-bold text-paper">Liên hệ</p>
            <ul className="space-y-2 text-[13.5px]">
              <li className="flex items-center gap-2"><Icon name="pin" size={14} /> 227 Nguyễn Văn Cừ, Quận 5, TP.HCM</li>
              <li className="flex items-center gap-2"><Icon name="chat" size={14} /> hotro@homeservices.vn</li>
              <li className="flex items-center gap-2"><Icon name="clock" size={14} /> 8:00 – 21:00 mỗi ngày</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[1200px] border-t border-white/10 px-4 pt-6 text-[12.5px] md:px-6">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            © 2026 Home Services — Đồ án tốt nghiệp · Demo giai đoạn 1, dữ liệu mô phỏng.
            <Link to="/docs" className="inline-flex items-center gap-1.5 rounded-lg bg-safety-500/15 px-3 py-1.5 font-mono text-[11.5px] font-bold text-safety-400 transition hover:bg-safety-500 hover:text-white">
              <Icon name="code" size={13} /> Tài liệu GĐ2: CSDL + API
              <Icon name="arrowR" size={13} />
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

function WorkerCard({ w, db, onBook }: { w: WorkerProfile; db: ReturnType<typeof useDB>; onBook: () => void }) {
  const cat = db.categories.find((c) => c.id === w.categoryId);
  return (
    <div className="group h-full rounded-xl border border-line bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-ink-900 hover:shadow-[5px_5px_0_#0b1b2e]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-[15px] font-bold text-white" style={{ background: cat?.color ?? "#f4581c" }}>
          {w.name.split(" ").slice(-1)[0][0]}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate font-display text-[15.5px] font-bold text-ink-900">
            {w.name}
            {w.verified && <Icon name="shield" size={15} className="shrink-0 text-good-500" />}
          </p>
          <p className="truncate text-[12.5px] text-mute">{cat?.name} · {w.district}</p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-2 text-[13px]">
        <Stars value={w.rating} size={13} />
        <span className="font-bold text-ink-900">{w.rating.toFixed(1)}</span>
        <span className="text-mute">({w.ratingCount})</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-mute">
        <span className="flex items-center gap-1.5"><Icon name="briefcase" size={13} /> {w.jobsDone} việc</span>
        <span className="flex items-center gap-1.5"><Icon name="clock" size={13} /> ~{w.responseMins} phút</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <span className="text-[13px] text-mute">từ <b className="text-[15px] text-ink-900">{fmtVND(w.priceFrom)}</b></span>
        <Button size="xs" variant="outline" onClick={onBook}>Xem & đặt lịch</Button>
      </div>
    </div>
  );
}
