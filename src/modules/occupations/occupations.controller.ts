import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { OccupationsService } from "./occupations.service";
import { Public } from "@decorators";

@Controller("occupations")
export class OccupationsController {
  constructor(private readonly occupationsService: OccupationsService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  list() {
    return this.occupationsService.list();
  }
}
