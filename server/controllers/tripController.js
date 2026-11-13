const Store = require('../utils/store');
const { createNotification } = require('../utils/notify');

// @desc Get all trips with optional filtering
// @route GET /api/trips
// Query params: status ('same_time', 'upcoming', 'traveling_now', 'completed'), destination, travelStyle, search, startDate, endDate, liked, likedByUserId
const getTrips = async (req, res) => {
  try {
    const { status, destination, travelStyle, search, startDate, endDate, myTrips, userId, liked, likedByUserId } = req.query;

    let trips = await Store.trips.find();
    const currentUserId = req.user ? req.user._id.toString() : null;

    // Filter by liked cards
    if (liked === 'true') {
      const targetUserId = likedByUserId || currentUserId;
      if (targetUserId) {
        trips = trips.filter(t => Array.isArray(t.likedBy) && t.likedBy.some(id => (id?._id || id)?.toString() === targetUserId));
      } else {
        trips = [];
      }
    }

    // Filter by myTrips or specific userId
    if (myTrips === 'true' && currentUserId) {
      trips = trips.filter(t => t.userId && t.userId.toString() === currentUserId);
    } else if (userId) {
      trips = trips.filter(t => t.userId && t.userId.toString() === userId.toString());
    }

    // Filter by status category
    if (status) {
      if (status === 'same_time') {
        // Traveler traveling at the same time (upcoming or currently traveling)
        trips = trips.filter(t => t.status === 'upcoming' || t.status === 'traveling_now');
      } else if (status === 'completed') {
        // Travelers who have already done their travel
        trips = trips.filter(t => t.status === 'completed');
      } else {
        trips = trips.filter(t => t.status === status);
      }
    }

    // Filter by destination / search
    if (destination) {
      const q = destination.toLowerCase().trim();
      trips = trips.filter(t => 
        (t.destination && t.destination.toLowerCase().includes(q)) || 
        (t.country && t.country.toLowerCase().includes(q))
      );
    }

    if (search) {
      const q = search.toLowerCase().trim();
      trips = trips.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.destination && t.destination.toLowerCase().includes(q)) ||
        (t.country && t.country.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.creatorName && t.creatorName.toLowerCase().includes(q))
      );
    }

    // Travel style filter
    if (travelStyle && travelStyle !== 'All') {
      trips = trips.filter(t => t.travelStyle && t.travelStyle.toLowerCase() === travelStyle.toLowerCase());
    }

    // Date overlap filter (for travelers looking to match exact same travel dates)
    if (startDate && endDate) {
      const userStart = new Date(startDate);
      const userEnd = new Date(endDate);
      trips = trips.filter(t => {
        if (!t.startDate || !t.endDate) return true;
        const tripStart = new Date(t.startDate);
        const tripEnd = new Date(t.endDate);
        // Overlap condition: tripStart <= userEnd && tripEnd >= userStart
        return tripStart <= userEnd && tripEnd >= userStart;
      });
    }

    // Format trips with accurate likes count and hasLiked flag
    const formatted = trips.map(t => {
      const likedBy = Array.isArray(t.likedBy)
        ? t.likedBy.map(id => (id?._id || id)?.toString())
        : [];
      const hasLiked = currentUserId ? likedBy.includes(currentUserId) : false;
      return {
        ...t,
        likes: typeof t.likes === 'number' ? t.likes : likedBy.length,
        likedBy,
        hasLiked
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving trips', error: error.message });
  }
};

// @desc Get trip by ID
// @route GET /api/trips/:id
const getTripById = async (req, res) => {
  try {
    const trip = await Store.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    const currentUserId = req.user ? req.user._id.toString() : null;
    const likedBy = Array.isArray(trip.likedBy)
      ? trip.likedBy.map(id => (id?._id || id)?.toString())
      : [];
    const hasLiked = currentUserId ? likedBy.includes(currentUserId) : false;

    res.json({
      ...trip,
      likes: typeof trip.likes === 'number' ? trip.likes : likedBy.length,
      likedBy,
      hasLiked
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip details', error: error.message });
  }
};

// @desc Create a new trip
// @route POST /api/trips
const createTrip = async (req, res) => {
  try {
    const {
      title,
      origin,
      destination,
      country,
      coverImage,
      startDate,
      endDate,
      budget,
      travelStyle,
      status,
      transitMode,
      distanceKm,
      stoppages,
      description,
      highlights,
      itinerary,
      lookingForCompanions,
      travelAdvice
    } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, destination, and travel dates are required' });
    }

    // Auto-determine or use provided status
    // If user marks completed or dates are in the past, or explicitly set
    let tripStatus = status || 'upcoming';
    const now = new Date();
    if (new Date(endDate) < now && !status) {
      tripStatus = 'completed';
    }

    const defaultCovers = [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80'
    ];
    const assignedCover = coverImage || defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const newTrip = await Store.trips.create({
      userId: req.user._id,
      creatorName: req.user.name,
      creatorEmail: req.user.email,
      creatorAvatar: req.user.avatar,
      title,
      origin: origin || 'New Delhi',
      destination,
      country: country || destination.split(',')[1]?.trim() || 'Worldwide',
      coverImage: assignedCover,
      startDate,
      endDate,
      budget: budget || '₹15,000',
      travelStyle: travelStyle || 'Solo',
      status: tripStatus,
      transitMode: transitMode || 'bus',
      distanceKm: distanceKm || 0,
      stoppages: stoppages || [],
      description: description || `Excited for this journey to ${destination}!`,
      highlights: highlights || [],
      itinerary: itinerary || [],
      lookingForCompanions: lookingForCompanions !== undefined ? lookingForCompanions : true,
      companions: [],
      travelAdvice: travelAdvice || '',
      rating: tripStatus === 'completed' ? 5 : 0,
      reviewsCount: tripStatus === 'completed' ? 1 : 0,
      likes: 0
    });

    res.status(201).json(newTrip);
  } catch (error) {
    res.status(500).json({ message: 'Error creating trip', error: error.message });
  }
};

// @desc Update trip
// @route PUT /api/trips/:id
const updateTrip = async (req, res) => {
  try {
    const trip = await Store.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check ownership or admin
    if (trip.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to edit this trip' });
    }

    const updated = await Store.trips.findByIdAndUpdate(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating trip', error: error.message });
  }
};

// @desc Delete trip
// @route DELETE /api/trips/:id
const deleteTrip = async (req, res) => {
  try {
    const trip = await Store.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this trip' });
    }

    await Store.trips.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip successfully removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting trip', error: error.message });
  }
};

// @desc Join a trip as a companion / travel buddy (same time travel)
// @route POST /api/trips/:id/join
const joinTrip = async (req, res) => {
  try {
    const trip = await Store.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const userIdStr = req.user._id.toString();
    if (trip.userId.toString() === userIdStr) {
      return res.status(400).json({ message: 'You are the creator of this trip' });
    }

    const companions = trip.companions || [];
    const alreadyJoined = companions.some(c => c.userId === userIdStr);

    if (alreadyJoined) {
      // Leave trip
      const filtered = companions.filter(c => c.userId !== userIdStr);
      const updated = await Store.trips.findByIdAndUpdate(req.params.id, { companions: filtered });
      return res.json({ message: 'Left trip companions', joined: false, trip: updated });
    } else {
      // Join trip
      companions.push({
        userId: userIdStr,
        name: req.user.name,
        avatar: req.user.avatar,
        joinedAt: new Date()
      });
      const updated = await Store.trips.findByIdAndUpdate(req.params.id, { companions });

      const io = req.app?.get('io');
      // Notify trip creator
      const tripCreatorId = trip.userId ? trip.userId.toString() : null;
      if (tripCreatorId && tripCreatorId !== userIdStr) {
        createNotification({
          recipient: tripCreatorId,
          sender: {
            _id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            avatar: req.user.avatar,
            badge: req.user.badge || 'EXPLORER'
          },
          type: 'join_trip',
          title: 'New Travel Buddy! 🎒',
          message: `${req.user.name} joined your companion list for "${trip.title}"!`,
          link: `/planner?trip=${trip._id}`,
          metadata: { tripId: trip._id, tripTitle: trip.title }
        }, io);
      }

      // Also notify current user so their tray updates immediately
      createNotification({
        recipient: userIdStr,
        sender: {
          _id: tripCreatorId || '670000000000000000000001',
          name: trip.user?.name || 'Traverse Organizer',
          username: trip.user?.username || 'traverse',
          avatar: trip.user?.avatar,
          badge: 'ORGANIZER'
        },
        type: 'join_trip',
        title: 'Trip Joined! 🎒',
        message: `You joined "${trip.title}"! Pack your bags!`,
        link: `/planner?trip=${trip._id}`,
        metadata: { tripId: trip._id, tripTitle: trip.title }
      }, io);

      return res.json({ message: 'Joined trip companion list!', joined: true, trip: updated });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating companion status', error: error.message });
  }
};

// @desc Like or unlike a trip itinerary (TOGGLE per user)
// @route POST /api/trips/:id/like
const likeTrip = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'You must be signed in to like an itinerary' });
    }

    const trip = await Store.trips.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const userId = req.user._id.toString();
    const currentLikedBy = Array.isArray(trip.likedBy)
      ? trip.likedBy.map((id) => (id?._id || id)?.toString())
      : [];

    const alreadyLiked = currentLikedBy.includes(userId);
    let updatedLikedBy;
    let newLikes;
    let hasLiked;

    if (alreadyLiked) {
      // Toggle off / Unlike
      updatedLikedBy = currentLikedBy.filter((id) => id !== userId);
      newLikes = Math.max(0, (trip.likes || 1) - 1);
      hasLiked = false;
    } else {
      // Toggle on / Like
      updatedLikedBy = [...currentLikedBy, userId];
      newLikes = (trip.likes || 0) + 1;
      hasLiked = true;
    }

    const updated = await Store.trips.findByIdAndUpdate(req.params.id, {
      likes: newLikes,
      likedBy: updatedLikedBy,
    });

    if (hasLiked) {
      const io = req.app?.get('io');
      const tripCreatorId = trip.userId ? trip.userId.toString() : null;
      if (tripCreatorId && tripCreatorId !== userId) {
        createNotification({
          recipient: tripCreatorId,
          sender: {
            _id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            avatar: req.user.avatar,
            badge: req.user.badge || 'EXPLORER'
          },
          type: 'like_trip',
          title: 'Trip Itinerary Liked ❤️',
          message: `${req.user.name} liked your itinerary "${trip.title}"!`,
          link: `/planner?trip=${trip._id}`,
          metadata: { tripId: trip._id, tripTitle: trip.title }
        }, io);
      }

      // Also notify current user
      createNotification({
        recipient: userId,
        sender: {
          _id: tripCreatorId || '670000000000000000000001',
          name: trip.user?.name || 'Traverse Traveler',
          username: trip.user?.username || 'traverse',
          avatar: trip.user?.avatar,
          badge: 'TRAVELER'
        },
        type: 'like_trip',
        title: 'Trip Saved to Liked Cards ❤️',
        message: `You liked "${trip.title}". Saved to your profile bookmarks!`,
        link: `/profile`,
        metadata: { tripId: trip._id, tripTitle: trip.title }
      }, io);
    }

    res.json({
      likes: newLikes,
      hasLiked,
      likedBy: updatedLikedBy,
      trip: {
        ...updated,
        likes: newLikes,
        likedBy: updatedLikedBy,
        hasLiked,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error liking trip', error: error.message });
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  joinTrip,
  likeTrip
};

