const express = require('express');
const cors = require('cors');
require('dotenv').config();
const productRoutes = require('./modules/product/routes/product-routes');
const salesRoutes = require('./modules/sales/routes/sales.routes');
const errorHandler = require('./shared/middleware/error-handler');

const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Organic Precisions API is running' });
});

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;
