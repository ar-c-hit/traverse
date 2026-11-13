const jwt = require('jsonwebtoken');
const Store = require('../utils/store');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'traverse_super_secret_jwt_key_2026'
      );
      const user = await Store.users.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found for this token' });
      }

      req.user = {
        _id: user._id,
        name: user.name,
        username: user.username || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        homeCity: user.homeCity,
        travelStyle: user.travelStyle,
        visitedCountries: user.visitedCountries
      };

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };

