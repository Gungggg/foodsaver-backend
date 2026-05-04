module.exports = (...allowedRoles) => {

    return (req, res, next) => {

        const userRole = req.user.role;

        // cek role
        if (!allowedRoles.includes(userRole)) {

            return res.status(403).json({
                message: 'Forbidden access'
            });

        }

        next();

    };

};