const db = require('../../config/db');

const { v4: uuidv4 } = require('uuid');

exports.createOrder = (req, res) => {

    try {

        const userId = req.user.id;

        const {
            bag_id,
            quantity
        } = req.body;

        // cek produk
        const productQuery = `
      SELECT * FROM surprise_bags
      WHERE id = ?
    `;

        db.query(productQuery, [bag_id], (err, productResults) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (productResults.length === 0) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            const product = productResults[0];

            // cek stok
            if (product.stock < quantity) {

                return res.status(400).json({
                    message: 'Insufficient stock'
                });

            }

            // hitung total
            const totalAmount =
                product.discount_price * quantity;

            // generate id
            const orderId = uuidv4();

            // pickup code
            const pickupCode =
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();

            // insert order
            const insertOrderQuery = `
        INSERT INTO orders
        (
          id,
          user_id,
          bag_id,
          quantity,
          total_amount,
          pickup_code
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

            db.query(
                insertOrderQuery,
                [
                    orderId,
                    userId,
                    bag_id,
                    quantity,
                    totalAmount,
                    pickupCode
                ],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            message: 'Order creation failed',
                            error: err
                        });
                    }

                    // buat invoice
                    const invoiceId = uuidv4();

                    const invoiceQuery = `
            INSERT INTO invoices
            (
              id,
              order_id,
              amount
            )
            VALUES (?, ?, ?)
          `;

                    db.query(
                        invoiceQuery,
                        [
                            invoiceId,
                            orderId,
                            totalAmount
                        ],
                        (err) => {

                            if (err) {
                                return res.status(500).json({
                                    message: 'Invoice creation failed'
                                });
                            }

                            // update stok
                            const updateStockQuery = `
                UPDATE surprise_bags
                SET stock = stock - ?
                WHERE id = ?
              `;

                            db.query(
                                updateStockQuery,
                                [quantity, bag_id],
                                (err) => {

                                    if (err) {
                                        return res.status(500).json({
                                            message: 'Stock update failed'
                                        });
                                    }

                                    return res.status(201).json({
                                        message: 'Order created',
                                        data: {
                                            order_id: orderId,
                                            invoice_id: invoiceId,
                                            total_amount: totalAmount,
                                            pickup_code: pickupCode
                                        }
                                    });

                                }
                            );

                        }
                    );

                }
            );

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};

exports.getMyOrders = (req, res) => {

    try {

        const userId = req.user.id;

        const query = `
      SELECT
        orders.*,
        surprise_bags.name AS product_name
      FROM orders
      JOIN surprise_bags
      ON orders.bag_id = surprise_bags.id
      WHERE orders.user_id = ?
      ORDER BY orders.created_at DESC
    `;

        db.query(query, [userId], (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            return res.status(200).json({
                message: 'Orders fetched',
                data: results
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};

exports.getOrderById = (req, res) => {

    try {

        const userId = req.user.id;

        const { id } = req.params;

        const query = `
      SELECT *
      FROM orders
      WHERE id = ?
      AND user_id = ?
    `;

        db.query(query, [id, userId], (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }

            return res.status(200).json({
                message: 'Order fetched',
                data: results[0]
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};

exports.redeemOrder = (req, res) => {

    try {

        const { id } = req.params;

        const { pickup_code } = req.body;

        // cek order
        const orderQuery = `
      SELECT *
      FROM orders
      WHERE id = ?
    `;

        db.query(orderQuery, [id], (err, orderResults) => {

            if (err) {

                return res.status(500).json({
                    message: 'Database error'
                });

            }

            if (orderResults.length === 0) {

                return res.status(404).json({
                    message: 'Order not found'
                });

            }

            const order = orderResults[0];

            // harus sudah paid
            if (order.status !== 'paid') {

                return res.status(400).json({
                    message: 'Order is not paid yet'
                });

            }

            // cek pickup code
            if (order.pickup_code !== pickup_code) {

                return res.status(400).json({
                    message: 'Invalid pickup code'
                });

            }

            // update order
            const updateQuery = `
        UPDATE orders
        SET status = 'picked_up'
        WHERE id = ?
      `;

            db.query(updateQuery, [id], (err) => {

                if (err) {

                    return res.status(500).json({
                        message: 'Redeem failed'
                    });

                }

                // generate impact log
                const impactId = uuidv4();

                const co2Saved = 2.5;

                const moneySaved =
                    order.total_amount;

                const impactQuery = `
          INSERT INTO impact_logs
          (
            id,
            order_id,
            user_id,
            co2_saved,
            money_saved
          )
          VALUES (?, ?, ?, ?, ?)
        `;

                db.query(
                    impactQuery,
                    [
                        impactId,
                        order.id,
                        order.user_id,
                        co2Saved,
                        moneySaved
                    ],
                    (err) => {

                        if (err) {

                            return res.status(500).json({
                                message: 'Impact log failed'
                            });

                        }

                        return res.status(200).json({
                            message: 'Order redeemed successfully',
                            data: {
                                impact_log_id: impactId,
                                co2_saved: co2Saved,
                                money_saved: moneySaved
                            }
                        });

                    }
                );

            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};