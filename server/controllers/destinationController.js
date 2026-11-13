const mongoose = require('mongoose');
const Store = require('../utils/store');

// @desc Get all destinations
// @route GET /api/destinations
// Query params: liked ('true'), likedByUserId
const getDestinations = async (req, res) => {
  try {
    const destinations = await Store.destinations.find();
    const currentUserId = req.user ? req.user._id.toString() : null;
    const { liked, likedByUserId } = req.query;

    let results = destinations;

    if (liked === 'true') {
      const targetUserId = likedByUserId || currentUserId;
      if (targetUserId) {
        results = results.filter((d) =>
          Array.isArray(d.likedBy) &&
          d.likedBy.some((id) => (id?._id || id)?.toString() === targetUserId)
        );
      } else {
        results = [];
      }
    }

    const formatted = results.map((d) => {
      const likedBy = Array.isArray(d.likedBy)
        ? d.likedBy.map((id) => (id?._id || id)?.toString())
        : [];
      const hasLiked = currentUserId ? likedBy.includes(currentUserId) : false;
      return {
        ...d,
        hasLiked,
        likes: typeof d.likes === 'number' ? d.likes : likedBy.length,
        likedBy,
        rating: typeof d.rating === 'number' ? d.rating : 4.9,
        reviews: Array.isArray(d.reviews) ? d.reviews : []
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving destinations', error: error.message });
  }
};

// @desc Get single destination details with trips and reviews
// @route GET /api/destinations/:id
const getDestinationById = async (req, res) => {
  try {
    const destination = await Store.destinations.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const hasLiked = currentUserId && Array.isArray(destination.likedBy) ? destination.likedBy.includes(currentUserId) : false;

    // Find trips associated with this destination
    const allTrips = await Store.trips.find();
    const relatedTrips = allTrips.filter((t) => 
      (t.destination && t.destination.toLowerCase().includes(destination.name.toLowerCase())) ||
      (t.country && t.country.toLowerCase().includes(destination.country.toLowerCase()))
    );

    const sameTimeTrips = relatedTrips.filter((t) => t.status === 'upcoming' || t.status === 'traveling_now');
    const completedTrips = relatedTrips.filter((t) => t.status === 'completed');

    res.json({
      ...destination,
      hasLiked,
      sameTimeTrips,
      completedTrips
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching destination details', error: error.message });
  }
};

// @desc Create a new official destination travel guide (ADMIN ONLY)
// @route POST /api/destinations
const createDestination = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Only administrators can post official travel guides in Explore.' });
    }

    const {
      name,
      country,
      category,
      region,
      image,
      description,
      highlights,
      bestTimeToVisit,
      averageBudgetPerDay,
      vibe
    } = req.body;

    if (!name || !country || !image || !description) {
      return res.status(400).json({ message: 'Name, country, image, and description are required.' });
    }

    const isDomestic = (country.toLowerCase() === 'india' || category === 'National');
    const assignedCategory = category || (isDomestic ? 'National' : 'International');

    const highlightsArray = Array.isArray(highlights)
      ? highlights
      : (typeof highlights === 'string' ? highlights.split(',').map((h) => h.trim()).filter(Boolean) : []);

    const newDest = await Store.destinations.create({
      name: name.trim(),
      country: country.trim(),
      category: assignedCategory,
      region: region || (isDomestic ? 'India' : country),
      image: image.trim(),
      description: description.trim(),
      highlights: highlightsArray,
      bestTimeToVisit: bestTimeToVisit || 'October - March',
      averageBudgetPerDay: averageBudgetPerDay || (isDomestic ? '₹2,500/day' : '₹9,500/day'),
      vibe: vibe || 'Scenic & Cultural',
      activeTravelersCount: Math.floor(Math.random() * 20) + 10,
      pastTravelersCount: 1,
      likes: 12,
      likedBy: [req.user._id.toString()],
      rating: 5.0,
      reviews: [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          userId: req.user._id.toString(),
          userName: req.user.name,
          userAvatar: req.user.avatar,
          rating: 5,
          comment: `Official Admin Field Guide curated and verified by ${req.user.name}. Contains vetted routes, safety guidelines, and local coordinates!`,
          traveledDate: 'Verified Official Guide',
          verifiedTraveled: true,
          createdAt: new Date()
        }
      ],
      postedByAdmin: true,
      creatorName: req.user.name,
      creatorId: req.user._id.toString()
    });

    res.status(201).json(newDest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating travel guide', error: error.message });
  }
};

// @desc Update a destination guide (ADMIN ONLY)
// @route PUT /api/destinations/:id
const updateDestination = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can edit destination guides.' });
    }

    const updated = await Store.destinations.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating destination', error: error.message });
  }
};

// @desc Delete a destination guide (ADMIN ONLY)
// @route DELETE /api/destinations/:id
const deleteDestination = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete destination guides.' });
    }

    const deleted = await Store.destinations.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ message: 'Destination guide removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting destination', error: error.message });
  }
};

// @desc Like or unlike a destination travel guide (TOGGLE)
// @route POST /api/destinations/:id/like
const likeDestination = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'You must be signed in to like travel guides' });
    }

    const destination = await Store.destinations.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const userId = req.user._id.toString();
    const currentLikedBy = Array.isArray(destination.likedBy)
      ? destination.likedBy.map((id) => (id?._id || id)?.toString())
      : [];

    const alreadyLiked = currentLikedBy.includes(userId);
    let updatedLikedBy;
    let newLikes;
    let hasLiked;

    if (alreadyLiked) {
      // Toggle off / Unlike
      updatedLikedBy = currentLikedBy.filter((id) => id !== userId);
      newLikes = Math.max(0, (destination.likes || 1) - 1);
      hasLiked = false;
    } else {
      // Toggle on / Like
      updatedLikedBy = [...currentLikedBy, userId];
      newLikes = (destination.likes || 0) + 1;
      hasLiked = true;
    }

    const updated = await Store.destinations.findByIdAndUpdate(req.params.id, {
      likes: newLikes,
      likedBy: updatedLikedBy
    });

    res.json({
      likes: updated.likes,
      hasLiked,
      likedBy: updated.likedBy
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating destination like', error: error.message });
  }
};

// @desc Add a review by a user who traveled using this guide
// @route POST /api/destinations/:id/reviews
const addDestinationReview = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'You must be signed in to review this travel guide' });
    }

    const { rating, comment, traveledDate, verifiedTraveled } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Review comment is required.' });
    }

    const destination = await Store.destinations.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const newReview = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: req.user._id.toString(),
      userName: req.user.name,
      userAvatar: req.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: numRating,
      comment: comment.trim(),
      traveledDate: traveledDate || 'Traveled recently',
      verifiedTraveled: verifiedTraveled !== undefined ? Boolean(verifiedTraveled) : true,
      createdAt: new Date()
    };

    const currentReviews = Array.isArray(destination.reviews) ? destination.reviews : [];
    const updatedReviews = [newReview, ...currentReviews];

    // Compute updated average rating
    const avgRating = (
      updatedReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / updatedReviews.length
    ).toFixed(1);

    const updated = await Store.destinations.findByIdAndUpdate(req.params.id, {
      reviews: updatedReviews,
      rating: Number(avgRating),
      pastTravelersCount: (destination.pastTravelersCount || 0) + 1
    });

    res.status(201).json({
      message: 'Verified traveler review posted successfully!',
      review: newReview,
      destination: updated
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  likeDestination,
  addDestinationReview
};
