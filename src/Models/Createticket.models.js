import mongoose, { Schema } from "mongoose";

const CreateticketSchema = new mongoose.Schema({
    Userid: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    Secid: {
        type:Schema.Types.ObjectId,
        ref:"Secretary",
        required: true
    },
    Flatno: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    Prefered_date_and_time: {
        type: String,
        required: true
    },
    Conatctno: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    state:{
        type:String,
        default:"open",
    },
    Status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending"
  },

});

export const Createticket = mongoose.model("Createticket", CreateticketSchema);
