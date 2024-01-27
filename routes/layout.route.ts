import express from "express";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
import { updateAccessToken } from "../controllers/user.controller";
const layoutRouter = express.Router()


layoutRouter.post("/create-layout",updateAccessToken,isAuthenticated,authrizeRoles("admin"),createLayout)
layoutRouter.put("/edit-layout",updateAccessToken,isAuthenticated,authrizeRoles("admin"),editLayout)
layoutRouter.get("/get-layout/:type" , getLayoutByType)

export default layoutRouter;