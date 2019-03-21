export {};
import * as Joi from 'joi';
import { Product } from 'api/models';

module.exports = {
  // GET /v1/users
  listProducts: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number()
        .min(1)
        .max(100),
      name: Joi.string(),
      prd_code: Joi.string(),
      note: Joi.string(),
      image: Joi.string(),
      dvt: Joi.string().valid(Product.dtv)
    }
  },

  // POST /v1/users
  createProduct: {
    body: {
      name: Joi.string()
        .required(),
      prd_code: Joi.string()
        .required(),
      note: Joi.string().max(128),
      image:Joi.string().max(128),
      dvt: Joi.string().valid(Product.dvt)
    }
  },

  // PUT /v1/users/:userId
  replaceProduct: {
    body: {
      name: Joi.string()
        .required(),
      prd_code: Joi.string()
        .required(),
      note: Joi.string().max(128),
      image:Joi.string().max(128),
      dvt: Joi.string().valid(Product.dvt)
    },
    params: {
      productId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required()
    }
  },

  // PATCH /v1/users/:userId
  updateProduct: {
    body: {
      name: Joi.string()
        .required(),
      prd_code: Joi.string()
        .required(),
      note: Joi.string().max(128),
      image:Joi.string().max(128),
      dvt: Joi.string().valid(Product.dvt)
    },
    params: {
      productId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required()
    }
  }
};
