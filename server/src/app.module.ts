import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma.service";
import { JwtAuthGuard } from "./common";
import { HealthController } from "./health";
import { AuthModule } from "./auth/auth";
import { UsersModule } from "./users/users";
import { WorkersModule } from "./workers/workers";
import { JobsModule } from "./jobs/jobs";
import { QuotesModule } from "./quotes/quotes";
import { ReviewsModule } from "./reviews/reviews";
import { ChatModule } from "./chat/chat";
import { NotificationsModule } from "./notifications/notifications";
import { AdminModule } from "./admin/admin";
import { PaymentsModule } from "./payments/payments";
import { SettingsModule } from "./settings";

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
class PrismaModule {}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkersModule,
    JobsModule,
    QuotesModule,
    ReviewsModule,
    ChatModule,
    NotificationsModule,
    AdminModule,
    PaymentsModule,
    SettingsModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
