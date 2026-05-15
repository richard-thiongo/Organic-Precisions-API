const salesRepository = require('../repositories/sales.repository');

class SalesService {
  /**
   * Process a new sale
   * @param {Array} items - Array of {variant_id, quantity}
   */
  async processSale(items) {
    if (!items || items.length === 0) {
      throw new Error('No items provided for sale');
    }
    return await salesRepository.createSaleWithItems(items);
  }

  /**
   * Get analytical stats for the dashboard
   */
  async getStats() {
    return await salesRepository.getDashboardStats();
  }
}

module.exports = new SalesService();
