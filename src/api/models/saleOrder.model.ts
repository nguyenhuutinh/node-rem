export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('api/utils/APIError');
import { SaleProduct, User, PackageTimeLine } from 'api/models';
import { transformData, listData , listOrderData} from 'api/utils/ModelUtils';
const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');


const types = ['le', 'goi_5', 'goi_10'];
const payment_types = ['cash', 'banking', 'credit_card'];
const payment_status = ['none', 'paid'];
const order_status = ['new', 'proccessed', 'delivering', 'finished', 'completed', 'canceled' ];

/**
 * Product Schema
 * @private
 */


const saleOrderSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    code: {
      type: String,
      trim: true
    },
    customer : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: order_status,
        default: "new"
    },
    type: {
        type: String,
        enum: types,
        default: "le"
    },
    delivery_address: {
      type: String,
      maxlength: 128,
      index: true,
      unique: true,
      trim: true
    },

    payment_type:{
      type: String,
      enum: payment_types,
      default: 'cash'
    },
    payment_status:{
      type: String,
      enum: payment_status,
      default: 'paid',
    },
    payment_note:{
      type: String,

    },
    note: {
      type: String,
      trim: true
    },
    sale_force:{
      type:String
    },
    products : [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderProducts' }],
    delivery_time : [{ type: mongoose.Schema.Types.ObjectId, ref: 'PackageTimeLine' }],

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
const ALLOWED_FIELDS = ['_id', 'code', 'status', 'customer', 'type', 'payment_type', 'payment_status','payment_note','delivery_address', 'delivery_time', 'note', 'products', 'created_at', 'updated_at'];

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
saleOrderSchema.pre('save', async function save(next: NextFunction) {
  try {
    return next(); // normal save
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
saleOrderSchema.method({
  // query is optional, e.g. to transform data for response but only include certain "fields"
  transform({ query = {} }: { query?: any } = {}) {
    // transform every record (only respond allowed fields and "&fields=" in query)
    return transformData(this, query, ALLOWED_FIELDS);
  }
});

/**
 * Statics
 */
saleOrderSchema.statics = {
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
        order = await this.findById(id).populate('customer',['id','name', 'phone','email', 'address']).populate('products').populate('delivery_time').exec();
      }

      if (order) {
        if(order.products && order.products.product_id){
            var _prd = SaleProduct.findById(order.products.product_id);
            order.products.name = _prd.name;
        }
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
    return listOrderData(this, query, ALLOWED_FIELDS);
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
            field: 'code',
            location: 'body',
            messages: ['"order code" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  },

  async createOrder({id, code, customer_id, delivery_address, delivery_time, note, products }: any) {
    const customer = await User.findById(customer_id)
    if(customer == null){
       throw new APIError({
        message: 'customer does not exist',
        status: httpStatus.NOT_FOUND
      });

    }

    const product = await SaleProduct.findById(products)
    if(product == null){
       throw new APIError({
        message: 'product does not exist',
        status: httpStatus.NOT_FOUND
      });

    }
    const order = await this.findOne(code);
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

      if (!order.products) {
        order.products = products;
      }
      return order.save();
    }
    var deliveryTime = new PackageTimeLine({ delivery_no: 1, delivery_time: new Date(), delivery_status: 'new',deliverier:'tao' });

    return this.create({
      _id: new mongoose.Types.ObjectId(),
      code,
      customer,
      delivery_address,
      deliveryTime,
      note,
      products
    });
  },

  async count() {
    return this.find().count();
  }
};

/**
 * @typedef Product
 */
const SaleOrder = mongoose.model('SaleOrder', saleOrderSchema);
SaleOrder.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports = SaleOrder;
