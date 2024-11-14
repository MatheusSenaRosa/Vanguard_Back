import { Controller, Get, Query } from "@nestjs/common";
import { ManagersService } from "./managers.service";
import { Roles } from "@decorators";
import { Serialize } from "@interceptors";
import { ManagerDto } from "./dtos";

@Controller("managers")
@Serialize(ManagerDto)
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get("count")
  @Roles(["Administrador"])
  count() {
    return this.managersService.count();
  }

  @Get()
  @Roles(["Administrador"])
  list(
    @Query("page") page: string,
    @Query("search") search: string,
    @Query("role") role: string
  ) {
    const numericPage = Number(page);
    const formattedPage = numericPage < 0 || !numericPage ? 0 : numericPage;

    return this.managersService.list(formattedPage, search, role);
  }
}
