const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/RestaurantController');

// Public endpoints
router.post('/register', restaurantController.register);
router.post('/login', restaurantController.login);

// CRUD endpoints
router.get('/', restaurantController.getAll);
router.get('/:id', restaurantController.getOne);
router.post('/', restaurantController.create);
router.put('/:id', restaurantController.update);
router.delete('/:id', restaurantController.remove);

// Availability toggle
router.put('/:id/availability', restaurantController.toggleAvailability);

module.exports = router;
