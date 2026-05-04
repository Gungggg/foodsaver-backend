const express = require('express');

const router = express.Router();

const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

router.get(
    '/merchant-only',
    authenticate,
    authorizeRole('merchant'),
    (req, res) => {

        res.json({
            message: 'Welcome Merchant'
        });

    }
);

router.get(
    '/admin-only',
    authenticate,
    authorizeRole('admin'),
    (req, res) => {

        res.json({
            message: 'Welcome Admin'
        });

    }
);

module.exports = router;