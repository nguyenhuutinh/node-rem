export {};
import * as express from 'express';
import { apiJson } from 'api/utils/Utils';

const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const uploadRoutes = require('./upload.route');
const importProductRoutes = require('./importProduct.route');
const saleProductRoutes = require('./saleProduct.route');
const importOrderRoutes = require('./importOrder.route');
const saleOrderRoutes = require('./saleOrder.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res, next) => {
  apiJson({ req, res, data: { status: 'OK' } });
  return next();
});

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);

router.use('/import/orders', importOrderRoutes);
router.use('/sale/orders', saleOrderRoutes);
router.use('/sale/products', saleProductRoutes);
router.use('/import/products', importProductRoutes);

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
