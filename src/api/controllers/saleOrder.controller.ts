export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const { omit } = require('lodash');
import { SaleOrder, User } from 'api/models';
import { startTimer, apiJson } from 'api/utils/Utils';
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req: Request, res: Response, next: NextFunction, id: any) => {
  try {
    const order = await SaleOrder.get(id);
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
    const order = new SaleOrder(req.body);
    const savedOrder = await order.save();
    res.status(httpStatus.CREATED);
    res.json(savedOrder.transform());
  } catch (error) {
    next(SaleOrder.checkDuplicateOrder(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order } = req.route.meta;
    const newOrder = new SaleOrder(req.body);
    const ommitRole = order.role !== 'admin' ? 'role' : '';
    const newOrderObject = omit(newOrder.toObject(), '_id', ommitRole);

    await order.update(newOrderObject, { override: true, upsert: true });
    const savedOrder = await SaleOrder.findById(order._id);

    res.json(savedOrder.transform());
  } catch (error) {
    next(SaleOrder.checkDuplicateOrder(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req: Request, res: Response, next: NextFunction) => {
  const ommitRole = req.route.meta.user.role !== 'admin' ? 'role' : '';
  const updatedOrder = omit(req.body, ommitRole);
  const order = Object.assign(req.route.meta.order, updatedOrder);

  order
    .save()
    .then((savedOrder: any) => res.json(savedOrder.transform()))
    .catch((e: any) => next(SaleOrder.checkDuplicateOrder(e)));
};

/**
 * Get user list
 * @public
 * @example GET https://localhost:3009/v1/users?role=admin&limit=5&offset=0&sort=email:desc,createdAt
 */
exports.list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    startTimer(req);

    const data = (await SaleOrder.list(req)).transform(req);

    apiJson({ req, res, data, model: SaleOrder });
  } catch (e) {
    next(e);
  }
};
