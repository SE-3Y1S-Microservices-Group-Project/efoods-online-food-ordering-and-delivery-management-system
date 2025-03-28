const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a restaurant
exports.register = async (req, res) => {
    try {
      const images = req.files ? req.files.map(file => `/uploads/restaurants/${file.filename}`) : [];
  
      const { name, email, address, password, contact, description, deliveryFee, status } = req.body;
      const hash = await bcrypt.hash(password, 10);
  
      const restaurant = new Restaurant({
        name,
        email,
        address,
        password: hash,
        contact,
        description,
        deliveryFee,
        status,
        images
      });
  
      await restaurant.save();
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) return res.status(400).json({ error: 'Not Found!' });

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid Credentials!' });

    const token = jwt.sign(
      { id: restaurant._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({ token, restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Availability
exports.toggleAvailability = async (req, res) => {
  const { isAvailable } = req.body;
  const updated = await Restaurant.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
  res.json(updated);
};

// Get restaurant by ID
exports.getOne = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.json(restaurant);
};

// Get all restaurants
exports.getAll = async (req, res) => {
  const restaurants = await Restaurant.find();
  res.json(restaurants);
};

// Create new restaurant
exports.create = async (req, res) => {
  const restaurant = new Restaurant(req.body);
  await restaurant.save();
  res.status(201).json(restaurant);
};

// Update restaurant
exports.update = async (req, res) => {
  const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// Delete restaurant
exports.remove = async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.json({ message: 'Restaurant deleted' });
};
