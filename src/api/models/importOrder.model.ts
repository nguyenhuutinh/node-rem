export { };
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('api/utils/APIError');
import { ImportProduct, User } from 'api/models';
import { transformData, listData } from 'api/utils/ModelUtils';
const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');

/**
 * Product Schema
 * @private
 */
const importOrderSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    order_code: {
      type: String,
      trim: true
    },
    order_name: {
      type: String,
      trim: true
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    delivery_address: {
      type: String,
      maxlength: 128,
      trim: true
    },
    delivery_time: {
      type: Date,
      default: Date.now
    },
    sale_force: {
      type: String,
      trim: true
    },
    hotline_deli: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    cc_email: {
      type: String,
      trim: true
    },
    note: {
      type: String,
      trim: true
    },

    productIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ImportProduct' }],

    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);
const ALLOWED_FIELDS = [
  'id',
  'order_code',
  'order_name',
  'customer',
  'delivery_address',
  'delivery_time',
  'sale_force',
  'hotline_deli',
  'email',
  'cc_email',
  'note',
  'productIDs',
  'created_at',
  'updated_at'
];

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
importOrderSchema.pre('save', async function save(next: NextFunction) {
  try {
    return next(); // normal save
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
importOrderSchema.method({
  // query is optional, e.g. to transform data for response but only include certain "fields"
  transform({ query = {} }: { query?: any } = {}) {
    console.log('transform');
    // transform every record (only respond allowed fields and "&fields=" in query)
    return transformData(this, query, ALLOWED_FIELDS);
  }
});

/**
 * Statics
 */
importOrderSchema.statics = {
  /**
   * Get product
   *
   * @param {ObjectId} id - The objectId of product.
   * @returns {Promise<Product, APIError>}
   */
  async get(id: any) {
    try {
      let order;
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await this.findById(id)
          .populate('customer', ['id', 'name', 'phone', 'email'])
          .populate('productIDs')
          .exec();
      }

      if (order) {
        return order;
      }

      throw new APIError({
        message: 'order does not exist',
        status: httpStatus.NOT_FOUND
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * List Products.
   * @returns {Promise<Product[]>}
   */
  list({ query }: { query: any }) {
    return listData(this, query, ALLOWED_FIELDS);
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateOrder(error: any) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [
          {
            field: 'order_code',
            location: 'body',
            messages: ['"order_code" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  },

  async updateOrderProducts({ id, productIDs }: any) {
    console.log("updateOrderProducts" , id ,productIDs)
    const order = await this.findById(id);
      console.log("order1" , order)
    if (order) {
      if (productIDs) {
        order.productIDs = productIDs;
      }
      return order.save();
    } else {
      throw new APIError({
        message: 'order not exist',
        status: httpStatus.NOT_FOUND
      });
    }
  },
  async createOrder({
    id,
    order_code,
    order_name,
    customer_id,
    delivery_address,
    delivery_time,
    sale_force,
    hotline_deli,
    email,
    cc_email,
    note,
    productIDs
  }: any) {
    console.log('createOrder');
    const customer = await User.findById(customer_id);
    if (customer == null) {
      throw new APIError({
        message: 'customer does not exist',
        status: httpStatus.NOT_FOUND
      });
    }

    const product = await ImportProduct.findById(productIDs);
    // if(product == null){
    //    throw new APIError({
    //     message: 'product does not exist',
    //     status: httpStatus.NOT_FOUND
    //   });
    //
    // }
    const order = await this.findOne({ order_code: { $eq: order_code } });
    if (order) {
      throw new APIError({
        message: 'order code exist',
        status: httpStatus.FORBIDDEN
      });
      // if (!order.customer) {
      //   order.customer = customer;
      // }
      // if (!order.delivery_address) {
      //   order.delivery_address = delivery_address;
      // }
      // if (!order.delivery_time) {
      //   order.delivery_time = delivery_time;
      // }
      // if (!order.note) {
      //   order.note = note;
      // }
      //
      // if (!order.productIds) {
      //   order.productIds = productIds;
      // }
      // return order.save();
    }

    return this.create({
      _id: new mongoose.Types.ObjectId(),
      order_code,
      order_name,
      customer,
      delivery_address,
      delivery_time,
      sale_force,
      hotline_deli,
      email,
      cc_email,
      note,
      productIDs
    });
  },
  async updateOrder({
    id,
    order_code,
    order_name,
    customer_id,
    delivery_address,
    delivery_time,
    sale_force,
    hotline_deli,
    email,
    cc_email,
    note,
    productIDs
  }: any) {
    console.log('updateOrder');
    const customer = await User.findById(customer_id);
    if (customer == null) {
      throw new APIError({
        message: 'customer does not exist',
        status: httpStatus.NOT_FOUND
      });
    }

    const product = await ImportProduct.findById(productIDs);
    // if(product == null){
    //    throw new APIError({
    //     message: 'product does not exist',
    //     status: httpStatus.NOT_FOUND
    //   });
    //
    // }
    const order = await this.findOne({ order_code: { $eq: order_code } });
    if (order) {

      if (!order.customer) {
        order.customer = customer;
      }
      if (!order.delivery_address) {
        order.delivery_address = delivery_address;
      }
      if (!order.delivery_time) {
        order.delivery_time = delivery_time;
      }
      if (!order.note) {
        order.note = note;
      }

      if (!order.productIDs) {
        order.productIDs = productIDs;
      }
      return order.save();
    }

    else {
      throw new APIError({
        message: 'order not exist',
        status: httpStatus.NOT_FOUND
      });
    }
  },
  async count() {
    return this.find().count();
  }
};

/**
 * @typedef Product
 */
const ImportOrder = mongoose.model('ImportOrder', importOrderSchema);
ImportOrder.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports = ImportOrder;
