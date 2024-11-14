import { Roles, UserTable } from "@types";

export type AuthTokenPayload = {
  id: string;
  email: string;
  role: Roles;
};

export type UpdateUserAuthTokens = (data: {
  userId: string;
  tokens: { accessToken: string; refreshToken: string };
  table: UserTable;
}) => Promise<void>;
