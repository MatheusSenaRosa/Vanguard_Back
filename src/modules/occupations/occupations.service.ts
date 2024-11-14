import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OccupationsService {
  constructor(private readonly prisma: PrismaService) {}

  list = async () => {
    const occupations = await this.prisma.occupations.findMany();

    return { occupations };
  };
}

