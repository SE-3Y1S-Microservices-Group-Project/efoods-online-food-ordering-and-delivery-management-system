const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    googleAuth,
    logoutUser
} = require('../controllers/authController');


//public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/logout', logoutUser);

module.exports = router;