import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DEMO_SCRIPT, GROUPS, TEST_CASES, clearQA, loadQA, saveQA,
  type GroupId, type TestResult, type TestStatus,
} from "../data/testcases";
import { cls } from "../lib/format";
import { Icon, Logo } from "../components/Icons";
import { useToast } from "../components/ui";

const PRIO: Record<string, { label: string; cls: string }> = {
  P0: { label: "P0 — Bắt buộc", cls: "bg-safety-500 text-white" },
  P1: { label: "P1 — Quan trọng", cls: "bg-ink-600 text-white" },
  P2: { label: "P2 — Bổ sung", cls: "bg-white/12 text-ink-400" },
};

export default function TestPage() {
  const { push } = useToast();
  const [results, setResults] = useState<Record<string, TestResult>>(() => loadQA());
  const [tab, setTab] = useState<"all" | GroupId>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hideDone, setHideDone] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const update = (id: string, patch: Partial<TestResult>) => {
    setResults((prev) => {
      const cur: TestResult = prev[id] ?? { s: "pass", note: "", at: Date.now() };
      const next = { ...prev, [id]: { ...cur, ...patch, at: Date.now() } };
      saveQA(next);
      return next;
    });
  };
  const setStatus = (id: string, s: TestStatus) => {
    update(id, { s });
    push(s === "pass" ? `${id} — PASS ✓ đã ghi nhận` : `${id} — FAIL đã ghi nhận, nhớ ghi chú nguyên nhân.`);
  };

  const list = useMemo(() => {
    const base = tab === "all" ? TEST_CASES : TEST_CASES.filter((t) => t.group === tab);
    return hideDone ? base.filter((t) => !results[t.id]) : base;
  }, [tab, hideDone, results]);

  const total = TEST_CASES.length;
  const marked = TEST_CASES.filter((t) => results[t.id]).length;
  const passed = TEST_CASES.filter((t) => results[t.id]?.s === "pass").length;
  const failed = marked - passed;
  const passRate = marked ? Math.round((passed / marked) * 100) : 0;
  const coverage = Math.round((marked / total) * 100);

  const copyScript = async () => {
    const text = DEMO_SCRIPT.map((s, i) => `${i + 1}. [${s.time}] (${s.role}) ${s.action}`).join("\n");
    try {
      await navigator.clipboard.writeText(`KỊCH BẢN DEMO BẢO VỆ — HOME SERVICES\n${text}`);
      push("Đã copy kịch bản demo vào clipboard.");
    } catch {
      push("Trình duyệt chặn clipboard, hãy bôi đen và copy thủ công.", "err");
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 bg-blueprint-dark text-paper">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-[1180px] items-center gap-4 px-4 md:px-7">
          <Link to="/" className="transition hover:opacity-80"><Logo size={36} dark /></Link>
          <div>
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-safety-400">Giai đoạn 6 · Nghiệm thu</p>
            <p className="text-[13px] font-bold text-white">Trung tâm kiểm thử QA</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/report" className="hidden items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-[13px] font-bold text-paper transition hover:border-safety-500 hover:text-safety-400 md:flex">
              <Icon name="clipboard" size={15} /> Báo cáo
            </Link>
            <Link to="/" className="flex items-center gap-1.5 rounded-lg bg-safety-500 px-3.5 py-2 text-[13px] font-bold text-white transition hover:bg-safety-600">
              <Icon name="home" size={15} /> Trang chủ
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-8 md:px-7">
        {/* intro + ring */}
        <div className="anim-fadeUp mb-8 flex flex-col gap-6 rounded-2xl border border-white/10 bg-ink-900/70 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex-1">
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold leading-tight text-white">
              Kiểm thử theo kịch bản — <span className="text-safety-400">không cần biết code</span>
            </h1>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-400">
              Mỗi dòng là một test case: làm theo <b className="text-paper">Các bước</b>, đối chiếu <b className="text-paper">Kết quả mong đợi</b>,
              rồi bấm <b className="text-good-500">PASS</b> hoặc <b className="text-danger-600">FAIL</b> (kèm ghi chú). Kết quả tự lưu trên trình duyệt này —
              dùng để điền vào bảng test trong báo cáo đồ án.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11.5px] font-bold">
              {Object.entries(PRIO).map(([k, v]) => (
                <span key={k} className={cls("rounded-md px-2 py-1", v.cls)}>{v.label}</span>
              ))}
            </div>
          </div>
          {/* progress ring */}
          <div className="flex items-center justify-center gap-6">
            <div className="relative h-[132px] w-[132px]">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke={failed > 0 && passRate < 100 ? "#dd9a2b" : "#12936f"} strokeWidth="9"
                  strokeLinecap="round" strokeDasharray={`${(passRate / 100) * 264} 264`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[30px] font-extrabold leading-none text-white">{marked ? `${passRate}%` : "—"}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">đạt / đã test</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { l: "Tổng test case", v: total, c: "text-white" },
                { l: "Đã kiểm tra", v: `${marked} · ${coverage}%`, c: "text-paper" },
                { l: "PASS", v: passed, c: "text-good-500" },
                { l: "FAIL", v: failed, c: failed ? "text-danger-600" : "text-ink-400" },
              ].map((x) => (
                <p key={x.l} className="flex items-baseline justify-between gap-6 text-[12.5px] font-semibold text-ink-400">
                  {x.l} <span className={cls("font-display text-[17px] font-extrabold", x.c)}>{x.v}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
            <button
              onClick={() => setTab("all")}
              className={cls("shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-all", tab === "all" ? "bg-safety-500 text-white" : "bg-white/[0.06] text-ink-400 hover:text-white")}
            >
              Tất cả <span className="ml-1 font-mono text-[11px] opacity-80">{TEST_CASES.length}</span>
            </button>
            {GROUPS.map((g) => {
              const n = TEST_CASES.filter((t) => t.group === g.id).length;
              const p = TEST_CASES.filter((t) => t.group === g.id && results[t.id]?.s === "pass").length;
              return (
                <button
                  key={g.id}
                  onClick={() => setTab(g.id)}
                  className={cls("shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-all", tab === g.id ? "bg-safety-500 text-white" : "bg-white/[0.06] text-ink-400 hover:text-white")}
                >
                  {g.short} <span className="ml-1 font-mono text-[11px] opacity-80">{p}/{n}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setHideDone((v) => !v)}
            className={cls("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] font-bold transition", hideDone ? "border-safety-500 bg-safety-500/15 text-safety-400" : "border-white/15 text-ink-400 hover:text-white")}
          >
            <Icon name="eye" size={14} /> {hideDone ? "Đang ẩn đã test" : "Ẩn đã test"}
          </button>
          {confirmReset ? (
            <span className="flex items-center gap-1.5">
              <button onClick={() => { setResults({}); clearQA(); setConfirmReset(false); push("Đã xóa toàn bộ kết quả test."); }} className="rounded-lg bg-danger-600 px-3 py-2 text-[12.5px] font-bold text-white transition hover:brightness-110">Chắc chắn?</button>
              <button onClick={() => setConfirmReset(false)} className="rounded-lg border border-white/15 px-3 py-2 text-[12.5px] font-bold text-ink-400 hover:text-white">Thôi</button>
            </span>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-[12.5px] font-bold text-ink-400 transition hover:border-danger-600 hover:text-danger-600">
              <Icon name="refresh" size={14} /> Test lại từ đầu
            </button>
          )}
        </div>

        {/* danh sách test case */}
        <div className="space-y-2.5">
          {list.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/20 py-14 text-center text-[14px] text-ink-400">Không còn test case nào ở bộ lọc này.</p>
          )}
          {list.map((t, i) => {
            const r = results[t.id];
            const open = expanded === t.id;
            return (
              <div
                key={t.id}
                className={cls(
                  "anim-fadeUp overflow-hidden rounded-xl border transition-all",
                  r?.s === "pass" ? "border-good-500/40 bg-good-500/[0.05]" : r?.s === "fail" ? "border-danger-600/50 bg-danger-600/[0.06]" : "border-white/10 bg-ink-900/70 hover:border-white/25",
                )}
                style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
              >
                <button onClick={() => setExpanded(open ? null : t.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left md:gap-4">
                  <span className={cls("hidden shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold sm:inline", PRIO[t.priority].cls)}>{t.priority}</span>
                  <span className="shrink-0 font-mono text-[12px] font-bold text-safety-400">{t.id}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cls("block truncate text-[14px] font-bold", open ? "text-white" : "text-paper")}>{t.feature}</span>
                    <span className="text-[11px] text-ink-400">{GROUPS.find((g) => g.id === t.group)?.label}</span>
                  </span>
                  {r && (
                    <span className={cls("anim-pop shrink-0 rounded-md px-2 py-1 font-mono text-[11px] font-extrabold", r.s === "pass" ? "bg-good-500 text-white" : "bg-danger-600 text-white")}>
                      {r.s === "pass" ? "PASS" : "FAIL"}
                    </span>
                  )}
                  <Icon name="chevD" size={16} className={cls("shrink-0 text-ink-400 transition-transform duration-300", open && "rotate-180")} />
                </button>

                {open && (
                  <div className="anim-fadeUp border-t border-white/[0.07] px-4 py-4 md:px-5">
                    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                      <div>
                        <p className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">Các bước thực hiện</p>
                        <ol className="space-y-1.5">
                          {t.steps.map((s, si) => (
                            <li key={si} className="flex gap-2.5 text-[13px] leading-relaxed text-paper">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.08] font-mono text-[10.5px] font-bold text-safety-400">{si + 1}</span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-400">Kết quả mong đợi</p>
                        <p className="rounded-lg border border-good-500/30 bg-good-500/[0.07] px-3.5 py-3 text-[13px] leading-relaxed text-paper">{t.expected}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-center">
                      <input
                        value={r?.note ?? ""}
                        onChange={(e) => update(t.id, { note: e.target.value })}
                        placeholder="Ghi chú (lỗi gặp phải, bằng chứng ảnh chụp màn hình…)"
                        className="min-w-0 flex-1 rounded-lg border border-white/15 bg-ink-950/60 px-3.5 py-2.5 text-[13px] text-paper outline-none transition placeholder:text-ink-400/60 focus:border-safety-500"
                      />
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => setStatus(t.id, "pass")}
                          className={cls("flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-extrabold transition-all active:scale-95", r?.s === "pass" ? "bg-good-500 text-white" : "bg-good-500/15 text-good-500 hover:bg-good-500 hover:text-white")}
                        >
                          <Icon name="check" size={15} /> PASS
                        </button>
                        <button
                          onClick={() => setStatus(t.id, "fail")}
                          className={cls("flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-extrabold transition-all active:scale-95", r?.s === "fail" ? "bg-danger-600 text-white" : "bg-danger-600/15 text-danger-600 hover:bg-danger-600 hover:text-white")}
                        >
                          <Icon name="x" size={15} /> FAIL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* kịch bản demo */}
        <div className="mt-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2.5 font-display text-[20px] font-extrabold text-white">
                <span className="h-[3px] w-6 rounded-full bg-safety-500" /> Kịch bản demo bảo vệ (~8 phút)
              </h2>
              <p className="mt-1 text-[13px] text-ink-400">Trình tự gợi ý khi demo trước hội đồng — chạy bằng 3 tab trình duyệt cho 3 vai trò.</p>
            </div>
            <button onClick={copyScript} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2.5 text-[13px] font-bold text-paper transition hover:border-safety-500 hover:text-safety-400">
              <Icon name="clipboard" size={15} /> Copy kịch bản
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10">
            {DEMO_SCRIPT.map((s, i) => (
              <div key={s.action} className={cls("flex gap-4 bg-ink-900/70 px-5 py-3.5 transition hover:bg-ink-900", i > 0 && "border-t border-white/[0.06]")}>
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-safety-500 font-mono text-[12.5px] font-extrabold text-white">{i + 1}</span>
                  {i < DEMO_SCRIPT.length - 1 && <span className="mt-1 w-[2px] flex-1 bg-safety-500/25" />}
                </div>
                <div className="min-w-0 pb-1">
                  <p className="flex flex-wrap items-center gap-2 text-[13.5px] leading-relaxed text-paper">
                    <span className="rounded-md bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] font-bold text-safety-400">{s.time}</span>
                    <span className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[11px] font-bold text-ink-400">{s.role}</span>
                  </p>
                  <p className="mt-1 text-[13.5px] text-paper">{s.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-12 border-t border-white/10 py-6 text-center">
          <p className="font-mono text-[11.5px] text-ink-400">
            Home Services · Giai đoạn 6/6 — kết quả test lưu tại trình duyệt · xem thêm <Link to="/report" className="text-safety-400 hover:underline">Báo cáo tổng kết</Link> và <Link to="/docs" className="text-safety-400 hover:underline">Tài liệu kỹ thuật</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
