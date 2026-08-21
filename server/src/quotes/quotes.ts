import { Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import { Approval, JobStatus, QuoteStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError, CurrentUser, Roles } from "../common";

class SendQuoteDto {
  @IsInt() @Min(10000, { message: "Giá tối thiểu 10.000₫." }) price: number;
  @IsString() @IsNotEmpty() eta: string;
  @IsString() @IsNotEmpty({ message: "Viết lời nhắn cho khách." }) message: string;
}

@Controller()
export class QuotesController {
  constructor(private prisma: PrismaService) {}

  /** Thợ gửi báo giá cho một việc */
  @Roles(Role.WORKER) @Post("jobs/:id/quotes")
  async send(@CurrentUser() u: AuthUser, @Param("id") jobId: string, @Body() d: SendQuoteDto) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    if (!w) throw new BizError("Chưa có hồ sơ thợ.", 404);
    if (w.approval !== Approval.APPROVED) throw new BizError("Hồ sơ của bạn chưa được duyệt.", 403);

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== JobStatus.OPEN) throw new BizError("Việc không còn nhận báo giá.", 400);
    if (job.categoryId !== w.categoryId) throw new BizError("Việc không thuộc danh mục của bạn.", 403);

    const dup = await this.prisma.quote.findUnique({ where: { jobId_workerId: { jobId, workerId: w.id } } });
    if (dup) throw new BizError("Bạn đã gửi báo giá cho việc này rồi.", 409);

    const quote = await this.prisma.quote.create({
      data: { jobId, workerId: w.id, price: d.price, eta: d.eta, message: d.message },
    });
    await this.prisma.notification.create({
      data: {
        userId: job.customerId,
        text: `${w.name} vừa gửi báo giá ${d.price.toLocaleString("vi-VN")}₫ cho ${job.code}`,
        icon: "wallet",
      },
    });
    return quote;
  }

  /** Danh sách báo giá của việc (khách sở hữu xem được) */
  @Get("jobs/:id/quotes")
  async list(@CurrentUser() u: AuthUser, @Param("id") jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new BizError("Không tìm thấy việc.", 404);
    if (u.role !== Role.ADMIN && job.customerId !== u.sub) throw new BizError("Không có quyền xem báo giá.", 403);
    return this.prisma.quote.findMany({
      where: { jobId },
      orderBy: { price: "asc" },
      include: {
        worker: { select: { id: true, name: true, rating: true, ratingCount: true, jobsDone: true, responseMins: true, verified: true } },
      },
    });
  }

  /** Khách chốt báo giá — transaction: nhận báo giá, từ chối các báo giá khác, gán thợ, thông báo */
  @Roles(Role.CUSTOMER) @Post("quotes/:id/accept")
  async accept(@CurrentUser() u: AuthUser, @Param("id") quoteId: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId }, include: { job: true } });
    if (!quote || quote.job.customerId !== u.sub) throw new BizError("Không tìm thấy báo giá.", 404);
    if (quote.job.status !== JobStatus.OPEN) throw new BizError("Việc đã được chốt hoặc hủy.", 400);
    if (quote.status !== QuoteStatus.SENT) throw new BizError("Báo giá không còn hiệu lực.", 400);

    await this.prisma.$transaction(async (tx) => {
      await tx.quote.updateMany({ where: { jobId: quote.jobId, status: QuoteStatus.SENT }, data: { status: QuoteStatus.DECLINED } });
      await tx.quote.update({ where: { id: quoteId }, data: { status: QuoteStatus.ACCEPTED } });
      await tx.job.update({ where: { id: quote.jobId }, data: { status: JobStatus.ASSIGNED, workerId: quote.workerId } });
      await tx.notification.create({
        data: { userId: quote.job.customerId, text: `Đã chốt thợ cho ${quote.job.code} với giá ${quote.price.toLocaleString("vi-VN")}₫`, icon: "check" },
      });
    });
    const w = await this.prisma.workerProfile.findUnique({ where: { id: quote.workerId } });
    if (w) {
      await this.prisma.notification.create({
        data: { userId: w.userId, text: `Chúc mừng! Bạn được chọn cho việc ${quote.job.code}. Hãy liên hệ khách hàng nhé.`, icon: "check" },
      });
    }
    return { ok: true };
  }
}

@Module({ controllers: [QuotesController] })
export class QuotesModule {}
