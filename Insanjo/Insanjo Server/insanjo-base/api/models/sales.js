const mongoose = require('mongoose');

// Define the Sales schema
const salesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        expenses: { type: Number, default: 0 }, // Field for expenses
        note: { type: String },
        returnedQuantity: { type: Number, default: 0 }  // Track returned items
    }],
    returns: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        returnDate: { type: Date, default: Date.now },
        note: { type: String } // Optional note for the return
    }],
    saleDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sales', salesSchema);
