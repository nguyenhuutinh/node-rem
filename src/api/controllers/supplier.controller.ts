export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const { omit } = require('lodash');
import { SupplierAccount, User } from 'api/models';
import { startTimer, apiJson } from 'api/utils/Utils';
const { handler: errorHandler } = require('../middlewares/error');
const APIError = require('api/utils/APIError');
/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req: Request, res: Response, next: NextFunction, id: any) => {
	try {
		const order = await SupplierAccount.get(id);
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
		console.log(req.body);
		const supplier = await SupplierAccount.createSupplier(req.body);
		res.status(httpStatus.CREATED);
		res.json(supplier.transform());
	} catch (error) {
		console.log(error);
		return new APIError({
			message: 'Validation Error',
			errors: [
				{
					field: 'something went wrong',
					location: 'body',
					messages: [ 'something went wrong' ]
				}
			],
			status: httpStatus.CONFLICT,
			isPublic: true,
			stack: error.stack
		});
	}
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { order } = req.route.meta;
		const newOrder = new SupplierAccount(req.body);
		const ommitRole = order.role !== 'admin' ? 'role' : '';
		const newOrderObject = omit(newOrder.toObject(), '_id', ommitRole);

		await order.update(newOrderObject, { override: true, upsert: true });
		const savedOrder = await SupplierAccount.findById(order._id);

		res.json(savedOrder.transform());
	} catch (error) {
		return errorHandler(error, req, res);
	}
};

/**
 * Update existing user
 * @public
 */
exports.update = async (req: Request, res: Response, next: NextFunction) => {
	try {
		console.log(req.body, req.body.length);
		const supplier = await SupplierAccount.updateSupplier(req.body);
		res.status(httpStatus.CREATED);
		res.json(supplier.transform());
	} catch (error) {
		return new APIError({
			message: 'Validation Error',
			errors: [
				{
					field: 'something went wrong',
					location: 'body',
					messages: [ 'something went wrong' ]
				}
			],
			status: httpStatus.CONFLICT,
			isPublic: true,
			stack: error.stack
		});
	}
};

/**
 * Get user list
 * @public
 * @example GET https://localhost:3009/v1/users?role=admin&limit=5&offset=0&sort=email:desc,createdAt
 */
exports.list = async (req: Request, res: Response, next: NextFunction) => {
	try {
		startTimer(req);

		const data = (await SupplierAccount.list(req)).transform(req);

		apiJson({ req, res, data, model: SupplierAccount });
	} catch (e) {
		next(e);
	}
};

/**
 * Delete product
 * @public
 */
exports.remove = (req: Request, res: Response, next: NextFunction) => {
	const suplier = SupplierAccount.findById(req.body.id);
	suplier.remove().then(() => res.status(httpStatus.NO_CONTENT).end()).catch((e: any) => next(e));
};
