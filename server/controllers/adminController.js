const Store = require('../utils/store');

// @desc Get comprehensive admin metrics
// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const allUsers = await Store.users.find();
    const allTrips = await Store.trips.find();
    const allChats = await Store.chats.find();
    const allInquiries = await Store.inquiries.find();
    const allDestinations = await Store.destinations.find();

    const stats = {
      totalUsers: allUsers.length,
      totalTrips: allTrips.length,
      sameTimeTrips: allTrips.filter(t => t.status === 'upcoming' || t.status === 'traveling_now').length,
      completedTrips: allTrips.filter(t => t.status === 'completed').length,
      totalChatMessages: allChats.length,
      pendingInquiries: allInquiries.filter(i => i.status === 'pending').length,
      totalInquiries: allInquiries.length,
      totalDestinations: allDestinations.length,
      recentUsers: allUsers.slice(-5).reverse(),
      recentTrips: allTrips.slice(0, 5)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error compiling admin stats', error: error.message });
  }
};

// @desc Get all users for admin management
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await Store.users.find();
    const safeUsers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      travelStyle: u.travelStyle,
      homeCity: u.homeCity,
      visitedCount: u.visitedCountries?.length || 0,
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// @desc Toggle or set user role
// @route PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user or admin' });
    }

    const updated = await Store.users.findByIdAndUpdate(req.params.id, { role });
    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `Role updated to ${role}`, user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// @desc Admin delete user
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admins cannot delete their own active account' });
    }
    const deleted = await Store.users.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser
};

