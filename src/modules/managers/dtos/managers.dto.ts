import { Expose, Type } from "class-transformer";

class Manager {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;
}

export class ManagerDto {
  @Expose()
  lastPage: number;

  @Expose()
  page: number;

  @Expose()
  totalSupervisors: number;

  @Expose()
  totalCreators: number;

  @Expose()
  @Type(() => Manager)
  managers: Manager[];
}
