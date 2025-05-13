import { checkSchema } from "express-validator";
import { UpdateUserRequest } from "../types";

export const userUpdateValidationSchema = checkSchema({
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

  tenantId: {
    errorMessage: "Tenant ID is required",
    trim: true,
    custom: {
      options: (value: string, { req }) => {
        const role = (req as UpdateUserRequest).body.role;
        if (role === "admin" && value !== "admin") {
          return true;
        } else {
          return !!value;
        }
      },
    },
  },
  role: {
    errorMessage: "Role is required",
    notEmpty: true,
  },
});
