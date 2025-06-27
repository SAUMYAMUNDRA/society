import mongoose, { Schema } from "mongoose";
const FineSchema=new mongoose.Schema({
    userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  issuedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending",
  },
  paymentDate: {
    type: Date,
  },
  transactionId: {
    type: String,
  },
});
export const Fine=mongoose.model('Fine',FineSchema);