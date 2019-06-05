export {};
import { NextFunction, Request, Response } from 'express';
const XLSX = require('xlsx');
import { apiJson } from 'api/utils/Utils';
const httpStatus = require('http-status');
import { ImportOrder, ImportProduct } from 'api/models';
const mongoose = require('mongoose');
exports.upload = async (req: any, res: Response, next: NextFunction) => {
	try {
		var wb = XLSX.readFile(req.file.path);
		var sheet_name_list = wb.SheetNames;

		var worksheet = wb.Sheets[sheet_name_list[0]];
		var customer_name = worksheet['B2'].v;
		var customer_code = worksheet['B3'].v;
		var order_code = Math.floor(Math.random() * 10000) + 1;
		var order_name = worksheet['B4'].v;
		var order_email = worksheet['B5'].v;
		var delivery_address = worksheet['B6'].v;
		var delivery_time_str = worksheet['B7'].v;
		var sale_force = worksheet['B8'].v;
		var hotline_deli = worksheet['B9'].v;
		var email = worksheet['B10'].v;
		var cc_email = worksheet['B11'].v + ',' + (worksheet['B12'] ? worksheet['B12'].v : '');
		var note = worksheet['B13'].v;
		var id = new mongoose.Types.ObjectId();
		var delivery_time = new Date();

		// processing product
		var productList = [];
		for (var i = 15; i < 100; i++) {
			var product_key = worksheet[`A` + i];
			var code = worksheet[`B` + i];
			// console.log("aaa", code)
			var prd_code;
			if (code == undefined || code.v.length == 0) {
				break;
			} else {
				prd_code = (product_key ? product_key.v : '') + code.v;
			}
			var alias = worksheet[`C` + i] ? worksheet[`C` + i].v : '';
			var dvt = worksheet[`D` + i] ? worksheet[`D` + i].v : 'kg';
			var quantity = worksheet[`E` + i] ? worksheet[`E` + i].v : 1;
			var note = worksheet[`F` + i] ? worksheet[`F` + i].v : '';
			console.log('prod', prd_code, alias, quantity, note);
			var name = alias;
			var product = await ImportProduct.createProduct({ prd_code, name, alias, dvt });
			const savedproduct = await product.save();
			productList.push({ id: savedproduct.id, alias: alias, quantity: quantity, note: note });
		}

		const order = await ImportOrder.createOrderForImport({
			id,
			order_code,
			order_name,
			order_email,
			customer_name,
			customer_code,
			delivery_address,
			delivery_time,
			delivery_time_str,
			sale_force,
			hotline_deli,
			email,
			cc_email,
			note
		});
		const savedOrder = await order.save();

		console.log('productList', productList);
		id = new mongoose.Types.ObjectId();
		var order_product = await ImportOrder.updateProductsOfOrder({ id: order.id, products: productList });
		res.status(httpStatus.CREATED);
		res.json(savedOrder.transform());
	} catch (error) {
		return next(error);
	}
};
exports.upload2 = async (req: any, res: Response, next: NextFunction) => {
	try {
		var wb = XLSX.readFile(req.file.path);
		var sheet_name_list = wb.SheetNames;

		var worksheet = wb.Sheets[sheet_name_list[0]];
		var customer_name = worksheet['B2'].v;
		var cus_code = worksheet['B3'].v;
		var order_code = worksheet['B4'].v;
		var order_name = worksheet['B5'].v;
		var cus_email = worksheet['B6'].v;
		var delivery_address = worksheet['B7'].v;
		var delivery_time_str = worksheet['B8'].v;
		var sale_force = worksheet['B9'].v;
		var hotline_deli = worksheet['B10'].v;
		var email = worksheet['B11'].v;
		var cc_email = worksheet['B12'].v + ',' + (worksheet['B13'] ? worksheet['B13'].v : '');
		var note = worksheet['B14'].v;
		var id = new mongoose.Types.ObjectId();
		var delivery_time = new Date();
		const order = await ImportOrder.createOrderForImport({
			id,
			order_code,
			order_name,
			customer_name,
			delivery_address,
			delivery_time,
			delivery_time_str,
			sale_force,
			hotline_deli,
			email,
			cc_email,
			note
		});
		const savedOrder = await order.save();
		var productList = [];
		for (var i = 16; i < 100; i++) {
			var product_key = worksheet[`A` + i];
			var code = worksheet[`B` + i];
			// console.log("aaa", code)
			var prd_code;
			if (code == undefined || code.v.length == 0) {
				break;
			} else {
				prd_code = product_key.v + code.v;
			}
			var name = worksheet[`C` + i].v;
			var dvt = worksheet[`D` + i].v;
			var quantity = worksheet[`E` + i].v;
			var note = worksheet[`F` + i] ? worksheet[`F` + i].v : '';
			console.log('quantity', quantity);
			var product = await ImportProduct.createProduct({ prd_code, name, dvt });
			const savedproduct = await product.save();
			productList.push({ id: savedproduct.id, quantity: quantity, note: note });
		}
		console.log('productList', productList);
		id = new mongoose.Types.ObjectId();
		var order_product = await ImportOrder.updateOrderProductsQuatity({ id: order.id, products: productList });
		res.status(httpStatus.CREATED);
		res.json(savedOrder.transform());
	} catch (error) {
		return next(error);
	}
};
