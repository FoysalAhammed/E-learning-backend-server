import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // wrong mongodb id sending
  if (err.name === "CastError") {
    const message = `Resource Not Found. Invalid:${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.KeyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt token error

  if (err.name === "JsonWebTokenError") {
    const message = `json web token is invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  // jwt token expire
  if (err.name === "TokenExpiredError") {
    const message = `json web token is Expired, try again`;
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
