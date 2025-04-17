import jwt from 'jsonwebtoken';
import Driver from '../models/driverModel.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find driver by ID from token, exclude password
      req.driver = await Driver.findById(decoded.id).select('-password');

      if (!req.driver) {
        return res.status(401).json({ message: 'Not authorized, driver not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ 
        message: 'Not authorized, token failed', 
        error: error.message 
      });
    }
  }

  // If no token
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};