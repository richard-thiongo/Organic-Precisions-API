const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product-controller');

// @route   GET /api/products
// @desc    Get all products with variants
router.get('/', ProductController.getAllProducts);

// @route   POST /api/products
// @desc    Create a new product with variants
router.post('/', ProductController.createProduct);

// @route   PATCH /api/products/stock
// @desc    Add stock to a specific variant
router.patch('/stock', ProductController.updateStock);

// @route   POST /api/products/sell
// @desc    Process a sale (decrement stock)
router.post('/sell', ProductController.sellProducts);

// @route   PUT /api/products/:id
// @desc    Edit product and its variants
router.put('/:id', ProductController.editProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
