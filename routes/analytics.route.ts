import express from "express";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";
import { getCoursesAnalytics, getOrderAnalytics, getUsersAnalytics } from "../controllers/analytics.controller";

const anaylyticsRouter = express.Router();


anaylyticsRouter.get("/get-users-analytics",isAuthenticated,authrizeRoles("admin"),getUsersAnalytics)
anaylyticsRouter.get("/get-courses-analytics",isAuthenticated,authrizeRoles("admin"),getCoursesAnalytics)
anaylyticsRouter.get("/get-orders-analytics",isAuthenticated,authrizeRoles("admin"),getOrderAnalytics)

export default anaylyticsRouter