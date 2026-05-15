const db = require('../../../shared/config/db');

const ProductRepository = {
  // Get all products with variants nested
  async findAllWithVariants() {
    const query = `
      SELECT 
        p.product_id as id, 
        p.product_name as name, 
        p.category, 
        p.description,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pd.variant_id,
              'measurement_unit', pd.measurement_unit,
              'measurement_value', pd.measurement_value,
              'price', pd.price,
              'stock_quantity', pd.stock_quantity
            )
          ) FILTER (WHERE pd.variant_id IS NOT NULL), 
          '[]'
        ) as variants
      FROM products p
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      GROUP BY p.product_id
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  // Create a new product base entry
  async createProduct(productData, client) {
    const { product_name, category, description } = productData;
    const query = `
      INSERT INTO products (product_name, category, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [product_name, category, description];
    const { rows } = client ? await client.query(query, values) : await db.query(query, values);
    return rows[0];
  },

  // Create product variants/details
  async createProductDetail(detailData, client) {
    const { product_id, measurement_unit, measurement_value, price, stock_quantity } = detailData;
    const query = `
      INSERT INTO product_details (product_id, measurement_unit, measurement_value, price, stock_quantity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [product_id, measurement_unit, measurement_value, price, stock_quantity];
    const { rows } = client ? await client.query(query, values) : await db.query(query, values);
    return rows[0];
  },

  // Update stock level (increment or decrement)
  async updateStock(variant_id, quantity, client) {
    const query = `
      UPDATE product_details
      SET stock_quantity = stock_quantity + $1
      WHERE variant_id = $2
      RETURNING *
    `;
    const values = [quantity, variant_id];
    const { rows } = client ? await client.query(query, values) : await db.query(query, values);
    return rows[0];
  },

  // Get variant by ID (to check stock)
  async getVariantById(variant_id, client) {
    const query = 'SELECT * FROM product_details WHERE variant_id = $1';
    const { rows } = client ? await client.query(query, [variant_id]) : await db.query(query, [variant_id]);
    return rows[0];
  },

  // Update product base entry
  async updateProduct(product_id, productData, client) {
    const { product_name, category, description } = productData;
    const query = `
      UPDATE products
      SET product_name = $1, category = $2, description = $3
      WHERE product_id = $4
      RETURNING *
    `;
    const values = [product_name, category, description, product_id];
    const { rows } = client ? await client.query(query, values) : await db.query(query, values);
    return rows[0];
  },

  // Update product detail/variant
  async updateProductDetail(variant_id, detailData, client) {
    const { measurement_unit, measurement_value, price, stock_quantity } = detailData;
    const query = `
      UPDATE product_details
      SET measurement_unit = $1, measurement_value = $2, price = $3, stock_quantity = $4
      WHERE variant_id = $5
      RETURNING *
    `;
    const values = [measurement_unit, measurement_value, price, stock_quantity, variant_id];
    const { rows } = client ? await client.query(query, values) : await db.query(query, values);
    return rows[0];
  },

  // Delete a product (cascades to product_details)
  async deleteProduct(product_id, client) {
    const query = 'DELETE FROM products WHERE product_id = $1 RETURNING *';
    const { rows } = client ? await client.query(query, [product_id]) : await db.query(query, [product_id]);
    return rows[0];
  },
};

module.exports = ProductRepository;
