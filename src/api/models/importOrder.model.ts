export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const uuidv4 = require('uuid/v4');
const APIError = require('api/utils/APIError');
import { ImportProduct, User, OrderProducts, SupplierAccount } from 'api/models';
import { transformData, listOrderData } from 'api/utils/ModelUtils';
const { env, JWT_SECRET, JWT_EXPIRATION_MINUTES } = require('config/vars');

/**
 * Product Schema
 * @private
 */
const importOrderSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	order_code: {
		type: String,
		trim: true
	},
	order_name: {
		type: String,
		trim: true
	},
	order_email: {
		type: String,
		trim: true
	},
	order_phone: {
		type: String,
		trim: true
	},
	supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
	delivery_address: {
		type: String
	},
	delivery_time: {
		type: Date,
		default: Date.now
	},
	delivery_time_str: {
		type: String,
		trim: true
	},

	note: {
		type: String,
		trim: true
	},
	productDetail: [ { type: mongoose.Schema.Types.ObjectId, ref: 'OrderProducts' } ],

	created_at: {
		type: Date,
		default: Date.now
	},
	updated_at: {
		type: Date,
		default: Date.now
	}
});
const ALLOWED_FIELDS = [
	'id',
	'order_code',
	'order_name',
	'order_email',
	'order_phone',
	'supplier',
	'owner',
	'delivery_address',
	'delivery_time',
	'delivery_time_str',
	'note',
	'productDetail',
	'created_at',
	'updated_at'
];

var autoPopulateLead = function(next: any) {
	this.populate('supplier');
	this.populate('owner');
	next();
};
importOrderSchema.pre('findOne', autoPopulateLead).pre('find', autoPopulateLead);
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
importOrderSchema.pre('save', async function save(next: NextFunction) {
	try {
		return next(); // normal save
	} catch (error) {
		return next(error);
	}
});

/**
 * Methods
 */
importOrderSchema.method({
	// query is optional, e.g. to transform data for response but only include certain "fields"
	transform({ query = {} }: { query?: any } = {}) {
		console.log('transform');
		// transform every record (only respond allowed fields and "&fields=" in query)
		return transformData(this, query, ALLOWED_FIELDS);
	}
});

/**
 * Statics
 */
