const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Multer setup for file uploads static server
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected !");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log('MongoDB connection error:', err));


  // Routes
const restaurantRoutes = require('./routes/restaurantRoutes');
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', require('./routes/menuItemRoutes'))

app.use('/api/orders', require('./routes/orderRoutes'));

app.use('/api/auth', require('./routes/authRoutes'))

