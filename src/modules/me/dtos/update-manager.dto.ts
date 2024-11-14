import { IsNotEmpty, IsString, IsOptional, IsUrl } from "class-validator";

export class UpdateManagerDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  linkedIn?: string;

  @IsUrl()
  @IsOptional()
  gitHub?: string;

  @IsString()
  @IsOptional()
  biography?: string;
}
