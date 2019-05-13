export {};
// import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const bcrypt = require('bcryptjs');
// const moment = require('moment-timezone');
// const jwt = require('jwt-simple');
// const uuidv4 = require('uuid/v4');
const APIError = require('api/utils/APIError');
import { ImportOrder, ImportProduct } from 'api/models';
// import { transformData, listData } from 'api/utils/ModelUtils';
// const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');



const productQuantitySchema = new mongoose.Schema(
 {
   _id: mongoose.Schema.Types.ObjectId,
   product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportProduct' },
   order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportOrder' },
   quantity: {
     type: Number,
     default: 1,
     required: true
   },
   note:{
     type: String
   },
   created_at:{
     type: Date,
     default: Date.now
   },
   updated_at:{
     type: Date,
     default: Date.now
   }
 });
const ALLOWED_FIELDS = ['id', 'product_id', 'order_id', 'quantity', 'note'];

var autoPopulateLead = function(next: any) {
  this.populate('product_id');
  next();
};
productQuantitySchema.pre('findOne', autoPopulateLead).
  pre('find', autoPopulateLead);

productQuantitySchema.statics = {
  async createOrderProduct({
    _id,
    product_id,
    order_id,
    quantity,
    note
  }: any) {
    console.log('createOrderProduct', quantity);
    const order = await ImportOrder.findById(order_id);
    if (order == null) {
      throw new APIError({
        message: 'order does not exist',
        status: httpStatus.NOT_FOUND
      });
    }

    const product = await ImportProduct.findById(product_id);
    if(product == null){
       throw new APIError({
        message: 'product does not exist',
        status: httpStatus.NOT_FOUND
      });

    }



    return this.create({
      _id: new mongoose.Types.ObjectId(),
      product_id,
      order_id,
      quantity,
      note
    });
  },
}
 /**
  * @typedef Product
  */
 const ProductQuantity = mongoose.model('ProductQuantity', productQuantitySchema);
 ProductQuantity.ALLOWED_FIELDS = ALLOWED_FIELDS;
 module.exports = ProductQuantity;