importOrderSchema.statics = {
	/**
   * Get product
   *
   * @param {ObjectId} id - The objectId of product.
   * @returns {Promise<Product, APIError>}
   */
	async get(id: any) {
		try {
			if (mongoose.Types.ObjectId.isValid(id)) {
				const order = await this.findById(id)
					.populate('supplier', [
						'id',
						'name',
						'phone',
						'email',
						'ma_so_thue',
						'address',
						'hotline_deli',
						'sale_force',
						'cc_email',
						'type'
					])
					.populate('owner', [ 'id', 'code', 'name', 'phone', 'email' ])
					.populate('productDetail', [ 'id', 'quantity', 'price', 'note', 'alias' ])
					.exec();
				return order;
			}
			throw new APIError({
				message: 'order does not exist',
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
		return listOrderData(this, query, ALLOWED_FIELDS);
	},

	/**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
	checkDuplicateOrder(error: any) {
		if (error.name === 'MongoError' && error.code === 11000) {
			return new APIError({
				message: 'Validation Error',
				errors: [
					{
						field: 'order_code',
						location: 'body',
						messages: [ '"order_code" already exists' ]
					}
				],
				status: httpStatus.CONFLICT,
				isPublic: true,
				stack: error.stack
			});
		}
		return error;
	},

	async updateOrderProducts({ order_id, product }: any) {
		console.log('updateOrderProducts', order_id, product);
		if (order_id == undefined) {
			throw new APIError({
				message: 'order_id not missing',
				status: httpStatus.NOT_FOUND
			});
		}

		const order = await this.findById(order_id);

		if (order) {
			if (product) {
				const order_product = await OrderProducts.createOrderProduct({
					order_id: order_id,
					product_id: product.id,
					quantity: product.quantity,
					alias: product.alias,
					price: product.price,
					note: product.note
				});
				return order_product;
			} else {
				throw new APIError({
					message: 'product not exist',
					status: httpStatus.NOT_FOUND
				});
			}
		} else {
			throw new APIError({
				message: 'order not exist',
				status: httpStatus.NOT_FOUND
			});
		}
	},

	async updateProductsOfOrder({ id, products }: any) {
		console.log('updateProductsOfOrder', products);
		const order = await this.findById(id);
		if (order) {
			if (products) {
				var orderProducts = [];
				for (var i = 0; i < products.length; i++) {
					let product = await ImportProduct.findOne({ _id: { $eq: products[i].id } });
					if (product && products[i].id) {
						product.price = products[i].price;
						product.alias = products[i].alias;
						product.quantity = products[i].quantity;
						const _orderPrds = await this.updateOrderProducts({ order_id: order.id, product: product });
						// updated_order.save();
						orderProducts.push(_orderPrds);
					} else {
						throw new APIError({
							message: 'product not exist',
							status: httpStatus.NOT_FOUND
						});
					}
				}
				order.productDetail = orderProducts;
				console.log('order productDetail', order);
			}
			return order.save();
		} else {
			throw new APIError({
				message: 'order not exist',
				status: httpStatus.NOT_FOUND
			});
		}
	},

	async createOrder({
		id,
		order_code,
		order_name,
		order_email,
		owner_id,
		supplier_id,
		delivery_address,
		delivery_time,
		delivery_time_str,
		note,
		productIDs
	}: any) {
		console.log('createOrder', owner_id, supplier_id);
		const _supplier = await SupplierAccount.findById(supplier_id);
		if (_supplier == null) {
			throw new APIError({
				message: 'supplier does not exist',
				status: httpStatus.NOT_FOUND
			});
		}

		const product = await ImportProduct.findById(productIDs);
		// if(product == null){
		//    throw new APIError({
		//     message: 'product does not exist',
		//     status: httpStatus.NOT_FOUND
		//   });
		//
		// }
		const order = await this.findOne({ order_code: { $eq: order_code } });
		if (order) {
			throw new APIError({
				message: 'order code exist',
				status: httpStatus.FORBIDDEN
			});
			// if (!order.customer) {
			//   order.customer = customer;
			// }
			// if (!order.delivery_address) {
			//   order.delivery_address = delivery_address;
			// }
			// if (!order.delivery_time) {
			//   order.delivery_time = delivery_time;
			// }
			// if (!order.note) {
			//   order.note = note;
			// }
			//
			// if (!order.productIds) {
			//   order.productIds = productIds;
			// }
			// return order.save();
		}
		let supplier = _supplier._id;
		var owner = owner_id;
		return this.create({
			_id: new mongoose.Types.ObjectId(),
			order_code,
			order_name,
			order_email,
			supplier,
			owner,
			delivery_address,
			delivery_time,
			delivery_time_str,
			note
		});
	},

	async createOrderForImport({
		id,
		order_code,
		order_name,
		customer_name,
		customer_code,
		order_email,
		delivery_address,
		delivery_time,
		delivery_time_str,
		sale_force,
		hotline_deli,
		email,
		cc_email,
		note
	}: any) {
		var owner = await SupplierAccount.findOne({
			$and: [ { name: { $eq: customer_name } }, { type: { $eq: 'store' } } ]
		});
		if (owner == null) {
			throw new APIError({
				message: 'customer does not exist',
				status: httpStatus.NOT_FOUND
			});
		} else {
			owner.code = customer_code;
			owner = await owner.save();
		}
		var supplier = await SupplierAccount.findOne({
			$and: [ { sale_force: { $eq: sale_force } }, { type: { $eq: 'supplier' } } ]
		});
		console.log('customer_name', customer_name, sale_force, owner, supplier);
		if (supplier == null) {
			supplier = await SupplierAccount.createSupplier({
				name: '',
				phone: '',
				address: '',
				ma_so_thue: '',
				type: 'supplier',
				sale_force: sale_force,
				hotline_deli: hotline_deli,
				email: email,
				cc_email: cc_email,
				note: note
			});
		} else {
		}

		// const product = await ImportProduct.findById(productIDs);
		// if(product == null){
		//    throw new APIError({
		//     message: 'product does not exist',
		//     status: httpStatus.NOT_FOUND
		//   });
		//
		// }
		const order = await this.findOne({ order_code: { $eq: order_code } });
		if (order) {
			// throw new APIError({
			// 	message: 'order code exist',
			// 	status: httpStatus.FORBIDDEN
			// });
			if (!owner) {
				order.owner = owner;
			}
			if (!supplier) {
				order.supplier = supplier;
			}
			if (!delivery_address) {
				order.delivery_address = delivery_address;
			}
			if (!delivery_time) {
				order.delivery_time = delivery_time;
			}
			if (!note) {
				order.note = note;
			}
			if (!order_name) {
				order.order_name = order_name;
			}
			if (!order_email) {
				order.order_email = order_email;
			}

			// if (!order.productIds) {
			//   order.productIds = productIds;
			// }
			return order.save();
		}

		var owner_id = owner._id;
		var supplier_id = supplier._id;
		return this.create({
			_id: new mongoose.Types.ObjectId(),
			order_code,
			order_name,
			order_email,
			supplier: supplier_id,
			owner: owner_id,
			delivery_address,
			delivery_time,
			delivery_time_str,
			note
		});
	},
	async updateOrder({
		id,
		order_code,
		order_name,
		order_email,
		customer_id,
		delivery_address,
		delivery_time,
		delivery_time_str,
		sale_force,
		hotline_deli,
		email,
		cc_email,
		note,
		productIDs
	}: any) {
		console.log('updateOrder');
		const customer = await User.findById(customer_id);
		if (customer == null) {
			throw new APIError({
				message: 'customer does not exist',
				status: httpStatus.NOT_FOUND
			});
		}

		const product = await ImportProduct.findById(productIDs);
		// if(product == null){
		//    throw new APIError({
		//     message: 'product does not exist',
		//     status: httpStatus.NOT_FOUND
		//   });
		//
		// }
		const order = await this.findOne({ order_code: { $eq: order_code } });
		if (order) {
			if (customer) {
				order.customer = customer;
			}
			if (order_code) {
				order.order_code = order_code;
			}
			if (order_name) {
				order.order_name = order_name;
			}
			if (order_email) {
				order.order_email = order_email;
			}
			if (delivery_address) {
				order.delivery_address = delivery_address;
			}
			if (delivery_time) {
				order.delivery_time = delivery_time;
			}
			if (delivery_time_str) {
				order.delivery_time = delivery_time_str;
			}
			if (note) {
				order.note = note;
			}

			return order.save();
		} else {
			throw new APIError({
				message: 'order not exist',
				status: httpStatus.NOT_FOUND
			});
		}
	},
	async count() {
		return this.find().count();
	}
};

/**
 * @typedef Product
 */
const ImportOrder = mongoose.model('ImportOrder', importOrderSchema);
ImportOrder.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports = ImportOrder;
