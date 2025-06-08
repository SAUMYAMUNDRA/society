import mongoose from "mongoose";

const secretarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  societyName: { type: String, required: true },
  societyAddress: { type: String, required: true },
  password: { type: String, required: true },
  cpass: { type: String, required: true },
  fullAddress: { type: String, required: true }
});

export const Secretary = mongoose.model("Secretary", secretarySchema);
