// validators/commonQuerySchema.ts

import { Schema } from "express-validator";

export const baseQuerySchema = (): Schema => ({
  q: {
    trim: true,
    customSanitizer: {
      options: (value: string) => value ?? "",
    },
  },
  currentPage: {
    customSanitizer: {
      options: (value: string) => {
        const parsedValue = Number(value);
        return Number.isNaN(parsedValue) ? 1 : parsedValue;
      },
    },
  },
  perPage: {
    customSanitizer: {
      options: (value: string) => {
        const parsedValue = Number(value);
        return Number.isNaN(parsedValue) ? 6 : parsedValue;
      },
    },
  },
});
