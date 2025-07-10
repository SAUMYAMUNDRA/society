import mongoose from "mongoose";
const lostFoundItemSchema=new mongoose.Schema({
      title: { type: String, required: true },
  description: String,
  imageUrl: String,
  location: String,
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  status: { type: String, enum: ['Unclaimed', 'Claimed'], default: 'Unclaimed' },
    claimedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    flatNo: String
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});
export const  LostFoundItem=mongoose.model('LostFoundItem',lostFoundItemSchema);