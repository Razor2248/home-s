import { Body, Controller, Get, Module, Patch, Post } from "@nestjs/common";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError } from "../common";
import { CurrentUser } from "../common";

class UpdateProfileDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatarColor?: string;
}
class ChangePasswordDto {
  @IsNotEmpty({ message: "Nhập mật khẩu hiện tại." }) current: string;
  @MinLength(6, { message: "Mật khẩu mới tối thiểu 6 ký tự." }) next: string;
}

@Controller("users")
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get("me")
  async me(@CurrentUser() u: AuthUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: u.sub },
      include: { worker: { include: { category: true } }, favorites: { include: { worker: true } } },
    });
    if (!user) throw new BizError("Không tìm thấy người dùng.", 404);
    const { passwordHash, ...safe } = user;
    return safe;
  }

  @Patch("me")
  async update(@CurrentUser() u: AuthUser, @Body() d: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: u.sub },
      data: { name: d.name, phone: d.phone, avatarColor: d.avatarColor },
    });
    const { passwordHash, ...safe } = user;
    return safe;
  }

  /** Đổi mật khẩu — phải nhập đúng mật khẩu hiện tại */
  @Post("me/change-password")
  async changePassword(@CurrentUser() u: AuthUser, @Body() d: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: u.sub } });
    if (!user) throw new BizError("Không tìm thấy người dùng.", 404);
    const ok = await bcrypt.compare(d.current, user.passwordHash);
    if (!ok) throw new BizError("Mật khẩu hiện tại không đúng.", 400);
    await this.prisma.user.update({
      where: { id: u.sub },
      data: { passwordHash: await bcrypt.hash(d.next, 12) },
    });
    return { ok: true };
  }
}

@Module({ controllers: [UsersController] })
export class UsersModule {}
