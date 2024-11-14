import { Module } from "@nestjs/common";
import { ManagersService } from "./managers.service";
import { ManagersController } from "./managers.controller";

@Module({
  providers: [ManagersService],
  controllers: [ManagersController],
})
export class ManagersModule {}
