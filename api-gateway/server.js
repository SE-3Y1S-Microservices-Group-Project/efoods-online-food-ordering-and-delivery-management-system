const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Proxy configuration
const services = {
    deliveryManagementService: 'http://localhost:5001',
    orderManagementService: 'http://localhost:2139',
    paymentAndNotificationService: 'http://localhost:5003',
    restaurantManagementService: 'http://localhost:5000',
};

// Routes for each service
app.use('/api/delivery', createProxyMiddleware({ target: services.deliveryManagementService, changeOrigin: true }));
app.use('/api/orders', createProxyMiddleware({ target: services.orderManagementService, changeOrigin: true }));
app.use('/api/payments', createProxyMiddleware({ target: services.paymentAndNotificationService, changeOrigin: true }));
app.use('/api/restaurants', createProxyMiddleware({ target: services.restaurantManagementService, changeOrigin: true }));

// Start the API Gateway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});