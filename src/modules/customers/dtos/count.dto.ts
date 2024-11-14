import { Expose } from "class-transformer";

export class CountDto {
  @Expose()
  total: number;
}
