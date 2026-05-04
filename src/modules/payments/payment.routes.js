const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/authenticate');

const authorizeRole = require('../../middleware/authorizeRole');

const {
    createPayment,
    paymentCallback,
    getPaymentById
} = require('./payment.controller');

router.post(
    '/',
    authenticate,
    authorizeRole('customer'),
    createPayment
);

router.post(
    '/callback',
    paymentCallback
);

router.get(
    '/:id',
    authenticate,
    authorizeRole('customer'),
    getPaymentById
);

module.exports = router;