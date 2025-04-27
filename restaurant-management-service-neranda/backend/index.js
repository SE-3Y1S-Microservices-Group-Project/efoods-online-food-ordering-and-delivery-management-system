const express = require('express');
//const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/connectDB');
const restaurantRoutes = require('./routes/restaurantRoutes');
const authRoutes = require('./routes/authRoutes');
// const orderRoutes = require('./routes/orderRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Global DB holder
let dbConnections = {};

// Connect to databases before starting server
connectDB().then((connections) => {
  dbConnections = connections;

  // Attach DB connections to app locals (accessible in routes or middlewares)
  app.locals.dbs = dbConnections;

  // Multer setup for file uploads static server
  // app.use('/uploads', express.static('uploads'));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.use('/api/restaurants', restaurantRoutes);
  app.use('/api/menu', menuItemRoutes);
  // app.use('/api/orders', orderRoutes);
  // app.use('/api/auth', authRoutes);
  // app.use('/api/dashboard', require('./controllers/dashboardStat'));



  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server due to DB error:', err);
  process.exit(1);
});

module.exports = app;