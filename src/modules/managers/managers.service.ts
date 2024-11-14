import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ManagersService {
  constructor(private readonly prisma: PrismaService) {}

  count = async () => {
    const [totalSupervisors, totalCreators] = await Promise.all([
      this.prisma.managers.count({
        where: {
          role: {
            description: "Supervisor",
          },
        },
      }),
      this.prisma.managers.count({
        where: {
          role: {
            description: "Criador de conteúdo",
          },
        },
      }),
    ]);

    return {
      totalSupervisors,
      totalCreators,
    };
  };

  list = async (page: number, search: string, role: string) => {
    const itemsPerPage = 6;
    const skip = itemsPerPage * page - itemsPerPage;

    const [managers, total] = await Promise.all([
      this.prisma.managers.findMany({
        where: {
          role: {
            description: role,
          },
          ...(search && {
            OR: [
              {
                id: search,
              },
              {
                name: {
                  contains: search,
                },
              },
              {
                email: {
                  contains: search,
                },
              },
            ],
          }),
        },
        take: itemsPerPage,
        skip: skip < 0 ? 0 : skip,
      }),

      this.prisma.managers.count({
        where: {
          role: {
            description: role,
          },
          ...(search && {
            OR: [
              {
                id: search,
              },
              {
                name: {
                  contains: search,
                },
              },
              {
                email: {
                  contains: search,
                },
              },
            ],
          }),
        },
      }),
    ]);

    const currentPage = total && page ? page : 1;

    return {
      managers,
      page: currentPage,
      lastPage: Math.ceil(total / itemsPerPage),
    };
  };
}
