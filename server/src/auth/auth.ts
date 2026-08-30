import { Body, Controller, Get, Injectable, Module, Post, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from "class-validator";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { Approval, Role } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError, CurrentUser, Public } from "../common";

/* ---------------- DTO ---------------- */
class LoginDto {
  @IsEmail({}, { message: "Email không hợp lệ." }) email: string;
  @IsNotEmpty({ message: "Nhập mật khẩu." }) password: string;
}
class RegisterCustomerDto {
  @IsNotEmpty({ message: "Nhập họ tên." }) name: string;
  @IsEmail({}, { message: "Email không hợp lệ." }) email: string;
  @IsNotEmpty() phone: string;
  @MinLength(6, { message: "Mật khẩu tối thiểu 6 ký tự." }) password: string;
}
class RegisterWorkerDto extends RegisterCustomerDto {
  @IsNotEmpty() categoryId: string;
  @IsNotEmpty() district: string;
  @IsInt() @Min(0) yearsExp: number;
  @IsInt() @Min(10000) priceFrom: number;
  @IsOptional() @IsString() bio?: string;
}
class RefreshDto {
  @IsNotEmpty() refreshToken: string;
}

/* ---------------- SERVICE ---------------- */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private secret() {
    return this.config.get("JWT_SECRET", "dev-secret");
  }

  private signAccess(u: AuthUser) {
    return jwt.sign(u, this.secret(), { expiresIn: this.config.get("JWT_EXPIRES", "15m") });
  }

  private async signRefresh(userId: string) {
    const token = crypto.randomBytes(48).toString("hex");
    const days = Number(this.config.get("REFRESH_EXPIRES_DAYS", 7));
    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt: new Date(Date.now() + days * 86400_000) },
    });
    return token;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) throw new BizError("Email không tồn tại trong hệ thống.", 404);
    if (user.blocked) throw new BizError("Tài khoản đã bị khóa. Liên hệ quản trị viên.", 403);
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new BizError("Mật khẩu không đúng. Thử lại nhé.", 401);

    const payload: AuthUser = { sub: user.id, role: user.role, email: user.email };
    return {
      accessToken: this.signAccess(payload),
      refreshToken: await this.signRefresh(user.id),
      user: { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone, avatarColor: user.avatarColor },
    };
  }

  async registerCustomer(d: RegisterCustomerDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: d.email.toLowerCase().trim() } });
    if (exists) throw new BizError("Email đã được sử dụng.", 409);
    const user = await this.prisma.user.create({
      data: {
        role: Role.CUSTOMER, name: d.name.trim(), email: d.email.toLowerCase().trim(), phone: d.phone,
        passwordHash: await bcrypt.hash(d.password, 12),
      },
    });
    return this.login(user.email, d.password);
  }

  async registerWorker(d: RegisterWorkerDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: d.email.toLowerCase().trim() } });
    if (exists) throw new BizError("Email đã được sử dụng.", 409);
    const user = await this.prisma.user.create({
      data: {
        role: Role.WORKER, name: d.name.trim(), email: d.email.toLowerCase().trim(), phone: d.phone,
        passwordHash: await bcrypt.hash(d.password, 12),
        worker: {
          create: {
            categoryId: d.categoryId, district: d.district, yearsExp: d.yearsExp, priceFrom: d.priceFrom,
            approval: Approval.PENDING, bio: d.bio || "Thợ mới trên Home Services.",
            priceList: { create: { label: "Khảo sát & báo giá", price: d.priceFrom, order: 0 } },
          },
        },
      },
    });
    // Thông báo cho admin
    const admins = await this.prisma.user.findMany({ where: { role: Role.ADMIN } });
    await this.prisma.notification.createMany({
      data: admins.map((a) => ({ userId: a.id, text: `Hồ sơ thợ mới: ${user.name} đang chờ duyệt`, icon: "shield" })),
    });
    return this.login(user.email, d.password);
  }

  async refresh(refreshToken: string) {
    const row = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } });
    if (!row || row.expiresAt < new Date() || row.user.blocked) {
      throw new UnauthorizedException("Refresh token không hợp lệ.");
    }
    const payload: AuthUser = { sub: row.user.id, role: row.user.role, email: row.user.email };
    return { accessToken: this.signAccess(payload), refreshToken };
  }

  async me(u: AuthUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: u.sub },
      include: { worker: { include: { category: true, priceList: { orderBy: { order: "asc" } } } } },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...safe } = user;
    return safe;
  }

  /** Quên mật khẩu — bước 1: sinh OTP 6 số, hết hạn 10 phút */
  async forgotPassword(email: string) {
    const u = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!u) throw new BizError("Email không tồn tại trong hệ thống.", 404);
    if (u.blocked) throw new BizError("Tài khoản đã bị khóa. Liên hệ quản trị viên.", 403);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.prisma.passwordReset.create({
      data: { userId: u.id, code, expiresAt: new Date(Date.now() + 10 * 60_000) },
    });
    // SANDBOX: bản production sẽ gửi email/SMS thật và KHÔNG trả mã về client
    return { code, expiresIn: 600 };
  }

  /** Quên mật khẩu — bước 2: xác thực mã + đặt mật khẩu mới */
  async resetPassword(email: string, code: string, password: string) {
    const u = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!u) throw new BizError("Email không tồn tại trong hệ thống.", 404);
    const r = await this.prisma.passwordReset.findFirst({
      where: { userId: u.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!r) throw new BizError("Mã chưa được gửi hoặc đã hết hạn (10 phút). Hãy yêu cầu mã mới.");
    if (r.code !== code.trim()) throw new BizError("Mã xác thực không đúng.");
    await this.prisma.$transaction([
      this.prisma.passwordReset.update({ where: { id: r.id }, data: { used: true } }),
      this.prisma.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
    ]);
    return { ok: true };
  }
}

/* ---------------- CONTROLLER ---------------- */
@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public() @Post("login")
  login(@Body() d: LoginDto) {
    return this.auth.login(d.email, d.password);
  }

  @Public() @Post("register/customer")
  registerCustomer(@Body() d: RegisterCustomerDto) {
    return this.auth.registerCustomer(d);
  }

  @Public() @Post("register/worker")
  registerWorker(@Body() d: RegisterWorkerDto) {
    return this.auth.registerWorker(d);
  }

  @Public() @Post("refresh")
  refresh(@Body() d: RefreshDto) {
    return this.auth.refresh(d.refreshToken);
  }

  @Public() @Post("forgot-password")
  forgot(@Body() d: ForgotDto) {
    return this.auth.forgotPassword(d.email);
  }

  @Public() @Post("reset-password")
  reset(@Body() d: ResetDto) {
    return this.auth.resetPassword(d.email, d.code, d.password);
  }

  @Get("me")
  me(@CurrentUser() u: AuthUser) {
    return this.auth.me(u);
  }
}

@Module({ controllers: [AuthController], providers: [AuthService] })
export class AuthModule {}
