const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/authenticate');

const authorizeRole = require('../../middleware/authorizeRole');

const {
    createProfile,
    getProfile
} = require('./merchant.controller');

router.post(
    '/profile',
    authenticate,
    authorizeRole('merchant'),
    createProfile
);

router.get(
    '/profile',
    authenticate,
    authorizeRole('merchant'),
    getProfile
);

module.exports = router;