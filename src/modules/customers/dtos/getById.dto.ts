import { Expose, Transform } from "class-transformer";

export class CustomerById {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  gitHub: string;

  @Expose()
  linkedIn: string;

  @Expose()
  @Transform(({ obj }) => obj?.role?.description)
  role: string;

  @Expose()
  gender: string;

  @Expose()
  email: string;

  @Expose()
  localization: object;

  @Expose()
  occupation: string;

  @Expose()
  createdAt: string;
}
