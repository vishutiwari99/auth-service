import { checkSchema } from "express-validator";

export default checkSchema(
  {
    role: {
      customSanitizer: {
        options: (value: string) => {
          return value ?? "";
        },
      },
    },
    q: {
      trim: true,
      customSanitizer: {
        options: (value: string) => {
          return value ?? "";
        },
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
  },
  ["query"],
);
