import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: [true, 'Food category is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unit: {
    type: String,
    enum: ['kg', 'plates', 'packets', 'boxes', 'liters'],
    default: 'plates',
  },
  estimatedMeals: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
    },
  },
  pickupTime: {
    type: Date,
    required: [true, 'Pickup time is required'],
  },
  expiryTime: {
    type: Date,
    required: [true, 'Expiry time is required'],
  },
  cookedTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered', 'expired', 'cancelled'],
    default: 'pending',
  },
  deliveryOtp: {
    type: String,
  },
  image: {
    type: String,
    default: '',
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  safetyChecked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

DonationSchema.index({ 'location': '2dsphere' });
DonationSchema.index({ status: 1 });
DonationSchema.index({ donor: 1 });
DonationSchema.index({ expiryTime: 1 });

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
