import express from "express";
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  logOutUser,
  loginUser,
  registrationUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  updateUserRole,
} from "../controllers/user.controller";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, authrizeRoles("admin"), logOutUser);
userRouter.get("/logout", isAuthenticated, logOutUser);
userRouter.get("/me",updateAccessToken, getUserInfo);
userRouter.get("/refreshtoken",isAuthenticated, updateAccessToken); 
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user-info",updateAccessToken, isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password",updateAccessToken, isAuthenticated, updatePassword);
userRouter.put("/update-user-avatar",updateAccessToken, isAuthenticated, updateProfilePicture);
userRouter.get("/get-users",updateAccessToken, isAuthenticated, authrizeRoles("admin"),getAllUsers);
userRouter.put("/update-user-role",updateAccessToken, isAuthenticated, authrizeRoles("admin"),updateUserRole);
userRouter.delete("/delete-user/:id",updateAccessToken, isAuthenticated, authrizeRoles("admin"),deleteUser);

export default userRouter;
