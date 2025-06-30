import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

export const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);