import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dob: { type: Date }, // Optional: use if needed
  address: { type: String }, // Optional
  password:    { type: String, default: "" }, 
  passwordSet: { type: Boolean, default: false },
  flatNo: { type: String, required: true },

  secretaryId: {
    type: Schema.Types.ObjectId,
    ref: "Secretary",
    required: true
  },

  role: {
    type: String,
    enum: ["member", "worker"],
    default: "member"
  }
});

export const User = mongoose.model("User", UserSchema);
