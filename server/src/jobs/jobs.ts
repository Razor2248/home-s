import { Body, Controller, Get, Module, Param, Post, Query } from "@nestjs/common";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Approval, JobStatus, Role, Urgency } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError, CurrentUser, Roles } from "../common";

/* ---------------- DTO ---------------- */
class CreateJobDto {
  @IsString() @IsNotEmpty({ message: "Nhập tiêu đề công việc." }) title: string;
  @IsString() @IsNotEmpty() categoryId: string;
  @IsString() @IsNotEmpty({ message: "Mô tả giúp thợ hình dung sự cố." }) description: string;
  @IsString() @IsNotEmpty() district: string;
  @IsString() @IsNotEmpty() address: string;
  @IsInt() @Min(10000) budget: number;
  @IsEnum(Urgency) urgency: Urgency;
  @IsOptional() @IsString() scheduledAt?: string;
}
class CancelDto {
  @IsOptional() @IsString() reason?: string;
}

/* ---------------- CONTROLLER ---------------- */
@Controller("jobs")
export class JobsController {
  constructor(private prisma: PrismaService) {}

  private async nextCode(): Promise<string> {
    const n = await this.prisma.job.count();
    return `HS-${1001 + n}`;
  }

  /** Khách đăng việc mới */
  @Roles(Role.CUSTOMER) @Post()
  async create(@CurrentUser() u: AuthUser, @Body() d: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        code: await this.nextCode(),
        customerId: u.sub,
        title: d.title.trim(),
        categoryId: d.categoryId,
        description: d.description.trim(),
        district: d.district,
        address: d.address.trim(),
        budget: d.budget,
        urgency: d.urgency,
        scheduledAt: d.scheduledAt,
      },
      include: { category: true },
    });
    // Đẩy thông báo cho thợ đúng nghề, đang bật nhận việc
    const workers = await this.prisma.workerProfile.findMany({
      where: { categoryId: job.categoryId, approval: Approval.APPROVED, available: true },
    });
    if (workers.length) {
      await this.prisma.notification.createMany({
        data: workers.map((w) => ({
          userId: w.userId,
          text: `Việc mới phù hợp: ${job.title} (${job.code}) tại ${job.district}`,
          icon: "briefcase",
        })),
      });
    }
    return job;
  }

  /** Việc của khách đang đăng nhập */
  @Roles(Role.CUSTOMER) @Get("my")
  async myJobs(@CurrentUser() u: AuthUser) {
    return this.prisma.job.findMany({
      where: { customerId: u.sub },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        worker: { include: { user: { select: { name: true, phone: true } } } },
        quotes: true,
        review: true,
      },
    });
  }

  /** Sàn việc cho thợ (việc OPEN, đúng danh mục) */
  @Roles(Role.WORKER) @Get("feed")
  async feed(@CurrentUser() u: AuthUser, @Query("all") all?: string) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    if (!w) throw new BizError("Chưa có hồ sơ thợ.", 404);
    return this.prisma.job.findMany({
      where: { status: JobStatus.OPEN, ...(all ? {} : { categoryId: w.categoryId }) },
      orderBy: { createdAt: "desc" },
      include: { category: true, quotes: { select: { id: true, workerId: true } }, customer: { select: { name: true } } },
    });
  }

  /** Việc thợ đã nhận */
  @Roles(Role.WORKER) @Get("mine")
  async mine(@CurrentUser() u: AuthUser) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    if (!w) throw new BizError("Chưa có hồ sơ thợ.", 404);
    return this.prisma.job.findMany({
      where: { workerId: w.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        customer: { select: { name: true, phone: true, avatarColor: true } },
        quotes: { where: { workerId: w.id } },
        review: { include: { customer: { select: { name: true } } } },
      },
    });
  }

  /** Chi tiết việc — kiểm tra quyền: chỉ khách sở hữu / thợ được gán / admin */
  @Get(":id")
  async detail(@CurrentUser() u: AuthUser, @Param("id") id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        customer: { select: { id: true, name: true, phone: true, avatarColor: true } },
        worker: { include: { user: { select: { id: true, name: true, phone: true } } } },
        quotes: { include: { worker: { select: { id: true, name: true, rating: true } } }, orderBy: { createdAt: "asc" } },
        review: true,
      },
    });
    if (!job) throw new BizError("Không tìm thấy công việc.", 404);
    const isOwner = job.customerId === u.sub;
    const isWorker = job.worker?.userId === u.sub;
    if (u.role !== Role.ADMIN && !isOwner && !isWorker) throw new BizError("Bạn không có quyền xem việc này.", 403);
    return job;
  }

  @Roles(Role.WORKER) @Post(":id/start")
  async start(@CurrentUser() u: AuthUser, @Param("id") id: string) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job || job.workerId !== w?.id) throw new BizError("Việc không thuộc về bạn.", 403);
    if (job.status !== JobStatus.ASSIGNED) throw new BizError("Trạng thái việc không cho phép bắt đầu.");
    const updated = await this.prisma.job.update({ where: { id }, data: { status: JobStatus.IN_PROGRESS, startedAt: new Date() } });
    await this.prisma.notification.create({ data: { userId: job.customerId, text: `Thợ đã bắt đầu thi công việc ${job.code}`, icon: "wrench" } });
    return updated;
  }

  @Roles(Role.WORKER) @Post(":id/complete")
  async complete(@CurrentUser() u: AuthUser, @Param("id") id: string) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job || job.workerId !== w?.id) throw new BizError("Việc không thuộc về bạn.", 403);
    if (job.status !== JobStatus.IN_PROGRESS) throw new BizError("Cần bắt đầu việc trước khi hoàn thành.");
    const updated = await this.prisma.job.update({ where: { id }, data: { status: JobStatus.DONE, doneAt: new Date() } });
    await this.prisma.notification.create({ data: { userId: job.customerId, text: `Việc ${job.code} đã hoàn thành — hãy nghiệm thu và đánh giá nhé!`, icon: "star" } });
    return updated;
  }

  @Roles(Role.CUSTOMER) @Post(":id/cancel")
  async cancel(@CurrentUser() u: AuthUser, @Param("id") id: string, @Body() d: CancelDto) {
    const job = await this.prisma.job.findUnique({ where: { id }, include: { worker: true } });
    if (!job || job.customerId !== u.sub) throw new BizError("Việc không thuộc về bạn.", 403);
    if (![JobStatus.OPEN, JobStatus.ASSIGNED].includes(job.status)) throw new BizError("Việc đang thi công không thể hủy.");
    const updated = await this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.CANCELLED, cancelReason: d.reason || "Khách hàng chủ động hủy" },
    });
    if (job.worker) {
      await this.prisma.notification.create({ data: { userId: job.worker.userId, text: `Việc ${job.code} đã bị khách hủy: ${d.reason || ""}`, icon: "x" } });
    }
    return updated;
  }

  /** Đặt lịch trực tiếp với một thợ (tạo job ASSIGNED + quote ACCEPTED) */
  @Roles(Role.CUSTOMER) @Post("book")
  async book(@CurrentUser() u: AuthUser, @Body() d: { workerId: string; categoryId: string; district: string; address: string; scheduledAt: string; note?: string; budget: number }) {
    const w = await this.prisma.workerProfile.findUnique({ where: { id: d.workerId } });
    if (!w) throw new BizError("Không tìm thấy thợ.", 404);
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          code: `HS-${1001 + (await tx.job.count())}`,
          customerId: u.sub, workerId: w.id, categoryId: d.categoryId,
          title: `Đặt lịch với ${w.name}`,
          description: d.note?.trim() || "Khách đặt lịch trực tiếp từ hồ sơ thợ.",
          district: d.district, address: d.address, budget: d.budget,
          status: JobStatus.ASSIGNED, scheduledAt: d.scheduledAt,
        },
      });
      await tx.quote.create({
        data: { jobId: job.id, workerId: w.id, price: d.budget, eta: d.scheduledAt, message: "Đặt lịch trực tiếp từ hồ sơ.", status: "ACCEPTED" },
      });
      await tx.notification.create({ data: { userId: w.userId, text: `Khách vừa đặt lịch với bạn (${job.code}) — ${d.scheduledAt}`, icon: "calendar" } });
      return job;
    });
  }
}

@Module({ controllers: [JobsController] })
export class JobsModule {}
