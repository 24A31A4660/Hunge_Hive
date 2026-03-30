import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
    address: String,
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  estimatedFood: {
    type: Number,
    required: [true, 'Estimated food quantity is required'],
  },
  unit: {
    type: String,
    enum: ['kg', 'plates', 'packets', 'boxes'],
    default: 'plates',
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  registeredNGOs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

EventSchema.index({ date: 1 });
EventSchema.index({ status: 1 });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
