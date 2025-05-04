import { checkSchema } from "express-validator";

export default checkSchema(
  {
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
