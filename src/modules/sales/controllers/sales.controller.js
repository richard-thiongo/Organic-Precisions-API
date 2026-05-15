const salesService = require('../services/sales.service');
const Joi = require('joi');

class SalesController {
  /**
   * Handle POS Checkout
   */
  async checkout(req, res) {
    const schema = Joi.array().items(
      Joi.object({
        variant_id: Joi.number().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required();

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    try {
      const result = await salesService.processSale(value);
      res.status(201).json({
        status: 'success',
        message: 'Sale processed successfully',
        data: result
      });
    } catch (err) {
      console.error('Checkout error:', err.message);
      res.status(400).json({ 
        status: 'error', 
        message: err.message.includes('stock') ? err.message : 'Failed to process checkout' 
      });
    }
  }

  /**
   * Handle Statistics Retrieval
   */
  async getStats(req, res) {
    try {
      const stats = await salesService.getStats();
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (err) {
      console.error('Stats error:', err.message);
      res.status(500).json({ status: 'error', message: 'Failed to retrieve stats' });
    }
  }
}

module.exports = new SalesController();
