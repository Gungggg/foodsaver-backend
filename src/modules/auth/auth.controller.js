const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // cek email
        const checkQuery = 'SELECT * FROM users WHERE email = ?';

        db.query(checkQuery, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error',
                    error: err
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: 'Email already used'
                });
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const id = uuidv4();

            const insertQuery = `
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `;

            db.query(
                insertQuery,
                [id, name, email, hashedPassword, role || 'customer'],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            message: 'Insert failed',
                            error: err
                        });
                    }

                    return res.status(201).json({
                        message: 'Register success',
                        data: {
                            user_id: id
                        }
                    });
                }
            );
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error
        });
    }
};

exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        const query = 'SELECT * FROM users WHERE email = ?';

        db.query(query, [email], async (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            const user = results[0];

            // compare password
            const isMatch = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: 'Wrong password'
                });
            }

            // generate token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d'
                }
            );

            return res.status(200).json({
                message: 'Login success',
                token
            });

        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server error'
        });
    }
};

exports.profile = (req, res) => {

    return res.status(200).json({
        message: 'Profile fetched',
        data: req.user
    });

};