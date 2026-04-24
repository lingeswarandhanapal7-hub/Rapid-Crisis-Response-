const User = require('../models/User');

// GET /api/users?role=doctor|nurse
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers };
