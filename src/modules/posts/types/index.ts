import { PostComments, PostCommentsReports } from "@prisma/client";
import { Roles } from "@types";

export type User = {
  id: string;
  role: Roles;
};

export type FormattedReports = PostCommentsReports & {
  reportsAmount: number;
};

export type UserIds = { customerId?: string; managerId?: string };
