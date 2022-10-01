import "express-async-errors";
import "reflect-metadata";

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import "./database";
import createConnection from "./database/index";
import { router } from "./routes";
import "./shared/container";
import { AppError } from "./shared/errors/AppError";

createConnection();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

app.use(
  (err: Error, request: Request, response: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      return response.status(err.statusCode).json({
        message: err.message,
      });
    }

    return response.status(500).json({
      status: "error",
      message: `Internal server error - ${err.message} `,
    });
  }
);

export { app };
