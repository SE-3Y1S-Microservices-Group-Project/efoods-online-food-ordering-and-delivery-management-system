import express from 'express';
import geocodeController from '../Controllers/geocodeController.js';
import driverLocationController from '../Controllers/driverLocationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Geocoding route
router.get('/geocode', geocodeController.geocodeAddress);

// Driver location routes
router.post('/drivers/location', protect, driverLocationController.updateLocation);
router.get('/drivers/:id/location', driverLocationController.getLocation);

export default router;