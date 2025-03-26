const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const  cors = require('cors');


//load environment variables
dotenv.config();

//connection to db
connectDB();

//instance for express application
const app = express();

//add middleware to json payloads
app.use(express.json());

//enable cors for all routes
app.use(cors());

//error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

const PORT  = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = server;

