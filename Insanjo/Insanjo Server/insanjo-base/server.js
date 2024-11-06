// Import 'http' from Node.js
const http = require('http');
const app = require('./app');

// Port Environment Variable in which the server will run
const port = process.env.PORT || 3000;

// Create Server and Add Listener 
const server = http.createServer(app);

server.listen(port);

