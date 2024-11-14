import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[^\s]+$/, {
    message: "postId cannot contain spaces",
  })
  postId: string;
}
