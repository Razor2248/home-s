import { Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import { IsInt, IsString, Max, Min } from "class-validator";
import { JobStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError, CurrentUser, Public, Roles } from "../common";

class ReviewDto {
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsString() comment: string;
}

@Controller()
export class ReviewsController {
  constructor(private prisma: PrismaService) {}

  /** Khách đánh giá sau khi việc hoàn thành — cập nhật điểm thợ trong cùng transaction */
  @Roles(Role.CUSTOMER) @Post("jobs/:id/review")
  async create(@CurrentUser() u: AuthUser, @Param("id") jobId: string, @Body() d: ReviewDto) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.customerId !== u.sub) throw new BizError("Việc không thuộc về bạn.", 403);
    if (job.status !== JobStatus.DONE) throw new BizError("Chỉ đánh giá được việc đã hoàn thành.");
    if (!job.workerId) throw new BizError("Việc chưa có thợ thực hiện.");

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: { jobId, customerId: u.sub, workerId: job.workerId!, rating: d.rating, comment: d.comment.trim() },
      });
      const w = await tx.workerProfile.findUnique({ where: { id: job.workerId! } });
      if (w) {
        const newCount = w.ratingCount + 1;
        const newRating = Math.round(((w.rating * w.ratingCount + d.rating) / newCount) * 10) / 10;
        await tx.workerProfile.update({
          where: { id: w.id },
          data: { rating: newRating, ratingCount: newCount, jobsDone: w.jobsDone + 1 },
        });
        await tx.notification.create({
          data: { userId: w.userId, text: `Bạn vừa nhận đánh giá ${d.rating}★ cho việc ${job.code}`, icon: "star" },
        });
      }
      await tx.job.update({ where: { id: jobId }, data: { status: JobStatus.REVIEWED } });
      return review;
    });
  }

  /** Đánh giá công khai của một thợ */
  @Public() @Get("workers/:id/reviews")
  async byWorker(@Param("id") workerId: string) {
    return this.prisma.review.findMany({
      where: { workerId, hidden: false },
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, avatarColor: true } } },
    });
  }
}

@Module({ controllers: [ReviewsController] })
export class ReviewsModule {}
