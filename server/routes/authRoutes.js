const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getUserProfile,
  followUser,
  getUserFollowers,
  getUserFollowing,
  getUsersDirectory,
  getUserFriends,
  getLeaderboard
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Optional protect helper
const optionalProtect = (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/leaderboard', getLeaderboard);
router.get('/directory', optionalProtect, getUsersDirectory);
router.get('/friends', protect, getUserFriends);
router.post('/follow/:id', protect, followUser);
router.get('/user/:id', optionalProtect, getUserProfile);
router.get('/user/:id/followers', optionalProtect, getUserFollowers);
router.get('/user/:id/following', optionalProtect, getUserFollowing);

module.exports = router;

