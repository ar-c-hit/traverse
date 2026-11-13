const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  joinTrip,
  likeTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// Optional protect for getTrips if user passes token (to get myTrips easily)
router.get('/', (req, res, next) => {
  // If authorization header exists, run protect, otherwise proceed
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getTrips);

router.get('/:id', getTripById);
router.post('/', protect, createTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.post('/:id/join', protect, joinTrip);
router.post('/:id/like', protect, likeTrip);

module.exports = router;

