import express from "express";
import {
  addAnswere,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAllCourse,
  getAllCourses,
  getCoursesByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authrizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controller";
const courseRouter = express.Router();
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.put("/add-question",updateAccessToken, isAuthenticated, addQuestion);
courseRouter.put("/add-answer", updateAccessToken,isAuthenticated, addAnswere);
courseRouter.put("/add-review/:id", updateAccessToken,isAuthenticated, addReview);
courseRouter.put("/add-review-reply",updateAccessToken, isAuthenticated,authrizeRoles("admin"), addReplyToReview );
courseRouter.get("/get-course-content/:id",updateAccessToken, isAuthenticated, getCoursesByUser);
courseRouter.get("/get-courses", updateAccessToken,isAuthenticated, authrizeRoles("admin"),getAllCourse);
courseRouter.get("/get-all-course", getAllCourses);
courseRouter.post(
  "/create-course",
  updateAccessToken,
  isAuthenticated,
  authrizeRoles("admin"),
  uploadCourse
);
courseRouter.post(
  "/getvdocipherOTP",
  generateVideoUrl
);
courseRouter.put(
  "/edit-course/:id",
  updateAccessToken,
  isAuthenticated,
  authrizeRoles("admin"),
  editCourse
);
courseRouter.delete(
  "/delete-course/:id",
  updateAccessToken,
  isAuthenticated,
  authrizeRoles("admin"),
  deleteCourse
);
export default courseRouter; 
