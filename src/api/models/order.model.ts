export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('api/utils/APIError');
import { Product, User } from 'api/models';
import { transformData, listData } from 'api/utils/ModelUtils';
const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');


/**
 * Product Schema
 * @private
 */
const orderSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    order_code: {
      type: String,
      trim: true
    },
    customer_id : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    delivery_address: {
      type: String,
      maxlength: 128,
      index: true,
      unique: true,
      trim: true
    },
    delivery_time: {
      type: Date,
      default: Date.now
    },

    note: {
      type: String,
      trim: true
    },

    productIDs : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

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
const ALLOWED_FIELDS = ['_id', 'order_code', 'customer_id', 'delivery_address', 'delivery_time', 'note', 'productIDs', 'created_at', 'updated_at'];

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
orderSchema.pre('save', async function save(next: NextFunction) {
  try {
    return next(); // normal save
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
orderSchema.method({
  // query is optional, e.g. to transform data for response but only include certain "fields"
  transform({ query = {} }: { query?: any } = {}) {
    console.log("transform")
    // transform every record (only respond allowed fields and "&fields=" in query)
    return transformData(this, query, ALLOWED_FIELDS);
  }
});

/**
 * Statics
 */
orderSchema.statics = {
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
        order = await this.findById(id).populate('customer_id').populate('productIDs').exec();
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

  async createOrder({id, order_code, customer_id, delivery_address, delivery_time, note, productIds }: any) {
    console.log("createOrder");
    const customer = await User.findById(customer_id)
    if(customer == null){
       throw new APIError({
        message: 'customer does not exist',
        status: httpStatus.NOT_FOUND
      });

    }

    const product = await Product.findById(productIds)
    if(product == null){
       throw new APIError({
        message: 'product does not exist',
        status: httpStatus.NOT_FOUND
      });

    }
    const order = await this.findOne(order_code);
    if (order) {

      if (!order.customer_id) {
        order.customer_id = customer_id;
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

      if (!order.productIds) {
        order.productIds = productIds;
      }
      return order.save();
    }

    return this.create({
      _id: new mongoose.Types.ObjectId(),
      order_code,
      customer_id,
      delivery_address,
      delivery_time,
      note,
      productIds
    });
  },

  async count() {
    return this.find().count();
  }
};

/**
 * @typedef Product
 */
const Order = mongoose.model('Order', orderSchema);
Order.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports = Order;
