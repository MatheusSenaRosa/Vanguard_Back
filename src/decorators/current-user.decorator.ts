import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();

    if (!data) return user;

    return user[data];
  }
);
