const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    category: { type: String, enum: ['National', 'International'], default: 'National' },
    region: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
    bestTimeToVisit: { type: String, default: 'Year round' },
    averageBudgetPerDay: { type: String, default: '₹2,500/day' },
    vibe: { type: String, default: 'Culture & Scenic' },
    activeTravelersCount: { type: Number, default: 12 },
    pastTravelersCount: { type: Number, default: 85 },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    rating: { type: Number, default: 4.9 },
    reviews: [
      {
        userId: { type: String },
        userName: { type: String },
        userAvatar: { type: String },
        rating: { type: Number, default: 5 },
        comment: { type: String, required: true },
        traveledDate: { type: String, default: 'Recently Traveled' },
        verifiedTraveled: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    postedByAdmin: { type: Boolean, default: true },
    creatorName: { type: String, default: 'Archit (Super Admin)' },
    creatorId: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Destination || mongoose.model('Destination', destinationSchema);


