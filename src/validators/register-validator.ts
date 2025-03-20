import { checkSchema } from "express-validator";

export default checkSchema({
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
    isEmail: {
      errorMessage: "Invalid email format",
    },
  },
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: "Password should be at least 8 chars",
    },
  },
});
