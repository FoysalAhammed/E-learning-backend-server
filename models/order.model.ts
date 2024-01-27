import mongoose, { Document, Schema, Model } from "mongoose";
export interface iOrder extends Document{
    courseId:string;
    userId:string;
    payment_info:object;
}
const orderSchema = new Schema<iOrder>({
    courseId:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        // required:true,
    },
    payment_info:{
        type:Object,
        // required:true,
    },
},{timestamps:true})

const OrderModel:Model<iOrder> = mongoose.model("Order",orderSchema);
export default OrderModel