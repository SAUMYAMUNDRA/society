import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  time: String,
  venue: String,
  organizer: String,
  capacity: Number, 
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Secretary'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Event = mongoose.model('Event', eventSchema);
