const User = require('../models/User');

// Protect routes - will be used later with JWT
const protectRoute = async (req, res, next) => {
  try {
    // This is a placeholder for JWT authentication
    // In the future, this will verify the JWT token
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is admin - will be implemented later
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const error = new Error('Not authorized as an admin');
    error.statusCode = 403;
    next(error);
  }
};

module.exports = {
  protectRoute,
  isAdmin
};