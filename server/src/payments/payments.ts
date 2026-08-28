import { Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import { IsBoolean, IsOptional } from "class-validator";
import { JobStatus, PaymentStatus, QuoteStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError, CurrentUser, Roles } from "../common";

class CallbackDto {
  @IsOptional() @IsBoolean() success?: boolean;
}

/**
 * THANH TOÁN SANDBOX (mô phỏng VNPay)
 * Luồng thật: create → chuyển hướng cổng VNPay → VNPay gọi IPN callback → verify chữ ký.
 * Sandbox: create → simulate-callback thay cho cổng thanh toán, giữ nguyên trạng thái & thông báo.
 */
@Roles(Role.CUSTOMER)
@Controller("payments")
export class PaymentsController {
  constructor(private prisma: PrismaService) {}

  /** Bước 1 — tạo giao dịch PENDING, trả txnRef để "chuyển hướng cổng thanh toán" */
  @Post("create")
  async create(@CurrentUser() u: AuthUser, @Body() d: { jobId: string; method?: string }) {
    const job = await this.prisma.job.findUnique({
      where: { id: d.jobId },
      include: { worker: true, payment: true, quotes: { where: { status: QuoteStatus.ACCEPTED } } },
    });
    if (!job) throw new BizError("Không tìm thấy công việc.", 404);
    if (job.customerId !== u.sub) throw new BizError("Bạn không phải khách của việc này.", 403);
    if (!([JobStatus.ASSIGNED, JobStatus.IN_PROGRESS, JobStatus.DONE] as JobStatus[]).includes(job.status))
      throw new BizError("Việc chưa ở trạng thái có thể thanh toán.");
    if (job.payment?.status === PaymentStatus.SUCCESS) throw new BizError("Việc này đã được thanh toán.");

    const amount = job.quotes[0]?.price ?? job.budget;
    const txnRef = `${job.code}-${Date.now().toString().slice(-7)}`;

    if (job.payment) {
      // giao dịch cũ thất bại → cho tạo lại trên cùng bản ghi
      return this.prisma.payment.update({
        where: { id: job.payment.id },
        data: { amount, method: d.method || "vnpay_qr", txnRef, status: PaymentStatus.PENDING, paidAt: null },
      });
    }
    return this.prisma.payment.create({
      data: { jobId: job.id, customerId: u.sub, amount, method: d.method || "vnpay_qr", txnRef },
    });
  }

  /** Bước 2 — sandbox callback: thay cho IPN thật của VNPay */
  @Post(":id/simulate-callback")
  async callback(@CurrentUser() u: AuthUser, @Param("id") id: string, @Body() d: CallbackDto) {
    const p = await this.prisma.payment.findUnique({ where: { id }, include: { job: { include: { worker: true } } } });
    if (!p) throw new BizError("Không tìm thấy giao dịch.", 404);
    if (p.customerId !== u.sub) throw new BizError("Giao dịch không thuộc về bạn.", 403);
    if (p.status !== PaymentStatus.PENDING) throw new BizError("Giao dịch đã được xử lý.");

    const ok = d.success !== false;
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: ok ? PaymentStatus.SUCCESS : PaymentStatus.FAILED, paidAt: ok ? new Date() : null },
    });

    if (ok) {
      await this.prisma.notification.create({
        data: { userId: p.customerId, text: `Thanh toán ${p.amount.toLocaleString("vi-VN")}₫ cho ${p.job.code} thành công (mã ${p.txnRef})`, icon: "wallet" },
      });
      if (p.job.worker) {
        await this.prisma.notification.create({
          data: { userId: p.job.worker.userId, text: `Khách đã thanh toán ${p.amount.toLocaleString("vi-VN")}₫ cho việc ${p.job.code}`, icon: "wallet" },
        });
      }
    }
    return updated;
  }

  /** Lịch sử thanh toán của khách */
  @Get("my")
  my(@CurrentUser() u: AuthUser) {
    return this.prisma.payment.findMany({
      where: { customerId: u.sub },
      orderBy: { createdAt: "desc" },
      include: { job: { select: { id: true, code: true, title: true, district: true } } },
    });
  }

  /** Thợ xem thanh toán của các việc mình được gán */
  @Roles(Role.WORKER)
  @Get("worker")
  async forWorker(@CurrentUser() u: AuthUser) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    if (!w) return [];
    return this.prisma.payment.findMany({
      where: { job: { workerId: w.id } },
      orderBy: { createdAt: "desc" },
      include: { job: { select: { id: true, code: true, title: true, district: true } } },
    });
  }

  /** Trạng thái thanh toán của 1 việc (người liên quan) */
  @Get("job/:jobId")
  async byJob(@CurrentUser() u: AuthUser, @Param("jobId") jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId }, include: { worker: true } });
    const p = await this.prisma.payment.findUnique({ where: { jobId } });
    if (job && job.customerId !== u.sub && job.worker?.userId !== u.sub && u.role !== Role.ADMIN)
      throw new BizError("Bạn không có quyền xem giao dịch này.", 403);
    return p;
  }
}

/** Admin: doanh thu thực thu qua cổng thanh toán */
@Controller("admin/payments")
export class AdminPaymentsController {
  constructor(private prisma: PrismaService) {}

  @Roles(Role.ADMIN) @Get("stats")
  async stats() {
    const list = await this.prisma.payment.findMany({ where: { status: PaymentStatus.SUCCESS } });
    const total = list.reduce((s, p) => s + p.amount, 0);
    return {
      count: list.length,
      gross: total,
      platformFee: Math.round(total * 0.1),
      workerPayout: total - Math.round(total * 0.1),
      recent: list.slice(-10).reverse(),
    };
  }
}

@Module({ controllers: [PaymentsController, AdminPaymentsController] })
export class PaymentsModule {}
