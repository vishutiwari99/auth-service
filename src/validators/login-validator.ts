import { checkSchema } from "express-validator";

export const userLoginValidationSchema = checkSchema({
  email: {
    errorMessage: "Email is required",
    notEmpty: true,
    trim: true,
    isEmail: {
      errorMessage: "Email should be a valid email address",
    },
  },
  password: {
    errorMessage: "Password is required",
    notEmpty: true,
    trim: true,
  },
});
