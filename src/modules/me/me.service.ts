import { BadRequestException, Injectable } from "@nestjs/common";
import { ActivateData, GetUserLocalization } from "./types";
import { PrismaService } from "../prisma/prisma.service";
import { UtilsService } from "../utils/utils.service";
import { MailerService } from "@nestjs-modules/mailer";
import { UpdateCustomerDto, UpdateManagerDto } from "./dtos";
import { v4 as uuid } from "uuid";

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: MailerService,
    private readonly utils: UtilsService
  ) {}

  sendActivationEmail = async (
    name: string,
    email: string,
    activationToken: string
  ) => {
    await this.emailService.sendMail({
      to: email,
      subject: "Ativação de conta",
      template: "activate-account",
      context: {
        name,
        token: activationToken,
      },
    });
  };

  getUserLocalizationHandler: GetUserLocalization = async (data) => {
    if (data.stateId && !data.cityId) {
      throw new BadRequestException(
        "cityId is required when stateId is provided"
      );
    }

    if (!data.stateId && !data.cityId) {
      const { data: country, isError } = await this.utils.getLocalizationById(
        "country",
        data.countryId
      );

      if (isError) throw new BadRequestException("countryId is invalid");

      return {
        countryId: country.id,
        country: country.description,
        stateId: null,
        state: null,
        cityId: null,
        city: null,
      };
    }

    const [country, state, city] = await Promise.all([
      this.utils.getLocalizationById("country", data.countryId),
      this.utils.getLocalizationById("state", data.stateId),
      this.utils.getLocalizationById("city", data.cityId),
    ]);

    if (country.isError) throw new BadRequestException("countryId is invalid");
    if (state.isError) throw new BadRequestException("stateId is invalid");
    if (city.isError) throw new BadRequestException("cityId is invalid");

    return {
      countryId: country.data.id,
      country: country.data.description,
      stateId: state.data.id,
      state: state.data.description,
      cityId: city.data.id,
      city: city.data.description,
    };
  };

  customerChangePassword = async (
    userId: string,
    data: {
      currentPassword: string;
      newPassword: string;
    }
  ) => {
    const { password: userPassword } = await this.prisma.customers.findUnique({
      where: { id: userId },
    });

    const passwordMatches = await this.utils.compareValueToHash(
      data.currentPassword,
      userPassword
    );

    if (!passwordMatches)
      throw new BadRequestException("Current password is invalid");

    const newPasswordIsEqualCurrent = data.currentPassword === data.newPassword;

    if (newPasswordIsEqualCurrent)
      throw new BadRequestException(
        "New password can't be equal current password"
      );

    const hashedPassword = await this.utils.hashString(data.newPassword);

    await this.prisma.customers.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  };

  // CUSTOMER
  re_sendCustomerActivationEmail = async (email: string) => {
    const user = await this.prisma.customers.findUnique({
      where: {
        email,
      },
      include: {
        validationTokens: true,
        status: true,
      },
    });

    if (user.status.description === "Ativo")
      throw new BadRequestException("This user is already active");

    const foundToken = user.validationTokens.find(
      (item) => item.description === "Activation"
    );

    const isExpired = this.utils.isTokenExpired(foundToken?.expiresAt);

    if (!foundToken || isExpired) {
      const newToken = this.utils.generateToken();

      await this.prisma.customers.update({
        where: {
          id: user.id,
        },
        data: {
          validationTokens: {
            upsert: {
              where: { id: foundToken?.id },
              create: {
                id: uuid(),
                token: newToken.token,
                description: "Activation",
                expiresAt: newToken.expiresAt,
              },
              update: {
                token: newToken.token,
                description: "Activation",
                expiresAt: newToken.expiresAt,
              },
            },
          },
        },
      });

      await this.sendActivationEmail(user.name, user.email, newToken.token);
      return;
    }

    await this.sendActivationEmail(user.name, user.email, foundToken.token);
  };

  activateCustomer = async ({ email, activationToken }: ActivateData) => {
    const user = await this.prisma.customers.findUnique({
      where: { email },
      include: {
        status: true,
        validationTokens: true,
      },
    });

    if (user.status.description === "Ativo")
      throw new BadRequestException("This user is already active");

    const foundToken = user.validationTokens.find(
      (item) =>
        item.token === activationToken && item.description === "Activation"
    );

    if (!foundToken) throw new BadRequestException("This token is invalid");

    const isExpired = await this.utils.isTokenExpired(foundToken.expiresAt);

    if (isExpired) throw new BadRequestException("This token is expired");

    await this.prisma.customers.update({
      where: {
        id: user.id,
      },
      data: {
        validationTokens: {
          delete: {
            id: foundToken.id,
          },
        },
        status: {
          connect: {
            description: "Ativo",
          },
        },
      },
    });
  };

  whoAmICustomer = async (userId: string) => {
    const user = await this.prisma.customers.findUnique({
      where: {
        id: userId,
      },
      include: {
        status: true,
        occupation: true,
        localization: true,
      },
    });

    const localization = this.utils.formatUserLocalization(user);

    return {
      ...user,
      localization,
    };
  };

  updateMeCustomer = async (userId: string, data: UpdateCustomerDto) => {
    const localization = await this.getUserLocalizationHandler({
      countryId: data.countryId,
      stateId: data?.stateId,
      cityId: data?.cityId,
    });

    const user = await this.prisma.customers.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name,
        gitHub: data.gitHub,
        linkedIn: data.linkedIn,
        gender: data.gender,
        localization: {
          upsert: {
            create: {
              id: uuid(),
              city: localization.city,
              state: localization.state,
              country: localization.country,
              cityId: localization.cityId,
              countryId: localization.countryId,
              stateId: localization.stateId,
            },
            update: {
              city: localization.city,
              state: localization.state,
              country: localization.country,
              cityId: localization.cityId,
              countryId: localization.countryId,
              stateId: localization.stateId,
            },
          },
        },
        occupation: {
          connect: {
            id: data.occupationId,
          },
        },
      },
      include: {
        occupation: true,
        status: true,
        localization: true,
      },
    });

    const localizationReturn = this.utils.formatUserLocalization(user);

    return {
      ...user,
      localization: localizationReturn,
    };
  };

  // MANAGER
  whoAmIManager = async (userId: string) => {
    const user = await this.prisma.managers.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    return user;
  };

  updateMeManager = async (userId: string, data: UpdateManagerDto) => {
    if (!Object.keys(data).length) {
      throw new BadRequestException("Empty data is not valid");
    }

    const user = await this.prisma.managers.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
      },
      include: {
        role: true,
      },
    });

    return user;
  };
}
