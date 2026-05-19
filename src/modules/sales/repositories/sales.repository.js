const { pool } = require('../../../shared/config/db');

class SalesRepository {
  /**
   * Process a sale within a database transaction.
   * Ensures stock is deducted and sale is recorded atomically.
   */
  async createSaleWithItems(items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let totalAmount = 0;
      const saleItemsData = [];

      // 1. Process each item: Check stock and calculate subtotal
      for (const item of items) {
        const { variant_id, quantity } = item;

        // Atomic stock deduction with check
        const stockUpdateResult = await client.query(`
          UPDATE product_details 
          SET stock_quantity = stock_quantity - $1 
          WHERE variant_id = $2 AND stock_quantity >= $1
          RETURNING price, stock_quantity
        `, [quantity, variant_id]);

        if (stockUpdateResult.rowCount === 0) {
          throw new Error(`Insufficient stock for variant ID ${variant_id}`);
        }

        const unitPrice = parseFloat(stockUpdateResult.rows[0].price);
        const subtotal = unitPrice * quantity;
        totalAmount += subtotal;

        saleItemsData.push({
          variant_id,
          quantity,
          unit_price: unitPrice,
          subtotal
        });
      }

      // 2. Create the main sale record
      const saleResult = await client.query(
        'INSERT INTO sales (total_amount) VALUES ($1) RETURNING id, created_at',
        [totalAmount]
      );
      const saleId = saleResult.rows[0].id;

      // 3. Create individual sale item records
      for (const si of saleItemsData) {
        await client.query(`
          INSERT INTO sale_items (sale_id, variant_id, quantity, unit_price, subtotal)
          VALUES ($1, $2, $3, $4, $5)
        `, [saleId, si.variant_id, si.quantity, si.unit_price, si.subtotal]);
      }

      await client.query('COMMIT');
      return {
        id: saleId,
        total_amount: totalAmount,
        created_at: saleResult.rows[0].created_at,
        items_count: items.length
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Fetch statistics for the dashboard
   */
  async getDashboardStats() {
    const dailyRevenueQuery = `
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM sales 
      WHERE created_at::date = CURRENT_DATE
    `;

    const monthlyRevenueQuery = `
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM sales 
      WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
    `;

    const dailyTopProductsQuery = `
      SELECT 
          p.product_name as name, 
          SUM(si.quantity) as total_sold
      FROM sale_items si
      JOIN product_details v ON si.variant_id = v.variant_id
      JOIN products p ON v.product_id = p.product_id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at::date = CURRENT_DATE
      GROUP BY p.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `;

    const [dailyRes, monthlyRes, productsRes] = await Promise.all([
      pool.query(dailyRevenueQuery),
      pool.query(monthlyRevenueQuery),
      pool.query(dailyTopProductsQuery)
    ]);

    return {
      dailyRevenue: parseFloat(dailyRes.rows[0].revenue),
      monthlyRevenue: parseFloat(monthlyRes.rows[0].revenue),
      topProducts: productsRes.rows
    };
  }

  /**
   * Fetch reports for a specific date or date range
   */
  async getReportsByDateRange(startDate, endDate) {
    // 1. Get Aggregated totals
    const totalsQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(id) as total_sales_count
      FROM sales 
      WHERE created_at::date >= $1::date AND created_at::date <= $2::date
    `;

    // 2. Get Sales Records with their nested items
    const recordsQuery = `
      SELECT 
        s.id as sale_id,
        s.total_amount,
        s.created_at as sale_date,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'item_id', si.id,
                'product_name', p.product_name,
                'variant_details', pd.measurement_value || ' ' || pd.measurement_unit,
                'quantity', si.quantity,
                'unit_price', si.unit_price,
                'subtotal', si.subtotal
              )
            )
            FROM sale_items si
            JOIN product_details pd ON si.variant_id = pd.variant_id
            JOIN products p ON pd.product_id = p.product_id
            WHERE si.sale_id = s.id
          ), '[]'::json
        ) as items
      FROM sales s
      WHERE s.created_at::date >= $1::date AND s.created_at::date <= $2::date
      ORDER BY s.created_at DESC
    `;

    const [totalsRes, recordsRes] = await Promise.all([
      pool.query(totalsQuery, [startDate, endDate]),
      pool.query(recordsQuery, [startDate, endDate])
    ]);

    return {
      totalRevenue: parseFloat(totalsRes.rows[0].total_revenue),
      totalSalesCount: parseInt(totalsRes.rows[0].total_sales_count, 10),
      salesRecords: recordsRes.rows
    };
  }
}

module.exports = new SalesRepository();
