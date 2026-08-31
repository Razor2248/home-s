import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from "@nestjs/common";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { BizError, Public, Roles } from "./common";

class DistrictDto {
  @IsString() @MinLength(2, { message: "Tên khu vực tối thiểu 2 ký tự." }) name: string;
}
class DistrictPatchDto {
  @IsOptional() @IsString() @MinLength(2, { message: "Tên khu vực tối thiểu 2 ký tự." }) name?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

/** Danh sách khu vực — công khai (đăng ký thợ, đăng việc, bộ lọc tìm thợ đều dùng) */
@Controller("districts")
export class DistrictsController {
  constructor(private prisma: PrismaService) {}

  @Public() @Get()
  list() {
    return this.prisma.district.findMany({ orderBy: { createdAt: "asc" } });
  }
}

/** Quản lý khu vực — chỉ Admin */
@Roles(Role.ADMIN)
@Controller("admin/districts")
export class AdminDistrictsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(@Body() d: DistrictDto) {
    const name = d.name.trim();
    const dup = await this.prisma.district.findUnique({ where: { name } });
    if (dup) throw new BizError(`Khu vực "${name}" đã tồn tại.`, 409);
    return this.prisma.district.create({  { name } });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() d: DistrictPatchDto) {
    if (d.name) {
      const name = d.name.trim();
      const dup = await this.prisma.district.findFirst({ where: { name, NOT: { id } } });
      if (dup) throw new BizError(`Khu vực "${name}" đã tồn tại.`, 409);
      return this.prisma.district.update({ where: { id },  { name, active: d.active } });
    }
    return this.prisma.district.update({ where: { id },  { active: d.active } });
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    const dis = await this.prisma.district.findUnique({ where: { id } });
    if (!dis) throw new BizError("Không tìm thấy khu vực.", 404);
    const [nJobs, nWorkers] = await Promise.all([
      this.prisma.job.count({ where: { district: dis.name } }),
      this.prisma.workerProfile.count({ where: { district: dis.name } }),
    ]);
    if (nJobs + nWorkers > 0)
      throw new BizError(`Khu vực đang có ${nWorkers} thợ và ${nJobs} việc — hãy tắt hiển thị thay vì xóa.`, 409);
    await this.prisma.district.delete({ where: { id } });
    return { ok: true };
  }
}

@Module({ controllers: [DistrictsController, AdminDistrictsController] })
export class DistrictsModule {}
