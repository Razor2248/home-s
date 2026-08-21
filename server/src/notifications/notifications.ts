import { Controller, Get, Module, Post, Query } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AuthUser, CurrentUser } from "../common";

@Controller("notifications")
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query("limit") limit?: string) {
    return this.prisma.notification.findMany({
      where: { userId: u.sub },
      orderBy: { createdAt: "desc" },
      take: Number(limit) || 20,
    });
  }

  @Post("read-all")
  async readAll(@CurrentUser() u: AuthUser) {
    await this.prisma.notification.updateMany({ where: { userId: u.sub, read: false }, data: { read: true } });
    return { ok: true };
  }
}

@Module({ controllers: [NotificationsController] })
export class NotificationsModule {}
