import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { MeService } from "./me.service";
import { CurrentUser, Roles } from "@decorators";
import { Serialize } from "@interceptors";
import {
  ChangePasswordDto,
  MeDto,
  UpdateCustomerDto,
  UpdateManagerDto,
} from "./dtos";

@Controller()
@Serialize(MeDto)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get("me")
  @Roles(["Aluno"])
  @HttpCode(HttpStatus.OK)
  whoAmICustomer(@CurrentUser("id") userId: string) {
    return this.meService.whoAmICustomer(userId);
  }

  @Put("me")
  @Roles(["Aluno"])
  @HttpCode(HttpStatus.OK)
  updateMeCustomer(
    @CurrentUser("id") userId: string,
    @Body() body: UpdateCustomerDto
  ) {
    return this.meService.updateMeCustomer(userId, body);
  }

  @Post("me/activation/resend-email")
  @Roles(["Aluno"])
  @HttpCode(HttpStatus.NO_CONTENT)
  re_sendCustomerActivationEmail(@CurrentUser("email") email: string) {
    return this.meService.re_sendCustomerActivationEmail(email);
  }

  @Post("me/activation/:activationToken")
  @Roles(["Aluno"])
  @HttpCode(HttpStatus.OK)
  activateCustomer(
    @CurrentUser("email") email: string,
    @Param("activationToken") activationToken: string
  ) {
    return this.meService.activateCustomer({ email, activationToken });
  }

  @Put("me/change-password")
  @Roles(["Aluno"])
  @HttpCode(HttpStatus.NO_CONTENT)
  customerChangePassword(
    @Body() body: ChangePasswordDto,
    @CurrentUser("id") userId: string
  ) {
    return this.meService.customerChangePassword(userId, body);
  }

  @Get("manager/me")
  @Roles(["Administrador", "Supervisor", "Criador de conteúdo"])
  @HttpCode(HttpStatus.OK)
  whoAmIManager(@CurrentUser("id") userId: string) {
    return this.meService.whoAmIManager(userId);
  }

  @Patch("manager/me")
  @Roles(["Administrador", "Supervisor", "Criador de conteúdo"])
  @HttpCode(HttpStatus.OK)
  updateMeManager(
    @CurrentUser("id") userId: string,
    @Body() body: UpdateManagerDto
  ) {
    return this.meService.updateMeManager(userId, body);
  }
}
