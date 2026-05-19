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
  /**
   * Get sales reports for a date range
   */
  async getReports(startDate, endDate) {
    if (!startDate) {
      throw new Error('startDate is required');
    }
    
    // If no endDate is provided, assume it's for a single day
    const finalEndDate = endDate || startDate;

    return await salesRepository.getReportsByDateRange(startDate, finalEndDate);
  }
}

module.exports = new SalesService();
