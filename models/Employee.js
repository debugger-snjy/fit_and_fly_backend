const mongoose = require('mongoose');

// Defining the Schema for the Employee
const EmployeeSchema = new mongoose.Schema({

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
    employeeId : {
        type : Number,
        required : true,
        unique : true
    },
    designation : {
        type : "String",
        required : true,
        default : "Employee"
    }

});

// Exporting the model: 
// model takes a name and the schema

const Employee = mongoose.model("employee", EmployeeSchema);
// Employee.createIndexes() // used to create indexes and don't save duplicates records
// To avoid creating 2 indexes, we will remove this and we will verfiy the duplicate Employee in the code itself (auth.js)
module.exports = Employee;