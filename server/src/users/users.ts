import { Body, Controller, Get, Module, Patch } from "@nestjs/common";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError } from "../common";
import { CurrentUser } from "../common";

class UpdateProfileDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatarColor?: string;
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
    const { passwordHash, refreshTokens, ...safe } = user;
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
}

@Module({ controllers: [UsersController] })
export class UsersModule {}
