const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const  cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes.js');
const orderRoutes = require('./routes/orderRoutes');

//load environment variables
dotenv.config();

//connection to db
connectDB();

//instance for express application
const app = express();

//enable cors for all routes
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

//error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

//calling routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

//start server
const PORT  = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = server;

