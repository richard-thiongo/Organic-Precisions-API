const ProductService = require('../services/product-service');
const { productSchema, stockUpdateSchema, sellSchema, editProductSchema } = require('../../../shared/validation/product-validation');

const ProductController = {
  // Get all products
  async getAllProducts(req, res, next) {
    try {
      const products = await ProductService.listProducts();
      res.status(200).json({ status: 'success', data: products });
    } catch (error) {
      next(error);
    }
  },

  // Add a new product
  async createProduct(req, res, next) {
    try {
      const { error, value } = productSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const product = await ProductService.addProduct(value);
      res.status(201).json({ message: 'Product created successfully', data: product });
    } catch (error) {
      next(error);
    }
  },

  // Adjust stock (Replenish)
  async updateStock(req, res, next) {
    try {
      const { error, value } = stockUpdateSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const variant = await ProductService.adjustStock(value.variant_id, value.quantity);
      res.status(200).json({ message: 'Stock updated successfully', data: variant });
    } catch (error) {
      next(error);
    }
  },

  // Process a sale (Shopping Cart)
  async sellProducts(req, res, next) {
    try {
      const { error, value } = sellSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const result = await ProductService.processSale(value.items);
      res.status(200).json({ message: 'Sale processed successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  // Edit product details
  async editProduct(req, res, next) {
    try {
      const productId = req.params.id;
      const { error, value } = editProductSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const product = await ProductService.editProduct(productId, value);
      res.status(200).json({ message: 'Product updated successfully', data: product });
    } catch (error) {
      next(error);
    }
  },

  // Delete a product
  async deleteProduct(req, res, next) {
    try {
      const productId = req.params.id;
      await ProductService.removeProduct(productId);
      res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ProductController;
