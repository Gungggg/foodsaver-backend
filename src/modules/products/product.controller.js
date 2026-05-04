const db = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

exports.createProduct = (req, res) => {

    try {

        const userId = req.user.id;

        const {
            name,
            description,
            original_price,
            discount_price,
            stock,
            available_until
        } = req.body;

        // ambil merchant profile
        const merchantQuery = `
      SELECT * FROM merchant_profiles
      WHERE user_id = ?
    `;

        db.query(merchantQuery, [userId], (err, merchantResults) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (merchantResults.length === 0) {
                return res.status(404).json({
                    message: 'Merchant profile not found'
                });
            }

            const merchant = merchantResults[0];

            const productId = uuidv4();

            const insertQuery = `
        INSERT INTO surprise_bags
        (
          id,
          merchant_id,
          name,
          description,
          original_price,
          discount_price,
          stock,
          available_until
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

            db.query(
                insertQuery,
                [
                    productId,
                    merchant.id,
                    name,
                    description,
                    original_price,
                    discount_price,
                    stock,
                    available_until
                ],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: 'Insert failed',
                            error: err
                        });
                    }

                    return res.status(201).json({
                        message: 'Product created',
                        data: {
                            product_id: productId
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

exports.getAllProducts = (req, res) => {

    try {

        const query = `
      SELECT
        surprise_bags.*,
        merchant_profiles.store_name
      FROM surprise_bags
      JOIN merchant_profiles
      ON surprise_bags.merchant_id = merchant_profiles.id
      ORDER BY created_at DESC
    `;

        db.query(query, (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            return res.status(200).json({
                message: 'Products fetched',
                data: results
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};

exports.getProductById = (req, res) => {

    try {

        const { id } = req.params;

        const query = `
      SELECT
        surprise_bags.*,
        merchant_profiles.store_name
      FROM surprise_bags
      JOIN merchant_profiles
      ON surprise_bags.merchant_id = merchant_profiles.id
      WHERE surprise_bags.id = ?
    `;

        db.query(query, [id], (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            return res.status(200).json({
                message: 'Product fetched',
                data: results[0]
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};

exports.updateStock = (req, res) => {

    try {

        const { id } = req.params;

        const { stock } = req.body;

        const query = `
      UPDATE surprise_bags
      SET stock = ?
      WHERE id = ?
    `;

        db.query(query, [stock, id], (err) => {

            if (err) {
                return res.status(500).json({
                    message: 'Update failed'
                });
            }

            return res.status(200).json({
                message: 'Stock updated'
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};

exports.deleteProduct = (req, res) => {

    try {

        const { id } = req.params;

        const query = `
      DELETE FROM surprise_bags
      WHERE id = ?
    `;

        db.query(query, [id], (err) => {

            if (err) {
                return res.status(500).json({
                    message: 'Delete failed'
                });
            }

            return res.status(200).json({
                message: 'Product deleted'
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};