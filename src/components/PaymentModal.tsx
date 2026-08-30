import { useEffect, useState } from "react";
import { Modal, Button, useToast } from "./ui";
import { Icon } from "./Icons";
import { fmtVND, cls } from "../lib/format";
import { getPlatformFee, payForJob } from "../lib/api";
import type { Job, Payment, PaymentMethod } from "../lib/types";

type Step = "summary" | "processing" | "success";

const METHODS: { id: PaymentMethod; label: string; desc: string; icon: "wallet" | "tag" | "home" }[] = [
  { id: "vnpay_qr", label: "VNPay — Quét QR", desc: "Quét bằng app ngân hàng, xác nhận tức thì", icon: "wallet" },
  { id: "vnpay_card", label: "VNPay — Thẻ ATM", desc: "Thẻ nội địa / quốc tế qua cổng VNPay", icon: "tag" },
  { id: "cod", label: "Thanh toán khi hoàn thành", desc: "Trả tiền mặt cho thợ sau khi nghiệm thu", icon: "home" },
];

export function PaymentModal({ job, amount, workerName, onClose, onPaid }: {
  job: Job;
  amount: number;
  workerName?: string;
  onClose: () => void;
  onPaid: (p: Payment) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState<Step>("summary");
  const [method, setMethod] = useState<PaymentMethod>("vnpay_qr");
  const [result, setResult] = useState<Payment | null>(null);
  const feeRate = getPlatformFee();
  const fee = Math.round((amount * feeRate) / 100);

  const start = async () => {
    setStep("processing");
    try {
      const p = await payForJob(job.id, method);
      setResult(p);
      // giữ màn hình "đang xử lý" một nhịp để tạo cảm giác cổng thanh toán phản hồi
      setTimeout(() => {
        setStep("success");
        onPaid(p);
      }, 900);
    } catch (e) {
      push(e instanceof Error ? e.message : "Thanh toán thất bại, thử lại nhé.", "err");
      setStep("summary");
    }
  };

  const methodMeta = METHODS.find((m) => m.id === method)!;

  return (
    <Modal
      open
      onClose={step === "processing" ? () => {} : onClose}
      title={step === "success" ? "Thanh toán thành công" : "Thanh toán dịch vụ"}
      sub={step === "success" ? undefined : `${job.code} · ${job.title}`}
      w="max-w-md"
    >
      {/* ---------- BƯỚC 1: TÓM TẮT ---------- */}
      {step === "summary" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-paper/60 p-4">
            <div className="flex items-center justify-between text-[13px] text-mute">
              <span>Công việc</span>
              <span className="font-mono font-bold text-ink-800">{job.code}</span>
            </div>
            <p className="mt-1.5 text-[14px] font-bold leading-snug text-ink-900">{job.title}</p>
            {workerName && (
              <p className="mt-1 text-[12.5px] text-mute">
                Thực hiện bởi <b className="text-ink-800">{workerName}</b> · {job.district}
              </p>
            )}
            <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px]">
              <div className="flex justify-between text-mute"><span>Giá trị dịch vụ</span><span className="font-semibold text-ink-800">{fmtVND(amount)}</span></div>
              <div className="flex justify-between text-mute"><span>Phí nền tảng ({feeRate}%)</span><span className="font-semibold text-ink-800">đã gồm trong giá</span></div>
              <div className="flex justify-between border-t border-line pt-2 text-[15px] font-extrabold text-ink-900">
                <span>Tổng thanh toán</span><span className="text-safety-600">{fmtVND(amount)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="field-label">Chọn phương thức thanh toán</p>
            <div className="space-y-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cls(
                    "flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all",
                    method === m.id ? "border-safety-500 bg-safety-50" : "border-line bg-card hover:border-ink-900/30",
                  )}
                >
                  <span className={cls("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", method === m.id ? "bg-safety-500 text-white" : "bg-paper text-ink-700")}>
                    <Icon name={m.icon} size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-bold text-ink-900">{m.label}</span>
                    <span className="block text-[12px] text-mute">{m.desc}</span>
                  </span>
                  <span className={cls("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", method === m.id ? "border-safety-500 bg-safety-500 text-white" : "border-line")}>
                    {method === m.id && <Icon name="check" size={11} />}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" icon="lock" className="w-full" onClick={start}>
            {method === "cod" ? "Xác nhận trả khi hoàn thành" : `Thanh toán ${fmtVND(amount)}`}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-[11.5px] text-mute">
            <Icon name="shield" size={13} className="text-good-500" />
            Giao dịch sandbox mô phỏng VNPay — không phát sinh tiền thật.
          </p>
        </div>
      )}

      {/* ---------- BƯỚC 2: ĐANG XỬ LÝ ---------- */}
      {step === "processing" && (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="relative">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-safety-500/15 text-safety-600">
              <Icon name={method === "cod" ? "home" : "wallet"} size={30} />
            </span>
            <span className="absolute -inset-2 animate-ping rounded-3xl border-2 border-safety-500/40" />
          </div>
          <p className="mt-6 font-display text-[16px] font-bold text-ink-900">
            {method === "cod" ? "Đang ghi nhận…" : "Đang kết nối cổng VNPay…"}
          </p>
          <p className="mt-1 text-[13px] text-mute">
            {method === "cod" ? "Bạn sẽ thanh toán cho thợ sau khi nghiệm thu." : "Vui lòng chờ, đừng tắt cửa sổ này."}
          </p>
          <div className="mt-5 flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-safety-500" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* ---------- BƯỚC 3: THÀNH CÔNG ---------- */}
      {step === "success" && result && (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="anim-pop flex h-16 w-16 items-center justify-center rounded-full bg-good-500 text-white shadow-[0_8px_24px_-6px_rgba(18,147,111,0.6)]">
            <Icon name="check" size={32} />
          </span>
          <p className="mt-5 font-display text-[19px] font-extrabold text-ink-900">
            {result.method === "cod" ? "Đã ghi nhận thanh toán sau" : "Thanh toán thành công!"}
          </p>
          <p className="mt-1 text-[13px] text-mute">
            {result.method === "cod"
              ? "Hệ thống sẽ nhắc bạn thanh toán khi việc hoàn thành."
              : `${fmtVND(result.amount)} đã được xử lý qua ${methodMeta.label.split("—")[0].trim()}.`}
          </p>
          <div className="mt-4 w-full rounded-xl bg-paper/70 px-4 py-3 font-mono text-[12.5px]">
            <div className="flex justify-between text-mute"><span>Mã giao dịch</span><span className="font-bold text-ink-900">{result.txnRef}</span></div>
            <div className="mt-1 flex justify-between text-mute"><span>Công việc</span><span className="font-bold text-ink-900">{job.code}</span></div>
            <div className="mt-1 flex justify-between text-mute"><span>Số tiền</span><span className="font-bold text-safety-600">{fmtVND(result.amount)}</span></div>
          </div>
          <Button size="lg" className="mt-5 w-full" iconRight="arrowR" onClick={onClose}>
            Quay lại công việc
          </Button>
        </div>
      )}
    </Modal>
  );
}
