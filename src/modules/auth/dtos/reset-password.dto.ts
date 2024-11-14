import { IsEmail, IsString, Length, Matches } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*[0-9])/, { message: "password must contain numbers" })
  @Matches(/^(?=.*[a-z])/, {
    message: "password must contain lowercase characters",
  })
  @Matches(/^(?=.*[A-Z])/, {
    message: "password must contain uppercase characters",
  })
  newPassword: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  token: string;
}

