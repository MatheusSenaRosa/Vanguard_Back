import { SetMetadata } from "@nestjs/common";
import { Roles as RolesType } from "../types";

export const Roles = (validRoles: RolesType[]) =>
  SetMetadata("roles", validRoles);

