// This Modules Folders contains Product Files for MONGOOSE to define how a product will look like in the Application

const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String },
    availableStock: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    stockDate: { type: String },
    productImage: { type: String, required: true }
}, { timestamps: true } // Automatically include createdAt and updatedAt
);

module.exports = mongoose.model('Product', productSchema);