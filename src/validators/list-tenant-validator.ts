// validators/tenantQueryValidator.ts

import { checkSchema } from "express-validator";
import { baseQuerySchema } from "./commonQuerySchema";

export default checkSchema(baseQuerySchema(), ["query"]);
