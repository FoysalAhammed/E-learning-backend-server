import express from "express";
import { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
require("dotenv").config();
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import anaylyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import {rateLimit} from "express-rate-limit";
// body Parser
app.use(express.json({ limit: "50mb" }));

// cookie  Parser
app.use(cookieParser());

// cors cross origin resources sharing
app.use(
  cors({
    origin:['http://localhost:3000'],
    credentials:true,
  })
);
// api request limit 
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
})

// routes api
app.use("/api/v1", userRouter,orderRouter,courseRouter,notificationRouter,anaylyticsRouter,layoutRouter);



//   testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "api is working fine",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`route ${req.originalUrl} not found `) as any;
  err.statusCode = 404;
  next(err);
});
// middleware calls

app.use(limiter)
app.use(ErrorMiddleware);
