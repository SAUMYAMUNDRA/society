import mongoose from "mongoose";

const societySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  seceratoryId:{
    type:String,
    required:true
  },
  address:{
    type:String,
    required:true,
     index: true
  },
  userId:{
    type:[],
    
  }

}, { timestamps: true });

export const Society = mongoose.model("Society", societySchema);
