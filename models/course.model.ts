import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "./user.model";
interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies: IComment[];
}

interface IReview extends Document {
  user: IUser;
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

interface ILink extends Document {
  title: string;
  url: string;
}
interface ICourseData extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: ILink[];
  suggestion: string;
  question: IComment[];
}

 export interface ICourse extends Document {
  name: string;
  description: string;
  categories:string;
  price: number;
  estimatedPrice: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  preRequisites: { title: string }[];
  courseData: ICourseData[];
  reviews: IReview[];
  ratings: number;
  purchased: number;
}

const reviewSchema = new Schema<IReview>({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
  commentReplies:[Object],
},{timestamps:true});

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});
const commentSChema = new Schema<IComment>({
  user: Object,
  question: String,
  questionReplies: [Object],
},{timestamps:true});

const courseDataSchema = new Schema<ICourseData>({
  videoUrl: String,
  title: String,
  videoSection: String,
  description: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  question: [commentSChema],
});

const CoursSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories:{
        type:String,
        required:true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
  },
  thumbnail: {
    public_id: {
      type: String,

    },
    url: {
      type: String,

    },
  },
  tags: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [{ title: String }],
  preRequisites: [{ title: String }],
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  ratings: {
      type: Number,
      default: 0,
    },
    purchased: {
      type: Number,
      default: 0,
    },
},{timestamps:true}
);
const CourseModel: Model<ICourse> = mongoose.model("Course", CoursSchema);
export default CourseModel;
