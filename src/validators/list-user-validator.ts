// validators/userQueryValidator.ts

import { checkSchema } from "express-validator";
import { baseQuerySchema } from "./commonQuerySchema";

export default checkSchema(
  {
    ...baseQuerySchema(),
    role: {
      customSanitizer: {
        options: (value: string) => value ?? "",
      },
    },
  },
  ["query"],
);
