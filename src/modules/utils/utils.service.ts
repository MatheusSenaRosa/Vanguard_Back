import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import axios from "axios";
import { FormatUserLocalization, GetLocalizationById } from "./types";

@Injectable()
export class UtilsService {
  generateToken = () => {
    const token = crypto.randomBytes(3).toString("hex").toLocaleUpperCase();

    const expiresAt = new Date();

    const currentHour = expiresAt.getHours();
    const hoursAmountToExpire = 2;
    expiresAt.setHours(currentHour + hoursAmountToExpire);

    return {
      token,
      expiresAt: expiresAt,
    };
  };

  isTokenExpired = (expiresAt: Date) => {
    if (!expiresAt) return false;

    return new Date() > expiresAt;
  };

  hashString = async (data: string) => {
    const hash = await bcrypt.hash(data, 10);

    return hash;
  };

  compareValueToHash = async (value: string, hash: string) => {
    if (!value) return false;
    return await bcrypt.compare(value, hash);
  };

  getLocalizationById: GetLocalizationById = async (type, id) => {
    const BASE_URL = "http://servicodados.ibge.gov.br/api/v1";

    try {
      if (type === "country") {
        const response = await axios.get(
          `${BASE_URL}/localidades/paises/${id}`
        );

        const data = response.data[0];

        return {
          data: {
            id: data.id.M49,
            description: data.nome,
          },
          isError: false,
        };
      }

      if (type === "state") {
        const { data } = await axios.get(
          `${BASE_URL}/localidades/estados/${id}`
        );

        if (Array.isArray(data)) throw new Error();

        return {
          data: {
            id: data.id,
            description: data.nome,
          },
          isError: false,
        };
      }

      if (type === "city") {
        const { data } = await axios.get(
          `${BASE_URL}/localidades/municipios/${id}`
        );

        if (Array.isArray(data)) throw new Error();

        return {
          data: {
            id: data.id,
            description: data.nome,
          },
          isError: false,
        };
      }
    } catch {
      return {
        data: null,
        isError: true,
      };
    }
  };

  formatUserLocalization: FormatUserLocalization = (user) => {
    const localization = {
      country: user.localization?.countryId
        ? {
            id: user.localization.countryId,
            description: user.localization.country,
          }
        : null,
      state: user.localization?.stateId
        ? {
            id: user.localization?.stateId,
            description: user.localization.state,
          }
        : null,
      city: user.localization?.cityId
        ? {
            id: user.localization?.cityId,
            description: user.localization.city,
          }
        : null,
    };

    return localization;
  };
}
