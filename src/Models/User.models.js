import mongoose, { Schema } from "mongoose";
const UserSchema = new mongoose.Schema({
  name: { type: String  },
  email: { type: String},
  phone: { type: String, required: true },
//   dob: { type: Date, required: true },
//   societyName: { type: String, required: true },
//   societyAddress: { type: String, required: true },
  password: { type: String},
//   cpass: { type: String, required: true },
  flatNo: { type: String, required: true },
  secretaryId:{
    type:Schema.Types.ObjectId,
    ref:"Secretary",
    require:true
  },
  role: {
    type: String,
    enum: ["member", "worker"],
    default: "member"
  }
});

export const User = mongoose.model("User", UserSchema);