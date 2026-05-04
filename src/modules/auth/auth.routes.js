const express = require('express');

const router = express.Router();

const authenticate = require('../../middleware/authenticate');

const {
    register,
    login,
    profile
} = require('./auth.controller');

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authenticate, profile);

module.exports = router;