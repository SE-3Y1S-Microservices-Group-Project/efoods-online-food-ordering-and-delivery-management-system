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



// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/connectDB');
// const path = require('path');


// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Multer setup for file uploads static server
// // app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Global DB holder
// let dbConnections = {};

// // Connect to databases before starting server
// connectDB().then((connections) => {
//     dbConnections = connections;

//     // Attach DB connections to app locals (accessible in routes or middlewares)
//     app.locals.dbs = dbConnections;

//     // Routes
    
//     const restaurantRoutes = require('./routes/restaurantRoutes');
//     app.use('/api/restaurants', restaurantRoutes);

//     app.use('/api/menu', require('./routes/menuItemRoutes'))

//     app.use('/api/orders', require('./routes/orderRoutes'));

//     app.use('/api/auth', require('./routes/authRoutes'))

//     const PORT = process.env.PORT || 5000;
//     const server = app.listen(PORT, () => {
//         console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
//     });
// }).catch((err) => {
//     console.error('Failed to start server due to DB error:', err);
//     process.exit(1);
// });

// module.exports = app;