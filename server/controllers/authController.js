const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Store = require('../utils/store');
const { createNotification } = require('../utils/notify');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'traverse_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc Register new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, bio, travelStyle, homeCity } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await Store.users.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await Store.users.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      bio: bio || 'Excited to traverse the globe and connect with fellow explorers.',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      travelStyle: travelStyle || 'Explorer',
      homeCity: homeCity || 'Globe Wanderer',
      visitedCountries: []
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      bio: newUser.bio,
      avatar: newUser.avatar,
      travelStyle: newUser.travelStyle,
      homeCity: newUser.homeCity,
      visitedCountries: newUser.visitedCountries,
      token: generateToken(newUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error registering user', error: error.message });
  }
};

// @desc Authenticate user & get token
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (username || email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!identifier || !cleanPassword) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    const user = await Store.users.findOne({ email: identifier });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    let isMatch = await bcrypt.compare(cleanPassword, user.password);
    // Allow either archit123 or admin123 for the admin user for zero-friction access
    if (!isMatch && user.role === 'admin') {
      if (cleanPassword === 'archit123' || cleanPassword === 'admin123') {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      travelStyle: user.travelStyle,
      homeCity: user.homeCity,
      visitedCountries: user.visitedCountries,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc Get current logged-in user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await Store.users.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const followers = Array.isArray(user.followers) ? user.followers : [];
    const following = Array.isArray(user.following) ? user.following : [];
    res.json({
      _id: user._id,
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      travelStyle: user.travelStyle,
      homeCity: user.homeCity,
      visitedCountries: user.visitedCountries,
      followers,
      following,
      followersCount: followers.length,
      followingCount: following.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.avatar) updates.avatar = req.body.avatar;
    if (req.body.travelStyle) updates.travelStyle = req.body.travelStyle;
    if (req.body.homeCity) updates.homeCity = req.body.homeCity;
    if (req.body.visitedCountries) updates.visitedCountries = req.body.visitedCountries;

    const updated = await Store.users.findByIdAndUpdate(req.user._id, updates);
    res.json({
      _id: updated._id,
      name: updated.name,
      username: updated.username || updated.email.split('@')[0],
      email: updated.email,
      role: updated.role,
      bio: updated.bio,
      avatar: updated.avatar,
      travelStyle: updated.travelStyle,
      homeCity: updated.homeCity,
      visitedCountries: updated.visitedCountries
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// @desc Get public user profile by ID or username
// @route GET /api/auth/user/:id
const getUserProfile = async (req, res) => {
  try {
    let user = await Store.users.findById(req.params.id);
    if (!user) {
      user = await Store.users.findOne({ username: req.params.id });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const isFollowing = currentUserId && Array.isArray(user.followers)
      ? user.followers.some(id => id.toString() === currentUserId)
      : false;

    const followers = Array.isArray(user.followers) ? user.followers : [];
    const following = Array.isArray(user.following) ? user.following : [];

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      travelStyle: user.travelStyle,
      homeCity: user.homeCity,
      visitedCountries: user.visitedCountries || [],
      followers,
      following,
      followersCount: followers.length,
      followingCount: following.length,
      badge: user.badge || (user.role === 'admin' ? 'PRO' : 'EXPLORER'),
      isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

// @desc Toggle follow / unfollow another user
// @route POST /api/auth/follow/:id
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    let targetUser = await Store.users.findById(targetUserId);
    if (!targetUser) {
      targetUser = await Store.users.findOne({ username: targetUserId.toLowerCase() });
    }
    if (!targetUser) {
      const allUsers = await Store.users.find();
      targetUser = allUsers.find(u => 
        (u._id && u._id.toString() === targetUserId) ||
        (u.username && u.username.toLowerCase() === targetUserId.toLowerCase())
      );
    }
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resolvedTargetId = targetUser._id.toString();

    if (resolvedTargetId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await Store.users.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const currentFollowing = Array.isArray(currentUser.following) ? currentUser.following.map(id => id.toString()) : [];
    const targetFollowers = Array.isArray(targetUser.followers) ? targetUser.followers.map(id => id.toString()) : [];

    const isCurrentlyFollowing = currentFollowing.includes(resolvedTargetId);

    let updatedFollowing;
    let updatedFollowers;
    let nowFollowing;

    if (isCurrentlyFollowing) {
      // Unfollow
      updatedFollowing = currentFollowing.filter(id => id !== resolvedTargetId);
      updatedFollowers = targetFollowers.filter(id => id !== currentUserId);
      nowFollowing = false;
    } else {
      // Follow
      updatedFollowing = [...currentFollowing, resolvedTargetId];
      updatedFollowers = [...targetFollowers, currentUserId];
      nowFollowing = true;
    }

    await Store.users.findByIdAndUpdate(currentUserId, {
      following: updatedFollowing,
      followingCount: updatedFollowing.length
    });

    const updatedTarget = await Store.users.findByIdAndUpdate(resolvedTargetId, {
      followers: updatedFollowers,
      followersCount: updatedFollowers.length
    });

    const targetFollowing = Array.isArray(targetUser.following) ? targetUser.following.map(id => id.toString()) : [];
    const followsYou = targetFollowing.includes(currentUserId);
    const isFriend = Boolean(nowFollowing && followsYou);

    if (nowFollowing) {
      const io = req.app?.get('io');
      // Notify target user
      createNotification({
        recipient: resolvedTargetId,
        sender: {
          _id: currentUser._id,
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatar,
          badge: currentUser.badge || 'EXPLORER'
        },
        type: 'follow',
        title: isFriend ? 'New Mutual Friend! 🤝' : 'New Follower! 👤',
        message: isFriend 
          ? `${currentUser.name} followed you back! You are now mutual friends and can chat 1-on-1.` 
          : `${currentUser.name} started following you.`,
        link: `/profile/${currentUserId}`,
        metadata: { isFriend, senderId: currentUserId }
      }, io);

      // Also notify current user so their notification tray updates immediately
      createNotification({
        recipient: currentUserId,
        sender: {
          _id: targetUser._id,
          name: targetUser.name,
          username: targetUser.username,
          avatar: targetUser.avatar,
          badge: targetUser.badge || 'EXPLORER'
        },
        type: 'follow',
        title: isFriend ? 'New Mutual Friend! 🤝' : 'Traveler Followed! 👤',
        message: isFriend 
          ? `You and ${targetUser.name} are now mutual friends! You can now chat 1-on-1.` 
          : `You started following ${targetUser.name}. We'll notify you when they follow back.`,
        link: `/socials?user=${resolvedTargetId}`,
        metadata: { isFriend, senderId: resolvedTargetId }
      }, io);
    }

    res.json({
      isFollowing: nowFollowing,
      followsYou,
      isFriend,
      followersCount: updatedFollowers.length,
      followingCount: (updatedTarget?.following || []).length,
      message: nowFollowing 
        ? (isFriend ? `You and ${targetUser.name} are now mutual friends!` : `Now following ${targetUser.name}`) 
        : `Unfollowed ${targetUser.name}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating follow status', error: error.message });
  }
};

// @desc Get list of followers for a user
// @route GET /api/auth/user/:id/followers
const getUserFollowers = async (req, res) => {
  try {
    let user = await Store.users.findById(req.params.id);
    if (!user) {
      user = await Store.users.findOne({ username: req.params.id });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const followerIds = Array.isArray(user.followers) ? user.followers.map(id => id.toString()) : [];

    const allUsers = await Store.users.find();
    const followersList = allUsers
      .filter(u => followerIds.includes(u._id.toString()))
      .map(u => ({
        _id: u._id,
        name: u.name,
        username: u.username || u.email.split('@')[0],
        avatar: u.avatar,
        role: u.role,
        badge: u.badge || (u.role === 'admin' ? 'PRO' : 'EXPLORER'),
        bio: u.bio,
        homeCity: u.homeCity || 'Worldwide',
        travelStyle: u.travelStyle || 'Adventurer',
        followersCount: Array.isArray(u.followers) ? u.followers.length : 0,
        followingCount: Array.isArray(u.following) ? u.following.length : 0,
        isFollowing: currentUserId && Array.isArray(u.followers) ? u.followers.some(id => id.toString() === currentUserId) : false,
        isSelf: currentUserId === u._id.toString()
      }));

    res.json(followersList);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving followers', error: error.message });
  }
};

// @desc Get list of users followed by a user
// @route GET /api/auth/user/:id/following
const getUserFollowing = async (req, res) => {
  try {
    let user = await Store.users.findById(req.params.id);
    if (!user) {
      user = await Store.users.findOne({ username: req.params.id });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const followingIds = Array.isArray(user.following) ? user.following.map(id => id.toString()) : [];

    const allUsers = await Store.users.find();
    const followingList = allUsers
      .filter(u => followingIds.includes(u._id.toString()))
      .map(u => ({
        _id: u._id,
        name: u.name,
        username: u.username || u.email.split('@')[0],
        avatar: u.avatar,
        role: u.role,
        badge: u.badge || (u.role === 'admin' ? 'PRO' : 'EXPLORER'),
        bio: u.bio,
        homeCity: u.homeCity || 'Worldwide',
        travelStyle: u.travelStyle || 'Adventurer',
        followersCount: Array.isArray(u.followers) ? u.followers.length : 0,
        followingCount: Array.isArray(u.following) ? u.following.length : 0,
        isFollowing: currentUserId && Array.isArray(u.followers) ? u.followers.some(id => id.toString() === currentUserId) : false,
        isSelf: currentUserId === u._id.toString()
      }));

    res.json(followingList);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving following list', error: error.message });
  }
};

// @desc Get travelers directory for Socials / People
// @route GET /api/auth/directory
const getUsersDirectory = async (req, res) => {
  try {
    const users = await Store.users.find();
    const currentUserId = req.user ? req.user._id.toString() : null;

    let currentUser = null;
    let currentFollowing = [];
    let currentFollowers = [];
    if (currentUserId) {
      currentUser = await Store.users.findById(currentUserId);
      if (currentUser) {
        currentFollowing = Array.isArray(currentUser.following) ? currentUser.following.map(id => id.toString()) : [];
        currentFollowers = Array.isArray(currentUser.followers) ? currentUser.followers.map(id => id.toString()) : [];
      }
    }

    const list = users.map(u => {
      const uId = u._id.toString();
      const uFollowers = Array.isArray(u.followers) ? u.followers.map(id => id.toString()) : [];
      const uFollowing = Array.isArray(u.following) ? u.following.map(id => id.toString()) : [];

      const isFollowing = currentUserId ? currentFollowing.includes(uId) : false;
      const followsYou = currentUserId ? currentFollowers.includes(uId) : false;
      const isFriend = Boolean(isFollowing && followsYou);

      return {
        _id: u._id,
        name: u.name,
        username: u.username || u.email.split('@')[0],
        avatar: u.avatar,
        role: u.role,
        bio: u.bio,
        homeCity: u.homeCity || 'Worldwide',
        travelStyle: u.travelStyle || 'Adventurer',
        badge: u.role === 'admin' ? 'PRO' : 'EXPLORER',
        countriesCount: (u.visitedCountries && u.visitedCountries.length) || 4,
        followers: uFollowers,
        following: uFollowing,
        followersCount: uFollowers.length,
        followingCount: uFollowing.length,
        isFollowing,
        followsYou,
        isFriend
      };
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving directory', error: error.message });
  }
};

// @desc Get mutual friends for current user
// @route GET /api/auth/friends
const getUserFriends = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id.toString() : null;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const currentUser = await Store.users.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const currentFollowing = Array.isArray(currentUser.following) ? currentUser.following.map(id => id.toString()) : [];
    const currentFollowers = Array.isArray(currentUser.followers) ? currentUser.followers.map(id => id.toString()) : [];

    // Mutual friends are in both following and followers
    const friendIds = currentFollowing.filter(id => currentFollowers.includes(id));

    const allUsers = await Store.users.find();
    const friends = allUsers
      .filter(u => friendIds.includes(u._id.toString()))
      .map(u => ({
        _id: u._id.toString(),
        name: u.name,
        username: u.username || u.email.split('@')[0],
        avatar: u.avatar,
        role: u.role,
        bio: u.bio,
        homeCity: u.homeCity || 'Worldwide',
        travelStyle: u.travelStyle || 'Adventurer',
        badge: u.role === 'admin' ? 'PRO' : 'EXPLORER',
        countriesCount: (u.visitedCountries && u.visitedCountries.length) || 4,
        followersCount: Array.isArray(u.followers) ? u.followers.length : 0,
        followingCount: Array.isArray(u.following) ? u.following.length : 0,
        isFriend: true,
        isFollowing: true,
        followsYou: true
      }));

    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving friends', error: error.message });
  }
};

// @desc Get global travel leaderboard
// @route GET /api/auth/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await Store.users.find();
    const ranked = users.map(u => ({
      _id: u._id,
      name: u.name,
      username: u.username || u.email.split('@')[0],
      avatar: u.avatar,
      role: u.role,
      badge: u.role === 'admin' ? 'PRO' : 'EXPLORER',
      countriesCount: (u.visitedCountries && u.visitedCountries.length) || 4,
      citiesCount: ((u.visitedCountries && u.visitedCountries.length) || 4) * 6 + 8,
      homeCity: u.homeCity || 'Worldwide',
      travelStyle: u.travelStyle || 'Backpacker'
    })).sort((a, b) => b.countriesCount - a.countriesCount);

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving leaderboard', error: error.message });
  }
};

module.exports = {
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
};

