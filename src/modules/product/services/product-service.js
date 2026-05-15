const ProductRepository = require('../repositories/product-repository');
const db = require('../../../shared/config/db');

const ProductService = {
  // Get all products with their variants
  async listProducts() {
    return await ProductRepository.findAllWithVariants();
  },

  // Logic to add a product with its initial variants
  async addProduct(data) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const product = await ProductRepository.createProduct(data, client);
      
      const variantPromises = data.variants.map(variant => 
        ProductRepository.createProductDetail({ ...variant, product_id: product.product_id }, client)
      );
      
      const variants = await Promise.all(variantPromises);
      
      await client.query('COMMIT');
      return { ...product, variants };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Logic to replenish stock
  async adjustStock(variant_id, quantity) {
    return await ProductRepository.updateStock(variant_id, quantity);
  },

  // Logic to process a "Shopping Cart" sale
  async processSale(items) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];
      for (const item of items) {
        const { variant_id, quantity } = item;

        // 1. Check current stock level
        const variant = await ProductRepository.getVariantById(variant_id, client);
        if (!variant) {
          throw new Error(`Variant with ID ${variant_id} not found`);
        }

        if (variant.stock_quantity < quantity) {
          throw new Error(`Insufficient stock for variant ${variant_id}. Available: ${variant.stock_quantity}, Requested: ${quantity}`);
        }

        // 2. Atomic decrement (quantity passed as negative)
        const updatedVariant = await ProductRepository.updateStock(variant_id, -quantity, client);
        results.push(updatedVariant);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Logic to edit product and its details
  async editProduct(productId, data) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update base product
      const product = await ProductRepository.updateProduct(productId, data, client);

      // Update variants if provided
      let variants = [];
      if (data.variants && data.variants.length > 0) {
        const variantPromises = data.variants.map(variant => {
          if (variant.variant_id) {
            return ProductRepository.updateProductDetail(variant.variant_id, variant, client);
          } else {
            // If no variant_id, it's a new variant for this product
            return ProductRepository.createProductDetail({ ...variant, product_id: productId }, client);
          }
        });
        variants = await Promise.all(variantPromises);
      }

      await client.query('COMMIT');
      return { ...product, variants };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Logic to delete a product
  async removeProduct(productId) {
    const product = await ProductRepository.deleteProduct(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    return product;
  }
};

module.exports = ProductService;
