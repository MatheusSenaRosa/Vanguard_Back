import { Customers, Localizations } from "@prisma/client";

export type GetLocalizationById = (
  type: "country" | "state" | "city",
  id: number
) => Promise<{
  data: { id: number; description: string } | null;
  isError: boolean;
}>;

export type FormatUserLocalization = (
  user: Customers & {
    localization: Localizations;
  }
) => {
  country: {
    id: number;
    description: string;
  } | null;
  state: {
    id: number;
    description: string;
  } | null;
  city: {
    id: number;
    description: string;
  } | null;
};
