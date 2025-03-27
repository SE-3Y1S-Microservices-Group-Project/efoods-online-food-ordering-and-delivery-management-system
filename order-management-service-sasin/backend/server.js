const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const  cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

//middleware imports
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');

//load environment variables
dotenv.config();

//connection to db
connectDB();

//instance for express application
const app = express();

//add middleware to json payloads
//add security header
app.use(helmet());

//enable cors for all routes
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));

app.use(morgan('dev')); //logging
app.use(express.json()); //parse JSON bodies
app.use(express.urlencoded({ extended: true })); //parse URL-encoded bodies
app.use(cookieParser()); //parse cookies

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

//404 and error handling middleware
app.use(notFound);
app.use(errorHandler);

//start server
const PORT  = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = server;

