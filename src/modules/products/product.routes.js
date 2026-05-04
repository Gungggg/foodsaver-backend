const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/authenticate');

const authorizeRole = require('../../middleware/authorizeRole');

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateStock,
    deleteProduct
} = require('./product.controller');

router.post(
    '/',
    authenticate,
    authorizeRole('merchant'),
    createProduct
);

router.get('/', getAllProducts);

router.get('/:id', getProductById);

router.patch(
    '/:id/stock',
    authenticate,
    authorizeRole('merchant'),
    updateStock
);

router.delete(
    '/:id',
    authenticate,
    authorizeRole('merchant'),
    deleteProduct
);

module.exports = router;