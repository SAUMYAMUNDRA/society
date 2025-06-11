import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  secretaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Secretary", 
    required: true
  },
  title:{
    type:String
  },
  content: {
    type: String,
  }
}, { timestamps: true });

export const Notice = mongoose.model("Notice", NoticeSchema);
