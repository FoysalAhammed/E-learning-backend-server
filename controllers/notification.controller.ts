import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { iOrder } from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import NotificationModel from "../models/notificationModel";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { newOrder } from "../services/order.service";
import cron from "node-cron"
// get all notifications  only for admins
export const getnotifications = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// update notification status

export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification Not Found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }
      await notification.save();
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
); 

//  delet notification 
cron.schedule("0 0 0 * * *",async()=>{
    const thirtyDaysAgo = new Date(Date.now()- 30 * 24 * 60 * 60 * 1000);
    await NotificationModel.deleteMany({status:"read",createdAt:{$lt:thirtyDaysAgo}});

})