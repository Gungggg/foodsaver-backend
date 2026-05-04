const jwt = require('jsonwebtoken');

require('dotenv').config();

module.exports = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        // cek apakah token ada
        if (!authHeader) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        // format Bearer token
        const token = authHeader.split(' ')[1];

        // verifikasi token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // simpan user ke request
        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: 'Invalid token'
        });

    }

};