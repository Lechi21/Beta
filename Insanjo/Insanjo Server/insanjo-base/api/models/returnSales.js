const mongoose = require('mongoose');

// Define the ReturnSales schema
const returnSalesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sales', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    returnDate: { type: Date, default: Date.now },
    note: { type: String }, // Optional note for the return
});

module.exports = mongoose.model('ReturnSales', returnSalesSchema);
