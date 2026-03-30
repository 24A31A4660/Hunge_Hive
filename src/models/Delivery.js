import mongoose from 'mongoose';

const DeliverySchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true,
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['assigned', 'picked', 'in-transit', 'delivered', 'cancelled'],
    default: 'assigned',
  },
  deliveryOtp: {
    type: String,
  },
  pickupLocation: {
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
  deliveryLocation: {
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
  distance: {
    type: Number,
  },
  estimatedTime: {
    type: Number,
  },
  pickedAt: Date,
  deliveredAt: Date,
  notes: String,
}, {
  timestamps: true,
});

DeliverySchema.index({ volunteer: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ donation: 1 });

export default mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);
