import {
  CanActivate, createParamDecorator, CustomDecorator, ExecutionContext,
  ForbiddenException, Injectable, SetMetadata, UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface AuthUser {
  sub: string; // user id
  role: Role;
  email: string;
}

export const IS_PUBLIC_KEY = "isPublic";
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});

/** Xác thực JWT — gắn req.user = { sub, role, email } */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    const header: string = req.headers?.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException("Thiếu token đăng nhập.");

    try {
      const payload = jwt.verify(token, this.config.get("JWT_SECRET", "dev-secret")) as AuthUser;
      req.user = payload;
    } catch {
      throw new UnauthorizedException("Phiên đăng nhập hết hạn, đăng nhập lại nhé.");
    }

    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (roles?.length && !roles.includes(req.user.role)) {
      throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này.");
    }
    return true;
  }
}

/** Ném lỗi nghiệp vụ với thông điệp tiếng Việt */
export class BizError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}
