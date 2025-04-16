const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/RestaurantController');
const upload = require('../middleware/upload');

// Public endpoints
// router.post('/register', restaurantController.register);
router.post('/register', upload.array('images', 5), restaurantController.register); // With images max 5
router.post('/login', restaurantController.login);

// CRUD endpoints
router.get('/', restaurantController.getAll);

router.get('/me', restaurantController.getLoggedRestaurant);

router.get('/:id', restaurantController.getOne);
// router.post('/', restaurantController.create);
router.post('/', upload.array('images', 5), restaurantController.create); // max 5 images
router.put('/:id', restaurantController.update);
router.delete('/:id', restaurantController.remove);

// Availability toggle
router.put('/:id/availability', restaurantController.toggleAvailability);





module.exports = router;
