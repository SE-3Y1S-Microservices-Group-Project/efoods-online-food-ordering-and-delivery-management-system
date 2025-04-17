const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Multer setup for file uploads static server
// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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

// app.use('/api/dashboard', require('./controllers/dashboardStat'));

