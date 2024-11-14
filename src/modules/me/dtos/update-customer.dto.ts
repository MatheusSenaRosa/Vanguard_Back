import { IsNotEmpty, IsString, IsOptional, IsNumber } from "class-validator";

export class UpdateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  gender: string;

  @IsString()
  occupationId: string;

  @IsString()
  @IsOptional()
  linkedIn: string;

  @IsString()
  @IsOptional()
  gitHub: string;

  @IsNumber()
  countryId: number;

  @IsNumber()
  @IsOptional()
  stateId: number;

  @IsNumber()
  @IsOptional()
  cityId: number;
}
