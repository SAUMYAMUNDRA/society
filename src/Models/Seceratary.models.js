import mongoose from "mongoose";

const secretarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  }
//   email:{
//     type:String,
//     required:true,
//   },
//   ID: {
//     type: String,
//     required: true,
//     index: true,
//     unique: true,
//   },
//   DOB: {
//     type: String,
//     required: true,
//   },
//   Gender: {
//     type: String,
//     required: true,
//     enum: ['Male', 'Female', 'Other'], 
//   },
//   societyName: {
//     type: String,
//     required: true,
//   },
}
, 
{ timestamps: true });

export const Secretary = mongoose.model("Secretary", secretarySchema);
