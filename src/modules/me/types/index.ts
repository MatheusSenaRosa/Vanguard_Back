export type ActivateData = {
  email: string;
  activationToken: string;
};

export type GetUserLocalization = (data: {
  countryId: number;
  stateId: number;
  cityId: number;
}) => Promise<{
  countryId: number;
  country: string | null;
  stateId: number | null;
  state: string | null;
  cityId: number | null;
  city: string | null;
}>;
