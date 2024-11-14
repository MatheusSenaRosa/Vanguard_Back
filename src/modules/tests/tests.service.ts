import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  resetData = async () => {
    await this.prisma.customers.update({
      where: {
        email: "ativo-cypress@gmail.com",
      },
      data: {
        name: "Ativo Cypress",
        occupation: { disconnect: true },
        gender: null,
        gitHub: null,
        linkedIn: null,
      },
    });

    await this.prisma.customers.deleteMany({
      where: {
        email: "cypressa3bfgh7p@gmail.com",
      },
    });

    await this.prisma.customers.updateMany({
      data: {
        password:
          "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      },
    });

    await Promise.all([
      this.prisma.localizations.deleteMany({
        where: {
          customer: {
            email: "ativo-cypress@gmail.com",
          },
        },
      }),
      this.prisma.validationTokens.deleteMany({
        where: {
          token: "A29842",
        },
      }),
      this.prisma.posts.deleteMany({ where: { id: "cypress" } }),
    ]);
  };
}
