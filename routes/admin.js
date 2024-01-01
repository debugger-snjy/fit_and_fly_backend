// This file is used for Operations by Admin

// Importing the express Package
const express = require('express');

// Create a router of the express
const router = express.Router()

// Importing the express-validator
const { body, validationResult } = require('express-validator');

// Importing the Models : 

// Importing the Admin schema from Admin Mongoose Model
const Admin = require("../models/Admin");

// Importing the Customer schema from Customer Mongoose Model
const Customer = require("../models/Customer");

// Importing the Employee schema from Employee Mongoose Model
const Employee = require("../models/Employee");

const { MongoClient } = require('mongodb');
const Items = require('../models/Items');
const Categories = require('../models/Category');

// Getting the Middle ware
const fetchUser = require('../middleware/fetchUserId');
const Transactions = require('../models/Transaction');

const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Orders = require('../models/Orders');

// Module to use the Mailing Services
const nodemailer = require("nodemailer")


// Function to Send a Mail : 
const sendMailFromAccount = async (userEmail, subjectData, bodyData) => {

    try {

        // Creating the transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fitandfly.sanjay@gmail.com',
                pass: process.env.MAIL_PASSKEY,
            },
        });

        await transporter.sendMail({
            from: "fitandfly.sanjay@gmail.com",
            to: userEmail,
            subject: subjectData,
            html: bodyData,
            attachments: [{
                filename: 'Fit&Fly.png',
                path: '../Fit&Fly.png',
                cid: 'fit&flylogo2023' //same cid value as in the html img src
            }]
        });

        // TODO : Make Alert Message of the Transaction

        return true
    } catch (error) {
        console.error('Error sending email:', error);
        return false

    }

}


// Function to check whether the Uploaded File is a Image or not :
function isImageFile(filePath) {
    const ext = path.extname(filePath);

    // Check if the file extension is .xlsx (case-insensitive)
    return ext.toLowerCase() === '.png' || ext.toLowerCase() === '.jpg' || ext.toLowerCase() === '.jpeg' || ext.toLowerCase() === ".avif";
}

// Set up storage for uploaded files for Category Images
const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        const folderPath = "H:\\Intership Projects - Silver Touch\\Assignment 1 - Project\\Frontend\\fit_and_fly\\public\\Categories"

        fs.mkdir(folderPath, (err) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    console.log('The folder already exists.');
                } else {
                    console.error(`Error creating the folder: ${err}`);
                }
            } else {
                console.log('Folder created successfully.');
            }
        });

        cb(null, folderPath + '\\');

    },
    filename: (req, file, cb) => {

        cb(null, "CAT - " + req.body.categoryName + "." + file.originalname.split(".")[1]);

    }
});

// Set up storage for uploaded files for Attendance
const itemStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        const folderPath = "H:\\Intership Projects - Silver Touch\\Assignment 1 - Project\\Frontend\\fit_and_fly\\public\\Items"

        fs.mkdir(folderPath, (err) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    console.log('The folder already exists.');
                } else {
                    console.error(`Error creating the folder: ${err}`);
                }
            } else {
                console.log('Folder created successfully.');
            }
        });

        cb(null, folderPath + '\\');

    },
    filename: (req, file, cb) => {

        cb(null, req.body.itemCode + "_" + req.body.itemName + "." + file.originalname.split(".")[1]);

    }
});

// Create the multer instance for Attendance
const itemUpload = multer({ storage: itemStorage });

// Create the multer instance for Attendance
const categoryUpload = multer({ storage: categoryStorage });


// =======================================================================================================================================================
// ----- ADMIN ROUTES ---------- ADMIN ROUTES ---------- ADMIN ROUTES ---------- ADMIN ROUTES ---------- ADMIN ROUTES ---------- ADMIN ROUTES ---------- 
// =======================================================================================================================================================

