const mongoose = require('mongoose');

// Defining the Schema for the Customer
const CustomerSchema = new mongoose.Schema({

    role: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique : true,
    },
    date: {
        type: Date,
        default: () => new Date().toLocaleString(),
        required: true,
    },
    address: {
        type : String,
        required : true
    },
    account_balance: {
        type : Number,
        required : true,
        default : 2024.0
    },
    totalOrders : {
        type : Number,
        required : true,
        default : 0
    }

});

// Exporting the model: 
// model takes a name and the schema

const Customer = mongoose.model("customer", CustomerSchema);
// Customer.createIndexes() // used to create indexes and don't save duplicates records
// To avoid creating 2 indexes, we will remove this and we will verfiy the duplicate Customer in the code itself (auth.js)
module.exports = Customer;