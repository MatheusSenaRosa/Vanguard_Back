import { IsNotEmpty, IsString } from "class-validator";

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  commentId: string;
}
