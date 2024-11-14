import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UtilsService } from "../utils/utils.service";

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  count = async () => {
    const total = await this.prisma.customers.count();

    return {
      total,
    };
  };

  list = async (page: number, search: string, status: string | string[]) => {
    const itemsPerPage = 6;
    const skip = itemsPerPage * page - itemsPerPage;
    const hasWhere = search || status?.length;

    const [customers, total] = await Promise.all([
      this.prisma.customers.findMany({
        ...(hasWhere && {
          where: {
            ...(status && {
              status: Array.isArray(status)
                ? {
                    OR: status.map((item) => ({
                      description: item,
                    })),
                  }
                : { description: status },
            }),
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
        take: itemsPerPage,
        skip: skip < 0 ? 0 : skip,
        include: {
          status: true,
        },
      }),

      this.prisma.customers.count({
        ...(hasWhere && {
          where: {
            ...(status && {
              status: Array.isArray(status)
                ? {
                    OR: status.map((item) => ({
                      description: item,
                    })),
                  }
                : { description: status },
            }),
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
      }),
    ]);

    const currentPage = total && page ? page : 1;

    return {
      customers,
      page: currentPage,
      lastPage: Math.ceil(total / itemsPerPage),
    };
  };

  getById = async (id: string) => {
    const user = await this.prisma.customers.findUnique({
      where: {
        id,
      },
      include: {
        localization: true,
        occupation: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const localization = this.utils.formatUserLocalization(user);

    return {
      ...user,
      localization,
    };
  };
}
