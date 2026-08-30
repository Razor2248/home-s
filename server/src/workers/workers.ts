import { Body, Controller, Delete, Get, Module, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Approval, Role } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError, CurrentUser, Public, Roles } from "../common";

/* ---------------- DTO ---------------- */
class PriceItemDto {
  @IsString() label: string;
  @IsInt() @Min(0) price: number;
}
class UpdateWorkerDto {
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsInt() @Min(10000) priceFrom?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PriceItemDto) priceList?: PriceItemDto[];
}

/* ---------------- MATCH SCORE (sẵn sàng thay bằng mô hình ML ở GĐ AI) ---------------- */
function matchScore(w: { categoryId: string; district: string; rating: number; jobsDone: number; available: boolean }, ctx?: { categoryId?: string; district?: string }) {
  let s = 50;
  if (ctx?.categoryId) s += w.categoryId === ctx.categoryId ? 26 : -32;
  if (ctx?.district) s += w.district === ctx.district ? 14 : 0;
  s += Math.min(Math.round(w.rating * 4), 20);
  s += Math.min(Math.round(w.jobsDone / 25), 8);
  if (w.available) s += 4;
  return Math.max(5, Math.min(98, s));
}

/* ---------------- CONTROLLER ---------------- */
@Controller("workers")
export class WorkersController {
  constructor(private prisma: PrismaService) {}

  /** Tìm thợ công khai: /workers?category=dien&district=Quận 7&sort=rating&q= */
  @Public() @Get()
  async list(@Query() q: Record<string, string>) {
    const workers = await this.prisma.workerProfile.findMany({
      where: {
        approval: Approval.APPROVED,
        ...(q.category ? { categoryId: q.category } : {}),
        ...(q.district ? { district: q.district } : {}),
        ...(q.q ? { user: { name: { contains: q.q, mode: "insensitive" } } } : {}),
      },
      include: { category: true, user: { select: { name: true } } },
      orderBy:
        q.sort === "price" ? { priceFrom: "asc" }
          : q.sort === "exp" ? { yearsExp: "desc" }
            : [{ rating: "desc" }, { jobsDone: "desc" }],
    });
    const ctx = q.category || q.district ? { categoryId: q.category, district: q.district } : undefined;
    let out = workers.map((w) => ({ ...w, matchScore: matchScore(w, ctx) }));
    if (q.minRating) out = out.filter((w) => w.rating >= Number(q.minRating));
    if (q.maxPrice) out = out.filter((w) => w.priceFrom <= Number(q.maxPrice));
    return out;
  }

