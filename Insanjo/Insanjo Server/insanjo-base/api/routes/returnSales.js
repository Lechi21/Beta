// Importing Express
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ReturnSales = require('../models/returnSales');
const Sales = require('../models/sales');  // Updated from Order to Sales
const Product = require('../models/product');

// Handle incoming GET request for return sales
router.get('/', async (req, res) => {
    try {
        const returns = await ReturnSales
        .find()
        .populate('product', 'name')
        .populate('saleId', 'saleDate');
        res.status(200).json({
            count: returns.length,
            returns,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Handle incoming POST request for Sales returns
// Handle incoming POST request for Sales returns
router.post('/', async (req, res, next) => {
    const { productId, returnQuantity, saleId, notes } = req.body;

    if (!productId || !returnQuantity || returnQuantity <= 0 || !saleId) {
        return res.status(400).json({ message: 'Invalid return item details.' });
    }

    try {
        // Find the sale by ID
        const sale = await Sales.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Find the specific item in the sale by product ID
        const returnItem = sale.items.find(item => item.product.toString() === productId);
        if (!returnItem) {
            return res.status(400).json({ message: 'Product not found in the sale.' });
        }

        // Calculate the remaining returnable quantity
        const remainingReturnableQuantity = returnItem.quantity - (returnItem.returnedQuantity || 0);
        if (returnQuantity > remainingReturnableQuantity) {
            return res.status(400).json({ 
                message: `Cannot return ${returnQuantity}. Only ${remainingReturnableQuantity} items are available for return.` 
            });
        }

        // Update the returned quantity in the sale item
        returnItem.returnedQuantity = (returnItem.returnedQuantity || 0) + returnQuantity;
        await sale.save();

        // Update the product's stock
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error(`Product not found for ID: ${productId}`);
        }
        product.availableStock += returnQuantity;
        await product.save();

        // Create a new ReturnSales record
        const returnSale = new ReturnSales({
            _id: new mongoose.Types.ObjectId(),
            saleId: saleId,
            product: productId,
            quantity: returnQuantity,
            totalAmount: returnItem.price * returnQuantity, // Calculate total amount based on price and quantity
            price: returnItem.price,  // Use the price of the sold item
            name: returnItem.name,     // Use the name of the sold item
            note: notes,
        });
        await returnSale.save(); // Save the return sale record

        // Send a success response with the return sale details
        res.status(201).json({
            message: 'Return processed successfully',
            returnSale,
        });
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            return res.status(500).json({ error: err.message });
        }
    }
});

// Get returns by Sales ID
router.get('/:returnsId', async (req, res) => {
    try {
        const returns = await ReturnSales.findById(req.params.returnsId)
            .populate('product', 'name')
            .populate('saleId', 'saleDate');
        
        if (!returns) {
            return res.status(404).json({ message: 'Return sale not found.' });
        }

        res.status(200).json({
            returns
        });
    } catch (error) {
        console.error("Error fetching return sale:", error); // Add this line to log the error
        res.status(500).json({ error: error.message });
    }
});

// Handle DELETE request for a specific return sale
router.delete('/:returnsId', async (req, res) => {
    try {
        const returnSale = await ReturnSales.findById(req.params.returnsId); // Note the parameter here
        if (!returnSale) {
            return res.status(404).json({ message: 'Return sale not found' });
        }

        await returnSale.deleteOne(); // Remove the return sale
        res.status(200).json({ message: 'Return sale deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;