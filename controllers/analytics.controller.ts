import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MonthData } from "../utils/anaylytics.generator";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.model";

// get users analytics 

export const getUsersAnalytics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
       try {
         const users = await generateLast12MonthData(userModel);
         res.status(200).json({
            success:true,
            users,
         })
       } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
       }
    }) 
// get courses analytics 

export const getCoursesAnalytics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
       try {
         const courses = await generateLast12MonthData(CourseModel);
         res.status(200).json({
            success:true,
            courses,
         })
       } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
       }
    }) 

    // get order analytcis 

export const getOrderAnalytics = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
       try {
         const orders = await generateLast12MonthData(OrderModel);
         res.status(200).json({
            success:true,
            orders,
         })
       } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
       }
    }) 