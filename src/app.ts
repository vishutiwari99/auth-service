import express, { NextFunction } from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res, next: NextFunction) => {
  res.status(200).send("Hello Worlda!");
  next();
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

app.use(globalErrorHandler);

export default app;