// For Adding Admin - POST Request
// Full Route : /api/admin/add/admin
router.post('/add/admin', [

    body("gender", "Your Gender is Required").exists(),
    body("phone", "Your Phone is Required").exists(),
    body("name", "Your Name is Required").exists(),
    body("password", "Your Password is Required").exists(),
    body("email", "Your Email is Required").exists(),
    body("address", "Your Address is Required").exists(),
    body("adminId", "Your AdminId is Required").exists(),

    // Checking other paramaters
    body("phone", "Phone Number should of 10 digits").isLength({ min: 10, max: 10 }),
    body("email", "Email ID is Invalid").isEmail(),
    body("date", "Your Date is Required").isEmpty()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Admin Record has NOT Added Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Admin Not Added Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { gender, phone, name, password, email, date, address, adminId } = req.body;

        let role = "Admin";

        let newDate = new Date(date).toLocaleString();

        // Create a new admin document
        const admin = new Admin({
            role,
            gender,
            phone,
            name,
            password,
            email,
            newDate,
            address,
            adminId,
        });

        // Save the admin document to the database
        // If saved successfully
        if (await admin.save()) {

            // Setting up the parameters
            status = "success";
            msg = "Admin Record has been Added Successfully"

            // Printing all the admin 
            console.log(admin)
        }

        return res.json({ status: status, msg: msg, admin: admin });
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ error: 'Record Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Fetching Admin - GET Request
// Full Route : /api/admin/fetch/admin/:id
router.get('/fetch/admin/:id', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Admin Record has NOT Fetched Successfully";

    try {
        // Finding all the Admin 
        const admin = await Admin.find({ _id: req.params.id });

        if (admin.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Admin Record has been Fetched Successfully"

            // Printing the admin
            console.log(admin)
        }

        return res.json({ status: status, msg: msg, admin: admin });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Admin - GET Request
// Full Route : /api/admin/fetch/admin/adminid/:adminid
router.get('/fetch/admin/adminid/:adminid', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Admin Record has NOT Fetched Successfully";

    try {
        // Finding all the Admin 
        const admin = await Admin.find({ adminId: req.params.adminid });

        if (admin.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Admin Record has been Fetched Successfully"

            // Printing the admin
            console.log(admin)
        }

        return res.json({ status: status, msg: msg, admin: admin });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Admin - GET Request
// Full Route : /api/admin/fetch/alladmin
router.get('/fetch/alladmin', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Admin Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("admins");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allAdmin = await cursor.toArray();

        if (allAdmin.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Admin Record has been Fetched Successfully"

            // Finding all the Admin 
            console.log(allAdmin)
        }

        return res.json({ status: status, msg: msg, admins: allAdmin });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Deleting Admin - DEL Request
// Full Route : /api/admin/delete/admin/:id
router.delete('/delete/admin/:id', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Admin Record Not Found";

    try {

        // Finding the admin from the database, whether the admin exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const admin = await Admin.findById(req.params.id);

        // If that Admin doesn't exists, then returning the Bad Response
        if (!admin) {

            // Setting up the parameters
            status = "failed";
            msg = "Admin Record Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Admin Record Not Found !" })
        }

        const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Admin Record has been Deleted Successfully"

        return res.json({ status: status, msg: msg, admin: deletedAdmin });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Admin Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Updating Admin - PUT Request
// Full Route : /api/admin/update/admin/:id
router.put('/update/admin/:id', [

    body("gender", "Your Gender is Required").exists(),
    body("phone", "Your Phone is Required").exists(),
    body("name", "Your Name is Required").exists(),
    body("password", "Your Password is Required").exists(),
    body("email", "Your Email is Required").exists(),
    body("address", "Your Address is Required").exists(),

    // Checking other paramaters
    body("phone", "Phone Number should of 10 digits").isLength({ min: 10, max: 10 }),
    body("email", "Email ID is Invalid").isEmail(),
    body("date", "Your Date is Required").isEmpty()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Admin Record Not Updated Successfully";

    try {
        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Admin Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }
        else if (req.body.adminId) {
            // Setting up the parameters
            status = "failed";
            msg = "Admin Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: "Admin ID cannot be Updated !" });
        }

        // If no errors are present or found
        const { gender, phone, name, password, email, date, address } = req.body;

        // Create a newAdmin Object with the new Updated Data 
        const newAdmin = {
            gender,
            phone,
            name,
            password,
            email,
            date,
            address
        }

        // Finding the admin from the database, whether the admin exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const admin = await Admin.findById(req.params.id);

        // If that admin doesn't exists, then returning the Bad Response
        if (!admin) {

            // Setting up the parameters
            status = "failed";
            msg = "Admin Record Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Admin Record Not Found !" });
        }

        // If code is reached here, that's means the admin is belong to the user which is logged in and also that admin exists
        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, { $set: newAdmin }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Admin Record Updated Successfully"
        return res.json({ status: status, msg: msg, updatedAdmin });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Admin Record Not Updated Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})


// =======================================================================================================================================================
// ----- CUSTOMER ROUTES ---------- CUSTOMER ROUTES ---------- CUSTOMER ROUTES ---------- CUSTOMER ROUTES ---------- CUSTOMER ROUTES ---------- CUSTOMER R
// =======================================================================================================================================================

// For Adding Customer - POST Request
// Full Route : /api/admin/add/customer
router.post('/add/customer', [

    body("gender", "Your Gender is Required").exists(),
    body("phone", "Your Phone is Required").exists(),
    body("name", "Your Name is Required").exists(),
    body("password", "Your Password is Required").exists(),
    body("email", "Your Email is Required").exists(),
    body("address", "Your Address is Required").exists(),
    body("account_balance", "Your Account Balance is Required").exists(),

    // Checking other paramaters
    body("phone", "Phone Number should of 10 digits").isLength({ min: 10, max: 10 }),
    body("email", "Email ID is Invalid").isEmail(),
    body("date", "Your Date is Required").isEmpty()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Customer Record has NOT Added Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Customer Not Added Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { gender, phone, name, password, email, date, address, account_balance } = req.body;

        let role = "Customer";

        let newDate = new Date(date).toLocaleString();

        // Create a new customer document
        const customer = new Customer({
            role,
            gender,
            phone,
            name,
            password,
            email,
            newDate,
            address,
            account_balance,
        });

        // Save the customer document to the database
        // If saved successfully
        if (await customer.save()) {

            // Setting up the parameters
            status = "success";
            msg = "Customer Record has been Added Successfully"

            // Printing all the customer 
            console.log(customer)
        }

        return res.json({ status: status, msg: msg, customer: customer });
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ error: 'Record Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Fetching Customer - GET Request
// Full Route : /api/admin/fetch/customer/:id
router.get('/fetch/customer/:id', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Customer Record has NOT Fetched Successfully";

    try {
        // Finding all the Customer 
        const customer = await Customer.find({ _id: req.params.id });

        if (customer.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Customer Record has been Fetched Successfully"

            // Printing the customer
            console.log(customer)
        }

        return res.json({ status: status, msg: msg, customer: customer });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Customer - GET Request
// Full Route : /api/admin/fetch/allcustomer
router.get('/fetch/allcustomer', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Customer Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("customers");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allCustomer = await cursor.toArray();

        if (allCustomer.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Customer Record has been Fetched Successfully"

            // Finding all the Customer 
            console.log(allCustomer)
        }

        return res.json({ status: status, msg: msg, customers: allCustomer });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Deleting Customer - DEL Request
// Full Route : /api/admin/delete/customer/:id
router.delete('/delete/customer/:id', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Customer Record Not Found";

    try {

        // Finding the customer from the database, whether the customer exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const customer = await Customer.findById(req.params.id);

        // If that Customer doesn't exists, then returning the Bad Response
        if (!customer) {

            // Setting up the parameters
            status = "failed";
            msg = "Customer Record Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Customer Record Not Found !" })
        }

        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Customer Record has been Deleted Successfully"

        return res.json({ status: status, msg: msg, customer: deletedCustomer });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Customer Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Updating Customer - PUT Request
// Full Route : /api/admin/update/customer/:id
router.put('/update/customer/:id', [

    body("gender", "Your Gender is Required").exists(),
    body("phone", "Your Phone is Required").exists(),
    body("name", "Your Name is Required").exists(),
    body("password", "Your Password is Required").exists(),
    body("email", "Your Email is Required").exists(),
    body("address", "Your Address is Required").exists(),
    body("account_balance", "Your Account Balance is Required").exists(),
    body("totalOrders", "Your Total Orders is Required").exists(),

    // Checking other paramaters
    body("phone", "Phone Number should of 10 digits").isLength({ min: 10, max: 10 }),
    body("email", "Email ID is Invalid").isEmail(),
    body("date", "Your Date is Required").isEmpty()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Customer Record Not Updated Successfully";

    try {
        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Customer Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }
        else if (req.body.customerId) {
            // Setting up the parameters
            status = "failed";
            msg = "Customer Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: "Customer ID cannot be Updated !" });
        }

        // If no errors are present or found
        const { gender, phone, name, password, email, date, address, account_balance, totalOrders } = req.body;

        // Create a newCustomer Object with the new Updated Data 
        const newCustomer = {
            gender,
            phone,
            name,
            password,
            email,
            date,
            address,
            account_balance,
            totalOrders
        }

        // Finding the customer from the database, whether the customer exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const customer = await Customer.findById(req.params.id);

        // If that customer doesn't exists, then returning the Bad Response
        if (!customer) {

            // Setting up the parameters
            status = "failed";
            msg = "Customer Record Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Customer Record Not Found !" });
        }

        // If code is reached here, that's means the customer is belong to the user which is logged in and also that customer exists
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, { $set: newCustomer }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Customer Record Updated Successfully"
        return res.json({ status: status, msg: msg, updatedCustomer });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Customer Record Not Updated Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// =======================================================================================================================================================
// ----- EMPLOYEE ROUTES ---------- EMPLOYEE ROUTES ---------- EMPLOYEE ROUTES ---------- EMPLOYEE ROUTES ---------- EMPLOYEE ROUTES ---------- EMPLOYEE R
// =======================================================================================================================================================

// For Adding Employee - POST Request
// Full Route : /api/admin/add/employee
router.post('/add/employee', [

    body("gender", "Your Gender is Required").exists(),
    body("phone", "Your Phone is Required").exists(),
    body("name", "Your Name is Required").exists(),
    body("password", "Your Password is Required").exists(),
    body("email", "Your Email is Required").exists(),
    body("address", "Your Address is Required").exists(),
    body("employeeId", "Your EmployeeId is Required").exists(),
    body("designation", "Your Designation is Required").exists(),

    // Checking other paramaters
    body("phone", "Phone Number should of 10 digits").isLength({ min: 10, max: 10 }),
    body("email", "Email ID is Invalid").isEmail(),
    body("date", "Your Date is Required").isEmpty()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Employee Record has NOT Added Successfully";

    try {

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Employee Not Added Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no Errors are found !!
        const { gender, phone, name, password, email, date, address, employeeId, designation } = req.body;

        let role = "Employee";

        let newDate = new Date(date).toLocaleString();

        // Create a new employee document
        const employee = new Employee({
            role,
            gender,
            phone,
            name,
            password,
            email,
            newDate,
            address,
            employeeId,
            designation
        });

        // Save the employee document to the database
        // If saved successfully
        if (await employee.save()) {

            // Setting up the parameters
            status = "success";
            msg = "Employee Record has been Added Successfully"

            // Printing all the employee 
            console.log(employee)
        }

        return res.json({ status: status, msg: msg, employee: employee });
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ error: 'Record Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Fetching Employee - GET Request
// Full Route : /api/admin/fetch/employee/:id
router.get('/fetch/employee/:id', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Employee Record has NOT Fetched Successfully";

    try {
        // Finding all the Employee 
        const employee = await Employee.find({ _id: req.params.id });

        if (employee.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Employee Record has been Fetched Successfully"

            // Printing the employee
            console.log(employee)
        }

        return res.json({ status: status, msg: msg, employee: employee });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Employee - GET Request
// Full Route : /api/admin/fetch/employee/employeeid/:employeeid
router.get('/fetch/employee/employeeid/:employeeid', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Employee Record has NOT Fetched Successfully";

    try {
        // Finding all the Employee 
        const employee = await Employee.find({ employeeId: req.params.employeeid });

        if (employee.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Employee Record has been Fetched Successfully"

            // Printing the employee
            console.log(employee)
        }

        return res.json({ status: status, msg: msg, employee: employee });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Employee - GET Request
// Full Route : /api/admin/fetch/allemployee
router.get('/fetch/allemployee', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Employee Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("employees");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allEmployee = await cursor.toArray();

        if (allEmployee.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Employee Record has been Fetched Successfully"

            // Finding all the Employee 
            console.log(allEmployee)
        }

        return res.json({ status: status, msg: msg, employees: allEmployee });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Deleting Employee - DEL Request
// Full Route : /api/admin/delete/employee/:id
router.delete('/delete/employee/:id', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Employee Record Not Found";

    try {

        // Finding the employee from the database, whether the employee exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const employee = await Employee.findById(req.params.id);

        // If that Employee doesn't exists, then returning the Bad Response
        if (!employee) {

            // Setting up the parameters
            status = "failed";
            msg = "Employee Record Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Employee Record Not Found !" })
        }

        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Employee Record has been Deleted Successfully"

        return res.json({ status: status, msg: msg, employee: deletedEmployee });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Employee Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Updating Employee - PUT Request
// Full Route : /api/admin/update/employee/:id
router.put('/update/employee/:id', [

    body("gender", "Your Gender is Required").exists(),
    body("phone", "Your Phone is Required").exists(),
    body("name", "Your Name is Required").exists(),
    body("password", "Your Password is Required").exists(),
    body("email", "Your Email is Required").exists(),
    body("address", "Your Address is Required").exists(),
    body("designation", "Your Designation is Required").exists(),

    // Checking other paramaters
    body("phone", "Phone Number should of 10 digits").isLength({ min: 10, max: 10 }),
    body("email", "Email ID is Invalid").isEmail(),
    body("date", "Your Date is Required").isEmpty()
], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Employee Record Not Updated Successfully";

    try {
        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Employee Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }
        else if (req.body.employeeId) {
            // Setting up the parameters
            status = "failed";
            msg = "Employee Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: "Employee ID cannot be Updated !" });
        }

        // If no errors are present or found
        const { gender, phone, name, password, email, date, address, designation } = req.body;

        // Create a newEmployee Object with the new Updated Data 
        const newEmployee = {
            gender,
            phone,
            name,
            password,
            email,
            date,
            address,
            designation
        }

        // Finding the employee from the database, whether the employee exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const employee = await Employee.findById(req.params.id);

        // If that employee doesn't exists, then returning the Bad Response
        if (!employee) {

            // Setting up the parameters
            status = "failed";
            msg = "Employee Record Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Employee Record Not Found !" });
        }

        // If code is reached here, that's means the employee is belong to the user which is logged in and also that employee exists
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, { $set: newEmployee }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Employee Record Updated Successfully"
        return res.json({ status: status, msg: msg, updatedEmployee });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Employee Record Not Updated Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// =====================================================================================================================================================
// ----- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ---------- CARTS ROUTES ----------
// =====================================================================================================================================================

// For Fetching Carts Items - GET Request
// Full Route : /api/admin/fetch/allcartitems
router.get('/fetch/allcartitems', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Cart Items Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.carts?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("carts");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allCartItems = await cursor.toArray();

        if (allCartItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Cart Items Record has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allCartItems)
        }

        return res.json({ status: status, msg: msg, cartItems: allCartItems });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ---------- ORDERS ROUTES ------
// =======================================================================================================================================================

// For Fetching Orders - GET Request
// Full Route : /api/admin/fetch/allorders
router.get('/fetch/allorders', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Orders Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.orders?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("orders");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allOrders = await cursor.toArray();

        if (allOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allOrders)
        }

        return res.json({ status: status, msg: msg, orders: allOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Approved Orders - GET Request
// Full Route : /api/admin/fetch/approvedorders
router.get('/fetch/approvedorders', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Approved Orders Found !";

    try {

        // Finding all the Item
        const allApprovedOrders = await Orders.find({ orderStatus: "Approved" });

        if (allApprovedOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Approved Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allApprovedOrders)
        }

        return res.json({ status: status, msg: msg, orders: allApprovedOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Unapproved Orders - GET Request
// Full Route : /api/admin/fetch/unapprovedorders
router.get('/fetch/unapprovedorders', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Unapproved Orders Found !";

    try {

        // Finding all the Item
        const allUnapprovedOrders = await Orders.find({ orderStatus: "Approval Remaining" });

        if (allUnapprovedOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Approved Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allUnapprovedOrders)
        }

        return res.json({ status: status, msg: msg, orders: allUnapprovedOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Orders - GET Request
// Full Route : /api/admin/fetch/allorders
router.get('/fetch/alldeletedorders', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Orders Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.orders?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("deletedorders");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allOrders = await cursor.toArray();

        if (allOrders.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Orders has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allOrders)
        }

        return res.json({ status: status, msg: msg, deletedOrders: allOrders });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Approving an Order - PUT Request
// Full Route : /api/admin/approve/order/:orderid
router.put('/approve/order/:orderid', fetchUser, [

    body("arrivalTime", "Your Arrival Time is Required").exists()

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Order NOT Approved Successfully !";

    try {

        const userData = await Admin.findById(req.user.id)
        let approveDate = new Date();

        // Finding the Order with that id
        const orderToApprove = await Orders.findById(req.params.orderid);
        console.log(orderToApprove)

        const customerData = await Customer.findById(orderToApprove.user)

        if (orderToApprove.orderStatus === "Approval Remaining") {

            const approvedOrder = await Orders.findByIdAndUpdate(req.params.orderid, { $set: { orderStatus: "Approved", orderApproveDate: approveDate.toLocaleString(), orderApprovedBy: "Admin", orderApproverName: userData.name, orderArrivalTime: req.body.arrivalTime } }, { new: true });

            if (approvedOrder) {

                // Setting up the parameters
                status = "success";
                msg = "Order has been Approved Successfully"

                const orderUserEmail = customerData.email;
                const orderSubjectData = "Fit&Fly - Order : " + approvedOrder.orderID + " Approved !";
                const orderBodyData = `
                <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid #ddd">
                    <center>
                        <img src="cid:fit&flylogo2023" width="50%"><br>
                        <hr color="black" size="3px">
                    </center>
                
                    <p>Hello ${customerData.name} !</p>
                    <p>This Email is to notify that your order that you have placed from your Account is approved and you will receive the order within ${approvedOrder.orderArrivalTime} Days.</p>
                    <p>Orders Details : </p>
                    <p>
                    <table border="2" width="50%">
                        <tr align="left">
                            <th>Order ID</th>
                            <td>${approvedOrder.orderID}</td>
                        </tr>
                        <tr align="left">
                            <th>Order From</th>
                            <td>${approvedOrder.orderFrom}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Price</th>
                            <td>Rs ${approvedOrder.orderPrice}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Date</th>
                            <td>${approvedOrder.orderDate.toLocaleString()}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Status</th>
                            <td>${approvedOrder.orderStatus}</td>
                        </tr>
                        <tr align="left">
                            <th>Your Account Balance</th>
                            <td>${customerData.account_balance}</td>
                        </tr>
                
                    </table>
                    </p>
                    <br><br><br><br>
                    <hr>
                    <p><small>This is a auto-generated message.</small></p>
                </div>
                `
                const sentApprovedOrderMail = await sendMailFromAccount(orderUserEmail, orderSubjectData, orderBodyData)

                if (sentApprovedOrderMail) {
                    console.log("Approval Mail Sent !")
                }
                else {
                    console.log("Approval Mail Not Sent !")
                }

                return res.json({ status: status, msg: msg, orders: approvedOrder });

            }
        }
        else if (orderToApprove.orderStatus === "Approved") {
            // Setting up the parameters
            status = "success";
            msg = "Order has already Approved"
        }

        return res.json({ status: status, msg: msg });

    } catch (error) {
        console.log(error)

        if (error.path === "_id") {
            // Setting up the parameters
            status = "failed";
            msg = "Order with this Order ID not Found"
            res.status(500).json({ status: status, msg: msg });
        }
        else {
            console.log("Error Occured !")
            console.error("Error : ", error.message)
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
});

// For Disapproving an Order - PUT Request
// Full Route : /api/admin/disapprove/order/:orderid
router.put('/disapprove/order/:orderid', fetchUser, async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Order NOT Disapproved Successfully !";

    try {

        const userData = await Admin.findById(req.user.id)

        // Finding the Order with that id
        const orderToDisapprove = await Orders.findById(req.params.orderid);

        const customerData = await Customer.findById(orderToDisapprove.user)

        if (orderToDisapprove.orderStatus === "Approved") {

            const disapprovedOrder = await Orders.findByIdAndUpdate(req.params.orderid, { $set: { orderStatus: "Disapproved", orderApproveDate: null, orderArrivalTime: 0, orderApprovedBy: "None", orderApproverName: "", orderDisapprovedBy: "Admin", orderDisapproverName: userData.name } }, { new: true });

            if (disapprovedOrder) {

                // Setting up the parameters
                status = "success";
                msg = "Order has been Disapproved Successfully"

                const orderUserEmail = customerData.email;
                const orderSubjectData = "Fit&Fly - Order : " + disapprovedOrder.orderID + " Disapproved !";
                const orderBodyData = `
                <div style="margin:0;padding:25px;background-color:#eef5f4;border:1px solid #ddd">
                    <center>
                        <img src="cid:fit&flylogo2023" width="50%"><br>
                        <hr color="black" size="3px">
                    </center>
                
                    <p>Hello ${customerData.name} !</p>
                    <p>This Email is to notify that your order that you have placed from your Account is disapproved by the Company due to some issues. Soon your order will be approved again !</p>
                    <p>Orders Details : </p>
                    <p>
                    <table border="2" width="50%">
                        <tr align="left">
                            <th>Order ID</th>
                            <td>${disapprovedOrder.orderID}</td>
                        </tr>
                        <tr align="left">
                            <th>Order From</th>
                            <td>${disapprovedOrder.orderFrom}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Price</th>
                            <td>Rs ${disapprovedOrder.orderPrice}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Date</th>
                            <td>${disapprovedOrder.orderDate.toLocaleString()}</td>
                        </tr>
                        <tr align="left">
                            <th>Order Status</th>
                            <td>${disapprovedOrder.orderStatus}</td>
                        </tr>
                        <tr align="left">
                            <th>Your Account Balance</th>
                            <td>${customerData.account_balance}</td>
                        </tr>
                
                    </table>
                    </p>
                    <br><br><br><br>
                    <hr>
                    <p><small>This is a auto-generated message.</small></p>
                </div>
                `
                const sentDisapprovedOrderMail = await sendMailFromAccount(orderUserEmail, orderSubjectData, orderBodyData)

                if (sentDisapprovedOrderMail) {
                    console.log("Disapproval Mail Sent !")
                }
                else {
                    console.log("Disapproval Mail Not Sent !")
                }

                return res.json({ status: status, msg: msg, orders: disapprovedOrder });

            }
        }
        else if (orderToDisapprove.orderStatus === "Approval Remaining") {
            // Setting up the parameters
            status = "success";
            msg = "Order has Already Disapproved Successfully !"
        }

        return res.json({ status: status, msg: msg });

    } catch (error) {
        console.log(error)

        if (error.path === "_id") {
            // Setting up the parameters
            status = "failed";
            msg = "Order with this Order ID not Found"
            res.status(500).json({ status: status, msg: msg });
        }
        else {
            console.log("Error Occured !")
            console.error("Error : ", error.message)
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
});

// =======================================================================================================================================================
// ----- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST ROUTES ---------- WISHLIST R
// =======================================================================================================================================================

// For Fetching Wishlist - GET Request
// Full Route : /api/admin/fetch/allwishlists
router.get('/fetch/allwishlists', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Wishlist Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.wishlist?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("wishlist");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allWishlist = await cursor.toArray();

        if (allWishlist.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Wishlist has been Fetched Successfully"

            // Finding all the CartItems 
            console.log(allWishlist)
        }

        return res.json({ status: status, msg: msg, orders: allWishlist });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// =======================================================================================================================================================
// ----- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- ITEMS ROUTES ---------- I
// =======================================================================================================================================================

// For Adding Item - POST Request
// Full Route : /api/admin/add/item
router.post('/add/item', itemUpload.single('file'), [

    body("itemName", "Your Item Name is Required").exists(),
    body("itemPrice", "Your Item Price is Required").exists(),
    body("itemType", "Your Item Type is Required").exists(),
    body("itemCategory", "Your Item Category is Required").exists(),
    body("itemCode", "Your Item Code Balance is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item has NOT Added Successfully";

    try {

        let validImageFile = false;
        let fileuploadName;

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Not Added Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        if (req.file) {
            // Check if the File type is for an Image file
            if (isImageFile(req.file.filename.toString().toLowerCase())) {
                validImageFile = true
                fileuploadName = req.body.itemCode + "_" + req.body.itemName + "." + req.file.originalname.split(".")[1];
            } else {
                validImageFile = false
                status = "failed";
                msg = "File is in NOT Valid Format !"
                return res.json({ status: status, msg: msg });
            }

            if (validImageFile) {

                // If no Errors are found !!
                const { itemName, itemDate, itemPrice, itemType, itemCategory, itemImages, itemCode } = req.body;

                let newItemDate = new Date(itemDate).toLocaleString();
                let itemAddedBy = "Admin";

                // Create a new item document
                const item = new Items({
                    itemName,
                    newItemDate,
                    itemPrice,
                    itemType,
                    itemCategory,
                    itemImages: fileuploadName,
                    itemAddedBy,
                    itemCode,
                });

                // Save the item document to the database
                // If saved successfully
                if (await item.save()) {

                    // Setting up the parameters
                    status = "success";
                    msg = "Item Record has been Added Successfully"

                    // Printing all the item 
                    console.log(item)
                }

                return res.json({ status: status, msg: msg, item: item });
            }
            return res.json({ status: status, msg: msg });
        }
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ status: status, msg: 'Item with this Item Code Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Fetching Item - GET Request
// Full Route : /api/admin/fetch/item/:id
router.get('/fetch/item/:id', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items Record has NOT Fetched Successfully";

    try {
        // Finding all the Items 
        const item = await Items.find({ _id: req.params.id });

        if (item.length !== 0) {

            const updateItemViews = await Items.findByIdAndUpdate(req.params.id, { $set: { itemViews: item[0].itemViews + 1 } }, { new: true });

            if (updateItemViews.length) {
                console.log("Views Updated Successfully !!")
            }
            else {
                console.log("Views Updation Failed !!")
            }

            // Setting up the parameters
            status = "success";
            msg = "Items Record has been Fetched Successfully"

            // Printing the item
            console.log(item)

            // Code to check that we get the date in the normal string format or not ?
            // const datecheck = new Date(item[0].itemDate).toLocaleString()
            // console.log("Date : ",item[0].itemDate)
            // console.log("Date : ",datecheck)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Item - GET Request
// Full Route : /api/admin/fetch/item/itemcode/:itemcode
router.get('/fetch/item/itemcode/:itemcode', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items with this Item Code NOT Exists";

    try {
        // Finding all the Item
        const item = await Items.find({ itemCode: req.params.itemcode });

        if (item.length !== 0) {

            const updateItemViews = await Items.findByIdAndUpdate(req.params.id, { $set: { itemViews: item[0].itemViews + 1 } }, { new: true });

            if (updateItemViews.length) {
                console.log("Views Updated Successfully !!")
            }
            else {
                console.log("Views Updation Failed !!")
            }

            // Setting up the parameters
            status = "success";
            msg = "Items Record has been Fetched Successfully"

            // Printing the item
            console.log(item)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Items - GET Request
// Full Route : /api/admin/fetch/allitem
router.get('/fetch/allitems', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Items Records Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.items?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("items");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allItems = await cursor.toArray();

        if (allItems.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Items Record has been Fetched Successfully"

            // Finding all the Items 
            console.log(allItems)
        }

        return res.json({ status: status, msg: msg, items: allItems });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Item - GET Request
// Full Route : /api/admin/fetch/item/category/:category
router.get('/fetch/item/category/:category', async (req, res) => {
    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Items with this Category NOT Found !";

    try {
        // Finding all the Item
        const item = await Items.find({ itemCategory: req.params.category });

        if (item.length !== 0) {
            // Setting up the parameters
            status = "success";
            msg = "Items in Category has been Fetched Successfully"

            // Printing the item
            console.log(item)
        }

        return res.json({ status: status, msg: msg, item: item });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Deleting Item - DEL Request
// Full Route : /api/admin/delete/item/:id
router.delete('/delete/item/:id', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item Record Not Found";

    try {

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const item = await Items.findById(req.params.id);

        // If that Item doesn't exists, then returning the Bad Response
        if (!item) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Item Record Not Found !" })
        }

        const deletedItem = await Items.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Item Record has been Deleted Successfully"

        return res.json({ status: status, msg: msg, item: deletedItem });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Item Record Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Updating Item - PUT Request
// Full Route : /api/admin/update/item/:id
router.put('/update/item/:id', itemUpload.single('file'), [

    body("itemName", "Your Item Name is Required").exists(),
    body("itemPrice", "Your Item Price is Required").exists(),
    body("itemType", "Your Item Type is Required").exists(),
    body("itemCategory", "Your Item Category is Required").exists(),
    body("itemCode", "Your Item Code Balance is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Item Record Not Updated Successfully";

    try {
        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // If no errors are present or found
        const { itemName, itemPrice, itemType, itemCategory, itemImages, itemCode } = req.body;

        let itemLastUpdateBy = "Admin";

        // Create a newItem Object with the new Updated Data 
        const newItem = {
            itemName,
            itemPrice,
            itemType,
            itemCategory,
            itemImages,
            itemCode,
            itemLastUpdateBy
        }

        // Finding the item from the database, whether the item exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const item = await Items.findById(req.params.id);

        // If that item doesn't exists, then returning the Bad Response
        if (!item) {

            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Item Record Not Found !" });
        }

        // If code is reached here, that's means the item is belong to the user which is logged in and also that item exists
        const updatedItem = await Items.findByIdAndUpdate(req.params.id, { $set: newItem }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Item Record Updated Successfully"
        return res.json({ status: status, msg: msg, updatedItem });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        if (error.code === 11000) {
            // Setting up the parameters
            status = "failed";
            msg = "Item with this Item Code Already Exists"
            return res.json({ status: status, msg: msg });
        }
        else {
            // Setting up the parameters
            status = "failed";
            msg = "Item Record Not Updated Successfully"
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
})

// =======================================================================================================================================================
// ----- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY ROUTES ---------- CATEGORY R
// =======================================================================================================================================================

// For Adding Item - POST Request
// Full Route : /api/admin/add/category
router.post('/add/category', categoryUpload.single('file'), [

    body("categoryName", "Your Category Name is Required").exists(),
    body("categoryAdderName", "Your Category Adder Name is Required").exists(),
    body("categoryAddedBy", "Your Category Added By is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Category has NOT Added Successfully";

    try {

        let validImageFile = false;
        let fileuploadName;

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Catgeory Not Added Successfully !"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        if (req.file) {

            // Check if the File type is for an Image file
            if (isImageFile(req.file.filename.toString().toLowerCase())) {
                validImageFile = true
                fileuploadName = "CAT - " + req.body.categoryName.toString() + "." + req.file.originalname.split(".")[1];
            } else {
                validImageFile = false
                status = "failed";
                msg = "File is in NOT Valid Format !"
                return res.json({ status: status, msg: msg });
            }

            if (validImageFile) {

                // If no Errors are found !!
                const { categoryName, categoryAdderName, categoryAddedBy } = req.body;

                let addedBy = categoryAddedBy;

                // Create a new category document
                const category = new Categories({
                    categoryName,
                    categoryImageLocation: fileuploadName,
                    categoryAdderName,
                    addedBy,
                });

                // Save the category document to the database
                // If saved successfully
                if (await category.save()) {

                    // Setting up the parameters
                    status = "success";
                    msg = "Category has been Added Successfully"

                    // Printing all the category 
                    console.log(category)
                }

                return res.json({ status: status, msg: msg, category: category });
            }
            return res.json({ status: status, msg: msg });

        }
    }
    catch (error) {

        if (error.code === 11000) {
            // Duplicate key error (e.g., unique index violation)
            console.error('Duplicate key error:', error.message);
            res.status(500).json({ status: status, msg: 'Category Already Exists !' });
        } else {
            // Handle other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal Server Error !' });
        }
    }
});

// For Fetching All Catgories - GET Request
// Full Route : /api/admin/fetch/allcategories
router.get('/fetch/allcategories', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Catgories Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.categories?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("categories");

        // Use the find method to retrieve all records
        const cursor = collection.find();

        // Convert the cursor to an array of documents
        const allCatgories = await cursor.toArray();

        if (allCatgories.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Catgories has been Fetched Successfully"

            // Finding all the Catgories 
            console.log(allCatgories)
        }

        return res.json({ status: status, msg: msg, categories: allCatgories });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Catgories - GET Request
// Full Route : /api/admin/fetch/allcategoriesnames
router.get('/fetch/allcategoriesnames', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Catgories Found !";

    try {

        // For Online Mongo Atlas
        /*
        const client = new MongoClient("mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly.categories?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        */

        // For Local Mongodb
        const client = new MongoClient("mongodb://127.0.0.1:27017/", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const databaseObject = client.db('fit&fly');
        const collection = databaseObject.collection("categories");

        const allCatgories = await collection.find({}, { projection: { categoryName: 1 } }).toArray();

        if (allCatgories.length !== 0) {

            const categoryNames = allCatgories.map(category => category.categoryName);

            console.log("Category Names:", categoryNames);

            // Setting up the parameters
            status = "success";
            msg = "All Catgories has been Fetched Successfully"

            // Finding all the Catgories 
            console.log(categoryNames)

            return res.json({ status: status, msg: msg, categories: categoryNames });

        }

        return res.json({ status: status, msg: msg });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Deleting Category - DEL Request
// Full Route : /api/admin/delete/category/:id
router.delete('/delete/category/:id', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Category Not Found";

    try {

        // Finding the category from the database, whether the category exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const category = await Categories.findById(req.params.id);

        // If that Category doesn't exists, then returning the Bad Response
        if (!category) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Not Found"

            return res.status(404).json({ status: status, msg: msg, error: "Category Not Found !" })
        }

        const deletedCategory = await Categories.findByIdAndDelete(req.params.id);

        // Setting up the parameters
        status = "success";
        msg = "Category has been Deleted Successfully"

        return res.json({ status: status, msg: msg, category: deletedCategory });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        // Setting up the parameters
        status = "failed";
        msg = "Category Not Deleted Successfully"

        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
})

// For Updating Category - PUT Request
// Full Route : /api/admin/update/category/:id
// router.put('/update/category/:id', categoryUpload.single('file'), [
router.put('/update/category/:id', categoryUpload.single('file'), [

    body("categoryName", "Your Category Name is Required").exists(),
    body("categoryAdderName", "Your Category Adder Name is Required").exists(),
    body("categoryAddedBy", "Your Category Added By is Required").exists(),

], async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "Category Not Updated Successfully";

    try {

        let validImageFile = false;
        let fileuploadName;

        // Getting the Results after validations
        const errors = validationResult(req);

        // If we have errors, sending bad request with errors
        if (!errors.isEmpty()) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Not Updated Successfully"

            // sending the errors that are present
            return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
        }

        // if (req.file) {

        //     // Check if the File type is for an Image file
        //     if (isImageFile(req.file.filename.toString().toLowerCase())) {
        //         validImageFile = true
        //         fileuploadName = "CAT - " + req.body.categoryName.toString() + "." + req.file.originalname.split(".")[1];
        //     } else {
        //         validImageFile = false
        //         status = "failed";
        //         msg = "File is in NOT Valid Format !"
        //         return res.json({ status: status, msg: msg });
        //     }
        // }

        // If no errors are present or found
        const { categoryName, categoryAdderName, categoryAddedBy } = req.body;

        let newCategory;

        // if (validImageFile) {
        //     // Create a newCategory Object with the new Updated Data 
        //     newCategory = {
        //         categoryName,
        //         categoryAdderName,
        //         categoryAddedBy,
        //         categoryImageLocation: fileuploadName,
        //     }
        // }
        // else {

        // Create a newCategory Object with the new Updated Data 
        newCategory = {
            categoryName,
            categoryAdderName,
            categoryAddedBy,
        }

        // }

        // Finding the category from the database, whether the category exists or not
        // To access the key from the url, we use req.params.<key>
        // Here, we access the id from the url, we use req.params.id
        const category = await Categories.findById(req.params.id);

        // If that category doesn't exists, then returning the Bad Response
        if (!category) {

            // Setting up the parameters
            status = "failed";
            msg = "Category Not Updated Successfully"

            return res.status(404).json({ status: status, msg: msg, error: "Category Not Found !" });
        }

        // If code is reached here, that's means the category is belong to the user which is logged in and also that category exists
        const updatedCategory = await Categories.findByIdAndUpdate(req.params.id, { $set: newCategory }, { new: true });
        // Setting up the parameters
        status = "success";
        msg = "Category Updated Successfully";
        return res.json({ status: status, msg: msg, updatedCategory });

    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)

        if (error.code === 11000) {
            // Setting up the parameters
            status = "failed";
            msg = "Category Already Exists"
            return res.json({ status: status, msg: msg });
        }
        else {
            // Setting up the parameters
            status = "failed";
            msg = "Category Not Updated Successfully"
            return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
        }
    }
})

// =======================================================================================================================================================
// ----- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES ---------- TRANSACTIONS ROUTES -
// =======================================================================================================================================================

// For Fetching Transaction which are cancelled !
// Full Route : /api/admin/fetch/transactions/cancelled
router.get('/fetch/transactions/cancelled', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Cancelled Transactions Found !";

    try {

        // Fetching all the transaction with transactionCancelled : true
        const allCancelledTransactions = await Transactions.find({ transactionCancelled: true });

        if (allCancelledTransactions.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Cancelled Transactions has been Fetched Successfully"

            // Finding all the Catgories 
            console.log(allCancelledTransactions)
        }

        return res.json({ status: status, msg: msg, transactions: allCancelledTransactions });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching Transaction which are NOT cancelled !
// Full Route : /api/admin/fetch/transactions/notcancelled
router.get('/fetch/transactions/noncancelled', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Non-Cancelled Transactions Found !";

    try {

        // Fetching all the transaction with transactionCancelled : true
        const allNonCancelledTransactions = await Transactions.find({ transactionCancelled: false });

        if (allNonCancelledTransactions.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Non-Cancelled Transactions has been Fetched Successfully"

            // Finding all the Non-Cancelled Transactions 
            console.log(allNonCancelledTransactions)
        }

        return res.json({ status: status, msg: msg, transactions: allNonCancelledTransactions });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

// For Fetching All Transaction 
// Full Route : /api/admin/fetch/alltransactions
router.get('/fetch/alltransactions', async (req, res) => {

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "No Transactions Found !";

    try {

        // Fetching all the transaction with transactionCancelled : true
        const allTransactions = await Transactions.find({});

        if (allTransactions.length !== 0) {

            // Setting up the parameters
            status = "success";
            msg = "All Transactions has been Fetched Successfully"

            // Finding all the Transactions 
            console.log(allTransactions)
        }

        return res.json({ status: status, msg: msg, transactions: allTransactions });

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }
});

module.exports = router;