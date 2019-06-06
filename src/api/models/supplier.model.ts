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

const roles = [ 'store', 'supplier' ];

/**
 * User Schema
 * @private
 */
const supplierSchema = new mongoose.Schema(
	{
		_id: mongoose.Schema.Types.ObjectId,
		code: {
			type: String,
			maxlength: 128
		},
		name: {
			type: String,
			maxlength: 128,
			index: true,
			trim: true
		},
		phone: {
			type: String,
			maxlength: 15,
			trim: true
		},
		address: {
			type: String
		},
		sale_force: {
			type: String,
			trim: true
		},
		hotline_deli: {
			type: String,
			trim: true
		},
		ma_so_thue: {
			type: String,
			trim: true
		},
		email: {
			type: String,
			trim: true,
			lowercase: true
		},
		cc_email: {
			type: String,
			trim: true,
			lowercase: true
		},
		type: {
			type: String,
			enum: roles,
			default: 'store'
		}
	},
	{
		timestamps: true
	}
);
const ALLOWED_FIELDS = [
	'id',
	'code',
	'name',
	'phone',
	'ma_so_thue',
	'email',
	'address',
	'hotline_deli',
	'sale_force',
	'cc_email',
	'type'
];

/**
 * Methods
 */
supplierSchema.method({
	// query is optional, e.g. to transform data for response but only include certain "fields"
	transform({ query = {} }: { query?: any } = {}) {
		// transform every record (only respond allowed fields and "&fields=" in query)
		return transformData(this, query, ALLOWED_FIELDS);
	}
});

/**
 * Statics
 */
supplierSchema.statics = {
	roles,

	/**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
	async get(id: any) {
		try {
			let supplier;

			if (mongoose.Types.ObjectId.isValid(id)) {
				supplier = await this.findById(id).exec();
			}
			if (supplier) {
				return supplier;
			}

			throw new APIError({
				message: 'supplier does not exist',
				status: httpStatus.NOT_FOUND
			});
		} catch (error) {
			throw error;
		}
	},

	/**
   * List users.
   * @returns {Promise<User[]>}
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
	checkDuplicateEmail(error: any) {
		if (error.name === 'MongoError' && error.code === 11000) {
			return new APIError({
				message: 'Validation Error',
				errors: [
					{
						field: 'email',
						location: 'body',
						messages: [ '"email" already exists' ]
					}
				],
				status: httpStatus.CONFLICT,
				isPublic: true,
				stack: error.stack
			});
		}
		return error;
	},
	async createSupplier({
		id,
		name,
		phone,
		address,
		ma_so_thue,
		type,
		sale_force,
		email,
		hotline_deli,
		cc_email
	}: any) {
		const supplier = await this.findOne({ $or: [ { id: { $eq: id } }, { name: { $eq: name } } ] });
		console.log('createSupplier', supplier);
		if (supplier && name != '') {
			if (name) {
				supplier.name = name;
			}
			if (phone) {
				supplier.phone = phone;
			}
			if (address) {
				supplier.address = address;
			}
			if (ma_so_thue) {
				supplier.ma_so_thue = ma_so_thue;
			}
			if (type) {
				supplier.type = type;
			}
			if (sale_force) {
				supplier.sale_force = sale_force;
			}
			if (email) {
				supplier.email = email;
			}
			if (hotline_deli) {
				supplier.hotline_deli = hotline_deli;
			}
			if (cc_email) {
				supplier.cc_email = cc_email;
			}
			return supplier.save();
		}

		return this.create({
			_id: new mongoose.Types.ObjectId(),
			name,
			phone,
			address,
			ma_so_thue,
			type,
			sale_force,
			email,
			hotline_deli,
			cc_email
		});
	},
	async updateSupplier({ suppliers }: any) {
		for (var i = 0; i < suppliers.length; i++) {
			var data = suppliers[i];
			console.log('data', data);
			const supplier = await this.findOne({ $or: [ { _id: { $eq: data.id } }, { name: { $eq: data.name } } ] });
			if (supplier) {
				console.log('supplier', supplier);
				if (data.name) {
					supplier.name = data.name;
				}
				if (data.phone) {
					supplier.phone = data.phone;
				}
				if (data.address) {
					supplier.address = data.address;
				}
				if (data.ma_so_thue) {
					supplier.ma_so_thue = data.ma_so_thue;
				}
				if (data.type) {
					supplier.type = data.type;
				}
				if (data.sale_force) {
					supplier.sale_force = data.sale_force;
				}
				if (data.email) {
					supplier.email = data.email;
				}
				if (data.hotline_deli) {
					supplier.hotline_deli = data.hotline_deli;
				}
				if (data.cc_email) {
					supplier.cc_email = data.cc_email;
				}
				await supplier.save();
			}
		}

		throw new APIError({
			message: 'supplier does not exist',
			status: httpStatus.NOT_FOUND
		});
	}
};

/**
 * @typedef User
 */
const Supplier = mongoose.model('Supplier', supplierSchema);
Supplier.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports = Supplier;
