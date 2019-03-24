export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const numeral = require('numeral');
const APIError = require('api/utils/APIError');
import { transformData, listData } from 'api/utils/ModelUtils';
const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');

/**
 * Product Type
 */
const dvt = ['kg', 'hop','goi'];

/**
 * Product Schema
 * @private
 */
const saleProductSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    code: {
      type: String,
      maxlength: 128,
      index: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      maxlength: 128,
      index: true,
      unique: true,
      trim: true
    },
    dvt: {
      type: String,
      trim: true,
      default: "chai"
    },
    price: {
      type: Number
    },
    type: {
        type: String,
        enum: ["325ml", "500ml"],
        default: "325ml"
    },
    image_url: {
      type: String,
      trim: true
    },
    note: {
      type: String,
      trim: true
    },
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

saleProductSchema.virtual('format_price').get(function() {
  return numeral(this.price).format('0,0') + ' đ';
})

const ALLOWED_FIELDS = ['id', 'code', 'name', 'dvt', 'price', 'format_price', 'type', 'image_url',  'note', 'created_at', 'updated_at'];

/**
 * Add yo
  + 'đ'* - pre-save hooks
 * - validations
 * - virtuals
 */
saleProductSchema.pre('save', async function save(next: NextFunction) {
  try {
    return next(); // normal save
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
saleProductSchema.method({
  // query is optional, e.g. to transform data for response but only include certain "fields"
  transform({ query = {} }: { query?: any } = {}) {
    // transform every record (only respond allowed fields and "&fields=" in query)
    return transformData(this, query, ALLOWED_FIELDS);
  },

  // token() {
  //   const playload = {
  //     exp: moment()
  //       .add(JWT_EXPIRATION_MINUTES, 'minutes')
  //       .unix(),
  //     iat: moment().unix(),
  //     sub: this._id
  //   };
  //   return jwt.encode(playload, JWT_SECRET);
  // },

  // async passwordMatches(password: string) {
  //   return bcrypt.compare(password, this.password);
  // }
});

/**
 * Statics
 */
saleProductSchema.statics = {
  dvt,

  /**
   * Get product
   *
   * @param {ObjectId} id - The objectId of product.
   * @returns {Promise<Product, APIError>}
   */
  async get(id: any) {
    try {
      let product;

      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await this.findById(id).exec();
      }
      if (product) {
        return product;
      }

      throw new APIError({
        message: 'product does not exist',
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
  checkDuplicateProduct(error: any) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [
          {
            field: 'code',
            location: 'body',
            messages: ['"product code" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  },

  async createProduct({code, name, dvt, price, type, note, image_url }: any) {
    console.log("createProduct");
    const product = await this.findOne(code);
    if (product) {

      if (!product.name) {
        product.name = name;
      }
      if (!product.dvt) {
        product.dvt = dvt;
      }
      if (!product.price) {
        product.price = price;
      }

      if (!product.type) {
        product.type = type;
      }
      if (!product.image_url) {
        product.image_url = image_url;
      }
      if (!product.note) {
        product.note = note;
      }

      return product.save();
    }

    return this.create({
      _id: new mongoose.Types.ObjectId(),
      code,
      name,
      dvt,
      price,
      type,
      note,
      image_url
    });
  },

  async count() {
    return this.find().count();
  }
};

/**
 * @typedef Product
 */
const SaleProduct = mongoose.model('SaleProduct', saleProductSchema);
SaleProduct.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports = SaleProduct;
