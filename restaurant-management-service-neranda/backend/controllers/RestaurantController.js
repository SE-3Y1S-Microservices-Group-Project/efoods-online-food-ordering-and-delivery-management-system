const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a restaurant
exports.register = async (req, res) => {
    try {
      const images = req.files ? req.files.map(file => `/uploads/restaurants/${file.filename}`) : [];
  
      const {
        name, email, password, contact,
        description, deliveryFee, status,
        address, country, state, city, openingTime, closingTime
      } = req.body;

      const hash = await bcrypt.hash(password, 10);
  
      const restaurant = new Restaurant({
        name, email, contact, password: hash,
        description, deliveryFee, status,
        address, country, state, city,
        images, openingTime, closingTime
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
// exports.toggleAvailability = async (req, res) => {
//   const { isAvailable } = req.body;
//   const updated = await Restaurant.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
//   res.json(updated);
// };

exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );
    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
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



exports.update = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const restaurantId = decoded.id;

    // Get current restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    // Update fields
    const {
      name,
      email,
      password,
      contact,
      description,
      deliveryFee,
      address,
      status,
    } = req.body;

    if (name) restaurant.name = name;
    if (email) restaurant.email = email;
    if (contact) restaurant.contact = contact;
    if (description) restaurant.description = description;
    if (deliveryFee) restaurant.deliveryFee = deliveryFee;
    if (address) restaurant.address = address;
    if (status) restaurant.status = status;
    if (password) {
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash(password, 10);
      restaurant.password = hashed;
    }

    // Update image if uploaded
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      restaurant.image = imagePaths;
    }

    await restaurant.save();
    res.status(200).json({ message: 'Restaurant updated successfully', restaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};


// Delete restaurant
exports.remove = async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.json({ message: 'Restaurant deleted' });
};

exports.getLoggedRestaurant = async (req, res) => {
  try {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const restaurant = await Restaurant.findById(decoded.id);

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};





// const Restaurant = require('../models/Restaurant');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Register a restaurant
// exports.register = async (req, res) => {
//     try {
//       const images = req.files ? req.files.map(file => `/uploads/restaurants/${file.filename}`) : [];
  
//       const {
//         name, email, password, contact,
//         description, deliveryFee, status,
//         address, country, state, city, openingTime, closingTime
//       } = req.body;

//       const hash = await bcrypt.hash(password, 10);
  
//       const restaurant = new Restaurant({
//         name, email, contact, password: hash,
//         description, deliveryFee, status,
//         address, country, state, city,
//         image: images, openingTime, closingTime
//     });
  
//       await restaurant.save();
//       res.status(201).json(restaurant);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
// };
  

// // Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const restaurant = await Restaurant.findOne({ email });
//     if (!restaurant) return res.status(400).json({ error: 'Not Found!' });

//     const isMatch = await bcrypt.compare(password, restaurant.password);
//     if (!isMatch) return res.status(401).json({ error: 'Invalid Credentials!' });

//     const token = jwt.sign(
//       { id: restaurant._id },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
//     );

//     res.json({ token, restaurant });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Toggle Availability
// exports.toggleAvailability = async (req, res) => {
//   try {
//     const { isAvailable } = req.body;
//     const restaurant = await Restaurant.findByIdAndUpdate(
//       req.params.id,
//       { isAvailable },
//       { new: true }
//     );
//     res.status(200).json(restaurant);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to update availability' });
//   }
// };


// // Get restaurant by ID
// exports.getOne = async (req, res) => {
//   const restaurant = await Restaurant.findById(req.params.id);
//   res.json(restaurant);
// };

// // Get all restaurants
// exports.getAll = async (req, res) => {
//   const restaurants = await Restaurant.find();
//   res.json(restaurants);
// };

// // Create new restaurant
// exports.create = async (req, res) => {
//   const restaurant = new Restaurant(req.body);
//   await restaurant.save();
//   res.status(201).json(restaurant);
// };

// // Get logged in restaurant information
// exports.getLoggedRestaurant = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) return res.status(401).json({ message: 'No token provided' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const restaurant = await Restaurant.findById(decoded.id);

//     if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

//     res.status(200).json(restaurant);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };

// // Update restaurant by ID (admin endpoint)
// exports.update = async (req, res) => {
//   try {
//     const restaurantId = req.params.id;
//     const restaurant = await Restaurant.findById(restaurantId);
//     if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

//     updateRestaurantFields(restaurant, req);
//     await restaurant.save();

//     res.status(200).json({ message: 'Restaurant updated successfully', restaurant });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// };

// // Update logged-in restaurant (restaurant owner endpoint)
// exports.updateLoggedRestaurant = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No token provided' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const restaurantId = decoded.id;

//     // Get current restaurant
//     const restaurant = await Restaurant.findById(restaurantId);
//     if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

//     updateRestaurantFields(restaurant, req);
//     await restaurant.save();

//     res.status(200).json({ message: 'Restaurant updated successfully', restaurant });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Something went wrong', details: err.message });
//   }
// };

// // Helper function to update restaurant fields
// const updateRestaurantFields = async (restaurant, req) => {
//   const {
//     name,
//     email,
//     password,
//     contact,
//     description,
//     deliveryFee,
//     address,
//     country,
//     state,
//     city,
//     status,
//     openingTime,
//     closingTime
//   } = req.body;

//   // Update the fields if they are provided
//   if (name) restaurant.name = name;
//   if (email) restaurant.email = email;
//   if (contact) restaurant.contact = contact;
//   if (description) restaurant.description = description;
//   if (deliveryFee) restaurant.deliveryFee = deliveryFee;
//   if (address) restaurant.address = address;
//   if (country) restaurant.country = country;
//   if (state) restaurant.state = state;
//   if (city) restaurant.city = city;
//   if (status) restaurant.status = status;
//   if (openingTime) restaurant.openingTime = openingTime;
//   if (closingTime) restaurant.closingTime = closingTime;
  
//   // Update password if provided
//   if (password && password.trim() !== '') {
//     const hash = await bcrypt.hash(password, 10);
//     restaurant.password = hash;
//   }

//   // Update images if uploaded
//   if (req.files && req.files.length > 0) {
//     const imagePaths = req.files.map(file => `/uploads/restaurants/${file.filename}`);
//     restaurant.image = imagePaths;
//   }

//   // Update the updatedAt timestamp
//   restaurant.updatedAt = Date.now();
// };

// // Delete restaurant
// exports.remove = async (req, res) => {
//   await Restaurant.findByIdAndDelete(req.params.id);
//   res.json({ message: 'Restaurant deleted' });
// };
