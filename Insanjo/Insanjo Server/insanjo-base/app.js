// It's Spinning UP Express Application and Make Handling Files Easy
const express = require('express');
const path = require('path'); // Importing path for serving frontend files
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'inventory_images',
        allowedFormats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

const productRoutes = require('./api/routes/product');
const orderRoutes = require('./api/routes/sales');
const returnRoutes = require('./api/routes/returnSales')

mongoose.connect("mongodb+srv://Node-rest:" + process.env.MONGO_ATLAS_PW + "@node-rest-shop.gqk8ymz.mongodb.net/?retryWrites=true&w=majority&appName=node-rest-shop"
    , {
        useNewUrlParser: true,
        useUnifiedTopology: true
})
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
// app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Handling CORS error
// Appending the Headers/Routes to any Data we sent Back
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../Insanjo-frontend')));

// API ROUTES
app.use('/product', productRoutes);
app.use('/sales', orderRoutes);
app.use('/returnSales', returnRoutes);

// Handle all unknown routes and redirect to index.html (for SPA behavior, if needed)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Insanjo-frontend', 'index.html'));
});

//Handling Errors Routes
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
            }
    })
})


module.exports = app;