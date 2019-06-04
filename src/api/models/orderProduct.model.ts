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

const moment = require('moment-timezone');

const OrderProductSchema = new mongoose.Schema(
 {
   _id: mongoose.Schema.Types.ObjectId,
   product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportProduct' },
   order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ImportOrder' },
   quantity: {
     type: Number,
     default: 1,
     required: true
   },
   price:{
     type: Number,
   },
   alias:{
     type: String
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
const ALLOWED_FIELDS = ['id', 'product_id', 'order_id', 'alias', 'price','quantity', 'note'];

var autoPopulateLead = function(next: any) {
  this.populate("product_id");
  next();
};
OrderProductSchema.pre('findOne', autoPopulateLead).
  pre('find', autoPopulateLead);

OrderProductSchema.statics = {
  async createOrderProduct({
    _id,
    product_id,
    order_id,
    alias,
    quantity,
    price,
    ordered_name,
    ordered_email,
    ordered_phone,
    note
  }: any) {
    console.log('createOrderProduct', _id, product_id, order_id);
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
    var prdorder;
    if(_id != undefined){
      prdorder = await this.findOne({ _id: { $eq: _id }});
    }else{
      prdorder = await this.findOne({ order_id: { $eq: order_id }, product_id: { $eq: product_id }});
    }

    console.log(prdorder, "prdorder");
    if (prdorder != undefined) {
      if(product_id != undefined){
        prdorder.product_id = product_id;
      }
      if(ordered_name != undefined){
        prdorder.ordered_name = ordered_name;
      }
      if(ordered_email != undefined){
        prdorder.ordered_email = ordered_email;
      }
      if(ordered_phone != undefined){
        prdorder.ordered_phone = ordered_phone;
      }
      if(quantity != undefined){
        prdorder.quantity = quantity;
      }
      if(alias != undefined){
        prdorder.alias = alias;
      }
      if(price != undefined){
        prdorder.price = price;
      }
      if(note != undefined){
        prdorder.note = note;
      }
      prdorder.updated_at = moment();
      return prdorder.save();
    }


    return this.create({
      _id: new mongoose.Types.ObjectId(),
      product_id,
      order_id,
      quantity,
      price,
      alias,
      ordered_name,
      ordered_email,
      ordered_phone,
      note
    });
  },
}
 /**
  * @typedef Product
  */
 const OrderProducts = mongoose.model('OrderProducts', OrderProductSchema);
 OrderProductSchema.ALLOWED_FIELDS = ALLOWED_FIELDS;
 module.exports = OrderProducts;
