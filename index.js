// It is a Express JS File

// Adding the Express JS Code :
const express = require('express')

// Now, Importing the connectToMongo function from "db.js"
const connectToMongo = require('./db');

// Importing cors package :
const cors = require('cors')
const bodyParser = require('body-parser');
const path = require("path")
const fs = require("fs")

// Checking for the connection
connectToMongo()

const app = express()
// Changing the port number as 3000 port is reserved for react which will make us difficult for us later
const port = 5000

// Adding Middlewares :
app.use(cors()); // Added cors package for removing the cors error
app.use(express.json())  // to view the request body data
app.use(bodyParser.raw({ type: 'application/octet-stream' }));

// Available Routes
// Basic First Route
app.get('/', (req, res) => {
  res.send("Testing the Route - Fit&Fly")
})

// Route for api Authentication
app.use('/api/auth', require("./routes/auth"))

// Route for all Operations by Admin
app.use('/api/admin', require("./routes/admin"))

// Route for all Operations by Customers
app.use('/api/customer', require("./routes/customer"))

// Route for all Operations by Employee
app.use('/api/employee', require("./routes/employee"))

// Listening to the port
app.listen(port, () => {
  console.log(`Fit & Fly app listening on port ${port}`)
})