  /** Hồ sơ thợ công khai kèm bảng giá + đánh giá */
  @Public() @Get(":id")
  async detail(@Param("id") id: string) {
    const w = await this.prisma.workerProfile.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { name: true } },
        priceList: { orderBy: { order: "asc" } },
        reviews: { where: { hidden: false }, orderBy: { createdAt: "desc" }, take: 10, include: { customer: { select: { name: true, avatarColor: true } } } },
      },
    });
    if (!w || w.approval !== Approval.APPROVED) throw new BizError("Không tìm thấy hồ sơ thợ.", 404);
    return w;
  }

  /** Hồ sơ của chính thợ đang đăng nhập */
  @Roles(Role.WORKER) @Get("me/profile")
  async mine(@CurrentUser() u: AuthUser) {
    const w = await this.prisma.workerProfile.findUnique({
      where: { userId: u.sub },
      include: { category: true, user: { select: { name: true } }, priceList: { orderBy: { order: "asc" } } },
    });
    if (!w) throw new BizError("Chưa có hồ sơ thợ.", 404);
    return w;
  }

  @Roles(Role.WORKER) @Patch("me")
  async updateMine(@CurrentUser() u: AuthUser, @Body() d: UpdateWorkerDto) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    if (!w) throw new BizError("Chưa có hồ sơ thợ.", 404);
    return this.prisma.$transaction(async (tx) => {
      if (d.priceList) {
        await tx.priceListItem.deleteMany({ where: { workerId: w.id } });
        await tx.priceListItem.createMany({
          data: d.priceList.filter((p) => p.label.trim()).map((p, i) => ({ workerId: w.id, label: p.label, price: p.price, order: i })),
        });
      }
      return tx.workerProfile.update({
        where: { id: w.id },
        data: { bio: d.bio, priceFrom: d.priceFrom },
        include: { priceList: { orderBy: { order: "asc" } }, category: true },
      });
    });
  }

  @Roles(Role.WORKER) @Patch("me/available")
  async toggleAvailable(@CurrentUser() u: AuthUser, @Body() b: { available: boolean }) {
    const w = await this.prisma.workerProfile.update({
      where: { userId: u.sub },
      data: { available: b.available ?? true },
    });
    return { available: w.available };
  }

  /** Lịch sử yêu cầu đổi danh mục nghề của chính mình */
  @Roles(Role.WORKER) @Get("me/category-changes")
  async myChanges(@CurrentUser() u: AuthUser) {
    const w = await this.prisma.workerProfile.findUnique({ where: { userId: u.sub } });
    if (!w) throw new BizError("Chưa có hồ sơ thợ.", 404);
    return this.prisma.categoryChangeRequest.findMany({
      where: { workerId: w.id },
      orderBy: { createdAt: "desc" },
      include: { worker: { include: { user: { select: { name: true } } } } },
    });
  }

  /** Gửi yêu cầu đổi danh mục nghề — cần admin duyệt */
  @Roles(Role.WORKER) @Post("me/category-changes")
  async requestChange(@CurrentUser() u: AuthUser, @Body() d: { toCategoryId: string; note?: string }) {
    const w = await this.prisma.workerProfile.findUnique({
      where: { userId: u.sub },
      include: { user: { select: { name: true } } },
    });
    if (!w) throw new BizError("Chưa có hồ sơ thợ.", 404);
    if (w.categoryId === d.toCategoryId) throw new BizError("Danh mục mới trùng với danh mục hiện tại.");
    const pending = await this.prisma.categoryChangeRequest.findFirst({
      where: { workerId: w.id, status: Approval.PENDING },
    });
    if (pending) throw new BizError("Bạn đã có một yêu cầu đang chờ duyệt.");
    const req = await this.prisma.categoryChangeRequest.create({
      data: { workerId: w.id, fromCategoryId: w.categoryId, toCategoryId: d.toCategoryId, note: d.note?.trim() ?? "" },
    });
    const admin = await this.prisma.user.findFirst({ where: { role: Role.ADMIN } });
    if (admin) {
      await this.prisma.notification.create({
        data: { userId: admin.id, text: `${w.user.name} yêu cầu đổi danh mục nghề`, icon: "tag" },
      });
    }
    return req;
  }

  /* ----- Yêu thích (khách hàng) ----- */
  @Roles(Role.CUSTOMER) @Put(":id/favorite")
  async favorite(@CurrentUser() u: AuthUser, @Param("id") workerId: string) {
    await this.prisma.favorite.upsert({
      where: { customerId_workerId: { customerId: u.sub, workerId } },
      update: {},
      create: { customerId: u.sub, workerId },
    });
    return { favorited: true };
  }

  @Roles(Role.CUSTOMER) @Delete(":id/favorite")
  async unfavorite(@CurrentUser() u: AuthUser, @Param("id") workerId: string) {
    await this.prisma.favorite.deleteMany({ where: { customerId: u.sub, workerId } });
    return { favorited: false };
  }

  @Roles(Role.CUSTOMER) @Get("favorites/list")
  async favorites(@CurrentUser() u: AuthUser) {
    return this.prisma.favorite.findMany({
      where: { customerId: u.sub },
      include: { worker: { include: { category: true } } },
    });
  }
}

/** Danh mục dịch vụ — công khai */
@Controller("categories")
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get()
  list() {
    return this.prisma.category.findMany({ orderBy: { name: "asc" } });
  }
}

@Module({ controllers: [WorkersController, CategoriesController] })
export class WorkersModule {}
