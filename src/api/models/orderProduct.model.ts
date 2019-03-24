export {};
// import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
// const httpStatus = require('http-status');
// const bcrypt = require('bcryptjs');
// const moment = require('moment-timezone');
// const jwt = require('jwt-simple');
// const uuidv4 = require('uuid/v4');
// const APIError = require('api/utils/APIError');
// import { SaleProduct, User } from 'api/models';
// import { transformData, listData } from 'api/utils/ModelUtils';
// const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');



const productQuantitySchema = new mongoose.Schema(
 {
   id: mongoose.Schema.Types.ObjectId,
   product: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleProduct' },
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
const ALLOWED_FIELDS = ['id', 'product', 'quantity'];

var autoPopulateLead = function(next: any) {
  this.populate('product');
  next();
};
productQuantitySchema.pre('findOne', autoPopulateLead).
  pre('find', autoPopulateLead);
 /**
  * @typedef Product
  */
 const ProductQuantity = mongoose.model('ProductQuantity', productQuantitySchema);
 ProductQuantity.ALLOWED_FIELDS = ALLOWED_FIELDS;
 module.exports = ProductQuantity;
