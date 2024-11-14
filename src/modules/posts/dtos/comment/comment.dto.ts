import { Expose, Transform, Type } from "class-transformer";

class User {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Transform(({ obj }) => obj?.role?.description)
  role?: string;
}

class Comment {
  @Expose()
  id: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => User)
  customer: User;

  @Expose()
  @Type(() => User)
  manager: User;

  @Expose()
  @Type(() => User)
  @Transform(({ obj }) =>
    obj?.approval?.approver
      ? {
          id: obj.approval.approver.id,
          name: obj.approval.approver.name,
          email: obj.approval.approver.email,
        }
      : null
  )
  approvedBy: User;

  @Expose()
  @Type(() => Comment)
  replies: Comment[];

  @Expose()
  createdAt: string;
}

class Report {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Comment)
  comment: Comment;

  @Expose()
  @Type(() => Comment)
  reply: Comment;
}

export class CommentDto {
  @Expose()
  @Type(() => Comment)
  comments: Comment[];

  @Expose()
  @Type(() => Comment)
  replies: Comment[];

  @Expose()
  @Type(() => Report)
  reports: Report[];

  @Expose()
  id: string;

  @Expose()
  description: string;

  @Expose()
  isApproved: boolean;

  @Expose()
  @Type(() => User)
  customer: User;

  @Expose()
  @Type(() => User)
  manager: User;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
