// Importing Express
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ReturnSales = require('../models/returnSales');
const Sales = require('../models/sales');  // Updated from Order to Sales
const Product = require('../models/product');

// Handle incoming GET request/Sales with optional date filter
router.get('/', (req, res, next) => {
    const saleDate = req.query.date ? new Date(req.query.date) : null; // Capture date from query string

    let query = {}; // Default query
    if (saleDate) {
        // If a date is provided, filter sales by this date
        const startOfDay = new Date(saleDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(saleDate.setHours(23, 59, 59, 999));
        query.saleDate = { $gte: startOfDay, $lte: endOfDay };
    }

    Sales.find(query)
        .select('_id items saleDate returns') // Adjust the selection to match the new structure
        .populate('items.product', 'name') // Populate the product name for each item
        .populate('returns.product', 'name') // Populate returns as well
        .exec()
        .then(docs => {
            if (docs.length === 0) {
                return res.status(404).json({
                    message: 'No sales found for the selected date',
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}/sales/`;
            res.status(200).json({
                count: docs.length,
                sales: docs.map(doc => {
                    const itemDetails = doc.items.map(item => ({
                        productId: item.product,
                        name: item.name,
                        quantity: item.quantity,
                        totalAmount: item.totalAmount,
                        price: item.price
                    }));

                    const itemNames = itemDetails.map(item => item.name).join(', ');

                    return {
                        _id: doc._id,
                        items: itemDetails,
                        itemNames: itemNames,
                        totalQuantity: itemDetails.reduce((sum, item) => sum + item.quantity, 0),
                        totalAmount: itemDetails.reduce((sum, item) => sum + item.totalAmount, 0),
                        saleDate: doc.saleDate,
                        request: {
                            type: 'GET',
                            url: `${baseUrl}${doc._id}`
                        }
                    };
                })
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

// GET sales with PAGINATION
router.get('/sales', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page
    const limit = parseInt(req.query.limit) || 5 ; // Items per page
    const skip = (page - 1) * limit; // Calculate items to skip
    const saleDate = req.query.date ? new Date(req.query.date) : null; // Capture date from query string

    try {
        let query = {}; // Default query
        if (saleDate) {
            // If a date is provided, filter sales by this date
            const startOfDay = new Date(saleDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(saleDate.setHours(23, 59, 59, 999));
            query.saleDate = { $gte: startOfDay, $lte: endOfDay };
        }

        const totalSales = await Sales.countDocuments(query); // Get total sales count
        const sales = await Sales.find(query).skip(skip).limit(limit); // Fetch sales with pagination

        res.json({
            sales,
            totalPages: Math.ceil(totalSales / limit), // Total pages
            currentPage: page, // Current page
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sales", error });
    }
});

// Handle incoming POST request for Sales (including returns)
router.post('/', (req, res, next) => {
    const items = req.body.items; // Array of items from the client

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items provided' });
    }

    // Find all products in the cart
    const productPromises = items.map(item => 
        Product.findById(item.productId)
            .then(product => {
                if (!product) {
                    throw new Error(`Product not found for ID: ${item.productId}`);
                }
                // Check if there's enough stock available
                if (product.availableStock < item.quantity) {
                    throw new Error(`Not enough stock for product ID: ${item.productId}. Available: ${product.availableStock}, Requested: ${item.quantity}`);
                }
                return { product, item };
            })
    );

    // Process all the products and save the entire sale as one document
    Promise.all(productPromises)
        .then(productsWithPrices => {
            // Reduce the stock for each product sold
            const updateStockPromises = productsWithPrices.map(({ product, item }) => {
                product.availableStock -= item.quantity; // Reduce available stock
                return product.save(); // Save the updated product
            });

            // After updating stocks, save the sale
            return Promise.all(updateStockPromises)
                .then(() => {
                    const sale = new Sales({
                        _id: new mongoose.Types.ObjectId(),
                        saleDate: new Date(),
                        items: productsWithPrices.map(({ product, item }) => ({
                            product: product._id,
                            name: item.name,
                            quantity: item.quantity,
                            price: product.sellingPrice,
                            totalAmount: item.quantity * product.sellingPrice, // calculate total amount
                            expenses: item.expenses,
                            note: item.note
                        }))
                    });
                    return sale.save();
                });
        })
        .then(result => {
            res.status(201).json({
                message: 'Sale successfully recorded',
                sale: result
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

// Handle incoming PATCH request for Sales
router.patch('/:salesId', (req, res, next) => {
    const salesId = req.params.salesId;
    const updateFields = req.body; // This will contain the fields to be updated

    // Find the sale by ID
    Sales.findById(salesId)
        .then(sale => {
            if (!sale) {
                return res.status(404).json({ message: 'Sale not found' });
            }

            // Update only the fields that are provided
            Object.keys(updateFields).forEach(key => {
                sale[key] = updateFields[key];
            });

            return sale.save(); // Save the updated sale
        })
        .then(updatedSale => {
            res.status(200).json({
                message: 'Sale updated successfully',
                sale: updatedSale
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

// Handle incoming GET request/SalesId
router.get('/:salesId', (req, res, next) => {
    Sales.findById(req.params.salesId)
        .populate('items.product', 'name') // Populate the product name for each item
        .exec()
        .then(sale => {
            if (!sale) {
                return res.status(404).json({
                    message: 'Sale not found'
                });
            }
            res.status(200).json({
                sale: sale,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/sales',
                    body: { productId: "ID", quantity: "Number" }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

// Handle DELETE request/SalesId
router.delete('/:salesId', (req, res, next) => {
    Sales.deleteOne({ _id: req.params.salesId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Sale deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/sales',
                    body: { productId: "ID", quantity: "Number" }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;