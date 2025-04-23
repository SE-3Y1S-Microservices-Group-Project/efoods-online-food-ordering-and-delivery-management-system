const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserById,
  updateUserById,
  deleteUserById,
  logoutUser
} = require('../controllers/authController');

//Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

//Protected routes (require authentication)
router.get('/user/:id', getUserById);
router.put('/user/:id', updateUserById);
router.delete('/user/:id', deleteUserById);
router.post('/logout', logoutUser);

module.exports = router;