import { IsString, Length, Matches } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*[0-9])/, { message: "new password must contain numbers" })
  @Matches(/^(?=.*[a-z])/, {
    message: "new password must contain lowercase characters",
  })
  @Matches(/^(?=.*[A-Z])/, {
    message: "new password must contain uppercase characters",
  })
  newPassword: string;
}
