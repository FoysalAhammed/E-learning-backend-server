import express  from "express";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";
import { getnotifications, updateNotification } from "../controllers/notification.controller";
import { updateAccessToken } from "../controllers/user.controller";
const notificationRoute = express.Router();


notificationRoute.get("/get-all-notifications",updateAccessToken,isAuthenticated,authrizeRoles("admin"),getnotifications);
notificationRoute.put("/update-notification/:id",updateAccessToken,isAuthenticated,authrizeRoles("admin"),updateNotification);
export default notificationRoute;