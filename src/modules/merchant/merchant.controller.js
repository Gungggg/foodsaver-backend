const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

exports.createProfile = (req, res) => {

    try {

        const userId = req.user.id;

        const {
            store_name,
            location,
            pickup_window
        } = req.body;

        // cek profile sudah ada
        const checkQuery = `
      SELECT * FROM merchant_profiles
      WHERE user_id = ?
    `;

        db.query(checkQuery, [userId], (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: 'Merchant profile already exists'
                });
            }

            const id = uuidv4();

            const insertQuery = `
        INSERT INTO merchant_profiles
        (
          id,
          user_id,
          store_name,
          location,
          pickup_window
        )
        VALUES (?, ?, ?, ?, ?)
      `;

            db.query(
                insertQuery,
                [
                    id,
                    userId,
                    store_name,
                    location,
                    pickup_window
                ],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: 'Insert failed',
                            error: err
                        });
                    }

                    return res.status(201).json({
                        message: 'Merchant profile created',
                        data: {
                            merchant_profile_id: id
                        }
                    });

                }
            );

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};

exports.getProfile = (req, res) => {

    try {

        const userId = req.user.id;

        const query = `
      SELECT *
      FROM merchant_profiles
      WHERE user_id = ?
    `;

        db.query(query, [userId], (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Merchant profile not found'
                });
            }

            return res.status(200).json({
                message: 'Merchant profile fetched',
                data: results[0]
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};