import { Body, Controller, Get, Module, Patch } from "@nestjs/common";
import { IsInt, Max, Min } from "class-validator";
import { Role } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { Public, Roles } from "./common";

class FeeDto {
  @IsInt({ message: "Phí phải là số nguyên." })
  @Min(0, { message: "Phí tối thiểu 0%." })
  @Max(50, { message: "Phí tối đa 50%." })
  platformFee: number;
}

@Controller()
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  /** Phí nền tảng — công khai để frontend hiển thị ở màn hình thanh toán */
  @Public() @Get("settings/platform-fee")
  async fee() {
    const row = await this.prisma.setting.findUnique({ where: { key: "platform_fee" } });
    return { fee: row ? Number(row.value) : 10 };
  }

  @Roles(Role.ADMIN) @Get("admin/settings")
  async all() {
    const rows = await this.prisma.setting.findMany();
    const map: Record<string, string> = {};
    rows.forEach((r) => (map[r.key] = r.value));
    return { platformFee: Number(map["platform_fee"] ?? 10), raw: map };
  }

  /** Admin cập nhật phí nền tảng — lưu bảng Setting */
  @Roles(Role.ADMIN) @Patch("admin/settings")
  async update(@Body() d: FeeDto) {
    await this.prisma.setting.upsert({
      where: { key: "platform_fee" },
      update: { value: String(d.platformFee) },
      create: { key: "platform_fee", value: String(d.platformFee) },
    });
    return { platformFee: d.platformFee };
  }
}

@Module({ controllers: [SettingsController] })
export class SettingsModule {}
