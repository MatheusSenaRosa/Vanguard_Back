import { Expose, Transform } from "class-transformer";

export class AuthDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ obj }) => obj?.role?.description)
  role: string;

  @Expose()
  @Transform(({ obj }) => obj?.status?.description)
  status: string;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
