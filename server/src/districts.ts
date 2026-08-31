import { Body, Controller, Delete, Get, Module, Param, Patch, Post, Query } from "@nestjs/common";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { BizError, Public, Roles } from "./common";

class DistrictDto {
  @IsString() @IsNotEmpty({ message: "Nhập tên khu vực." }) name: string;
}
class DistrictPatchDto {
  @IsOptional() @IsString() @IsNotEmpty({ message: "Tên không được để trống." }) name?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

const normalize = (s: string) => s.trim().replace(/\s+/g, " ");

@Controller()
export class DistrictsController {
  constructor(private prisma: PrismaService) {}

  /** Danh sách khu vực đang bật — công khai cho mọi form (đăng ký thợ, đăng việc, tìm thợ) */
  @Public() @Get("districts")
  list(@Query("all") all?: string) {
    return this.prisma.district.findMany({
      where: all ? {} : { active: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
  }

  /* ---------- Admin quản lý khu vực ---------- */

  @Roles(Role.ADMIN) @Get("admin/districts")
  async adminList() {
    const [rows, workers, jobs] = await Promise.all([
      this.prisma.district.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
      this.prisma.workerProfile.groupBy({ by: ["district"], _count: { _all: true } }),
      this.prisma.job.groupBy({ by: ["district"], _count: { _all: true } }),
    ]);
    const wMap = new Map(workers.map((w) => [w.district, w._count._all]));
    const jMap = new Map(jobs.map((j) => [j.district, j._count._all]));
    return rows.map((d) => ({ ...d, workerCount: wMap.get(d.name) ?? 0, jobCount: jMap.get(d.name) ?? 0 }));
  }

  @Roles(Role.ADMIN) @Post("admin/districts")
  async create(@Body() d: DistrictDto) {
    const name = normalize(d.name);
    const dup = await this.prisma.district.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
    if (dup) throw new BizError(`Khu vực "${dup.name}" đã tồn tại.`, 409);
    const maxOrder = await this.prisma.district.aggregate({ _max: { order: true } });
    return this.prisma.district.create({ data: { name, order: (maxOrder._max.order ?? -1) + 1 } });
  }

  @Roles(Role.ADMIN) @Patch("admin/districts/:id")
  async update(@Param("id") id: string, @Body() d: DistrictPatchDto) {
    const cur = await this.prisma.district.findUnique({ where: { id } });
    if (!cur) throw new BizError("Không tìm thấy khu vực.", 404);
    if (d.name !== undefined) {
      const name = normalize(d.name);
      const dup = await this.prisma.district.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
      });
      if (dup) throw new BizError(`Khu vực "${dup.name}" đã tồn tại.`, 409);
      // Đổi tên: cập nhật luôn dữ liệu thợ & việc đang dùng tên cũ
      await this.prisma.$transaction([
        this.prisma.district.update({ where: { id }, data: { name, active: d.active ?? cur.active } }),
        this.prisma.workerProfile.updateMany({ where: { district: cur.name }, data: { district: name } }),
        this.prisma.job.updateMany({ where: { district: cur.name }, data: { district: name } }),
      ]);
      return this.prisma.district.findUnique({ where: { id } });
    }
    return this.prisma.district.update({ where: { id }, data: { active: d.active ?? cur.active } });
  }

  @Roles(Role.ADMIN) @Delete("admin/districts/:id")
  async remove(@Param("id") id: string) {
    const cur = await this.prisma.district.findUnique({ where: { id } });
    if (!cur) throw new BizError("Không tìm thấy khu vực.", 404);
    const [nW, nJ] = await Promise.all([
      this.prisma.workerProfile.count({ where: { district: cur.name } }),
      this.prisma.job.count({ where: { district: cur.name } }),
    ]);
    if (nW + nJ > 0)
      throw new BizError(`"${cur.name}" đang có ${nW} thợ và ${nJ} việc — hãy tắt hoạt động thay vì xóa.`, 409);
    await this.prisma.district.delete({ where: { id } });
    return { ok: true };
  }
}

@Module({ controllers: [DistrictsController] })
export class DistrictsModule {}
