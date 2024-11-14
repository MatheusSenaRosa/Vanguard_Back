import { Controller, HttpCode, HttpStatus, Put } from "@nestjs/common";
import { TestsService } from "./tests.service";
import { Roles } from "@decorators";

@Controller("tests")
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Put("reset")
  @Roles(["Administrador"])
  @HttpCode(HttpStatus.OK)
  resetData() {
    return this.testsService.resetData();
  }
}
