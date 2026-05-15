const Joi = require('joi');

const productSchema = Joi.object({
  product_name: Joi.string().required().max(255),
  category: Joi.string().required().max(255),
  description: Joi.string().allow('', null),
  variants: Joi.array().items(
    Joi.object({
      measurement_unit: Joi.string().required().max(50),
      measurement_value: Joi.number().required().precision(2),
      price: Joi.number().required().min(0).precision(2),
      stock_quantity: Joi.number().integer().min(0).default(0),
    })
  ).min(1).required(),
});

const stockUpdateSchema = Joi.object({
  variant_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const sellSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      variant_id: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});

const editProductSchema = Joi.object({
  product_name: Joi.string().max(255),
  category: Joi.string().max(255),
  description: Joi.string().allow('', null),
  variants: Joi.array().items(
    Joi.object({
      variant_id: Joi.number().integer(), // Optional if adding new variant
      measurement_unit: Joi.string().max(50),
      measurement_value: Joi.number().precision(2),
      price: Joi.number().min(0).precision(2),
      stock_quantity: Joi.number().integer().min(0),
    })
  ),
});

module.exports = {
  productSchema,
  stockUpdateSchema,
  sellSchema,
  editProductSchema,
};
