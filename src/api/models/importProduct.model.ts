export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
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
const importProductSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    prd_code: {
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
      trim: true
    },

    note: {
      type: String,
      trim: true
    },

    image: {
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
const ALLOWED_FIELDS = ['id', 'prd_code', 'name', 'image', 'dvt', 'note', 'created_at', 'updated_at'];

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
importProductSchema.pre('save', async function save(next: NextFunction) {
  try {
    return next(); // normal save
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
importProductSchema.method({
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
importProductSchema.statics = {
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
            field: 'prd_code',
            location: 'body',
            messages: ['"prd_code" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  },

  async createProduct({prd_code, name, dvt, note, image }: any) {
    // console.log("createProduct");
    const product = await this.findOne(prd_code);
    if (product) {

      if (!product.name) {
        product.name = name;
      }
      if (!product.image) {
        product.image = image;
      }
      if (!product.note) {
        product.note = note;
      }
      return product.save();
    }

    return this.create({
      _id: new mongoose.Types.ObjectId(),
      prd_code,
      name,
      dvt,
      note,
      image
    });
  },

  async count() {
    return this.find().count();
  }
};

/**
 * @typedef Product
 */
const ImportProduct = mongoose.model('ImportProduct', importProductSchema);
ImportProduct.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports = ImportProduct;
