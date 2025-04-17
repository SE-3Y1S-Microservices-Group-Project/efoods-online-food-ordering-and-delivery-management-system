import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';  // For colored console logs
import cors from 'cors';

// Import database connection
import connectDB from './Config/db.js';

// Route imports
import driverRoutes from './Routes/driverRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/drivers', driverRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const MODE = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`Server running in ${MODE} mode on port ${PORT}`.yellow.bold);
});