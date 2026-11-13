const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creatorName: { type: String, required: true },
    creatorEmail: { type: String },
    creatorAvatar: { type: String },
    title: { type: String, required: true },
    origin: { type: String, default: 'New Delhi' },
    destination: { type: String, required: true },
    transitMode: { type: String, enum: ['bus', 'train', 'bike', 'flight', 'other'], default: 'bus' },
    distanceKm: { type: Number, default: 0 },
    stoppages: { type: Array, default: [] },
    country: { type: String, required: true },
    coverImage: { type: String, default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    budget: { type: String, default: '₹15,000' },
    travelStyle: { 
      type: String, 
      enum: ['Solo', 'Backpacker', 'Couple', 'Friends / Group', 'Luxury', 'Adventure', 'Cultural'],
      default: 'Solo' 
    },
    // status: 'upcoming' / 'traveling_now' for same time, 'completed' for past travel
    status: {
      type: String,
      enum: ['traveling_now', 'upcoming', 'completed'],
      default: 'upcoming'
    },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
    itinerary: [
      {
        day: { type: Number },
        title: { type: String },
        activities: { type: [String], default: [] }
      }
    ],
    // For synchronous travelers
    lookingForCompanions: { type: Boolean, default: true },
    companions: [
      {
        userId: { type: String },
        name: { type: String },
        avatar: { type: String },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    // For travelers who have completed their trip
    travelAdvice: { type: String, default: '' },
    rating: { type: Number, default: 5 },
    reviewsCount: { type: Number, default: 1 },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

