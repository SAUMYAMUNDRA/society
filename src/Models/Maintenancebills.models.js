import mongoose from "mongoose";

const MaintenanceBillsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Paid", "Pending", "Failed"],
    default: "Pending",
  },
  paymentDate: {
    type: Date,
  },
  transactionId: {
    type: String,
  },
}, { timestamps: true }); 

export const MaintenanceBills = mongoose.model("MaintenanceBills", MaintenanceBillsSchema);
