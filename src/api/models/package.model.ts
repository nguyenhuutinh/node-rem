export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('api/utils/APIError');
import { SaleProduct, User } from 'api/models';
import { transformData, listData } from 'api/utils/ModelUtils';
const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');


const delivery_status = ['new', 'processing','deliveried'];

const packageTimelineSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    delivery_no:{
      type: Number,
      default: 1,
      unique: true,
      required: true
    },
    delivery_time:{
      type: Date,
      default: Date.now,
      unique: true,
      required: true
    },
    delivery_status:{
      type: String,
      enum: delivery_status,
      default: 'new'
    },
    deliverier:{
      type: String,
    }
 });
const ALLOWED_FIELDS = ['_id', 'delivery_no', 'delivery_time', 'delivery_status', 'deliverier'];
 /**
  * @typedef Product
  */
 const PackageTimeLine = mongoose.model('PackageTimeLine', packageTimelineSchema);
 PackageTimeLine.ALLOWED_FIELDS = ALLOWED_FIELDS;
 module.exports = PackageTimeLine;
