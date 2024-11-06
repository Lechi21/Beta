// Importing Express
const express = require('express');
const linkage = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/product');
require('dotenv').config();

// Configure Multer for file uploads
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'inventory_images', // Cloudinary folder for images
        allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed image formats
    },
});

const fileFilter = (req, file, cb) => {
    // Conditions for rejecting a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Only .jpeg and .png files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1 // 1MB file size limit
    },
    fileFilter: fileFilter
});

// Handle incoming GET request for all products with pagination
linkage.get('/', (req, res, next) => {
    const limit = parseInt(req.query.limit) || 7; // Default limit
    const skip = parseInt(req.query.skip) || 0; // Default skip
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : ''; // Search term
    const filterValue = req.query.filter || ''; // Filter term

    // Build search criteria based on search and filter
    const searchCriteria = {
        $and: [
            {
                $or: [
                    { name: new RegExp(searchQuery, 'i') }, // Case-insensitive search for name
                    { description: new RegExp(searchQuery, 'i') } // Case-insensitive search for description
                ]
            },
            filterValue ? { availableStock: filterValue } : {} // Apply filter if it exists
        ]
    };

    // Count total number of products that match the search criteria
    Product.countDocuments(searchCriteria).exec()
        .then(totalCount => {
            // Fetch the products with pagination based on search criteria
            return Product.find(searchCriteria)
                .select('name description availableStock purchasePrice sellingPrice stockDate productImage _id')
                .limit(limit) // Limit the number of results
                .skip(skip)   // Skip a certain number of results for pagination
                .exec()
                .then(docs => {
                    const response = {
                        count: docs.length,
                        products: docs.map(doc => ({
                            name: doc.name,
                            description: doc.description,
                            availableStock: doc.availableStock,
                            purchasePrice: doc.purchasePrice,
                            sellingPrice: doc.sellingPrice,
                            stockDate: doc.stockDate,
                            productImage: cloudinary.url(doc.productImage, {
                                fetch_format: 'auto',  // Automatically choose format
                                quality: 'auto',
                                transformation: [
                                    { width: 500, height: 500, crop: 'fill' }
                                ]
                            }),                            
                            _id: doc._id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/product/' + doc._id
                            }
                        })),
                        totalCount: totalCount // Accurate total count for navigation
                    };
                    res.status(200).json(response);
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err.message
            });
        });
});

// Handle incoming GET request for all products based on search
linkage.get('/search', (req, res, next) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : ''; // Search term

    // Build search criteria based on search
    const searchCriteria = {
        $or: [
            { name: new RegExp(searchQuery, 'i') }, // Case-insensitive search for name
            { description: new RegExp(searchQuery, 'i') } // Case-insensitive search for description
        ]
    };

    // Fetch all products matching the search criteria
    Product.find(searchCriteria)
        .select('name description availableStock purchasePrice sellingPrice stockDate productImage _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => ({
                    name: doc.name,
                    description: doc.description,
                    availableStock: doc.availableStock,
                    purchasePrice: doc.purchasePrice,
                    sellingPrice: doc.sellingPrice,
                    stockDate: doc.stockDate,
                    productImage: cloudinary.url(doc.productImage, {
                        fetch_format: 'auto',  // Automatically choose format
                        quality: 'auto',        // Automatically choose quality
                        transformation: [
                            { width: 500, height: 500, crop: 'fill' }
                        ]
                    }),
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/product/' + doc._id
                    }
                }))
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

// Handle incoming POST request/Products
linkage.post('/', upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        availableStock: req.body.availableStock,
        purchasePrice: req.body.purchasePrice,
        sellingPrice: req.body.sellingPrice,
        stockDate: req.body.stockDate,
        productImage: req.file.path
    });

    product.save()
        .then(result => {
            res.status(201).json({
                message: 'Product Created',
                createdProduct: {
                    name: result.name,
                    description: result.description,
                    availableStock: result.availableStock,
                    purchasePrice: result.purchasePrice,
                    sellingPrice: result.sellingPrice,
                    stockDate: result.stockDate,
                    _id: result._id,
                    productImage: result.productImage,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/product/" + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err.message
            });
        });
});

// Endpoint for Individual Products
linkage.get('/:productId', (req, res, next) => {
    res.set('Cache-Control', 'no-store');  // Prevents caching
    const id = req.params.productId;

    Product.findById(id)
        .select('name description availableStock purchasePrice sellingPrice stockDate productImage _id')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    product: {
                        name: doc.name,
                        description: doc.description,
                        availableStock: doc.availableStock,
                        purchasePrice: doc.purchasePrice,
                        sellingPrice: doc.sellingPrice,
                        stockDate: doc.stockDate,
                        productImage: cloudinary.url(doc.productImage, {
                            fetch_format: 'auto',  // Automatically choose format
                            quality: 'auto',        // Automatically choose quality
                            transformation: [
                                { width: 500, height: 500, crop: 'fill' }
                            ]
                        }),                        
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            description: 'Get all products',
                            url: 'http://localhost:3000/product/'
                        }
                    }
                });
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err.message
            });
        });
});


// Handle incoming PATCH request/ProductsId with Image Upload
linkage.patch('/:productId', upload.single('productImage'), (req, res, next) => {
    const id = req.params.productId;
    const updates = {};

    for (const [key, value] of Object.entries(req.body)) {
        updates[key] = value;
    }

    // Ensure availableStock is updated correctly
    if (req.body.availableStock !== undefined) {
        updates.availableStock = req.body.availableStock; // Only update availableStock if it exists in the body
    }

    // If there's a file uploaded, add it to the update
    if (req.file) {
        updates.productImage = req.file.path;
    }     

    // Proceed to update the product in the database
    Product.updateOne({ _id: id }, { $set: updates })
        .exec()
        .then(result => {
            if (result.nModified === 0) {
                return res.status(404).json({
                    message: 'No product found to update',
                });
            }
            res.status(200).json({
                message: 'Product Updated Successfully',
                updatedFields: updates, // Show what was updated
                request: {
                    type: 'GET',
                    description: 'Get updated product details',
                    url: 'http://localhost:3000/product/' + id
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err.message
            });
        });
});


// Handle incoming DELETE request/ProductsId
linkage.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/product/',
                    body: {
                        name: 'String',
                        description: 'String',
                        availableStock: 'Number',
                        purchasePrice: 'Number',
                        sellingPrice: 'Number',
                        stockDate: 'Date',
                        productImage: 'String'
                    }
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err.message
            });
        });
});

module.exports = linkage;
