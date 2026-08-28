import { Body, Controller, Delete, Get, Module, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Approval, JobStatus, Role } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { BizError, Roles } from "../common";

class RejectDto {
  @IsString() @IsNotEmpty({ message: "Ghi lý do từ chối." }) reason: string;
}
class CategoryDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() color?: string;
  @IsInt() @Min(0) priceMin: number;
  @IsInt() @Min(0) priceMax: number;
  @IsOptional() @IsString() unit?: string;
}
enum ResolveAction { KEEP = "keep", HIDE = "hide" }
class ResolveDto {
  @IsEnum(ResolveAction) action: ResolveAction;
}

@Roles(Role.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private prisma: PrismaService) {}

  /* ---------- Thống kê ---------- */
  @Get("stats")
  async stats() {
    const [users, workers, jobs, pending, flagged] = await Promise.all([
      this.prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      this.prisma.workerProfile.count({ where: { approval: Approval.APPROVED, available: true } }),
      this.prisma.job.findMany({ select: { id: true, status: true, createdAt: true, categoryId: true, budget: true } }),
      this.prisma.workerProfile.count({ where: { approval: Approval.PENDING } }),
      this.prisma.review.count({ where: { flagged: true } }),
    ]);
    const done = jobs.filter((j) => ([JobStatus.DONE, JobStatus.REVIEWED] as JobStatus[]).includes(j.status));
    const revenue = done.reduce((s, j) => s + j.budget, 0);

    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const from = new Date(d).setHours(0, 0, 0, 0);
      const to = from + 86400_000;
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: jobs.filter((j) => +j.createdAt >= from && +j.createdAt < to).length };
    });
    return {
      userByRole: users, activeWorkers: workers, pendingWorkers: pending, flaggedReviews: flagged,
      totalJobs: jobs.length, openJobs: jobs.filter((j) => j.status === JobStatus.OPEN).length,
      revenue, platformFee: Math.round(revenue * 0.1), jobsByDay: days,
    };
  }

  /* ---------- Việc (cho dashboard & đồng bộ frontend) ---------- */
  @Get("jobs")
  jobs(@Query("limit") limit?: string) {
    return this.prisma.job.findMany({
      take: Number(limit) || 50,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        customer: { select: { id: true, name: true, avatarColor: true } },
        worker: { select: { id: true, user: { select: { name: true } } } },
        quotes: true,
      },
    });
  }

  /* ---------- Duyệt thợ ---------- */
  @Get("workers")
  workers(@Query("approval") approval?: string) {
    return this.prisma.workerProfile.findMany({
      where: approval ? { approval: approval as Approval } : {},
      orderBy: { createdAt: "desc" },
      include: { category: true, user: { select: { email: true, phone: true } } },
    });
  }

  @Post("workers/:id/approve")
  async approve(@Param("id") id: string) {
    const w = await this.prisma.workerProfile.update({ where: { id }, data: { approval: Approval.APPROVED, rejectReason: null } });
    await this.prisma.notification.create({ data: { userId: w.userId, text: "Hồ sơ của bạn đã được duyệt. Bắt đầu nhận việc ngay!", icon: "check" } });
    return w;
  }

  @Post("workers/:id/reject")
  async reject(@Param("id") id: string, @Body() d: RejectDto) {
    const w = await this.prisma.workerProfile.update({ where: { id }, data: { approval: Approval.REJECTED, rejectReason: d.reason } });
    await this.prisma.notification.create({ data: { userId: w.userId, text: `Hồ sơ bị từ chối: ${d.reason}`, icon: "x" } });
    return w;
  }

  /* ---------- Người dùng ---------- */
  @Get("users")
  users(@Query("role") role?: string, @Query("q") q?: string) {
    return this.prisma.user.findMany({
      where: {
        ...(role ? { role: role as Role } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, role: true, name: true, email: true, phone: true, blocked: true, avatarColor: true, createdAt: true },
    });
  }

  @Patch("users/:id/block")
  block(@Param("id") id: string, @Body() b: { blocked: boolean }) {
    return this.prisma.user.update({ where: { id }, data: { blocked: !!b.blocked } });
  }

  /* ---------- Danh mục ---------- */
  @Post("categories")
  createCategory(@Body() d: CategoryDto & { id?: string }) {
    const slug = d.id || d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-");
    return this.prisma.category.create({
      data: { id: slug, name: d.name, icon: d.icon || "wrench", color: d.color || "#f4581c", priceMin: d.priceMin, priceMax: d.priceMax, unit: d.unit || "lần" },
    });
  }

  @Put("categories/:id")
  updateCategory(@Param("id") id: string, @Body() d: Partial<CategoryDto>) {
    return this.prisma.category.update({ where: { id }, data: d });
  }

  @Delete("categories/:id")
  async deleteCategory(@Param("id") id: string) {
    const [nW, nJ] = await Promise.all([
      this.prisma.workerProfile.count({ where: { categoryId: id } }),
      this.prisma.job.count({ where: { categoryId: id } }),
    ]);
    if (nW + nJ > 0) throw new BizError("Danh mục đang có thợ hoặc công việc — không thể xóa.", 409);
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  /* ---------- Đánh giá bị báo cáo ---------- */
  @Get("reviews")
  reviews(@Query("flagged") flagged?: string) {
    return this.prisma.review.findMany({
      where: flagged === "true" ? { flagged: true } : flagged === "hidden" ? { hidden: true } : {},
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } }, worker: { select: { user: { select: { name: true } } } } },
    });
  }

  @Post("reviews/:id/resolve")
  resolve(@Param("id") id: string, @Body() d: ResolveDto) {
    return this.prisma.review.update({
      where: { id },
      data: { flagged: false, hidden: d.action === ResolveAction.HIDE },
    });
  }
}

@Module({ controllers: [AdminController] })
export class AdminModule {}
