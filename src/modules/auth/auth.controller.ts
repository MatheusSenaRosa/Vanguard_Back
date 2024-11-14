import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Put,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  AuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from "./dtos";
import { Serialize } from "@interceptors";
import { CurrentUser, Public } from "@decorators";
import { RefreshTokenGuard } from "@guards";

@Controller()
@Serialize(AuthDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("auth/signup")
  @Public()
  @HttpCode(HttpStatus.CREATED)
  customerSignUp(@Body() body: SignUpDto) {
    return this.authService.customerSignUp(body);
  }

  @Post("auth/signin")
  @Public()
  @HttpCode(HttpStatus.OK)
  customerSignIn(@Body() body: SignInDto) {
    return this.authService.customerSignIn(body);
  }

  @Post("auth/forgot-password")
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  customerForgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.customerForgotPassword(body);
  }

  @Put("auth/reset-password")
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  customerResetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.customerResetPassword(body);
  }

  @Post("auth/refresh-token")
  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  customerRefreshTokens(
    @CurrentUser() user: { refreshToken: string; id: string }
  ) {
    return this.authService.customerRefreshTokens(user.id, user.refreshToken);
  }

  @Post("manager/auth/signin")
  @Public()
  @HttpCode(HttpStatus.OK)
  managerSignIn(@Body() body: SignInDto) {
    return this.authService.managerSignIn(body);
  }

  @Post("manager/auth/forgot-password")
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  managerForgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.managerForgotPassword(body);
  }

  @Put("manager/auth/reset-password")
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  managerResetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.managerResetPassword(body);
  }

  @Post("manager/auth/refresh-token")
  @Public()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  managerRefreshTokens(
    @CurrentUser() user: { refreshToken: string; id: string }
  ) {
    return this.authService.managerRefreshTokens(user.id, user.refreshToken);
  }
}
