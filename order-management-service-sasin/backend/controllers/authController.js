const bcrypt = require('bcryptjs');
const User = require('../models/User');
const googleClient = require('../config/googleAuth');

//handle async oparations in express
const asyncHandler = require('express-async-handler');

//import the validation functions
const {
    registerValidation,
    loginValidation
} = require('../utils/validation');


/**
 * @des register a new user
 * @route POST api/auth/register
 * @access Public
 */

const registerUser = asyncHandler(async (req, res) => {
    //validate input
    const { error } = registerValidation(req.body);
    //if there is an validation error send 400 status with error message 
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    //destructuring necessary fields from the req body
    const {username, email, password} = req.body;

    //check if the user already exists
    const existingUser = await User.findOne({
        //search fro a user by either email or username
        $or: [{ email }, { username }]
    });

    //if user already exists return a 400 error
    if (existingUser) {
        res.status(400);
        throw new Error('User already exists');
    }

    //genarate salt for password hashing
    const salt = await bcrypt.genSalt(10);
    //hash the password with salt
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = await User.create({
        username,
        email,
        //store the hashed password
        password: hashedPassword,
        //setting the login type to local
        loginType: 'local'
    });


    //response with details
    res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email
    });
});

/**
 * @desc    authenticate user & get token
 * @route   POST api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    //validate input
    const { error } = loginValidation(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }
  
    const { email, password } = req.body;
  
    //find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  
    //check password for local login
    if (user.loginType === 'local') {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
      }
    }

    //response with details
    res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        loginType: user.loginType
    });
});

/**
 * @desc    google OAuth Login/Signup
 * @route   POST api/auth/google
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body;
  
    //verify google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  
    const payload = ticket.getPayload();
    const { 
      sub: googleId, 
      email, 
      given_name: firstName, 
      family_name: lastName,
      picture: avatar 
    } = payload;
  
    //find or create a user
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });
  
    if (!user) {
      //create new user
      user = await User.create({
        username: email.split('@')[0],
        email,
        googleId,
        firstName,
        lastName,
        avatar,
        loginType: 'google',
        isVerified: true
      });
    } else if (!user.googleId) {
      //update existing user with google details
      user.googleId = googleId;
      user.loginType = 'google';
      user.isVerified = true;
      user.firstName = firstName;
      user.lastName = lastName;
      user.avatar = avatar;
      await user.save();
    }
  
    //reponse with details
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      loginType: user.loginType
    });
});

/**
 * @desc    logout user
 * @route   POST api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
    //logout message
    res.json({ message: 'Logged out successfully' });
});

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
    logoutUser
};