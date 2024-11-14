import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { MemoryTokensService } from "../modules/memory-tokens/memory-tokens.service";

@Injectable()
export class AccessTokenGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private memoryTokensService: MemoryTokensService
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization;

    if (bearerToken) {
      const token = bearerToken.substring(7);

      const isTokenValid = this.memoryTokensService.tokens.some(
        (user) => token === user.token
      );

      if (!isTokenValid) throw new UnauthorizedException();
    }

    return super.canActivate(context) as boolean;
  }
}

