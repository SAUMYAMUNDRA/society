import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  secretaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Secretary",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    default: null
  }
}, { timestamps: true });

export const Notice = mongoose.model("Notice", NoticeSchema);
