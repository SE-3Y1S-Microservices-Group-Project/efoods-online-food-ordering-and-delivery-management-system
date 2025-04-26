const User = require('../models/User');
//middleware to handle async errors automatically
const asyncHandler = require('express-async-handler');

//register new user
//POST api/auth/register
//public access
exports.registerUser = asyncHandler(async (req, res) => {
  //extract user inputs user req body
  const { firstName, lastName, contact, email, password } = req.body;

  //using email check user already in the db
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('User already exists: ', email);
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  //create a new user in db
  const user = await User.create({
    firstName,
    lastName,
    contact,
    email,
    password
  });

  console.log('User registered successfully:', user._id);

  //response with user details without password\
  res.status(201).json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    contact: user.contact,
    email: user.email
  });
});

//user login
//POST api/auth/login
//public access
exports.loginUser = asyncHandler(async (req, res) => {
  //extract email and password from req
  const { email, password } = req.body;

  //using email find the user
  const user = await User.findOne({ email });

  //check user exists and verify the password
  if (user && (await user.comparePassword(password))) {
    //store user ID in session (used for authentication in session-based auth)
    //req.session.userId = user._id;
    req.userId = user._id;

    console.log('User logged successfully');
    //respond with user details without password
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contact: user.contact
    });
  } else {
    console.log('Invalid email or password');
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

//get user by id
//GET api/auth/user/:id
//private access
exports.getUserById = asyncHandler(async (req, res) => {
  //check if user is authenticated
  //if (!req.session.userId)
  if (!req.params.id) {
    console.log('Not authorized, no session');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no session'
    });
  }

  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    console.log('User not found');
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json(user);
});

//update user by id
//PUT api/auth/user/:id
//private access
exports.updateUserById = asyncHandler(async (req, res) => {
  // Check if user is authenticated and authorized
  // if (!req.session.userId)
  if (!req.params.id) {
    console.log('Not authorized, no session');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no session'
    });
  }

  // Check if the user is trying to update their own profile
  //if (req.session.userId.toString() !== req.params.id)
  if (req.params.id.toString() !== req.params.id) {
    console.log('Not authorized to update this user');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this user'
    });
  }

  //extract user inputs from req body
  const { firstName, lastName, contact, email } = req.body;

  //find user in db
  const user = await User.findById(req.params.id);

  if (!user) {
    console.log('User not found');
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  //update user fields
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.contact = contact || user.contact;
  
  //only update email if it's different and not already in use
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists cannot update');
      return res.status(400).json({
        success: false,
        message: 'Email already exists cannot update'
      });
    }
    user.email = email;
  }

  const updatedUser = await user.save();

  console.log('User update successfully');

  res.json({
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    contact: updatedUser.contact,
    email: updatedUser.email
  });
});

//delete user by id
//DELETE api/auth/user/:id
//private access
exports.deleteUserById = asyncHandler(async (req, res) => {
  // Check if user is authenticated and authorized
  //if (!req.session.userId)
  if (!req.params.id) {
    console.log('Not authorized, no session');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no session'
    });
  }

  // Check if the user is trying to delete their own profile
  //if (req.session.userId.toString() !== req.params.id)
  if (req.params.id.toString() !== req.params.id) {
    console.log('Not authorized to delete this user');
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this user'
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    console.log('User not found');
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.deleteOne();
  console.log('User deleted successfully');

  // Destroy the session
  //req.session.destroy
  req.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
  });

  res.json({ message: 'User removed' });
});

//logout user
//POST api/user/logout
//private access
exports.logoutUser = asyncHandler(async (req, res) => {
  //req.session.destroy
  req.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
    console.log('User Logged out successfully');
  });
});