import { Controller, Get, Param, Query } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { Public, Roles } from "@decorators";
import { CustomerDto, CustomerById, CountDto } from "./dtos";
import { Serialize } from "@interceptors";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles(["Administrador"])
  @Serialize(CustomerDto)
  list(
    @Query("page") page: string,
    @Query("search") search: string,
    @Query("status") status: string | string[]
  ) {
    const numericPage = Number(page);
    const formattedPage = numericPage < 0 || !numericPage ? 0 : numericPage;

    return this.customersService.list(formattedPage, search, status);
  }

  @Get("count")
  @Roles(["Administrador"])
  @Serialize(CountDto)
  count() {
    return this.customersService.count();
  }

  @Get(":id")
  @Public()
  @Serialize(CustomerById)
  getById(@Param("id") id: string) {
    return this.customersService.getById(id);
  }
}
