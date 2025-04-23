import express from 'express';
import {
  registerDriver,
  loginDriver,
  getDriverProfile,
  updateDriverProfile,
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  getOrders, // get orders from a different database
  deleteDriver
} from '../Controllers/driverController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerDriver);
router.post('/login', loginDriver);

// Get orders from a different database
// This route needs to be BEFORE the /:id route to avoid conflict
router.get('/orders', getOrders);

// Protected routes with authentication
router.get('/profile', protect, getDriverProfile);
router.put('/profile', protect, updateDriverProfile);

// Additional CRUD routes
router.post('/', protect, createDriver);
router.get('/', protect, getAllDrivers);
router.get('/:id', protect, getDriverById);
router.put('/:id', protect, updateDriver);
router.delete('/:id', protect, deleteDriver);

export default router;