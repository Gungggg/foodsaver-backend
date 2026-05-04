const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/authenticate');

const authorizeRole = require('../../middleware/authorizeRole');

const {
    createOrder,
    getMyOrders,
    getOrderById,
    redeemOrder
} = require('./order.controller');

router.post(
    '/',
    authenticate,
    authorizeRole('customer'),
    createOrder
);

router.post(
    '/:id/redeem',
    authenticate,
    authorizeRole('merchant'),
    redeemOrder
);

router.get(
    '/my-orders',
    authenticate,
    authorizeRole('customer'),
    getMyOrders
);

router.get(
    '/:id',
    authenticate,
    authorizeRole('customer'),
    getOrderById
);

module.exports = router;