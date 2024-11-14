import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    const userRole: string = context.switchToHttp().getRequest()?.user?.role;

    if (!requiredRoles || !requiredRoles?.length) return true;

    if (requiredRoles.includes(userRole)) return true;

    return false;
  }
}

