import { checkSchema } from "express-validator";

export const tenantsValidator = checkSchema({
  name: {
    errorMessage: "name is required",
    notEmpty: true,
    isString: true,
    trim: true,
    isLength: {
      options: { max: 100 },
    },
  },
  address: {
    errorMessage: "Address is required",
    notEmpty: true,
    isString: true,
    trim: true,
    isLength: {
      options: { max: 255 },
    },
  },
});
