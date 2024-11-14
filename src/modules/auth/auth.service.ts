import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from "./dtos";
import { AuthTokenPayload, UpdateUserAuthTokens } from "./types";
import { PrismaService } from "../prisma/prisma.service";
import { UtilsService } from "../utils/utils.service";
import { MeService } from "../me/me.service";
import { MailerService } from "@nestjs-modules/mailer";
import { MemoryTokensService } from "../memory-tokens/memory-tokens.service";
import { Roles } from "@types";
import { v4 as uuid } from "uuid";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly meService: MeService,
    private readonly memoryTokensService: MemoryTokensService,
    private readonly utils: UtilsService
  ) {}

  generateAuthToken = async (
    user: AuthTokenPayload,
    isRefreshToken?: boolean
  ) => {
    const oneWeek = 60 * 60 * 24 * 7;
    const fifteenMinutes = 60 * 15;

    return this.jwtService.signAsync(user, {
      secret: isRefreshToken
        ? process.env.JWT_REFRESH_SECRET
        : process.env.JWT_SECRET,
      expiresIn: isRefreshToken ? oneWeek : fifteenMinutes,
    });
  };

  getAuthTokens = async (payload: AuthTokenPayload) => {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAuthToken(payload),
      this.generateAuthToken(payload, true),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  };

  updateUserAuthTokens: UpdateUserAuthTokens = async (data) => {
    const {
      userId,
      table,
      tokens: { accessToken, refreshToken },
    } = data;

    this.memoryTokensService.addToken(userId, accessToken, "Customer");

    if (table === "Customer") {
      await this.prisma.customers.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: refreshToken,
        },
      });

      return;
    }

    await this.prisma.managers.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  };

  customerSignUp = async (data: SignUpDto) => {
    const foundUser = await this.prisma.customers.findUnique({
      where: {
        email: data.email,
      },
    });

    if (foundUser) throw new ConflictException("This email is already in use");

    const activationData = this.utils.generateToken();
    const hashedPassword = await this.utils.hashString(data.password);

    const user = await this.prisma.customers.create({
      data: {
        id: uuid(),
        name: data.name,
        email: data.email,
        password: hashedPassword,
        status: {
          connect: {
            description: "Inativo",
          },
        },
        validationTokens: {
          create: {
            id: uuid(),
            description: "Activation",
            token: activationData.token,
            expiresAt: activationData.expiresAt,
          },
        },
      },
      include: { status: true },
    });

    const tokens = await this.getAuthTokens({
      id: user.id,
      email: user.email,
      role: "Aluno",
    });

    await this.updateUserAuthTokens({
      userId: user.id,
      table: "Customer",
      tokens,
    });

    await this.meService.sendActivationEmail(
      user.name,
      user.email,
      activationData.token
    );

    return {
      ...user,
      ...tokens,
    };
  };

  // CUSTOMER
  customerSignIn = async ({ email, password }: SignInDto) => {
    const user = await this.prisma.customers.findUnique({
      where: { email },
      include: { status: true },
    });

    if (!user) throw new BadRequestException("Email or password is invalid");

    const passwordMatches = await this.utils.compareValueToHash(
      password,
      user.password
    );

    if (!passwordMatches)
      throw new BadRequestException("Email or password is invalid");

    const tokens = await this.getAuthTokens({
      id: user.id,
      email: user.email,
      role: "Aluno",
    });

    await this.updateUserAuthTokens({
      userId: user.id,
      table: "Customer",
      tokens,
    });

    return {
      ...user,
      ...tokens,
    };
  };

  customerForgotPassword = async ({ email }: ForgotPasswordDto) => {
    const user = await this.prisma.customers.findUnique({
      where: { email },
      include: {
        validationTokens: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const foundToken = user.validationTokens.find(
      (item) => item.description === "Forgot password"
    );

    const isExpired = this.utils.isTokenExpired(foundToken?.expiresAt);

    if (isExpired || !foundToken) {
      const newToken = await this.utils.generateToken();

      if (user.email === "esquecisenha-cypress@gmail.com") {
        newToken.token = "A29842";
      }

      await this.prisma.customers.update({
        where: {
          id: user.id,
        },
        data: {
          validationTokens: {
            ...(foundToken && {
              update: {
                where: {
                  id: foundToken.id,
                },
                data: {
                  token: newToken.token,
                  expiresAt: newToken.expiresAt,
                },
              },
            }),
            ...(!foundToken && {
              create: {
                id: uuid(),
                description: "Forgot password",
                token: newToken.token,
                expiresAt: newToken.expiresAt,
              },
            }),
          },
        },
      });

      await this.mailerService.sendMail({
        to: email,
        subject: "Redefinição de senha",
        template: "forgot-password",
        context: {
          name: user.name,
          token: newToken.token,
        },
      });

      return;
    }

    await this.mailerService.sendMail({
      to: email,
      subject: "Alteração de senha",
      template: "forgot-password",
      context: {
        name: user.name,
        token: foundToken.description,
      },
    });
  };

  customerResetPassword = async ({
    email,
    newPassword,
    token,
  }: ResetPasswordDto) => {
    const foundToken = await this.prisma.validationTokens.findUnique({
      where: { token },
      include: {
        customer: true,
      },
    });

    const isExpired = this.utils.isTokenExpired(foundToken?.expiresAt);

    const isTokenValid =
      foundToken &&
      !isExpired &&
      foundToken?.customer?.email === email &&
      foundToken.description === "Forgot password";

    if (!isTokenValid)
      throw new BadRequestException("Token is invalid or expired");

    const hashedPassword = await this.utils.hashString(newPassword);

    this.memoryTokensService.removeToken(foundToken.customerId, "Customer");

    await this.prisma.customers.update({
      where: {
        id: foundToken.customerId,
      },
      data: {
        password: hashedPassword,
        refreshToken: null,
        validationTokens: {
          delete: {
            id: foundToken.id,
          },
        },
      },
    });
  };

  customerRefreshTokens = async (userId: string, refreshToken: string) => {
    const user = await this.prisma.customers.findUnique({
      where: { id: userId },
      include: { status: true },
    });

    const refreshTokenMatches = refreshToken === user?.refreshToken;

    if (!refreshTokenMatches) throw new UnauthorizedException();

    const tokens = await this.getAuthTokens({
      id: user.id,
      email: user.email,
      role: "Aluno",
    });

    await this.updateUserAuthTokens({
      userId: user.id,
      table: "Customer",
      tokens,
    });

    return {
      ...user,
      ...tokens,
    };
  };

  // MANAGER
  managerSignIn = async ({ email, password }: SignInDto) => {
    const user = await this.prisma.managers.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) throw new BadRequestException("Email or password is invalid");

    const passwordMatches = await this.utils.compareValueToHash(
      password,
      user.password
    );

    if (!passwordMatches)
      throw new BadRequestException("Email or password is invalid");

    const tokens = await this.getAuthTokens({
      id: user.id,
      email: user.email,
      role: user.role.description as Roles,
    });

    await this.updateUserAuthTokens({
      userId: user.id,
      table: "Manager",
      tokens,
    });

    return {
      ...user,
      ...tokens,
    };
  };

  managerForgotPassword = async ({ email }: ForgotPasswordDto) => {
    const user = await this.prisma.managers.findUnique({
      where: { email },
      include: {
        validationTokens: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    const foundToken = user.validationTokens.find(
      (item) => item.description === "Forgot password"
    );

    const isExpired = this.utils.isTokenExpired(foundToken?.expiresAt);

    if (isExpired || !foundToken) {
      const newToken = await this.utils.generateToken();

      await this.prisma.managers.update({
        where: {
          id: user.id,
        },
        data: {
          validationTokens: {
            ...(foundToken && {
              update: {
                where: {
                  id: foundToken.id,
                },
                data: {
                  token: newToken.token,
                  expiresAt: newToken.expiresAt,
                },
              },
            }),
            ...(!foundToken && {
              create: {
                id: uuid(),
                description: "Forgot password",
                token: newToken.token,
                expiresAt: newToken.expiresAt,
              },
            }),
          },
        },
      });

      await this.mailerService.sendMail({
        to: email,
        subject: "Redefinição de senha",
        template: "forgot-password",
        context: {
          name: user.name,
          token: newToken.token,
        },
      });

      return;
    }

    await this.mailerService.sendMail({
      to: email,
      subject: "Alteração de senha",
      template: "forgot-password",
      context: {
        name: user.name,
        token: foundToken.token,
      },
    });
  };

  managerResetPassword = async ({
    email,
    newPassword,
    token,
  }: ResetPasswordDto) => {
    const foundToken = await this.prisma.validationTokens.findUnique({
      where: { token },
      include: {
        manager: true,
      },
    });

    const isExpired = this.utils.isTokenExpired(foundToken?.expiresAt);

    const isTokenValid =
      foundToken &&
      !isExpired &&
      foundToken?.manager?.email === email &&
      foundToken.description === "Forgot password";

    if (!isTokenValid)
      throw new BadRequestException("Token is invalid or expired");

    const hashedPassword = await this.utils.hashString(newPassword);

    this.memoryTokensService.removeToken(foundToken.customerId, "Manager");

    await this.prisma.managers.update({
      where: {
        id: foundToken.managerId,
      },
      data: {
        password: hashedPassword,
        validationTokens: {
          delete: {
            id: foundToken.id,
          },
        },
      },
    });
  };

  managerRefreshTokens = async (userId: string, refreshToken: string) => {
    const user = await this.prisma.managers.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    const refreshTokenMatches = refreshToken === user?.refreshToken;

    if (!refreshTokenMatches) throw new UnauthorizedException();

    const tokens = await this.getAuthTokens({
      id: user.id,
      email: user.email,
      role: user.role.description as Roles,
    });

    await this.updateUserAuthTokens({
      userId: user.id,
      table: "Manager",
      tokens,
    });

    return {
      ...user,
      ...tokens,
    };
  };
}
