import { Expose, Transform, Type } from "class-transformer";

class Customer {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  customerId: string;

  @Expose()
  @Transform(({ obj }) => obj.status.description)
  status: string;
}

export class CustomerDto {
  @Expose()
  lastPage: number;

  @Expose()
  page: number;

  @Expose()
  @Type(() => Customer)
  customers: Customer[];
}
