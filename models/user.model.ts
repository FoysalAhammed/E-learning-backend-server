import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
const emailRegexpattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
require("dotenv").config();
 import jwt from "jsonwebtoken"
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken:()=>string;
  SignRefreshToken:()=>string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please Enter Your Name"],
    },
    email: {
      type: String,
      required: [true, "please enter your email address"],
      validate: {
        validator: function (value: string) {
          return emailRegexpattern.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

// hash password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// sign our access token  
userSchema.methods.SignAccessToken =function (){
  return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || "" ,{
    expiresIn:"5m",
  })
};

// sign refresh token 
userSchema.methods.SignRefreshToken =function (){
  return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || "",{
    expiresIn:"7d",
  } )
};

// compare password
userSchema.methods.comparePassword = async function (
  enterdPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enterdPassword, this.password);
};
const userModel: Model<IUser> = mongoose.model("user", userSchema);

export default userModel;
