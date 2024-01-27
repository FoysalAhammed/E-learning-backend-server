import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";
import { getAllUsersService } from "../services/user.service";
import axios from "axios";

// upload course

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  }
);

//  edit courses

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get single course -- without purchasing

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExist = await redis.get(courseId);
      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.question -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course),"EX",604800);
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all courses -- without purchasing
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
     
        const courses = await CourseModel.find().select(
          " -courseData.suggestion -courseData.question"
        );

        res.status(200).json({
          success: true,
          courses,
        });
      }
     catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// course content -- only for valid user

export const getCoursesByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCoursList = req.user?.courses;
      const CourseId = req.params.id;
      const courseExists = userCoursList?.find(
        (course: any) => course._id.toString() === CourseId
      );
      if (!courseExists) {
        return next(
          new ErrorHandler("you are not eligible to access this course", 404)
        );
      }
      const course = await CourseModel.findById(CourseId);
      const content = course?.courseData;
      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add question in courses

interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("invalid Content id", 400));
      }
      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new ErrorHandler("invalid Content id", 400));
      }
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };
      //  add this question to our coursee content
      courseContent.question.push(newQuestion);
      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question",
        message: `you have a new Question from ${courseContent?.title}`,
      });
      // save the upload course
      await course?.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}
export const addAnswere = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const course = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("invalid Content id", 400));
      }
      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(new ErrorHandler("invalid Content id", 400));
      }
      // create a new question

      const question = courseContent?.question.find((item: any) =>
        item._id.equals(questionId)
      );
      if (!question) {
        return next(new ErrorHandler("invalid question id", 500));
      }
      // create new answere object
      const newAnswer: any = {
        user: req.user,
        answer,
        createdAt:new Date().toISOString(),
        updatedAt:new Date().toISOString()
      };
      //  add this ansere to our courses
      question.questionReplies.push(newAnswer);
      await course?.save();
      if (req.user?._id === question.user._id) {
        
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question reply in this course",
          message: `you have a new Question reply from ${courseContent?.title}`,
        });
        // create notification

      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-replay.ejs"),
          data
        );
        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Replay",
            template: "question-replay.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


// add a review in course 

interface IAddReviewData{
  review:string;
  rating:number;
  userId:string;
}
export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
       try {
        const userCoursList = req.user?.courses;
        const courseId= req.params.id
      //  check if course id aleady exists in uesrCourseList based on _ID  
        const courseExists= userCoursList?.some((course:any)=> course._id.toString()===courseId.toString());
        if (!courseExists) {
          return next(new ErrorHandler("you are not eligiable to access this course", 500));
        }
        const course = await CourseModel.findById(courseId);
        const {review,rating} = req.body as IAddReviewData;
        const reviewData:any ={
          user:req.user,
          comment:review,
          rating,
        }
        course?.reviews.push(reviewData)
        let avg = 0;
        course?.reviews.forEach((rev:any)=>{
          avg+= rev.rating;
        })
        if (course) {
           course.ratings = avg/course.reviews.length
        }
        await course?.save();
          await redis.set(courseId,JSON.stringify(course),"EX", 604800)
        // create a notification 
        await NotificationModel.create({
          user: req.user?._id,
          title:"New Review Received",
          message:`${req.user?.name} has given a review on ${course?.name}`,
        });
        res.status(200).json({
          success:true,
          course
        })
       } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
       }
  });


  // add replay to review 
  interface IAddReviewData{
    comment:string;
    courseId:string;
    reviewId:string;
  }
  export const addReplyToReview = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
try {
     const {comment,courseId,reviewId} = req.body as IAddReviewData;
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("course not found", 404));
      }
      const review = course?.reviews?.find((rev:any)=>rev._id.toString()=== reviewId)
      if (!review) {
        return next(new ErrorHandler("review not found", 404));
      } 
       const replyData:any={
        user:req.user,
        comment,
        createdAt:new Date().toISOString(),
        updatedAt:new Date().toISOString()
       }
       if (!review.commentReplies) {
         review.commentReplies=[];
       }
       
       review.commentReplies.push(replyData)
       await redis.set(courseId,JSON.stringify(course),"EX", 604800)
       await course?.save();

       res.status(200).json({
        success:true,
        course
       })
} catch (error:any) {
  return next(new ErrorHandler(error.message, 500));
}
})

export const getAllCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// delete course only for admin 


export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) {
        return next(new ErrorHandler("user not found", 400));
      }
      await course.deleteOne({ id });
      await redis.del(id);
      res.status(201).json({
        success: true,
        message: "course deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//  GENERATE VIDEO URL


export const generateVideoUrl = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {videoId} = req.body;
      const response =  await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        {ttl:300},
        {
          headers:{
            Accept:"application/json","Content-Type":"application/json",
            Authorization:`Apisecret ${process.env.VDOCIPHER_API_SECRET}`
          }
        }
      )
      res.json(response.data);
      
    } catch (error:any) {
       return next(new ErrorHandler(error.message,404))
    }

  })