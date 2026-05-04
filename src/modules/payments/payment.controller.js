const db = require('../../config/db');

const { v4: uuidv4 } = require('uuid');

exports.createPayment = (req, res) => {

    try {

        const {
            invoice_id,
            method
        } = req.body;

        // cek invoice
        const invoiceQuery = `
      SELECT *
      FROM invoices
      WHERE id = ?
    `;

        db.query(invoiceQuery, [invoice_id], (err, invoiceResults) => {

            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (invoiceResults.length === 0) {

                return res.status(404).json({
                    message: 'Invoice not found'
                });

            }

            const invoice = invoiceResults[0];

            // generate payment
            const paymentId = uuidv4();

            const transactionId =
                'TRX-' + Date.now();

            const insertQuery = `
        INSERT INTO payments
        (
          id,
          invoice_id,
          transaction_id,
          method,
          amount
        )
        VALUES (?, ?, ?, ?, ?)
      `;

            db.query(
                insertQuery,
                [
                    paymentId,
                    invoice_id,
                    transactionId,
                    method,
                    invoice.amount
                ],
                (err) => {

                    if (err) {

                        return res.status(500).json({
                            message: 'Payment creation failed',
                            error: err
                        });

                    }

                    return res.status(201).json({
                        message: 'Payment created',
                        data: {
                            payment_id: paymentId,
                            transaction_id: transactionId,
                            payment_url:
                                'https://sandbox-payment.com/pay/' +
                                transactionId
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

exports.paymentCallback = (req, res) => {

    try {

        const {
            transaction_id,
            status
        } = req.body;

        // cek payment
        const paymentQuery = `
      SELECT *
      FROM payments
      WHERE transaction_id = ?
    `;

        db.query(paymentQuery, [transaction_id], (err, paymentResults) => {

            if (err) {

                return res.status(500).json({
                    message: 'Database error'
                });

            }

            if (paymentResults.length === 0) {

                return res.status(404).json({
                    message: 'Payment not found'
                });

            }

            const payment = paymentResults[0];

            // update payment
            const updatePaymentQuery = `
        UPDATE payments
        SET
          status = ?,
          paid_at = NOW()
        WHERE transaction_id = ?
      `;

            db.query(
                updatePaymentQuery,
                [status, transaction_id],
                (err) => {

                    if (err) {

                        return res.status(500).json({
                            message: 'Payment update failed'
                        });

                    }

                    // update invoice
                    const updateInvoiceQuery = `
            UPDATE invoices
            SET status = ?
            WHERE id = ?
          `;

                    db.query(
                        updateInvoiceQuery,
                        [status, payment.invoice_id],
                        (err) => {

                            if (err) {

                                return res.status(500).json({
                                    message: 'Invoice update failed'
                                });

                            }

                            // update order
                            const updateOrderQuery = `
                UPDATE orders
                SET status = 'paid'
                WHERE id = (
                  SELECT order_id
                  FROM invoices
                  WHERE id = ?
                )
              `;

                            db.query(
                                updateOrderQuery,
                                [payment.invoice_id],
                                (err) => {

                                    if (err) {

                                        return res.status(500).json({
                                            message: 'Order update failed'
                                        });

                                    }

                                    return res.status(200).json({
                                        message: 'Payment callback success'
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

exports.getPaymentById = (req, res) => {

    try {

        const { id } = req.params;

        const query = `
      SELECT *
      FROM payments
      WHERE id = ?
    `;

        db.query(query, [id], (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: 'Database error'
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: 'Payment not found'
                });

            }

            return res.status(200).json({
                message: 'Payment fetched',
                data: results[0]
            });

        });

    } catch (error) {

        return res.status(500).json({
            message: 'Server error'
        });

    }

};