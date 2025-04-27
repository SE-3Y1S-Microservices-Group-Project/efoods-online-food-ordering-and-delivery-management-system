const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/connectDB');
const paymentRoutes = require("./routes/payment");

dotenv.config();

// ADD THIS BEFORE express.json()
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // frontend origin
  credentials: true                 // allow cookies and headers like Authorization
}));
app.use(express.json());

let dbConnections = {};

connectDB().then((connections) => {
  dbConnections = connections;
  app.locals.dbs = dbConnections;
  
// For Stripe Webhook ONLY - raw body
app.use('/api/payment/webhook', bodyParser.raw({ type: 'application/json' }));


  // Routes
  app.use("/api/payment", paymentRoutes);

  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server due to DB error:', err);
  process.exit(1);
});

module.exports = app;
