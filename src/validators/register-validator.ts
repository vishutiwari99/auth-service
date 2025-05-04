import { checkSchema } from "express-validator";

export const userRegistrationValidationSchema = checkSchema({
  firstName: {
    errorMessage: "First name is required",
    notEmpty: true,
    trim: true,
  },
  lastName: {
    errorMessage: "Last name is required",
    notEmpty: true,
    trim: true,
  },
  email: {
    errorMessage: "Email is required",
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: "Password should be at least 8 chars",
    },
  },

  tenantId: {
    errorMessage: "Tenant ID is required",
    notEmpty: false,
    trim: true,
  },
  role: {
    errorMessage: "Role is required",
    notEmpty: true,
  },
});
