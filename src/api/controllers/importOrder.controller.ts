export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const { omit } = require('lodash');
import { ImportOrder, User } from 'api/models';
import { startTimer, apiJson } from 'api/utils/Utils';
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req: Request, res: Response, next: NextFunction, id: any) => {
  try {
    const order = await ImportOrder.get(id);
    req.route.meta = req.route.meta || {};
    req.route.meta.order = order;
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req: Request, res: Response) => res.json(req.route.meta.order.transform());

/**
 * Create new user
 * @public
 */
exports.create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await ImportOrder.createOrder(req.body);
    const savedOrder = await order.save();
    res.status(httpStatus.CREATED);
    res.json(savedOrder.transform());
  } catch (error) {
    next(ImportOrder.checkDuplicateOrder(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order } = req.route.meta;
    const newOrder = new ImportOrder(req.body);
    const ommitRole = order.role !== 'admin' ? 'role' : '';
    const newOrderObject = omit(newOrder.toObject(), '_id', ommitRole);

    await order.update(newOrderObject, { override: true, upsert: true });
    const savedOrder = await ImportOrder.findById(order._id);

    res.json(savedOrder.transform());
  } catch (error) {
    next(ImportOrder.checkDuplicateOrder(error));
  }
};

/**
 * Update existing order
 * @public
 */
exports.update = (req: Request, res: Response, next: NextFunction) => {
  const ommitRole = req.route.meta.user.role !== 'admin' ? 'role' : '';
  const updatedOrder = omit(req.body, ommitRole);
  const order = Object.assign(req.route.meta.order, updatedOrder);

  order
    .save()
    .then((savedOrder: any) => res.json(savedOrder.transform()))
    .catch((e: any) => next(ImportOrder.checkDuplicateOrder(e)));
};

/**
 * Update existing products of order
 * @public
 */
exports.updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const ommitRole = req.route.meta.user.role !== 'admin' ? 'role' : '';
  console.log(ommitRole)
  // const updatedOrder = omit(req.body, ommitRole);
  // const order = Object.assign(req.route.meta.order, updatedOrder);
  const order  = await ImportOrder.updateOrderProducts(req.body)
  console.log("order",order)
  order
    .save()
    .then((savedOrder: any) => res.json(savedOrder.transform()))
    .catch((e: any) => next(ImportOrder.checkDuplicateOrder(e)));
};

/**
 * Get user list
 * @public
 * @example GET https://localhost:3009/v1/users?role=admin&limit=5&offset=0&sort=email:desc,createdAt
 */
exports.list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    startTimer(req);

    const data = (await ImportOrder.list(req)).transform(req);

    apiJson({ req, res, data, model: ImportOrder });
  } catch (e) {
    next(e);
  }
};


/**
 * Delete product
 * @public
 */
exports.remove = (req: Request, res: Response, next: NextFunction) => {

  const order  = ImportOrder.findById(req.body.id);
  order
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e: any) => next(e));
};
