import { IsNotEmpty, IsString } from "class-validator";

export class UpdateReplyDto {
  @IsString()
  @IsNotEmpty()
  replyId: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
