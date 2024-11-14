import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import {
  AuthModule,
  MeModule,
  PrismaModule,
  StripeModule,
  MemoryTokensModule,
  UtilsModule,
  OccupationsModule,
  CustomersModule,
  PostsModule,
  TestsModule,
  ManagersModule,
} from "./modules";
import { AccessTokenGuard, RolesGuard } from "./guards";
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    MeModule,
    StripeModule,
    UtilsModule,
    MemoryTokensModule,
    OccupationsModule,
    CustomersModule,
    PostsModule,
    TestsModule,
    ManagersModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
      defaults: {
        from: process.env.COMPANY_EMAIL,
      },
      template: {
        dir: join(__dirname, "../mails"),
        adapter: new HandlebarsAdapter(),
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
