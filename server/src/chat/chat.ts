import { Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import { IsNotEmpty, IsString } from "class-validator";
import {
  ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Role } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma.service";
import { AuthUser, BizError, CurrentUser } from "../common";

class MessageDto {
  @IsString() @IsNotEmpty({ message: "Tin nhắn không được trống." }) text: string;
}

/** Kiểm tra người dùng là khách sở hữu việc hoặc thợ được gán */
async function assertParticipant(prisma: PrismaService, jobId: string, userId: string, role: Role) {
  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { worker: true } });
  if (!job) throw new BizError("Không tìm thấy cuộc trò chuyện.", 404);
  const ok = role === Role.ADMIN || job.customerId === userId || job.worker?.userId === userId;
  if (!ok) throw new BizError("Bạn không tham gia cuộc trò chuyện này.", 403);
  return job;
}

/* ---------------- REST ---------------- */
@Controller("jobs/:id/messages")
export class MessagesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser() u: AuthUser, @Param("id") jobId: string) {
    await assertParticipant(this.prisma, jobId, u.sub, u.role);
    return this.prisma.chatMessage.findMany({
      where: { jobId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, avatarColor: true, role: true } } },
    });
  }

  @Post()
  async send(@CurrentUser() u: AuthUser, @Param("id") jobId: string, @Body() d: MessageDto) {
    await assertParticipant(this.prisma, jobId, u.sub, u.role);
    return this.prisma.chatMessage.create({ data: { jobId, senderId: u.sub, text: d.text.trim() } });
  }
}

/* ---------------- SOCKET.IO GATEWAY ---------------- */
@WebSocketGateway({ namespace: "/chat", cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /** Client nối với handshake: { auth: { token, jobId } } */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      const payload = jwt.verify(token, this.config.get("JWT_SECRET", "dev-secret")) as AuthUser;
      (client.data as { user?: AuthUser }).user = payload;
      const jobId = client.handshake.auth?.jobId as string;
      if (jobId) {
        await assertParticipant(this.prisma, jobId, payload.sub, payload.role);
        await client.join(`job:${jobId}`);
      }
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage("message:send")
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string; text: string },
  ) {
    const user = (client.data as { user?: AuthUser }).user;
    if (!user?.sub || !data?.jobId || !data.text?.trim()) return;
    try {
      await assertParticipant(this.prisma, data.jobId, user.sub, user.role);
      const msg = await this.prisma.chatMessage.create({
        data: { jobId: data.jobId, senderId: user.sub, text: data.text.trim() },
        include: { sender: { select: { id: true, name: true, avatarColor: true, role: true } } },
      });
      this.server.to(`job:${data.jobId}`).emit("message:new", msg);
    } catch {
      client.emit("message:error", { message: "Không gửi được tin nhắn." });
    }
  }
}

@Module({ controllers: [MessagesController], providers: [ChatGateway] })
export class ChatModule {}
