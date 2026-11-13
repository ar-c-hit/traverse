const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  likeDestination,
  addDestinationReview
} = require('../controllers/destinationController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Optional protect to identify user if token is provided
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalProtect, getDestinations);
router.get('/:id', optionalProtect, getDestinationById);
router.post('/', protect, adminOnly, createDestination);
router.put('/:id', protect, adminOnly, updateDestination);
router.delete('/:id', protect, adminOnly, deleteDestination);
router.post('/:id/like', protect, likeDestination);
router.post('/:id/reviews', protect, addDestinationReview);

module.exports = router;
