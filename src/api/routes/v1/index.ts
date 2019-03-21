export {};
import * as express from 'express';
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const uploadRoutes = require('./upload.route');
const productRoutes = require('./product.route');
const orderRoutes = require('./order.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);

router.use('/orders', orderRoutes);

router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
