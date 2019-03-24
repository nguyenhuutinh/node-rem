export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const { omit } = require('lodash');
import { SaleProduct } from 'api/models';
import { startTimer, apiJson } from 'api/utils/Utils';
const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req: Request, res: Response, next: NextFunction, id: any) => {
  try {
    const product = await SaleProduct.get(id);
    req.route.meta = req.route.meta || {};
    req.route.meta.product = product;
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get user
 * @public
 */
exports.get = (req: Request, res: Response) => {
  res.json(req.route.meta.product.transform());
}

/**
 * Create new user
 * @public
 */
exports.create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = new SaleProduct(req.body);
    const savedProduct = await product.save();
    res.status(httpStatus.CREATED);
    res.json(savedProduct.transform());
  } catch (error) {
    next(SaleProduct.checkDuplicateProduct(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product } = req.route.meta;
    const newProduct = new SaleProduct(req.body);
    const ommitRole = product.role !== 'admin' ? 'role' : '';
    const newProductObject = omit(newProduct.toObject(), '_id', ommitRole);

    await product.update(newProductObject, { override: true, upsert: true });
    const savedProduct = await SaleProduct.findById(product._id);

    res.json(savedProduct.transform());
  } catch (error) {
    next(SaleProduct.checkDuplicateProduct(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req: Request, res: Response, next: NextFunction) => {
  const ommitRole = req.route.meta.user.role !== 'admin' ? 'role' : '';
  const updatedProduct = omit(req.body, ommitRole);
  const product = Object.assign(req.route.meta.product, updatedProduct);

  product
    .save()
    .then((savedProduct: any) => res.json(savedProduct.transform()))
    .catch((e: any) => next(SaleProduct.checkDuplicateProduct(e)));
};

/**
 * Get user list
 * @public
 * @example GET https://localhost:3009/v1/users?role=admin&limit=5&offset=0&sort=email:desc,createdAt
 */
exports.list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    startTimer(req);
    const data = (await SaleProduct.list(req)).transform(req);
    apiJson({ req, res, data, model: SaleProduct });
  } catch (e) {
    next(e);
  }
};
